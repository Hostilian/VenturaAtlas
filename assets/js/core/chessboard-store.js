/**
 * VenturaAtlas Chessboard — local/private market-structure workspace store.
 *
 * The store starts empty and reads only operator-selected JSON. It never fetches
 * repository or private strategy data. Imported records remain browser-local,
 * are cloned at every boundary, and are replaced only after validation and a
 * successful persistence write.
 */

const CHESSBOARD_SCHEMA_VERSION = '1.1.0';
const CHESSBOARD_STORAGE_KEY = 'va_chessboard_workspace_v2';
const CHESSBOARD_PRIVACY_SCOPE = 'LOCAL_BROWSER_ONLY';
const CHESSBOARD_COLLECTIONS = [
  'marketDefinitions',
  'actors',
  'valueChainLayers',
  'controlPoints',
  'dependencies',
  'ecosystemEdges',
  'responses',
  'strategicClaims',
  'moatMechanisms',
  'antiMoats',
  'commoditizationRisks',
  'events',
  'researchGaps',
  'sourceRecords'
];
const CHESSBOARD_CONTRACT_COLLECTIONS = [
  ...CHESSBOARD_COLLECTIONS.slice(0, 12),
  'stressScenarios',
  'positions',
  'researchGaps',
  'handoffs',
  'sourceRecords'
];
const CHESSBOARD_EPISTEMIC_STATES = [
  'OBSERVED_FACT',
  'SOURCE_SUPPORTED_INFERENCE',
  'MODEL_HYPOTHESIS',
  'SCENARIO',
  'USER_ASSUMPTION',
  'UNKNOWN'
];

const ROOT_KEYS = new Set([
  '$schema', 'schemaVersion', 'workspaceMode', 'privacyScope', 'workspaceId',
  'selectionAuthority', 'canonicalIdeaId', 'canonicalIdeaRevision', 'ventureName',
  'snapshot', ...CHESSBOARD_CONTRACT_COLLECTIONS, 'legacyScoreAudit'
]);

