const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const VAConstellationEngine = require('../assets/js/features/constellation-engine.js');

test('evaluateRoleClarity verifies purpose, outcomes, and responsibilities', () => {
  const clearRole = {
    roleId: 'role-test-clear',
    title: 'Customer Discovery Lead',
    purpose: 'Own primary customer interviews and extract Willingness-to-Pay proof.',
    accountableOutcomes: ['15 documented interviews', '3 paid pilots'],
    recurringResponsibilities: [
      { responsibilityId: 'resp-1', title: 'Weekly calls', cadence: 'WEEKLY', isDelegatable: false }
    ],
    requiredCapabilities: ['cap-customer-discovery'],
    currentOwnerId: 'person-1',
    weeklyHoursCapacityRequired: 15
  };

  const res = VAConstellationEngine.evaluateRoleClarity(clearRole);
  assert.equal(res.isClear, true);
  assert.equal(res.outcomesCount, 2);
  assert.equal(res.responsibilitiesCount, 1);
  assert.equal(res.hasAssignedOwner, true);

  const vagueRole = { roleId: 'role-vague', title: 'Marketing Guy', purpose: 'Do stuff' };
  const vagueRes = VAConstellationEngine.evaluateRoleClarity(vagueRole);
  assert.equal(vagueRes.isClear, false);
});

test('detectBottlenecks identifies overallocation and approval centralization', () => {
  const ws = {
    people: [
      {
        personId: 'p1',
        displayName: 'Founder',
        relationship: 'FOUNDER',
        assignedRoleIds: ['r1', 'r2'],
        totalWeeklyCapacityHours: 40,
        roleAllocationsPercent: [
          { roleId: 'r1', allocationPercent: 70 },
          { roleId: 'r2', allocationPercent: 50 }
        ]
      }
    ],
    roles: [
      { roleId: 'r1', title: 'Eng', weeklyHoursCapacityRequired: 25, currentOwnerId: 'p1', status: 'ACTIVE_OWNED' },
      { roleId: 'r2', title: 'Sales', weeklyHoursCapacityRequired: 25, currentOwnerId: 'p1', status: 'ACTIVE_OWNED' }
    ],
    decisionRights: [
      { decisionClassId: 'd1', scope: 'COMPANY_STRATEGY_PIVOT', deciderRoleId: 'r1' },
      { decisionClassId: 'd2', scope: 'PRODUCT_SCOPE_ROADMAP', deciderRoleId: 'r1' },
      { decisionClassId: 'd3', scope: 'CUSTOMER_PRICING_TERMS', deciderRoleId: 'r1' },
      { decisionClassId: 'd4', scope: 'HIRING_TERMINATION', deciderRoleId: 'r1' }
    ]
  };

  const res = VAConstellationEngine.detectBottlenecks(ws);
  assert.equal(res.overallocatedPeople.length, 1);
  assert.equal(res.overallocatedPeople[0].totalAllocatedPercent, 120);
  assert.equal(res.founderApprovalRatio, 1.0);
  assert.equal(res.approvalBottleneckSeverity, 'CRITICAL_CENTRALIZATION');
});

test('detectBottlenecks flags decision authority collisions', () => {
  const ws = {
    people: [],
    roles: [],
    decisionRights: [
      { decisionClassId: 'd1', scope: 'CUSTOMER_PRICING_TERMS', deciderRoleId: 'r-sales' },
      { decisionClassId: 'd2', scope: 'CUSTOMER_PRICING_TERMS', deciderRoleId: 'r-prod' }
    ]
  };

  const res = VAConstellationEngine.detectBottlenecks(ws);
  assert.equal(res.hasDecisionCollision, true);
  assert.equal(res.decisionCollisions[0].scope, 'CUSTOMER_PRICING_TERMS');
});

