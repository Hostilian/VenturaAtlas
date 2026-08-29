/**
 * census-engine.js - CENSUS computation engine + Anti-TAM-theater linter
 */
'use strict';

const LINTER_RULES = {

  L01_unit_required: function(estimate) {
    if (!estimate.unitId) {
      return { ruleId: 'L01', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ' has no unitId. No market number without a statistical unit.' };
    }
    return null;
  },

  L02_population_required: function(estimate) {
    if (!estimate.populationId) {
      return { ruleId: 'L02', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ' has no populationId. No denominator without a population definition.' };
    }
    return null;
  },

  L03_unknown_not_zero: function(estimate) {
    var unknownStates = ['UNKNOWN', 'NOT_YET_MEASURED', 'WITHHELD', 'UNAVAILABLE'];
    if (unknownStates.indexOf(estimate.valueState) !== -1 && estimate.value === 0) {
      return { ruleId: 'L03', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': valueState=' + estimate.valueState + ' but value=0. UNKNOWN is not zero.' };
    }
    return null;
  },

  L04_revenue_requires_guard: function(estimate) {
    if (estimate.unitOfMeasure && estimate.unitOfMeasure.indexOf('EUR') !== -1 && !estimate.revenueEstimateGuard) {
      return { ruleId: 'L04', severity: 'WARNING', message: 'Estimate ' + estimate.estimateId + ' appears monetary (' + estimate.unitOfMeasure + ') but has no revenueEstimateGuard. Mercury must validate price.' };
    }
    return null;
  },

  L05_scenario_not_validated: function(estimate) {
    if (estimate.method === 'SCENARIO' && estimate.revenueEstimateGuard && estimate.revenueEstimateGuard.priceState === 'MERCURY_VALIDATED') {
      return { ruleId: 'L05', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': method=SCENARIO but priceState=MERCURY_VALIDATED. Scenarios cannot be validated.' };
    }
    return null;
  },

  L06_affected_requires_witness_guard: function(estimate, store) {
    var pop = store ? store.getPopulation(estimate.populationId) : null;
    var affectedLevels = ['AFFECTED', 'SEVERE_AFFECTED'];
    if (pop && affectedLevels.indexOf(pop.funnelLevel) !== -1 && estimate.valueState === 'KNOWN') {
      var guard = estimate.witnessInferenceGuard;
      if (!guard) {
        return { ruleId: 'L06', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ' claims KNOWN for AFFECTED population but has no witnessInferenceGuard.' };
      }
      if (!guard.probabilitySample && guard.populationInferencePermitted) {
        return { ruleId: 'L06', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': nonprobability sample cannot produce population prevalence CI. See Fixture 3.' };
      }
    }
    return null;
  },

  L07_over_precision: function(estimate) {
    var precisionMethods = ['DIRECT_COUNT', 'CENSUS_DATA', 'ADMINISTRATIVE_COUNT', 'PROBABILITY_SAMPLE', 'OFFICIAL_SURVEY'];
    if (estimate.value !== null && estimate.value !== undefined && precisionMethods.indexOf(estimate.method) === -1) {
      var str = String(Math.abs(estimate.value)).replace('.', '').replace(/0+$/, '');
      if (str.length > 3) {
        return { ruleId: 'L07', severity: 'WARNING', message: 'Estimate ' + estimate.estimateId + ': value=' + estimate.value + ' has ' + str.length + ' significant figures but method=' + estimate.method + '. Round to 2-3 significant figures.' };
      }
    }
    return null;
  },

  L08_som_1pct_flag: function(estimate) {
    if (estimate.method === 'RATIO_ESTIMATE' && estimate.methodNotes && estimate.methodNotes.toLowerCase().indexOf('1%') !== -1) {
      return { ruleId: 'L08', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': contains 1% in a RATIO_ESTIMATE. 1% of the market is not a market sizing method.' };
    }
    return null;
  },

  L09_witness_overgeneralization: function(estimate) {
    var guard = estimate.witnessInferenceGuard;
    if (!guard) return null;
    if (!guard.probabilitySample && guard.populationInferencePermitted === true) {
      return { ruleId: 'L09', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': populationInferencePermitted=true but probabilitySample=false. Convenience/qualitative samples cannot be generalized to population prevalence.' };
    }
    return null;
  },

  L10_subset_monotonicity: function(estimate, store) {
    if (!store) return null;
    var pop = store.getPopulation(estimate.populationId);
    if (!pop || !pop.parentPopulationId) return null;
    var parentPop = store.getPopulation(pop.parentPopulationId);
    if (!parentPop || !parentPop.countEstimateId) return null;
    var parentEst = store.getEstimate(parentPop.countEstimateId);
    if (!parentEst) return null;
    if (estimate.lower !== null && estimate.lower !== undefined && parentEst.upper !== null && estimate.lower > parentEst.upper) {
      return { ruleId: 'L10', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': lower=' + estimate.lower + ' exceeds parent population upper=' + parentEst.upper + '. Subset cannot exceed parent.' };
    }
    return null;
  },

  L11_currency_declared: function(estimate) {
    if (estimate.unitOfMeasure && estimate.unitOfMeasure.indexOf('EUR') === 0) {
      if (!estimate.currency) {
        return { ruleId: 'L11', severity: 'ERROR', message: 'Estimate ' + estimate.estimateId + ': monetary estimate but no currency declared.' };
      }
      if (!estimate.nominalYear) {
        return { ruleId: 'L11', severity: 'WARNING', message: 'Estimate ' + estimate.estimateId + ': monetary estimate but no nominalYear declared.' };
      }
    }
    return null;
  },

  L12_assumptions_required: function(estimate) {
    var derivedMethods = ['RATIO_ESTIMATE','BENCHMARK_RATE_APPLICATION','PROXY_ESTIMATE','ANALOGY_ESTIMATE','BOTTOM_UP_DECOMPOSITION','TOP_DOWN_FILTERING','FERMI_DECOMPOSITION','TRIANGULATION','SCENARIO'];
    if (derivedMethods.indexOf(estimate.method) !== -1 && (!estimate.assumptions || estimate.assumptions.length === 0)) {
      return { ruleId: 'L12', severity: 'WARNING', message: 'Estimate ' + estimate.estimateId + ': method=' + estimate.method + ' is derived but has no assumptions listed.' };
    }
    return null;
  },
};

