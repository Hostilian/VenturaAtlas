const test = require('node:test');
const assert = require('node:assert/strict');
const { deriveLifecycleForPublic, sha256Json } = require('../scripts/lib/lifecycle-receipts');

function baseReceipt(type, idea, extra = {}) {
  return {
    schemaVersion: '1.0.0',
    receiptId: `receipt-${type.toLowerCase().replaceAll('_', '-')}-test-1234`,
    receiptType: type,
    subjectId: idea.id,
    subjectDigest: sha256Json(idea),
    baselineCommit: '8dfb96c691854db431229b0f8f0550b5dabfd482',
    reviewer: { id: 'test-reviewer', role: 'human-reviewer' },
    decision: 'APPROVE',
    decidedAt: '2026-08-12T10:00:00Z',
    ...extra
  };
}

function earnedFixture() {
  const idea = {
    id: 'idea-999',
    slug: 'earned-test',
    name: 'Earned Test',
    category: 'Testing',
    oneSentenceConcept: 'A synthetic lifecycle test fixture.',
    lifecycleReceiptRefs: {
      canonicalization: 'receipt-canonicalize-test-1234',
      research: 'receipt-research-maturity-test-1234',
      ranking: 'receipt-rank-eligibility-test-1234',
      validation: 'receipt-validation-test-1234'
    }
  };
  const canonical = baseReceipt('CANONICALIZE', { id: 'candidate-test-1234' }, {
    receiptId: idea.lifecycleReceiptRefs.canonicalization,
    subjectDigest: 'a'.repeat(64),
    canonicalIdeaId: idea.id,
    canonicalDigest: sha256Json(idea),
    identityReview: { status: 'APPROVED' },
    duplicateReview: { status: 'APPROVED', semanticReviewId: 'semantic-test' },
    lineageVerified: true
  });
  const research = baseReceipt('RESEARCH_MATURITY', idea, {
    receiptId: idea.lifecycleReceiptRefs.research,
    maturity: 'R6_REVIEWED',
    sourceIds: ['s01'],
    claimRelationIds: ['claim-test'],
    researchRunRefs: ['run-test']
  });
  const ranking = baseReceipt('RANK_ELIGIBILITY', idea, {
    receiptId: idea.lifecycleReceiptRefs.ranking,
    universe: 'RESEARCHED',
    methodVersion: 'method-v1',
    scoreScaleVersion: 'scale-v1',
    researchRunRefs: ['run-test']
  });
  const validation = baseReceipt('VALIDATION', idea, {
    receiptId: idea.lifecycleReceiptRefs.validation,
    maturity: 'VALIDATED_BEHAVIORAL',
    evidenceKind: 'BEHAVIORAL',
    validationRunRefs: ['validation-test']
  });
  return { idea, receipts: { schemaVersion: '1.0.0', receipts: [canonical, research, ranking, validation] } };
}

test('mutable validated label and fake run ID cannot earn maturity', () => {
  const idea = { id: 'idea-999', validationStatus: 'validated', researchRunId: 'fake' };
  const result = deriveLifecycleForPublic(idea, { receipts: [] }, { now: new Date('2026-08-12T12:00:00Z') });
  assert.equal(result.validationMaturity, 'NOT_VALIDATED');
  assert.equal(result.rankingEligible, false);
  assert.equal(result.researchMaturity, 'UNVERIFIED');
});

test('valid receipt chain earns research, ranking, and behavioral validation maturity', () => {
  const { idea, receipts } = earnedFixture();
  const result = deriveLifecycleForPublic(idea, receipts, {
    now: new Date('2026-08-12T12:00:00Z'),
    publicSourceIds: new Set(['s01']),
    researchRunIds: new Set(['run-test']),
    validationRunIds: new Set(['validation-test'])
  });
  assert.equal(result.canonicalIdentity, 'CANONICAL_HYPOTHESIS');
  assert.equal(result.researchMaturity, 'R6_REVIEWED');
  assert.equal(result.rankingEligible, true);
  assert.equal(result.rankingUniverse, 'RESEARCHED');
  assert.equal(result.validationMaturity, 'VALIDATED_BEHAVIORAL');
});

test('fake, internal-only, or missing source fails closed', () => {
  const { idea, receipts } = earnedFixture();
  const result = deriveLifecycleForPublic(idea, receipts, {
    now: new Date('2026-08-12T12:00:00Z'),
    publicSourceIds: new Set(),
    researchRunIds: new Set(['run-test']),
    validationRunIds: new Set(['validation-test'])
  });
  assert.equal(result.researchMaturity, 'UNVERIFIED');
  assert.equal(result.rankingEligible, false);
  assert.equal(result.validationMaturity, 'NOT_VALIDATED');
});

test('tampering with canonical content invalidates entire receipt chain', () => {
  const { idea, receipts } = earnedFixture();
  idea.name = 'Tampered';
  const result = deriveLifecycleForPublic(idea, receipts, {
    now: new Date('2026-08-12T12:00:00Z'),
    publicSourceIds: new Set(['s01']),
    researchRunIds: new Set(['run-test']),
    validationRunIds: new Set(['validation-test'])
  });
  assert.equal(result.canonicalIdentity, 'LEGACY_CANONICAL_UNRECEIPTED');
  assert.equal(result.rankingEligible, false);
});
