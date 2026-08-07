/**
 * FactBounty Core Domain Engine
 * Enforces State Machine Rules, Authorization & Lifecycle Operations
 */
import { FactBountyStore } from '../db/store';
import {
  BountyRequest,
  EvidenceSubmission,
  PaymentTransaction,
  EvidenceCard,
  UserRole
} from '../shared/types';
import {
  transitionBountyState,
  transitionEvidenceState
} from '../shared/contracts/state-machines';
import { ChallengeCodeEngine } from '../capture/challenge-engine';

export class FactBountyEngine {
  public store: FactBountyStore;

  constructor(store?: FactBountyStore) {
    this.store = store || new FactBountyStore();
  }

  // ── Buyer Actions ──────────────────────────────────────────────────────────
  createBounty(
    buyerId: string,
    productUrl: string,
    question: string,
    checklistLabels: string[],
    bountyAmount: number, // in EUR cents (e.g., 500 = €5.00)
    productTitle?: string
  ): BountyRequest {
    if (bountyAmount < 300 || bountyAmount > 5000) {
      throw new Error('Bounty amount must be between €3.00 and €50.00');
    }
    if (!productUrl.startsWith('http://') && !productUrl.startsWith('https://')) {
      throw new Error('Valid HTTP/HTTPS product URL required');
    }

    const id = `idea-061_req_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();

    const bounty: BountyRequest = {
      id,
      buyerId,
      productUrl,
      productTitle: productTitle || 'Physical Product',
      question,
      checklist: checklistLabels.map((lbl, idx) => ({
        id: `chk_${idx + 1}`,
        label: lbl,
        required: true,
        fulfilled: false
      })),
      bountyAmount,
      currency: 'EUR',
      state: 'draft',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt
    };

    bounty.state = transitionBountyState(bounty.state, 'awaiting_payment');
    this.store.bounties.set(id, bounty);
    this.store.save();
    return bounty;
  }

  fundBounty(bountyId: string, paymentId: string): BountyRequest {
    const bounty = this.store.bounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty ${bountyId} not found`);

    bounty.state = transitionBountyState(bounty.state, 'funded');
    bounty.paymentId = paymentId;
    bounty.state = transitionBountyState(bounty.state, 'matching');
    bounty.updatedAt = new Date().toISOString();

    this.store.bounties.set(bountyId, bounty);
    this.store.save();
    return bounty;
  }

  // ── Responder Actions ──────────────────────────────────────────────────────
  assignResponder(bountyId: string, responderId: string): { bounty: BountyRequest; challengeCode: string } {
    const bounty = this.store.bounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty ${bountyId} not found`);

    bounty.state = transitionBountyState(bounty.state, 'assigned');
    bounty.responderId = responderId;
    bounty.updatedAt = new Date().toISOString();

    const challenge = ChallengeCodeEngine.generateChallenge(bountyId, responderId);

    this.store.bounties.set(bountyId, bounty);
    this.store.save();
    return { bounty, challengeCode: challenge.code };
  }

  submitEvidence(
    bountyId: string,
    responderId: string,
    mediaUrl: string,
    challengeCode: string,
    checklistFulfilledIds: string[],
    reusableConsent: boolean = true
  ): EvidenceSubmission {
    const bounty = this.store.bounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty ${bountyId} not found`);
    if (bounty.responderId !== responderId) throw new Error('Unauthorized responder');

    bounty.state = transitionBountyState(bounty.state, 'capture_in_progress');
    bounty.state = transitionBountyState(bounty.state, 'submitted');

    const updatedChecklist = bounty.checklist.map(item => ({
      ...item,
      fulfilled: checklistFulfilledIds.includes(item.id)
    }));

    const evidenceId = `ev_${Math.random().toString(36).substring(2, 10)}`;
    const submission: EvidenceSubmission = {
      id: evidenceId,
      bountyId,
      responderId,
      state: 'ready_for_review',
      mediaUrl,
      challengeCode,
      checklistResults: updatedChecklist,
      metadata: {
        durationSeconds: 45,
        mimeType: 'video/webm',
        fileSizeBytes: 8500000,
        challengeVerified: true,
        recordedAt: new Date().toISOString(),
        locationScrubbed: true
      },
      submittedAt: new Date().toISOString(),
      reusableConsent
    };

    bounty.state = transitionBountyState(bounty.state, 'under_review');
    this.store.evidence.set(evidenceId, submission);
    this.store.bounties.set(bountyId, bounty);
    this.store.save();
    return submission;
  }

  // ── Moderator Actions ──────────────────────────────────────────────────────
  reviewSubmission(
    evidenceId: string,
    moderatorId: string,
    decision: 'approve' | 'request_correction' | 'reject',
    notes?: string
  ): { bounty: BountyRequest; evidence: EvidenceSubmission; card?: EvidenceCard } {
    const evidence = this.store.evidence.get(evidenceId);
    if (!evidence) throw new Error(`Evidence ${evidenceId} not found`);

    const bounty = this.store.bounties.get(evidence.bountyId);
    if (!bounty) throw new Error(`Bounty ${evidence.bountyId} not found`);

    evidence.reviewerId = moderatorId;
    evidence.reviewedAt = new Date().toISOString();
    evidence.moderatorNotes = notes;

    if (decision === 'approve') {
      evidence.state = transitionEvidenceState(evidence.state, 'accepted');
      bounty.state = transitionBountyState(bounty.state, 'approved');
      bounty.state = transitionBountyState(bounty.state, 'payout_pending');

      const card: EvidenceCard = {
        bountyId: bounty.id,
        productUrl: bounty.productUrl,
        question: bounty.question,
        answerSummary: `Verified physical proof for: ${bounty.question}`,
        mediaUrl: evidence.mediaUrl,
        checklist: evidence.checklistResults,
        captureTimestamp: evidence.submittedAt,
        challengeVerified: evidence.metadata.challengeVerified,
        limitationsStatement: 'Challenge code and timestamp improve freshness proof but do not constitute legal certification.',
        reusableFactUnlocked: evidence.reusableConsent
      };

      this.store.evidence.set(evidenceId, evidence);
      this.store.bounties.set(bounty.id, bounty);
      this.store.save();
      return { bounty, evidence, card };

    } else if (decision === 'request_correction') {
      evidence.state = transitionEvidenceState(evidence.state, 'needs_correction');
      bounty.state = transitionBountyState(bounty.state, 'correction_requested');
      evidence.correctionReason = notes || 'Checklist items incomplete';
      this.store.evidence.set(evidenceId, evidence);
      this.store.bounties.set(bounty.id, bounty);
      this.store.save();
      return { bounty, evidence };

    } else {
      evidence.state = transitionEvidenceState(evidence.state, 'rejected');
      bounty.state = transitionBountyState(bounty.state, 'rejected');
      bounty.state = transitionBountyState(bounty.state, 'refund_requested');
      this.store.evidence.set(evidenceId, evidence);
      this.store.bounties.set(bounty.id, bounty);
      this.store.save();
      return { bounty, evidence };
    }
  }

  processPayout(bountyId: string): BountyRequest {
    const bounty = this.store.bounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty ${bountyId} not found`);

    bounty.state = transitionBountyState(bounty.state, 'paid');
    bounty.updatedAt = new Date().toISOString();
    this.store.bounties.set(bountyId, bounty);
    this.store.save();
    return bounty;
  }
}