function CensusEngine(store) {
  this._store = store;
}

CensusEngine.prototype.lintEstimate = function(estimate) {
  var findings = [];
  var store = this._store;
  var rules = LINTER_RULES;
  for (var key in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, key)) {
      var finding = rules[key](estimate, store);
      if (finding) findings.push(finding);
    }
  }
  return findings;
};

CensusEngine.prototype.lintAll = function() {
  var estimates = this._store.getAllEstimates();
  var all = [];
  var self = this;
  estimates.forEach(function(e) {
    var findings = self.lintEstimate(e);
    findings.forEach(function(f) { all.push(Object.assign({}, f, { estimateId: e.estimateId })); });
  });
  return {
    totalEstimates: estimates.length,
    errorCount: all.filter(function(f) { return f.severity === 'ERROR'; }).length,
    warningCount: all.filter(function(f) { return f.severity === 'WARNING'; }).length,
    findings: all,
  };
};

CensusEngine.prototype.buildFunnelSummary = function(leafPopulationId) {
  var chain = this._store.getPopulationFunnel ? this._store.getPopulationFunnel(leafPopulationId) : [];
  var store = this._store;
  return chain.map(function(pop) {
    var estimate = pop.countEstimateId ? store.getEstimate(pop.countEstimateId) : null;
    return {
      populationId: pop.populationId,
      name: pop.name,
      funnelLevel: pop.funnelLevel,
      valueState: pop.valueState,
      lower: estimate ? estimate.lower : null,
      upper: estimate ? estimate.upper : null,
      witnessStatus: pop.witnessStatus,
    };
  });
};

CensusEngine.prototype.reviewVenture = function(ideaId) {
  var link = this._store.getLinkForIdea ? this._store.getLinkForIdea(ideaId) : null;
  if (!link) return { passed: false, errors: ['No CENSUS link found for ' + ideaId] };

  var errors = [];
  var warnings = [];

  if (link.revenueTAMEstimateId) {
    var tamEst = this._store.getEstimate(link.revenueTAMEstimateId);
    if (tamEst && tamEst.valueState === 'KNOWN') {
      if (!tamEst.revenueEstimateGuard || tamEst.revenueEstimateGuard.priceState !== 'MERCURY_VALIDATED') {
        errors.push('TAM-THEATER: Revenue TAM for ' + ideaId + ' is KNOWN but price is not MERCURY_VALIDATED.');
      }
    }
  }

  if (!link.denominatorEstimateId) {
    errors.push('NO-DENOMINATOR: ' + ideaId + ' has no denominatorEstimateId.');
  }

  if (link.addressablePopulationValueState === 'NOT_YET_MEASURED') {
    warnings.push('NOT-YET-MEASURED: Addressable population for ' + ideaId + ' is NOT_YET_MEASURED.');
  }

  return { ideaId: ideaId, passed: errors.length === 0, errors: errors, warnings: warnings, link: link };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CensusEngine: CensusEngine, LINTER_RULES: LINTER_RULES };
} else {
  window.CensusEngine = CensusEngine;
  window.CENSUS_LINTER_RULES = LINTER_RULES;
}
