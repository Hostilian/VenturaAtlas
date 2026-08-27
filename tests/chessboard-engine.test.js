const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ChessboardEngine = require('../assets/js/features/chessboard-engine.js');
const { validateChessboardWorkspace } = require('../assets/js/core/chessboard-store.js');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE_DOGFOOD_PATH = path.join(
  ROOT,
  '.agent-state',
  'chessboard',
  'idea-061-market-structure.json'
);
const HAS_PRIVATE_DOGFOOD = fs.existsSync(PRIVATE_DOGFOOD_PATH);
const CHESSBOARD_SCHEMA = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'schemas', 'chessboard-workspace.schema.json'),
  'utf8'
));
const schemaValidator = new Ajv2020({ allErrors: true, strict: false });
addFormats(schemaValidator);
const validateSchema = schemaValidator.compile(CHESSBOARD_SCHEMA);

const REQUIRED_STRESS_TYPES = Object.freeze([
  'INCUMBENT_BUNDLE',
  'API_PRICE_3X',
  'API_ACCESS_REMOVAL',
  'MODEL_IMPROVEMENT_90_PERCENT',
  'OPEN_SOURCE_EQUIVALENT',
  'CUSTOMER_BUILD_TWO_DAYS',
  'INTEROPERABILITY_OPENING',
  'PLATFORM_LOCK_IN',
  'PLATFORM_OPENING',
  'SUPPLIER_ENTRY',
  'CUSTOMER_CONSOLIDATION',
  'COMPETITOR_ACQUISITION',
  'ACQUISITION_TARGET_DEPENDENCE'
]);
const SURVIVAL_STATUSES = Object.freeze(['SURVIVES', 'DAMAGED', 'THESIS_BREAKS', 'UNKNOWN']);

function sourceRecord(sourceId, overrides = {}) {
  return {
    sourceId,
    title: `Source ${sourceId}`,
    url: `https://example.test/${sourceId}`,
    visibility: 'PUBLIC',
    sourceClass: 'PRIMARY_OR_OFFICIAL',
    evidenceEligible: true,
    provenanceEligible: true,
    publishedAt: '2026-01-01T00:00:00Z',
    retrievedAt: '2026-01-02T00:00:00Z',
    lastVerifiedAt: '2026-01-02T00:00:00Z',
    freshnessPolicyDays: 30,
    status: 'ACTIVE',
    supersedesSourceRefs: [],
    supportsClaimRefs: [],
    refutesClaimRefs: [],
    ...overrides
  };
}

function actor(actorId, name, type, overrides = {}) {
  return {
    actorId,
    name,
    type,
    marketRefs: ['market-audit'],
    assets: [],
    dependencyRefs: [],
    controlPointRefs: [],
    incentives: ['Retain control of customer workflow'],
    observedMoveRefs: [],
    epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
    sourceRefs: ['source-current'],
    ...overrides
  };
}

function strategicEvent(eventId, eventType, actorRefs, overrides = {}) {
  return {
    eventId,
    eventDate: '2026-06-01T00:00:00Z',
    observedAt: '2026-06-02T00:00:00Z',
    actorRefs,
    eventType,
    description: `${eventType} test event`,
    affectedLayerRefs: ['layer-application'],
    affectedControlPointRefs: [],
    affectedDependencyRefs: [],
    sourceRefs: ['source-current'],
    strategicImplication: 'Re-test substitution, switching, and control mechanisms.',
    implicationState: 'SOURCE_SUPPORTED_INFERENCE',
    shockgraphShockRef: null,
    ...overrides
  };
}

