/**
 * FactBounty Domain Types & State Machine Constants
 * Idea ID: idea-061
 */

export type BountyState =
  | 'draft'
  | 'awaiting_payment'
  | 'funded'
  | 'matching'
  | 'assigned'
  | 'capture_in_progress'
  | 'submitted'
  | 'under_review'
  | 'correction_requested'
  | 'approved'
  | 'rejected'
  | 'refund_requested'
  | 'refunded'
  | 'payout_pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled';

export type EvidenceState =
  | 'not_started'
  | 'capturing'
  | 'uploaded'
  | 'processing'
  | 'ready_for_review'
  | 'needs_correction'
  | 'accepted'
  | 'rejected'
  | 'quarantined'
  | 'deleted';

export type UserRole = 'buyer' | 'responder' | 'moderator' | 'admin';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  fulfilled: boolean;
  notes?: string;
}

export interface BountyRequest {
  id: string;
  buyerId: string;
  productUrl: string;
  productTitle?: string;
  question: string;
  checklist: ChecklistItem[];
  bountyAmount: number; // in cents or EUR
  currency: string;
  state: BountyState;
  responderId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  paymentId?: string;
}

export interface ChallengeCode {
  code: string;
  bountyId: string;
  responderId: string;
  generatedAt: string;
  expiresAt: string;
}

export interface CaptureMetadata {
  durationSeconds: number;
  mimeType: string;
  fileSizeBytes: number;
  challengeVerified: boolean;
  deviceInfo?: string;
  recordedAt: string;
  locationScrubbed: boolean;
}

export interface EvidenceSubmission {
  id: string;
  bountyId: string;
  responderId: string;
  state: EvidenceState;
  mediaUrl: string;
  thumbnailUrl?: string;
  challengeCode: string;
  checklistResults: ChecklistItem[];
  metadata: CaptureMetadata;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  moderatorNotes?: string;
  correctionReason?: string;
  reusableConsent: boolean;
}

export interface EvidenceCard {
  bountyId: string;
  productUrl: string;
  question: string;
  answerSummary: string;
  mediaUrl: string;
  checklist: ChecklistItem[];
  captureTimestamp: string;
  challengeVerified: boolean;
  limitationsStatement: string;
  reusableFactUnlocked: boolean;
}

export interface PaymentTransaction {
  id: string;
  bountyId: string;
  buyerId: string;
  amountCents: number;
  platformFeeCents: number;
  responderPayoutCents: number;
  currency: string;
  provider: 'local_simulator' | 'stripe';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'payout_released';
  idempotencyKey: string;
  createdAt: string;
}