const COLLECTION_SPECS = {
  marketDefinitions: {
    id: 'marketId', pattern: /^market-[a-z0-9-]+$/,
    required: ['marketId', 'name', 'jobs', 'buyerActorRefs', 'budget', 'includedAlternativeActorRefs', 'excludedAlternativeActorRefs', 'reason', 'confidence', 'epistemicState', 'sourceRefs'],
    optional: ['phaseShiftMarketRef'],
    arrays: ['jobs', 'buyerActorRefs', 'includedAlternativeActorRefs', 'excludedAlternativeActorRefs', 'sourceRefs']
  },
  actors: {
    id: 'actorId', pattern: /^actor-[a-z0-9-]+$/,
    required: ['actorId', 'name', 'type', 'marketRefs', 'assets', 'dependencyRefs', 'controlPointRefs', 'incentives', 'observedMoveRefs', 'epistemicState', 'sourceRefs'],
    optional: ['targetBuyer', 'coreJob', 'pricing', 'distribution', 'trajectory', 'strategicIntent', 'openSourceProfile'],
    arrays: ['marketRefs', 'assets', 'dependencyRefs', 'controlPointRefs', 'incentives', 'observedMoveRefs', 'sourceRefs']
  },
  valueChainLayers: {
    id: 'layerId', pattern: /^layer-[a-z0-9-]+$/,
    required: ['layerId', 'name', 'sequence', 'actorRefs', 'inputs', 'outputs', 'economics', 'switching', 'concentration', 'commodityState', 'controlPointRefs', 'epistemicState', 'sourceRefs'],
    arrays: ['actorRefs', 'inputs', 'outputs', 'controlPointRefs', 'sourceRefs']
  },
  controlPoints: {
    id: 'controlPointId', pattern: /^control-[a-z0-9-]+$/,
    required: ['controlPointId', 'layerRef', 'controllerActorRef', 'controlledResource', 'dependentActorRefs', 'mechanism', 'switchability', 'alternativeActorRefs', 'epistemicState', 'sourceRefs', 'counterEvidenceRefs'],
    arrays: ['dependentActorRefs', 'alternativeActorRefs', 'sourceRefs', 'counterEvidenceRefs']
  },
  dependencies: {
    id: 'dependencyId', pattern: /^dependency-[a-z0-9-]+$/,
    required: ['dependencyId', 'dependentActorRefs', 'providerActorRef', 'resource', 'criticality', 'switchingCost', 'providerPower', 'alternativeActorRefs', 'alternativeDescriptions', 'contractualConstraints', 'technicalConstraints', 'providerEntryRisk', 'priceExposure', 'accessExposure', 'controlPointRef', 'shockgraphDependencyRef', 'epistemicState', 'sourceRefs', 'counterEvidenceRefs'],
    optional: ['switchingProcess', 'multiHoming'],
    arrays: ['dependentActorRefs', 'alternativeActorRefs', 'alternativeDescriptions', 'contractualConstraints', 'technicalConstraints', 'sourceRefs', 'counterEvidenceRefs']
  },
  ecosystemEdges: {
    id: 'edgeId', pattern: /^edge-[a-z0-9-]+$/,
    required: ['edgeId', 'fromActorRef', 'toActorRef', 'type', 'marketRefs', 'mechanism', 'epistemicState', 'sourceRefs'],
    arrays: ['marketRefs', 'sourceRefs']
  },
  responses: {
    id: 'responseId', pattern: /^response-[a-z0-9-]+$/,
    required: ['responseId', 'actorRef', 'targetActorRefs', 'trigger', 'triggerEventRefs', 'possibleAction', 'ability', 'abilityMechanism', 'incentive', 'incentiveMechanism', 'timeToExecute', 'likelyImpact', 'constraints', 'countermoves', 'epistemicState', 'sourceRefs', 'counterEvidenceRefs', 'falsifier'],
    arrays: ['targetActorRefs', 'triggerEventRefs', 'constraints', 'countermoves', 'sourceRefs', 'counterEvidenceRefs']
  },
  strategicClaims: {
    id: 'claimId', pattern: /^STR-[A-Z0-9-]+$/,
    required: ['claimId', 'subject', 'claim', 'epistemicState', 'mechanism', 'actorRef', 'controlPointRef', 'asset', 'beneficiaries', 'disadvantaged', 'conditions', 'evidenceRefs', 'counterEvidenceRefs', 'timeHorizon', 'falsifier', 'asOf', 'confidence', 'status', 'contradictionStatus', 'resolution'],
    arrays: ['beneficiaries', 'disadvantaged', 'conditions', 'evidenceRefs', 'counterEvidenceRefs']
  },
  moatMechanisms: {
    id: 'moatId', pattern: /^moat-[a-z0-9-]+$/,
    required: ['moatId', 'mechanism', 'ownerActorRef', 'asset', 'accumulationProcess', 'customerEffect', 'attackerActorRefs', 'attackerCost', 'timeToReplicate', 'conditions', 'dependencyRefs', 'decayRisks', 'halfLife', 'evidenceRefs', 'counterEvidenceRefs', 'relatedClaimRefs', 'falsifier', 'status', 'epistemicState'],
    arrays: ['attackerActorRefs', 'conditions', 'dependencyRefs', 'decayRisks', 'evidenceRefs', 'counterEvidenceRefs', 'relatedClaimRefs']
  },
  antiMoats: {
    id: 'antiMoatId', pattern: /^anti-moat-[a-z0-9-]+$/,
    required: ['antiMoatId', 'mechanism', 'actorRef', 'growthTrigger', 'negativeEffect', 'scalingBehavior', 'possibleMitigations', 'attackerActorRefs', 'conditions', 'decayRisks', 'evidenceRefs', 'counterEvidenceRefs', 'relatedClaimRefs', 'epistemicState', 'falsifier', 'status'],
    arrays: ['possibleMitigations', 'attackerActorRefs', 'conditions', 'decayRisks', 'evidenceRefs', 'counterEvidenceRefs', 'relatedClaimRefs']
  },
  commoditizationRisks: {
    id: 'riskId', pattern: /^commoditization-[a-z0-9-]+$/,
    required: ['riskId', 'capability', 'currentDifferentiation', 'drivers', 'replacementSources', 'costTrend', 'availabilityTrend', 'timeHorizon', 'ventureImpact', 'remainingDifferentiation', 'dependencyRefs', 'eventRefs', 'evidenceRefs', 'counterEvidenceRefs', 'epistemicState', 'falsifier'],
    arrays: ['drivers', 'replacementSources', 'dependencyRefs', 'eventRefs', 'evidenceRefs', 'counterEvidenceRefs']
  },
  events: {
    id: 'eventId', pattern: /^event-[a-z0-9-]+$/,
    required: ['eventId', 'eventDate', 'observedAt', 'actorRefs', 'eventType', 'description', 'affectedLayerRefs', 'affectedControlPointRefs', 'affectedDependencyRefs', 'sourceRefs', 'strategicImplication', 'implicationState'],
    optional: ['shockgraphShockRef'],
    arrays: ['actorRefs', 'affectedLayerRefs', 'affectedControlPointRefs', 'affectedDependencyRefs', 'sourceRefs']
  },
  stressScenarios: {
    id: 'scenarioId', pattern: /^scenario-[a-z0-9-]+$/,
    required: ['scenarioId', 'stressType', 'name', 'threatActorRef', 'eventRefs', 'trigger', 'assumptions', 'affectedDependencyRefs', 'affectedMoatRefs', 'affectedPositionRefs', 'impact', 'countermoves', 'survivalCondition', 'survivalStatus', 'falsifier', 'epistemicState', 'sourceRefs'],
    arrays: ['eventRefs', 'assumptions', 'affectedDependencyRefs', 'affectedMoatRefs', 'affectedPositionRefs', 'countermoves', 'sourceRefs']
  },
  positions: {
    id: 'positionId', pattern: /^position-[a-z0-9-]+$/,
    required: ['positionId', 'positionType', 'targetLayerRef', 'actorRef', 'customerValue', 'dependencyRefs', 'controlPointRefs', 'controlledAssets', 'requiredAssets', 'switching', 'distribution', 'commoditizationRiskRefs', 'vulnerabilities', 'responseRefs', 'evidenceRefs', 'counterEvidenceRefs', 'epistemicState', 'status', 'falsifier'],
    arrays: ['dependencyRefs', 'controlPointRefs', 'controlledAssets', 'requiredAssets', 'commoditizationRiskRefs', 'vulnerabilities', 'responseRefs', 'evidenceRefs', 'counterEvidenceRefs']
  },
  researchGaps: {
    id: 'gapId', pattern: /^gap-[a-z0-9-]+$/,
    required: ['gapId', 'question', 'decisionRelevance', 'relatedClaimRefs', 'whatChanges', 'requiredEvidence', 'nextAction', 'status'],
    arrays: ['relatedClaimRefs', 'requiredEvidence']
  },
  handoffs: {
    id: 'handoffId', pattern: /^handoff-[a-z0-9-]+$/,
    required: ['handoffId', 'targetSystem', 'relatedClaimRefs', 'trigger', 'structuredQuestion', 'boundary', 'privacy'],
    arrays: ['relatedClaimRefs']
  },
  sourceRecords: {
    id: 'sourceId', pattern: /^[A-Za-z0-9][A-Za-z0-9._:-]*$/,
    required: ['sourceId', 'title', 'url', 'visibility', 'sourceClass', 'evidenceEligible', 'provenanceEligible', 'publishedAt', 'retrievedAt', 'lastVerifiedAt', 'freshnessPolicyDays', 'status', 'supersedesSourceRefs', 'supportsClaimRefs', 'refutesClaimRefs'],
    arrays: ['supersedesSourceRefs', 'supportsClaimRefs', 'refutesClaimRefs']
  }
};

