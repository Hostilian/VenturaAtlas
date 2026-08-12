const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const sources = require('../data/sources.json');
const runs = require('../data/research-runs.json');
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];
const RUN_ID = 'run-res-006-20260812-expansion-iv';
const names = [
  'Critical Materials Offtake Bankability Engine', 'EU Inc Corporate Action OS',
  'Talent Pool Hire-to-Arrival OS', 'Critical Materials Treasury - Shock Twin',
  'Strategic Project Permit Graph', 'EUDR Plot Identity Repair Engine',
  'Chip Design-In Qualification Engine', 'EuroCompute Router', 'Sovereign Refactor CI',
  'Made-in-EU Origin Compiler', 'European Product Release CI', 'Port Dependency and Investment Twin'
];

test('Expansion IV resolves all twenty proposals and records six experiments', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run);
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 20);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1, 2, 3, 4, 5, 6]);
  assert.strictEqual(run.immediateExperiments.length, 6);
  assert.strictEqual(run.metaDiscoveries.length, 6);
  assert.strictEqual(run.researchBranches.length, 5);
  assert.strictEqual(run.reviewStatus, 'approved_for_private_staging_and_validation_not_canonical_promotion');
});

test('only twelve distinct Expansion IV concepts are private and provisional', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(names.every(name => !canonicalNames.has(name)));
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue intentionally absent');
  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...names].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.ok(staged.every(item => item.researchAssessment.scoringDimensionsToMeasure.includes('stateTransitionOwnership')));
});

test('Expansion IV evidence cohort contains only public primary records', () => {
  const cohort = sources.filter(item => item.researchRound === 'deep-research-expansion-iv-2026-08-12');
  assert.strictEqual(cohort.length, 16);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true && item.sourceType === 'primary'));
});

test('existing families and subordinate modules do not create duplicate candidates', () => {
  const d = runs.find(item => item.runId === RUN_ID).deduplicationDecisions;
  assert.deepStrictEqual(d['Battery Passport Underwriting API'].targets, ['idea-270', 'candidate-44fa8b82-bc67-42ff-9ff3-cd6fa70e2d67']);
  assert.deepStrictEqual(d['Cross-Border Skills Evidence Router'], {decision: 'exact_existing_family', targets: ['idea-263']});
  assert.strictEqual(d['FDI Value-Add Scenario Engine'].decision, 'feature_of_made_in_eu_origin_compiler');
  assert.strictEqual(d['Strategic Stockpile Optimizer'].decision, 'feature_of_critical_materials_treasury');
  assert.strictEqual(d['EU Public-Compute FinOps'].decision, 'feature_of_eurocompute_router');
});

test('proposal and date-sensitive concepts retain explicit boundaries', (t) => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run.claimsChanged.some(value => /19 AI Factories and 13 antennas as operational/.test(value)));
  assert.ok(run.claimsChanged.some(value => /remain proposals/.test(value)));
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue intentionally absent');
  const staged = new Map(queue.filter(item => item.provenance?.researchRunId === RUN_ID).map(item => [item.name, item]));
  assert.strictEqual(staged.get('EU Inc Corporate Action OS').researchAssessment.priorityClass, 'proposal_watch_prebuild');
  assert.strictEqual(staged.get('Chip Design-In Qualification Engine').researchAssessment.priorityClass, 'proposal_watch_validation');
  assert.strictEqual(staged.get('Made-in-EU Origin Compiler').researchAssessment.priorityClass, 'proposal_watch_prebuild');
  assert.strictEqual(staged.get('European Product Release CI').researchAssessment.priorityClass, 'policy_watch_prebuild');
});

test('state-transition scoring remains research metadata, not canonical ranking authority', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.strictEqual(run.newScoringDimensions.positive.stateTransitionOwnership, 1.7);
  assert.strictEqual(run.newScoringDimensions.negative.officialCaptureRisk, 1.6);
  assert.ok(canonical.every(item => item.provenance?.researchRunId !== RUN_ID));
});
