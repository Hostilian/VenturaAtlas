/**
 * VenturaAtlas ORBIT — Portfolio Engine
 * Pure deterministic functions for venture portfolio reasoning.
 * No DOM, no fetch, no side effects. All functions are pure or near-pure.
 *
 * Core principle: expose assumptions, never hide decisions behind "AI calculated optimal portfolio."
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// COMMITMENT LEVEL LABELS
// ─────────────────────────────────────────────────────────────────────────────

const COMMITMENT_LEVELS = [
  { level: 0, label: 'WATCH',                  shortLabel: 'Watch' },
  { level: 1, label: 'RESEARCH_PROBE',          shortLabel: 'Research' },
  { level: 2, label: 'MANUAL_TEST',             shortLabel: 'Manual Test' },
  { level: 3, label: 'MICRO_PROTOTYPE',         shortLabel: 'Prototype' },
  { level: 4, label: 'CUSTOMER_PILOT',          shortLabel: 'Pilot' },
  { level: 5, label: 'REPEATABLE_VALIDATION',   shortLabel: 'Validation' },
  { level: 6, label: 'MVP',                     shortLabel: 'MVP' },
  { level: 7, label: 'COMMERCIAL_LAUNCH',       shortLabel: 'Launch' },
  { level: 8, label: 'SCALE',                   shortLabel: 'Scale' }
];

const REVERSIBILITY_RANK = {
  HIGHLY_REVERSIBLE:       0,
  REVERSIBLE:              1,
  PARTIALLY_REVERSIBLE:    2,
  EXPENSIVE_TO_REVERSE:    3,
  IRREVERSIBLE:            4
};

const STRATEGIC_ROLE_DESCRIPTIONS = {
  TERMINAL:            'End-goal opportunity — final destination.',
  STEPPING_STONE:      'Primarily valuable for what it enables next.',
  BEACHHEAD:           'Entry point into a market segment for later expansion.',
  CAPABILITY_BUILDER:  'Worth doing primarily for the skill/capability learned.',
  DISTRIBUTION_BUILDER:'Creates access to buyers for subsequent products.',
  DATA_BUILDER:        'Generates proprietary data that compounds over time.',
  CASHFLOW_BRIDGE:     'Generates early cash while preserving long-term bets.',
  MOONSHOT:            'High uncertainty, high convexity — small probe justified.',
  PLATFORM_SEED:       'Creates shared infrastructure for multiple future ventures.'
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE / RUNWAY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute portfolio runway given envelope and allocated bets.
 * Returns conservative and optimistic estimates.
 */
