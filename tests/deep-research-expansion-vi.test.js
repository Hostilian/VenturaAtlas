const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const sources = require('../data/sources.json');
const runs = require('../data/research-runs.json');
const shockgraph = require('../data/shockgraph.json');
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];
const RUN_ID = 'run-res-008-20260812-expansion-vi';
const names = [
  'Cyber Assurance Continuity OS', 'Medical Countermeasure Readiness OS', 'IP Collateral Underwriter',
  'IMERA Crisis Capacity OS', 'University Spinout Deal OS', 'eSAF Offtake Bankability Engine',
  'Strategic API Stockpile Rotation OS', 'Construction Certification Delta CI',
  'Critical-Medicine Source-Change Compiler', 'eInvoice Semantic Repair Gateway',
  'Agri Contract Evidence Ledger', 'Refurbished Construction Requalification Network'
];

test('Expansion VI resolves every proposal, kill decision, and validation experiment', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run);
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 20);
  assert.strictEqual(Object.keys(run.killAndDowngradeDecisions).length, 6);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.strictEqual(run.immediateExperiments.length, 8);
  assert.strictEqual(run.metaDiscoveries.length, 7);
  assert.strictEqual(Object.keys(run.portfolioFamilies).length, 3);
  assert.strictEqual(run.researchPasses.length, 12);
  assert.deepStrictEqual(run.newScoringDimensions, ['stateDecay']);
});

test('only twelve distinct Expansion VI concepts are private and provisional', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(names.every(name => !canonicalNames.has(name)));
  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  if (!fs.existsSync(queuePath) || staged.length === 0) return t.skip('private research cohort unavailable');
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...names].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.ok(staged.every(item => item.researchAssessment.scoringDimensionsToMeasure.includes('stateDecay')));
});

test('Expansion VI sources are public primary evidence with bounded claims', () => {
  const cohort = sources.filter(item => item.researchRound === 'deep-research-expansion-vi-2026-08-12');
  assert.strictEqual(cohort.length, 14);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true && item.sourceType === 'primary'));
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run.claimsChanged.some(value => /still developing/.test(value)));
  assert.ok(run.claimsChanged.some(value => /customer demand/.test(value)));
  assert.ok(run.claimsChanged.some(value => /not ranking eligible/.test(value)));
});

test('module and exact-family decisions preserve the lower-ranked ten', () => {
  const decisions = runs.find(item => item.runId === RUN_ID).deduplicationDecisions;
  assert.strictEqual(decisions['Cyber Assurance Reuse Graph'].decision, 'module_of_cyber_assurance_continuity');
  assert.strictEqual(decisions['Academic IP Clean-Title Graph'].decision, 'module_of_spinout_and_ip_underwriting');
  assert.deepStrictEqual(decisions['Innovation Procurement Qualification Passport'].targets, ['candidate-9ece6f52-f118-56cd-ac52-4958c6bc6f49', 'idea-211', 'idea-265']);
  assert.strictEqual(decisions['SAF Airport Deliverability Router'].decision, 'module_of_esaf_bankability');
  assert.strictEqual(decisions['IP Royalty Underwriting Engine'].decision, 'module_of_ip_collateral_underwriter');
});

test('OMEGA XII graph receives only evidence-backed, review-required deltas', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.deepStrictEqual(run.omegaXiiContribution, {
    dependencyRecordsAdded: 6, shockRecordsAdded: 2, obligationRecordsAdded: 0,
    ecosystemRecordsAdded: 5, counterpartyAssessmentsAdded: 2, completionClaim: false
  });
  assert.ok(shockgraph.dependencies.some(item => item.dependencyId === 'dep-eu-imera' && /IN_APPLICATION/.test(item.status)));
  assert.ok(shockgraph.dependencies.some(item => item.dependencyId === 'dep-eu-ip-backed-finance-roadmap' && /EXPECTED_2027/.test(item.status)));
  assert.ok(shockgraph.shocks.some(item => item.shockId === 'shock-eucc-assurance-continuity-guidance'));
  assert.ok(shockgraph.shocks.every(item => item.reviewRequired === true));
});

test('attachment receipt is complete and does not claim canonical promotion', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.deepStrictEqual(run.attachment, {
    sha256: 'B2B0F57F817EE550A8492E72A68697AE4BE3A1443B39C26750E289623895F951',
    bytes: 60085, lines: 2439, copiesProcessed: 1
  });
  assert.strictEqual(run.reviewStatus, 'approved_for_private_staging_and_validation_not_canonical_promotion');
});
