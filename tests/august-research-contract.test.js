const assert = require('node:assert');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const canonical = require('../data/ideas.json').ideas;
const queuePath = path.join(__dirname, '..', 'data', 'idea-staging-queue.json');
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];
const sources = require('../data/sources.json');

const RUN_ID = 'run-res-002-20260810-august-operational-chokepoints';
const expectedNames = [
  'PackGate — PPWR Market-Access & Stock Router',
  'WasteFlow ExceptionOps — DIWASS Reconciliation Layer',
  'EudaMirror — EUDAMED Reality Reconciler',
  'QueueReady — Grid Connection Readiness OS',
  'LiabilityReplay — Product Liability Evidence Simulator',
  'CarbonVerifier Handoff — CBAM Evidence-to-Verification Layer',
  'FreightContract Testbench — eFTI Data Conformance Lab'
];

test('August operational-chokepoint pass remains staged and explicitly provisional', (t) => {
  const staged = queue.filter(item => item.provenance?.researchRunId === RUN_ID);
  if (!fs.existsSync(queuePath) || staged.length === 0) {
    const canonicalNames = new Set(canonical.map(item => item.name));
    assert.ok(expectedNames.every(name => !canonicalNames.has(name)));
    t.skip('private research cohort is intentionally unavailable in this checkout');
    return;
  }
  assert.deepStrictEqual(staged.map(item => item.name).sort(), [...expectedNames].sort());
  assert.ok(staged.every(item => item.promotionEligible === false));
  assert.ok(staged.every(item => item.atAGlance?.overallScore === null));
  assert.ok(staged.every(item => item.researchAssessment?.scoreStatus === 'provisional_not_ranking_eligible'));

  const canonicalNames = new Set(canonical.map(item => item.name));
  assert.ok(expectedNames.every(name => !canonicalNames.has(name)));
});

test('August evidence sources are explicit public primary records', () => {
  const cohort = sources.filter(item => item.researchRound === 'august-2026-operational-chokepoints');
  assert.strictEqual(cohort.length, 13);
  assert.ok(cohort.every(item => item.visibility === 'PUBLIC'));
  assert.ok(cohort.every(item => item.sourceClass === 'PRIMARY_OR_OFFICIAL'));
  assert.ok(cohort.every(item => item.evidenceEligible === true));
  assert.ok(cohort.every(item => item.sourceType === 'primary'));
  assert.ok(cohort.every(item => /^https:\/\//.test(item.url)));
});
