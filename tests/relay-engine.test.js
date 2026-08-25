const test = require('node:test');
const assert = require('node:assert/strict');
const RelayEngine = require('../assets/js/features/relay-engine.js');

test('evaluateFlowMetrics computes lead time, flow efficiency, and first-pass yield accurately', () => {
  const fulfillments = [
    {
      fulfillmentId: 'ful-1',
      state: 'CLOSED',
      createdAt: '2026-08-20T08:00:00Z',
      deliveredAt: '2026-08-21T08:00:00Z',
      acceptedAt: '2026-08-21T08:00:00Z',
      touchTimeMinutes: 120,
      waitTimeMinutes: 240,
      reworkCount: 0
    },
    {
      fulfillmentId: 'ful-2',
      state: 'CLOSED',
      createdAt: '2026-08-20T08:00:00Z',
      deliveredAt: '2026-08-22T08:00:00Z',
      acceptedAt: '2026-08-22T08:00:00Z',
      touchTimeMinutes: 180,
      waitTimeMinutes: 300,
      reworkCount: 1
    },
    {
      fulfillmentId: 'ful-3',
      state: 'IN_PROGRESS',
      createdAt: '2026-08-23T08:00:00Z',
      touchTimeMinutes: 60,
      waitTimeMinutes: 60,
      reworkCount: 0
    }
  ];

  const metrics = RelayEngine.evaluateFlowMetrics(fulfillments);
  assert.equal(metrics.totalCount, 3);
  assert.equal(metrics.activeWipCount, 1);
  assert.equal(metrics.completedCount, 2);
  assert.equal(metrics.firstPassYield, 0.5); // 1 out of 2 completed with 0 rework
  assert.equal(metrics.reworkRate, 0.333);
  assert.ok(metrics.flowEfficiency > 0 && metrics.flowEfficiency < 1.0);
  assert.ok(metrics.avgLeadTimeHours >= 24 && metrics.avgLeadTimeHours <= 48);
});

test('evaluateCapacityAndBottlenecks detects bottleneck stage and demand cliff saturation', () => {
  const process = {
    processId: 'proc-audit',
    stages: [
      { stageId: 'stg-intake', name: 'Intake', standardTouchTimeMinutes: 20, standardWaitTimeMinutes: 30, isBottleneckRisk: false },
      { stageId: 'stg-synthesis', name: 'Auditor Synthesis', standardTouchTimeMinutes: 180, standardWaitTimeMinutes: 240, isBottleneckRisk: true }
    ]
  };

  const fulfillments = [
    { state: 'IN_PROGRESS' },
    { state: 'IN_PROGRESS' },
    { state: 'WAITING_INPUT' }
  ];

  const capacityModel = {
    demonstratedUnitsPerWeek: 5,
    currentDemandUnitsPerWeek: 8,
    theoreticalMaxUnitsPerWeek: 7,
    demandCliffUnitsPerWeek: 6
  };

  const cap = RelayEngine.evaluateCapacityAndBottlenecks(process, fulfillments, capacityModel);
  assert.equal(cap.wipCount, 3);
  assert.equal(cap.bottleneckStageId, 'stg-synthesis');
  assert.equal(cap.isOverCapacity, true);
  assert.equal(cap.isAtDemandCliff, true);
  assert.equal(cap.queueHealth, 'CRITICAL_CLIFF');
});

test('calculateCostToServe isolates standard unit cost from rework and exception overhead', () => {
  const costModel = {
    currency: 'EUR',
    totalCostToServePerUnit: 200,
    baseDeliveryCost: { directLabor: 100, computeOrApi: 20, supplierGoods: 30, inspection: 10, shipping: 0, subtotal: 160 },
    supportCostPerUnit: 15
  };

  const cleanOrder = {
    costToServe: { directLaborCost: 100, computeOrApiCost: 20, supplierCost: 30, reworkCost: 0, inspectionCost: 10, shippingCost: 0, supportOverheadCost: 15 }
  };

  const exceptionOrder = {
    costToServe: { directLaborCost: 100, computeOrApiCost: 20, supplierCost: 30, reworkCost: 120, inspectionCost: 20, shippingCost: 0, supportOverheadCost: 45 }
  };

  const cleanCts = RelayEngine.calculateCostToServe(cleanOrder, costModel);
  assert.equal(cleanCts.totalCost, 175);
  assert.equal(cleanCts.hasNegativeOperatingLeverage, false);

  const expCts = RelayEngine.calculateCostToServe(exceptionOrder, costModel);
  assert.equal(expCts.totalCost, 335);
  assert.equal(expCts.exceptionOverhead, 165);
  assert.equal(expCts.hasNegativeOperatingLeverage, true);
});