function baseWorkspace() {
  return {
    schemaVersion: '1.1.0',
    workspaceMode: 'PRIVATE_STRATEGY',
    privacyScope: 'PRIVATE_REPOSITORY_ONLY',
    workspaceId: 'chessboard-test',
    selectionAuthority: {
      state: 'NO_AUTHORITATIVE_ACTIVE_VENTURE',
      authorityPath: '.agent-system/state.json',
      activeVentureId: null,
      analysisTargetBasis: 'EXPLICIT_NON_AUTHORITATIVE_DOGFOOD',
      evaluatedAt: '2026-06-03T00:00:00Z',
      discrepancies: [],
      rationale: 'The fixture is an explicitly non-authoritative dogfood target.'
    },
    canonicalIdeaId: 'idea-001',
    canonicalIdeaRevision: 'a'.repeat(64),
    ventureName: 'Neutral Audit',
    snapshot: {
      snapshotId: 'snapshot-test',
      asOf: '2026-06-03T00:00:00Z',
      status: 'CURRENT',
      priorSnapshotRef: null,
      researchCutoff: '2026-06-02T00:00:00Z',
      notes: 'Private fixture.'
    },
    marketDefinitions: [
      {
        marketId: 'market-audit',
        name: 'Cross-platform AI workflow audit',
        jobs: ['Verify AI-generated workflow artifacts'],
        buyerActorRefs: ['actor-buyer'],
        budget: 'Engineering governance budget',
        includedAlternativeActorRefs: ['actor-competitor'],
        excludedAlternativeActorRefs: [],
        reason: 'The alternatives compete for the same verification job and budget.',
        confidence: 'MEDIUM',
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        sourceRefs: ['source-current'],
        phaseShiftMarketRef: null
      }
    ],
    actors: [
      actor('actor-venture', 'Neutral Audit', 'VENTURE', {
        assets: ['audit workflow', 'cross-platform neutrality'],
        dependencyRefs: ['dependency-model-api'],
        incentives: ['Own neutral verification workflow']
      }),
      actor('actor-buyer', 'Governance buyer', 'ECONOMIC_BUYER', {
        assets: ['procurement authority'],
        incentives: ['Reduce workflow risk']
      }),
      actor('actor-competitor', 'Suite Auditor', 'DIRECT_COMPETITOR', {
        assets: ['audit workflow', 'suite distribution'],
        incentives: ['Defend suite retention']
      }),
      actor('actor-provider', 'Model API Provider', 'MODEL_PROVIDER', {
        assets: ['single model API'],
        controlPointRefs: ['control-model-api'],
        incentives: ['Capture downstream application value']
      }),
      actor('actor-incumbent', 'Workflow Suite', 'ADJACENT_INCUMBENT', {
        assets: ['installed base', 'suite distribution', 'billing relationship'],
        incentives: ['Defend suite retention']
      }),
      actor('actor-open-source', 'Free Audit Project', 'OPEN_SOURCE_PROJECT', {
        assets: ['free equivalent capability'],
        incentives: ['Broaden adoption']
      })
    ],
    valueChainLayers: [
      {
        layerId: 'layer-application',
        name: 'Audit application',
        sequence: 3,
        actorRefs: ['actor-venture', 'actor-competitor', 'actor-incumbent'],
        inputs: ['Model output'],
        outputs: ['Verified audit record'],
        economics: 'Application subscription paid by governance buyer.',
        switching: 'History export and integration reconstruction determine switching friction.',
        concentration: 'MEDIUM',
        commodityState: 'CONTESTED',
        controlPointRefs: ['control-model-api'],
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        sourceRefs: ['source-current']
      }
    ],
    controlPoints: [
      {
        controlPointId: 'control-model-api',
        layerRef: 'layer-application',
        controllerActorRef: 'actor-provider',
        controlledResource: 'Model API access',
        dependentActorRefs: ['actor-venture'],
        mechanism: 'Provider controls API availability, price, and interface compatibility.',
        switchability: 'LOW',
        alternativeActorRefs: [],
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        sourceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter']
      }
    ],
    dependencies: [
      {
        dependencyId: 'dependency-model-api',
        dependentActorRefs: ['actor-venture'],
        providerActorRef: 'actor-provider',
        resource: 'Single model API',
        criticality: 'VERY_HIGH',
        switchingCost: 'HIGH',
        providerPower: 'HIGH',
        switchingProcess: {
          dataMigration: 'Export and re-map audit records.',
          integrationRebuild: 'Replace provider-specific API integration.',
          userTraining: 'Low retraining burden.',
          workflowChange: 'Revalidate audit workflow behavior.',
          contractCost: 'No recorded termination fee.',
          networkLoss: 'Not applicable.',
          historicalContextLoss: 'Audit history remains portable only if export is complete.',
          organizationalPolitics: 'Security and procurement must reapprove a provider.',
          riskTrust: 'New provider output must regain audit trust.',
          searchCost: 'Alternative-provider evaluation is required.'
        },
        multiHoming: {
          allowed: 'CONDITIONAL',
          sides: ['venture'],
          friction: 'MEDIUM',
          cost: 'Parallel provider integration adds engineering and evaluation cost.',
          portability: 'Audit records are portable; provider-specific prompts are not fully portable.',
          networkStateLoss: 'No network state is lost.'
        },
        alternativeActorRefs: [],
        alternativeDescriptions: [],
        contractualConstraints: ['No continuity commitment beyond published terms'],
        technicalConstraints: ['Provider-specific API integration'],
        providerEntryRisk: 'HIGH',
        priceExposure: 'HIGH',
        accessExposure: 'HIGH',
        controlPointRef: 'control-model-api',
        shockgraphDependencyRef: null,
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        sourceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter']
      }
    ],
    ecosystemEdges: [
      {
        edgeId: 'edge-venture-competitor',
        fromActorRef: 'actor-venture',
        toActorRef: 'actor-competitor',
        type: 'COMPETES_WITH',
        marketRefs: ['market-audit'],
        mechanism: 'Both products sell audit workflow capability to the same buyer budget.',
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        sourceRefs: ['source-current']
      }
    ],
    responses: [
      {
        responseId: 'response-incumbent-bundle',
        actorRef: 'actor-incumbent',
        targetActorRefs: ['actor-venture'],
        trigger: 'The venture wins material suite customers.',
        triggerEventRefs: [],
        possibleAction: 'BUNDLE',
        ability: 'HIGH',
        abilityMechanism: 'Existing suite distribution and billing can carry an audit feature.',
        incentive: 'MEDIUM',
        incentiveMechanism: 'Retention benefit competes with cannibalization of an add-on.',
        timeToExecute: 'MONTHS',
        likelyImpact: 'Basic audit capability could become included in an existing contract.',
        constraints: ['Neutral cross-platform verification conflicts with suite self-preference.'],
        countermoves: ['Own cross-platform verification state'],
        epistemicState: 'MODEL_HYPOTHESIS',
        sourceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter'],
        falsifier: 'The incumbent cannot ship the overlapping workflow through its suite.'
      }
    ],
    strategicClaims: [
      {
        claimId: 'STR-NEUTRALITY',
        subject: 'Cross-platform neutrality',
        claim: 'Neutral verification could retain value after suite bundling.',
        epistemicState: 'MODEL_HYPOTHESIS',
        mechanism: 'A suite vendor has a credibility conflict when auditing its own ecosystem.',
        actorRef: 'actor-venture',
        controlPointRef: 'control-model-api',
        asset: 'Cross-platform audit history',
        beneficiaries: ['Governance buyers'],
        disadvantaged: ['Self-preferencing suite incumbents'],
        conditions: ['Buyers must value independent verification.'],
        evidenceRefs: ['source-current', 'source-old'],
        counterEvidenceRefs: ['source-counter'],
        timeHorizon: 'MONTHS',
        falsifier: 'Buyers accept bundled self-audit as equivalent to independent verification.',
        asOf: '2026-06-03T00:00:00Z',
        confidence: 'LOW',
        status: 'ACTIVE',
        contradictionStatus: 'NONE',
        resolution: null
      }
    ],
    moatMechanisms: [
      {
        moatId: 'moat-workflow-history',
        mechanism: 'SYSTEM_OF_RECORD_POSITION',
        ownerActorRef: 'actor-venture',
        asset: 'Authoritative audit workflow history',
        accumulationProcess: 'Verified decisions accumulate in customer workflows.',
        customerEffect: 'Removing the system requires history migration and integration reconstruction.',
        attackerActorRefs: ['actor-competitor'],
        attackerCost: 'Reconstruct integrations and obtain trusted workflow history.',
        timeToReplicate: 'MONTHS',
        conditions: ['The product remains the authoritative audit record.'],
        dependencyRefs: ['dependency-model-api'],
        decayRisks: ['Interoperability can reduce migration friction.'],
        halfLife: 'MEDIUM',
        evidenceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter'],
        relatedClaimRefs: ['STR-NEUTRALITY'],
        falsifier: 'Customers export complete history and rebuild integrations without material work.',
        epistemicState: 'MODEL_HYPOTHESIS',
        status: 'CONDITIONAL'
      }
    ],
    antiMoats: [
      {
        antiMoatId: 'anti-moat-support',
        mechanism: 'Customer-specific integrations increase exception handling.',
        actorRef: 'actor-venture',
        growthTrigger: 'More customer accounts with unique integrations',
        negativeEffect: 'Support workload grows faster than customer count.',
        scalingBehavior: 'Support requests grow superlinearly with customer count.',
        possibleMitigations: ['Standardized adapters'],
        attackerActorRefs: ['actor-provider'],
        conditions: ['Customer-specific integration diversity continues to rise.'],
        decayRisks: ['Standardized adapters reduce exception handling.'],
        evidenceRefs: [],
        counterEvidenceRefs: [],
        relatedClaimRefs: ['STR-NEUTRALITY'],
        epistemicState: 'MODEL_HYPOTHESIS',
        falsifier: 'Support hours per customer fall as customer count grows.',
        status: 'HYPOTHESIS'
      }
    ],
    commoditizationRisks: [
      {
        riskId: 'commoditization-basic-audit',
        capability: 'Basic audit checks',
        currentDifferentiation: 'Packaged workflow and rules',
        drivers: ['API_AVAILABILITY'],
        replacementSources: ['Adjacent suite features'],
        costTrend: 'STABLE',
        availabilityTrend: 'STABLE',
        timeHorizon: 'MONTHS',
        ventureImpact: 'Standalone willingness to pay could fall.',
        remainingDifferentiation: 'Trusted cross-platform workflow history and independent verification.',
        dependencyRefs: ['dependency-model-api'],
        eventRefs: [],
        evidenceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter'],
        epistemicState: 'SOURCE_SUPPORTED_INFERENCE',
        falsifier: 'Equivalent free implementations fail to cover the buyer job.'
      }
    ],
    events: [],
    stressScenarios: [
      {
        scenarioId: 'scenario-bundle',
        stressType: 'INCUMBENT_BUNDLE',
        name: 'Suite bundles basic audit',
        threatActorRef: 'actor-incumbent',
        eventRefs: [],
        trigger: 'Incumbent includes overlapping capability in its base contract.',
        assumptions: ['The incumbent can distribute to the same buyer.'],
        affectedDependencyRefs: ['dependency-model-api'],
        affectedMoatRefs: ['moat-workflow-history'],
        affectedPositionRefs: ['position-neutral'],
        impact: 'Basic feature differentiation loses standalone value.',
        countermoves: ['Own neutral cross-platform verification state'],
        survivalCondition: 'Buyers value independent cross-platform verification.',
        survivalStatus: 'DAMAGED',
        falsifier: 'Bundling does not change buyer willingness to pay.',
        epistemicState: 'SCENARIO',
        sourceRefs: ['source-current']
      }
    ],
    positions: [
      {
        positionId: 'position-neutral',
        positionType: 'NEUTRAL_CROSS_PLATFORM_LAYER',
        targetLayerRef: 'layer-application',
        actorRef: 'actor-venture',
        customerValue: 'Independent verification across competing provider ecosystems.',
        dependencyRefs: ['dependency-model-api'],
        controlPointRefs: ['control-model-api'],
        controlledAssets: ['Cross-platform audit history'],
        requiredAssets: ['Cross-platform audit history', 'Independent buyer trust'],
        switching: 'Conditional on portable audit history and provider-neutral integrations.',
        distribution: 'Direct to governance buyers and through cross-platform integrations.',
        commoditizationRiskRefs: ['commoditization-basic-audit'],
        vulnerabilities: ['Single model API dependency'],
        responseRefs: ['response-incumbent-bundle'],
        evidenceRefs: ['source-current'],
        counterEvidenceRefs: ['source-counter'],
        epistemicState: 'MODEL_HYPOTHESIS',
        status: 'CANDIDATE',
        falsifier: 'Buyers do not value cross-platform neutrality.'
      }
    ],
    researchGaps: [
      {
        gapId: 'gap-neutrality-demand',
        question: 'Will buyers pay for independent cross-platform verification?',
        decisionRelevance: 'CRITICAL',
        relatedClaimRefs: ['STR-NEUTRALITY'],
        whatChanges: 'A negative answer rejects the proposed neutral position.',
        requiredEvidence: ['Buyer procurement interviews'],
        nextAction: 'Interview five governance buyers.',
        status: 'OPEN'
      }
    ],
    handoffs: [
      {
        handoffId: 'handoff-mercury-neutrality',
        targetSystem: 'MERCURY',
        relatedClaimRefs: ['STR-NEUTRALITY'],
        trigger: 'Buyer-demand evidence is missing.',
        structuredQuestion: 'Will the buyer pay specifically for independent cross-platform verification?',
        boundary: 'CHESSBOARD supplies the structural hypothesis; MERCURY owns buyer validation.',
        privacy: 'PRIVATE'
      }
    ],
    sourceRecords: [
      sourceRecord('source-current', {
        title: 'Current official product page',
        publishedAt: '2026-05-01T00:00:00Z',
        retrievedAt: '2026-06-02T00:00:00Z',
        lastVerifiedAt: '2026-06-02T00:00:00Z',
        supersedesSourceRefs: ['source-old'],
        supportsClaimRefs: ['STR-NEUTRALITY']
      }),
      sourceRecord('source-old', {
        title: 'Old official product page',
        publishedAt: '2024-01-01T00:00:00Z',
        retrievedAt: '2024-01-02T00:00:00Z',
        lastVerifiedAt: '2024-01-02T00:00:00Z',
        status: 'STALE',
        supportsClaimRefs: ['STR-NEUTRALITY']
      }),
      sourceRecord('source-counter', {
        title: 'Counterevidence research',
        sourceClass: 'RESEARCH_PUBLICATION',
        refutesClaimRefs: ['STR-NEUTRALITY']
      })
    ],
    legacyScoreAudit: {
      status: 'PRESERVED_NOT_MODIFIED',
      dimensionsReviewed: ['defensibility', 'competitiveAdvantage'],
      mechanismCoverage: 'PARTIAL',
      mutationAuthorized: false,
      methodologyChange: false,
      notes: 'Legacy dimensions are observed only; no score or ranking mutation is authorized.'
    }
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

test('canonical workspace passes deterministic semantic validation', () => {
  const workspace = baseWorkspace();
  const first = ChessboardEngine.validateWorkspace(baseWorkspace());
  const second = ChessboardEngine.validateChessboardDocument(baseWorkspace());

  assert.equal(validateSchema(workspace), true, JSON.stringify(validateSchema.errors));
  assert.deepEqual(validateChessboardWorkspace(workspace), []);
  assert.equal(first.valid, true, JSON.stringify(first.errors));
  assert.deepEqual(second, first);
  assert.equal(first.counts.ecosystemEdges, 1);
  assert.equal(first.counts.responses, 1);
  assert.equal(first.counts.commoditizationRisks, 1);
  assert.equal(first.counts.events, 0);
  assert.equal(first.counts.sourceRecords, 3);
});

test('schema 1.1.0 and browser-store contracts reject missing or undeclared structural fields', () => {
  const cases = [
    ['wrong schema version', workspace => { workspace.schemaVersion = '1.0.0'; }],
    ['missing provider power', workspace => { delete workspace.dependencies[0].providerPower; }],
    ['incomplete switching process', workspace => { delete workspace.dependencies[0].switchingProcess.searchCost; }],
    ['invalid multi-homing state', workspace => { workspace.dependencies[0].multiHoming.allowed = true; }],
    ['missing anti-moat status', workspace => { delete workspace.antiMoats[0].status; }],
    ['missing remaining differentiation', workspace => { delete workspace.commoditizationRisks[0].remainingDifferentiation; }],
    ['missing stress type', workspace => { delete workspace.stressScenarios[0].stressType; }],
    ['invalid survival status', workspace => { workspace.stressScenarios[0].survivalStatus = 'WEAKENED'; }],
    ['missing position assets', workspace => { delete workspace.positions[0].requiredAssets; }],
    ['undeclared nested field', workspace => { workspace.dependencies[0].switchingProcess.magicScore = 0.9; }]
  ];

  for (const [label, mutate] of cases) {
    const candidate = deepClone(baseWorkspace());
    mutate(candidate);
    assert.equal(validateSchema(candidate), false, `${label} passed JSON Schema unexpectedly`);
    assert.notDeepEqual(
      validateChessboardWorkspace(candidate),
      [],
      `${label} passed the browser-store contract unexpectedly`
    );
  }
});

test('schema declares the complete required stress suite and closed survival vocabulary', () => {
  const stressProperties = CHESSBOARD_SCHEMA.$defs.stressScenario.properties;
  const declaredStressTypes = stressProperties.stressType.enum;

  assert.deepEqual(
    REQUIRED_STRESS_TYPES.filter(stressType => !declaredStressTypes.includes(stressType)),
    []
  );
  assert.deepEqual(stressProperties.survivalStatus.enum, SURVIVAL_STATUSES);
  assert.equal(new Set(declaredStressTypes).size, declaredStressTypes.length);
  assert.equal(new Set(stressProperties.survivalStatus.enum).size, SURVIVAL_STATUSES.length);
});

test('acceptance 01 — direct competitor trace reaches actor, source, overlap, and structural differences', () => {
  const result = ChessboardEngine.analyzeDirectCompetitor(baseWorkspace(), 'actor-competitor');

  assert.equal(result.status, 'TRACEABLE');
  assert.equal(result.actor.actorId, 'actor-competitor');
  assert.ok(result.sources.some(source => source.sourceId === 'source-current'));
  assert.ok(result.productOverlap.some(value => value === 'MARKET:market-audit'));
  assert.ok(result.structuralDifferences.includes('COMPETITOR_ONLY_ASSET:suite distribution'));
});

test('acceptance 02 — incumbent suite distribution surfaces conditional bundle exposure', () => {
  const result = ChessboardEngine.assessBundleExposure({
    overlappingCapability: 'Basic audit checks',
    sameBuyerContract: true,
    incumbentDistribution: true,
    implementationPath: 'Ship through the existing governance suite',
    marginalPrice: 'included',
    remainingDifferentiation: 'Independent cross-platform verification',
    sourceRefs: ['source-current']
  });

  assert.equal(result.exposed, true);
  assert.equal(result.status, 'CONDITIONAL_EXPOSURE');
  assert.equal(result.mechanism, 'CAPABILITY_INCLUDED_IN_EXISTING_CONTRACT');
});

test('acceptance 03 — single model API dependency exposes provider control and switching', () => {
  const result = ChessboardEngine.traceDependencyControlChain(baseWorkspace(), 'dependency-model-api');

  assert.equal(result.status, 'TRACEABLE');
  assert.equal(result.provider.actorId, 'actor-provider');
  assert.equal(result.controlPoint.controlPointId, 'control-model-api');
  assert.equal(result.singleProvider, true);
  assert.equal(result.switching, 'HIGH');
  assert.deepEqual(result.chain.map(node => node.kind), [
    'DEPENDENT_ACTOR', 'DEPENDENCY', 'CONTROL_POINT', 'PROVIDER_ACTOR'
  ]);
});

test('acceptance 04 — more users equals more data is rejected as a network effect', () => {
  const result = ChessboardEngine.testNetworkEffect({ claim: 'More users = more data' });

  assert.equal(result.status, 'REJECTED');
  assert.equal(result.qualifies, false);
  assert.equal(result.mechanismType, 'DATA_ACCUMULATION_NOT_NETWORK_EFFECT');
});

test('acceptance 05 — reciprocal marketplace value loops identify a cross-side effect and multi-homing', () => {
  const result = ChessboardEngine.testNetworkEffect({
    participants: ['buyers', 'sellers'],
    valueLoops: [
      { fromSide: 'buyers', toSide: 'sellers', valueCreated: 'More demand opportunities' },
      { fromSide: 'sellers', toSide: 'buyers', valueCreated: 'More relevant supply' }
    ],
    multiHoming: { allowed: true, friction: 'low' },
    evidenceRefs: ['source-current']
  });

  assert.equal(result.qualifies, true);
  assert.equal(result.mechanismType, 'CROSS_SIDE_NETWORK_EFFECT');
  assert.equal(result.multiHoming.allowed, true);
  assert.equal(result.durabilityConstraint, 'LOW_FRICTION_MULTI_HOMING');
});

test('acceptance 06 — public, portable, and commodity data do not qualify as a data advantage', () => {
  const publicResult = ChessboardEngine.testDataAdvantage({
    ownership: 'PUBLIC',
    lawfulReuse: true,
    performanceLoop: { repeatedCorrections: true, measuredImprovement: true, metric: 'accuracy' }
  });
  const portableResult = ChessboardEngine.testDataAdvantage({
    ownership: 'PROPRIETARY',
    portability: 'HIGH',
    lawfulReuse: true,
    performanceLoop: { repeatedCorrections: true, measuredImprovement: true, metric: 'accuracy' }
  });
  const commodityResult = ChessboardEngine.testDataAdvantage({
    ownership: 'THIRD_PARTY_COMMODITY',
    lawfulReuse: true,
    performanceLoop: { repeatedCorrections: true, measuredImprovement: true, metric: 'accuracy' }
  });

  for (const result of [publicResult, portableResult, commodityResult]) {
    assert.equal(result.status, 'REJECTED');
    assert.equal(result.qualifies, false);
  }
});

test('acceptance 07 — lawful proprietary repeated corrections form only a conditional data advantage', () => {
  const result = ChessboardEngine.testDataAdvantage({
    ownership: 'PROPRIETARY',
    portability: 'LOW',
    lawfulReuse: true,
    performanceLoop: {
      repeatedCorrections: true,
      measuredImprovement: true,
      metric: 'verified error rate'
    },
    falsifier: 'Verified error rate does not improve as retained corrections accumulate.'
  });

  assert.equal(result.status, 'CONDITIONAL');
  assert.equal(result.qualifies, true);
  assert.deepEqual(result.conditions, {
    proprietaryControl: true,
    lawfulReuse: true,
    measuredImprovement: true,
    repeatedLearning: true
  });
});

test('acceptance 08 — open-source release updates substitution and commoditization without mutation', () => {
  const workspace = baseWorkspace();
  const event = strategicEvent('event-open-source', 'OPEN_SOURCE_RELEASE', ['actor-open-source'], {
    affectedDependencyRefs: ['dependency-model-api']
  });
  const before = JSON.stringify(workspace);
  const eventBefore = JSON.stringify(event);
  const result = ChessboardEngine.applyStrategicEvent(workspace, event);

  assert.equal(result.status, 'APPLIED');
  assert.equal(JSON.stringify(workspace), before);
  assert.equal(JSON.stringify(event), eventBefore);
  assert.ok(result.effects.some(effect => effect.kind === 'SUBSTITUTION_AVAILABILITY_INCREASED'));
  assert.ok(result.effects.some(effect => effect.kind === 'COMMODITIZATION_EXPOSURE_INCREASED'));
  assert.ok(result.workspace.dependencies[0].alternativeActorRefs.includes('actor-open-source'));
  assert.ok(result.workspace.commoditizationRisks[0].drivers.includes('OPEN_SOURCE'));
  assert.equal(result.workspace.commoditizationRisks[0].availabilityTrend, 'EXPANDING');
  assert.equal(ChessboardEngine.validateWorkspace(result.workspace).valid, true);
});

test('acceptance 09 — interoperability lowers switching cost and weakens the related moat mechanism', () => {
  const event = strategicEvent('event-interoperability', 'INTEROPERABILITY_CHANGE', ['actor-incumbent'], {
    affectedControlPointRefs: ['control-model-api'],
    affectedDependencyRefs: ['dependency-model-api']
  });
  const result = ChessboardEngine.applyStrategicEvent(baseWorkspace(), event);

  assert.equal(result.workspace.dependencies[0].switchingCost, 'MEDIUM');
  assert.equal(result.workspace.controlPoints[0].switchability, 'MEDIUM');
  assert.equal(result.workspace.moatMechanisms[0].status, 'CONDITIONAL');
  assert.ok(result.workspace.moatMechanisms[0].decayRisks.some(value => value.includes(event.eventId)));
  assert.ok(result.effects.some(effect => effect.kind === 'MOAT_WEAKENED'));
  assert.equal(ChessboardEngine.validateWorkspace(result.workspace).valid, true);
});

test('acceptance 10 — upstream provider entry realizes a vertical-entry threat', () => {
  const event = strategicEvent('event-provider-entry', 'PROVIDER_ENTRY', ['actor-provider'], {
    affectedControlPointRefs: ['control-model-api'],
    affectedDependencyRefs: ['dependency-model-api']
  });
  const result = ChessboardEngine.applyStrategicEvent(baseWorkspace(), event);

  assert.equal(result.status, 'APPLIED');
  assert.equal(result.workspace.dependencies[0].providerEntryRisk, 'VERY_HIGH');
  assert.deepEqual(result.effects.find(effect => effect.kind === 'VERTICAL_ENTRY_RISK_REALIZED'), {
    kind: 'VERTICAL_ENTRY_RISK_REALIZED',
    targetRef: 'dependency-model-api'
  });
});

test('acceptance 11 — incumbent response separates plausible ability from weak cannibalizing incentive', () => {
  const result = ChessboardEngine.analyzeIncumbentResponse({
    actorRef: 'actor-incumbent',
    trigger: 'Venture gains material traction',
    possibleAction: 'BUNDLE',
    ability: 'HIGH',
    abilityMechanism: 'Existing installed base and distribution can carry the feature.',
    incentive: 'LOW',
    incentiveMechanism: 'The response would cannibalize major core revenue.',
    constraints: ['Core revenue cannibalization'],
    timeToExecute: 'MONTHS',
    likelyImpact: 'Standalone willingness to pay falls.',
    countermoves: ['Own a neutral cross-platform layer']
  });

  assert.equal(result.ability.status, 'PLAUSIBLE');
  assert.equal(result.incentive.status, 'WEAK');
  assert.equal(result.incentive.cannibalization, true);
  assert.deepEqual(result.constraints, ['Core revenue cannibalization']);
});

test('acceptance 12 — cheap five-product multi-homing does not become strong lock-in', () => {
  const result = ChessboardEngine.testSwitchingCost({
    multiHoming: { allowed: true, providerCount: 5, friction: 'negligible' },
    switchProcess: []
  });

  assert.equal(result.status, 'LOW_FRICTION');
  assert.equal(result.lockInClaimSupported, false);
  assert.equal(result.providerCount, 5);
});

test('acceptance 13 — authoritative history loss and integration rebuild identify system-of-record friction', () => {
  const result = ChessboardEngine.testSystemOfRecord({
    authoritativeWorkflowState: true,
    historyLossOnRemoval: true,
    integrationRebuildOnRemoval: true,
    migrationRequired: true,
    evidenceRefs: ['source-current']
  });

  assert.equal(result.status, 'CONDITIONAL');
  assert.equal(result.qualifies, true);
  assert.equal(result.mechanism, 'AUTHORITATIVE_WORKFLOW_STATE_REMOVAL_COST');
  assert.equal(result.removalProcess.historyLoss, true);
  assert.equal(result.removalProcess.integrationRebuild, true);
});

test('acceptance 14 — nonlinear support burden is surfaced as an anti-moat', () => {
  const result = ChessboardEngine.evaluateAntiMoat(baseWorkspace().antiMoats[0]);

  assert.equal(result.status, 'CONDITIONAL');
  assert.equal(result.compoundsAgainstVenture, true);
  assert.match(result.negativeOutcome, /Support workload/);
  assert.match(result.scalingBehavior, /superlinearly/);
});

test('acceptance 15 — current official source wins while stale official evidence is preserved', () => {
  const workspace = baseWorkspace();
  const claim = { evidenceRefs: ['source-old', 'source-current'], counterEvidenceRefs: [] };
  const result = ChessboardEngine.resolveSourceConflict(claim, workspace.sourceRecords, {
    asOf: '2026-06-03T00:00:00Z'
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.resolution, 'CURRENT_OFFICIAL_SOURCE_PREFERRED');
  assert.equal(result.winner.sourceId, 'source-current');
  assert.deepEqual(result.preservedEvidence.map(source => source.sourceId).sort(), [
    'source-current', 'source-old'
  ]);
  assert.equal(result.supersededEvidence[0].sourceId, 'source-old');
});

test('acceptance 16 — missing mechanism evidence remains UNKNOWN', () => {
  const dataResult = ChessboardEngine.testDataAdvantage({});
  const recordResult = ChessboardEngine.testSystemOfRecord({});
  const missingClaim = ChessboardEngine.traceClaim(baseWorkspace(), 'STR-MISSING');

  assert.equal(dataResult.status, 'UNKNOWN');
  assert.equal(recordResult.status, 'UNKNOWN');
  assert.equal(missingClaim.status, 'UNKNOWN');
  assert.equal(dataResult.qualifies, false);
});

test('acceptance 17 — scoring governance rejects ungoverned scores and exposes no ranking writer', () => {
  const workspace = baseWorkspace();
  workspace.ecosystemPower = 8;
  workspace.rankingWeights = { defensibility: 2 };
  const validation = ChessboardEngine.validateWorkspace(workspace);
  const forbiddenExports = Object.keys(ChessboardEngine).filter(name => /score|rank|weight/i.test(name));

  assert.deepEqual(forbiddenExports, []);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.code === 'FORBIDDEN_STRATEGIC_SCORE'));

  const clean = baseWorkspace();
  const beforeAudit = deepClone(clean.legacyScoreAudit);
  const result = ChessboardEngine.applyStrategicEvent(
    clean,
    strategicEvent('event-score-governance', 'PROVIDER_ENTRY', ['actor-provider'], {
      affectedDependencyRefs: ['dependency-model-api']
    })
  );
  assert.deepEqual(result.workspace.legacyScoreAudit, beforeAudit);
});

test('acceptance 18 — default-deny public sanitizer excludes private strategic material', () => {
  const workspace = baseWorkspace();
  const sentinel = 'PRIVATE-STRATEGY-SENTINEL-DO-NOT-PUBLISH';
  workspace.privateStrategy = sentinel;
  workspace.responses[0].likelyImpact = sentinel;
  workspace.marketDefinitions[0].visibility = 'PUBLIC';
  workspace.strategicClaims[0].visibility = 'PUBLIC';
  workspace.sourceRecords[2].visibility = 'PRIVATE';
  workspace.sourceRecords[2].title = sentinel;

  const result = ChessboardEngine.sanitizeForPublic(workspace);
  const serialized = JSON.stringify(result);

  assert.equal(result.workspaceMode, 'PUBLIC_SANITIZED');
  assert.equal(result.privacyScope, 'PUBLIC_SANITIZED');
  assert.equal(serialized.includes(sentinel), false);
  assert.deepEqual(result.sourceRecords.map(source => source.sourceId).sort(), ['source-current', 'source-old']);
  assert.deepEqual(result.strategicClaims[0].counterEvidenceRefs, []);
  assert.equal('responses' in result, false);
});

test('acceptance 19 — claim trace reaches every supporting evidence record', () => {
  const result = ChessboardEngine.traceClaim(baseWorkspace(), 'STR-NEUTRALITY');

  assert.equal(result.status, 'TRACEABLE');
  assert.deepEqual(result.evidence.map(source => source.sourceId), ['source-current', 'source-old']);
  assert.deepEqual(result.missingRefs, []);
});

test('acceptance 20 — claim trace preserves counterevidence separately', () => {
  const result = ChessboardEngine.traceStrategicClaim(baseWorkspace(), 'STR-NEUTRALITY');

  assert.equal(result.hasCounterEvidence, true);
  assert.deepEqual(result.counterEvidence.map(source => source.sourceId), ['source-counter']);
  assert.equal(result.claim.counterEvidenceRefs[0], 'source-counter');
});

test('semantic validator rejects duplicate IDs, duplicate references, and dangling references', () => {
  const workspace = baseWorkspace();
  workspace.actors.push(deepClone(workspace.actors[0]));
  workspace.actors[0].marketRefs.push('market-audit');
  workspace.dependencies[0].providerActorRef = 'actor-does-not-exist';
  const result = ChessboardEngine.validateWorkspace(workspace);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.code === 'DUPLICATE_ID'));
  assert.ok(result.errors.some(error => error.code === 'DUPLICATE_REFERENCE'));
  assert.ok(result.errors.some(error =>
    error.code === 'DANGLING_REFERENCE' && error.ref === 'actor-does-not-exist'
  ));
});

