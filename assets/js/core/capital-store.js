/**
 * VenturaAtlas Capital Store — Local/Private Capital Formation & Cap Table Workspace.
 *
 * All cap tables, investor pipelines, and data room diligence notes are maintained
 * strictly in the current browser localStorage. No private ownership or funder data
 * is ever sent over the network or published to public repositories.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VACapitalStore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'va_capital_workspace_v1';
  const SCHEMA_VERSION = '1.0.0';

  function defaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      workspaceId: 'capital-default-workspace',
      ventureId: 'idea-061',
      ventureName: 'FactBounty',
      currency: 'EUR',
      capitalNeeds: [
        {
          schemaVersion: '1.0.0',
          needId: 'need-fb-001',
          ventureId: 'idea-061',
          purpose: 'CUSTOMER_ACQUISITION',
          description: 'Seed initial buyer bounty rewards and mobile video capture verification infrastructure.',
          milestone: 'Reach 15 funded consumer bounties and 1 paying merchant subscription',
          targetState: 'Repeat organic fact requests and positive unit economics on unlock fees.',
          amountRange: {
            currency: 'EUR',
            minimumViable: 1500,
            comfortable: 5000,
            maximumUseful: 15000
          },
          timeHorizonMonths: 3,
          useOfFunds: [
            { category: 'Bounty Match Pool', percentage: 50, amount: 2500, operationalRationale: 'Co-fund first 50 buyer bounties to bootstrap liquidity' },
            { category: 'Mobile Tooling & Presigned S3 Infrastructure', percentage: 30, amount: 1500, operationalRationale: 'Video capture processing and challenge verification' },
            { category: 'Merchant Outreach', percentage: 20, amount: 1000, operationalRationale: 'Direct outreach to top 20 eCommerce merchants' }
          ],
          status: 'EVALUATING_SOURCES',
          canAchieveWithoutOutsideCapital: true,
          nonDilutiveAlternative: 'Customer prepayment via Mercury and founder savings.',
          underfundingRisk: 'Slower initial bounty liquidity on niche product categories.',
          overfundingRisk: 'Premature burn before repeatable unit economics on unlock fee re-use.',
          evidenceRequired: ['15 documented buyer interviews', '3 completed buyer video proofs'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      capTable: {
        schemaVersion: '1.0.0',
        capTableId: 'captable-fb-001',
        ventureName: 'FactBounty',
        currency: 'EUR',
        totalAuthorizedShares: 1000000,
        stakeholders: [
          { stakeholderId: 'sh-founder-1', name: 'Founder / Product Lead', role: 'FOUNDER', shareClass: 'COMMON', sharesCount: 850000, ownershipPercent: 85.0, vestingMonths: 48, cliffMonths: 12 },
          { stakeholderId: 'sh-advisor-1', name: 'Technical Domain Advisor', role: 'ADVISOR', shareClass: 'COMMON', sharesCount: 50000, ownershipPercent: 5.0, vestingMonths: 24, cliffMonths: 6 }
        ],
        optionPool: {
          totalPoolShares: 100000,
          allocatedShares: 0,
          unallocatedShares: 100000,
          poolPercentOfFullyDiluted: 10.0
        },
        convertibles: [],
        roundsHistory: [],
        updatedAt: new Date().toISOString()
      },
      investorPipeline: {
        schemaVersion: '1.0.0',
        pipelineId: 'pipeline-fb-001',
        ventureId: 'idea-061',
        targetRaiseAmount: { currency: 'EUR', amount: 50000 },
        entries: [
          {
            investorId: 'inv-angel-01',
            firmOrName: 'E-Commerce Angel Syndicate',
            investorType: 'ANGEL',
            stage: 'PRE_SEED',
            relationshipStage: 'INITIAL_MEETING',
            checkSizeRange: { currency: 'EUR', min: 10000, max: 25000 },
            sectorFitScore: 8.5,
            stageFitScore: 9.0,
            thesisAlignment: 'Consumer trust and verified physical evidence networks.',
            potentialConflicts: 'None observed.',
            lastContactDate: new Date().toISOString().slice(0, 10),
            notes: 'Interested in the C8 payment proofs from Mercury before committing.',
            passReason: null,
            feedbackSummary: 'Wants to see unit economics on unlock re-use.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      dataRoom: {
        schemaVersion: '1.0.0',
        dataRoomId: 'dataroom-fb-001',
        ventureId: 'idea-061',
        readinessScorePercent: 75,
        missingCriticalCount: 1,
        categories: [
          {
            categoryId: 'cat-corporate',
            categoryName: '1. Corporate & Legal',
            description: 'Articles of incorporation, cap table, founder IP assignments',
            items: [
              { itemId: 'doc-incorporation', documentTitle: 'Certificate of Incorporation', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'legal/incorporation.pdf', notes: 'Incorporated EU SME' },
              { itemId: 'doc-ip-assignment', documentTitle: 'Founder IP Assignment Agreement', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'legal/ip-assignment.pdf', notes: 'All IP assigned to company' },
              { itemId: 'doc-cap-table', documentTitle: 'Current Cap Table & Stock Ledger', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'corporate/cap-table.csv', notes: 'Clean 2-stakeholder table' }
            ]
          },
          {
            categoryId: 'cat-commercial',
            categoryName: '2. Commercial & Evidence',
            description: 'Customer interviews, paid pilot contracts, and Mercury receipts',
            items: [
              { itemId: 'doc-interviews', documentTitle: '15 Primary Buyer Interview Syntheses', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'research/interviews.md', notes: 'Full problem confirmation notes' },
              { itemId: 'doc-mercury-receipts', documentTitle: 'Mercury Verified Traction Receipts', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'mercury/traction.json', notes: 'Observed payment proofs' }
            ]
          },
          {
            categoryId: 'cat-tech',
            categoryName: '3. Product & Technology',
            description: 'Architecture blueprints, API specs, and verification harnesses',
            items: [
              { itemId: 'doc-tech-blueprint', documentTitle: 'Technical Blueprint & Security Review', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'technical-blueprints/idea-061.md', notes: 'Zero-knowledge challenge protocol' },
              { itemId: 'doc-soc2-audit', documentTitle: 'SOC2 Type II Report', requiredStage: 'SERIES_A', isMandatory: false, status: 'NOT_APPLICABLE', artifactPath: null, notes: 'Not required at Pre-Seed' }
            ]
          },
          {
            categoryId: 'cat-financials',
            categoryName: '4. Financials & Projections',
            description: '12-month budget, burn rate, and scenario financial model',
            items: [
              { itemId: 'doc-financial-model', documentTitle: 'Detailed Scenario Financial Model', requiredStage: 'PRE_SEED', isMandatory: true, status: 'READY', artifactPath: 'financial-models/idea-061.md', notes: 'Conservative, Base, and Aggressive tiers' },
              { itemId: 'doc-bank-statements', documentTitle: 'Last 3 Months Bank Statements', requiredStage: 'SEED', isMandatory: true, status: 'DRAFT', artifactPath: 'financials/statements.pdf', notes: 'Pending monthly close' }
            ]
          }
        ],
        diligenceRequests: [],
        updatedAt: new Date().toISOString()
      },
      termSheets: []
    };
  }

  function getStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  }

  function loadWorkspace() {
    const storage = getStorage();
    if (!storage) return defaultState();
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = defaultState();
        saveWorkspace(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[VACapitalStore] Failed to parse stored workspace, resetting to default:', err);
      return defaultState();
    }
  }

  function saveWorkspace(state) {
    const storage = getStorage();
    if (!storage) return false;
    try {
      state.updatedAt = new Date().toISOString();
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('[VACapitalStore] Failed to save workspace:', err);
      return false;
    }
  }

  function resetWorkspace() {
    const initial = defaultState();
    saveWorkspace(initial);
    return initial;
  }

  function exportWorkspaceJson() {
    const ws = loadWorkspace();
    return JSON.stringify(ws, null, 2);
  }

  function importWorkspaceJson(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      throw new Error('Incompatible or invalid Capital workspace JSON schema');
    }
    saveWorkspace(parsed);
    return parsed;
  }

  return {
    STORAGE_KEY,
    SCHEMA_VERSION,
    defaultState,
    loadWorkspace,
    saveWorkspace,
    resetWorkspace,
    exportWorkspaceJson,
    importWorkspaceJson
  };
});
