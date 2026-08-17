const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCapitalClock } = require('../scripts/validate-capital-clock');

const base = {
  schemaVersion: '1.0.0',
  records: [{
    ideaId: 'idea-001', recommendedAction: 'WATCH_TRIGGER', buyerActivation: 'UNKNOWN', budgetMaturity: 'UNKNOWN',
    purchaseEventEvidence: 'UNKNOWN', capitalIntensity: 'UNKNOWN', subsidyDistortionRisk: 'UNKNOWN', optionValue: 'WATCH', evidenceStatus: 'UNKNOWN'
  }]
};

test('Capital Clock accepts an explicit unknown-first record', () => {
  assert.deepEqual(validateCapitalClock(base, [{ id: 'idea-001' }], []), []);
});

test('Capital Clock rejects SELL_NOW without purchase evidence', () => {
  const record = { ...base.records[0], recommendedAction: 'SELL_NOW' };
  assert.match(validateCapitalClock({ ...base, records: [record] }, [{ id: 'idea-001' }], [])[0], /SELL_NOW/);
});

test('Capital Clock rejects unknown source references', () => {
  const record = { ...base.records[0], sourceIds: ['s-not-real'] };
  assert.match(validateCapitalClock({ ...base, records: [record] }, [{ id: 'idea-001' }], [])[0], /unknown source/);
});