const ENUMS = {
  workspaceMode: ['PRIVATE_STRATEGY', 'PUBLIC_SANITIZED', 'UNVERIFIED_DRAFT'],
  privacyScope: ['PRIVATE_REPOSITORY_ONLY', 'LOCAL_BROWSER_ONLY', 'PUBLIC_SANITIZED'],
  epistemicState: CHESSBOARD_EPISTEMIC_STATES,
  confidence: ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'],
  qualitative: ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNKNOWN'],
  timeHorizon: ['IMMEDIATE', 'WEEKS', 'MONTHS', 'YEARS', 'LONG_TERM', 'UNKNOWN'],
  actorType: ['VENTURE', 'CUSTOMER', 'END_USER', 'ECONOMIC_BUYER', 'DIRECT_COMPETITOR', 'INDIRECT_COMPETITOR', 'SUBSTITUTE', 'STATUS_QUO', 'OPEN_SOURCE_PROJECT', 'UPSTREAM_SUPPLIER', 'DOWNSTREAM_DISTRIBUTOR', 'PLATFORM', 'GATEKEEPER', 'COMPLEMENTOR', 'INTEGRATOR', 'CHANNEL', 'STANDARD_BODY', 'REGULATOR', 'DATA_PROVIDER', 'MODEL_PROVIDER', 'CLOUD_PROVIDER', 'MARKETPLACE', 'SYSTEM_OF_RECORD', 'INTERNAL_BUILD_TEAM', 'ADJACENT_INCUMBENT', 'NEW_ENTRANT'],
  edgeType: ['BUYS_FROM', 'SELLS_TO', 'DEPENDS_ON', 'COMPETES_WITH', 'COMPLEMENTS', 'BUNDLES', 'DISTRIBUTES', 'SUPPLIES', 'CONTROLS_ACCESS_TO', 'INTEROPERATES_WITH', 'SUBSTITUTES', 'REGULATES', 'SETS_STANDARD_FOR', 'INTEGRATES_WITH'],
  responseAction: ['IGNORE', 'COPY_FEATURE', 'LOWER_PRICE', 'MAKE_FEATURE_FREE', 'BUNDLE', 'ACQUIRE', 'PARTNER', 'BLOCK_ACCESS', 'CHANGE_API', 'RAISE_API_PRICE', 'SELF_PREFERENCE', 'ENTER_ADJACENT_MARKET', 'OPEN_SOURCE', 'CLOSE_SOURCE', 'INCREASE_INTEGRATION', 'SIGN_EXCLUSIVITY', 'INCREASE_MARKETING', 'LEVERAGE_SALES_FORCE', 'SEEK_STANDARD', 'INTEROPERATE', 'DISINTERMEDIATE', 'UNKNOWN'],
  powerMechanism: ['NETWORK_EFFECT', 'ECONOMIES_OF_SCALE', 'ECONOMIES_OF_SCOPE', 'SWITCHING_COST', 'MULTI_HOMING_FRICTION', 'DATA_FEEDBACK', 'LEARNING_CURVE', 'CAPITAL_INTENSITY', 'DISTRIBUTION_CONTROL', 'DEFAULT_POSITION', 'BUNDLING', 'TYING', 'VERTICAL_INTEGRATION', 'EXCLUSIVE_ACCESS', 'STANDARD_CONTROL', 'INTEROPERABILITY_CONTROL', 'SUPPLY_BOTTLENECK', 'BRAND_TRUST', 'CUSTOMER_WORKFLOW_EMBEDDING', 'SYSTEM_OF_RECORD_POSITION', 'REGULATORY_LICENSE', 'CERTIFICATION', 'LONG_CONTRACT', 'COMMUNITY', 'OPEN_SOURCE_ADOPTION', 'PROPRIETARY_DATA', 'RELATIONSHIP_DEPENDENCE', 'UNKNOWN']
};

const NON_EMPTY_ARRAYS = {
  marketDefinitions: ['jobs'],
  actors: ['incentives'],
  dependencies: ['dependentActorRefs'],
  responses: ['targetActorRefs', 'constraints'],
  strategicClaims: ['beneficiaries', 'disadvantaged', 'conditions'],
  moatMechanisms: ['attackerActorRefs', 'conditions', 'decayRisks', 'relatedClaimRefs'],
  antiMoats: ['conditions', 'decayRisks', 'relatedClaimRefs'],
  commoditizationRisks: ['drivers', 'replacementSources'],
  events: ['actorRefs'],
  stressScenarios: ['assumptions'],
  positions: ['requiredAssets', 'vulnerabilities'],
  researchGaps: ['requiredEvidence']
};

const COLLECTION_ENUM_FIELDS = {
  marketDefinitions: { confidence: ENUMS.confidence },
  actors: { type: ENUMS.actorType },
  valueChainLayers: {
    concentration: ENUMS.qualitative,
    commodityState: ['SCARCE', 'CONTESTED', 'COMMODITIZING', 'COMMODITY_LIKE', 'UNKNOWN']
  },
  controlPoints: { switchability: ENUMS.qualitative },
  dependencies: {
    criticality: ENUMS.qualitative,
    switchingCost: ENUMS.qualitative,
    providerPower: ENUMS.qualitative,
    providerEntryRisk: ENUMS.qualitative,
    priceExposure: ENUMS.qualitative,
    accessExposure: ENUMS.qualitative
  },
  ecosystemEdges: { type: ENUMS.edgeType },
  responses: { possibleAction: ENUMS.responseAction, ability: ENUMS.qualitative, incentive: ENUMS.qualitative, timeToExecute: ENUMS.timeHorizon },
  strategicClaims: {
    timeHorizon: ENUMS.timeHorizon,
    confidence: ENUMS.confidence,
    status: ['ACTIVE', 'STALE', 'SUPERSEDED', 'REFUTED', 'UNKNOWN'],
    contradictionStatus: ['NONE', 'OPEN', 'RESOLVED']
  },
  moatMechanisms: {
    mechanism: ENUMS.powerMechanism,
    timeToReplicate: ENUMS.timeHorizon,
    halfLife: ['VERY_SHORT', 'SHORT', 'MEDIUM', 'LONG', 'UNKNOWN'],
    status: ['HYPOTHESIS', 'CONDITIONAL', 'OBSERVED_TEMPORARY', 'REJECTED', 'UNKNOWN']
  },
  antiMoats: {
    status: ['HYPOTHESIS', 'CONDITIONAL', 'OBSERVED_TEMPORARY', 'REJECTED', 'UNKNOWN']
  },
  commoditizationRisks: {
    costTrend: ['RISING', 'STABLE', 'FALLING', 'UNKNOWN'],
    availabilityTrend: ['CONTRACTING', 'STABLE', 'EXPANDING', 'UNKNOWN'],
    timeHorizon: ENUMS.timeHorizon
  },
  events: { eventType: ['PRODUCT_LAUNCH', 'FEATURE_LAUNCH', 'PRICE_CHANGE', 'BUNDLE', 'ACQUISITION', 'PARTNERSHIP', 'API_CHANGE', 'STANDARD_CHANGE', 'OPEN_SOURCE_RELEASE', 'REGULATORY_CHANGE', 'INTEROPERABILITY_CHANGE', 'NEW_ENTRANT', 'PROVIDER_ENTRY', 'EXIT', 'FUNDING_EVENT', 'DISTRIBUTION_CHANGE'] },
  stressScenarios: {
    epistemicState: ['MODEL_HYPOTHESIS', 'SCENARIO', 'USER_ASSUMPTION', 'UNKNOWN'],
    stressType: ['INCUMBENT_BUNDLE', 'API_PRICE_3X', 'API_ACCESS_REMOVAL', 'MODEL_IMPROVEMENT_90_PERCENT', 'OPEN_SOURCE_EQUIVALENT', 'CUSTOMER_BUILD_TWO_DAYS', 'INTEROPERABILITY_OPENING', 'PLATFORM_LOCK_IN', 'PLATFORM_OPENING', 'SUPPLIER_ENTRY', 'CUSTOMER_CONSOLIDATION', 'COMPETITOR_ACQUISITION', 'ACQUISITION_TARGET_DEPENDENCE'],
    survivalStatus: ['SURVIVES', 'DAMAGED', 'THESIS_BREAKS', 'UNKNOWN']
  },
  positions: {
    positionType: ['VERTICAL_SPECIALIST', 'NEUTRAL_CROSS_PLATFORM_LAYER', 'SYSTEM_OF_RECORD', 'SYSTEM_OF_VERIFICATION', 'ORCHESTRATION_LAYER', 'DATA_NETWORK', 'MARKETPLACE', 'COMPLEMENT', 'INFRASTRUCTURE', 'MANAGED_SERVICE', 'WORKFLOW_OWNER', 'STANDARD_PROTOCOL_LAYER', 'OTHER', 'UNKNOWN'],
    status: ['CANDIDATE', 'ROBUST_CONDITIONAL', 'FRAGILE', 'REJECTED', 'UNKNOWN']
  },
  researchGaps: { decisionRelevance: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], status: ['OPEN', 'IN_PROGRESS', 'ANSWERED', 'BLOCKED'] },
  handoffs: { targetSystem: ['OMEGA', 'ORBIT', 'MERCURY', 'FORGE', 'JURIS', 'CAPITAL', 'CONSTELLATION', 'RELAY'], privacy: ['PUBLIC', 'INTERNAL', 'PRIVATE'] },
  sourceRecords: {
    visibility: ['PUBLIC', 'INTERNAL', 'PRIVATE'],
    sourceClass: ['PRIMARY_OR_OFFICIAL', 'RESEARCH_PUBLICATION', 'COMPANY_OR_INDUSTRY', 'COMMUNITY', 'INTERNAL_PROVENANCE_ARTIFACT'],
    status: ['ACTIVE', 'STALE', 'SUPERSEDED', 'CONFLICTING']
  }
};

