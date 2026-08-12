const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const sources = require('../data/sources.json');
const runs = require('../data/research-runs.json');
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];
const RUN_ID = 'run-res-005-20260812-expansion-iii';
const names = [
  'Molecule Passport - Gas Provenance Graph', 'EHDS EHR Preflight CI', 'Digital Euro Conformance CI',
  'GovInterop CI', 'Industrial Permit Diff Engine', 'SoHO Supply Continuity Router',
  'Industrial Water Dependency Graph', 'SAFE Procurement Eligibility Graph',
  'Customs Product Identity Compiler', 'Grid-Responsive Compute Broker'
];

test('Expansion III resolves all 24 proposals and retains the requested validation set', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run);
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 24);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1,2,3,4,5,6,7,8,9,10,11]);
  assert.strictEqual(run.immediateExperiments.length, 5);
  assert.deepStrictEqual(run.researchBranches, ['commingled_asset_ledgers', 'continuous_regulatory_conformance', 'regulatory_data_debt_windows']);
  assert.deepStrictEqual(run.newScoringDimensions, ['economicCoupling', 'involuntaryFrequency', 'evidenceGravity']);
  assert.strictEqual(run.researchPasses.length, 8);
  assert.strictEqual(run.reviewStatus, 'approved_for_private_staging_and_validation_not_canonical_promotion');
});

test('only ten distinct Expansion III concepts are private and provisional', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(names.every(name => !canonicalNames.has(name)));
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue intentionally absent');
  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...names].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.ok(staged.every(item => item.researchAssessment.scoringDimensionsToMeasure.length === 3));
});

test('Expansion III evidence cohort is public primary evidence', () => {
  const cohort = sources.filter(item => item.researchRound === 'deep-research-expansion-iii-2026-08-12');
  assert.strictEqual(cohort.length, 18);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true && item.sourceType === 'primary'));
});

test('exact duplicates resolve to their existing targets', () => {
  const d = runs.find(item => item.runId === RUN_ID).deduplicationDecisions;
  assert.deepStrictEqual(d['NZIA Resilience BOM Compiler'], {decision: 'exact_duplicate', targets: ['idea-373']});
  assert.deepStrictEqual(d['EHDS Study Permit Compiler'], {decision: 'exact_duplicate', targets: ['idea-379']});
  assert.deepStrictEqual(d['Duct & Civil Works Router'], {decision: 'exact_duplicate', targets: ['idea-287']});
  assert.deepStrictEqual(d['Data-Centre Rating Digital Twin'], {decision: 'exact_duplicate', targets: ['idea-389']});
});

test('timing-sensitive concepts remain correctly bounded', (t) => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run.claimsChanged.some(value => /1 September 2025/.test(value)));
  assert.ok(run.claimsChanged.some(value => /Digital euro v0.91 remains draft/.test(value)));
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue intentionally absent');
  const staged = new Map(queue.filter(item => item.provenance?.researchRunId === RUN_ID).map(item => [item.name, item]));
  assert.strictEqual(staged.get('Digital Euro Conformance CI').researchAssessment.priorityClass, 'draft_watch');
  assert.strictEqual(staged.get('Grid-Responsive Compute Broker').researchAssessment.priorityClass, 'competition_watch');
});