test('evaluateCapabilityCoverage identifies covered vs SPOF vs missing capabilities', () => {
  const ontology = [
    { capabilityId: 'cap-eng', name: 'Engineering', domain: 'ENGINEERING_ARCHITECTURE' },
    { capabilityId: 'cap-sales', name: 'Sales', domain: 'COMMERCIAL_DISCOVERY_SALES' },
    { capabilityId: 'cap-legal', name: 'Legal', domain: 'LEGAL_COMPLIANCE' }
  ];

  const people = [
    { personId: 'p1', displayName: 'Alice', capabilitiesPossessed: ['cap-eng', 'cap-sales'] },
    { personId: 'p2', displayName: 'Bob', capabilitiesPossessed: ['cap-eng'] }
  ];

  const required = ['cap-eng', 'cap-sales', 'cap-legal'];
  const res = VAConstellationEngine.evaluateCapabilityCoverage(required, people, ontology);

  assert.equal(res.totalRequired, 3);
  assert.equal(res.coveredCount, 1); // cap-eng is possessed by both Alice & Bob
  assert.equal(res.singlePointCount, 1); // cap-sales is possessed only by Alice
  assert.equal(res.missingCount, 1); // cap-legal is possessed by no one
  assert.equal(res.missingCapabilities[0].capabilityId, 'cap-legal');
});

test('evaluateFounderLoad identifies delegatable recurring hours and candidates', () => {
  const founder = {
    personId: 'p-founder',
    displayName: 'Founder Alex',
    assignedRoleIds: ['r-core', 'r-routine']
  };

  const roles = [
    {
      roleId: 'r-core',
      title: 'Strategic Lead',
      weeklyHoursCapacityRequired: 20,
      recurringResponsibilities: [
        { responsibilityId: 'resp-core-1', title: 'Strategic Roadmap', isDelegatable: false }
      ]
    },
    {
      roleId: 'r-routine',
      title: 'Operations',
      weeklyHoursCapacityRequired: 20,
      recurringResponsibilities: [
        { responsibilityId: 'resp-rout-1', title: 'Drafting weekly social posts', cadence: 'WEEKLY', isDelegatable: true, delegationDifficulty: 'LOW' },
        { responsibilityId: 'resp-rout-2', title: 'Routine log triage', cadence: 'DAILY', isDelegatable: true, delegationDifficulty: 'LOW' }
      ]
    }
  ];

  const res = VAConstellationEngine.evaluateFounderLoad(founder, roles, []);
  assert.ok(res.totalRecurringHours > 0);
  assert.ok(res.delegatableHours > 0);
  assert.equal(res.delegatableItems.length, 2);
  assert.equal(res.delegationReadiness, 'HIGH_DELEGATION_POTENTIAL');
});

test('generateDelegationPacket creates complete delegation contract', () => {
  const packet = VAConstellationEngine.generateDelegationPacket({
    delegationId: 'del-test-01',
    title: 'Customer Onboarding Setup',
    delegatorRoleId: 'role-founder',
    delegateeRoleId: 'role-ops-contractor',
    intendedOutcome: 'Provision customer account within 1 hour of payment receipt',
    decisionAuthorityGranted: 'DECIDE_AND_INFORM',
    operatingConstraints: ['No customer PII stored unencrypted'],
    successCriteria: ['Zero setup errors']
  });

  assert.equal(packet.delegationId, 'del-test-01');
  assert.equal(packet.status, 'ACTIVE_DELEGATED');
  assert.equal(packet.decisionAuthorityGranted, 'DECIDE_AND_INFORM');
  assert.ok(packet.operatingConstraints.length > 0);
});

test('analyzeKnowledgeRisk evaluates Bus Factor = 1 and continuity score', () => {
  const people = [{ personId: 'p1', displayName: 'Sole Dev' }];
  const domains = [
    {
      domainId: 'kdom-db',
      name: 'Production DB Cluster',
      criticality: 'CRITICAL',
      primaryOwnerPersonId: 'p1',
      backupOwnerPersonId: null,
      hasVerifiedRunbook: false,
      runbookArtifactRef: null
    },
    {
      domainId: 'kdom-docs',
      name: 'User Docs',
      criticality: 'LOW',
      primaryOwnerPersonId: 'p1',
      backupOwnerPersonId: null,
      hasVerifiedRunbook: true,
      runbookArtifactRef: 'DOCS.md'
    }
  ];

  const res = VAConstellationEngine.analyzeKnowledgeRisk(domains, people);
  assert.equal(res.criticalVulnerabilitiesCount, 1);
  assert.equal(res.continuityGrade, 'CRITICAL_BUS_FACTOR');
  assert.equal(res.riskItems[0].isBusFactorOne, true);
});

