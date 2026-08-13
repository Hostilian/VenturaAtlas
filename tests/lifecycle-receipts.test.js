const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { deriveLifecycleForPublic, ideaContentDigest } = require('../scripts/lib/lifecycle-receipts');

function baseReceipt(type, idea, extra = {}) {
  return {
    schemaVersion: '1.0.0', receiptId: `receipt-${type.toLowerCase().replaceAll('_', '-')}-test-1234`,
    receiptType: type, subjectId: idea.id, subjectDigest: ideaContentDigest(idea),
    digestContract: 'idea-content-v2', baselineCommit: '8dfb96c691854db431229b0f8f0550b5dabfd482',
    reviewer: { id: 'test-reviewer', role: 'human-reviewer' }, decision: 'APPROVE',
    decidedAt: '2026-08-12T10:00:00Z', ...extra
  };
}

function earnedFixture() {
  const idea = { id: 'idea-999', slug: 'earned-test', name: 'Earned Test', category: 'Testing',
    oneSentenceConcept: 'A synthetic lifecycle test fixture.', lifecycleReceiptRefs: {
      canonicalization: 'receipt-canonicalize-test-1234', research: 'receipt-research-maturity-test-1234',
      ranking: 'receipt-rank-eligibility-test-1234', validation: 'receipt-validation-test-1234' } };
  const canonical = baseReceipt('CANONICALIZE', { id: 'candidate-test-1234' }, {
    receiptId: idea.lifecycleReceiptRefs.canonicalization, subjectDigest: 'a'.repeat(64), canonicalIdeaId: idea.id,
    canonicalDigest: ideaContentDigest(idea), identityReview: { status: 'APPROVED' },
    duplicateReview: { status: 'APPROVED', semanticReviewId: 'semantic-test' }, lineageVerified: true });
  const research = baseReceipt('RESEARCH_MATURITY', idea, { receiptId: idea.lifecycleReceiptRefs.research,
    maturity: 'R6_REVIEWED', sourceIds: ['s01'], claimRelationIds: ['claimrel-test'], researchRunRefs: ['run-test'] });
  const ranking = baseReceipt('RANK_ELIGIBILITY', idea, { receiptId: idea.lifecycleReceiptRefs.ranking,
    universe: 'RESEARCHED', methodVersion: 'method-v1', scoreScaleVersion: 'scale-v1', researchRunRefs: ['run-test'] });
  const validation = baseReceipt('VALIDATION', idea, { receiptId: idea.lifecycleReceiptRefs.validation,
    maturity: 'VALIDATED_BEHAVIORAL', evidenceKind: 'BEHAVIORAL', validationRunRefs: ['validation-test'] });
  return { idea, receipts: { schemaVersion: '1.0.0', receipts: [canonical, research, ranking, validation] } };
}

function earnedContext(idea) {
  return { now: new Date('2026-08-12T12:00:00Z'), publicSourceIds: new Set(['s01']),
    researchRunIds: new Set(['run-test']), validationRunIds: new Set(['validation-test']),
    claimRelationIds: new Set(['claimrel-test']), trustedReviewerIds: new Set(['test-reviewer:human-reviewer']),
    rankingMethodKeys: new Set(['method-v1:scale-v1']),
    researchRunById: new Map([['run-test', { ideaIds: [idea.id], receiptMaturity: 'R6_REVIEWED', toolReceipts: ['tool-test'] }]]),
    validationRunById: new Map([['validation-test', { ideaId: idea.id, ideaContentDigest: ideaContentDigest(idea),
      status: 'COMPLETED', evidenceKind: 'BEHAVIORAL', evidenceRefs: ['evidence-test'] }]]) };
}

test('mutable validated label and fake run ID cannot earn maturity', () => {
  const idea = { id: 'idea-999', validationStatus: 'validated', researchRunId: 'fake' };
  const result = deriveLifecycleForPublic(idea, { receipts: [] }, { now: new Date('2026-08-12T12:00:00Z') });
  assert.equal(result.validationMaturity, 'NOT_VALIDATED'); assert.equal(result.rankingEligible, false);
  assert.equal(result.researchMaturity, 'UNVERIFIED');
});

