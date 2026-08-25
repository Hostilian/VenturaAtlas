/**
 * VenturaAtlas RELAY — Local Storage Manager & Workspace Store
 * Manages private browser storage for venture operations, fulfillments, defects,
 * capacity models, supplier relationships, support cases, and improvement cycles.
 *
 * UMD module compatible with Node.js and Browser environments.
 */

'use strict';

const STORAGE_KEY_RELAY_WORKSPACE = 'va_relay_workspace_v1';

class RelayStore {
  constructor(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
    this.storage = storage;
    this.workspace = null;
    this.fixtures = [];
    this.init();
  }

  init() {
    if (this.storage) {
      try {
        const raw = this.storage.getItem(STORAGE_KEY_RELAY_WORKSPACE);
        if (raw) {
          this.workspace = JSON.parse(raw);
        }
      } catch (e) {
        console.warn('[RelayStore] Failed to load from localStorage, initializing default:', e);
      }
    }

    if (!this.workspace) {
      this.workspace = this.getDefaultWorkspace();
    }
  }

  getDefaultWorkspace() {
    return {
      schemaVersion: '1.0.0',
      workspaceId: 'opsws-factbounty-default',
      ventureId: 'idea-061',
      archetype: 'HARDWARE_LAB',
      processes: [
        {
          processId: 'proc-factbounty-sample-test',
          ventureId: 'idea-061',
          name: 'Hardware Verification Test Rig Execution',
          purpose: 'Receive client sensor/hardware sample, run automated stress rig, and issue cryptographically verifiable proof certificate.',
          trigger: 'Client sample delivered to lab with deposit receipt.',
          flowUnit: 'hardware_sample_batch',
          stages: [
            { stageId: "stg-intake", name: "Sample Intake & Barcoding", sequenceOrder: 1, standardTouchTimeMinutes: 20, standardWaitTimeMinutes: 60, isBottleneckRisk: false, automationLevel: "MANUAL" },
            { stageId: "stg-stress-test", name: "Automated Signal Stress Test Rig", sequenceOrder: 2, standardTouchTimeMinutes: 15, standardWaitTimeMinutes: 360, isBottleneckRisk: true, automationLevel: "STRAIGHT_THROUGH_AUTOMATED" },
            { stageId: "stg-qc-signoff", name: "Cryptographic Certificate QC", sequenceOrder: 3, standardTouchTimeMinutes: 15, standardWaitTimeMinutes: 15, isBottleneckRisk: false, automationLevel: "HUMAN_IN_THE_LOOP" },
            { stageId: "stg-delivery", name: "Client Certificate Dispatch & Return", sequenceOrder: 4, standardTouchTimeMinutes: 10, standardWaitTimeMinutes: 0, isBottleneckRisk: false, automationLevel: "MANUAL" }
          ],
          controls: [
            { controlId: "ctrl-rig-calibration", stageId: "stg-stress-test", name: "Daily Rig Sensor Calibration", type: "PREVENTION", acceptanceCriteria: "Drift under 0.05%", inspectionCostPerUnit: 15 }
          ],
          inputs: [{ inputId: "inp-sample", name: "Physical Hardware Specimen", sourceType: "CUSTOMER", isRequired: true }],
          outputs: [{ outputId: "out-cert", name: "Signed Tamper-Proof Certificate JSON", recipientType: "CUSTOMER" }],
          failureModes: [{ failureModeId: "fm-signal-noise", stageId: "stg-stress-test", description: "RF interference on testbench", severity: "MAJOR", potentialCause: "Shielding degradation", preventionControlId: "ctrl-rig-calibration" }],
          automationStatus: "AUTOMATED_WITH_REVIEW",
          status: "ACTIVE"
        }
      ],
      fulfillments: [
        {
          fulfillmentId: "ful-fb-101",
          ventureId: "idea-061",
          processId: "proc-factbounty-sample-test",
          customerRef: "cust-automotive-sensor-gmbh",
          offerRef: "offer-hardware-test-standard",
          state: "CLOSED",
          createdAt: "2026-08-21T09:00:00Z",
          promisedDeliveryAt: "2026-08-23T18:00:00Z",
          deliveredAt: "2026-08-23T15:00:00Z",
          acceptedAt: "2026-08-24T10:00:00Z",
          stateHistory: [
            { state: "REQUESTED", timestamp: "2026-08-21T09:00:00Z", reason: "Sample shipment received" },
            { state: "IN_PROGRESS", timestamp: "2026-08-21T10:00:00Z", reason: "Mounted on rig #1" },
            { state: "QUALITY_CHECK", timestamp: "2026-08-23T14:00:00Z", reason: "Rig run finished" },
            { state: "DELIVERED", timestamp: "2026-08-23T15:00:00Z", reason: "Certificate issued" },
            { state: "ACCEPTED_BY_CUSTOMER", timestamp: "2026-08-24T10:00:00Z", reason: "Signed acceptance" },
            { state: "CLOSED", timestamp: "2026-08-24T10:30:00Z", reason: "Specimen archived" }
          ],
          touchTimeMinutes: 60,
          waitTimeMinutes: 435,
          reworkCount: 0,
          qualityPassed: true,
          costToServe: {
            currency: "EUR",
            directLaborCost: 120,
            computeOrApiCost: 25,
            supplierCost: 30,
            reworkCost: 0,
            inspectionCost: 15,
            shippingCost: 20,
            supportOverheadCost: 10,
            totalCost: 220
          },
          exceptionNote: null
        }
      ],
      defects: [],
      capacityModels: [
        {
          capacityModelId: "cap-factbounty-rig",
          ventureId: "idea-061",
          processId: "proc-factbounty-sample-test",
          flowUnit: "hardware_sample_batch",
          theoreticalMaxUnitsPerWeek: 14,
          demonstratedUnitsPerWeek: 10,
          currentDemandUnitsPerWeek: 6,
          bottleneckStageId: "stg-stress-test",
          bottleneckReason: "Rig test run duration (6 hours per specimen batch)",
          utilizationRate: 0.60,
          demandCliffUnitsPerWeek: 12,
          requiredInterventionAtCliff: "Procure secondary testbench rig or shift to overnight automated batches",
          queueAgeP50Hours: 12,
          queueAgeP90Hours: 28,
          queueAgeP95Hours: 36
        }
      ],
      suppliers: [
        {
          supplierId: "sup-sensor-rig-mfg",
          ventureId: "idea-061",
          name: "Rohde & Schwarz Rig Probe Supplier",
          category: "SPECIALIZED_HARDWARE",
          supplies: ["Precision RF calibration sensor tips"],
          criticality: "CRITICAL",
          standardLeadTimeDays: 14,
          leadTimeVarianceDays: 5,
          isSingleSource: true,
          alternativeSupplierName: null,
          alternativeSwitchTimeDays: null,
          continuityPlan: "Maintain safety stock of 6 replacement sensor tips on-site",
          observedReliabilityScore: 96.0
        }
      ],
      supportCases: [],
      costModels: [
        {
          costModelId: "cts-factbounty-std",
          ventureId: "idea-061",
          flowUnit: "hardware_sample_batch",
          currency: "EUR",
          baseDeliveryCost: { directLabor: 120, computeOrApi: 25, supplierGoods: 30, inspection: 15, shipping: 20, subtotal: 210 },
          exceptionOverheadCost: { expectedReworkPerUnit: 10, expectedRefundLossPerUnit: 0, subtotal: 10 },
          supportCostPerUnit: 10,
          totalCostToServePerUnit: 230,
          grossMarginImpactPercent: 65.0
        }
      ],
      improvements: [],
      updatedAt: new Date().toISOString()
    };
  }