test('evaluateHiringNeed challenges premature hiring before PMF/WTP', () => {
  const prematureSalesCase = {
    caseId: 'hcase-sales-01',
    proposedRoleTitle: 'VP of Sales',
    bottleneckProblemSolved: 'Need revenue',
    evidenceOfBottleneck: 'No outbound calls',
    evaluatedAlternatives: [
      { alternativeType: 'FULL_TIME_HIRE', feasibility: 'PREFERRED', rationale: 'Hire seasoned sales leader' }
    ],
    recommendedForm: 'EMPLOYEE'
  };

  const res = VAConstellationEngine.evaluateHiringNeed(prematureSalesCase, {
    hasRepeatableSalesProcess: false,
    hasObservedPaidCustomers: false
  });

  assert.equal(res.verdict, 'CHALLENGE_ASSUMPTION_PREMATURE');
  assert.ok(res.flags.some(f => f.includes('PREMATURE_SALES_HIRE')));
});

test('analyzeMeetingContinuity and evaluateOperatingCadence detect meeting bloat', () => {
  const meetings = [
    { meetingId: 'm1', title: 'Sync 1', durationMinutes: 60, participantPersonIds: ['p1', 'p2'], decisionsProduced: [], commitmentsCreated: [] },
    { meetingId: 'm2', title: 'Sync 2', durationMinutes: 60, participantPersonIds: ['p1', 'p2'], decisionsProduced: [], commitmentsCreated: [] }
  ];

  const res = VAConstellationEngine.analyzeMeetingContinuity(meetings);
  assert.equal(res.zeroOutputMeetingsCount, 2);
  assert.equal(res.meetingBloatAlert, 'HIGH_MEETING_BLOAT_DETECTED');

  const cadenceSolo = VAConstellationEngine.evaluateOperatingCadence('SOLO_FOUNDER');
  assert.equal(cadenceSolo.maxWeeklyMeetingHoursRecommended, 1.0);
  assert.ok(cadenceSolo.avoidRituals.includes('Daily syncs'));
});

test('all 10 Constellation fixtures in data/ parse and pass diagnostic assertions', () => {
  const fixturesPath = path.join(__dirname, '..', 'data', 'constellation-fixtures.json');
  const { fixtures } = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  assert.equal(fixtures.length, 10);

  // Fixture 1: Solo founder mode
  const fixSolo = fixtures.find(f => f.id === 'fix-solo-founder');
  const covSolo = VAConstellationEngine.evaluateCapabilityCoverage(
    fixSolo.requiredCapabilities,
    fixSolo.people,
    [
      { capabilityId: 'cap-sw-eng-architecture', name: 'Eng' },
      { capabilityId: 'cap-prod-design', name: 'Design' },
      { capabilityId: 'cap-customer-discovery', name: 'Discovery' }
    ]
  );
  assert.equal(covSolo.missingCount, 1);

  // Fixture 4: Overloaded founder
  const fixOverloaded = fixtures.find(f => f.id === 'fix-overloaded-founder');
  const bnOverloaded = VAConstellationEngine.detectBottlenecks(fixOverloaded);
  assert.equal(bnOverloaded.overallocatedPeople.length, 1);
  assert.equal(bnOverloaded.overallocatedPeople[0].totalAllocatedPercent, 160);

  // Fixture 6: Decision collision
  const fixCollision = fixtures.find(f => f.id === 'fix-decision-collision');
  const bnCollision = VAConstellationEngine.detectBottlenecks(fixCollision);
  assert.equal(bnCollision.hasDecisionCollision, true);

  // Fixture 7: Bus factor one
  const fixBusFactor = fixtures.find(f => f.id === 'fix-bus-factor-one');
  const kr = VAConstellationEngine.analyzeKnowledgeRisk(fixBusFactor.knowledgeDomains, fixBusFactor.people);
  assert.equal(kr.criticalVulnerabilitiesCount, 1);
});
