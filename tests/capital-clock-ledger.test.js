const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCapitalClockLedger } = require('../scripts/validate-capital-clock-ledger');

const sources = [{ id: 's1' }];
const program = { schemaVersion: '1.0.0', programs: [{ capitalProgramId: 'cap-example', name: 'Example', capitalType: 'GRANT', headlineAmount: null, contestableAmount: null, currentlyAvailableAmount: null, currency: 'EUR', status: 'CALL_OPEN', eligibleActors: [], sourceRefs: ['s1'], checkedAt: '2026-08-17T12:00:00Z', confidence: 'HIGH' }] };

test('Capital Clock ledger accepts unknown amounts and open clocks', () => {
  const clocks = { schemaVersion: '1.0.0', clocks: [{ clockId: 'clock-example', programId: 'cap-example', clockType: 'APPLICATION_CLOCK', startsAt: null, expiresAt: null, state: 'UNKNOWN', requiredObjects: [], failureEffect: 'unknown', sourceRefs: ['s1'], checkedAt: '2026-08-17T12:00:00Z', confidence: 'HIGH' }] };
  assert.deepEqual(validateCapitalClockLedger(program, clocks, sources), []);
});

test('Capital Clock ledger rejects an expired label with a future deadline', () => {
  const clocks = { schemaVersion: '1.0.0', clocks: [{ clockId: 'clock-example', programId: 'cap-example', clockType: 'APPLICATION_CLOCK', startsAt: null, expiresAt: '2026-09-17T23:59:59Z', state: 'EXPIRED', requiredObjects: [], failureEffect: 'unknown', sourceRefs: ['s1'], checkedAt: '2026-08-17T12:00:00Z', confidence: 'HIGH' }] };
  assert.match(validateCapitalClockLedger(program, clocks, sources)[0], /EXPIRED/);
});

test('Capital Clock ledger rejects a clock for an unknown program', () => {
  const clocks = { schemaVersion: '1.0.0', clocks: [{ clockId: 'clock-example', programId: 'cap-missing', clockType: 'APPLICATION_CLOCK', startsAt: null, expiresAt: null, state: 'UNKNOWN', requiredObjects: [], failureEffect: 'unknown', sourceRefs: [], checkedAt: '2026-08-17T12:00:00Z', confidence: 'UNKNOWN' }] };
  assert.match(validateCapitalClockLedger(program, clocks, sources)[0], /unknown program/);
});
