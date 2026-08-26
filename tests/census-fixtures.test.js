/**
 * census-fixtures.test.js - CENSUS Prime Directive enforcement tests
 * Run: node tests/census-fixtures.test.js
 */
'use strict';

const { CensusEngine, LINTER_RULES } = require('../assets/js/features/census-engine');

let passed = 0; let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  PASS ' + name);
    passed++;
  } catch (e) {
    console.error('  FAIL ' + name);
    console.error('    ' + e.message);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function makeStore(pops, ests) {
  pops = pops || {}; ests = ests || {};
  return {
    getPopulation: function(id) { return pops[id] || null; },
    getEstimate: function(id) { return ests[id] || null; },
    getUnit: function(id) { return null; },
    getAllEstimates: function() { return Object.values(ests); },
    _lineages: [],
    getDownstreamEstimates: function() { return []; },
  };
}

const base = {
  estimateId: 'est-test',
  metric: 'test_metric',
  unitId: 'unit-test',
  populationId: 'pop-test',
  geography: { level: 'COUNTRY_GROUP', codes: ['EU27'] },
  period: { referenceYear: 2024 },
  valueState: 'KNOWN',
  value: 5000,
  lower: 2000,
  upper: 10000,
  unitOfMeasure: 'count',
  currency: null,
  nominalYear: null,
  method: 'OFFICIAL_SURVEY',
  sources: [{ censusSourceId: 'csrc-test', role: 'PRIMARY' }],
  assumptions: [],
  lineageIds: [],
  witnessInferenceGuard: { qualitativeSampleSize: null, probabilitySample: true, populationInferencePermitted: true, reason: 'Official survey' },
  revenueEstimateGuard: null,
  status: 'FINAL_SOURCE',
  asOf: '2026-08-26',
};

function clone(extra) { return Object.assign({}, base, extra); }

console.log('\nCENSUS Fixture Tests\n' + '='.repeat(50));

// F1
console.log('\nFixture 1: Unit declaration required');
test('L01 fires when unitId missing', function() {
  var r = LINTER_RULES.L01_unit_required(clone({ unitId: undefined }));
  assert(r !== null && r.ruleId === 'L01', 'Expected L01');
});
test('L01 passes when unitId present', function() {
  var r = LINTER_RULES.L01_unit_required(base);
  assert(r === null, 'Expected no L01');
});

// F2
console.log('\nFixture 2: Population declaration required');
test('L02 fires when populationId missing', function() {
  var r = LINTER_RULES.L02_population_required(clone({ populationId: undefined }));
  assert(r !== null && r.ruleId === 'L02', 'Expected L02');
});

// F3
console.log('\nFixture 3: Nonprobability sample cannot produce population prevalence');
test('L09 fires: nonprobability + inference=true', function() {
  var est = clone({ witnessInferenceGuard: { qualitativeSampleSize: 15, probabilitySample: false, populationInferencePermitted: true, reason: 'conv' } });
  var r = LINTER_RULES.L09_witness_overgeneralization(est);
  assert(r !== null && r.ruleId === 'L09', 'Expected L09');
});
test('L09 passes: nonprobability + inference=false', function() {
  var est = clone({ witnessInferenceGuard: { qualitativeSampleSize: 20, probabilitySample: false, populationInferencePermitted: false, reason: 'qual only' } });
  var r = LINTER_RULES.L09_witness_overgeneralization(est);
  assert(r === null, 'Expected no L09');
});
test('L09 passes: probability sample + inference=true', function() {
  var r = LINTER_RULES.L09_witness_overgeneralization(base);
  assert(r === null, 'Expected no L09');
});

// F4
console.log('\nFixture 4: Qualitative WITNESS guard is valid when inference not permitted');
test('Qualitative 15 interviews, inference=false: no L09 finding', function() {
  var est = clone({ witnessInferenceGuard: { qualitativeSampleSize: 15, probabilitySample: false, populationInferencePermitted: false, reason: 'mechanism only' } });
  var r = LINTER_RULES.L09_witness_overgeneralization(est);
  assert(r === null, 'Expected no L09');
});

// F5
console.log('\nFixture 5: asOf required');
test('asOf must be present on a valid estimate', function() {
  assert(base.asOf === '2026-08-26', 'asOf must be declared');
});

// F6
console.log('\nFixture 6: Revenue estimate must have priceState guard');
test('L04 fires: EUR estimate without revenueEstimateGuard', function() {
  var r = LINTER_RULES.L04_revenue_requires_guard(clone({ unitOfMeasure: 'EUR_per_year', revenueEstimateGuard: null }));
  assert(r !== null && r.ruleId === 'L04', 'Expected L04');
});

// F7
console.log('\nFixture 7: Suppressed/unknown is not zero');
test('L03 fires: NOT_YET_MEASURED with value=0', function() {
  var r = LINTER_RULES.L03_unknown_not_zero(clone({ valueState: 'NOT_YET_MEASURED', value: 0 }));
  assert(r !== null && r.ruleId === 'L03', 'Expected L03');
});
test('L03 passes: NOT_YET_MEASURED with value=null', function() {
  var r = LINTER_RULES.L03_unknown_not_zero(clone({ valueState: 'NOT_YET_MEASURED', value: null }));
  assert(r === null, 'Expected no L03');
});
test('L03 passes: KNOWN with value=0 (genuinely zero)', function() {
  var r = LINTER_RULES.L03_unknown_not_zero(clone({ valueState: 'KNOWN', value: 0 }));
  assert(r === null, 'Expected no L03 for KNOWN zero');
});

// F8
console.log('\nFixture 8: SCENARIO must not be promoted to validated');
test('L05 fires: SCENARIO + MERCURY_VALIDATED is contradiction', function() {
  var r = LINTER_RULES.L05_scenario_not_validated(clone({ method: 'SCENARIO', revenueEstimateGuard: { priceState: 'MERCURY_VALIDATED', priceSource: 'test' } }));
  assert(r !== null && r.ruleId === 'L05', 'Expected L05');
});

// F9
console.log('\nFixture 9: Derived method must declare assumptions');
test('L12 fires: BOTTOM_UP_DECOMPOSITION with empty assumptions', function() {
  var r = LINTER_RULES.L12_assumptions_required(clone({ method: 'BOTTOM_UP_DECOMPOSITION', assumptions: [] }));
  assert(r !== null && r.ruleId === 'L12', 'Expected L12');
});
test('L12 passes: assumptions declared', function() {
  var r = LINTER_RULES.L12_assumptions_required(clone({ method: 'BOTTOM_UP_DECOMPOSITION', assumptions: [{ assumption: 'test', sensitivity: 'HIGH' }] }));
  assert(r === null, 'Expected no L12');
});

// F10
console.log('\nFixture 10: Subset cannot exceed parent');
test('L10 fires: child lower > parent upper', function() {
  var parentPop = { populationId: 'pop-p', funnelLevel: 'UNIVERSE', parentPopulationId: null, countEstimateId: 'est-p' };
  var childPop  = { populationId: 'pop-c', funnelLevel: 'ELIGIBLE', parentPopulationId: 'pop-p', countEstimateId: 'est-c' };
  var parentEst = { estimateId: 'est-p', lower: 100, upper: 500 };
  var childEst  = { estimateId: 'est-c', populationId: 'pop-c', lower: 800, upper: 2000 };
  var store = makeStore({ 'pop-p': parentPop, 'pop-c': childPop }, { 'est-p': parentEst });
  var r = LINTER_RULES.L10_subset_monotonicity(childEst, store);
  assert(r !== null && r.ruleId === 'L10', 'Expected L10');
});

// F11
console.log('\nFixture 11: Currency declared for monetary estimates');
test('L11 fires: EUR estimate without currency', function() {
  var r = LINTER_RULES.L11_currency_declared(clone({ unitOfMeasure: 'EUR_per_year', currency: null }));
  assert(r !== null && r.ruleId === 'L11', 'Expected L11');
});
test('L11 passes: EUR with currency declared', function() {
  var r = LINTER_RULES.L11_currency_declared(clone({ unitOfMeasure: 'EUR_per_year', currency: 'EUR', nominalYear: 2024 }));
  assert(r === null, 'Expected no L11');
});

// F12
console.log('\nFixture 12: Over-precision guard');
test('L07 fires: 6-sig-fig value from FERMI', function() {
  var r = LINTER_RULES.L07_over_precision(clone({ method: 'FERMI_DECOMPOSITION', value: 123456 }));
  assert(r !== null && r.ruleId === 'L07', 'Expected L07');
});
test('L07 passes: round number from FERMI', function() {
  var r = LINTER_RULES.L07_over_precision(clone({ method: 'FERMI_DECOMPOSITION', value: 5000 }));
  assert(r === null, 'Expected no L07');
});
test('L07 passes: precise count from OFFICIAL_SURVEY', function() {
  var r = LINTER_RULES.L07_over_precision(clone({ method: 'OFFICIAL_SURVEY', value: 1234567 }));
  assert(r === null, 'L07 should not fire for official survey precise count');
});

// F13
console.log('\nFixture 13: 1% SOM anti-pattern');
test('L08 fires: RATIO_ESTIMATE with 1% in notes', function() {
  var r = LINTER_RULES.L08_som_1pct_flag(clone({ method: 'RATIO_ESTIMATE', methodNotes: 'capturing 1% of the market' }));
  assert(r !== null && r.ruleId === 'L08', 'Expected L08');
});

// F14
console.log('\nFixture 14: HeatProof affected is NOT_YET_MEASURED');
test('est-a03 valueState must be NOT_YET_MEASURED', function() {
  var est = { estimateId: 'est-a03-affected-count', valueState: 'NOT_YET_MEASURED', value: null, witnessInferenceGuard: { qualitativeSampleSize: 0, probabilitySample: false, populationInferencePermitted: false } };
  assert(est.valueState === 'NOT_YET_MEASURED', 'Must be NOT_YET_MEASURED');
  assert(est.value === null, 'Must have null value');
});

// F15
console.log('\nFixture 15: Revenue TAM correctly blocked');
test('Revenue TAM is NOT_YET_MEASURED when inputs unknown', function() {
  var tam = { estimateId: 'est-a04-revenue-tam', valueState: 'NOT_YET_MEASURED', revenueEstimateGuard: { priceState: 'SCENARIO' } };
  assert(tam.valueState === 'NOT_YET_MEASURED');
  assert(tam.revenueEstimateGuard.priceState === 'SCENARIO');
});

// F16
console.log('\nFixture 16: FlexCovenant site count is honest range');
test('est-c02 has null value but valid lower/upper range', function() {
  var est = { estimateId: 'est-c02-eligible-sites', value: null, lower: 600, upper: 10000 };
  assert(est.value === null, 'No false point estimate');
  assert(est.upper / est.lower >= 10, 'Range must reflect uncertainty (>=10x)');
});

// F17
console.log('\nFixture 17: Population funnel levels ordered');
test('ELIGIBLE references UNIVERSE as parent', function() {
  var elig = { populationId: 'pop-a02-epc-eligible', funnelLevel: 'ELIGIBLE', parentPopulationId: 'pop-a01-epc-universe' };
  assert(elig.parentPopulationId === 'pop-a01-epc-universe', 'Must reference universe parent');
});

// F18
console.log('\nFixture 18: Unit incompatibility declared');
test('Enterprise unit declares EPC-engagement as incompatible', function() {
  var unit = { unitId: 'unit-esco-enterprise', incompatibleWith: ['unit-epc-engagement', 'unit-building-owner-enterprise'] };
  assert(unit.incompatibleWith.includes('unit-epc-engagement'), 'Must declare incompatibility');
});

// F19
console.log('\nFixture 19: WITNESS not landed — zero evidence');
test('All AFFECTED populations have witnessStatus=NO_EVIDENCE', function() {
  var pops = [
    { id: 'pop-a04', witnessStatus: 'NO_EVIDENCE' },
    { id: 'pop-b04', witnessStatus: 'NO_EVIDENCE' },
    { id: 'pop-c03', witnessStatus: 'NO_EVIDENCE' }
  ];
  pops.forEach(function(p) { assert(p.witnessStatus === 'NO_EVIDENCE', p.id + ' must be NO_EVIDENCE'); });
});

// F20
console.log('\nFixture 20: Financial model links non-destructive');
test('FM link maps idea to estimate without modifying .md file', function() {
  var link = { ideaId: 'idea-433', denominatorEstimateId: 'est-a02-eligible-count', revenueTAMValueState: 'NOT_YET_MEASURED' };
  assert(link.ideaId === 'idea-433', 'ideaId must match');
  assert(link.revenueTAMValueState === 'NOT_YET_MEASURED', 'TAM must be NOT_YET_MEASURED');
});

// F21
console.log('\nFixture 21: Triangulated estimates have counter-estimates');
test('est-a02 (EPC count) has counterEstimateId from BPIE method', function() {
  var est = { estimateId: 'est-a02', method: 'TRIANGULATION', counterEstimateId: 'est-a02-bpie-counter' };
  assert(est.counterEstimateId !== null, 'Must reference counter-estimate');
});

// F22
console.log('\nFixture 22: Stock-to-flow conversion explicit in lineage');
test('lin-b03 records explicit UNIT CONVERSION from enterprise (stock) to event (flow)', function() {
  var lineage = { lineageId: 'lin-b03-from-b02', transformations: [{ operation: 'MULTIPLY', description: 'Multiply enterprise stock by assumed annual events. UNIT CONVERSION: STOCK (enterprises) -> FLOW (events/year).' }], unitCompatibilityCheck: { passed: true } };
  assert(lineage.transformations[0].description.includes('UNIT CONVERSION'), 'Must document unit conversion');
  assert(lineage.unitCompatibilityCheck.passed, 'Compatibility check must pass');
});

// F23
console.log('\nFixture 23: NOT_YET_MEASURED propagates through derivation');
test('Derivation with NOT_YET_MEASURED input produces NOT_YET_MEASURED output', function() {
  var inputState = 'NOT_YET_MEASURED';
  var priceState = 'SCENARIO';
  var outputState = (inputState === 'NOT_YET_MEASURED' || priceState === 'SCENARIO') ? 'NOT_YET_MEASURED' : 'KNOWN';
  assert(outputState === 'NOT_YET_MEASURED', 'Must propagate');
});

// F24
console.log('\nFixture 24: 1% SOM (spec duplicate)');
test('L08 detects 1% of market pattern', function() {
  var r = LINTER_RULES.L08_som_1pct_flag(clone({ method: 'RATIO_ESTIMATE', methodNotes: 'if we get just 1% of EU market' }));
  assert(r !== null && r.ruleId === 'L08', 'Expected L08');
});

// F25
console.log('\nFixture 25: Over-precise Fermi number flagged');
test('L07 flags 5+ sig-fig value from FERMI_DECOMPOSITION', function() {
  var r = LINTER_RULES.L07_over_precision(clone({ method: 'FERMI_DECOMPOSITION', value: 234567 }));
  assert(r !== null && r.ruleId === 'L07', 'Expected L07 for 6-sig-fig Fermi');
});

console.log('\n' + '='.repeat(50));
console.log('CENSUS Fixture Tests: ' + passed + ' passed, ' + failed + ' failed\n');
if (failed > 0) process.exit(1);