test('semantic validator enforces authoritative selection and public/private coherence', () => {
  const selectionConflict = baseWorkspace();
  selectionConflict.selectionAuthority.activeVentureId = 'idea-001';
  const privatePublicConflict = baseWorkspace();
  privatePublicConflict.privacyScope = 'PUBLIC_SANITIZED';

  assert.ok(ChessboardEngine.validateWorkspace(selectionConflict).errors.some(error =>
    error.code === 'SELECTION_AUTHORITY_CONFLICT'
  ));
  assert.ok(ChessboardEngine.validateWorkspace(privatePublicConflict).errors.some(error =>
    error.code === 'PRIVATE_MODE_SCOPE_MISMATCH'
  ));
});

test('declared and source-level contradictions are detected deterministically', () => {
  const workspace = baseWorkspace();
  workspace.strategicClaims[0].contradictionStatus = 'OPEN';
  workspace.strategicClaims[0].counterEvidenceRefs.push('source-current');
  const first = ChessboardEngine.detectContradictions(workspace);
  const second = ChessboardEngine.detectContradictions(workspace);

  assert.deepEqual(first, second);
  assert.equal(first.length, 1);
  assert.equal(first[0].status, 'OPEN');
});

test('strategic brief and research queue remain qualitative, ordered, and deterministic', () => {
  const workspace = baseWorkspace();
  workspace.actors.push(actor('actor-status-quo', 'Manual review', 'STATUS_QUO', {
    pricing: 'Free with existing staff time',
    assets: ['existing buyer workflow'],
    incentives: ['Avoid a new vendor']
  }));
  workspace.marketDefinitions[0].includedAlternativeActorRefs.push('actor-status-quo');
  workspace.responses.push({
    ...deepClone(workspace.responses[0]),
    responseId: 'response-incumbent-self-preference',
    trigger: 'The venture depends on the incumbent-controlled workflow surface.',
    possibleAction: 'SELF_PREFERENCE',
    timeToExecute: 'WEEKS',
    likelyImpact: 'The incumbent can privilege its own workflow before a full bundle ships.'
  });
  workspace.stressScenarios.push({
    ...deepClone(workspace.stressScenarios[0]),
    scenarioId: 'scenario-structural-kill',
    stressType: 'STRUCTURAL_KILL_COMPOSITE',
    name: 'Structural kill combination',
    impact: 'Bundling plus access restriction destroys the neutral-layer thesis.',
    survivalStatus: 'THESIS_BREAKS'
  });
  const firstBrief = ChessboardEngine.buildStrategicBrief(workspace);
  const secondBrief = ChessboardEngine.buildStrategicBrief(workspace);
  const queue = ChessboardEngine.buildResearchQueue(workspace);

  assert.deepEqual(firstBrief, secondBrief);
  assert.equal(firstBrief.venture.canonicalIdeaId, 'idea-001');
  assert.equal(firstBrief.customerJob, 'Verify AI-generated workflow artifacts');
  assert.equal(firstBrief.valueChainPosition.layerId, 'layer-application');
  assert.equal(firstBrief.mainControlPoint.controlPointId, 'control-model-api');
  assert.equal(firstBrief.mainControlPointOwner.actorId, 'actor-provider');
  assert.equal(firstBrief.mainDirectCompetitor.actorId, 'actor-competitor');
  assert.equal(firstBrief.mainSubstitute.actorId, 'actor-status-quo');
  assert.equal(firstBrief.freeSubstitute.actorId, 'actor-status-quo');
  assert.equal(firstBrief.adjacentIncumbent.actorId, 'actor-incumbent');
  assert.equal(firstBrief.criticalDependency.dependencyId, 'dependency-model-api');
  assert.equal(firstBrief.incumbentCheapestResponse.response, 'SELF_PREFERENCE');
  assert.deepEqual(
    firstBrief.incumbentResponseRepertoire.map(item => item.response).sort(),
    ['BUNDLE', 'SELF_PREFERENCE']
  );
  assert.equal(firstBrief.bundleExposure.responseId, 'response-incumbent-bundle');
  assert.equal(firstBrief.multiHoming.allowed, 'CONDITIONAL');
  assert.equal(firstBrief.switchingCost.status, 'CONDITIONAL');
  assert.equal(firstBrief.commoditizingCapability.riskId, 'commoditization-basic-audit');
  assert.equal(firstBrief.candidateMoat.moatId, 'moat-workflow-history');
  assert.equal(firstBrief.moatStatus, 'CONDITIONAL');
  assert.equal(firstBrief.antiMoat.antiMoatId, 'anti-moat-support');
  assert.equal(firstBrief.structuralKillThreat.scenarioId, 'scenario-structural-kill');
  assert.equal(firstBrief.strategicPosition.positionId, 'position-neutral');
  assert.equal(firstBrief.biggestUnknown.gapId, 'gap-neutrality-demand');
  assert.equal(firstBrief.nextResearchQuestion, 'Will buyers pay for independent cross-platform verification?');
  assert.equal(queue[0].gapId, 'gap-neutrality-demand');
  assert.equal(queue[0].decisionRelevance, 'CRITICAL');
  assert.equal(JSON.stringify(firstBrief).includes('NaN'), false);
});

