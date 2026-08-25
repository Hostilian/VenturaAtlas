const test = require('node:test');
const assert = require('node:assert/strict');
const VACapitalEngine = require('../assets/js/features/capital-engine.js');

test('evaluateCapitalNeed enforces valid amount ranges and milestone linkage', () => {
  const validNeed = {
    needId: 'need-test-001',
    purpose: 'CUSTOMER_ACQUISITION',
    milestone: 'Acquire 10 paid enterprise pilot customers',
    targetState: 'Validated WTP and €25k MRR baseline',
    amountRange: {
      currency: 'EUR',
      minimumViable: 10000,
      comfortable: 25000,
      maximumUseful: 50000
    },
    timeHorizonMonths: 4,
    useOfFunds: [
      { category: 'Customer Acquisition', percentage: 60, amount: 15000, operationalRationale: 'Targeted outbound and events' },
      { category: 'Product Hardening', percentage: 40, amount: 10000, operationalRationale: 'Integrations and security' }
    ]
  };

  const res = VACapitalEngine.evaluateCapitalNeed(validNeed);
  assert.equal(res.needId, 'need-test-001');
  assert.equal(res.currency, 'EUR');
  assert.equal(res.isMilestoneCredible, true);
  assert.equal(res.useOfFundsBreakdown.isPercentageBalanced, true);
  assert.equal(res.amounts.minimumViable, 10000);
  assert.equal(res.amounts.comfortable, 25000);
  assert.equal(res.amounts.maximumUseful, 50000);

  // Invalid inverted range must throw
  assert.throws(() => {
    VACapitalEngine.evaluateCapitalNeed({
      amountRange: { minimumViable: 50000, comfortable: 20000, maximumUseful: 10000 }
    });
  }, /Invalid capital amount range/);
});

test('calculateDilution models pre/post-money, option pool expansion, and founder dilution', () => {
  const capTable = {
    totalAuthorizedShares: 1000000,
    stakeholders: [
      { stakeholderId: 's1', name: 'Founder A', role: 'FOUNDER', shareClass: 'COMMON', sharesCount: 600000, ownershipPercent: 60.0 },
      { stakeholderId: 's2', name: 'Founder B', role: 'FOUNDER', shareClass: 'COMMON', sharesCount: 300000, ownershipPercent: 30.0 }
    ],
    optionPool: {
      totalPoolShares: 100000,
      allocatedShares: 0,
      unallocatedShares: 100000,
      poolPercentOfFullyDiluted: 10.0
    }
  };

  const round = {
    roundName: 'Seed Round',
    preMoneyValuation: 3000000,
    amountRaised: 1000000,
    newOptionPoolCreatedPercent: 0
  };

  const res = VACapitalEngine.calculateDilution(capTable, round);
  assert.equal(res.preMoneyValuation, 3000000);
  assert.equal(res.postMoneyValuation, 4000000);
  assert.equal(res.pricePerShare, 3.0); // 3M / 1M shares
  assert.equal(res.sharesIssued, 333333); // 1M / 3.0
  assert.equal(res.newInvestorOwnershipPercent, 25.0); // 333,333 / 1,333,333

  const founderA = res.stakeholders.find(s => s.stakeholderId === 's1');
  assert.equal(founderA.postOwnershipPercent, 45.0); // 600,000 / 1,333,333
  assert.equal(founderA.dilutionExperiencedPercent, 25.0); // (60 - 45) / 60
});

test('evaluateConvertibles determines cap vs discount conversion accurately', () => {
  const capTable = {
    stakeholders: [
      { stakeholderId: 's1', name: 'Founder', sharesCount: 1000000, ownershipPercent: 100 }
    ]
  };

  const convertibles = [
    {
      instrumentId: 'safe-01',
      investorName: 'Angel A',
      instrumentType: 'POST_MONEY_SAFE',
      principalAmount: 100000,
      valuationCap: 2000000, // Cap price = 2M / 1M = $2.00
      discountRatePercent: 20
    }
  ];

  // If priced round price is $4.00, cap price ($2.00) is lower than 20% discounted price ($3.20)
  const round = { preMoneyValuation: 4000000, pricePerShare: 4.0 };
  const res = VACapitalEngine.evaluateConvertibles(capTable, convertibles, round);
  assert.equal(res.convertiblesCount, 1);
  assert.equal(res.conversions[0].effectivePricePerShare, 2.0);
  assert.equal(res.conversions[0].conversionMechanism, 'VALUATION_CAP');
  assert.equal(res.conversions[0].sharesConverted, 50000); // 100k / $2.00
});

