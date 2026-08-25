/**
 * VenturaAtlas RELAY — Venture Operations & Execution Intelligence Engine
 * Pure deterministic functions for fulfillment flow, capacity modeling, quality & CAPA,
 * cost-to-serve unit economics, supplier resilience, and operational debt detection.
 *
 * UMD module compatible with Node.js and Browser environments.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE STATES & ENUMS
// ─────────────────────────────────────────────────────────────────────────────

const FULFILLMENT_STATES = [
  'REQUESTED',
  'ACCEPTED',
  'WAITING_INPUT',
  'READY',
  'IN_PROGRESS',
  'QUALITY_CHECK',
  'READY_TO_DELIVER',
  'DELIVERED',
  'ACCEPTED_BY_CUSTOMER',
  'CLOSED',
  'BLOCKED',
  'FAILED',
  'REWORK',
  'CANCELLED',
  'ON_HOLD',
  'SUPPLIER_DELAY'
];

const ACTIVE_WIP_STATES = new Set([
  'REQUESTED',
  'ACCEPTED',
  'WAITING_INPUT',
  'READY',
  'IN_PROGRESS',
  'QUALITY_CHECK',
  'READY_TO_DELIVER',
  'BLOCKED',
  'REWORK',
  'ON_HOLD',
  'SUPPLIER_DELAY'
]);

const TERMINAL_STATES = new Set([
  'CLOSED',
  'CANCELLED'
]);

// ─────────────────────────────────────────────────────────────────────────────
// FLOW & LEAD TIME METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes deterministic operational flow metrics across a set of fulfillments.
 * @param {Array} fulfillments Array of fulfillment records
 * @returns {Object} Flow metrics summary
 */
