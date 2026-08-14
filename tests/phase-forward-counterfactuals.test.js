'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const phaseshift = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'phaseshift.json'), 'utf8'));
const artifact = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'phase-forward-counterfactuals.json'), 'utf8'));
const { buildCounterfactuals, validateCounterfactuals } = require('../scripts/build-phase-forward-counterfactuals.js');

test('phase-forward counterfactuals cover every market without claiming validation', () => {
  assert.equal(artifact.counterfactuals.length, phaseshift.markets.length);
  assert.equal(artifact.completionClaim, false);
  assert.deepEqual(validateCounterfactuals(phaseshift, artifact), []);
  for (const record of artifact.counterfactuals) {
    assert.equal(record.reassessmentRequired, true);
    assert.equal(record.buyerAuthority, 'UNPROVEN_UNTIL_EXTERNAL_RECEIPT');
    assert.equal(record.dataAccess, 'UNPROVEN_UNTIL_EXTERNAL_RECEIPT');
    assert.ok(record.valueThatMustSurvive.length > 0);
    assert.ok(record.killCondition.length > 20);
  }
});

test('phase-forward validation rejects a stale phase and false completion claim', () => {
  const tampered = structuredClone(buildCounterfactuals(phaseshift));
  tampered.completionClaim = true;
  tampered.counterfactuals[0].currentPhase = 'P9_COMMODITIZATION';
  const errors = validateCounterfactuals(phaseshift, tampered);
  assert.ok(errors.some(error => error.includes('cannot claim completion')));
  assert.ok(errors.some(error => error.includes('currentPhase mismatch')));
});