function chessboardNow() {
  return new Date().toISOString();
}

function chessboardId(prefix = 'chessboard') {
  const uuid = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
}

function chessboardClone(value) {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function localEmptyWorkspace(options = {}) {
  const now = options.now || chessboardNow();
  return {
    schemaVersion: CHESSBOARD_SCHEMA_VERSION,
    workspaceMode: 'UNVERIFIED_DRAFT',
    privacyScope: CHESSBOARD_PRIVACY_SCOPE,
    workspaceId: options.workspaceId || chessboardId('chessboard'),
    selectionAuthority: {
      state: 'NO_AUTHORITATIVE_ACTIVE_VENTURE',
      authorityPath: '.agent-system/state.json',
      activeVentureId: null,
      analysisTargetBasis: 'EXPLICIT_NON_AUTHORITATIVE_DOGFOOD',
      evaluatedAt: now,
      discrepancies: [],
      rationale: 'No authoritative active venture is loaded. Import a private Chessboard workspace to inspect a provisional analysis target.'
    },
    canonicalIdeaId: null,
    canonicalIdeaRevision: null,
    ventureName: '',
    snapshot: null,
    marketDefinitions: [],
    actors: [],
    valueChainLayers: [],
    controlPoints: [],
    dependencies: [],
    ecosystemEdges: [],
    responses: [],
    strategicClaims: [],
    moatMechanisms: [],
    antiMoats: [],
    commoditizationRisks: [],
    events: [],
    stressScenarios: [],
    positions: [],
    researchGaps: [],
    handoffs: [],
    sourceRecords: [],
    legacyScoreAudit: {
      status: 'PRESERVED_NOT_MODIFIED',
      dimensionsReviewed: [],
      mechanismCoverage: 'NOT_ASSESSED',
      mutationAuthorized: false,
      methodologyChange: false,
      notes: 'Empty browser-local draft; no scoring or ranking mutation is authorized.'
    }
  };
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function pushEnumError(value, allowed, label, errors) {
  if (!allowed.includes(value)) errors.push(`${label} has invalid value ${String(value)}`);
}

function pushArrayError(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return;
  }
  if (value.some(item => typeof item !== 'string' || !item.trim())) errors.push(`${label} must contain non-empty strings`);
  if (new Set(value).size !== value.length) errors.push(`${label} must not contain duplicates`);
}

function pushDateError(value, label, errors, nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== 'string' || !value || !Number.isFinite(Date.parse(value))) errors.push(`${label} must be a valid timestamp`);
}

