const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validateAbsorptionFrontier } = require('../scripts/validate-absorption-frontier');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const queuePath = path.join(root, 'data', 'idea-staging-queue.json');
test('absorption frontier is source-linked, non-promotional, and fail-closed', (t) => {
  // Private staging queue is gitignored and absent on CI fresh clones.
  // Skip rather than crash — consistent with deep-research-expansion-iii pattern.
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue unavailable in this environment');
  const doc = read('data/absorption-frontier.json');
  const sources = read('data/sources.json');
  const candidates = read('data/idea-staging-queue.json');
  const errors = validateAbsorptionFrontier(doc, sources, candidates);
  assert.deepEqual(errors, []);
  assert.equal(doc.records.length, 4);
  assert.ok(doc.records.every(r => r.naturalAbsorbers.length > 0 && r.promotionEligible === false));
  assert.ok(doc.records.every(r => r.noveltyDistance !== 'GENUINELY_NEW'));
});
test('unknown source and candidate references fail closed', (t) => {
  // Private staging queue is gitignored and absent on CI fresh clones.
  if (!fs.existsSync(queuePath)) return t.skip('private staging queue unavailable in this environment');
  const doc = read('data/absorption-frontier.json');
  const sources = read('data/sources.json');
  const candidates = read('data/idea-staging-queue.json');
  doc.records[0].sourceRefs.push('s-does-not-exist');
  doc.records[1].candidateRef = 'candidate-does-not-exist';
  const errors = validateAbsorptionFrontier(doc, sources, candidates);
  assert.equal(errors.length, 2);
});
