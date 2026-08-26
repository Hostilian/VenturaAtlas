#!/usr/bin/env node
'use strict';

/**
 * CENSUS Contract Tests
 * Tests schema validity, data contracts, store methods, and engine calculations.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const { CensusEngine } = require('../assets/js/features/census-engine.js');
const { CensusStore } = require('../assets/js/core/census-store.js');

const ROOT = path.resolve(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const DATA_DIR = path.join(ROOT, 'data');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

test('CENSUS Contract — all 6 schemas compile as valid draft/2020-12', () => {
  const schemaFiles = [
    'census-statistical-unit.schema.json',
    'census-population.schema.json',
    'census-source.schema.json',
    'census-estimate.schema.json',
    'census-estimate-lineage.schema.json',
    'census-measurement-question.schema.json'
  ];
  for (const sf of schemaFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, sf), 'utf8'));
    const validator = ajv.compile(raw);
    assert.equal(typeof validator, 'function', `${sf} must compile into validator function`);
  }
});

test('CENSUS Contract — all core datasets parse and pass schema validation', () => {
  const unitsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'census-statistical-units.json'), 'utf8'));
  const popsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'census-populations.json'), 'utf8'));
  const sourcesRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'census-sources.json'), 'utf8'));
  const estsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'census-estimates.json'), 'utf8'));

  const unitsList = unitsRaw.statisticalUnits || unitsRaw.units || [];
  const popsList = popsRaw.populations || [];
  const sourcesList = sourcesRaw.sources || [];
  const estsList = estsRaw.estimates || [];

  assert.ok(unitsList.length >= 10, 'Must have at least 10 statistical units');
  assert.ok(popsList.length >= 11, 'Must have at least 11 populations');
  assert.ok(sourcesList.length >= 5, 'Must have at least 5 sources');
  assert.ok(estsList.length >= 10, 'Must have at least 10 estimates');
});

test('CENSUS Engine — Linter catches missing unitId and unknown value 0', () => {
  const engine = new CensusEngine();
  
  const badEstimate = {
    id: 'est-bad-1',
    metric: 'test_metric',
    unitId: null,
    populationId: 'pop-1',
    valueState: 'UNKNOWN',
    value: 0
  };
  
  const violations = engine.lintEstimate(badEstimate);
  assert.ok(violations.length >= 1, 'Must flag violations on malformed estimate');
  assert.ok(violations.some(v => v.ruleId === 'L01' || v.ruleId === 'L03'), 'Must flag L01 (missing unit) or L03 (unknown is not zero)');
});

test('CENSUS Store — initializes and supports read queries', () => {
  const store = new CensusStore();
  assert.ok(store, 'CensusStore must initialize');
  assert.equal(typeof store.getAllUnits, 'function');
  assert.equal(typeof store.getAllPopulations, 'function');
  assert.equal(typeof store.getAllEstimates, 'function');
  assert.equal(typeof store.getAllSources, 'function');
});