function rejectUnexpected(value, allowedKeys, label, errors) {
  if (!isObject(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${label} has unexpected property ${key}`);
}

function isLocalEmpty(workspace) {
  return isObject(workspace)
    && workspace.workspaceMode === 'UNVERIFIED_DRAFT'
    && workspace.privacyScope === CHESSBOARD_PRIVACY_SCOPE
    && workspace.canonicalIdeaId === null
    && workspace.canonicalIdeaRevision === null
    && workspace.ventureName === ''
    && workspace.snapshot === null
    && CHESSBOARD_CONTRACT_COLLECTIONS.every(key => Array.isArray(workspace[key]) && workspace[key].length === 0);
}

function validateSelectionAuthority(authority, errors, allowEmpty) {
  const keys = ['state', 'authorityPath', 'activeVentureId', 'analysisTargetBasis', 'evaluatedAt', 'discrepancies', 'rationale'];
  rejectUnexpected(authority, keys, 'selectionAuthority', errors);
  if (!isObject(authority)) return;
  for (const key of keys) if (!hasOwn(authority, key)) errors.push(`selectionAuthority.${key} is required`);
  pushEnumError(authority.state, ['AUTHORITATIVE_ACTIVE_VENTURE', 'NO_AUTHORITATIVE_ACTIVE_VENTURE', 'DISCREPANCY_REQUIRES_RESOLUTION'], 'selectionAuthority.state', errors);
  if (authority.authorityPath !== '.agent-system/state.json') errors.push('selectionAuthority.authorityPath must be .agent-system/state.json');
  pushEnumError(authority.analysisTargetBasis, ['AUTHORITATIVE_SELECTION', 'CURRENT_CANONICAL_PRIORITY_RECORD', 'RECENT_DOMAIN_DOGFOOD', 'USER_ASSUMPTION', 'EXPLICIT_NON_AUTHORITATIVE_DOGFOOD'], 'selectionAuthority.analysisTargetBasis', errors);
  pushDateError(authority.evaluatedAt, 'selectionAuthority.evaluatedAt', errors);
  if (!Array.isArray(authority.discrepancies)) errors.push('selectionAuthority.discrepancies must be an array');
  if (typeof authority.rationale !== 'string' || !authority.rationale.trim()) errors.push('selectionAuthority.rationale is required');
  if (authority.state === 'NO_AUTHORITATIVE_ACTIVE_VENTURE' && authority.activeVentureId !== null) errors.push('selectionAuthority.activeVentureId must be null when no authoritative venture exists');
  if (authority.activeVentureId !== null && !/^idea-[0-9]{3}$/.test(authority.activeVentureId || '')) errors.push('selectionAuthority.activeVentureId must be null or an idea ID');
  if (!allowEmpty && authority.state === 'AUTHORITATIVE_ACTIVE_VENTURE' && authority.activeVentureId === null) errors.push('authoritative selection requires activeVentureId');
}

function validateSnapshot(snapshot, errors) {
  const keys = ['snapshotId', 'asOf', 'status', 'priorSnapshotRef', 'researchCutoff', 'notes'];
  rejectUnexpected(snapshot, keys, 'snapshot', errors);
  if (!isObject(snapshot)) return;
  for (const key of keys) if (!hasOwn(snapshot, key)) errors.push(`snapshot.${key} is required`);
  if (!/^snapshot-[a-z0-9-]+$/.test(snapshot.snapshotId || '')) errors.push('snapshot.snapshotId is invalid');
  pushDateError(snapshot.asOf, 'snapshot.asOf', errors);
  pushDateError(snapshot.researchCutoff, 'snapshot.researchCutoff', errors);
  pushEnumError(snapshot.status, ['DRAFT', 'CURRENT', 'SUPERSEDED'], 'snapshot.status', errors);
  if (snapshot.priorSnapshotRef !== null && typeof snapshot.priorSnapshotRef !== 'string') errors.push('snapshot.priorSnapshotRef must be null or a string');
  if (typeof snapshot.notes !== 'string') errors.push('snapshot.notes must be a string');
}

function validateRecordShape(collection, record, index, errors) {
  const spec = COLLECTION_SPECS[collection];
  const label = `${collection}[${index}]`;
  if (!isObject(record)) {
    errors.push(`${label} must be an object`);
    return;
  }
  rejectUnexpected(record, [...spec.required, ...(spec.optional || [])], label, errors);
  for (const key of spec.required) if (!hasOwn(record, key)) errors.push(`${label}.${key} is required`);
  if (!spec.pattern.test(record[spec.id] || '')) errors.push(`${label}.${spec.id} is invalid`);
  for (const key of spec.arrays || []) pushArrayError(record[key], `${label}.${key}`, errors);

  for (const key of NON_EMPTY_ARRAYS[collection] || []) {
    if (Array.isArray(record[key]) && record[key].length === 0) errors.push(`${label}.${key} must not be empty`);
  }

  const nonStringFields = new Set([
    ...(spec.arrays || []),
    'sequence', 'evidenceEligible', 'provenanceEligible', 'freshnessPolicyDays',
    'controlPointRef', 'shockgraphDependencyRef', 'resolution', 'url', 'publishedAt'
  ]);
  for (const key of spec.required) {
    if (nonStringFields.has(key)) continue;
    if (typeof record[key] !== 'string' || !record[key].trim()) errors.push(`${label}.${key} must be a non-empty string`);
  }

  if (hasOwn(record, 'epistemicState')) pushEnumError(record.epistemicState, ENUMS.epistemicState, `${label}.epistemicState`, errors);
  if (hasOwn(record, 'implicationState')) pushEnumError(record.implicationState, ENUMS.epistemicState, `${label}.implicationState`, errors);
  for (const [field, allowed] of Object.entries(COLLECTION_ENUM_FIELDS[collection] || {})) {
    if (hasOwn(record, field)) pushEnumError(record[field], allowed, `${label}.${field}`, errors);
  }
  if (collection === 'commoditizationRisks' && Array.isArray(record.drivers)) {
    const drivers = ['OPEN_SOURCE', 'FOUNDATION_MODEL_PROGRESS', 'STANDARDIZATION', 'API_AVAILABILITY', 'CLOUD_SERVICES', 'REGULATION_INTEROPERABILITY', 'HARDWARE_COST_DECLINE', 'NEW_ENTRANTS', 'BUNDLING', 'UNKNOWN'];
    for (const driver of record.drivers) pushEnumError(driver, drivers, `${label}.drivers`, errors);
  }
  if (collection === 'actors') {
    if (hasOwn(record, 'distribution')) pushArrayError(record.distribution, `${label}.distribution`, errors);
    if (hasOwn(record, 'openSourceProfile')) {
      const profile = record.openSourceProfile;
      const profileKeys = ['license', 'repositoryUrl', 'latestRelease', 'latestReleaseAt', 'activity', 'contributors', 'releaseCadence', 'commercialBacking', 'deploymentBurden', 'sourceRefs'];
      rejectUnexpected(profile, profileKeys, `${label}.openSourceProfile`, errors);
      if (isObject(profile)) {
        for (const key of profileKeys) if (!hasOwn(profile, key)) errors.push(`${label}.openSourceProfile.${key} is required`);
        for (const key of profileKeys.filter(key => !['latestReleaseAt', 'sourceRefs'].includes(key))) {
          if (typeof profile[key] !== 'string' || !profile[key].trim()) errors.push(`${label}.openSourceProfile.${key} must be a non-empty string`);
        }
        pushDateError(profile.latestReleaseAt, `${label}.openSourceProfile.latestReleaseAt`, errors, true);
        pushArrayError(profile.sourceRefs, `${label}.openSourceProfile.sourceRefs`, errors);
        if (typeof profile.repositoryUrl === 'string' && !/^https?:\/\//i.test(profile.repositoryUrl)) errors.push(`${label}.openSourceProfile.repositoryUrl must be an HTTP(S) URL`);
      }
    }
  }
  if (collection === 'dependencies') {
    if (hasOwn(record, 'switchingProcess')) {
      const fields = ['dataMigration', 'integrationRebuild', 'userTraining', 'workflowChange', 'contractCost', 'networkLoss', 'historicalContextLoss', 'organizationalPolitics', 'riskTrust', 'searchCost'];
      rejectUnexpected(record.switchingProcess, fields, `${label}.switchingProcess`, errors);
      if (isObject(record.switchingProcess)) {
        for (const field of fields) {
          if (typeof record.switchingProcess[field] !== 'string' || !record.switchingProcess[field].trim()) errors.push(`${label}.switchingProcess.${field} must be a non-empty string`);
        }
      }
    }
    if (hasOwn(record, 'multiHoming')) {
      const fields = ['allowed', 'sides', 'friction', 'cost', 'portability', 'networkStateLoss'];
      rejectUnexpected(record.multiHoming, fields, `${label}.multiHoming`, errors);
      if (isObject(record.multiHoming)) {
        for (const field of fields) if (!hasOwn(record.multiHoming, field)) errors.push(`${label}.multiHoming.${field} is required`);
        pushEnumError(record.multiHoming.allowed, ['YES', 'NO', 'CONDITIONAL', 'NOT_APPLICABLE', 'UNKNOWN'], `${label}.multiHoming.allowed`, errors);
        pushEnumError(record.multiHoming.friction, ENUMS.qualitative, `${label}.multiHoming.friction`, errors);
        pushArrayError(record.multiHoming.sides, `${label}.multiHoming.sides`, errors);
        for (const field of ['cost', 'portability', 'networkStateLoss']) {
          if (typeof record.multiHoming[field] !== 'string' || !record.multiHoming[field].trim()) errors.push(`${label}.multiHoming.${field} must be a non-empty string`);
        }
      }
    }
  }
  if (collection === 'valueChainLayers' && (!Number.isInteger(record.sequence) || record.sequence < 0)) errors.push(`${label}.sequence must be a non-negative integer`);
  if (collection === 'strategicClaims') pushDateError(record.asOf, `${label}.asOf`, errors);
  if (collection === 'events') {
    pushDateError(record.eventDate, `${label}.eventDate`, errors);
    pushDateError(record.observedAt, `${label}.observedAt`, errors);
  }
  if (collection === 'sourceRecords') {
    pushDateError(record.publishedAt, `${label}.publishedAt`, errors, true);
    pushDateError(record.retrievedAt, `${label}.retrievedAt`, errors);
    pushDateError(record.lastVerifiedAt, `${label}.lastVerifiedAt`, errors);
    if (record.url !== null && (typeof record.url !== 'string' || !/^https?:\/\//i.test(record.url))) errors.push(`${label}.url must be null or an HTTP(S) URL`);
    if (typeof record.evidenceEligible !== 'boolean' || typeof record.provenanceEligible !== 'boolean') errors.push(`${label} eligibility fields must be booleans`);
    if (!Number.isInteger(record.freshnessPolicyDays) || record.freshnessPolicyDays < 1) errors.push(`${label}.freshnessPolicyDays must be a positive integer`);
  }
}

function validateLegacyAudit(audit, errors) {
  const keys = ['status', 'dimensionsReviewed', 'mechanismCoverage', 'mutationAuthorized', 'methodologyChange', 'notes'];
  rejectUnexpected(audit, keys, 'legacyScoreAudit', errors);
  if (!isObject(audit)) return;
  for (const key of keys) if (!hasOwn(audit, key)) errors.push(`legacyScoreAudit.${key} is required`);
  if (audit.status !== 'PRESERVED_NOT_MODIFIED') errors.push('legacyScoreAudit.status must be PRESERVED_NOT_MODIFIED');
  pushArrayError(audit.dimensionsReviewed, 'legacyScoreAudit.dimensionsReviewed', errors);
  pushEnumError(audit.mechanismCoverage, ['NOT_ASSESSED', 'PARTIAL', 'COMPLETE_FOR_DOGFOOD'], 'legacyScoreAudit.mechanismCoverage', errors);
  if (audit.mutationAuthorized !== false || audit.methodologyChange !== false) errors.push('Chessboard cannot authorize or perform a scoring-methodology mutation');
  if (typeof audit.notes !== 'string' || !audit.notes.trim()) errors.push('legacyScoreAudit.notes is required');
}

function validateReferences(workspace, idSets, errors) {
  const ref = (collection, key, value, label, nullable = false) => {
    if (nullable && value === null) return;
    if (typeof value !== 'string' || !idSets[collection].has(value)) errors.push(`${label} references unknown ${key}: ${String(value)}`);
  };
  const refs = (collection, key, values, label) => {
    if (!Array.isArray(values)) return;
    for (const value of values) ref(collection, key, value, label);
  };
  const sourceRefs = (record, label) => {
    for (const field of ['sourceRefs', 'evidenceRefs', 'counterEvidenceRefs']) {
      if (hasOwn(record, field)) refs('sourceRecords', 'sourceId', record[field], `${label}.${field}`);
    }
  };

  for (const item of workspace.marketDefinitions) {
    refs('actors', 'actorId', item.buyerActorRefs, `${item.marketId}.buyerActorRefs`);
    refs('actors', 'actorId', item.includedAlternativeActorRefs, `${item.marketId}.includedAlternativeActorRefs`);
    refs('actors', 'actorId', item.excludedAlternativeActorRefs, `${item.marketId}.excludedAlternativeActorRefs`);
    sourceRefs(item, item.marketId);
  }
  for (const item of workspace.actors) {
    refs('marketDefinitions', 'marketId', item.marketRefs, `${item.actorId}.marketRefs`);
    refs('dependencies', 'dependencyId', item.dependencyRefs, `${item.actorId}.dependencyRefs`);
    refs('controlPoints', 'controlPointId', item.controlPointRefs, `${item.actorId}.controlPointRefs`);
    refs('events', 'eventId', item.observedMoveRefs, `${item.actorId}.observedMoveRefs`);
    sourceRefs(item, item.actorId);
    if (item.openSourceProfile) refs('sourceRecords', 'sourceId', item.openSourceProfile.sourceRefs, `${item.actorId}.openSourceProfile.sourceRefs`);
  }
  for (const item of workspace.valueChainLayers) {
    refs('actors', 'actorId', item.actorRefs, `${item.layerId}.actorRefs`);
    refs('controlPoints', 'controlPointId', item.controlPointRefs, `${item.layerId}.controlPointRefs`);
    sourceRefs(item, item.layerId);
  }
  for (const item of workspace.controlPoints) {
    ref('valueChainLayers', 'layerId', item.layerRef, `${item.controlPointId}.layerRef`);
    ref('actors', 'actorId', item.controllerActorRef, `${item.controlPointId}.controllerActorRef`);
    refs('actors', 'actorId', item.dependentActorRefs, `${item.controlPointId}.dependentActorRefs`);
    refs('actors', 'actorId', item.alternativeActorRefs, `${item.controlPointId}.alternativeActorRefs`);
    sourceRefs(item, item.controlPointId);
  }
  for (const item of workspace.dependencies) {
    refs('actors', 'actorId', item.dependentActorRefs, `${item.dependencyId}.dependentActorRefs`);
    ref('actors', 'actorId', item.providerActorRef, `${item.dependencyId}.providerActorRef`);
    refs('actors', 'actorId', item.alternativeActorRefs, `${item.dependencyId}.alternativeActorRefs`);
    ref('controlPoints', 'controlPointId', item.controlPointRef, `${item.dependencyId}.controlPointRef`, true);
    sourceRefs(item, item.dependencyId);
  }
  for (const item of workspace.ecosystemEdges) {
    ref('actors', 'actorId', item.fromActorRef, `${item.edgeId}.fromActorRef`);
    ref('actors', 'actorId', item.toActorRef, `${item.edgeId}.toActorRef`);
    refs('marketDefinitions', 'marketId', item.marketRefs, `${item.edgeId}.marketRefs`);
    sourceRefs(item, item.edgeId);
  }
  for (const item of workspace.responses) {
    ref('actors', 'actorId', item.actorRef, `${item.responseId}.actorRef`);
    refs('actors', 'actorId', item.targetActorRefs, `${item.responseId}.targetActorRefs`);
    refs('events', 'eventId', item.triggerEventRefs, `${item.responseId}.triggerEventRefs`);
    sourceRefs(item, item.responseId);
  }
  for (const item of workspace.strategicClaims) {
    ref('actors', 'actorId', item.actorRef, `${item.claimId}.actorRef`);
    ref('controlPoints', 'controlPointId', item.controlPointRef, `${item.claimId}.controlPointRef`, true);
    sourceRefs(item, item.claimId);
  }
  for (const item of workspace.moatMechanisms) {
    ref('actors', 'actorId', item.ownerActorRef, `${item.moatId}.ownerActorRef`);
    refs('actors', 'actorId', item.attackerActorRefs, `${item.moatId}.attackerActorRefs`);
    refs('dependencies', 'dependencyId', item.dependencyRefs, `${item.moatId}.dependencyRefs`);
    refs('strategicClaims', 'claimId', item.relatedClaimRefs, `${item.moatId}.relatedClaimRefs`);
    sourceRefs(item, item.moatId);
  }
  for (const item of workspace.antiMoats) {
    ref('actors', 'actorId', item.actorRef, `${item.antiMoatId}.actorRef`);
    refs('actors', 'actorId', item.attackerActorRefs, `${item.antiMoatId}.attackerActorRefs`);
    refs('strategicClaims', 'claimId', item.relatedClaimRefs, `${item.antiMoatId}.relatedClaimRefs`);
    sourceRefs(item, item.antiMoatId);
  }
  for (const item of workspace.commoditizationRisks) {
    refs('dependencies', 'dependencyId', item.dependencyRefs, `${item.riskId}.dependencyRefs`);
    refs('events', 'eventId', item.eventRefs, `${item.riskId}.eventRefs`);
    sourceRefs(item, item.riskId);
  }
  for (const item of workspace.events) {
    refs('actors', 'actorId', item.actorRefs, `${item.eventId}.actorRefs`);
    refs('valueChainLayers', 'layerId', item.affectedLayerRefs, `${item.eventId}.affectedLayerRefs`);
    refs('controlPoints', 'controlPointId', item.affectedControlPointRefs, `${item.eventId}.affectedControlPointRefs`);
    refs('dependencies', 'dependencyId', item.affectedDependencyRefs, `${item.eventId}.affectedDependencyRefs`);
    sourceRefs(item, item.eventId);
  }
  for (const item of workspace.stressScenarios) {
    ref('actors', 'actorId', item.threatActorRef, `${item.scenarioId}.threatActorRef`);
    refs('events', 'eventId', item.eventRefs, `${item.scenarioId}.eventRefs`);
    refs('dependencies', 'dependencyId', item.affectedDependencyRefs, `${item.scenarioId}.affectedDependencyRefs`);
    refs('moatMechanisms', 'moatId', item.affectedMoatRefs, `${item.scenarioId}.affectedMoatRefs`);
    refs('positions', 'positionId', item.affectedPositionRefs, `${item.scenarioId}.affectedPositionRefs`);
    sourceRefs(item, item.scenarioId);
  }
  for (const item of workspace.positions) {
    ref('valueChainLayers', 'layerId', item.targetLayerRef, `${item.positionId}.targetLayerRef`);
    ref('actors', 'actorId', item.actorRef, `${item.positionId}.actorRef`);
    refs('dependencies', 'dependencyId', item.dependencyRefs, `${item.positionId}.dependencyRefs`);
    refs('controlPoints', 'controlPointId', item.controlPointRefs, `${item.positionId}.controlPointRefs`);
    refs('responses', 'responseId', item.responseRefs, `${item.positionId}.responseRefs`);
    refs('commoditizationRisks', 'riskId', item.commoditizationRiskRefs, `${item.positionId}.commoditizationRiskRefs`);
    sourceRefs(item, item.positionId);
  }
  for (const item of workspace.researchGaps) refs('strategicClaims', 'claimId', item.relatedClaimRefs, `${item.gapId}.relatedClaimRefs`);
  for (const item of workspace.handoffs) refs('strategicClaims', 'claimId', item.relatedClaimRefs, `${item.handoffId}.relatedClaimRefs`);
  for (const item of workspace.sourceRecords) {
    refs('sourceRecords', 'sourceId', item.supersedesSourceRefs, `${item.sourceId}.supersedesSourceRefs`);
    refs('strategicClaims', 'claimId', item.supportsClaimRefs, `${item.sourceId}.supportsClaimRefs`);
    refs('strategicClaims', 'claimId', item.refutesClaimRefs, `${item.sourceId}.refutesClaimRefs`);
  }
}

function validateChessboardWorkspace(workspace, options = {}) {
  const errors = [];
  if (!isObject(workspace)) return ['workspace must be an object'];
  for (const key of Object.keys(workspace)) if (!ROOT_KEYS.has(key)) errors.push(`unexpected workspace property: ${key}`);
  if (workspace.schemaVersion !== CHESSBOARD_SCHEMA_VERSION) errors.push(`schemaVersion must be ${CHESSBOARD_SCHEMA_VERSION}`);
  pushEnumError(workspace.workspaceMode, ENUMS.workspaceMode, 'workspaceMode', errors);
  pushEnumError(workspace.privacyScope, ENUMS.privacyScope, 'privacyScope', errors);
  if (!/^chessboard-[a-z0-9-]+$/.test(workspace.workspaceId || '')) errors.push('workspaceId is invalid');

  const allowEmpty = options.allowEmpty === true && isLocalEmpty(workspace);
  validateSelectionAuthority(workspace.selectionAuthority, errors, allowEmpty);
  for (const collection of CHESSBOARD_CONTRACT_COLLECTIONS) {
    if (!Array.isArray(workspace[collection])) errors.push(`${collection} must be an array`);
  }
  validateLegacyAudit(workspace.legacyScoreAudit, errors);
  if (errors.length) return errors;

  if (allowEmpty) return errors;

  if (!/^idea-[0-9]{3}$/.test(workspace.canonicalIdeaId || '')) errors.push('canonicalIdeaId must be an idea ID');
  if (!/^[a-f0-9]{64}$/.test(workspace.canonicalIdeaRevision || '')) errors.push('canonicalIdeaRevision must be a full lowercase SHA-256 digest');
  if (typeof workspace.ventureName !== 'string' || !workspace.ventureName.trim()) errors.push('ventureName is required');
  validateSnapshot(workspace.snapshot, errors);
  if (!workspace.marketDefinitions.length) errors.push('at least one marketDefinition is required');
  if (!workspace.actors.length) errors.push('at least one actor is required');
  if (!workspace.valueChainLayers.length) errors.push('at least one valueChainLayer is required');
  if (!workspace.strategicClaims.length) errors.push('at least one strategicClaim is required');

  const idSets = {};
  for (const collection of CHESSBOARD_CONTRACT_COLLECTIONS) {
    const spec = COLLECTION_SPECS[collection];
    const seen = new Set();
    idSets[collection] = seen;
    workspace[collection].forEach((record, index) => {
      validateRecordShape(collection, record, index, errors);
      const id = isObject(record) ? record[spec.id] : null;
      if (typeof id === 'string') {
        if (seen.has(id)) errors.push(`duplicate ${spec.id}: ${id}`);
        seen.add(id);
      }
    });
  }
  if (!errors.length) validateReferences(workspace, idSets, errors);
  return errors;
}

function summarizeChessboard(workspace) {
  const epistemicCounts = Object.fromEntries(CHESSBOARD_EPISTEMIC_STATES.map(state => [state, 0]));
  for (const collection of CHESSBOARD_CONTRACT_COLLECTIONS) {
    for (const record of workspace[collection] || []) {
      const state = record.epistemicState || record.implicationState;
      if (hasOwn(epistemicCounts, state)) epistemicCounts[state] += 1;
    }
  }
  return {
    empty: isLocalEmpty(workspace),
    markets: workspace.marketDefinitions?.length || 0,
    actors: workspace.actors?.length || 0,
    layers: workspace.valueChainLayers?.length || 0,
    controlPoints: workspace.controlPoints?.length || 0,
    dependencies: workspace.dependencies?.length || 0,
    responses: workspace.responses?.length || 0,
    claims: workspace.strategicClaims?.length || 0,
    claimsWithCounterEvidence: (workspace.strategicClaims || []).filter(item => item.counterEvidenceRefs?.length).length,
    sources: workspace.sourceRecords?.length || 0,
    openResearchGaps: (workspace.researchGaps || []).filter(item => item.status !== 'ANSWERED').length,
    epistemicCounts
  };
}

function validationMessage(errors) {
  const visible = errors.slice(0, 12);
  return `${visible.join('; ')}${errors.length > visible.length ? `; plus ${errors.length - visible.length} more validation errors` : ''}`;
}

class ChessboardStore {
  constructor(options = {}) {
    this.storage = options.storage || globalThis.localStorage;
    this.clock = options.clock || chessboardNow;
    this.idFactory = options.idFactory || chessboardId;
    this.recoveryWarning = null;
    this.rollbackWorkspace = null;
    this.workspace = this._load();
    this.lastPersistedWorkspace = chessboardClone(this.workspace);
  }

  _empty() {
    return localEmptyWorkspace({ now: this.clock(), workspaceId: this.idFactory('chessboard') });
  }

  _load() {
    try {
      const raw = this.storage?.getItem?.(CHESSBOARD_STORAGE_KEY);
      if (!raw) return this._empty();
      const parsed = JSON.parse(raw);
      const errors = validateChessboardWorkspace(parsed, { allowEmpty: true });
      if (errors.length) throw new Error(validationMessage(errors));
      return chessboardClone(parsed);
    } catch (error) {
      this.recoveryWarning = `Stored Chessboard data was not loaded: ${error.message}`;
      return this._empty();
    }
  }

  _replace(candidate, options = {}) {
    const next = chessboardClone(candidate);
    const errors = validateChessboardWorkspace(next, { allowEmpty: options.allowEmpty === true });
    if (errors.length) throw new Error(validationMessage(errors));
    const previous = chessboardClone(this.workspace);
    try {
      const result = this.storage?.setItem?.(CHESSBOARD_STORAGE_KEY, JSON.stringify(next));
      if (result === false) throw new Error('storage adapter rejected the write');
    } catch (error) {
      this.workspace = chessboardClone(this.lastPersistedWorkspace);
      throw new Error(`Chessboard data was not saved: ${error.message}`);
    }
    this.workspace = chessboardClone(next);
    this.lastPersistedWorkspace = chessboardClone(next);
    if (options.rememberRollback !== false) this.rollbackWorkspace = previous;
    this.recoveryWarning = null;
    return this.getWorkspace();
  }

  getWorkspace() {
    return chessboardClone(this.workspace);
  }

  getSummary() {
    return summarizeChessboard(this.workspace);
  }

  getRecoveryWarning() {
    return this.recoveryWarning;
  }

  canRollback() {
    return Boolean(this.rollbackWorkspace);
  }

  exportJson() {
    if (isLocalEmpty(this.workspace)) throw new Error('nothing is loaded; import a populated Chessboard workspace before exporting');
    return `${JSON.stringify(chessboardClone(this.workspace), null, 2)}\n`;
  }

  importJson(raw) {
    let parsed;
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : chessboardClone(raw);
    } catch (error) {
      throw new Error(`invalid JSON: ${error.message}`);
    }
    return this._replace(parsed, { allowEmpty: false, rememberRollback: true });
  }

  rollback() {
    if (!this.rollbackWorkspace) throw new Error('no in-session workspace replacement is available to undo');
    const target = chessboardClone(this.rollbackWorkspace);
    const result = this._replace(target, { allowEmpty: true, rememberRollback: false });
    this.rollbackWorkspace = null;
    return result;
  }

  reset() {
    const previous = chessboardClone(this.workspace);
    try {
      const result = this.storage?.removeItem?.(CHESSBOARD_STORAGE_KEY);
      if (result === false) throw new Error('storage adapter rejected the deletion');
    } catch (error) {
      throw new Error(`Chessboard data was not deleted: ${error.message}`);
    }
    this.workspace = this._empty();
    this.lastPersistedWorkspace = chessboardClone(this.workspace);
    this.rollbackWorkspace = previous;
    this.recoveryWarning = null;
    return this.getWorkspace();
  }
}

const ChessboardAPI = {
  ChessboardStore,
  validateChessboardWorkspace,
  summarizeChessboard,
  localEmptyWorkspace,
  chessboardClone,
  CHESSBOARD_SCHEMA_VERSION,
  CHESSBOARD_STORAGE_KEY,
  CHESSBOARD_PRIVACY_SCOPE,
  CHESSBOARD_COLLECTIONS,
  CHESSBOARD_CONTRACT_COLLECTIONS,
  CHESSBOARD_EPISTEMIC_STATES
};

if (typeof window !== 'undefined') window.VAChessboard = ChessboardAPI;
if (typeof module !== 'undefined' && module.exports) module.exports = ChessboardAPI;