test('valid receipt chain earns research, ranking, and behavioral validation maturity', () => {
  const { idea, receipts } = earnedFixture(); const result = deriveLifecycleForPublic(idea, receipts, earnedContext(idea));
  assert.equal(result.canonicalIdentity, 'CANONICAL_HYPOTHESIS'); assert.equal(result.researchMaturity, 'R6_REVIEWED');
  assert.equal(result.rankingEligible, true); assert.equal(result.rankingUniverse, 'RESEARCHED');
  assert.equal(result.validationMaturity, 'VALIDATED_BEHAVIORAL');
});

test('fake, internal-only, or missing source fails closed', () => {
  const { idea, receipts } = earnedFixture(); const context = earnedContext(idea); context.publicSourceIds = new Set();
  const result = deriveLifecycleForPublic(idea, receipts, context);
  assert.equal(result.researchMaturity, 'UNVERIFIED'); assert.equal(result.rankingEligible, false);
  assert.equal(result.validationMaturity, 'NOT_VALIDATED');
});

test('tampering with canonical content invalidates entire receipt chain', () => {
  const { idea, receipts } = earnedFixture(); idea.name = 'Tampered';
  const result = deriveLifecycleForPublic(idea, receipts, earnedContext(idea));
  assert.equal(result.canonicalIdentity, 'LEGACY_CANONICAL_UNRECEIPTED'); assert.equal(result.rankingEligible, false);
});

test('incremental receipt references do not invalidate prior stages', () => {
  const { idea, receipts } = earnedFixture(); const refs = { ...idea.lifecycleReceiptRefs };
  idea.lifecycleReceiptRefs = { canonicalization: refs.canonicalization };
  let context = earnedContext(idea); let result = deriveLifecycleForPublic(idea, { receipts: receipts.receipts.slice(0, 1) }, context);
  assert.equal(result.receiptStatus.canonicalization, 'verified');
  idea.lifecycleReceiptRefs.research = refs.research; context = earnedContext(idea);
  result = deriveLifecycleForPublic(idea, { receipts: receipts.receipts.slice(0, 2) }, context);
  assert.equal(result.receiptStatus.research, 'verified');
  idea.lifecycleReceiptRefs.ranking = refs.ranking; context = earnedContext(idea);
  result = deriveLifecycleForPublic(idea, { receipts: receipts.receipts.slice(0, 3) }, context);
  assert.equal(result.receiptStatus.ranking, 'verified');
  idea.lifecycleReceiptRefs.validation = refs.validation; context = earnedContext(idea);
  result = deriveLifecycleForPublic(idea, receipts, context); assert.equal(result.receiptStatus.validation, 'verified');
});

test('validation universe requires a valid real-world validation receipt', () => {
  const { idea, receipts } = earnedFixture(); receipts.receipts[2].universe = 'VALIDATION';
  const result = deriveLifecycleForPublic(idea, { receipts: receipts.receipts.slice(0, 3) }, earnedContext(idea));
  assert.equal(result.rankingEligible, false); assert.equal(result.rankingUniverse, null);
});

test('invented ranking method or unrelated run cannot earn eligibility', () => {
  const { idea, receipts } = earnedFixture(); const context = earnedContext(idea);
  context.rankingMethodKeys = new Set();
  assert.equal(deriveLifecycleForPublic(idea, receipts, context).rankingEligible, false);
  context.rankingMethodKeys = new Set(['method-v1:scale-v1']);
  context.researchRunById.set('run-test', { ideaIds: ['idea-998'], receiptMaturity: 'R6_REVIEWED', toolReceipts: ['tool-test'] });
  assert.equal(deriveLifecycleForPublic(idea, receipts, context).rankingEligible, false);
});

test('Python and JavaScript share lifecycle digest vectors', () => {
  const vector = { integralFloat: 1.0, negativeZero: -0, exponent: 1e-7, unicode: 'é', nested: [1.25, { x: true }] };
  const script = "import json; from va_runtime.lifecycle import sha256_json; print(sha256_json(json.loads(input())))";
  const result = spawnSync('python', ['-c', script], {
    cwd: require('node:path').resolve(__dirname, '..'),
    env: { ...process.env, PYTHONUTF8: '1', PYTHONPATH: require('node:path').resolve(__dirname, '..', 'scripts') },
    input: `${JSON.stringify(vector)}\n`, encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), require('../scripts/lib/lifecycle-receipts').sha256Json(vector));
});