test('all evaluators accept deeply frozen inputs and strategic events remain deterministic', () => {
  const workspace = deepFreeze(baseWorkspace());
  const event = deepFreeze(strategicEvent('event-frozen', 'INTEROPERABILITY_CHANGE', ['actor-incumbent'], {
    affectedControlPointRefs: ['control-model-api'],
    affectedDependencyRefs: ['dependency-model-api']
  }));
  const before = JSON.stringify(workspace);
  const first = ChessboardEngine.applyStrategicEvent(workspace, event);
  const second = ChessboardEngine.applyStrategicEvent(workspace, event);

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(workspace), before);
});

test('private dogfood covers every required stress future with an explicit survival result', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const workspace = JSON.parse(fs.readFileSync(PRIVATE_DOGFOOD_PATH, 'utf8'));
  const declaredTypes = new Set(workspace.stressScenarios.map(scenario => scenario.stressType));
  const requiredScenarios = workspace.stressScenarios.filter(scenario =>
    REQUIRED_STRESS_TYPES.includes(scenario.stressType)
  );

  assert.deepEqual(
    REQUIRED_STRESS_TYPES.filter(stressType => !declaredTypes.has(stressType)),
    []
  );
  assert.equal(requiredScenarios.length, REQUIRED_STRESS_TYPES.length);
  for (const scenario of requiredScenarios) {
    assert.ok(
      SURVIVAL_STATUSES.includes(scenario.survivalStatus),
      `${scenario.scenarioId} has an invalid survival status`
    );
    assert.ok(scenario.survivalCondition.trim(), `${scenario.scenarioId} lacks a survival condition`);
    assert.ok(scenario.falsifier.trim(), `${scenario.scenarioId} lacks a falsifier`);
  }
  assert.equal(validateSchema(workspace), true, JSON.stringify(validateSchema.errors));
  assert.deepEqual(validateChessboardWorkspace(workspace), []);
});