function buildResourceSummary(envelope, bets = []) {
  const totalHoursCommitted = bets.reduce((s, b) => {
    const lo = (b._timeHoursLow || 0);
    const hi = (b._timeHoursHigh || b._timeHoursLow || 0);
    return s + (lo + hi) / 2;
  }, 0);

  const totalCapitalCommittedLow  = bets.reduce((s, b) => s + (b._costLow || 0), 0);
  const totalCapitalCommittedHigh = bets.reduce((s, b) => s + (b._costHigh || 0), 0);

  const availableHours   = (envelope.hoursPerWeek || 0);
  const availableCash    = (envelope.availableCash || 0);
  const burnCeiling      = (envelope.monthlyBurnCeiling || availableCash);

  const reserveFraction  = (envelope.reserveFraction || 0.2);
  const committableHours = availableHours * (1 - reserveFraction);
  const committableCash  = availableCash  * (1 - reserveFraction);

  const hoursUtilization  = availableHours > 0 ? totalHoursCommitted / committableHours : null;
  const cashUtilizationLo = committableCash > 0 ? totalCapitalCommittedLow  / committableCash : null;
  const cashUtilizationHi = committableCash > 0 ? totalCapitalCommittedHigh / committableCash : null;

  const runwayMonths = burnCeiling > 0 ? availableCash / burnCeiling : null;

  return {
    availableHoursPerWeek:     availableHours,
    committableHoursPerWeek:   committableHours,
    reservedHoursPerWeek:      availableHours * reserveFraction,
    totalHoursCommitted,
    hoursUtilization,
    hoursOverallocated:        hoursUtilization !== null && hoursUtilization > 1.0,

    availableCash,
    committableCash,
    totalCapitalCommittedLow,
    totalCapitalCommittedHigh,
    cashUtilizationLo,
    cashUtilizationHi,
    cashOverallocated:         cashUtilizationHi !== null && cashUtilizationHi > 1.0,

    runwayMonths,
    runwayWarning:             runwayMonths !== null && runwayMonths < 3,

    activeCount:               bets.filter(b => b.portfolioRole === 'ACTIVE').length,
    maxActiveBets:             envelope.maxActiveBets || Infinity,
    wipOverLimit:              (envelope.maxActiveBets || Infinity) < bets.filter(b => b.portfolioRole === 'ACTIVE').length
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTENTION LOAD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimate cognitive attention load of a bet combination.
 * Three unrelated 10-hour bets may impose greater burden than one 30-hour bet.
 * Returns a qualitative band with rationale.
 */
function estimateAttentionLoad(bets, ideas) {
  const active = bets.filter(b => b.portfolioRole === 'ACTIVE');
  if (active.length === 0) return { band: 'low', score: 0, rationale: 'No active bets.' };

  const ideaMap = {};
  (ideas || []).forEach(i => { ideaMap[i.id] = i; });

  // Context-switch penalty: count unique categories among active bets
  const categories = new Set();
  active.forEach(b => {
    const idea = ideaMap[b.ideaId];
    if (idea && idea.category) categories.add(idea.category);
  });

  const contextSwitches = Math.max(0, categories.size - 1);
  const baseLoad = active.length;
  const switchPenalty = contextSwitches * 0.5;
  const score = baseLoad + switchPenalty;

  let band, rationale;
  if (score <= 1.5) {
    band = 'low';
    rationale = `${active.length} active bet(s) in ${categories.size} category. Low context-switching overhead.`;
  } else if (score <= 3.0) {
    band = 'medium';
    rationale = `${active.length} active bets across ${categories.size} categories. Moderate context-switch cost — schedule distinct focus blocks.`;
  } else {
    band = 'high';
    rationale = `${active.length} active bets across ${categories.size} categories. High cognitive fragmentation. Consider reducing active bets or consolidating categories.`;
  }

  return { band, score: Math.round(score * 10) / 10, contextSwitches, rationale };
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK CONCENTRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect portfolio risk concentration.
 * Returns a matrix of {riskFactorId, exposedBetCount, exposedBetIds, concentrationLevel}
 * Two ideas sharing a factor are not independent bets.
 */
function detectRiskConcentration(bets, riskFactors) {
  const betIds = bets.map(b => b.betId || b.ideaId);
  const ideaIds = bets.map(b => b.ideaId);

  return riskFactors.map(rf => {
    const exposed = bets.filter(b => ideaIds.includes(b.ideaId) && (rf.exposedIdeaIds || []).includes(b.ideaId));
    const count = exposed.length;
    const total = bets.length;

    let level;
    if (count === 0) level = 'none';
    else if (count / total > 0.6) level = 'high';
    else if (count / total > 0.3) level = 'medium';
    else level = 'low';

    return {
      riskFactorId:       rf.riskFactorId,
      name:               rf.name,
      category:           rf.category,
      exposedBetCount:    count,
      totalBets:          total,
      exposedIdeaIds:     exposed.map(b => b.ideaId),
      concentrationLevel: level,
      portfolioImplication: rf.portfolioImplication || '',
      syntheticNote:      rf.syntheticNote || ''
    };
  }).filter(r => r.concentrationLevel !== 'none');
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNERGIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect positive synergies between bets: shared assets, buyer overlap, primitives.
 * Distinct from risk correlation — synergy correlation is good.
 */
function detectSynergies(bets, strategicAssets, ideas) {
  const ideaMap = {};
  (ideas || []).forEach(i => { ideaMap[i.id] = i; });

  const synergies = [];
  const ideaIds = bets.map(b => b.ideaId);

  // 1. Shared strategic assets
  (strategicAssets || []).forEach(asset => {
    const benefiting = ideaIds.filter(id => (asset.linkedIdeaIds || []).includes(id));
    if (benefiting.length >= 2) {
      synergies.push({
        type: 'shared_asset',
        assetId: asset.assetId,
        assetName: asset.name,
        assetType: asset.type,
        benefitingIdeaIds: benefiting,
        description: `Asset "${asset.name}" benefits ${benefiting.length} bets in this portfolio. Building it once creates shared value.`,
        compoundsOverTime: asset.compoundsOverTime
      });
    }
  });

  // 2. Shared buyer category (from idea.atAGlance.targetCustomer)
  const buyerGroups = {};
  bets.forEach(b => {
    const idea = ideaMap[b.ideaId];
    if (idea && idea.atAGlance && idea.atAGlance.targetCustomer) {
      const buyer = idea.atAGlance.targetCustomer;
      if (!buyerGroups[buyer]) buyerGroups[buyer] = [];
      buyerGroups[buyer].push(b.ideaId);
    }
  });
  Object.entries(buyerGroups).forEach(([buyer, ids]) => {
    if (ids.length >= 2) {
      synergies.push({
        type: 'shared_buyer',
        buyer,
        ideaIds: ids,
        description: `${ids.length} bets target the same buyer segment "${buyer}". Relationships and conversations can be shared.`
      });
    }
  });

  // 3. Shared category (reuse domain knowledge)
  const catGroups = {};
  bets.forEach(b => {
    const idea = ideaMap[b.ideaId];
    if (idea && idea.category) {
      if (!catGroups[idea.category]) catGroups[idea.category] = [];
      catGroups[idea.category].push(b.ideaId);
    }
  });
  Object.entries(catGroups).forEach(([cat, ids]) => {
    if (ids.length >= 2) {
      synergies.push({
        type: 'shared_domain_knowledge',
        category: cat,
        ideaIds: ids,
        description: `${ids.length} bets share the "${cat}" domain. Research, regulatory knowledge, and contacts accumulate together.`
      });
    }
  });

  return synergies;
}

// ─────────────────────────────────────────────────────────────────────────────
// INFORMATION VALUE RANKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rank bets by expected information value.
 * Prefer bets that:
 *  - resolve high-value uncertainty
 *  - update many other portfolio bets (cross-portfolio reach)
 *  - are low-cost to execute
 *  - are highly reversible (cheap to stop if learning arrives early)
 */
function rankByInformationValue(bets) {
  const BAND_SCORE = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1, UNKNOWN: 2 };
  const REV_BONUS = { HIGHLY_REVERSIBLE: 2, REVERSIBLE: 1, PARTIALLY_REVERSIBLE: 0, EXPENSIVE_TO_REVERSE: -1, IRREVERSIBLE: -2 };

  return bets
    .map(bet => {
      const iv = bet._informationValue || {};
      const valueBandScore = BAND_SCORE[iv.valueBand] || 2;
      const reachScore = Math.min(5, (iv.crossPortfolioReach || 0));
      const revScore = REV_BONUS[bet.reversibility] || 0;

      // Cost penalty: higher cost = lower info-per-dollar unless explicitly high value
      const cost = bet._cost || {};
      const costToLearn = cost.minimumToLearn || cost.toTest || 0;
      const costPenalty = costToLearn > 1000 ? -2 : costToLearn > 300 ? -1 : 0;

      const ivScore = valueBandScore + reachScore + revScore + costPenalty;

      return {
        betId:    bet.betId,
        ideaId:   bet.ideaId,
        title:    bet.title || bet.betId,
        ivScore,
        valueBand:         iv.valueBand || 'UNKNOWN',
        crossPortfolioReach: iv.crossPortfolioReach || 0,
        primaryQuestion:   iv.primaryQuestion || '',
        reversibility:     bet.reversibility,
        costToLearn
      };
    })
    .sort((a, b) => b.ivScore - a.ivScore);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEQUENCE GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a recommended venture sequence via topological sort.
 * Respects dependencies. Prefers reversible bets earlier.
 * Returns steps with: NOW / NEXT / IF_SUCCESS / IF_FAILURE branches.
 */
function generateSequence(bets) {
  if (!bets || bets.length === 0) return [];

  // Build adjacency for dependency ordering
  const betMap = {};
  bets.forEach(b => { betMap[b.betId] = b; });

  // Kahn's algorithm (topological sort by dependency)
  const inDegree = {};
  bets.forEach(b => { inDegree[b.betId] = 0; });
  bets.forEach(b => {
    (b.dependsOnBetIds || []).forEach(dep => {
      if (inDegree[b.betId] !== undefined) inDegree[b.betId]++;
    });
  });

  // Among bets with equal dependency satisfaction, prefer: more reversible, lower commitment
  const queue = bets
    .filter(b => inDegree[b.betId] === 0)
    .sort((a, b) => {
      const revDiff = (REVERSIBILITY_RANK[a.reversibility] || 0) - (REVERSIBILITY_RANK[b.reversibility] || 0);
      if (revDiff !== 0) return revDiff;
      return (a.commitmentLevel || 0) - (b.commitmentLevel || 0);
    });

  const ordered = [];
  const visited = new Set();

  while (queue.length > 0) {
    const bet = queue.shift();
    if (visited.has(bet.betId)) continue;
    visited.add(bet.betId);
    ordered.push(bet);

    // Find bets that unlock after this one
    bets.forEach(b => {
      if ((b.dependsOnBetIds || []).includes(bet.betId)) {
        inDegree[b.betId]--;
        if (inDegree[b.betId] === 0 && !visited.has(b.betId)) {
          queue.push(b);
        }
      }
    });
  }

  // Add any not yet visited (no dependencies declared)
  bets.forEach(b => {
    if (!visited.has(b.betId)) ordered.push(b);
  });

  // Build sequence steps
  return ordered.map((bet, idx) => {
    const successUnlocks = (bet.unlocksAfterSuccess || [])
      .map(id => betMap[id])
      .filter(Boolean)
      .map(b => ({ betId: b.betId, title: b.title || b.betId, commitmentLevel: b.commitmentLevel }));

    return {
      step:              idx + 1,
      horizonLabel:      idx === 0 ? 'NOW' : idx === 1 ? 'NEXT' : `LATER (step ${idx + 1})`,
      betId:             bet.betId,
      ideaId:            bet.ideaId,
      title:             bet.title || bet.betId,
      commitmentLevel:   bet.commitmentLevel,
      commitmentLabel:   (COMMITMENT_LEVELS[bet.commitmentLevel] || {}).shortLabel || `Level ${bet.commitmentLevel}`,
      reversibility:     bet.reversibility,
      portfolioRole:     bet.portfolioRole,
      ifSuccess:         successUnlocks,
      ifFailure:         bet.revivalCriteria ? [{ note: bet.revivalCriteria }] : [],
      killCriteria:      bet.killCriteria || [],
      preMortem:         bet.preMortem || null
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PARETO FRONTIER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute Pareto-non-dominated portfolios on two user-selected axes.
 * A portfolio is dominated if another is no worse on ALL objectives
 * and strictly better on at least one.
 *
 * @param {Array} portfolios - Array of {id, name, metrics: {[axis]: number}}
 * @param {string} axis1 - metric key (higher = better)
 * @param {string} axis2 - metric key (higher = better)
 * @returns {Array} portfolios annotated with {dominated: bool}
 */
function computeParetoFrontier(portfolios, axis1, axis2) {
  if (!portfolios || portfolios.length === 0) return [];

  return portfolios.map((p, i) => {
    const dominated = portfolios.some((q, j) => {
      if (i === j) return false;
      const a1 = q.metrics[axis1] >= p.metrics[axis1];
      const a2 = q.metrics[axis2] >= p.metrics[axis2];
      const strictlyBetter = q.metrics[axis1] > p.metrics[axis1] || q.metrics[axis2] > p.metrics[axis2];
      return a1 && a2 && strictlyBetter;
    });
    return { ...p, dominated, paretoFrontier: !dominated };
  });
}

/**
 * Derive comparable portfolio metrics from portfolio data for Pareto analysis.
 * Returns normalized 0–100 scores per axis from available data.
 */
function derivePortfolioMetrics(portfolio, ideas) {
  const ideaMap = {};
  (ideas || []).forEach(i => { ideaMap[i.id] = i; });

  const bets = portfolio.bets || [];
  const betIdeas = bets.map(b => ideaMap[b.ideaId]).filter(Boolean);

  const avgScore = betIdeas.length > 0
    ? betIdeas.reduce((s, i) => s + (i.atAGlance?.overallScore || 50), 0) / betIdeas.length
    : 50;

  const avgReversibilityScore = bets.length > 0
    ? 100 - (bets.reduce((s, b) => s + (REVERSIBILITY_RANK[b.reversibility] || 2), 0) / bets.length) * 25
    : 50;

  const capitalRequired = portfolio.resourceEnvelope?.availableCash || 1000;

  const avgCommitment = bets.length > 0
    ? bets.reduce((s, b) => s + (b.commitmentLevel || 0), 0) / bets.length
    : 0;

  // Higher commitment → lower optionality
  const optionalityScore = Math.max(0, 100 - avgCommitment * 12.5);

  // Learning value: prefer lower commitment, higher reversibility, diversified categories
  const categories = new Set(betIdeas.map(i => i.category).filter(Boolean));
  const diversityScore = Math.min(100, categories.size * 25);
  const learningValue = (avgReversibilityScore + diversityScore) / 2;

  return {
    expectedUpside:    Math.round(avgScore),
    capitalRequired:   Math.round(Math.max(0, 100 - (capitalRequired / 50))), // inverted: lower capital = better
    learningValue:     Math.round(learningValue),
    optionValue:       Math.round(optionalityScore),
    reversibility:     Math.round(avgReversibilityScore),
    activeBetCount:    bets.filter(b => b.portfolioRole === 'ACTIVE').length
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPORTUNITY COST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find highest-scored ideas NOT in the portfolio that could fit within remaining capacity.
 * Returns them with reason for exclusion from current portfolio.
 */
function computeOpportunityCost(portfolio, allIdeas, topN = 5) {
  const selectedIdeaIds = new Set((portfolio.bets || []).map(b => b.ideaId));
  const antiPortfolioIds = new Set((portfolio.antiPortfolio || []).map(a => a.ideaId));

  const excluded = allIdeas
    .filter(i => !selectedIdeaIds.has(i.id))
    .filter(i => i.status !== 'archived' && i.status !== 'killed')
    .map(i => ({
      ideaId: i.id,
      name: i.name,
      score: i.atAGlance?.overallScore || 0,
      status: i.status,
      isAntiPortfolio: antiPortfolioIds.has(i.id),
      antiPortfolioReason: (portfolio.antiPortfolio || []).find(a => a.ideaId === i.id)?.reason || null,
      revivedWhen: (portfolio.antiPortfolio || []).find(a => a.ideaId === i.id)?.revivedWhen || null
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return excluded;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY GAP
// ─────────────────────────────────────────────────────────────────────────────

const CAPABILITY_LEVEL = { none: 0, low: 1, medium: 2, high: 3 };

/**
 * Compute capability gaps: bet requirements minus portfolio envelope.
 * Returns gaps per bet with severity.
 */
function computeCapabilityGaps(bets, envelope) {
  const available = {
    technical:       envelope.technicalCapacity       || 'none',
    enterpriseSales: envelope.salesCapacity           || 'none',
    regulatory:      envelope.researchCapacity        || 'none',
    design:          envelope.designCapacity          || 'none',
    domainExpert:    envelope.operationalCapacity     || 'none'
  };

  return bets.map(bet => {
    const req = bet._capabilityRequirements || {};
    const gaps = [];
    Object.entries(req).forEach(([cap, needed]) => {
      const haveScore = CAPABILITY_LEVEL[available[cap] || 'none'] || 0;
      const needScore = CAPABILITY_LEVEL[needed] || 0;
      if (needScore > haveScore) {
        gaps.push({
          capability: cap,
          have: available[cap] || 'none',
          need: needed,
          severity: needScore - haveScore > 1 ? 'high' : 'medium'
        });
      }
    });
    return { betId: bet.betId, ideaId: bet.ideaId, title: bet.title || bet.betId, gaps };
  }).filter(b => b.gaps.length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAGILITY ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimate portfolio fragility: how much of portfolio value depends on one assumption.
 * Returns: fragile | moderate | robust
 * A portfolio where >60% of bets share a single thesis dependency is fragile.
 */
function assessFragility(portfolio, riskFactors, ideas) {
  const bets = portfolio.bets || [];
  if (bets.length === 0) return { level: 'unknown', rationale: 'No bets to assess.' };

  const concentration = detectRiskConcentration(bets, riskFactors);
  const highConc = concentration.filter(r => r.concentrationLevel === 'high');
  const thesis = portfolio.portfolioThesis;

  let fragile = false;
  let rationale = [];

  if (highConc.length > 0) {
    fragile = true;
    highConc.forEach(r => {
      rationale.push(`${Math.round((r.exposedBetCount / r.totalBets) * 100)}% of bets exposed to "${r.name}".`);
    });
  }

  if (thesis && thesis.killSwitch) {
    rationale.push(`Explicit kill switch defined: "${thesis.killSwitch.substring(0, 80)}..."`);
  }

  const level = fragile ? (highConc.length > 1 ? 'fragile' : 'moderate') : 'robust';

  return {
    level,
    highConcentrationFactors: highConc,
    rationale: rationale.length > 0 ? rationale : ['No dominant single-point failure detected across active bets.']
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORECAST / BRIER SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute Brier score for a resolved binary forecast.
 * Uses latest pre-resolution submission per forecaster.
 * Lower Brier score is better. Naive 50% baseline = 0.25.
 */
function computeBrierScore(forecast) {
  if (!forecast.resolution || forecast.resolution.outcome === null || forecast.resolution.outcome === undefined) {
    return null;
  }
  if (forecast.resolutionType !== 'binary') return null;

  const outcome = forecast.resolution.outcome === true || forecast.resolution.outcome === 1 ? 1 : 0;
  const scores = [];

  // Group submissions by forecaster, take latest before resolution
  const resolvedAt = forecast.resolution.resolvedAt ? new Date(forecast.resolution.resolvedAt) : null;
  const byForecaster = {};
  (forecast.submissions || []).forEach(s => {
    if (resolvedAt && new Date(s.submittedAt) >= resolvedAt) return; // after resolution — exclude
    if (!byForecaster[s.forecasterId] || new Date(s.submittedAt) > new Date(byForecaster[s.forecasterId].submittedAt)) {
      byForecaster[s.forecasterId] = s;
    }
  });

  Object.values(byForecaster).forEach(s => {
    const brier = Math.pow(s.probability - outcome, 2);
    scores.push({
      forecasterId: s.forecasterId,
      forecaster:   s.forecaster,
      forecasterType: s.forecasterType || 'human',
      probability:  s.probability,
      outcome,
      brierScore:   Math.round(brier * 1000) / 1000
    });
  });

  const naiveScore = Math.pow(0.5 - outcome, 2); // 0.25 always

  const ensembleProb = scores.length > 0
    ? scores.reduce((s, x) => s + x.probability, 0) / scores.length
    : 0.5;
  const ensembleScore = Math.round(Math.pow(ensembleProb - outcome, 2) * 1000) / 1000;

  return {
    outcome,
    scores,
    ensembleProb:   Math.round(ensembleProb * 1000) / 1000,
    ensembleScore,
    naiveBaselineScore: naiveScore,
    computedAt: new Date().toISOString()
  };
}

/**
 * Summarize calibration across resolved binary forecasts.
 * Bins probabilities into 10% intervals, counts occurrences vs outcomes.
 * Requires >= 10 resolved per bin before displaying.
 */
function summarizeCalibration(forecasts) {
  const resolved = forecasts.filter(
    f => f.resolutionType === 'binary'
      && f.resolution
      && f.resolution.outcome !== null
      && f.resolution.outcome !== undefined
  );

  const bins = {};
  for (let lo = 0; lo < 100; lo += 10) {
    bins[lo] = { label: `${lo}–${lo + 9}%`, count: 0, successes: 0 };
  }

  resolved.forEach(f => {
    const outcome = f.resolution.outcome === true || f.resolution.outcome === 1 ? 1 : 0;
    // Take ensemble probability across latest submissions
    const resolvedAt = f.resolution.resolvedAt ? new Date(f.resolution.resolvedAt) : null;
    const byForecaster = {};
    (f.submissions || []).forEach(s => {
      if (resolvedAt && new Date(s.submittedAt) >= resolvedAt) return;
      if (!byForecaster[s.forecasterId] || new Date(s.submittedAt) > new Date(byForecaster[s.forecasterId].submittedAt)) {
        byForecaster[s.forecasterId] = s;
      }
    });
    const subs = Object.values(byForecaster);
    if (subs.length === 0) return;
    const avgProb = subs.reduce((s, x) => s + x.probability, 0) / subs.length;
    const binKey = Math.min(90, Math.floor(avgProb * 10) * 10);
    bins[binKey].count++;
    bins[binKey].successes += outcome;
  });

  const MIN_SAMPLE = 10;
  const result = Object.entries(bins).map(([lo, bin]) => ({
    binLow:          parseInt(lo),
    label:           bin.label,
    count:           bin.count,
    successes:       bin.successes,
    observedRate:    bin.count >= MIN_SAMPLE ? Math.round((bin.successes / bin.count) * 100) : null,
    expectedRate:    parseInt(lo) + 5,
    sufficient:      bin.count >= MIN_SAMPLE,
    warning:         bin.count < MIN_SAMPLE
      ? `Only ${bin.count} resolved forecast(s) in this bin — calibration requires ≥${MIN_SAMPLE}.`
      : null
  }));

  const totalResolved = resolved.length;
  const overallWarning = totalResolved < 10
    ? `Only ${totalResolved} total resolved forecast(s). Calibration data insufficient for meaningful conclusions.`
    : null;

  return { bins: result, totalResolved, overallWarning };
}

/**
 * Detect disagreement across forecaster submissions on one question.
 * High disagreement (range > 40pp) is itself a signal — surfaces for investigation.
 */
function detectForecasterDisagreement(forecast) {
  const subs = forecast.submissions || [];
  if (subs.length < 2) return { level: 'insufficient', range: 0 };

  const probs = subs.map(s => s.probability);
  const min = Math.min(...probs);
  const max = Math.max(...probs);
  const range = max - min;

  const level = range > 0.4 ? 'high' : range > 0.2 ? 'moderate' : 'low';

  return {
    level,
    range:    Math.round(range * 100),
    min:      Math.round(min * 100),
    max:      Math.round(max * 100),
    mean:     Math.round(probs.reduce((s, p) => s + p, 0) / probs.length * 100),
    note:     level === 'high'
      ? `High disagreement (${Math.round(range * 100)}pp spread). Disagreement may be the signal — identify the crux assumption causing it.`
      : null
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMINANCE CHECK FOR BETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find bets that are dominated by another bet on: cost, time, information value, option value.
 * A dominated bet is inferior with no meaningful compensating advantage.
 * Inform user — do not automatically remove.
 */
function findDominatedBets(bets) {
  const BAND = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1, UNKNOWN: 2 };
  const REV = { HIGHLY_REVERSIBLE: 4, REVERSIBLE: 3, PARTIALLY_REVERSIBLE: 2, EXPENSIVE_TO_REVERSE: 1, IRREVERSIBLE: 0 };

  return bets.map((bet, i) => {
    const betIV = BAND[(bet._informationValue || {}).valueBand] || 2;
    const betRev = REV[bet.reversibility] || 2;
    const betCost = bet._cost?.minimumToLearn || bet._cost?.toTest || 0;
    const betComm = bet.commitmentLevel || 0;

    const dominated = bets.some((other, j) => {
      if (i === j) return false;
      const otherIV  = BAND[(other._informationValue || {}).valueBand] || 2;
      const otherRev = REV[other.reversibility] || 2;
      const otherCost = other._cost?.minimumToLearn || other._cost?.toTest || 0;
      const otherComm = other.commitmentLevel || 0;

      // Other dominates bet if: higher IV, higher reversibility, lower cost, lower commitment
      // and strictly better on at least one
      const atLeastAsGoodOnAll = otherIV >= betIV && otherRev >= betRev &&
        (otherCost <= betCost || betCost === 0) && otherComm <= betComm;
      const strictlyBetter = otherIV > betIV || otherRev > betRev ||
        (otherCost < betCost && betCost > 0) || otherComm < betComm;

      return atLeastAsGoodOnAll && strictlyBetter;
    });

    return { betId: bet.betId, ideaId: bet.ideaId, title: bet.title || bet.betId, dominated };
  }).filter(b => b.dominated);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COMMITMENT_LEVELS,
    REVERSIBILITY_RANK,
    STRATEGIC_ROLE_DESCRIPTIONS,
    buildResourceSummary,
    estimateAttentionLoad,
    detectRiskConcentration,
    detectSynergies,
    rankByInformationValue,
    generateSequence,
    computeParetoFrontier,
    derivePortfolioMetrics,
    computeOpportunityCost,
    computeCapabilityGaps,
    assessFragility,
    computeBrierScore,
    summarizeCalibration,
    detectForecasterDisagreement,
    findDominatedBets
  };
}

// Browser global
if (typeof window !== 'undefined') {
  window.PortfolioEngine = {
    COMMITMENT_LEVELS,
    REVERSIBILITY_RANK,
    STRATEGIC_ROLE_DESCRIPTIONS,
    buildResourceSummary,
    estimateAttentionLoad,
    detectRiskConcentration,
    detectSynergies,
    rankByInformationValue,
    generateSequence,
    computeParetoFrontier,
    derivePortfolioMetrics,
    computeOpportunityCost,
    computeCapabilityGaps,
    assessFragility,
    computeBrierScore,
    summarizeCalibration,
    detectForecasterDisagreement,
    findDominatedBets
  };
}
