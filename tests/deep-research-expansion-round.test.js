const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const sources = require('../data/sources.json');
const runs = require('../data/research-runs.json');
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];

const RUN_ID = 'run-res-003-20260812-deep-research-expansion';
const expectedStagedNames = [
  'CRA Incident Compiler - Regulatory Clock and Submission Evidence',
  'AI Interaction Transparency SDK',
  'AI Literacy Evidence Engine',
  'CBAM Supplier Evidence Network',
  'Energy Flexibility Normalization API'
];

test('expansion round records all fifteen deduplication decisions and a five-item priority queue', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run, 'research run is recorded');
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 15);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(
    run.validationPriorityQueue.map(item => item.proposal),
    ['CRA Incident Compiler', 'AI Provenance Gateway', 'GreenClaim CI', 'Credential Firewall for EUDI', 'DPP Bridge / Passport API']
  );
  assert.ok(run.validationPriorityQueue.every(item => item.nextGate));
  assert.strictEqual(run.reviewStatus, 'approved_for_staging_and_validation_priority_not_canonical_promotion');
  assert.strictEqual(run.receiptMaturity, undefined);
});

test('new expansion concepts remain private, provisional, and noncanonical', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(expectedStagedNames.every(name => !canonicalNames.has(name)));

  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  if (!fs.existsSync(queuePath) || staged.length === 0) {
    t.skip('private research cohort is intentionally unavailable in this checkout');
    return;
  }

  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...expectedStagedNames].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance?.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment?.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.strictEqual(staged.filter(item => item.prioritizedForValidation).length, 1);
});

test('expansion evidence cohort contains only public official primary records', () => {
  const cohort = sources.filter(item => item.researchRound === 'deep-research-expansion-2026-08-12');
  assert.strictEqual(cohort.length, 12);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true));
  assert.ok(cohort.every(item => item.sourceType === 'primary'));
  assert.ok(cohort.every(item => /^https:\/\//.test(item.url)));
});

test('Space Compliance Graph is explicitly watch-only because the EU Space Act is a proposal', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  const decision = run.deduplicationDecisions['Space Compliance Graph'];
  assert.strictEqual(decision.decision, 'enrich_existing_watch_only_proposal_not_law');
  assert.deepStrictEqual(decision.targets, ['idea-383']);
});
