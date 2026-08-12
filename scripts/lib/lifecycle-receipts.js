const crypto = require('crypto');

const REVIEWER_ROLES = new Set(['repository-owner', 'human-reviewer', 'integration-release-agent']);
const RESEARCH_LEVELS = new Set(['R4_CLAIM_MAPPED', 'R5_ADVERSARIAL', 'R6_REVIEWED', 'R7_DECISION_INTEGRATED']);
const VALIDATION_LEVELS = new Set(['VALIDATED_BEHAVIORAL', 'VALIDATED_TRANSACTIONAL']);
const DERIVED_LIFECYCLE_FIELDS = new Set([
  'lifecycleReceiptRefs', 'canonicalState', 'researchMaturity', 'rankingEligibility',
  'validationMaturity', 'decisionStatus', 'promotionReview'
]);

function canonicalize(value) {
  if (value === null) return 'n';
  if (value === true) return 't';
  if (value === false) return 'f';
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isSafeInteger(value) && Number.isInteger(value)) throw new Error('unsafe lifecycle number');
    if (Object.is(value, -0) || value === 0) return 'd:0';
    const [mantissa, rawExponent] = value.toExponential(16).split('e');
    const exponent = Number(rawExponent);
    return `d:${mantissa}e${exponent >= 0 ? '+' : ''}${exponent}`;
  }
  if (typeof value === 'string') return `s${Buffer.byteLength(value, 'utf8')}:${value}`;
  if (Array.isArray(value)) return `[${value.map(canonicalize).join('')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${canonicalize(key)}${canonicalize(value[key])}`).join('')}}`;
  }
  throw new Error(`unsupported lifecycle digest type: ${typeof value}`);
}

function sha256Json(value) {
  return crypto.createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

function ideaContentSubject(idea) {
  return Object.fromEntries(Object.entries(idea).filter(([key]) => !DERIVED_LIFECYCLE_FIELDS.has(key)));
}

function ideaContentDigest(idea) {
  return sha256Json(ideaContentSubject(idea));
}

function basicValid(receipt, type, idea, now = new Date(), verifySubjectDigest = true, trustedReviewerIds = new Set()) {
  if (!receipt || receipt.schemaVersion !== '1.0.0' || receipt.receiptType !== type) return false;
  if (receipt.decision !== 'APPROVE' || receipt.subjectId !== idea.id) return false;
  if (!/^[a-f0-9]{7,40}$/.test(receipt.baselineCommit || '')) return false;
  if (verifySubjectDigest && receipt.subjectDigest !== ideaContentDigest(idea)) return false;
  if (!receipt.receiptId || !/^receipt-[a-z0-9-]{8,}$/.test(receipt.receiptId)) return false;
  if (!receipt.reviewer?.id || !REVIEWER_ROLES.has(receipt.reviewer.role)) return false;
  const authority = contextAuthority(receipt, trustedReviewerIds);
  if (!authority) return false;
  const decidedAt = new Date(receipt.decidedAt);
  if (!Number.isFinite(decidedAt.getTime()) || decidedAt > new Date(now.getTime() + 5 * 60 * 1000)) return false;
  if (receipt.expiresAt) {
    const expiry = new Date(receipt.expiresAt);
    if (!Number.isFinite(expiry.getTime()) || expiry <= now) return false;
  }
  return true;
}

function contextAuthority(receipt, trustedReviewerIds) {
  return trustedReviewerIds instanceof Set && trustedReviewerIds.has(`${receipt.reviewer.id}:${receipt.reviewer.role}`);
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
    false,
    context.trustedReviewerIds
  ) &&
    canonicalReceipt.canonicalIdeaId === idea.id &&
    canonicalReceipt.digestContract === 'idea-content-v2' &&
    canonicalReceipt.canonicalDigest === ideaContentDigest(idea) &&
    canonicalReceipt.identityReview?.status === 'APPROVED' &&
    canonicalReceipt.duplicateReview?.status === 'APPROVED' &&
    Boolean(canonicalReceipt.duplicateReview?.semanticReviewId) &&
    canonicalReceipt.lineageVerified === true;

  const publicSourceIds = context.publicSourceIds || new Set();
  const researchRunIds = context.researchRunIds || new Set();
  const researchReceipt = receiptById.get(refs.research);
  const researchRunById = context.researchRunById || new Map();
  const claimRelationIds = context.claimRelationIds || new Set();
  const researchValid = canonicalValid && basicValid(researchReceipt, 'RESEARCH_MATURITY', idea, context.now || new Date(), true, context.trustedReviewerIds) &&
    researchReceipt?.digestContract === 'idea-content-v2' && researchReceipt.subjectDigest === ideaContentDigest(idea) &&
    RESEARCH_LEVELS.has(researchReceipt?.maturity) &&
    Array.isArray(researchReceipt?.sourceIds) && researchReceipt.sourceIds.length > 0 &&
    researchReceipt.sourceIds.every(id => publicSourceIds.has(id)) &&
    Array.isArray(researchReceipt?.claimRelationIds) && researchReceipt.claimRelationIds.length > 0 &&
    researchReceipt.claimRelationIds.every(id => claimRelationIds.has(id)) &&
    Array.isArray(researchReceipt?.researchRunRefs) && researchReceipt.researchRunRefs.length > 0 &&
    researchReceipt.researchRunRefs.every(id => {
      const run = researchRunById.get(id);
      return researchRunIds.has(id) && run?.ideaIds?.includes(idea.id) && RESEARCH_LEVELS.has(run?.receiptMaturity) &&
        Array.isArray(run?.toolReceipts) && run.toolReceipts.length > 0;
    }) &&
    (researchReceipt.maturity !== 'R7_DECISION_INTEGRATED' || Boolean(researchReceipt.decisionDelta));

  const rankReceipt = receiptById.get(refs.ranking);
  let rankValid = researchValid && basicValid(rankReceipt, 'RANK_ELIGIBILITY', idea, context.now || new Date(), true, context.trustedReviewerIds) &&
    rankReceipt?.digestContract === 'idea-content-v2' && rankReceipt.subjectDigest === ideaContentDigest(idea) &&
    ['RESEARCHED', 'VALIDATION'].includes(rankReceipt?.universe) &&
    Boolean(rankReceipt?.methodVersion) && Boolean(rankReceipt?.scoreScaleVersion) &&
    Array.isArray(rankReceipt?.researchRunRefs) && rankReceipt.researchRunRefs.length > 0 &&
    rankReceipt.researchRunRefs.every(id => researchRunIds.has(id));

  const validationReceipt = receiptById.get(refs.validation);
  const validationRunById = context.validationRunById || new Map();
  const validationValid = researchValid && basicValid(validationReceipt, 'VALIDATION', idea, context.now || new Date(), true, context.trustedReviewerIds) &&
    validationReceipt?.digestContract === 'idea-content-v2' && validationReceipt.subjectDigest === ideaContentDigest(idea) &&
    VALIDATION_LEVELS.has(validationReceipt?.maturity) &&
    ['BEHAVIORAL', 'TRANSACTIONAL'].includes(validationReceipt?.evidenceKind) &&
    Array.isArray(validationReceipt?.validationRunRefs) && validationReceipt.validationRunRefs.length > 0 &&
    validationReceipt.validationRunRefs.every(id => {
      const run = validationRunById.get(id);
      return (context.validationRunIds || new Set()).has(id) && run?.ideaId === idea.id &&
        run?.status === 'COMPLETED' && ['BEHAVIORAL', 'TRANSACTIONAL'].includes(run?.evidenceKind) &&
        run.evidenceKind === validationReceipt.evidenceKind && run.ideaContentDigest === ideaContentDigest(idea);
    });
  if (rankReceipt?.universe === 'VALIDATION' && !validationValid) rankValid = false;

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

module.exports = { canonicalize, sha256Json, ideaContentSubject, ideaContentDigest, basicValid, deriveLifecycleForPublic };
