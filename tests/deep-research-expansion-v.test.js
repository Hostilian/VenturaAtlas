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
const RUN_ID = 'run-res-007-20260812-expansion-v';
const names = [
  'CO2 Capacity Router - Carbon Corridor OS', 'Chemical Domino Graph', 'Brownfield PFAS Underwriter',
  'Advanced Materials Qualification Network', 'Biomanufacturing Tech-Transfer Compiler',
  'Bio-Based Drop-In Qualification OS', 'Ocean Space Conflict Compiler', 'Compute Offtake Bankability Engine',
  'Nature Restoration Project OS', 'Permit-Ready Modular Housing Compiler',
  'Multi-Operator Rail Disruption Clearinghouse', 'SMR Fleet Configuration Ledger',
  'Spectrum Capacity Exchange', 'Rail Capacity Portfolio OS'
];

test('Expansion V resolves all twenty-five proposals and five experiments', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run);
  assert.strictEqual(Object.keys(run.deduplicationDecisions).length, 25);
  assert.deepStrictEqual(run.validationPriorityQueue.map(item => item.rank), [1, 2, 3, 4, 5]);
  assert.strictEqual(run.immediateExperiments.length, 5);
  assert.strictEqual(run.metaDiscoveries.length, 5);
  assert.strictEqual(run.researchBranches.length, 6);
  assert.strictEqual(run.newScoringDimensions.length, 4);
});

test('only fourteen distinct Expansion V concepts are private and provisional', (t) => {
  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(names.every(name => !canonicalNames.has(name)));
  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  if (!fs.existsSync(queuePath) || staged.length === 0) return t.skip('private research cohort unavailable');
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...names].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment.scoreStatus === 'provisional_not_ranking_eligible'));
  assert.ok(staged.every(item => item.researchAssessment.scoringDimensionsToMeasure.includes('realityFeedback')));
});

test('Expansion V sources are public primary evidence', () => {
  const cohort = sources.filter(item => item.researchRound === 'deep-research-expansion-v-2026-08-12');
  assert.strictEqual(cohort.length, 16);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true && item.sourceType === 'primary'));
});

test('duplicate and module decisions preserve all lower-ranked proposals', () => {
  const d = runs.find(item => item.runId === RUN_ID).deduplicationDecisions;
  assert.deepStrictEqual(d['DeepTech Lab Access OS'].targets, ['candidate-2fa25465-2747-46b7-a7db-530949f7c070', 'idea-294']);
  assert.deepStrictEqual(d['Copper Retirement Migration OS'], {decision: 'exact_private_family', targets: ['candidate-22158a0b-1b04-4c35-a985-338f688422a7']});
  assert.strictEqual(d['PFAS Remediation Performance Network'].decision, 'module_of_brownfield_underwriter');
  assert.strictEqual(d['Research Infrastructure IP Router'].decision, 'module_of_existing_lab_access_operator');
  assert.strictEqual(d['OceanEye Insurance API'].decision, 'watch_module_of_ocean_space_compiler');
});

test('proposal and long-window candidates remain explicitly bounded', (t) => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.ok(run.claimsChanged.some(value => /Digital Networks Act is proposed/.test(value)));
  assert.ok(run.claimsChanged.some(value => /December 2030/.test(value)));
  const staged = new Map(queue.filter(item => item.provenance?.researchRunId === RUN_ID).map(item => [item.name, item]));
  if (!fs.existsSync(queuePath) || staged.size === 0) return t.skip('private research cohort unavailable');
  assert.strictEqual(staged.get('Spectrum Capacity Exchange').researchAssessment.priorityClass, 'proposal_watch');
  assert.strictEqual(staged.get('Rail Capacity Portfolio OS').researchAssessment.priorityClass, 'long_window_validation');
  assert.strictEqual(staged.get('SMR Fleet Configuration Ledger').researchAssessment.priorityClass, 'strategy_watch');
});

test('OMEGA XII graph advances without misclassifying a proposal as enacted shock', () => {
  const run = runs.find(item => item.runId === RUN_ID);
  assert.deepStrictEqual(run.omegaXiiContribution, {
    dependencyRecordsAdded: 6, shockRecordsAdded: 5, obligationRecordsAdded: 2,
    ecosystemRecordsAdded: 6, counterpartyAssessmentsAdded: 2, completionClaim: false
  });
  assert.ok(shockgraph.dependencies.some(item => item.dependencyId === 'dep-eu-digital-networks-proposal' && /^PROPOSED/.test(item.status)));
  assert.ok(!shockgraph.shocks.some(item => item.shockId === 'shock-digital-networks-act-proposal'));
  assert.ok(shockgraph.shocks.every(item => item.reviewRequired === true));
});

test('duplicate attachment copies are hash-deduplicated in the run receipt', () => {
  const d = runs.find(item => item.runId === RUN_ID).attachmentDeduplication;
  assert.strictEqual(d.expansionVCopies, 2);
  assert.strictEqual(d.omegaXiiCopies, 3);
  assert.match(d.expansionVUniqueSha256, /^[A-F0-9]{64}$/);
  assert.match(d.omegaXiiUniqueSha256, /^[A-F0-9]{64}$/);
});