test('evaluateQualityHealth measures customer escapes, Cost of Poor Quality, and CAPA resolution', () => {
  const defects = [
    {
      defectId: 'def-1',
      category: 'FORMAT_SPEC_BREACH',
      severity: 'MAJOR',
      isEscape: false,
      reworkCost: 80,
      status: 'VERIFIED_CLOSED',
      rootCauseAnalysis: { primaryCategory: 'TRAINING_OR_SOP' },
      correctiveAction: { isVerifiedEffective: true }
    },
    {
      defectId: 'def-2',
      category: 'ACCURACY_ERROR',
      severity: 'CRITICAL',
      isEscape: true,
      reworkCost: 250,
      status: 'OPEN',
      rootCauseAnalysis: { primaryCategory: 'PROCESS_DESIGN' },
      correctiveAction: { isVerifiedEffective: false }
    }
  ];

  const fulfillments = [{ state: 'CLOSED' }, { state: 'CLOSED' }];

  const q = RelayEngine.evaluateQualityHealth(defects, fulfillments);
  assert.equal(q.totalDefects, 2);
  assert.equal(q.escapes, 1);
  assert.equal(q.totalCostOfPoorQuality, 330);
  assert.equal(q.capaClosureRatePercent, 50);
  assert.equal(q.qualityStatus, 'CRITICAL_ESCAPE_RISK');
});

test('evaluateSupplierRisk detects single-source critical suppliers and lead-time variance', () => {
  const suppliers = [
    {
      supplierId: 'sup-1',
      name: 'Critical Rig Manufacturer',
      criticality: 'CRITICAL',
      isSingleSource: true,
      standardLeadTimeDays: 10,
      leadTimeVarianceDays: 6
    },
    {
      supplierId: 'sup-2',
      name: 'Standard Cloud Provider',
      criticality: 'LOW',
      isSingleSource: false,
      standardLeadTimeDays: 0.1,
      leadTimeVarianceDays: 0.01
    }
  ];

  const supAssessment = RelayEngine.evaluateSupplierRisk(suppliers);
  assert.equal(supAssessment.criticalCount, 1);
  assert.equal(supAssessment.singleSourceCriticalCount, 1);
  assert.equal(supAssessment.highVarianceCount, 1);
  assert.ok(supAssessment.resilienceScore < 80);
  assert.ok(supAssessment.vulnerabilities.length >= 1);
});

test('detectOperationalDebt flags founder heroics and demand cliff violations', () => {
  const ws = {
    processes: [
      {
        processId: 'p-1',
        name: 'Manual Review Process',
        stages: [
          { standardTouchTimeMinutes: 80, automationLevel: 'MANUAL' },
          { standardTouchTimeMinutes: 60, automationLevel: 'MANUAL' },
          { standardTouchTimeMinutes: 50, automationLevel: 'MANUAL' }
        ]
      }
    ],
    capacityModels: [
      {
        capacityModelId: 'cap-1',
        flowUnit: 'cases',
        currentDemandUnitsPerWeek: 15,
        demandCliffUnitsPerWeek: 10
      }
    ],
    defects: []
  };

  const alerts = RelayEngine.detectOperationalDebt(ws);
  assert.ok(alerts.some(a => a.category === 'FOUNDER_HEROICS'));
  assert.ok(alerts.some(a => a.category === 'CAPACITY_CLIFF'));
});
