const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('OMEGA XIV receipt records the three-way battle without canonical promotion', () => {
  // Private staging is intentionally absent from fresh clones and CI. Verify the
  // committed research receipt instead of weakening that privacy boundary.
  const runs = read('data/research-runs.json');
  const run = runs.find(item => item.runId === 'run-res-018-20260817-omega-xiv-capital-clock');
  assert.ok(run, 'OMEGA XIV research receipt must be committed');
  assert.deepEqual(
    run.validationPriorityQueue.map(item => [item.proposal, item.status]),
    [
      ['NZIA BidProof — Non-Price Tender Evidence Capsule', 'NEW / DEEP RESEARCH'],
      ['SAFE OriginTrace — Component-Cost & Design-Control Evidence Graph', 'NEW / DEEP RESEARCH'],
      ['QueueReady — Grid Connection Readiness OS', 'EXISTING / RE-UNDERWRITE'],
    ],
  );
  assert.equal(run.reviewStatus, 'deep_research_integrated_not_validation_not_canonical_promotion');
});

test('OMEGA XIV uses null-first capital amounts and explicit clocks', () => {
  const programs = read('data/capital-programs.json').programs;
  const clocks = read('data/capital-clock-ledger.json').clocks;
  assert.equal(programs.length, 5);
  assert.ok(programs.every(item => item.contestableAmount === null && item.currentlyAvailableAmount === null));
  assert.equal(clocks.length, 5);
  assert.ok(clocks.some(item => item.expiresAt === '2026-09-09T23:59:59Z'));
  assert.ok(clocks.some(item => item.expiresAt === null && item.state === 'OPEN'));
});
