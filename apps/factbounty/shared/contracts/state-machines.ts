/**
 * Validated State Machines for Bounty and Evidence Lifecycle
 */
import { BountyState, EvidenceState } from '../types';

export const VALID_BOUNTY_TRANSITIONS: Record<BountyState, BountyState[]> = {
  draft: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['funded', 'cancelled', 'expired'],
  funded: ['matching', 'assigned', 'refund_requested', 'cancelled'],
  matching: ['assigned', 'refund_requested', 'expired', 'cancelled'],
  assigned: ['capture_in_progress', 'matching', 'refund_requested', 'expired'],
  capture_in_progress: ['submitted', 'assigned', 'expired'],
  submitted: ['under_review', 'expired'],
  under_review: ['approved', 'correction_requested', 'rejected'],
  correction_requested: ['capture_in_progress', 'under_review', 'refund_requested', 'expired'],
  approved: ['payout_pending', 'refund_requested'],
  rejected: ['refund_requested', 'cancelled'],
  refund_requested: ['refunded', 'funded'],
  refunded: [],
  payout_pending: ['paid', 'failed'],
  paid: [],
  failed: [],
  expired: ['refunded'],
  cancelled: ['refunded']
};

export const VALID_EVIDENCE_TRANSITIONS: Record<EvidenceState, EvidenceState[]> = {
  not_started: ['capturing'],
  capturing: ['uploaded', 'not_started'],
  uploaded: ['processing', 'quarantined'],
  processing: ['ready_for_review', 'quarantined'],
  ready_for_review: ['accepted', 'needs_correction', 'rejected', 'quarantined'],
  needs_correction: ['capturing', 'ready_for_review'],
  accepted: [],
  rejected: ['deleted'],
  quarantined: ['deleted', 'ready_for_review'],
  deleted: []
};

export class InvalidStateTransitionError extends Error {
  constructor(entity: 'Bounty' | 'Evidence', from: string, to: string) {
    super(`Invalid ${entity} state transition from '${from}' to '${to}'`);
    this.name = 'InvalidStateTransitionError';
  }
}

export function transitionBountyState(current: BountyState, next: BountyState): BountyState {
  const allowed = VALID_BOUNTY_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new InvalidStateTransitionError('Bounty', current, next);
  }
  return next;
}

export function transitionEvidenceState(current: EvidenceState, next: EvidenceState): EvidenceState {
  const allowed = VALID_EVIDENCE_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new InvalidStateTransitionError('Evidence', current, next);
  }
  return next;
}
