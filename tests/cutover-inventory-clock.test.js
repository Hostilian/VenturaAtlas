const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validateCutoverInventoryClock } = require('../scripts/validate-cutover-inventory-clock');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('OMEGA XV records two future cutover clocks', () => {
  const document = read('data/cutover-inventory-clocks.json');
  assert.equal(document.records.length, 2);
  assert.ok(document.records.some(item => item.cutoverAt === '2026-09-03T00:00:00Z'));
  assert.ok(document.records.some(item => item.cutoverAt === '2026-10-01T00:00:00Z'));
  const sourcesDocument = read('data/sources.json');
  assert.deepEqual(validateCutoverInventoryClock(document, sourcesDocument.sources || sourcesDocument), []);
});

test('OMEGA XV candidates are payment-validation hypotheses only', () => {
  const catalog = read('data/research-proposal-catalog.json');
  const records = catalog.proposals
    .filter(item => item.roundId === 'omega-xv-cutover-inventory')
    .slice(0, 3);
  assert.equal(records.length, 3);
  assert.ok(records.every(item => item.rankingEligible === false));
  assert.ok(records.every(item => /not canonical promotion/i.test(item.decision)));
});
