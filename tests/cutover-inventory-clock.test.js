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
  const queue = read('data/idea-staging-queue.json');
  const names = new Set(['attestready-amr-export-inventory-certificate-preflight', 'steellandedrisk-steel-quota-tariff-cliff-preflight', 'microifud-synthetic-polymer-product-ifu-consistency-audit']);
  const records = queue.filter(item => names.has(item.candidateSlug));
  assert.equal(records.length, 3);
  assert.ok(records.every(item => item.promotionEligible === false && item.atAGlance.overallScore === null));
});