  getWorkspace() {
    return this.workspace;
  }

  saveWorkspace() {
    this.workspace.updatedAt = new Date().toISOString();
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEY_RELAY_WORKSPACE, JSON.stringify(this.workspace));
      } catch (e) {
        console.error('[RelayStore] Failed to save to localStorage:', e);
      }
    }
  }

  resetWorkspace(newWs) {
    this.workspace = newWs || this.getDefaultWorkspace();
    this.saveWorkspace();
    return this.workspace;
  }

  loadFixture(fixture) {
    if (!fixture) return;
    this.workspace = {
      schemaVersion: '1.0.0',
      workspaceId: `opsws-${fixture.ventureId}-${Date.now()}`,
      ventureId: fixture.ventureId,
      archetype: fixture.archetype || 'MANAGED_SERVICE',
      processes: fixture.process ? [fixture.process] : (fixture.processes || []),
      fulfillments: fixture.fulfillments || [],
      defects: fixture.defects || [],
      capacityModels: fixture.capacityModels || [],
      suppliers: fixture.suppliers || [],
      supportCases: fixture.supportCases || [],
      costModels: fixture.costModels || [],
      improvements: fixture.improvements || [],
      updatedAt: new Date().toISOString()
    };
    this.saveWorkspace();
    return this.workspace;
  }

  updateFulfillmentState(fulfillmentId, newState, reason = 'State transition') {
    const f = (this.workspace.fulfillments || []).find(item => item.fulfillmentId === fulfillmentId);
    if (!f) return null;

    f.state = newState;
    f.stateHistory = f.stateHistory || [];
    f.stateHistory.push({
      state: newState,
      timestamp: new Date().toISOString(),
      reason
    });

    if (newState === 'DELIVERED') {
      f.deliveredAt = new Date().toISOString();
    } else if (newState === 'ACCEPTED_BY_CUSTOMER') {
      f.acceptedAt = new Date().toISOString();
    }

    this.saveWorkspace();
    return f;
  }

  addFulfillment(fulfillment) {
    this.workspace.fulfillments = this.workspace.fulfillments || [];
    this.workspace.fulfillments.push(fulfillment);
    this.saveWorkspace();
    return fulfillment;
  }

  addDefect(defect) {
    this.workspace.defects = this.workspace.defects || [];
    this.workspace.defects.push(defect);
    this.saveWorkspace();
    return defect;
  }

  addSupportCase(supportCase) {
    this.workspace.supportCases = this.workspace.supportCases || [];
    this.workspace.supportCases.push(supportCase);
    this.saveWorkspace();
    return supportCase;
  }

  addImprovement(imp) {
    this.workspace.improvements = this.workspace.improvements || [];
    this.workspace.improvements.push(imp);
    this.saveWorkspace();
    return imp;
  }

  exportJson() {
    return JSON.stringify(this.workspace, null, 2);
  }

  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.workspaceId && Array.isArray(parsed.processes)) {
        this.workspace = parsed;
        this.saveWorkspace();
        return { success: true };
      }
      return { success: false, error: 'Invalid workspace structure' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelayStore;
}

if (typeof window !== 'undefined') {
  window.RelayStore = RelayStore;
}
