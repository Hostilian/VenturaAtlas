const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const sources = require('../data/sources.json');
const runs = require('../data/research-runs.json');
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];

const RUN_ID = 'run-res-004-20260812-fresh-opportunity-round';
const expectedStagedNames = [
  'Agent Action Flight Recorder',
  'PQC Migration CI',
  'BiocharTrace - CRCF MRV Compiler',
  'Posted Worker Orchestrator',
  'European Business Credential Router',
  'Secondary Material Quality Graph',
  'Short-Term Rental Registration Router',
  'eFTI Adapter Mesh',
  'UX Fairness CI',
  'Renovation Finance Graph'
];

test('fresh opportunity round resolves all twenty proposals and preserves the top-ten validation order', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run, 'research run is recorded');
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 20);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.proposal), [
    'Agent Action Flight Recorder',
    'Cloud Exit Drill / ExitOps',
    'Grid Connection Underwriter',
    'Unsold Inventory Surplus Router',
    'Machine Data Switchboard',
    'Worker Decision Ledger',
    'PQC Migration CI',
    'BiocharTrace / CRCF MRV Compiler',
    'Posted Worker Orchestrator',
    'Software Liability Replay'
  ]);
  assert.strictEqual(run.prototypePriority.length, 3);
  assert.strictEqual(run.researchMethodExtensions.length, 4);
  assert.strictEqual(run.reviewStatus, 'approved_for_private_staging_and_validation_not_canonical_promotion');
  assert.strictEqual(run.receiptMaturity, undefined);
});

test('fresh concepts remain private, provisional, and outside the canonical ranking', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(expectedStagedNames.every(name => !canonicalNames.has(name)));

  if (!fs.existsSync(queuePath)) {
    t.skip('private staging queue is intentionally absent from a clean public checkout');
    return;
  }

  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...expectedStagedNames].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance?.overallScore === null));
  assert.ok(staged.every(item => item.atAGlance?.confidenceScore === null));
  assert.ok(staged.every(item => item.researchAssessment?.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.strictEqual(staged.filter(item => item.prioritizedForValidation).length, 1);
});

test('fresh evidence cohort is public, primary, and evidence eligible', () => {
  const cohort = sources.filter(item => item.researchRound === 'fresh-opportunity-round-2026-08-12');
  assert.strictEqual(cohort.length, 11);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true));
  assert.ok(cohort.every(item => item.sourceType === 'primary'));
  assert.ok(cohort.every(item => /^https:\/\//.test(item.url)));
});

test('proposal-sensitive opportunities cannot be mistaken for enacted deadlines', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.strictEqual(run.deduplicationDecisions['UX Fairness CI'].decision, 'stage_watch_only_candidate');
  const stagedByName = new Map(queue.filter(item => item.provenance?.researchRunId === RUN_ID).map(item => [item.name, item]));
  if (stagedByName.size === 0) return;
  assert.strictEqual(stagedByName.get('European Business Credential Router').researchAssessment.priorityClass, 'watch_proposal');
  assert.strictEqual(stagedByName.get('UX Fairness CI').researchAssessment.priorityClass, 'watch_proposal');
  assert.match(stagedByName.get('Posted Worker Orchestrator').atAGlance.bestNextValidationStep, /separate current national duties from proposed EU interfaces/i);
});

test('exact duplicates point to their existing canonical records', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.deepStrictEqual(run.deduplicationDecisions['Worker Decision Ledger'], {
    decision: 'exact_duplicate',
    targets: ['idea-363']
  });
  assert.deepStrictEqual(run.deduplicationDecisions['Cloud Exit Drill / ExitOps'].targets.slice(0, 1), ['idea-372']);
  assert.deepStrictEqual(run.deduplicationDecisions['Software Liability Replay'].targets.slice(0, 1), ['idea-364']);
});
