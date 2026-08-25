const test = require('node:test');
const assert = require('node:assert/strict');
const PortfolioEngine = require('../assets/js/features/portfolio-engine.js');

test('buildResourceSummary computes available, committable, and utilization metrics', () => {
  const envelope = {
    hoursPerWeek: 40,
    availableCash: 5000,
    monthlyBurnCeiling: 1000,
    reserveFraction: 0.25,
    maxActiveBets: 3
  };

  const bets = [
    { _timeHoursLow: 10, _timeHoursHigh: 10, _costLow: 500, _costHigh: 500, portfolioRole: 'ACTIVE' },
    { _timeHoursLow: 15, _timeHoursHigh: 15, _costLow: 1000, _costHigh: 1000, portfolioRole: 'ACTIVE' }
  ];

  const summary = PortfolioEngine.buildResourceSummary(envelope, bets);
  assert.equal(summary.availableHoursPerWeek, 40);
  assert.equal(summary.committableHoursPerWeek, 30);
  assert.equal(summary.reservedHoursPerWeek, 10);
  assert.equal(summary.totalHoursCommitted, 25);
  assert.equal(summary.hoursOverallocated, false);
  assert.equal(summary.availableCash, 5000);
  assert.equal(summary.committableCash, 3750);
  assert.equal(summary.totalCapitalCommittedLow, 1500);
  assert.equal(summary.activeCount, 2);
  assert.equal(summary.wipOverLimit, false);
});

test('estimateAttentionLoad penalizes high context switching across distinct categories', () => {
  const ideas = [
    { id: 'i1', category: 'Biotech' },
    { id: 'i2', category: 'Fintech' },
    { id: 'i3', category: 'DevTools' }
  ];

  const betsDiverse = [
    { ideaId: 'i1', portfolioRole: 'ACTIVE' },
    { ideaId: 'i2', portfolioRole: 'ACTIVE' },
    { ideaId: 'i3', portfolioRole: 'ACTIVE' }
  ];

  const resDiverse = PortfolioEngine.estimateAttentionLoad(betsDiverse, ideas);
  assert.equal(resDiverse.contextSwitches, 2);
  assert.equal(resDiverse.band, 'high');

  const betsFocused = [
    { ideaId: 'i1', portfolioRole: 'ACTIVE' },
    { ideaId: 'i1', portfolioRole: 'ACTIVE' }
  ];
  const resFocused = PortfolioEngine.estimateAttentionLoad(betsFocused, ideas);
  assert.equal(resFocused.contextSwitches, 0);
  assert.equal(resFocused.band, 'medium');
});

test('detectRiskConcentration flags correlated risk factors across active bets', () => {
  const bets = [
    { ideaId: 'idea-01', betId: 'b1' },
    { ideaId: 'idea-02', betId: 'b2' },
    { ideaId: 'idea-03', betId: 'b3' }
  ];

  const riskFactors = [
    {
      riskFactorId: 'rf-openai',
      name: 'OpenAI API Economics',
      category: 'API_DEPENDENCE',
      exposedIdeaIds: ['idea-01', 'idea-02', 'idea-03'],
      portfolioImplication: 'All bets exposed to single provider'
    },
    {
      riskFactorId: 'rf-eu-reg',
      name: 'EU AI Act Enforcement',
      category: 'REGULATION',
      exposedIdeaIds: ['idea-01'],
      portfolioImplication: 'Single bet exposed'
    }
  ];

  const conc = PortfolioEngine.detectRiskConcentration(bets, riskFactors);
  assert.equal(conc.length, 2);
  const openAiRisk = conc.find(r => r.riskFactorId === 'rf-openai');
  assert.equal(openAiRisk.concentrationLevel, 'high');
  assert.equal(openAiRisk.exposedBetCount, 3);
});

test('detectSynergies identifies shared strategic assets and common buyer segments', () => {
  const bets = [
    { ideaId: 'idea-01' },
    { ideaId: 'idea-02' }
  ];

  const strategicAssets = [
    {
      assetId: 'asset-audit-engine',
      name: 'Compliance Audit Engine',
      type: 'CODE_PRIMITIVE',
      linkedIdeaIds: ['idea-01', 'idea-02'],
      compoundsOverTime: true
    }
  ];

  const ideas = [
    { id: 'idea-01', category: 'RegTech', atAGlance: { targetCustomer: 'Chief Compliance Officers' } },
    { id: 'idea-02', category: 'RegTech', atAGlance: { targetCustomer: 'Chief Compliance Officers' } }
  ];

  const synergies = PortfolioEngine.detectSynergies(bets, strategicAssets, ideas);
  assert.ok(synergies.some(s => s.type === 'shared_asset'));
  assert.ok(synergies.some(s => s.type === 'shared_buyer'));
  assert.ok(synergies.some(s => s.type === 'shared_domain_knowledge'));
});

test('computeParetoFrontier finds non-dominated candidate portfolios', () => {
  const candidates = [
    { portfolioId: 'p-dominated', expectedUpside: 50, learningValue: 40 },
    { portfolioId: 'p-efficient-1', expectedUpside: 80, learningValue: 90 }, // higher learningValue
    { portfolioId: 'p-efficient-2', expectedUpside: 95, learningValue: 60 }  // higher expectedUpside
  ];

  // We want to maximize expectedUpside and learningValue
  const annotated = PortfolioEngine.computeParetoFrontier(candidates, 'expectedUpside', 'learningValue');
  const frontier = annotated.filter(p => p.paretoFrontier);

  const frontierIds = frontier.map(p => p.portfolioId);
  assert.ok(frontierIds.includes('p-efficient-1'));
  assert.ok(frontierIds.includes('p-efficient-2'));
  assert.equal(frontierIds.includes('p-dominated'), false);
  assert.equal(annotated.find(p => p.portfolioId === 'p-dominated').dominated, true);
});

test('computeBrierScore calculates squared forecast error correctly', () => {
  // Forecast: 70% probability (0.7), Outcome: TRUE (1) -> (0.7 - 1)^2 = 0.09
  const score1 = PortfolioEngine.computeBrierScore(0.7, 1);
  assert.ok(Math.abs(score1 - 0.09) < 1e-6);

  // Forecast: 70% probability (0.7), Outcome: FALSE (0) -> (0.7 - 0)^2 = 0.49
  const score2 = PortfolioEngine.computeBrierScore(0.7, 0);
  assert.ok(Math.abs(score2 - 0.49) < 1e-6);

  // Naive 50% baseline -> (0.5 - 1)^2 = 0.25
  const scoreBase = PortfolioEngine.computeBrierScore(0.5, 1);
  assert.equal(scoreBase, 0.25);
});

test('detectForecasterDisagreement surfaces high variance between forecasters', () => {
  const predictions = [
    { forecasterId: 'human-1', probability: 0.20 },
    { forecasterId: 'agent-claude', probability: 0.85 },
    { forecasterId: 'agent-hermes', probability: 0.35 }
  ];

  const res = PortfolioEngine.detectForecasterDisagreement(predictions);
  assert.ok(res.range >= 0.5);
  assert.equal(res.hasHighDisagreement, true);
  assert.ok(res.ensembleProbability >= 0.2 && res.ensembleProbability <= 0.85);
});
