const crypto = require('crypto');

const REVIEWER_ROLES = new Set(['repository-owner', 'human-reviewer', 'integration-release-agent']);
const RESEARCH_LEVELS = new Set(['R4_CLAIM_MAPPED', 'R5_ADVERSARIAL', 'R6_REVIEWED', 'R7_DECISION_INTEGRATED']);

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256Json(value) {
  return crypto.createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

function basicValid(receipt, type, idea, now = new Date(), verifySubjectDigest = true) {
  if (!receipt || receipt.schemaVersion !== '1.0.0' || receipt.receiptType !== type) return false;
  if (receipt.decision !== 'APPROVE' || receipt.subjectId !== idea.id) return false;
  if (!/^[a-f0-9]{7,40}$/.test(receipt.baselineCommit || '')) return false;
  if (verifySubjectDigest && receipt.subjectDigest !== sha256Json(idea)) return false;
  if (!receipt.receiptId || !/^receipt-[a-z0-9-]{8,}$/.test(receipt.receiptId)) return false;
  if (!receipt.reviewer?.id || !REVIEWER_ROLES.has(receipt.reviewer.role)) return false;
  const decidedAt = new Date(receipt.decidedAt);
  if (!Number.isFinite(decidedAt.getTime()) || decidedAt > new Date(now.getTime() + 5 * 60 * 1000)) return false;
  if (receipt.expiresAt) {
    const expiry = new Date(receipt.expiresAt);
    if (!Number.isFinite(expiry.getTime()) || expiry <= now) return false;
  }
  return true;
}

function deriveLifecycleForPublic(idea, receiptDocument, context = {}) {
  const receipts = Array.isArray(receiptDocument) ? receiptDocument : (receiptDocument?.receipts || []);
  const receiptById = new Map(receipts.map(receipt => [receipt.receiptId, receipt]));
  const refs = idea.lifecycleReceiptRefs || {};
  const canonicalReceipt = receiptById.get(refs.canonicalization);
  const canonicalValid = basicValid(
    canonicalReceipt,
    'CANONICALIZE',
    { id: canonicalReceipt?.subjectId },
    context.now || new Date(),
    false
  ) &&
    canonicalReceipt.canonicalIdeaId === idea.id &&
    canonicalReceipt.canonicalDigest === sha256Json(idea) &&
    canonicalReceipt.identityReview?.status === 'APPROVED' &&
    canonicalReceipt.duplicateReview?.status === 'APPROVED' &&
    Boolean(canonicalReceipt.duplicateReview?.semanticReviewId) &&
    canonicalReceipt.lineageVerified === true;

  const publicSourceIds = context.publicSourceIds || new Set();
  const researchRunIds = context.researchRunIds || new Set();
  const researchReceipt = receiptById.get(refs.research);
  const researchValid = canonicalValid && basicValid(researchReceipt, 'RESEARCH_MATURITY', idea, context.now || new Date()) &&
    RESEARCH_LEVELS.has(researchReceipt?.maturity) &&
    Array.isArray(researchReceipt?.sourceIds) && researchReceipt.sourceIds.length > 0 &&
    researchReceipt.sourceIds.every(id => publicSourceIds.has(id)) &&
    Array.isArray(researchReceipt?.claimRelationIds) && researchReceipt.claimRelationIds.length > 0 &&
    Array.isArray(researchReceipt?.researchRunRefs) && researchReceipt.researchRunRefs.length > 0 &&
    researchReceipt.researchRunRefs.every(id => researchRunIds.has(id)) &&
    (researchReceipt.maturity !== 'R7_DECISION_INTEGRATED' || Boolean(researchReceipt.decisionDelta));

  const rankReceipt = receiptById.get(refs.ranking);
  const rankValid = researchValid && basicValid(rankReceipt, 'RANK_ELIGIBILITY', idea, context.now || new Date()) &&
    ['RESEARCHED', 'VALIDATION'].includes(rankReceipt?.universe) &&
    Boolean(rankReceipt?.methodVersion) && Boolean(rankReceipt?.scoreScaleVersion) &&
    Array.isArray(rankReceipt?.researchRunRefs) && rankReceipt.researchRunRefs.length > 0 &&
    rankReceipt.researchRunRefs.every(id => researchRunIds.has(id));

  const validationReceipt = receiptById.get(refs.validation);
  const validationValid = researchValid && basicValid(validationReceipt, 'VALIDATION', idea, context.now || new Date()) &&
    ['BEHAVIORAL', 'TRANSACTIONAL'].includes(validationReceipt?.evidenceKind) &&
    Array.isArray(validationReceipt?.validationRunRefs) && validationReceipt.validationRunRefs.length > 0 &&
    validationReceipt.validationRunRefs.every(id => (context.validationRunIds || new Set()).has(id));

  return {
    canonicalIdentity: canonicalValid ? 'CANONICAL_HYPOTHESIS' : 'LEGACY_CANONICAL_UNRECEIPTED',
    researchMaturity: researchValid ? researchReceipt.maturity : 'UNVERIFIED',
    rankingEligible: Boolean(rankValid),
    rankingUniverse: rankValid ? rankReceipt.universe : null,
    validationMaturity: validationValid ? validationReceipt.maturity : 'NOT_VALIDATED',
    receiptStatus: {
      canonicalization: canonicalValid ? 'verified' : 'missing_or_invalid',
      research: researchValid ? 'verified' : 'missing_or_invalid',
      ranking: rankValid ? 'verified' : 'missing_or_invalid',
      validation: validationValid ? 'verified' : 'missing_or_invalid'
    }
  };
}

module.exports = { canonicalize, sha256Json, basicValid, deriveLifecycleForPublic };