test('every recorded private dogfood event is executable by the deterministic event engine', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const workspace = JSON.parse(fs.readFileSync(PRIVATE_DOGFOOD_PATH, 'utf8'));
  const before = JSON.stringify(workspace);

  assert.ok(workspace.events.length > 0, 'private dogfood must record at least one strategic event');
  for (const event of workspace.events) {
    const eventBefore = JSON.stringify(event);
    const result = ChessboardEngine.applyStrategicEvent(workspace, event);
    assert.equal(result.status, 'APPLIED', `${event.eventId} (${event.eventType}) was not applied`);
    assert.ok(result.effects.length > 0, `${event.eventId} produced no structural effect`);
    assert.equal(JSON.stringify(event), eventBefore, `${event.eventId} was mutated`);
    assert.equal(validateSchema(result.workspace), true, JSON.stringify(validateSchema.errors));
    assert.deepEqual(validateChessboardWorkspace(result.workspace), []);
  }
  assert.equal(JSON.stringify(workspace), before, 'event application mutated the source workspace');
});

test('Market Structure Lab exposes the brief, threat selector, evidence, survival, and comparison contracts', () => {
  const source = fs.readFileSync(
    path.join(ROOT, 'assets', 'js', 'features', 'chessboard-lab.js'),
    'utf8'
  );

  for (const marker of [
    '${renderStrategicBrief(ws)}',
    '${renderStructuralMatrices(ws)}',
    '${renderContradictions(ws)}',
    'id="threatActorView"',
    'Attack and countermove tree',
    'Counterevidence / falsifier',
    'Strategic survival table',
    'Position comparison',
    'Observed / article checked:',
    '<strong>Affected:</strong>',
    '<strong>Sources:</strong>'
  ]) {
    assert.ok(source.includes(marker), `Market Structure Lab omits ${marker}`);
  }
  assert.match(source, /getElementById\('threatActorView'\)\?\.addEventListener\('change'/);
  assert.match(source, /selectedThreatActorRef\s*=\s*event\.currentTarget\.value/);
});

test('UMD build exposes the same pure API in a browser-like global without platform access', () => {
  const enginePath = path.join(__dirname, '..', 'assets', 'js', 'features', 'chessboard-engine.js');
  const source = fs.readFileSync(enginePath, 'utf8');
  const context = {};
  for (const property of ['document', 'localStorage', 'sessionStorage', 'fetch']) {
    Object.defineProperty(context, property, {
      configurable: true,
      get() {
        throw new Error(`${property} must not be accessed`);
      }
    });
  }

  vm.runInNewContext(source, context, { filename: enginePath });
  assert.equal(typeof context.ChessboardEngine.validateWorkspace, 'function');
  assert.equal(context.ChessboardEngine.testNetworkEffect({ claim: 'More users = more data' }).status, 'REJECTED');
});
