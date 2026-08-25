/**
 * VenturaAtlas Capital Engine — Pure Deterministic Capital Formation,
 * Dilution Modeling, Grant Eligibility, and Investor Readiness Logic.
 *
 * Principle: Capital is useful only when it buys a strategically valuable milestone.
 * No fabricated valuation certainty. Honest scenario bounds and evidence mapping.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VACapitalEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Currency guard: Ensures calculations only compare like currencies.
   */
  function assertSameCurrency(c1, c2, context) {
    if (c1 && c2 && c1 !== c2) {
      throw new Error(`Currency mismatch in ${context || 'calculation'}: ${c1} vs ${c2}. Convert explicitly before combining.`);
    }
  }

  /**
   * Evaluates a capital need specification against operational milestone criteria.
   */
  function evaluateCapitalNeed(need, ventureContext) {
    if (!need || typeof need !== 'object') {
      throw new Error('Invalid capital need object');
    }
    const range = need.amountRange || {};
    const min = Number(range.minimumViable || 0);
    const comfortable = Number(range.comfortable || min);
    const max = Number(range.maximumUseful || comfortable);
    const currency = range.currency || 'EUR';

    if (min < 0 || comfortable < min || max < comfortable) {
      throw new Error('Invalid capital amount range: minimum <= comfortable <= maximum is required');
    }

    const useOfFunds = Array.isArray(need.useOfFunds) ? need.useOfFunds : [];
    const totalPercentage = useOfFunds.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    const totalAllocatedAmount = useOfFunds.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const hasMilestone = Boolean(need.milestone && need.milestone.trim().length > 5);
    const hasTargetState = Boolean(need.targetState && need.targetState.trim().length > 5);

    // Overfunding and underfunding risk heuristics
    const overfundingRisk = max > min * 3.5
      ? 'High spread (>3.5x min): Excessive early cash risks premature scaling, increased burn rate, and severe dilution.'
      : 'Moderate: Raise amount is tightly bounded around the defined milestone.';

    const underfundingRisk = min === 0
      ? 'Zero external capital needed: Execution is 100% self-funded or customer-financed.'
      : 'If less than minimum viable is raised, project will fail to reach the value-inflection milestone.';

    return {
      needId: need.needId,
      purpose: need.purpose,
      currency,
      amounts: { minimumViable: min, comfortable, maximumUseful: max },
      timeHorizonMonths: need.timeHorizonMonths || 6,
      milestone: need.milestone || 'Undefined milestone',
      isMilestoneCredible: hasMilestone && hasTargetState,
      useOfFundsBreakdown: {
        itemsCount: useOfFunds.length,
        totalPercentage: Math.round(totalPercentage * 100) / 100,
        isPercentageBalanced: Math.abs(totalPercentage - 100) <= 0.5 || useOfFunds.length === 0,
        totalAllocatedAmount
      },
      risks: {
        overfundingRisk,
        underfundingRisk
      },
      canBootstrap: need.canAchieveWithoutOutsideCapital || min <= 2000,
      nonDilutiveAlternative: need.nonDilutiveAlternative || 'Explore customer prepayment via Mercury or regional R&D vouchers.'
    };
  }

  /**
   * Computes clean cap table ownership and dilution for an equity financing round.
   */
  function calculateDilution(capTable, round) {
    if (!capTable || !Array.isArray(capTable.stakeholders)) {
      throw new Error('Invalid cap table object');
    }
    const preMoney = Number(round.preMoneyValuation || 0);
    const investment = Number(round.amountRaised || 0);
    if (preMoney <= 0 && investment > 0) {
      throw new Error('Pre-money valuation must be positive for priced equity round');
    }

    const postMoney = preMoney + investment;
    const currentTotalShares = capTable.stakeholders.reduce((sum, s) => sum + Number(s.sharesCount || 0), 0) +
      Number(capTable.optionPool?.unallocatedShares || 0);

    if (currentTotalShares <= 0) {
      throw new Error('Cap table has zero existing shares');
    }

    const pricePerShare = preMoney > 0 ? preMoney / currentTotalShares : 1.0;
    const newSharesIssued = investment > 0 ? Math.round(investment / pricePerShare) : 0;
    const postRoundTotalShares = currentTotalShares + newSharesIssued;

    // Model optional unallocated option pool expansion required by incoming investor
    const targetPoolPercent = Number(round.newOptionPoolCreatedPercent || 0);
    let additionalPoolShares = 0;
    if (targetPoolPercent > 0 && targetPoolPercent < 100) {
      // Standard formula: Pool target % of post-money fully diluted
      additionalPoolShares = Math.round((targetPoolPercent * postRoundTotalShares) / (100 - targetPoolPercent));
    }
    const fullyDilutedPostShares = postRoundTotalShares + additionalPoolShares;

    const updatedStakeholders = capTable.stakeholders.map(s => {
      const shares = Number(s.sharesCount || 0);
      const postRoundOwnershipPercent = Math.round((shares / fullyDilutedPostShares) * 10000) / 100;
      const priorOwnership = Number(s.ownershipPercent || 0);
      const dilutionPercent = priorOwnership > 0
        ? Math.round(((priorOwnership - postRoundOwnershipPercent) / priorOwnership) * 10000) / 100
        : 0;

      return {
        stakeholderId: s.stakeholderId,
        name: s.name,
        role: s.role,
        shareClass: s.shareClass,
        priorShares: shares,
        priorOwnershipPercent: priorOwnership,
        postShares: shares,
        postOwnershipPercent: postRoundOwnershipPercent,
        dilutionExperiencedPercent: dilutionPercent
      };
    });

    const newInvestorOwnershipPercent = fullyDilutedPostShares > 0
      ? Math.round((newSharesIssued / fullyDilutedPostShares) * 10000) / 100
      : 0;

    const unallocatedPoolPercent = fullyDilutedPostShares > 0
      ? Math.round(((Number(capTable.optionPool?.unallocatedShares || 0) + additionalPoolShares) / fullyDilutedPostShares) * 10000) / 100
      : 0;

    return {
      roundName: round.roundName || 'Priced Round',
      preMoneyValuation: preMoney,
      investmentAmount: investment,
      postMoneyValuation: postMoney,
      pricePerShare: Math.round(pricePerShare * 10000) / 10000,
      sharesIssued: newSharesIssued,
      totalFullyDilutedShares: fullyDilutedPostShares,
      newInvestorOwnershipPercent,
      unallocatedPoolPercent,
      stakeholders: updatedStakeholders
    };
  }

  /**
   * Evaluates convertible instruments (SAFEs / Convertible Notes) conversion at a priced round.
   */
  function evaluateConvertibles(capTable, convertibles, qualifiedRound) {
    const roundPreMoney = Number(qualifiedRound.preMoneyValuation || 0);
    const roundPrice = Number(qualifiedRound.pricePerShare || 1.0);
    const fullyDilutedBase = capTable.stakeholders.reduce((sum, s) => sum + Number(s.sharesCount || 0), 0);

    const results = (convertibles || []).map(conv => {
      const principal = Number(conv.principalAmount || 0);
      const cap = Number(conv.valuationCap || 0);
      const discount = Number(conv.discountRatePercent || 0);

      const capPrice = cap > 0 && fullyDilutedBase > 0 ? cap / fullyDilutedBase : roundPrice;
      const discountPrice = discount > 0 ? roundPrice * (1 - (discount / 100)) : roundPrice;
      const effectivePrice = Math.min(capPrice, discountPrice, roundPrice);
      const sharesConverted = effectivePrice > 0 ? Math.round(principal / effectivePrice) : 0;

      return {
        instrumentId: conv.instrumentId,
        investorName: conv.investorName,
        instrumentType: conv.instrumentType,
        principalAmount: principal,
        valuationCap: cap,
        discountRatePercent: discount,
        effectivePricePerShare: Math.round(effectivePrice * 10000) / 10000,
        sharesConverted,
        conversionMechanism: effectivePrice === capPrice && cap > 0
          ? 'VALUATION_CAP'
          : (effectivePrice === discountPrice && discount > 0 ? 'DISCOUNT_RATE' : 'ROUND_PRICE')
      };
    });

    const totalConvertedShares = results.reduce((sum, r) => sum + r.sharesConverted, 0);
    return {
      convertiblesCount: results.length,
      totalPrincipal: results.reduce((sum, r) => sum + r.principalAmount, 0),
      totalConvertedShares,
      conversions: results
    };
  }

  /**
   * Evaluates funding source fit against venture attributes and founder preferences.
   */
  function evaluateFundingFit(venture, fundingSource) {
    if (!venture || !fundingSource) {
      throw new Error('Venture and funding source are required');
    }

    let score = 50;
    const reasons = [];
    const flags = [];

    const isEarlyStage = ['CONCEPT', 'PROTOTYPE', 'VALIDATION_PILOT', 'COMMERCIAL_EXPERIMENTATION'].includes(venture.stage);
    const hasProvenRevenue = Boolean(venture.observedMonthlyRevenue && venture.observedMonthlyRevenue > 5000);
    const isCapitalIntensive = Boolean(venture.isHardwareOrBio || venture.requiresHeavyLabRnd);

    // Source specific rules
    switch (fundingSource.sourceType) {
      case 'BOOTSTRAPPED':
        if (!isCapitalIntensive) {
          score += 35;
          reasons.push('Low capital requirements make self-funding / bootstrapping highly viable and non-dilutive.');
        } else {
          score -= 30;
          flags.push('High R&D/hardware expenses make pure bootstrapping dangerous for founder runway.');
        }
        break;

      case 'CUSTOMER_PREPAY':
        if (venture.commercialSignals?.hasUrgentBuyerDemand || isEarlyStage) {
          score += 40;
          reasons.push('High problem severity enables paid pilot deposits before engineering costs.');
        }
        break;

      case 'GRANT_NON_DILUTIVE':
        if (isCapitalIntensive || venture.tags?.includes('deep tech') || venture.tags?.includes('AI')) {
          score += 35;
          reasons.push('Technical novelty aligns strongly with public innovation grant mandates.');
        } else {
          score -= 15;
          flags.push('Application effort (50-150 hours) may exceed the strategic value of small grants for standard software.');
        }
        break;

      case 'ANGEL_INVESTOR':
      case 'SAFE_CONVERTIBLE':
        if (isEarlyStage) {
          score += 30;
          reasons.push('Fast lightweight capital instrument without immediate priced round governance overhead.');
        }
        break;

      case 'VENTURE_CAPITAL':
        if (venture.scores?.marketDemand?.value >= 7.5 && !isEarlyStage) {
          score += 25;
          reasons.push('Large market and scalable economics fit venture return expectations.');
        } else if (isEarlyStage) {
          score -= 20;
          flags.push('Premature institutional VC before PMF causes excessive dilution and board overhead.');
        }
        break;

      case 'REVENUE_BASED_FINANCING':
        if (hasProvenRevenue) {
          score += 30;
          reasons.push('Existing recurring revenue qualifies for non-dilutive growth advances.');
        } else {
          score -= 40;
          flags.push('Requires established historical MRR (>€10k/mo). Pre-revenue ventures do not qualify.');
        }
        break;

      case 'BANK_DEBT':
      case 'VENTURE_DEBT':
        if (!hasProvenRevenue && !venture.hasVCSponsorship) {
          score -= 45;
          flags.push('Debt requires repayment capacity or sponsor backing. Dangerous for pre-revenue ventures.');
        }
        break;

      default:
        break;
    }

    const boundedScore = Math.max(0, Math.min(100, score));
    let verdict = 'POOR_FIT';
    if (boundedScore >= 75) verdict = 'RECOMMENDED';
    else if (boundedScore >= 50) verdict = 'VIABLE_OPTION';

    return {
      sourceId: fundingSource.sourceId,
      sourceType: fundingSource.sourceType,
      name: fundingSource.name,
      category: fundingSource.category,
      fitScore: boundedScore,
      verdict,
      reasons,
      flags,
      isDilutive: fundingSource.dilutionProfile?.isDilutive || false,
      isRepayable: fundingSource.repaymentProfile?.isRepayable || false
    };
  }

  /**
   * Maps venture attributes to 5-state grant eligibility.
   */
  function evaluateGrantEligibility(venture, grant) {
    if (!grant || !Array.isArray(grant.eligibilityCriteria)) {
      throw new Error('Invalid grant object');
    }

    const criteriaResults = grant.eligibilityCriteria.map(c => {
      let status = 'REQUIRES_CONFIRMATION';
      let rationale = 'Requires formal operator check.';

      if (c.criterionId.includes('sme')) {
        if (venture.entityType === 'SME') {
          status = 'CONFIRMED';
          rationale = 'Company satisfies EU SME definition.';
        } else {
          status = 'LIKELY_INELIGIBLE';
          rationale = 'Company does not meet SME definition.';
        }
      } else if (c.criterionId.includes('incorporation')) {
        if (venture.isIncorporated) {
          status = 'CONFIRMED';
          rationale = 'Active legal entity registered in target jurisdiction.';
        } else {
          status = 'LIKELY_INELIGIBLE';
          rationale = 'Grant requires active legal incorporation in target jurisdiction.';
        }
      } else if (c.criterionId.includes('co-funding')) {
        const requiredReserves = (grant.fundingRange?.minAmount || 0) * 0.3;
        if (venture.cashReserves >= requiredReserves) {
          status = 'CONFIRMED';
          rationale = `Demonstrated cash reserves (€${venture.cashReserves.toLocaleString()}) satisfy required co-funding (€${requiredReserves.toLocaleString()}).`;
        } else {
          status = 'REQUIRES_CONFIRMATION';
          rationale = `Demonstrated cash reserves are below required 30% co-funding (€${requiredReserves.toLocaleString()}).`;
        }
      }

      return {
        criterionId: c.criterionId,
        title: c.title,
        mandatory: c.mandatory,
        status,
        rationale
      };
    });

    const hasIneligible = criteriaResults.some(r => r.mandatory && r.status === 'LIKELY_INELIGIBLE');
    const allConfirmed = criteriaResults.every(r => r.status === 'CONFIRMED');
    const hasUncertain = criteriaResults.some(r => r.status === 'REQUIRES_CONFIRMATION' || r.status === 'UNCERTAIN');

    let overallState = 'POTENTIALLY_ELIGIBLE';
    if (hasIneligible) overallState = 'LIKELY_INELIGIBLE';
    else if (allConfirmed) overallState = 'CONFIRMED';
    else if (hasUncertain) overallState = 'REQUIRES_CONFIRMATION';

    // Calculate Grant Opportunity Efficiency: net expected value / application hours
    const avgFunding = ((grant.fundingRange?.minAmount || 0) + (grant.fundingRange?.maxAmount || 0)) / 2;
    const successRate = (grant.typicalSuccessRatePercent || 15) / 100;
    const expectedValue = avgFunding * successRate;
    const effortHours = grant.applicationEffortHours || 80;
    const expectedHourlyYield = Math.round(expectedValue / effortHours);

    return {
      grantId: grant.grantId,
      programName: grant.programName,
      issuingAuthority: grant.issuingAuthority,
      jurisdiction: grant.jurisdiction,
      overallState,
      expectedHourlyYieldCurrency: grant.fundingRange?.currency || 'EUR',
      expectedHourlyYield,
      criteriaResults,
      opportunityTradeoff: `Expected yield ~${expectedHourlyYield} ${grant.fundingRange?.currency || 'EUR'}/hr across ${effortHours} application hours at ${grant.typicalSuccessRatePercent || 15}% statistical success rate.`
    };
  }

  /**
   * Evaluates debt service coverage and repayment feasibility.
   */
  function evaluateDebtService(monthlyNetCashflow, debtAmount, annualInterestRatePercent, termMonths) {
    if (debtAmount <= 0 || termMonths <= 0) {
      throw new Error('Debt amount and term must be positive');
    }
    const monthlyRate = (annualInterestRatePercent / 100) / 12;
    const monthlyPayment = monthlyRate > 0
      ? (debtAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1)
      : debtAmount / termMonths;

    const totalRepayment = monthlyPayment * termMonths;
    const totalInterest = totalRepayment - debtAmount;
    const dscr = monthlyPayment > 0 ? Math.round((monthlyNetCashflow / monthlyPayment) * 100) / 100 : 0;

    let solvencyRisk = 'HIGH_DEFAULT_RISK';
    if (dscr >= 2.0) solvencyRisk = 'HEALTHY_COVERAGE';
    else if (dscr >= 1.25) solvencyRisk = 'ACCEPTABLE_COVERAGE';
    else if (dscr >= 1.0) solvencyRisk = 'TIGHT_VULNERABLE';

    return {
      principal: debtAmount,
      annualInterestRatePercent,
      termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      dscr,
      solvencyRisk
    };
  }

  /**
   * Evaluates Revenue-Based Financing cashflow impact and payback duration.
   */
  function evaluateRevenueBasedFinancing(projectedMonthlyRevenue, principalAdvance, revSharePercent, returnMultiple) {
    const totalCap = principalAdvance * returnMultiple;
    const monthlyShare = projectedMonthlyRevenue * (revSharePercent / 100);
    const estimatedMonthsToPayoff = monthlyShare > 0 ? Math.ceil(totalCap / monthlyShare) : 999;

    return {
      principalAdvance,
      returnMultiple,
      totalRepaymentCap: totalCap,
      revSharePercent,
      monthlyPaymentAtCurrentRevenue: Math.round(monthlyShare * 100) / 100,
      estimatedMonthsToPayoff,
      annualizedCostOfCapitalPercent: Math.round(((returnMultiple - 1) / (estimatedMonthsToPayoff / 12)) * 10000) / 100
    };
  }

  /**
   * Multidimensional investor readiness assessment across 8 evidence pillars.
   */
  function evaluateInvestorReadiness(evidenceContext, dataRoomState) {
    const ctx = evidenceContext || {};
    const dr = dataRoomState || {};

    const pillars = [
      {
        id: 'problem_evidence',
        name: '1. Problem & Customer Evidence',
        score: ctx.interviewCount >= 10 ? 85 : (ctx.interviewCount >= 3 ? 50 : 20),
        weight: 15,
        details: ctx.interviewCount >= 10 ? '10+ structured buyer interviews documented' : 'Insufficient primary buyer interviews'
      },
      {
        id: 'market_timing',
        name: '2. Market Sizing & Timing',
        score: ctx.hasMarketSizing && ctx.hasRegulatoryTrigger ? 80 : (ctx.hasMarketSizing ? 60 : 30),
        weight: 10,
        details: ctx.hasRegulatoryTrigger ? 'Clear regulatory/technological why-now trigger' : 'Generic market timing'
      },
      {
        id: 'product_status',
        name: '3. Product & Technology Proof',
        score: ctx.isMvpWorking ? 90 : (ctx.hasPrototype ? 60 : 25),
        weight: 15,
        details: ctx.isMvpWorking ? 'Working functional MVP with verifiable tests' : 'Early prototype stage'
      },
      {
        id: 'commercial_traction',
        name: '4. Commercial Traction & WTP',
        score: ctx.paidPilotsCount >= 2 ? 95 : (ctx.lettersOfIntentCount >= 3 ? 65 : 20),
        weight: 20,
        details: ctx.paidPilotsCount >= 2 ? `${ctx.paidPilotsCount} prepaid pilots/contracts via Mercury` : 'No verified revenue proof yet'
      },
      {
        id: 'unit_economics',
        name: '5. Unit Economics & Margins',
        score: ctx.grossMarginPercent >= 70 ? 85 : (ctx.grossMarginPercent >= 50 ? 60 : 30),
        weight: 10,
        details: `Modeled gross margin: ${ctx.grossMarginPercent || 'Unknown'}%`
      },
      {
        id: 'capital_plan',
        name: '6. Capital Plan & Milestone Rigor',
        score: ctx.hasMilestoneLinkage ? 90 : 35,
        weight: 10,
        details: ctx.hasMilestoneLinkage ? 'Direct use-of-funds tied to measurable milestone' : 'Vague spend plan'
      },
      {
        id: 'legal_entity',
        name: '7. Legal, Entity & IP Cleanliness',
        score: ctx.isIncorporated && ctx.ipAssignedToEntity ? 90 : (ctx.isIncorporated ? 60 : 20),
        weight: 10,
        details: ctx.isIncorporated ? 'Incorporated entity with clean IP assignment' : 'Unincorporated / informal IP'
      },
      {
        id: 'data_room',
        name: '8. Data Room & Diligence Preparedness',
        score: Math.min(100, (dr.readinessScorePercent || 0)),
        weight: 10,
        details: `${dr.missingCriticalCount || 0} critical documents missing from Data Room`
      }
    ];

    const compositeScore = Math.round(
      pillars.reduce((sum, p) => sum + (p.score * (p.weight / 100)), 0)
    );

    let readinessStage = 'NOT_READY_FOR_FUNDRAISE';
    if (compositeScore >= 80) readinessStage = 'ACTIVE_FUNDRAISE_READY';
    else if (compositeScore >= 60) readinessStage = 'PREPARE_AND_TEST';

    const missingGaps = pillars.filter(p => p.score < 60).map(p => p.name);

    return {
      compositeScore,
      readinessStage,
      pillars,
      missingGaps,
      isReadyToPitch: compositeScore >= 75 && (ctx.paidPilotsCount >= 1 || ctx.interviewCount >= 10)
    };
  }

  /**
   * Compares multiple term sheets side by side on economic and control terms.
   */
  function compareTermSheets(termSheets) {
    if (!Array.isArray(termSheets) || termSheets.length === 0) {
      return [];
    }

    return termSheets.map((ts, idx) => {
      const pre = Number(ts.preMoneyValuation || 0);
      const inv = Number(ts.investmentAmount || 0);
      const post = pre + inv;
      const dilution = post > 0 ? Math.round((inv / post) * 10000) / 100 : 0;

      return {
        termSheetId: ts.termSheetId || `ts-${idx + 1}`,
        investorName: ts.investorName || `Investor ${idx + 1}`,
        preMoneyValuation: pre,
        investmentAmount: inv,
        postMoneyValuation: post,
        dilutionPercent: dilution,
        instrument: ts.instrument || 'PREFERRED_EQUITY',
        liquidationPreference: ts.liquidationPreference || '1.0x Non-Participating',
        boardSeats: ts.boardSeats || '1 Investor / 2 Founder',
        proRataRights: ts.proRataRights !== false,
        protectiveProvisionsScore: ts.hasVetoOnBudget ? 'HIGH_CONTROL_RESTRICTIONS' : 'STANDARD_PROTECTIONS',
        overallEconomicAttractiveness: post > 0 ? Math.round((pre / (pre + inv * 1.2)) * 100) : 50
      };
    });
  }

  return {
    assertSameCurrency,
    evaluateCapitalNeed,
    calculateDilution,
    evaluateConvertibles,
    evaluateFundingFit,
    evaluateGrantEligibility,
    evaluateDebtService,
    evaluateRevenueBasedFinancing,
    evaluateInvestorReadiness,
    compareTermSheets
  };
});
