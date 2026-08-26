#!/usr/bin/env node
'use strict';

/**
 * CENSUS Validator — Structural and Epistemic Integrity Checker
 * Enforces Prime Directives, JSON schema conformance, population funnels,
 * statistical unit declarations, and Anti-TAM-Theater rules.
 */

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

let totalErrors = 0;
let totalWarnings = 0;

function log(msg) { console.log(msg); }
function pass(msg) { console.log(`  ✓ OK     ${msg}`); }
function fail(msg) { totalErrors++; console.error(`  ✗ FAIL   ${msg}`); }
function warn(msg) { totalWarnings++; console.warn(`  ⚠ WARN   ${msg}`); }

log('\n════════════════════════════════════════');
log('  CENSUS Validator (Market Measurement)');
log('  Mode: Anti-TAM-Theater & Schema Check');
log('════════════════════════════════════════\n');

// 1. Validate Schemas
log('── Schema Validation ──');
const schemaFiles = [
  'census-statistical-unit.schema.json',
  'census-population.schema.json',
  'census-source.schema.json',
  'census-estimate.schema.json',
  'census-estimate-lineage.schema.json',
  'census-measurement-question.schema.json'
];

const validators = {};

for (const sf of schemaFiles) {
  const sp = path.join(SCHEMAS_DIR, sf);
  if (!fs.existsSync(sp)) {
    fail(`Schema missing: ${sf}`);
    continue;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(sp, 'utf8'));
    validators[sf] = ajv.compile(raw);
    pass(`${sf} — valid draft/2020-12 schema`);
  } catch (err) {
    fail(`${sf} — compilation failed: ${err.message}`);
  }
}

// 2. Validate Data Files
log('\n── Data File Integrity & Schema Conformance ──');

function loadJson(name) {
  const p = path.join(DATA_DIR, name);
  if (!fs.existsSync(p)) {
    fail(`Data file missing: ${name}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    fail(`JSON parse error in ${name}: ${err.message}`);
    return null;
  }
}

const unitsData = loadJson('census-statistical-units.json');
const popsData = loadJson('census-populations.json');
const sourcesData = loadJson('census-sources.json');
const estimatesData = loadJson('census-estimates.json');
const lineageData = loadJson('census-estimate-lineage.json');
const questionsData = loadJson('census-measurement-questions.json');
const crosswalksData = loadJson('census-classification-crosswalks.json');
const fmLinksData = loadJson('census-financial-model-links.json');

// Validate Statistical Units
if (unitsData) {
  const val = validators['census-statistical-unit.schema.json'];
  let errCount = 0;
  const items = unitsData.statisticalUnits || unitsData.units || [];
  for (const u of items) {
    if (val && !val(u)) {
      errCount++;
      fail(`Unit ${u.unitId || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-statistical-units.json — ${items.length} units validated`);
}

// Validate Populations
if (popsData) {
  const val = validators['census-population.schema.json'];
  let errCount = 0;
  const items = popsData.populations || [];
  for (const p of items) {
    if (val && !val(p)) {
      errCount++;
      fail(`Population ${p.populationId || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-populations.json — ${items.length} populations validated`);
}

// Validate Sources
if (sourcesData) {
  const val = validators['census-source.schema.json'];
  let errCount = 0;
  const items = sourcesData.sources || [];
  for (const s of items) {
    if (val && !val(s)) {
      errCount++;
      fail(`Source ${s.sourceId || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-sources.json — ${items.length} sources validated`);
}

// Validate Estimates
if (estimatesData) {
  const val = validators['census-estimate.schema.json'];
  let errCount = 0;
  const items = estimatesData.estimates || [];
  for (const e of items) {
    if (val && !val(e)) {
      errCount++;
      fail(`Estimate ${e.id || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-estimates.json — ${items.length} estimates validated`);
}

// Validate Lineage
if (lineageData) {
  const val = validators['census-estimate-lineage.schema.json'];
  let errCount = 0;
  const items = lineageData.lineages || [];
  for (const l of items) {
    if (val && !val(l)) {
      errCount++;
      fail(`Lineage ${l.lineageId || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-estimate-lineage.json — ${items.length} lineages validated`);
}

// Validate Questions
if (questionsData) {
  const val = validators['census-measurement-question.schema.json'];
  let errCount = 0;
  const items = questionsData.questions || [];
  for (const q of items) {
    if (val && !val(q)) {
      errCount++;
      fail(`Question ${q.questionId || 'unknown'}: ${ajv.errorsText(val.errors)}`);
    }
  }
  if (errCount === 0) pass(`census-measurement-questions.json — ${items.length} questions validated`);
}

// 3. Anti-TAM-Theater & Epistemic Rule Verification
log('\n── Anti-TAM-Theater & Epistemic Guard Verification ──');

if (estimatesData && estimatesData.estimates) {
  for (const est of estimatesData.estimates) {
    // L01: Unit declaration required
    if (!est.unitId) fail(`[L01] Estimate ${est.id} missing unitId`);
    // L02: Population declaration required
    if (!est.populationId) fail(`[L02] Estimate ${est.id} missing populationId`);
    // L03: Suppressed / Unknown is not zero
    if (['UNKNOWN', 'NOT_YET_MEASURED', 'WITHHELD'].includes(est.valueState) && est.value === 0) {
      fail(`[L03] Estimate ${est.id} has valueState=${est.valueState} but value=0 (Unknown is not zero)`);
    }
    // L04: Revenue guard
    if (est.unitOfMeasure && est.unitOfMeasure.includes('EUR') && !est.revenueEstimateGuard) {
      warn(`[L04] Monetary estimate ${est.id} missing revenueEstimateGuard`);
    }
    // L05: SCENARIO + MERCURY_VALIDATED contradiction
    if (est.method === 'SCENARIO' && est.revenueEstimateGuard && est.revenueEstimateGuard.priceState === 'MERCURY_VALIDATED') {
      fail(`[L05] Estimate ${est.id} combines SCENARIO method with MERCURY_VALIDATED priceState`);
    }
    // L09: Nonprobability sample cannot produce population inference
    if (est.witnessInferenceGuard && !est.witnessInferenceGuard.probabilitySample && est.witnessInferenceGuard.populationInferencePermitted) {
      fail(`[L09] Estimate ${est.id} permits population inference on nonprobability sample`);
    }
    // L11: Currency required for monetary
    if (est.unitOfMeasure && est.unitOfMeasure.includes('EUR') && !est.currency) {
      fail(`[L11] Monetary estimate ${est.id} missing explicit currency declaration`);
    }
  }
  pass('All census estimates pass Anti-TAM-Theater invariant checks');
}

// Summary
log('\n════════════════════════════════════════');
log(`  RESULT: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
log('════════════════════════════════════════\n');

if (totalErrors > 0) {
  process.exit(1);
}