function evaluateFlowMetrics(fulfillments = []) {
  if (!Array.isArray(fulfillments) || fulfillments.length === 0) {
    return {
      totalCount: 0,
      activeWipCount: 0,
      completedCount: 0,
      avgLeadTimeHours: 0,
      avgCycleTimeHours: 0,
      avgTouchTimeMinutes: 0,
      avgWaitTimeMinutes: 0,
      flowEfficiency: 0,
      throughputPerWeek: 0,
      firstPassYield: 1.0,
      reworkRate: 0.0,
      onTimeDeliveryRate: 1.0
    };
  }

  let totalTouchMinutes = 0;
  let totalWaitMinutes = 0;
  let totalLeadTimeHours = 0;
  let leadTimeCount = 0;
  let completedCount = 0;
  let activeWipCount = 0;
  let zeroReworkCompletedCount = 0;
  let totalReworkedUnits = 0;
  let onTimeDeliveries = 0;
  let promiseDeliveriesCount = 0;

  fulfillments.forEach(f => {
    const isCompleted = f.state === 'CLOSED' || f.state === 'ACCEPTED_BY_CUSTOMER' || f.state === 'DELIVERED';
    const isWip = ACTIVE_WIP_STATES.has(f.state);

    if (isWip) activeWipCount++;

    const touch = f.touchTimeMinutes || 0;
    const wait = f.waitTimeMinutes || 0;
    totalTouchMinutes += touch;
    totalWaitMinutes += wait;

    if ((f.reworkCount || 0) > 0) {
      totalReworkedUnits++;
    }

    if (isCompleted) {
      completedCount++;
      if ((f.reworkCount || 0) === 0) {
        zeroReworkCompletedCount++;
      }

      // Compute lead time if timestamps exist
      if (f.createdAt && (f.acceptedAt || f.deliveredAt)) {
        const start = new Date(f.createdAt).getTime();
        const end = new Date(f.acceptedAt || f.deliveredAt).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          const leadHours = (end - start) / (1000 * 60 * 60);
          totalLeadTimeHours += leadHours;
          leadTimeCount++;
        }
      }

      // On-time check
      if (f.promisedDeliveryAt && f.deliveredAt) {
        promiseDeliveriesCount++;
        const promised = new Date(f.promisedDeliveryAt).getTime();
        const actual = new Date(f.deliveredAt).getTime();
        if (!isNaN(promised) && !isNaN(actual) && actual <= promised) {
          onTimeDeliveries++;
        }
      }
    }
  });

  const totalTimeMinutes = totalTouchMinutes + totalWaitMinutes;
  const flowEfficiency = totalTimeMinutes > 0 ? Math.round((totalTouchMinutes / totalTimeMinutes) * 1000) / 1000 : 0;
  const avgTouchTimeMinutes = fulfillments.length > 0 ? Math.round(totalTouchMinutes / fulfillments.length) : 0;
  const avgWaitTimeMinutes = fulfillments.length > 0 ? Math.round(totalWaitMinutes / fulfillments.length) : 0;
  const avgLeadTimeHours = leadTimeCount > 0 ? Math.round((totalLeadTimeHours / leadTimeCount) * 10) / 10 : 0;
  const avgCycleTimeHours = Math.round(((avgTouchTimeMinutes + avgWaitTimeMinutes) / 60) * 10) / 10;
  const firstPassYield = completedCount > 0 ? Math.round((zeroReworkCompletedCount / completedCount) * 1000) / 1000 : 1.0;
  const reworkRate = fulfillments.length > 0 ? Math.round((totalReworkedUnits / fulfillments.length) * 1000) / 1000 : 0.0;
  const onTimeDeliveryRate = promiseDeliveriesCount > 0 ? Math.round((onTimeDeliveries / promiseDeliveriesCount) * 1000) / 1000 : 1.0;

  return {
    totalCount: fulfillments.length,
    activeWipCount,
    completedCount,
    avgLeadTimeHours,
    avgCycleTimeHours,
    avgTouchTimeMinutes,
    avgWaitTimeMinutes,
    flowEfficiency,
    throughputPerWeek: completedCount, // localized count
    firstPassYield,
    reworkRate,
    onTimeDeliveryRate
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPACITY & BOTTLENECK ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates operational capacity, Little's Law consistency, and bottleneck constraints.
 * @param {Object} process Operational process definition
 * @param {Array} fulfillments Active fulfillment units
 * @param {Object} capacityModel Capacity parameters
 * @returns {Object} Capacity assessment
 */
function evaluateCapacityAndBottlenecks(process, fulfillments = [], capacityModel = {}) {
  const activeWip = (fulfillments || []).filter(f => ACTIVE_WIP_STATES.has(f.state));
  const wipCount = activeWip.length;

  const demonstratedWeekly = capacityModel.demonstratedUnitsPerWeek || 5;
  const currentDemandWeekly = capacityModel.currentDemandUnitsPerWeek || wipCount;
  const theoreticalMax = capacityModel.theoreticalMaxUnitsPerWeek || demonstratedWeekly * 1.5;

  const utilizationRate = demonstratedWeekly > 0 ? Math.round((currentDemandWeekly / demonstratedWeekly) * 100) / 100 : 1.0;
  const isOverCapacity = utilizationRate > 1.0;
  const demandCliff = capacityModel.demandCliffUnitsPerWeek || demonstratedWeekly * 1.25;
  const isAtDemandCliff = currentDemandWeekly >= demandCliff;

  // Little's Law Consistency Check: WIP = Throughput * Cycle Time
  const throughputPerDay = demonstratedWeekly / 7;
  const avgTouchHours = ((process?.stages || []).reduce((s, st) => s + (st.standardTouchTimeMinutes || 0), 0)) / 60;
  const avgWaitHours = ((process?.stages || []).reduce((s, st) => s + (st.standardWaitTimeMinutes || 0), 0)) / 60;
  const expectedCycleDays = Math.max(0.1, (avgTouchHours + avgWaitHours) / 24);
  const littlesLawExpectedWip = Math.round(throughputPerDay * expectedCycleDays * 10) / 10;
  const isWipExcessive = wipCount > (littlesLawExpectedWip * 2);

  // Find bottleneck stage (highest standard touch time or flagged risk)
  let bottleneckStage = null;
  let maxStageTime = -1;
  (process?.stages || []).forEach(stg => {
    const totalStageTime = (stg.standardTouchTimeMinutes || 0) + (stg.standardWaitTimeMinutes || 0);
    if (stg.isBottleneckRisk || totalStageTime > maxStageTime) {
      maxStageTime = totalStageTime;
      bottleneckStage = stg;
    }
  });

  return {
    wipCount,
    demonstratedWeeklyCapacity: demonstratedWeekly,
    currentDemandWeekly,
    theoreticalMaxCapacity: theoreticalMax,
    utilizationRate,
    isOverCapacity,
    demandCliffUnitsPerWeek: demandCliff,
    isAtDemandCliff,
    littlesLawExpectedWip,
    isWipExcessive,
    bottleneckStageId: bottleneckStage?.stageId || 'unknown',
    bottleneckStageName: bottleneckStage?.name || 'Primary Production Stage',
    queueHealth: isAtDemandCliff ? 'CRITICAL_CLIFF' : isOverCapacity ? 'OVERUTILIZED_QUEUING' : 'STABLE_FLOW'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COST TO SERVE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates granular unit delivery cost and flags margin erosion or negative operating leverage.
 * @param {Object} fulfillment Fulfillment record
 * @param {Object} costModel Cost baseline model
 * @returns {Object} Cost-to-serve breakdown
 */
function calculateCostToServe(fulfillment = {}, costModel = {}) {
  const fCost = fulfillment.costToServe || {};
  const baseCost = costModel.baseDeliveryCost || {};

  const directLabor = fCost.directLaborCost ?? baseCost.directLabor ?? 0;
  const computeOrApi = fCost.computeOrApiCost ?? baseCost.computeOrApi ?? 0;
  const supplier = fCost.supplierCost ?? baseCost.supplierGoods ?? 0;
  const inspection = fCost.inspectionCost ?? baseCost.inspection ?? 0;
  const shipping = fCost.shippingCost ?? baseCost.shipping ?? 0;
  const rework = fCost.reworkCost ?? 0;
  const support = fCost.supportOverheadCost ?? costModel.supportCostPerUnit ?? 0;

  const standardSubtotal = directLabor + computeOrApi + supplier + inspection + shipping;
  const exceptionOverhead = rework + support;
  const totalCost = standardSubtotal + exceptionOverhead;

  const baselineTotal = costModel.totalCostToServePerUnit || standardSubtotal;
  const costVariancePercent = baselineTotal > 0 ? Math.round(((totalCost - baselineTotal) / baselineTotal) * 1000) / 10 : 0;
  const hasNegativeOperatingLeverage = exceptionOverhead > (standardSubtotal * 0.4);

  return {
    currency: fCost.currency || costModel.currency || 'EUR',
    directLabor,
    computeOrApi,
    supplier,
    inspection,
    shipping,
    rework,
    support,
    standardSubtotal,
    exceptionOverhead,
    totalCost,
    baselineTotal,
    costVariancePercent,
    hasNegativeOperatingLeverage
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY & DEFECT / CAPA ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyzes quality nonconformities, defect escape rates, root cause distribution, and CAPA resolution.
 * @param {Array} defects Array of defect records
 * @param {Array} fulfillments Array of fulfillment records
 * @returns {Object} Quality health analysis
 */
function evaluateQualityHealth(defects = [], fulfillments = []) {
  const defectList = Array.isArray(defects) ? defects : [];
  const totalDefects = defectList.length;

  let escapes = 0;
  let totalReworkCost = 0;
  let openDefects = 0;
  let verifiedCapaCount = 0;
  const categoryCounts = {};
  const rootCauseCounts = {};

  defectList.forEach(d => {
    if (d.isEscape) escapes++;
    totalReworkCost += d.reworkCost || 0;
    if (d.status !== 'VERIFIED_CLOSED') openDefects++;
    if (d.correctiveAction?.isVerifiedEffective) verifiedCapaCount++;

    const cat = d.category || 'OTHER';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const rootCat = d.rootCauseAnalysis?.primaryCategory || 'UNCLASSIFIED';
    rootCauseCounts[rootCat] = (rootCauseCounts[rootCat] || 0) + 1;
  });

  const completedCount = (fulfillments || []).filter(f => f.state === 'CLOSED' || f.state === 'ACCEPTED_BY_CUSTOMER').length;
  const escapeRate = completedCount > 0 ? Math.round((escapes / completedCount) * 1000) / 10 : 0;
  const capaClosureRate = totalDefects > 0 ? Math.round((verifiedCapaCount / totalDefects) * 100) : 100;

  return {
    totalDefects,
    escapes,
    escapeRatePercent: escapeRate,
    openDefects,
    totalCostOfPoorQuality: totalReworkCost,
    verifiedCapaCount,
    capaClosureRatePercent: capaClosureRate,
    categoryDistribution: categoryCounts,
    rootCauseDistribution: rootCauseCounts,
    qualityStatus: escapes > 0 ? 'CRITICAL_ESCAPE_RISK' : totalDefects > 3 ? 'ELEVATED_DEFECTS' : 'QUALITY_CONTROLLED'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIER RESILIENCE & DEPENDENCY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assesses external vendor criticality, lead-time variance, and single-source failure risk.
 * @param {Array} suppliers Array of supplier records
 * @returns {Object} Supplier risk assessment
 */
function evaluateSupplierRisk(suppliers = []) {
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  if (supplierList.length === 0) {
    return {
      totalSuppliers: 0,
      criticalCount: 0,
      singleSourceCriticalCount: 0,
      highVarianceCount: 0,
      resilienceScore: 100,
      vulnerabilities: []
    };
  }

  let criticalCount = 0;
  let singleSourceCriticalCount = 0;
  let highVarianceCount = 0;
  const vulnerabilities = [];

  supplierList.forEach(sup => {
    const isCrit = sup.criticality === 'CRITICAL';
    const isSingle = sup.isSingleSource === true;
    const hasVariance = (sup.leadTimeVarianceDays || 0) > (sup.standardLeadTimeDays || 1) * 0.5;

    if (isCrit) criticalCount++;
    if (isCrit && isSingle) {
      singleSourceCriticalCount++;
      vulnerabilities.push({
        supplierId: sup.supplierId,
        name: sup.name,
        type: 'SINGLE_SOURCE_CRITICAL',
        description: `Critical supplier "${sup.name}" has no qualified backup. Failure immediately halts delivery.`
      });
    }
    if (hasVariance) {
      highVarianceCount++;
      vulnerabilities.push({
        supplierId: sup.supplierId,
        name: sup.name,
        type: 'HIGH_LEAD_TIME_VARIANCE',
        description: `Supplier "${sup.name}" variance (±${sup.leadTimeVarianceDays}d) creates delivery date instability.`
      });
    }
  });

  const penalty = (singleSourceCriticalCount * 30) + (highVarianceCount * 15);
  const resilienceScore = Math.max(10, 100 - penalty);

  return {
    totalSuppliers: supplierList.length,
    criticalCount,
    singleSourceCriticalCount,
    highVarianceCount,
    resilienceScore,
    vulnerabilities,
    resilienceLevel: resilienceScore >= 80 ? 'RESILIENT' : resilienceScore >= 50 ? 'MODERATE_RISK' : 'HIGH_SUPPLIER_VULNERABILITY'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONAL DEBT & FOUNDER HEROICS DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Surfaces hidden operational debt, excessive manual intervention, and scaling blockers.
 * @param {Object} workspace Operational workspace object
 * @returns {Array} List of operational debt alerts
 */
function detectOperationalDebt(workspace = {}) {
  const alerts = [];
  const processes = workspace.processes || [];
  const fulfillments = workspace.fulfillments || [];
  const capacityModels = workspace.capacityModels || [];
  const defects = workspace.defects || [];

  // 1. Founder Heroics / Manual Touch Overload
  processes.forEach(proc => {
    const manualStages = (proc.stages || []).filter(st => st.automationLevel === 'MANUAL');
    const totalTouch = (proc.stages || []).reduce((s, st) => s + (st.standardTouchTimeMinutes || 0), 0);
    if (manualStages.length >= 3 && totalTouch > 180) {
      alerts.push({
        id: `debt-manual-${proc.processId}`,
        severity: 'HIGH',
        category: 'FOUNDER_HEROICS',
        title: `Excessive Manual Labor in ${proc.name}`,
        detail: `Process requires ${totalTouch} mins of manual touch across ${manualStages.length} stages. Scalability requires standard work playbooks or selective automation.`
      });
    }
  });

  // 2. Capacity Cliff Saturation
  capacityModels.forEach(cap => {
    if (cap.currentDemandUnitsPerWeek >= cap.demandCliffUnitsPerWeek) {
      alerts.push({
        id: `debt-cliff-${cap.capacityModelId}`,
        severity: 'CRITICAL',
        category: 'CAPACITY_CLIFF',
        title: `Demand Cliff Exceeded for ${cap.flowUnit}`,
        detail: `Weekly demand (${cap.currentDemandUnitsPerWeek}) matches or exceeds cliff threshold (${cap.demandCliffUnitsPerWeek}). Immediate capacity expansion or intake rationing required.`
      });
    }
  });

  // 3. Chronic Defect Clusters
  if (defects.length >= 2) {
    const openCapas = defects.filter(d => !d.correctiveAction?.isVerifiedEffective);
    if (openCapas.length >= 2) {
      alerts.push({
        id: 'debt-unverified-capas',
        severity: 'MEDIUM',
        category: 'UNVERIFIED_QUALITY_FIXES',
        title: `${openCapas.length} Corrective Actions Pending Verification`,
        detail: 'Quality fixes have been applied to code or SOPs but not verified against recurring customer defects.'
      });
    }
  }

  return alerts;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

const RelayEngine = {
  FULFILLMENT_STATES,
  ACTIVE_WIP_STATES,
  TERMINAL_STATES,
  evaluateFlowMetrics,
  evaluateCapacityAndBottlenecks,
  calculateCostToServe,
  evaluateQualityHealth,
  evaluateSupplierRisk,
  detectOperationalDebt
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelayEngine;
}

if (typeof window !== 'undefined') {
  window.RelayEngine = RelayEngine;
}