test('evaluateGrantEligibility maps criteria into 5-states and computes expected yield', () => {
  const grant = {
    grantId: 'grant-eic',
    programName: 'EIC Accelerator',
    issuingAuthority: 'European Innovation Council',
    jurisdiction: 'EU',
    fundingRange: { currency: 'EUR', minAmount: 500000, maxAmount: 2500000, coFundingRatePercent: 70 },
    applicationEffortHours: 150,
    typicalSuccessRatePercent: 10,
    eligibilityCriteria: [
      { criterionId: 'sme-status', title: 'EU SME', mandatory: true },
      { criterionId: 'incorporation-eu', title: 'EU Legal Entity', mandatory: true },
      { criterionId: 'co-funding-reserves', title: '30% Co-funding', mandatory: true }
    ]
  };

  const eligibleVenture = { entityType: 'SME', isIncorporated: true, cashReserves: 200000 };
  const resEligible = VACapitalEngine.evaluateGrantEligibility(eligibleVenture, grant);
  assert.equal(resEligible.overallState, 'CONFIRMED' || 'POTENTIALLY_ELIGIBLE');
  assert.ok(resEligible.expectedHourlyYield > 0);

  const unincorporatedVenture = { entityType: 'SME', isIncorporated: false, cashReserves: 0 };
  const resIneligible = VACapitalEngine.evaluateGrantEligibility(unincorporatedVenture, grant);
  assert.equal(resIneligible.overallState, 'LIKELY_INELIGIBLE');
});

test('evaluateDebtService and evaluateRevenueBasedFinancing compute accurate schedules', () => {
  // Debt service test: €100k at 8% for 24 months with €10k monthly cashflow
  const debt = VACapitalEngine.evaluateDebtService(10000, 100000, 8.0, 24);
  assert.ok(debt.monthlyPayment > 4400 && debt.monthlyPayment < 4600);
  assert.ok(debt.dscr > 2.0);
  assert.equal(debt.solvencyRisk, 'HEALTHY_COVERAGE');

  // Revenue-based financing test: €50k advance with 1.4x multiple and 8% rev share at €30k/mo revenue
  const rbf = VACapitalEngine.evaluateRevenueBasedFinancing(30000, 50000, 8.0, 1.4);
  assert.equal(rbf.totalRepaymentCap, 70000);
  assert.equal(rbf.monthlyPaymentAtCurrentRevenue, 2400); // 30,000 * 0.08
  assert.equal(rbf.estimatedMonthsToPayoff, 30); // ceil(70,000 / 2,400)
});

test('evaluateInvestorReadiness provides 8-pillar scores and missing gap alerts', () => {
  const readyContext = {
    interviewCount: 15,
    hasMarketSizing: true,
    hasRegulatoryTrigger: true,
    isMvpWorking: true,
    hasPrototype: true,
    paidPilotsCount: 3,
    grossMarginPercent: 82,
    hasMilestoneLinkage: true,
    isIncorporated: true,
    ipAssignedToEntity: true
  };
  const dataRoom = { readinessScorePercent: 85, missingCriticalCount: 0 };

  const res = VACapitalEngine.evaluateInvestorReadiness(readyContext, dataRoom);
  assert.equal(res.readinessStage, 'ACTIVE_FUNDRAISE_READY');
  assert.ok(res.compositeScore >= 80);
  assert.equal(res.isReadyToPitch, true);

  const unreadyContext = { interviewCount: 1, isMvpWorking: false, paidPilotsCount: 0, isIncorporated: false };
  const resUnready = VACapitalEngine.evaluateInvestorReadiness(unreadyContext, { readinessScorePercent: 10, missingCriticalCount: 5 });
  assert.equal(resUnready.readinessStage, 'NOT_READY_FOR_FUNDRAISE');
  assert.equal(resUnready.isReadyToPitch, false);
});

test('assertSameCurrency prevents accidental cross-currency operations', () => {
  assert.doesNotThrow(() => {
    VACapitalEngine.assertSameCurrency('EUR', 'EUR', 'Test');
  });

  assert.throws(() => {
    VACapitalEngine.assertSameCurrency('EUR', 'USD', 'Portfolio Addition');
  }, /Currency mismatch in Portfolio Addition: EUR vs USD/);
});
