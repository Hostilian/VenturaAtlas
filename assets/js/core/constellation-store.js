/**
 * VenturaAtlas Constellation Store — Local/Private Organizational Intelligence Workspace.
 *
 * All people, roles, capacity allocations, decision authority maps, delegation packets,
 * and meeting commitments are maintained strictly in the current browser localStorage.
 * No private organizational data is ever sent over the network or published to public repositories.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VAConstellationStore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'va_constellation_workspace_v1';
  const SCHEMA_VERSION = '1.0.0';

  function defaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      workspaceId: 'orgws-default-fb-001',
      ventureId: 'idea-061',
      companyStage: 'SOLO_FOUNDER',
      people: [
        {
          schemaVersion: '1.0.0',
          personId: 'person-founder-01',
          displayName: 'Solo Founder',
          relationship: 'FOUNDER',
          assignedRoleIds: ['role-product-lead', 'role-eng-lead', 'role-customer-discovery'],
          capabilitiesPossessed: [
            'cap-sw-eng-architecture',
            'cap-prod-design',
            'cap-customer-discovery',
            'cap-fin-modeling'
          ],
          totalWeeklyCapacityHours: 45,
          roleAllocationsPercent: [
            { roleId: 'role-product-lead', allocationPercent: 40 },
            { roleId: 'role-eng-lead', allocationPercent: 35 },
            { roleId: 'role-customer-discovery', allocationPercent: 25 }
          ],
          knownKnowledgeDomains: ['kdom-core-architecture', 'kdom-bounty-mechanics', 'kdom-deployment'],
          accessScope: 'FULL_FOUNDER_ADMIN',
          updatedAt: new Date().toISOString()
        },
        {
          schemaVersion: '1.0.0',
          personId: 'person-ai-worker-01',
          displayName: 'Research Subagent (Ollama/Claude)',
          relationship: 'AI_AGENT_WORKER',
          assignedRoleIds: ['role-market-research-assistant'],
          capabilitiesPossessed: ['cap-deep-research-synthesis', 'cap-doc-generation'],
          totalWeeklyCapacityHours: 80,
          roleAllocationsPercent: [
            { roleId: 'role-market-research-assistant', allocationPercent: 100 }
          ],
          knownKnowledgeDomains: ['kdom-public-evidence'],
          accessScope: 'SANDBOX',
          updatedAt: new Date().toISOString()
        }
      ],
      roles: [
        {
          schemaVersion: '1.0.0',
          roleId: 'role-product-lead',
          title: 'Product & Decision Architect',
          purpose: 'Own core value proposition, decision trade-offs, and bounty milestone verification.',
          accountableOutcomes: [
            'Achieve 15 funded consumer bounties with verified video proofs',
            'Maintain zero false-positive claims across product catalog'
          ],
          recurringResponsibilities: [
            { responsibilityId: 'resp-prod-review', title: 'Weekly milestone & learning review', cadence: 'WEEKLY', isDelegatable: false, delegationDifficulty: 'FOUNDER_ONLY', sopRef: null },
            { responsibilityId: 'resp-spec-drafting', title: 'Feature specification and issue breakdown', cadence: 'WEEKLY', isDelegatable: true, delegationDifficulty: 'MEDIUM', sopRef: 'sop-spec-template' }
          ],
          decisionRights: ['dec-product-scope', 'dec-bounty-payout'],
          requiredCapabilities: ['cap-prod-design', 'cap-customer-discovery'],
          interfaces: [
            { sourceOrDestinationRole: 'role-customer-discovery', direction: 'RECEIVES_FROM', artifactOrSignal: 'Buyer interview syntheses and WTP signals', acceptanceCriteria: '>=3 verified buyer quotes' },
            { sourceOrDestinationRole: 'role-eng-lead', direction: 'PRODUCES_TO', artifactOrSignal: 'Accepted technical blueprint and user stories', acceptanceCriteria: 'Clear acceptance gates' }
          ],
          weeklyHoursCapacityRequired: 18,
          currentOwnerId: 'person-founder-01',
          status: 'ACTIVE_OWNED',
          updatedAt: new Date().toISOString()
        },
        {
          schemaVersion: '1.0.0',
          roleId: 'role-eng-lead',
          title: 'Technical Implementation & Security Lead',
          purpose: 'Build and maintain reliable verification pipelines, storage harnesses, and client applications.',
          accountableOutcomes: [
            '100% passing contract test suites on all PRs',
            'Zero-regression deployment pipeline'
          ],
          recurringResponsibilities: [
            { responsibilityId: 'resp-dev-impl', title: 'Core fullstack software engineering', cadence: 'DAILY', isDelegatable: true, delegationDifficulty: 'HIGH', sopRef: null },
            { responsibilityId: 'resp-infra-deploy', title: 'Cloud/Local supervisor deployment maintenance', cadence: 'WEEKLY', isDelegatable: true, delegationDifficulty: 'LOW', sopRef: 'sop-deploy-runbook' }
          ],
          decisionRights: ['dec-tech-arch', 'dec-release-deploy'],
          requiredCapabilities: ['cap-sw-eng-architecture'],
          interfaces: [
            { sourceOrDestinationRole: 'role-product-lead', direction: 'RECEIVES_FROM', artifactOrSignal: 'Technical blueprint', acceptanceCriteria: 'Contract schema defined' }
          ],
          weeklyHoursCapacityRequired: 16,
          currentOwnerId: 'person-founder-01',
          status: 'ACTIVE_OWNED',
          updatedAt: new Date().toISOString()
        },
        {
          schemaVersion: '1.0.0',
          roleId: 'role-customer-discovery',
          title: 'Customer Discovery & Commercial Reality Lead',
          purpose: 'Conduct primary customer interviews, secure paid pilot deposits, and record observed commercial truth.',
          accountableOutcomes: [
            'Conduct 15 primary buyer interviews',
            'Secure 3 prepaid pilot commitments evidenced in Mercury'
          ],
          recurringResponsibilities: [
            { responsibilityId: 'resp-outbound', title: 'Primary customer interviews & qualification', cadence: 'WEEKLY', isDelegatable: false, delegationDifficulty: 'FOUNDER_ONLY', sopRef: null },
            { responsibilityId: 'resp-mercury-logging', title: 'Commercial event & evidence receipt recording', cadence: 'AS_NEEDED', isDelegatable: true, delegationDifficulty: 'LOW', sopRef: 'sop-mercury-logging' }
          ],
          decisionRights: ['dec-customer-pricing'],
          requiredCapabilities: ['cap-customer-discovery'],
          interfaces: [
            { sourceOrDestinationRole: 'role-product-lead', direction: 'PRODUCES_TO', artifactOrSignal: 'Mercury commercial receipts', acceptanceCriteria: 'Explicit evidenceRef provided' }
          ],
          weeklyHoursCapacityRequired: 11,
          currentOwnerId: 'person-founder-01',
          status: 'ACTIVE_OWNED',
          updatedAt: new Date().toISOString()
        },
        {
          schemaVersion: '1.0.0',
          roleId: 'role-market-research-assistant',
          title: 'Autonomous Research Assistant (AI)',
          purpose: 'Conduct secondary literature scans, compile structured dossiers, and verify source links.',
          accountableOutcomes: ['Complete candidate research dossiers without hallucinations'],
          recurringResponsibilities: [
            { responsibilityId: 'resp-lit-scan', title: 'OpenAlex and regulatory filing scans', cadence: 'WEEKLY', isDelegatable: true, delegationDifficulty: 'LOW', sopRef: 'sop-ai-research' }
          ],
          decisionRights: [],
          requiredCapabilities: ['cap-deep-research-synthesis'],
          interfaces: [
            { sourceOrDestinationRole: 'role-product-lead', direction: 'PRODUCES_TO', artifactOrSignal: 'Research synthesis markdown', acceptanceCriteria: 'Public source URLs verified' }
          ],
          weeklyHoursCapacityRequired: 10,
          currentOwnerId: 'person-ai-worker-01',
          status: 'ACTIVE_OWNED',
          updatedAt: new Date().toISOString()
        }
      ],
      decisionRights: [
        {
          schemaVersion: '1.0.0',
          decisionClassId: 'dec-company-strategy',
          title: 'Company Direction & Pivot Authority',
          scope: 'COMPANY_STRATEGY_PIVOT',
          description: 'Core venture selection, major strategic kill decisions, and company mission.',
          deciderRoleId: 'role-product-lead',
          vetoRoleIds: [],
          consultedRoleIds: ['role-customer-discovery', 'role-eng-lead'],
          informedRoleIds: [],
          isReversible: false,
          autonomyBand: 'FULL_AUTONOMOUS_OWNERSHIP',
          escalationTriggers: ['Pivot changes fundamental value thesis']
        },
        {
          schemaVersion: '1.0.0',
          decisionClassId: 'dec-product-scope',
          title: 'Product Scope & Milestone Definition',
          scope: 'PRODUCT_SCOPE_ROADMAP',
          description: 'Which features enter the current milestone and which are deferred.',
          deciderRoleId: 'role-product-lead',
          vetoRoleIds: [],
          consultedRoleIds: ['role-eng-lead', 'role-customer-discovery'],
          informedRoleIds: [],
          isReversible: true,
          autonomyBand: 'DECIDE_AND_INFORM',
          escalationTriggers: ['Scope adds >2 weeks delay to milestone']
        },
        {
          schemaVersion: '1.0.0',
          decisionClassId: 'dec-tech-arch',
          title: 'Technical Implementation & Architecture',
          scope: 'SECURITY_ARCHITECTURE',
          description: 'Database schema, cryptographic challenge protocols, and code libraries.',
          deciderRoleId: 'role-eng-lead',
          vetoRoleIds: ['role-product-lead'],
          consultedRoleIds: [],
          informedRoleIds: [],
          isReversible: true,
          autonomyBand: 'DECIDE_AND_INFORM',
          escalationTriggers: ['Alters customer privacy or security boundary']
        },
        {
          schemaVersion: '1.0.0',
          decisionClassId: 'dec-customer-pricing',
          title: 'Customer Pricing & Bounty Terms',
          scope: 'CUSTOMER_PRICING_TERMS',
          description: 'Bounty fee structure, pilot pricing, and merchant unlock fees.',
          deciderRoleId: 'role-customer-discovery',
          vetoRoleIds: ['role-product-lead'],
          consultedRoleIds: [],
          informedRoleIds: [],
          isReversible: true,
          autonomyBand: 'DECIDE_AND_INFORM',
          escalationTriggers: ['Custom discounting >20%']
        }
      ],
      delegations: [
        {
          schemaVersion: '1.0.0',
          delegationId: 'del-infra-deploy',
          title: 'Delegate Automated Deployment Scripting to AI Subagent',
          delegatorRoleId: 'role-eng-lead',
          delegateeRoleId: 'role-market-research-assistant',
          intendedOutcome: 'Generate self-contained verified deployment scripts with quality test gates.',
          operationalContext: 'Offload routine script maintenance so human founder focuses on core business logic.',
          decisionAuthorityGranted: 'PROPOSE_AND_APPROVE',
          operatingConstraints: ['No secrets hardcoded', 'All unit tests must pass before PR'],
          inputsRequired: ['Architecture spec in ARCHITECTURE.md'],
          successCriteria: ['CI passes 100% cleanly without manual intervention'],
          sopRef: 'sop-deploy-runbook',
          escalationRule: 'Escalate if script modifies GitHub workflow permissions',
          checkInCadence: 'WEEKLY_REVIEW',
          status: 'ACTIVE_DELEGATED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      meetings: [
        {
          schemaVersion: '1.0.0',
          meetingId: 'meet-weekly-01',
          title: 'Weekly Operating & Learning Review',
          meetingType: 'WEEKLY_OPERATING_REVIEW',
          purpose: 'REVIEW',
          durationMinutes: 45,
          participantPersonIds: ['person-founder-01'],
          preMeetingInputs: ['Mercury summary stats', 'Weekly git commit log', 'Test suite receipt'],
          decisionsProduced: [
            {
              decisionClassId: 'dec-product-scope',
              summary: 'Keep focus on FactBounty buyer verification video capture; defer merchant self-serve UI.',
              decidedByRoleId: 'role-product-lead',
              rationale: 'Demand density must be proven before scaling self-serve tools.'
            }
          ],
          commitmentsCreated: [
            {
              commitmentId: 'comm-video-proto',
              title: 'Finalize mobile video challenge test harness',
              ownerPersonId: 'person-founder-01',
              outcomeTarget: 'Demonstrated end-to-end video recording proof',
              dueCondition: 'Friday EOD',
              evidenceOfCompletion: 'tests/factbounty-contract.test.js passing',
              status: 'IN_PROGRESS'
            }
          ],
          unresolvedQuestions: ['Optimal buyer bounty pricing tiers for electronics vs apparel'],
          status: 'COMPLETED_WITH_OUTPUT',
          heldAt: new Date().toISOString()
        }
      ],
      hiringCases: [
        {
          schemaVersion: '1.0.0',
          caseId: 'hcase-first-hire',
          proposedRoleTitle: 'Part-Time Freelance Front-End UI Engineer',
          bottleneckProblemSolved: 'Founder spends 15 hrs/week crafting UI CSS/HTML instead of customer discovery.',
          evidenceOfBottleneck: 'Founder load analysis shows 35% time spent on repetitive frontend styling.',
          evaluatedAlternatives: [
            { alternativeType: 'AI_AUTOMATION', feasibility: 'PREFERRED', rationale: 'Use Antigravity to generate clean semantic Vanilla CSS templates.' },
            { alternativeType: 'CONTRACTOR', feasibility: 'VIABLE', rationale: 'Hire a 10hr/week contractor if UI customization exceeds capacity.' },
            { alternativeType: 'FULL_TIME_HIRE', feasibility: 'EXCESSIVE_OVERHEAD', rationale: 'Pre-revenue venture does not have the cashflow or management bandwidth for a full-time employee.' }
          ],
          recommendedForm: 'AI_AUTOMATION',
          scorecardOutcomes: ['Ship high-quality responsive CSS in under 4 hours without founder hand-tuning'],
          mustHaveCapabilities: ['cap-prod-design', 'cap-sw-eng-architecture'],
          workSampleDescription: 'Implement responsive dark-mode scorecard component',
          estimatedMonthlyCostRange: { currency: 'EUR', min: 0, max: 800 },
          triggerConditionsToHire: ['When UI backlog exceeds 20 hours for 3 consecutive weeks'],
          status: 'EVALUATING'
        }
      ],
      knowledgeDomains: [
        {
          domainId: 'kdom-core-architecture',
          name: 'Core System Architecture & Schema Rules',
          criticality: 'CRITICAL',
          primaryOwnerPersonId: 'person-founder-01',
          backupOwnerPersonId: null,
          hasVerifiedRunbook: true,
          runbookArtifactRef: 'ARCHITECTURE.md'
        },
        {
          domainId: 'kdom-deployment',
          name: 'Deployment & GitHub Actions CI Infrastructure',
          criticality: 'HIGH',
          primaryOwnerPersonId: 'person-founder-01',
          backupOwnerPersonId: null,
          hasVerifiedRunbook: true,
          runbookArtifactRef: 'BACKGROUND_WORKERS.md'
        },
        {
          domainId: 'kdom-commercial-relationships',
          name: 'Direct Customer Discovery Relationships & Private Leads',
          criticality: 'CRITICAL',
          primaryOwnerPersonId: 'person-founder-01',
          backupOwnerPersonId: null,
          hasVerifiedRunbook: false,
          runbookArtifactRef: null
        }
      ],
      updatedAt: new Date().toISOString()
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
      console.warn('[VAConstellationStore] Failed to parse stored workspace, resetting to default:', err);
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
      console.error('[VAConstellationStore] Failed to save workspace:', err);
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
      throw new Error('Incompatible or invalid Constellation workspace JSON schema');
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
