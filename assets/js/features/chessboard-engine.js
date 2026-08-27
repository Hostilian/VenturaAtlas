/**
 * VenturaAtlas CHESSBOARD — deterministic market-structure reasoning engine.
 *
 * Pure only: no DOM, storage, fetch, clocks, randomness, or ranking writes.
 * The engine evaluates explicit mechanisms supplied by callers. It never turns
 * an absent fact into a score, and it never treats a model hypothesis as fact.
 */

(function universalModule(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ChessboardEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function chessboardFactory() {
  'use strict';

  const UNKNOWN = 'UNKNOWN';
  const EPISTEMIC_STATES = Object.freeze([
    'OBSERVED_FACT',
    'SOURCE_SUPPORTED_INFERENCE',
    'MODEL_HYPOTHESIS',
    'SCENARIO',
    'USER_ASSUMPTION',
    'UNKNOWN'
  ]);

  const COLLECTION_SPECS = Object.freeze({
    marketDefinitions: { idKey: 'marketId' },
    actors: { idKey: 'actorId' },
    valueChainLayers: { idKey: 'layerId' },
    controlPoints: { idKey: 'controlPointId' },
    dependencies: { idKey: 'dependencyId' },
    ecosystemEdges: { idKey: 'edgeId', aliases: ['strategicEdges'] },
    responses: { idKey: 'responseId', aliases: ['responseHypotheses'] },
    strategicClaims: { idKey: 'claimId' },
    moatMechanisms: { idKey: 'moatId' },
    antiMoats: { idKey: 'antiMoatId' },
    commoditizationRisks: { idKey: 'riskId', aliases: ['commoditizationCapabilities'] },
    events: { idKey: 'eventId', aliases: ['marketEvents'] },
    stressScenarios: { idKey: 'scenarioId' },
    positions: { idKey: 'positionId' },
    researchGaps: { idKey: 'gapId' },
    handoffs: { idKey: 'handoffId' },
    sourceRecords: { idKey: 'sourceId', aliases: ['sources'] }
  });

  const REQUIRED_ROOT_FIELDS = Object.freeze([
    'schemaVersion', 'workspaceMode', 'privacyScope', 'workspaceId',
    'selectionAuthority', 'canonicalIdeaId', 'canonicalIdeaRevision',
    'ventureName', 'snapshot', ...Object.keys(COLLECTION_SPECS),
    'legacyScoreAudit'
  ]);

  const REFERENCE_RULES = Object.freeze({
    marketDefinitions: {
      buyerActorRefs: 'actors', includedAlternativeActorRefs: 'actors',
      excludedAlternativeActorRefs: 'actors', sourceRefs: 'sourceRecords'
    },
    actors: {
      marketRefs: 'marketDefinitions', dependencyRefs: 'dependencies',
      controlPointRefs: 'controlPoints', observedMoveRefs: 'events', sourceRefs: 'sourceRecords'
    },
    valueChainLayers: {
      actorRefs: 'actors', controlPointRefs: 'controlPoints', sourceRefs: 'sourceRecords'
    },
    controlPoints: {
      layerRef: 'valueChainLayers', controllerActorRef: 'actors', dependentActorRefs: 'actors',
      alternativeActorRefs: 'actors', sourceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords'
    },
    dependencies: {
      providerActorRef: 'actors', dependentActorRefs: 'actors', alternativeActorRefs: 'actors',
      controlPointRef: 'controlPoints', sourceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords'
    },
    ecosystemEdges: {
      fromActorRef: 'actors', toActorRef: 'actors', marketRefs: 'marketDefinitions',
      sourceRefs: 'sourceRecords'
    },
    responses: {
      actorRef: 'actors', targetActorRefs: 'actors', triggerEventRefs: 'events',
      sourceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords'
    },
    strategicClaims: {
      actorRef: 'actors', controlPointRef: 'controlPoints', evidenceRefs: 'sourceRecords',
      counterEvidenceRefs: 'sourceRecords'
    },
    moatMechanisms: {
      ownerActorRef: 'actors', attackerActorRefs: 'actors', dependencyRefs: 'dependencies',
      evidenceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords',
      relatedClaimRefs: 'strategicClaims'
    },
    antiMoats: {
      actorRef: 'actors', attackerActorRefs: 'actors', evidenceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords',
      relatedClaimRefs: 'strategicClaims'
    },
    commoditizationRisks: {
      dependencyRefs: 'dependencies', eventRefs: 'events', evidenceRefs: 'sourceRecords',
      counterEvidenceRefs: 'sourceRecords'
    },
    events: {
      actorRefs: 'actors', affectedLayerRefs: 'valueChainLayers',
      affectedControlPointRefs: 'controlPoints', affectedDependencyRefs: 'dependencies',
      sourceRefs: 'sourceRecords'
    },
    stressScenarios: {
      threatActorRef: 'actors', eventRefs: 'events', affectedDependencyRefs: 'dependencies',
      affectedMoatRefs: 'moatMechanisms', affectedPositionRefs: 'positions',
      sourceRefs: 'sourceRecords'
    },
    positions: {
      targetLayerRef: 'valueChainLayers', actorRef: 'actors', dependencyRefs: 'dependencies',
      controlPointRefs: 'controlPoints', responseRefs: 'responses',
      commoditizationRiskRefs: 'commoditizationRisks',
      evidenceRefs: 'sourceRecords', counterEvidenceRefs: 'sourceRecords'
    },
    researchGaps: { relatedClaimRefs: 'strategicClaims' },
    handoffs: { relatedClaimRefs: 'strategicClaims' },
    sourceRecords: {
      supersedesSourceRefs: 'sourceRecords', supportsClaimRefs: 'strategicClaims',
      refutesClaimRefs: 'strategicClaims'
    }
  });

  const ASSERTION_STATE_FIELDS = Object.freeze({
    marketDefinitions: 'epistemicState',
    actors: 'epistemicState',
    valueChainLayers: 'epistemicState',
    controlPoints: 'epistemicState',
    dependencies: 'epistemicState',
    ecosystemEdges: 'epistemicState',
    responses: 'epistemicState',
    strategicClaims: 'epistemicState',
    moatMechanisms: 'epistemicState',
    antiMoats: 'epistemicState',
    commoditizationRisks: 'epistemicState',
    events: 'implicationState',
    stressScenarios: 'epistemicState',
    positions: 'epistemicState'
  });

  const SOURCE_SUPPORTED_STATES = new Set(['OBSERVED_FACT', 'SOURCE_SUPPORTED_INFERENCE']);
  const OFFICIAL_SOURCE_CLASSES = new Set([
    'PRIMARY_OR_OFFICIAL', 'PRIMARY_OFFICIAL', 'OFFICIAL', 'REGULATOR', 'STANDARD_BODY'
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (isObject(value)) {
      const result = {};
      for (const [key, item] of Object.entries(value)) result[key] = clone(item);
      return result;
    }
    return value;
  }

  function unique(values) {
    return [...new Set(asArray(values).filter(value => value !== null && value !== undefined && value !== ''))];
  }

  function collection(document, name) {
    if (Array.isArray(document?.[name])) return document[name];
    for (const alias of COLLECTION_SPECS[name]?.aliases || []) {
      if (Array.isArray(document?.[alias])) return document[alias];
    }
    return [];
  }

  function firstDefined(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return undefined;
  }

  function normalizeToken(value) {
    return String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  }

  function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function unknownResult(reason, extra = {}) {
    return { status: UNKNOWN, reason, ...extra };
  }

  function sourceRefsFor(collectionName, item) {
    if (collectionName === 'strategicClaims' || collectionName === 'moatMechanisms' ||
        collectionName === 'antiMoats' || collectionName === 'commoditizationRisks' ||
        collectionName === 'positions') {
      return unique([...(item.evidenceRefs || []), ...(item.counterEvidenceRefs || [])]);
    }
    return unique(item.sourceRefs || []);
  }

  function forbiddenScalarPaths(value, path = '$', paths = []) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => forbiddenScalarPaths(item, `${path}[${index}]`, paths));
      return paths;
    }
    if (!isObject(value)) return paths;

    for (const [key, item] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      const isLegacyAudit = path.startsWith('$.legacyScoreAudit');
      const scoreLike = /^(score|rating|rank|weight|ecosystemPower|platformRisk|moatStrength|moatScore|competitionScore|defensibilityScore|strategicPositionScore)$/i.test(key) ||
        /(Power|Risk|Moat|Competition|Defensibility)Score$/i.test(key);
      const rankingWrite = /^(rankingWeights|globalRankingWeights|rankingDimensions)$/i.test(key);
      if (!isLegacyAudit && ((scoreLike && typeof item === 'number') || rankingWrite)) paths.push(childPath);
      forbiddenScalarPaths(item, childPath, paths);
    }
    return paths;
  }

  function validateWorkspace(workspace) {
    const errors = [];
    const warnings = [];
    const indexes = {};

    function error(code, path, message, ref) {
      errors.push({ code, path, message, ...(ref ? { ref } : {}) });
    }

    if (!isObject(workspace)) {
      return {
        valid: false,
        errors: [{ code: 'WORKSPACE_NOT_OBJECT', path: '$', message: 'Workspace must be an object.' }],
        warnings,
        counts: {}
      };
    }

    for (const field of REQUIRED_ROOT_FIELDS) {
      if (!(field in workspace)) error('MISSING_ROOT_FIELD', `$.${field}`, `Missing required root field ${field}.`);
    }

    if (workspace.canonicalIdeaRevision !== undefined &&
        !/^[a-f0-9]{64}$/.test(String(workspace.canonicalIdeaRevision || ''))) {
      error('INVALID_CANONICAL_REVISION', '$.canonicalIdeaRevision', 'canonicalIdeaRevision must be a full SHA-256 digest.');
    }

    const selection = workspace.selectionAuthority;
    if (isObject(selection)) {
      if (selection.state === 'NO_AUTHORITATIVE_ACTIVE_VENTURE' && selection.activeVentureId !== null) {
        error(
          'SELECTION_AUTHORITY_CONFLICT',
          '$.selectionAuthority.activeVentureId',
          'NO_AUTHORITATIVE_ACTIVE_VENTURE requires activeVentureId to be null.'
        );
      }
      if (selection.state === 'AUTHORITATIVE_ACTIVE_VENTURE' &&
          selection.activeVentureId !== workspace.canonicalIdeaId) {
        error(
          'SELECTION_AUTHORITY_CONFLICT',
          '$.selectionAuthority.activeVentureId',
          'The authoritative active venture must match canonicalIdeaId.'
        );
      }
    }

    if (workspace.workspaceMode === 'PUBLIC_SANITIZED' && workspace.privacyScope !== 'PUBLIC_SANITIZED') {
      error(
        'PUBLIC_MODE_SCOPE_MISMATCH',
        '$.privacyScope',
        'PUBLIC_SANITIZED workspaceMode requires PUBLIC_SANITIZED privacyScope.'
      );
    }
    if (workspace.workspaceMode === 'PRIVATE_STRATEGY' && workspace.privacyScope === 'PUBLIC_SANITIZED') {
      error(
        'PRIVATE_MODE_SCOPE_MISMATCH',
        '$.privacyScope',
        'PRIVATE_STRATEGY cannot declare a public privacy scope.'
      );
    }

    for (const [name, spec] of Object.entries(COLLECTION_SPECS)) {
      const raw = workspace[name];
      if (!Array.isArray(raw)) {
        if (raw !== undefined) error('COLLECTION_NOT_ARRAY', `$.${name}`, `${name} must be an array.`);
        indexes[name] = new Map();
        continue;
      }

      const index = new Map();
      raw.forEach((item, position) => {
        const path = `$.${name}[${position}]`;
        if (!isObject(item)) {
          error('ITEM_NOT_OBJECT', path, `${name} entries must be objects.`);
          return;
        }
        const id = item[spec.idKey];
        if (!hasText(id)) {
          error('MISSING_ID', `${path}.${spec.idKey}`, `${name} entry lacks ${spec.idKey}.`);
          return;
        }
        if (index.has(id)) error('DUPLICATE_ID', `${path}.${spec.idKey}`, `Duplicate ${spec.idKey}: ${id}.`, id);
        else index.set(id, item);

        const stateField = ASSERTION_STATE_FIELDS[name];
        if (stateField) {
          const state = item[stateField];
          if (!EPISTEMIC_STATES.includes(state)) {
            error('INVALID_EPISTEMIC_STATE', `${path}.${stateField}`, `${name} assertions require an explicit ${stateField}.`);
          } else if (SOURCE_SUPPORTED_STATES.has(state) && sourceRefsFor(name, item).length === 0) {
            error('UNSOURCED_SUPPORTED_ASSERTION', path, `${state} requires evidence references.`);
          }
        }
      });
      indexes[name] = index;
    }

    for (const [name, rules] of Object.entries(REFERENCE_RULES)) {
      collection(workspace, name).forEach((item, position) => {
        for (const [field, targetCollection] of Object.entries(rules)) {
          if (!(field in item) || item[field] === null) continue;
          const path = `$.${name}[${position}].${field}`;
          const refs = field.endsWith('Refs') ? item[field] : [item[field]];
          if (!Array.isArray(refs)) {
            error('REFERENCE_TYPE', path, `${field} must be ${field.endsWith('Refs') ? 'an array' : 'a string reference'}.`);
            continue;
          }
          if (refs.length !== new Set(refs).size) {
            error('DUPLICATE_REFERENCE', path, `${field} contains duplicate references.`);
          }
          for (const ref of refs) {
            if (!hasText(ref) || !indexes[targetCollection]?.has(ref)) {
              error('DANGLING_REFERENCE', path, `${field} references missing ${targetCollection} record ${String(ref)}.`, String(ref));
            }
          }
        }
      });
    }

    for (const path of forbiddenScalarPaths(workspace)) {
      error('FORBIDDEN_STRATEGIC_SCORE', path, 'CHESSBOARD stores mechanisms, not ungoverned scalar scores or ranking weights.');
    }

    if (workspace.workspaceMode === 'PUBLIC_SANITIZED') {
      collection(workspace, 'sourceRecords').forEach((source, index) => {
        if (source.visibility !== 'PUBLIC') {
          error(
            'NONPUBLIC_SOURCE_IN_PUBLIC_WORKSPACE',
            `$.sourceRecords[${index}].visibility`,
            'Public sanitized workspaces may contain only public source records.'
          );
        }
      });
    }

    if (isObject(workspace.legacyScoreAudit) &&
        (workspace.legacyScoreAudit.mutationAuthorized !== false || workspace.legacyScoreAudit.methodologyChange !== false)) {
      error(
        'SCORING_GOVERNANCE_VIOLATION',
        '$.legacyScoreAudit',
        'CHESSBOARD may audit legacy dimensions but cannot authorize score mutation or methodology changes.'
      );
    }

    const counts = {};
    for (const name of Object.keys(COLLECTION_SPECS)) counts[name] = collection(workspace, name).length;
    return { valid: errors.length === 0, errors, warnings, counts };
  }

  function traceClaim(workspace, claimId) {
    const claim = collection(workspace, 'strategicClaims').find(item => item.claimId === claimId);
    if (!claim) return unknownResult('CLAIM_NOT_FOUND', { claimId, evidence: [], counterEvidence: [], missingRefs: [] });

    const sourceIndex = new Map(collection(workspace, 'sourceRecords').map(source => [source.sourceId, source]));
    const evidenceRefs = unique(claim.evidenceRefs || []);
    const counterEvidenceRefs = unique(claim.counterEvidenceRefs || []);
    const evidence = evidenceRefs.map(ref => sourceIndex.get(ref)).filter(Boolean).map(clone);
    const counterEvidence = counterEvidenceRefs.map(ref => sourceIndex.get(ref)).filter(Boolean).map(clone);
    const missingRefs = [...evidenceRefs, ...counterEvidenceRefs].filter(ref => !sourceIndex.has(ref));

    return {
      status: missingRefs.length ? 'INCOMPLETE_TRACE' : 'TRACEABLE',
      claim: clone(claim),
      evidence,
      counterEvidence,
      missingRefs,
      hasCounterEvidence: counterEvidence.length > 0
    };
  }

  function testNetworkEffect(input = {}) {
    const claimText = normalizeToken(firstDefined(input.claim, input.mechanism, ''));
    const participants = unique(input.participants || input.sides || []);
    const loops = asArray(input.valueLoops).filter(loop => isObject(loop));
    const dataOnly = input.dataAccumulationOnly === true ||
      (/more users/.test(claimText) && /more data/.test(claimText) && loops.length === 0);

    if (dataOnly) {
      return {
        status: 'REJECTED', qualifies: false, mechanismType: 'DATA_ACCUMULATION_NOT_NETWORK_EFFECT',
        reason: 'More users producing more data does not identify who receives increasing network value.',
        participants, valueLoops: [], multiHoming: clone(input.multiHoming ?? UNKNOWN)
      };
    }

    const validLoops = loops.filter(loop => hasText(loop.fromSide) && hasText(loop.toSide) &&
      hasText(firstDefined(loop.valueCreated, loop.mechanism, loop.effect)));
    if (participants.length === 0 || validLoops.length === 0) {
      return unknownResult('PARTICIPANTS_OR_VALUE_LOOP_MISSING', {
        qualifies: false, mechanismType: UNKNOWN, participants, valueLoops: clone(validLoops)
      });
    }

    const directions = new Set(validLoops.map(loop => `${loop.fromSide}->${loop.toSide}`));
    let mechanismType = 'DIRECT_NETWORK_EFFECT';
    let qualifies = validLoops.some(loop => loop.fromSide === loop.toSide);
    if (participants.length >= 2) {
      const [left, right] = participants;
      const bothDirections = directions.has(`${left}->${right}`) && directions.has(`${right}->${left}`);
      if (bothDirections) {
        mechanismType = 'CROSS_SIDE_NETWORK_EFFECT';
        qualifies = true;
      } else {
        mechanismType = 'ONE_WAY_CROSS_SIDE_EFFECT';
        qualifies = false;
      }
    }

    const multiHoming = isObject(input.multiHoming) ? clone(input.multiHoming) : { status: UNKNOWN };
    const lowFrictionMultiHoming = multiHoming.allowed === true &&
      ['none', 'negligible', 'low'].includes(normalizeToken(firstDefined(multiHoming.cost, multiHoming.friction)));

    return {
      status: qualifies ? 'CONDITIONAL' : 'REJECTED',
      qualifies,
      mechanismType,
      participants,
      valueLoops: clone(validLoops),
      multiHoming,
      durabilityConstraint: lowFrictionMultiHoming ? 'LOW_FRICTION_MULTI_HOMING' : UNKNOWN,
      evidenceRefs: unique(input.evidenceRefs || [])
    };
  }

  function testDataAdvantage(input = {}) {
    const ownership = String(firstDefined(input.ownership, input.dataOwnership, UNKNOWN)).toUpperCase();
    const portability = String(firstDefined(input.portability, input.userPortability, UNKNOWN)).toUpperCase();
    const commodity = input.commodity === true || input.publiclyAvailable === true ||
      input.commodityAccess === true || ownership === 'PUBLIC';
    const portable = input.portable === true || input.userExportable === true ||
      ['HIGH', 'FULL', 'EASY', 'PORTABLE', 'FULLY_PORTABLE'].includes(portability);
    const lawfulReuse = input.lawfulReuse === true || input.reuseLawful === true;
    const performanceLoop = isObject(input.performanceLoop) ? input.performanceLoop : {};
    const measuredImprovement = (performanceLoop.measuredImprovement === true ||
      input.measuredImprovement === true) && hasText(firstDefined(
      performanceLoop.metric,
      performanceLoop.measurement,
      input.improvementMetric
    ));
    const repeatedLearning = performanceLoop.repeatedCorrections === true ||
      performanceLoop.repeatedObservations === true || input.repeatedCorrections === true;

    const disqualifiers = [];
    if (commodity) disqualifiers.push('PUBLIC_OR_COMMODITY_DATA');
    if (portable) disqualifiers.push('HIGH_DATA_PORTABILITY');
    if (ownership === 'THIRD_PARTY_COMMODITY') disqualifiers.push('THIRD_PARTY_COMMODITY_ACCESS');
    if (disqualifiers.length) {
      return {
        status: 'REJECTED', qualifies: false, disqualifiers,
        reason: 'The asserted data asset is available or portable enough that exclusivity is not established.',
        evidenceRefs: unique(input.evidenceRefs || [])
      };
    }

    const conditions = {
      proprietaryControl: ownership === 'PROPRIETARY',
      lawfulReuse,
      measuredImprovement,
      repeatedLearning
    };
    if (Object.values(conditions).every(Boolean)) {
      return {
        status: 'CONDITIONAL', qualifies: true,
        mechanismType: 'PROPRIETARY_MEASURED_LEARNING_LOOP',
        conditions,
        performanceLoop: clone(performanceLoop),
        attackerResponse: clone(input.attackerResponse ?? UNKNOWN),
        decayDrivers: clone(input.decayDrivers || []),
        falsifier: firstDefined(input.falsifier, 'Measured performance does not improve as lawful proprietary examples accumulate.'),
        evidenceRefs: unique(input.evidenceRefs || [])
      };
    }

    return unknownResult('PROPRIETARY_LAWFUL_MEASURED_LOOP_NOT_ESTABLISHED', {
      qualifies: false, conditions, evidenceRefs: unique(input.evidenceRefs || [])
    });
  }

  function testSwitchingCost(input = {}) {
    const multiHoming = isObject(input.multiHoming) ? input.multiHoming : {};
    const providerCount = Number(firstDefined(
      multiHoming.providerCount,
      multiHoming.productCount,
      input.concurrentProviderCount,
      input.concurrentProducts,
      0
    ));
    const friction = normalizeToken(firstDefined(multiHoming.friction, multiHoming.cost, UNKNOWN));
    const lowMultiHomingFriction = ['none', 'negligible', 'low'].includes(friction);
    const multiHomingAllowed = multiHoming.allowed === true ||
      ['YES', 'CONDITIONAL'].includes(String(multiHoming.allowed || '').toUpperCase());
    const cheapMultiHoming = lowMultiHomingFriction &&
      (multiHomingAllowed || providerCount >= 2);
    if (cheapMultiHoming) {
      return {
        status: 'LOW_FRICTION', lockInClaimSupported: false,
        mechanism: 'LOW_COST_MULTI_HOMING', providerCount: providerCount || UNKNOWN,
        switchProcess: clone(input.switchProcess || []), evidenceRefs: unique(input.evidenceRefs || [])
      };
    }

    const process = asArray(input.switchProcess).length
      ? asArray(input.switchProcess)
      : (isObject(input.switchingProcess)
        ? Object.entries(input.switchingProcess).map(([kind, description]) => ({
          kind,
          description,
          required: !/^none|not applicable|unknown$/i.test(String(description || '')),
          historyLoss: kind === 'historicalContextLoss' && !/^none|not applicable|unknown$/i.test(String(description || '')),
          integrationRebuild: kind === 'integrationRebuild' && !/^none|not applicable|unknown$/i.test(String(description || ''))
        }))
        : []);
    const materialSteps = process.filter(step => isObject(step) &&
      (step.required === true || step.historyLoss === true || step.integrationRebuild === true || step.downtime === true));
    const historyLoss = input.historyLossOnSwitch === true || input.workflowHistoryLoss === true ||
      materialSteps.some(step => step.historyLoss === true);
    const integrationRebuild = input.integrationRebuild === true || input.integrationRebuildOnSwitch === true ||
      materialSteps.some(step => step.integrationRebuild === true);

    if (!process.length && !historyLoss && !integrationRebuild) {
      return unknownResult('SWITCHING_PROCESS_NOT_DESCRIBED', {
        lockInClaimSupported: false, mechanism: UNKNOWN, evidenceRefs: unique(input.evidenceRefs || [])
      });
    }

    return {
      status: 'CONDITIONAL',
      lockInClaimSupported: materialSteps.length > 0 || historyLoss || integrationRebuild,
      mechanism: historyLoss && integrationRebuild
        ? 'HISTORY_LOSS_AND_INTEGRATION_REBUILD'
        : 'EXPLICIT_SWITCH_PROCESS_FRICTION',
      materialSteps: clone(materialSteps),
      historyLoss,
      integrationRebuild,
      portability: firstDefined(input.portability, UNKNOWN),
      evidenceRefs: unique(input.evidenceRefs || [])
    };
  }

  function testSystemOfRecord(input = {}) {
    const authoritativeState = input.authoritativeWorkflowState === true || input.authoritativeState === true;
    const historyLoss = input.historyLossOnRemoval === true || input.workflowHistoryLoss === true;
    const integrationRebuild = input.integrationRebuildOnRemoval === true || input.integrationRebuild === true;
    const evidenceRefs = unique(input.evidenceRefs || []);
    if (!authoritativeState && !historyLoss && !integrationRebuild) {
      return unknownResult('SYSTEM_OF_RECORD_MECHANISM_NOT_DESCRIBED', {
        qualifies: false, evidenceRefs
      });
    }

    const qualifies = authoritativeState && (historyLoss || integrationRebuild);
    return {
      status: qualifies ? 'CONDITIONAL' : UNKNOWN,
      qualifies,
      mechanism: qualifies ? 'AUTHORITATIVE_WORKFLOW_STATE_REMOVAL_COST' : UNKNOWN,
      removalProcess: {
        authoritativeState,
        historyLoss,
        integrationRebuild,
        migrationRequired: input.migrationRequired === true
      },
      evidenceRefs,
      falsifier: firstDefined(input.falsifier, UNKNOWN)
    };
  }

  function analyzeIncumbentResponse(response = {}) {
    const nestedAbility = isObject(response.ability) ? response.ability : {};
    const nestedIncentive = isObject(response.incentive) ? response.incentive : {};
    const abilityLevel = isObject(response.ability)
      ? firstDefined(response.ability.level, UNKNOWN)
      : String(firstDefined(response.ability, UNKNOWN)).toUpperCase();
    const incentiveLevel = isObject(response.incentive)
      ? firstDefined(response.incentive.level, UNKNOWN)
      : String(firstDefined(response.incentive, UNKNOWN)).toUpperCase();
    const constraints = unique(response.constraints || []);
    const abilityMechanisms = [
      hasText(response.abilityMechanism) ? response.abilityMechanism : null,
      nestedAbility.distributionControl === true ? 'DISTRIBUTION_CONTROL' : null,
      nestedAbility.installedBase === true ? 'INSTALLED_BASE' : null,
      nestedAbility.canBundle === true ? 'BUNDLING_PATH' : null,
      nestedAbility.implementationCapability === true ? 'IMPLEMENTATION_CAPABILITY' : null,
      hasText(nestedAbility.controlledAsset) ? `CONTROLLED_ASSET:${nestedAbility.controlledAsset}` : null,
      hasText(nestedAbility.responsePath) ? `RESPONSE_PATH:${nestedAbility.responsePath}` : null
    ].filter(Boolean);
    let abilityStatus = UNKNOWN;
    if (abilityMechanisms.length && ['HIGH', 'VERY_HIGH', 'MEDIUM', 'PLAUSIBLE'].includes(abilityLevel)) abilityStatus = 'PLAUSIBLE';
    else if (abilityMechanisms.length && ['LOW', 'VERY_LOW'].includes(abilityLevel)) abilityStatus = 'WEAK';
    else if (isObject(response.ability) && abilityMechanisms.length) abilityStatus = 'PLAUSIBLE';

    const incentiveMechanism = firstDefined(response.incentiveMechanism, nestedIncentive.mechanism, '');
    const incentiveContext = normalizeToken([incentiveMechanism, ...constraints].join(' '));
    const cannibalization = nestedIncentive.cannibalizesCoreRevenue === true ||
      nestedIncentive.cannibalization === true || /cannibali[sz]|core revenue/.test(incentiveContext);
    const positiveMotive = nestedIncentive.retentionBenefit === true || nestedIncentive.revenueOpportunity === true ||
      nestedIncentive.strategicDefense === true || nestedIncentive.platformControlBenefit === true ||
      /retention|new revenue|strategic defense|platform control/.test(normalizeToken(incentiveMechanism));
    let incentiveStatus = UNKNOWN;
    if (['LOW', 'VERY_LOW', 'WEAK'].includes(incentiveLevel)) incentiveStatus = 'WEAK';
    else if (incentiveLevel === 'MEDIUM') incentiveStatus = 'MIXED';
    else if (['HIGH', 'VERY_HIGH'].includes(incentiveLevel)) incentiveStatus = cannibalization ? 'MIXED' : 'PLAUSIBLE';
    else if (cannibalization && !positiveMotive) incentiveStatus = 'WEAK';
    else if (cannibalization && positiveMotive) incentiveStatus = 'MIXED';
    else if (positiveMotive) incentiveStatus = 'PLAUSIBLE';

    const missing = [];
    if (!hasText(firstDefined(response.actorRef, response.actor))) missing.push('actor');
    if (!hasText(response.trigger)) missing.push('trigger');
    if (!hasText(firstDefined(response.possibleAction, response.response, response.move))) missing.push('response');
    if (abilityStatus === UNKNOWN) missing.push('ability mechanism');
    if (incentiveStatus === UNKNOWN) missing.push('incentive mechanism');

    return {
      status: missing.length ? 'INCOMPLETE' : 'CONDITIONAL',
      actorRef: firstDefined(response.actorRef, response.actor, UNKNOWN),
      trigger: firstDefined(response.trigger, UNKNOWN),
      response: firstDefined(response.possibleAction, response.response, response.move, UNKNOWN),
      ability: { level: abilityLevel, status: abilityStatus, mechanisms: unique(abilityMechanisms) },
      incentive: {
        level: incentiveLevel,
        status: incentiveStatus,
        mechanism: hasText(incentiveMechanism) ? incentiveMechanism : UNKNOWN,
        cannibalization,
        positiveMotive
      },
      constraints,
      timeHorizon: firstDefined(response.timeToExecute, response.timeHorizon, UNKNOWN),
      impact: firstDefined(response.likelyImpact, response.impact, UNKNOWN),
      countermoves: clone(firstDefined(response.countermoves, response.countermove, [])),
      sourceRefs: unique(response.sourceRefs || []),
      missing
    };
  }

  function assessBundleExposure(input = {}) {
    const conditions = {
      capabilityOverlap: input.capabilityOverlap === true || hasText(input.overlappingCapability),
      sameBuyerContract: input.sameBuyerContract === true,
      incumbentDistribution: input.incumbentDistribution === true || input.distributionControl === true,
      implementationPath: hasText(input.implementationPath) || input.canImplement === true,
      lowMarginalPrice: input.marginalPrice === 0 || ['free', 'included'].includes(normalizeToken(input.marginalPrice))
    };
    const coreConditions = conditions.capabilityOverlap && conditions.sameBuyerContract &&
      conditions.incumbentDistribution && conditions.implementationPath;
    if (!coreConditions) {
      const known = Object.values(conditions).some(Boolean);
      return known
        ? { status: 'NOT_ESTABLISHED', exposed: false, conditions, sourceRefs: unique(input.sourceRefs || []) }
        : unknownResult('BUNDLE_PATH_NOT_DESCRIBED', { exposed: false, conditions });
    }
    return {
      status: 'CONDITIONAL_EXPOSURE',
      exposed: true,
      mechanism: conditions.lowMarginalPrice ? 'CAPABILITY_INCLUDED_IN_EXISTING_CONTRACT' : 'SUITE_DISTRIBUTION_AND_BUNDLE_PATH',
      conditions,
      remainingDifferentiation: firstDefined(input.remainingDifferentiation, UNKNOWN),
      sourceRefs: unique(input.sourceRefs || [])
    };
  }

  function analyzeDirectCompetitor(workspace, actorId) {
    const actors = collection(workspace, 'actors');
    const actor = actorId
      ? actors.find(item => item.actorId === actorId)
      : actors.find(item => item.type === 'DIRECT_COMPETITOR');
    if (!actor) return unknownResult('DIRECT_COMPETITOR_NOT_IDENTIFIED', { complete: false });

    const venture = actors.find(item => item.type === 'VENTURE');
    const competitionEdges = collection(workspace, 'ecosystemEdges').filter(edge =>
      edge.type === 'COMPETES_WITH' && venture &&
      ((edge.fromActorRef === venture.actorId && edge.toActorRef === actor.actorId) ||
       (edge.fromActorRef === actor.actorId && edge.toActorRef === venture.actorId))
    );
    const sourceIndex = new Map(collection(workspace, 'sourceRecords').map(source => [source.sourceId, source]));
    const sourceRefs = unique([
      ...(actor.sourceRefs || []),
      ...competitionEdges.flatMap(edge => edge.sourceRefs || [])
    ]);
    const missingSourceRefs = sourceRefs.filter(ref => !sourceIndex.has(ref));
    const commonMarketRefs = venture
      ? unique(actor.marketRefs || []).filter(ref => unique(venture.marketRefs || []).includes(ref))
      : [];
    const commonAssets = venture
      ? unique(actor.assets || []).filter(asset => unique(venture.assets || []).includes(asset))
      : [];
    const productOverlap = unique([
      ...asArray(firstDefined(actor.productOverlap, actor.overlap)),
      ...commonMarketRefs.map(ref => `MARKET:${ref}`),
      ...commonAssets.map(asset => `ASSET:${asset}`),
      ...competitionEdges.map(edge => `COMPETITION_MECHANISM:${edge.mechanism}`)
    ]);
    const structuralDifferences = unique([
      ...asArray(actor.structuralDifferences),
      ...(venture ? unique(actor.assets || []).filter(asset => !unique(venture.assets || []).includes(asset))
        .map(asset => `COMPETITOR_ONLY_ASSET:${asset}`) : []),
      ...(venture ? unique(venture.assets || []).filter(asset => !unique(actor.assets || []).includes(asset))
        .map(asset => `VENTURE_ONLY_ASSET:${asset}`) : []),
      ...(venture && JSON.stringify(unique(actor.dependencyRefs || []).sort()) !==
        JSON.stringify(unique(venture.dependencyRefs || []).sort()) ? ['DEPENDENCY_FOOTPRINT_DIFFERS'] : []),
      ...(venture && JSON.stringify(unique(actor.controlPointRefs || []).sort()) !==
        JSON.stringify(unique(venture.controlPointRefs || []).sort()) ? ['CONTROL_FOOTPRINT_DIFFERS'] : [])
    ]);
    const complete = sourceRefs.length > 0 && missingSourceRefs.length === 0 &&
      productOverlap.length > 0 && structuralDifferences.length > 0;
    return {
      status: complete ? 'TRACEABLE' : 'INCOMPLETE',
      complete,
      actor: clone(actor),
      productOverlap: clone(productOverlap),
      structuralDifferences: clone(structuralDifferences),
      sources: sourceRefs.map(ref => sourceIndex.get(ref)).filter(Boolean).map(clone),
      missingSourceRefs
    };
  }

  function traceDependencyControlChain(workspace, dependencyId) {
    const dependency = collection(workspace, 'dependencies').find(item => item.dependencyId === dependencyId);
    if (!dependency) return unknownResult('DEPENDENCY_NOT_FOUND', { dependencyId, chain: [] });

    const actorIndex = new Map(collection(workspace, 'actors').map(actor => [actor.actorId, actor]));
    const controlIndex = new Map(collection(workspace, 'controlPoints').map(point => [point.controlPointId, point]));
    const provider = actorIndex.get(dependency.providerActorRef);
    const controlPoint = controlIndex.get(dependency.controlPointRef);
    const dependents = unique(dependency.dependentActorRefs || []).map(ref => actorIndex.get(ref)).filter(Boolean);
    const alternatives = unique(dependency.alternativeActorRefs || []).map(ref => actorIndex.get(ref)).filter(Boolean);
    const missingRefs = [];
    if (dependency.providerActorRef && !provider) missingRefs.push(dependency.providerActorRef);
    if (dependency.controlPointRef && !controlPoint) missingRefs.push(dependency.controlPointRef);
    for (const ref of unique([...(dependency.dependentActorRefs || []), ...(dependency.alternativeActorRefs || [])])) {
      if (!actorIndex.has(ref)) missingRefs.push(ref);
    }

    const chain = [
      ...dependents.map(actor => ({ kind: 'DEPENDENT_ACTOR', ref: actor.actorId, name: actor.name })),
      { kind: 'DEPENDENCY', ref: dependency.dependencyId, name: dependency.resource },
      ...(controlPoint ? [{
        kind: 'CONTROL_POINT',
        ref: controlPoint.controlPointId,
        name: controlPoint.controlledResource,
        mechanism: controlPoint.mechanism
      }] : []),
      ...(provider ? [{ kind: 'PROVIDER_ACTOR', ref: provider.actorId, name: provider.name }] : [])
    ];

    return {
      status: missingRefs.length ? 'INCOMPLETE_TRACE' : 'TRACEABLE',
      dependency: clone(dependency), provider: clone(provider ?? UNKNOWN),
      controlPoint: clone(controlPoint ?? UNKNOWN), dependents: dependents.map(clone),
      alternatives: alternatives.map(clone),
      singleProvider: Boolean(provider) && alternatives.length === 0 &&
        unique(dependency.alternativeDescriptions || []).length === 0,
      switching: firstDefined(dependency.switchingCost, dependency.switching, dependency.switchingAbility, UNKNOWN),
      providerEntryRisk: firstDefined(dependency.providerEntryRisk, UNKNOWN),
      chain,
      missingRefs: unique(missingRefs)
    };
  }

  function intersects(left, right) {
    const rightSet = new Set(asArray(right));
    return asArray(left).some(value => rightSet.has(value));
  }

  function appendUnique(record, field, value) {
    record[field] = unique([...(record[field] || []), value]);
  }

  function lowerQualitativeLevel(value) {
    return ({ VERY_HIGH: 'HIGH', HIGH: 'MEDIUM', MEDIUM: 'LOW', LOW: 'VERY_LOW', VERY_LOW: 'VERY_LOW' })[
      String(value || '').toUpperCase()
    ] || UNKNOWN;
  }

  function raiseQualitativeLevel(value) {
    return ({ VERY_LOW: 'LOW', LOW: 'MEDIUM', MEDIUM: 'HIGH', HIGH: 'VERY_HIGH', VERY_HIGH: 'VERY_HIGH' })[
      String(value || '').toUpperCase()
    ] || UNKNOWN;
  }

  function applyStrategicEvent(workspace, event) {
    if (!isObject(workspace) || !isObject(event) || !hasText(event.eventId)) {
      return unknownResult('WORKSPACE_OR_EVENT_INVALID', { workspace: clone(workspace), effects: [] });
    }
    const kind = String(firstDefined(event.kind, event.eventType, '')).toUpperCase();
    const supportedKinds = new Set([
      'OPEN_SOURCE_RELEASE', 'OPEN_SOURCE_SHOCK',
      'INTEROPERABILITY_CHANGE', 'INTEROPERABILITY_SHOCK', 'INTEROPERABILITY_INCREASE',
      'PROVIDER_ENTRY', 'UPSTREAM_PROVIDER_ENTRY',
      'PRODUCT_LAUNCH', 'FEATURE_LAUNCH', 'PRICE_CHANGE', 'BUNDLE', 'ACQUISITION',
      'PARTNERSHIP', 'API_CHANGE', 'STANDARD_CHANGE', 'REGULATORY_CHANGE',
      'NEW_ENTRANT', 'EXIT', 'FUNDING_EVENT', 'DISTRIBUTION_CHANGE'
    ]);
    if (!supportedKinds.has(kind)) {
      return unknownResult('UNSUPPORTED_EVENT_KIND', { workspace: clone(workspace), effects: [] });
    }

    const next = clone(workspace);
    const effects = [];
    const events = collection(next, 'events');
    if (!events.some(item => item.eventId === event.eventId)) events.push(clone(event));
    const affectedDependencies = unique(event.affectedDependencyRefs || []);
    const affectedRisks = unique(event.affectedRiskRefs || []);
    const affectedMoats = unique(event.affectedMoatRefs || []);

    const risks = collection(next, 'commoditizationRisks');
    const moats = collection(next, 'moatMechanisms');
    const dependencies = collection(next, 'dependencies');
    const controlPoints = collection(next, 'controlPoints');
    const responses = collection(next, 'responses');
    const actorIndex = new Map(collection(next, 'actors').map(actor => [actor.actorId, actor]));

    if (kind === 'OPEN_SOURCE_RELEASE' || kind === 'OPEN_SOURCE_SHOCK') {
      const openSourceActorRefs = unique(event.actorRefs || []).filter(ref =>
        actorIndex.get(ref)?.type === 'OPEN_SOURCE_PROJECT'
      );
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        for (const actorRef of openSourceActorRefs) appendUnique(dependency, 'alternativeActorRefs', actorRef);
        appendUnique(dependency, 'alternativeDescriptions', `Open-source substitute observed in ${event.eventId}`);
        effects.push({ kind: 'SUBSTITUTION_AVAILABILITY_INCREASED', targetRef: dependency.dependencyId });
      }
      for (const risk of risks) {
        const matches = affectedRisks.includes(risk.riskId) ||
          intersects(risk.dependencyRefs, affectedDependencies) ||
          (hasText(event.capability) && normalizeToken(risk.capability) === normalizeToken(event.capability));
        if (!matches) continue;
        appendUnique(risk, 'eventRefs', event.eventId);
        appendUnique(risk, 'drivers', 'OPEN_SOURCE');
        risk.costTrend = 'FALLING';
        risk.availabilityTrend = 'EXPANDING';
        effects.push({ kind: 'COMMODITIZATION_EXPOSURE_INCREASED', targetRef: risk.riskId });
      }
      for (const moat of moats) {
        if (!affectedMoats.includes(moat.moatId) && !intersects(moat.dependencyRefs, affectedDependencies)) continue;
        moat.status = 'CONDITIONAL';
        appendUnique(moat, 'decayRisks', `Open-source substitution observed in ${event.eventId}`);
        effects.push({ kind: 'MOAT_WEAKENED', targetRef: moat.moatId });
      }
    } else if (kind === 'INTEROPERABILITY_CHANGE' || kind === 'INTEROPERABILITY_SHOCK' ||
        kind === 'INTEROPERABILITY_INCREASE') {
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        dependency.switchingCost = firstDefined(
          event.switchingCostAfter,
          lowerQualitativeLevel(dependency.switchingCost)
        );
        appendUnique(dependency, 'alternativeDescriptions', `Interoperability increased in ${event.eventId}`);
        effects.push({ kind: 'SWITCHING_FRICTION_REDUCED', targetRef: dependency.dependencyId });
      }
      for (const point of controlPoints) {
        if (!asArray(event.affectedControlPointRefs).includes(point.controlPointId)) continue;
        point.switchability = firstDefined(
          event.switchabilityAfter,
          raiseQualitativeLevel(point.switchability)
        );
        effects.push({ kind: 'CONTROL_POINT_WEAKENED', targetRef: point.controlPointId });
      }
      for (const moat of moats) {
        if (!affectedMoats.includes(moat.moatId) && !intersects(moat.dependencyRefs, affectedDependencies)) continue;
        moat.status = 'CONDITIONAL';
        appendUnique(moat, 'decayRisks', `Interoperability increased in ${event.eventId}`);
        effects.push({ kind: 'MOAT_WEAKENED', targetRef: moat.moatId });
      }
    } else if (kind === 'PROVIDER_ENTRY' || kind === 'UPSTREAM_PROVIDER_ENTRY') {
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        dependency.providerEntryRisk = 'VERY_HIGH';
        effects.push({ kind: 'VERTICAL_ENTRY_RISK_REALIZED', targetRef: dependency.dependencyId });
      }
      const providerActorRefs = unique([event.providerActorRef, ...(event.actorRefs || [])]);
      for (const response of responses) {
        if (!providerActorRefs.includes(response.actorRef) ||
            !['ENTER_ADJACENT_MARKET', 'DISINTERMEDIATE'].includes(
              String(firstDefined(response.possibleAction, response.responseType, '')).toUpperCase()
            )) continue;
        appendUnique(response, 'triggerEventRefs', event.eventId);
        effects.push({ kind: 'RESPONSE_TRIGGERED', targetRef: response.responseId });
      }
    } else if (kind === 'PRICE_CHANGE') {
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        dependency.priceExposure = 'VERY_HIGH';
        effects.push({ kind: 'PRICE_EXPOSURE_REQUIRES_RETEST', targetRef: dependency.dependencyId });
      }
    } else if (kind === 'API_CHANGE') {
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        dependency.accessExposure = 'VERY_HIGH';
        effects.push({ kind: 'ACCESS_EXPOSURE_REQUIRES_RETEST', targetRef: dependency.dependencyId });
      }
    } else if (['BUNDLE', 'FEATURE_LAUNCH', 'PRODUCT_LAUNCH', 'DISTRIBUTION_CHANGE'].includes(kind)) {
      for (const response of responses) {
        if (!asArray(event.actorRefs).includes(response.actorRef)) continue;
        if (kind === 'BUNDLE' && !['BUNDLE', 'MAKE_FEATURE_FREE'].includes(response.possibleAction)) continue;
        appendUnique(response, 'triggerEventRefs', event.eventId);
        effects.push({ kind: 'RESPONSE_TRIGGERED', targetRef: response.responseId });
      }
    } else if (['STANDARD_CHANGE', 'REGULATORY_CHANGE'].includes(kind)) {
      for (const dependency of dependencies) {
        if (!affectedDependencies.includes(dependency.dependencyId)) continue;
        effects.push({ kind: 'INTEROPERABILITY_DIRECTION_REQUIRES_REVIEW', targetRef: dependency.dependencyId });
      }
    } else if (kind === 'NEW_ENTRANT') {
      for (const actorRef of asArray(event.actorRefs)) {
        effects.push({ kind: 'COMPETITIVE_ACTOR_ENTERED', targetRef: actorRef });
      }
    }

    if (!effects.length) effects.push({ kind: 'STRUCTURAL_EVENT_RECORDED', targetRef: event.eventId });

    return { status: 'APPLIED', workspace: next, effects };
  }

  function timestamp(value) {
    if (!value) return Number.NEGATIVE_INFINITY;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
  }

  function sourceAuthority(source) {
    const sourceClass = String(firstDefined(source.sourceClass, source.authorityClass, source.type, '')).toUpperCase();
    return OFFICIAL_SOURCE_CLASSES.has(sourceClass) || source.official === true ? 2 : 1;
  }

  function resolveSourceConflict(claim, sourceRecords, options = {}) {
    const evidenceRefs = unique([...(claim?.evidenceRefs || []), ...(claim?.sourceRefs || [])]);
    const counterEvidenceRefs = unique(claim?.counterEvidenceRefs || []);
    const refs = unique([...evidenceRefs, ...counterEvidenceRefs]);
    const index = new Map(asArray(sourceRecords).map(source => [source.sourceId, source]));
    const records = refs.map(ref => index.get(ref)).filter(Boolean).map(clone);
    const missingRefs = refs.filter(ref => !index.has(ref));
    if (!records.length) return unknownResult('NO_RETRIEVABLE_SOURCES', { winner: UNKNOWN, preservedEvidence: [], missingRefs });

    const ordered = records.slice().sort((left, right) => {
      if (asArray(left.supersedesSourceRefs).includes(right.sourceId)) return -1;
      if (asArray(right.supersedesSourceRefs).includes(left.sourceId)) return 1;
      const statusRank = { ACTIVE: 4, CURRENT: 4, CONFLICTING: 3, STALE: 2, SUPERSEDED: 1 };
      const statusDelta = (statusRank[right.status] || 0) - (statusRank[left.status] || 0);
      if (statusDelta) return statusDelta;
      const authorityDelta = sourceAuthority(right) - sourceAuthority(left);
      if (authorityDelta) return authorityDelta;
      const timeDelta = timestamp(firstDefined(right.lastVerifiedAt, right.updatedAt, right.publishedAt, right.retrievedAt)) -
        timestamp(firstDefined(left.lastVerifiedAt, left.updatedAt, left.publishedAt, left.retrievedAt));
      if (timeDelta) return timeDelta;
      return String(left.sourceId).localeCompare(String(right.sourceId));
    });
    const winner = ordered[0];
    const officialCurrent = sourceAuthority(winner) === 2 && ['ACTIVE', 'CURRENT'].includes(winner.status);
    const activeEvidence = ordered.filter(record => evidenceRefs.includes(record.sourceId) &&
      ['ACTIVE', 'CURRENT'].includes(record.status));
    const activeCounterEvidence = ordered.filter(record => counterEvidenceRefs.includes(record.sourceId) &&
      ['ACTIVE', 'CURRENT'].includes(record.status));
    const explicitSupersession = records.some(record =>
      asArray(record.supersedesSourceRefs).some(ref => refs.includes(ref))
    );
    const evidenceAuthority = Math.max(0, ...activeEvidence.map(sourceAuthority));
    const counterAuthority = Math.max(0, ...activeCounterEvidence.map(sourceAuthority));
    const unresolved = activeEvidence.length > 0 && activeCounterEvidence.length > 0 &&
      evidenceAuthority === counterAuthority && !explicitSupersession;

    return {
      status: unresolved ? UNKNOWN : 'RESOLVED',
      resolution: unresolved ? UNKNOWN : (officialCurrent ? 'CURRENT_OFFICIAL_SOURCE_PREFERRED' : 'MOST_CURRENT_RETRIEVABLE_SOURCE_PREFERRED'),
      asOf: firstDefined(options.asOf, UNKNOWN),
      winner: unresolved ? UNKNOWN : clone(winner),
      preservedEvidence: records,
      supersededEvidence: unresolved ? [] : records.filter(record => record.sourceId !== winner.sourceId),
      missingRefs
    };
  }

  function detectContradictions(claimsOrWorkspace) {
    const workspace = Array.isArray(claimsOrWorkspace) ? null : claimsOrWorkspace;
    const claims = Array.isArray(claimsOrWorkspace)
      ? claimsOrWorkspace
      : collection(workspace, 'strategicClaims');
    const byId = new Map(claims.map(claim => [claim.claimId, claim]));
    const seen = new Set();
    const contradictions = [];

    function add(left, right, kind) {
      if (!left || !right || left.claimId === right.claimId) return;
      const key = [left.claimId, right.claimId].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      contradictions.push({
        contradictionId: `contradiction:${key}`,
        claimRefs: key.split('|'),
        kind,
        status: left.status === 'SUPERSEDED' || right.status === 'SUPERSEDED' ? 'SUPERSEDED' : 'OPEN'
      });
    }

    function addDeclared(claim, kind) {
      const key = claim.claimId;
      const contradictionId = `contradiction:${key}`;
      if (seen.has(contradictionId)) return;
      seen.add(contradictionId);
      contradictions.push({
        contradictionId,
        claimRefs: [key],
        kind,
        status: claim.contradictionStatus === 'RESOLVED' ? 'RESOLVED' : 'OPEN'
      });
    }

    function addStructural(slug, kind, claimRefs, recordRefs, mechanism) {
      const contradictionId = `contradiction:structural:${slug}`;
      if (seen.has(contradictionId)) return;
      seen.add(contradictionId);
      contradictions.push({
        contradictionId,
        claimRefs: unique(claimRefs || []).filter(ref => byId.has(ref)),
        recordRefs: unique(recordRefs || []),
        kind,
        mechanism,
        status: 'OPEN'
      });
    }

    for (const claim of claims) {
      for (const ref of unique(claim.conflictsWithClaimRefs || claim.conflicts || [])) add(claim, byId.get(ref), 'EXPLICIT_CONFLICT');
      if (claim.contradictionStatus === 'OPEN') addDeclared(claim, 'DECLARED_OPEN_CONTRADICTION');
      if (unique(claim.evidenceRefs || []).some(ref => unique(claim.counterEvidenceRefs || []).includes(ref))) {
        addDeclared(claim, 'SAME_SOURCE_SUPPORTS_AND_COUNTERS');
      }
    }

    for (let i = 0; i < claims.length; i += 1) {
      for (let j = i + 1; j < claims.length; j += 1) {
        const left = claims[i];
        const right = claims[j];
        const leftSubject = firstDefined(left.subjectKey, left.subject);
        const rightSubject = firstDefined(right.subjectKey, right.subject);
        const sameSubject = hasText(leftSubject) && normalizeToken(leftSubject) === normalizeToken(rightSubject);
        const opposed = new Set([String(left.polarity || '').toUpperCase(), String(right.polarity || '').toUpperCase()]);
        if (sameSubject && opposed.has('AFFIRMS') && opposed.has('DENIES')) add(left, right, 'OPPOSING_POLARITY');
      }
    }

    if (workspace) {
      const dependencies = collection(workspace, 'dependencies');
      const dependencyIndex = new Map(dependencies.map(item => [item.dependencyId, item]));
      const positions = collection(workspace, 'positions');
      const moats = collection(workspace, 'moatMechanisms');

      for (const position of positions.filter(item => /NEUTRAL/i.test(item.positionType || ''))) {
        const gatekeeperDependencies = unique(position.dependencyRefs || [])
          .map(ref => dependencyIndex.get(ref))
          .filter(item => item && item.providerPower === 'VERY_HIGH' && ['HIGH', 'VERY_HIGH'].includes(item.criticality));
        if (gatekeeperDependencies.length) {
          addStructural(
            `neutrality-gatekeeper-dependence:${position.positionId}`,
            'PLATFORM_NEUTRALITY_GATEKEEPER_DEPENDENCE',
            ['STR-CANDIDATE-LEDGER', 'STR-CONTROL-PURCHASER-GRAPH'],
            [position.positionId, ...gatekeeperDependencies.map(item => item.dependencyId)],
            'The proposed neutral position still depends on high-criticality resources controlled by very-high-power gatekeepers.'
          );
        }
      }

      for (const moat of moats.filter(item => ['PROPRIETARY_DATA', 'DATA_FEEDBACK'].includes(item.mechanism))) {
        const unresolvedDependencies = unique(moat.dependencyRefs || [])
          .map(ref => dependencyIndex.get(ref))
          .filter(item => item?.epistemicState === UNKNOWN);
        if (unresolvedDependencies.length) {
          addStructural(
            `data-moat-unresolved-accumulation:${moat.moatId}`,
            'DATA_MOAT_UNRESOLVED_ACCUMULATION_RIGHTS',
            moat.relatedClaimRefs,
            [moat.moatId, ...unresolvedDependencies.map(item => item.dependencyId)],
            'The candidate data moat requires accumulation, but a required dependency is explicitly UNKNOWN.'
          );
        }
      }

      for (const moat of moats.filter(item => item.mechanism === 'NETWORK_EFFECT')) {
        const lowFrictionMultiHoming = unique(moat.dependencyRefs || [])
          .map(ref => dependencyIndex.get(ref))
          .filter(item => item?.multiHoming?.allowed === 'YES' && item.multiHoming.friction === 'LOW');
        if (lowFrictionMultiHoming.length) {
          addStructural(
            `network-effect-low-friction-multihoming:${moat.moatId}`,
            'NETWORK_EFFECT_LOW_FRICTION_MULTI_HOMING',
            moat.relatedClaimRefs,
            [moat.moatId, ...lowFrictionMultiHoming.map(item => item.dependencyId)],
            'The candidate network effect coexists with explicitly allowed, low-friction multi-homing.'
          );
        }
      }

      const audit = workspace.legacyScoreAudit;
      const scoredLegacyNotes = /\b(defensibility|competitiveAdvantage|dataAdvantagePotential)\b[^.]*\b\d+(?:\.\d+)?\b/i.test(audit?.notes || '');
      const observedMoat = moats.some(item => item.status === 'OBSERVED_TEMPORARY');
      if (audit?.mechanismCoverage === 'PARTIAL' && scoredLegacyNotes && !observedMoat) {
        addStructural(
          'legacy-defensibility-mechanism-gap',
          'DEFENSIBILITY_SCORE_MECHANISM_GAP',
          ['STR-DATA-MOAT-UNPROVEN', 'STR-DIRECT-COMPETITOR-GAP'],
          moats.map(item => item.moatId),
          'Legacy strategic scores remain preserved while no moat mechanism is recorded as observed.'
        );
      }
    }

    return contradictions.sort((left, right) => left.contradictionId.localeCompare(right.contradictionId));
  }

  function evaluateAntiMoat(input = {}) {
    const scalingDescription = normalizeToken(firstDefined(input.scalingBehavior, input.growthShape, ''));
    const growthDescription = normalizeToken(firstDefined(input.growthTrigger, input.growthDriver, ''));
    const nonlinear = input.nonlinear === true || input.growthShape === 'NONLINEAR' ||
      /nonlinear|non linear|superlinear|faster than/.test(scalingDescription);
    const customerGrowthDriver = ['CUSTOMER_GROWTH', 'MORE_CUSTOMERS', 'USAGE_GROWTH'].includes(
      String(input.growthDriver || '').toUpperCase()
    ) || /customer|usage|account/.test(growthDescription);
    const burden = hasText(firstDefined(input.negativeEffect, input.negativeOutcome, input.burden, input.mechanism));
    if (!nonlinear || !customerGrowthDriver || !burden) {
      return unknownResult('NEGATIVE_COMPOUNDING_MECHANISM_NOT_ESTABLISHED', {
        compoundsAgainstVenture: false, evidenceRefs: unique(input.evidenceRefs || [])
      });
    }
    return {
      status: 'CONDITIONAL',
      compoundsAgainstVenture: true,
      mechanism: firstDefined(input.mechanism, input.negativeOutcome),
      growthDriver: firstDefined(input.growthTrigger, input.growthDriver, UNKNOWN),
      negativeOutcome: firstDefined(input.negativeEffect, input.negativeOutcome, UNKNOWN),
      scalingBehavior: firstDefined(input.scalingBehavior, input.growthShape, UNKNOWN),
      conditions: clone(input.conditions || []),
      falsifier: firstDefined(input.falsifier, UNKNOWN),
      evidenceRefs: unique(input.evidenceRefs || []),
      counterEvidenceRefs: unique(input.counterEvidenceRefs || [])
    };
  }

  function primary(items) {
    return asArray(items).find(item => item.primary === true) || asArray(items)[0];
  }

  function actorByType(workspace, ...types) {
    const typeSet = new Set(types);
    return collection(workspace, 'actors').find(actor => typeSet.has(actor.type));
  }

  const QUALITATIVE_ORDER = Object.freeze({ VERY_HIGH: 5, HIGH: 4, MEDIUM: 3, LOW: 2, VERY_LOW: 1, UNKNOWN: 0 });
  const TIME_ORDER = Object.freeze({ IMMEDIATE: 0, WEEKS: 1, MONTHS: 2, YEARS: 3, LONG_TERM: 4, UNKNOWN: 5 });

  function highestQualitative(items, field) {
    return asArray(items).reduce((winner, item) => {
      if (!winner) return item;
      return (QUALITATIVE_ORDER[String(item?.[field] || UNKNOWN)] || 0) >
        (QUALITATIVE_ORDER[String(winner?.[field] || UNKNOWN)] || 0) ? item : winner;
    }, null);
  }

  function responseActor(workspace, responses) {
    const actorIndex = new Map(collection(workspace, 'actors').map(actor => [actor.actorId, actor]));
    const grouped = new Map();
    for (const response of responses) {
      const actor = actorIndex.get(response.actorRef);
      if (!actor || !['ADJACENT_INCUMBENT', 'PLATFORM', 'DIRECT_COMPETITOR'].includes(actor.type)) continue;
      const current = grouped.get(actor.actorId) || { actor, count: 0 };
      current.count += 1;
      grouped.set(actor.actorId, current);
    }
    return [...grouped.values()].sort((left, right) =>
      right.count - left.count || right.actor.assets.length - left.actor.assets.length ||
      left.actor.actorId.localeCompare(right.actor.actorId)
    )[0]?.actor;
  }

  function buildStrategicBrief(workspace) {
    const markets = collection(workspace, 'marketDefinitions');
    const layers = collection(workspace, 'valueChainLayers');
    const points = collection(workspace, 'controlPoints');
    const dependencies = collection(workspace, 'dependencies');
    const responses = collection(workspace, 'responses');
    const risks = collection(workspace, 'commoditizationRisks');
    const moats = collection(workspace, 'moatMechanisms');
    const antiMoats = collection(workspace, 'antiMoats');
    const positions = collection(workspace, 'positions');
    const gaps = buildResearchQueue(workspace);
    const actors = collection(workspace, 'actors');
    const actorIndex = new Map(actors.map(actor => [actor.actorId, actor]));
    const venture = actors.find(actor => actor.type === 'VENTURE');
    const includedAlternativeRefs = new Set(markets.flatMap(market => asArray(market.includedAlternativeActorRefs)));
    const includedActors = actors.filter(actor => includedAlternativeRefs.has(actor.actorId));
    const direct = includedActors.find(actor => actor.type === 'DIRECT_COMPETITOR') || actorByType(workspace, 'DIRECT_COMPETITOR');
    const substitute = includedActors.find(actor => ['SUBSTITUTE', 'STATUS_QUO', 'INTERNAL_BUILD_TEAM'].includes(actor.type)) ||
      actorByType(workspace, 'SUBSTITUTE', 'STATUS_QUO', 'INTERNAL_BUILD_TEAM');
    const freeSubstitute = includedActors.find(actor => actor.type === 'STATUS_QUO' || /free|zero|included/i.test(actor.pricing || '')) ||
      includedActors.find(actor => actor.type === 'OPEN_SOURCE_PROJECT') || UNKNOWN;
    const incumbent = responseActor(workspace, responses) || actorByType(workspace, 'ADJACENT_INCUMBENT', 'PLATFORM');
    const incumbentResponses = incumbent ? responses.filter(response => response.actorRef === incumbent.actorId) : [];
    const mainResponse = incumbentResponses.slice().sort((left, right) =>
      (TIME_ORDER[left.timeToExecute] ?? TIME_ORDER.UNKNOWN) - (TIME_ORDER[right.timeToExecute] ?? TIME_ORDER.UNKNOWN) ||
      (QUALITATIVE_ORDER[right.ability] ?? 0) - (QUALITATIVE_ORDER[left.ability] ?? 0) ||
      left.responseId.localeCompare(right.responseId)
    )[0] || primary(responses);
    const criticalDependency = highestQualitative(dependencies, 'criticality');
    const switchAssessment = criticalDependency
      ? testSwitchingCost(criticalDependency)
      : unknownResult('DEPENDENCY_NOT_IDENTIFIED');
    const ventureLayer = layers.find(layer => venture && asArray(layer.actorRefs).includes(venture.actorId));
    const candidatePosition = positions.find(position => position.status === 'ROBUST_CONDITIONAL') ||
      positions.find(position => position.status === 'CANDIDATE') || primary(positions);
    const positionLayer = candidatePosition
      ? layers.find(layer => layer.layerId === candidatePosition.targetLayerRef)
      : null;
    const mainControlPoint = criticalDependency?.controlPointRef
      ? points.find(point => point.controlPointId === criticalDependency.controlPointRef)
      : primary(points);
    const bundleResponse = incumbentResponses.find(response => ['BUNDLE', 'MAKE_FEATURE_FREE'].includes(response.possibleAction)) ||
      responses.find(response => ['BUNDLE', 'MAKE_FEATURE_FREE'].includes(response.possibleAction));
    const bundleExposure = bundleResponse ? {
      status: 'SCENARIO',
      exposed: true,
      actorRef: bundleResponse.actorRef,
      responseId: bundleResponse.responseId,
      action: bundleResponse.possibleAction,
      mechanism: bundleResponse.abilityMechanism,
      impact: bundleResponse.likelyImpact,
      conditions: clone(bundleResponse.constraints),
      sourceRefs: unique(bundleResponse.sourceRefs || []),
      counterEvidenceRefs: unique(bundleResponse.counterEvidenceRefs || [])
    } : UNKNOWN;
    const killThreat = collection(workspace, 'stressScenarios').find(scenario => scenario.survivalStatus === 'THESIS_BREAKS') ||
      collection(workspace, 'stressScenarios').find(scenario => /kill|destroy|invalidate/i.test(`${scenario.name} ${scenario.impact}`));

    return {
      venture: {
        canonicalIdeaId: firstDefined(workspace?.canonicalIdeaId, UNKNOWN),
        name: firstDefined(workspace?.ventureName, UNKNOWN),
        selectionAuthority: clone(firstDefined(workspace?.selectionAuthority, UNKNOWN))
      },
      marketDefinitions: markets.length ? clone(markets) : UNKNOWN,
      customerJob: firstDefined(primary(markets)?.customerJob, primary(markets)?.jobs?.[0], UNKNOWN),
      valueChainPosition: positionLayer || ventureLayer ? clone(positionLayer || ventureLayer) : UNKNOWN,
      mainControlPoint: mainControlPoint ? clone(mainControlPoint) : UNKNOWN,
      mainControlPointOwner: mainControlPoint ? clone(actorIndex.get(mainControlPoint.controllerActorRef) || UNKNOWN) : UNKNOWN,
      mainDirectCompetitor: direct ? clone(direct) : UNKNOWN,
      mainSubstitute: substitute ? clone(substitute) : UNKNOWN,
      freeSubstitute: freeSubstitute === UNKNOWN ? UNKNOWN : clone(freeSubstitute),
      adjacentIncumbent: incumbent ? clone(incumbent) : UNKNOWN,
      criticalDependency: criticalDependency ? clone(criticalDependency) : UNKNOWN,
      incumbentCheapestResponse: mainResponse ? analyzeIncumbentResponse(mainResponse) : UNKNOWN,
      incumbentResponseRepertoire: incumbentResponses.map(response => analyzeIncumbentResponse(response)),
      bundleExposure,
      multiHoming: criticalDependency?.multiHoming ? clone(criticalDependency.multiHoming) : UNKNOWN,
      switchingCost: switchAssessment,
      commoditizingCapability: primary(risks) ? clone(primary(risks)) : UNKNOWN,
      candidateMoat: primary(moats) ? clone(primary(moats)) : UNKNOWN,
      moatStatus: firstDefined(primary(moats)?.status, UNKNOWN),
      antiMoat: primary(antiMoats) ? clone(primary(antiMoats)) : UNKNOWN,
      structuralKillThreat: killThreat ? clone(killThreat) : UNKNOWN,
      strategicPosition: candidatePosition ? clone(candidatePosition) : UNKNOWN,
      biggestUnknown: gaps[0] || UNKNOWN,
      nextResearchQuestion: firstDefined(gaps[0]?.question, gaps[0]?.description, UNKNOWN),
      contradictions: detectContradictions(workspace)
    };
  }

  const RELEVANCE_ORDER = Object.freeze({ CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 });

  function buildResearchQueue(workspace) {
    const explicit = collection(workspace, 'researchGaps').map((gap, index) => ({
      ...clone(gap),
      decisionRelevance: String(gap.decisionRelevance || UNKNOWN).toUpperCase(),
      origin: 'EXPLICIT_GAP',
      order: index
    }));
    const generated = [];

    for (const claim of collection(workspace, 'strategicClaims')) {
      if (claim.epistemicState !== UNKNOWN && hasText(claim.falsifier)) continue;
      generated.push({
        gapId: `gap:claim:${claim.claimId}`,
        decisionRelevance: firstDefined(claim.decisionRelevance, 'HIGH'),
        question: claim.epistemicState === UNKNOWN
          ? `What evidence would resolve claim ${claim.claimId}?`
          : `What observation would falsify claim ${claim.claimId}?`,
        relatedClaimRefs: [claim.claimId],
        origin: claim.epistemicState === UNKNOWN ? 'UNKNOWN_CLAIM' : 'MISSING_FALSIFIER',
        order: explicit.length + generated.length
      });
    }

    return [...explicit, ...generated].sort((left, right) => {
      const relevance = (RELEVANCE_ORDER[left.decisionRelevance] ?? RELEVANCE_ORDER.UNKNOWN) -
        (RELEVANCE_ORDER[right.decisionRelevance] ?? RELEVANCE_ORDER.UNKNOWN);
      if (relevance) return relevance;
      return left.order - right.order;
    }).map(({ order: _order, ...gap }) => gap);
  }

  function publicSource(source) {
    return source?.visibility === 'PUBLIC' && source?.evidenceEligible !== false;
  }

  function pick(object, keys) {
    const result = {};
    for (const key of keys) if (object?.[key] !== undefined) result[key] = clone(object[key]);
    return result;
  }

  function sanitizeForPublic(workspace, policy = {}) {
    const publicSources = collection(workspace, 'sourceRecords').filter(publicSource);
    const publicSourceIds = new Set(publicSources.map(source => source.sourceId));
    const permittedClaimRefs = new Set(unique(policy.claimRefs || []));
    const permittedMarketRefs = new Set(unique(policy.marketRefs || []));
    const alreadySanitized = workspace?.workspaceMode === 'PUBLIC_SANITIZED' &&
      workspace?.privacyScope === 'PUBLIC_SANITIZED';
    const publicClaims = collection(workspace, 'strategicClaims').filter(claim => {
      if (!alreadySanitized && claim.visibility !== 'PUBLIC' && !permittedClaimRefs.has(claim.claimId)) return false;
      const evidence = unique(claim.evidenceRefs || []).filter(ref => publicSourceIds.has(ref));
      return !SOURCE_SUPPORTED_STATES.has(claim.epistemicState) || evidence.length > 0;
    }).map(claim => ({
      ...pick(claim, [
        'claimId', 'subject', 'claim', 'epistemicState', 'mechanism', 'conditions',
        'timeHorizon', 'falsifier', 'asOf', 'confidence', 'status', 'contradictionStatus', 'resolution'
      ]),
      evidenceRefs: unique(claim.evidenceRefs || []).filter(ref => publicSourceIds.has(ref)),
      counterEvidenceRefs: unique(claim.counterEvidenceRefs || []).filter(ref => publicSourceIds.has(ref))
    }));

    const marketDefinitions = collection(workspace, 'marketDefinitions')
      .filter(market => alreadySanitized || market.visibility === 'PUBLIC' || permittedMarketRefs.has(market.marketId))
      .map(market => pick(market, ['marketId', 'name', 'jobs', 'budget', 'reason', 'confidence', 'epistemicState']));

    const declaredPublicSummary = firstDefined(workspace?.publicSummary, workspace?.snapshot?.publicSummary);
    const publicSummary = isObject(declaredPublicSummary)
      ? pick(declaredPublicSummary, [
        'mainSubstitutes', 'keyDependency', 'structuralRisk', 'moatStatus', 'biggestUnknown', 'asOf'
      ])
      : {};

    return {
      schemaVersion: '1.1.0',
      workspaceMode: 'PUBLIC_SANITIZED',
      privacyScope: 'PUBLIC_SANITIZED',
      canonicalIdeaId: firstDefined(workspace?.canonicalIdeaId, UNKNOWN),
      canonicalIdeaRevision: firstDefined(workspace?.canonicalIdeaRevision, UNKNOWN),
      ventureName: firstDefined(workspace?.ventureName, UNKNOWN),
      snapshot: pick(workspace?.snapshot, ['snapshotId', 'asOf', 'status', 'researchCutoff']),
      publicSummary,
      marketDefinitions,
      strategicClaims: publicClaims,
      sourceRecords: publicSources.map(source => pick(source, [
        'sourceId', 'title', 'url', 'sourceClass', 'publishedAt', 'updatedAt', 'retrievedAt',
        'visibility', 'evidenceEligible'
      ]))
    };
  }

  return Object.freeze({
    UNKNOWN,
    EPISTEMIC_STATES,
    COLLECTION_SPECS,
    validateWorkspace,
    validateChessboardDocument: validateWorkspace,
    validateSemanticWorkspace: validateWorkspace,
    traceClaim,
    traceStrategicClaim: traceClaim,
    testNetworkEffect,
    evaluateNetworkEffect: testNetworkEffect,
    testDataAdvantage,
    evaluateDataAdvantage: testDataAdvantage,
    testSwitchingCost,
    evaluateSwitchingCost: testSwitchingCost,
    testSystemOfRecord,
    evaluateSystemOfRecord: testSystemOfRecord,
    analyzeIncumbentResponse,
    assessBundleExposure,
    analyzeDirectCompetitor,
    traceDependencyControlChain,
    applyStrategicEvent,
    resolveSourceConflict,
    detectContradictions,
    evaluateAntiMoat,
    buildStrategicBrief,
    buildResearchQueue,
    sanitizeForPublic
  });
});
