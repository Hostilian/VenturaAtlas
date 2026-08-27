#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { computeFileHash } = require('./lib/repository-truth');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_ARTIFACT_PATH = path.join(ROOT, '.agent-state', 'chessboard', 'idea-061-market-structure.json');
const DEFAULT_SCHEMA_PATH = path.join(ROOT, 'schemas', 'chessboard-workspace.schema.json');
const DAY_MS = 24 * 60 * 60 * 1000;

const COLLECTION_IDS = {
  marketDefinitions: 'marketId',
  actors: 'actorId',
  valueChainLayers: 'layerId',
  controlPoints: 'controlPointId',
  dependencies: 'dependencyId',
  ecosystemEdges: 'edgeId',
  responses: 'responseId',
  strategicClaims: 'claimId',
  moatMechanisms: 'moatId',
  antiMoats: 'antiMoatId',
  commoditizationRisks: 'riskId',
  events: 'eventId',
  stressScenarios: 'scenarioId',
  positions: 'positionId',
  researchGaps: 'gapId',
  handoffs: 'handoffId',
  sourceRecords: 'sourceId'
};

function readJson(filePath, fallback = undefined) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function asList(value, keys = []) {
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
}

function normalizedRelative(filePath, root = ROOT) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function loadDecisionRecords(root = ROOT) {
  const records = [];
  const indexPath = path.join(root, 'data', 'decisions.json');
  for (const decision of asList(readJson(indexPath, []), ['decisions'])) {
    records.push({ ...decision, _sourcePath: 'data/decisions.json' });
  }
  const decisionsDir = path.join(root, 'decisions');
  if (fs.existsSync(decisionsDir)) {
    for (const entry of fs.readdirSync(decisionsDir).filter(name => /^DEC-.*\.json$/i.test(name)).sort()) {
      const filePath = path.join(decisionsDir, entry);
      const decision = readJson(filePath, null);
      if (decision && typeof decision === 'object') {
        records.push({ ...decision, _sourcePath: `decisions/${entry}` });
      }
    }
  }
  return records;
}

function resolveAuthoritativeSelection(state = {}) {
  const declared = [
    state.activeVentureId,
    state.currentVentureId,
    state.selectedIdeaId,
    state.ventureSelection?.activeVentureId,
    state.ventureSelection?.selectedIdeaId
  ].filter(value => typeof value === 'string' && value.trim());
  const unique = [...new Set(declared)];
  if (unique.length === 0) {
    return { state: 'NO_AUTHORITATIVE_ACTIVE_VENTURE', activeVentureId: null };
  }
  if (unique.length > 1) {
    return { state: 'DISCREPANCY_REQUIRES_RESOLUTION', activeVentureId: null, declared };
  }
  return { state: 'AUTHORITATIVE_ACTIVE_VENTURE', activeVentureId: unique[0] };
}

function computeExpectedContext(options = {}) {
  const root = options.root || ROOT;
  const ideasPath = path.join(root, 'data', 'ideas.json');
  const ideasRaw = options.ideas ?? readJson(ideasPath, []);
  const sourcesRaw = options.sources ?? readJson(path.join(root, 'data', 'sources.json'), []);
  const authorityState = options.authorityState ?? readJson(path.join(root, '.agent-system', 'state.json'), {});
  const shockgraph = options.shockgraph ?? readJson(path.join(root, 'data', 'shockgraph.json'), {});
  const phaseshift = options.phaseshift ?? readJson(path.join(root, 'data', 'phaseshift.json'), {});
  const ideas = asList(ideasRaw, ['ideas']);
  const sources = asList(sourcesRaw, ['sources']);
  const canonicalRevision = options.canonicalRevision || computeFileHash(ideasPath).sha256;
  return {
    root,
    ideas,
    ideaById: new Map(ideas.map(idea => [idea.id, idea])),
    sources,
    sourceById: new Map(sources.map(source => [source.id, source])),
    authority: resolveAuthoritativeSelection(authorityState),
    authorityState,
    decisions: options.decisions || loadDecisionRecords(root),
    shockgraph,
    shockgraphDependencyIds: new Set(asList(shockgraph?.dependencies).map(item => item.dependencyId)),
    shockgraphShockIds: new Set(asList(shockgraph?.shocks).map(item => item.shockId)),
    phaseshift,
    phaseShiftMarketIds: new Set(asList(phaseshift?.markets).map(item => item.marketId)),
    canonicalRevision
  };
}

function compileSchema(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

function addUniqueIds(document, errors) {
  const sets = {};
  for (const [collection, idKey] of Object.entries(COLLECTION_IDS)) {
    const ids = new Set();
    for (const record of document[collection] || []) {
      const id = record?.[idKey];
      if (ids.has(id)) errors.push(`${collection} contains duplicate ${idKey}: ${id}`);
      ids.add(id);
    }
    sets[collection] = ids;
  }
  return sets;
}

function checkRef(owner, field, value, allowed, label, errors) {
  if (value === null || value === undefined) return;
  if (!allowed.has(value)) errors.push(`${owner} ${field} references unknown ${label}: ${value}`);
}

function checkRefs(owner, field, values, allowed, label, errors) {
  for (const value of values || []) checkRef(owner, field, value, allowed, label, errors);
}

function findForbiddenFieldPaths(value, currentPath = '$', result = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenFieldPaths(item, `${currentPath}[${index}]`, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${currentPath}.${key}`;
    const lower = key.toLowerCase();
    const explicitlyGovernedAudit = currentPath === '$' && key === 'legacyScoreAudit';
    if (!explicitlyGovernedAudit && (lower.includes('score') || lower.includes('rank') || lower.includes('probab'))) {
      result.push(childPath);
    }
    findForbiddenFieldPaths(child, childPath, result);
  }
  return result;
}

function discoverSelectionDiscrepancies(context) {
  const grouped = new Map();
  for (const decision of context.decisions || []) {
    if (!decision.selectedIdeaId || !decision.selectedIdeaName) continue;
    const canonical = context.ideaById.get(decision.selectedIdeaId);
    if (!canonical || canonical.name === decision.selectedIdeaName) continue;
    const key = `${decision.selectedIdeaId}\u0000${decision.selectedIdeaName}\u0000${canonical.name}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        sourceIdeaId: decision.selectedIdeaId,
        field: 'selectedIdeaName',
        sourceValue: decision.selectedIdeaName,
        canonicalValue: canonical.name,
        sourcePaths: new Set()
      });
    }
    grouped.get(key).sourcePaths.add(decision._sourcePath || 'UNKNOWN');
  }
  return [...grouped.values()].map(item => ({ ...item, sourcePaths: [...item.sourcePaths] }));
}

function validateSelectionAndIdentity(document, context, errors) {
  const canonical = context.ideaById.get(document.canonicalIdeaId);
  if (!canonical) {
    errors.push(`unknown canonicalIdeaId: ${document.canonicalIdeaId}`);
  } else if (canonical.name !== document.ventureName) {
    errors.push(`ventureName does not match canonical idea ${document.canonicalIdeaId}: expected ${canonical.name}`);
  }
  if (document.canonicalIdeaRevision !== context.canonicalRevision) {
    errors.push(`canonicalIdeaRevision sha256 is stale; expected ${context.canonicalRevision}`);
  }

  const selection = document.selectionAuthority || {};
  if (selection.state !== context.authority.state) {
    errors.push(`selectionAuthority.state must be ${context.authority.state}, not ${selection.state}`);
  }
  if (selection.activeVentureId !== context.authority.activeVentureId) {
    errors.push(`selectionAuthority.activeVentureId does not match authoritative state (${context.authority.activeVentureId ?? 'null'})`);
  }
  if (context.authority.state === 'AUTHORITATIVE_ACTIVE_VENTURE' && document.canonicalIdeaId !== context.authority.activeVentureId) {
    errors.push(`analysis target ${document.canonicalIdeaId} does not match authoritative active venture ${context.authority.activeVentureId}`);
  }
  if (context.authority.state === 'AUTHORITATIVE_ACTIVE_VENTURE' && selection.analysisTargetBasis !== 'AUTHORITATIVE_SELECTION') {
    errors.push('authoritative active venture requires analysisTargetBasis AUTHORITATIVE_SELECTION');
  }
  if (context.authority.state === 'NO_AUTHORITATIVE_ACTIVE_VENTURE' && selection.activeVentureId !== null) {
    errors.push('NO_AUTHORITATIVE_ACTIVE_VENTURE requires activeVentureId null');
  }
  if (context.authority.state === 'NO_AUTHORITATIVE_ACTIVE_VENTURE' && selection.analysisTargetBasis === 'AUTHORITATIVE_SELECTION') {
    errors.push('NO_AUTHORITATIVE_ACTIVE_VENTURE cannot claim analysisTargetBasis AUTHORITATIVE_SELECTION');
  }

  for (const expected of discoverSelectionDiscrepancies(context)) {
    const preserved = (selection.discrepancies || []).some(item => (
      item.sourceIdeaId === expected.sourceIdeaId &&
      item.field === expected.field &&
      item.sourceValue === expected.sourceValue &&
      item.canonicalValue === expected.canonicalValue &&
      expected.sourcePaths.some(sourcePath => item.sourcePath === sourcePath || item.sourcePath.startsWith(`${sourcePath}#`)) &&
      ['OPEN', 'PRESERVED'].includes(item.status)
    ));
    if (!preserved) {
      errors.push(`selection discrepancy not preserved for ${expected.sourceIdeaId}: ${expected.sourceValue} != ${expected.canonicalValue}`);
    }
  }
}

function validatePrivacy(document, artifactPath, root, errors) {
  const mode = document.workspaceMode;
  const scope = document.privacyScope;
  if (mode === 'PUBLIC_SANITIZED' && scope !== 'PUBLIC_SANITIZED') {
    errors.push('PUBLIC_SANITIZED workspaceMode requires PUBLIC_SANITIZED privacyScope');
  }
  if (mode === 'PRIVATE_STRATEGY' && scope === 'PUBLIC_SANITIZED') {
    errors.push('PRIVATE_STRATEGY cannot use PUBLIC_SANITIZED privacyScope');
  }
  if (mode === 'UNVERIFIED_DRAFT' && scope === 'PUBLIC_SANITIZED') {
    errors.push('UNVERIFIED_DRAFT cannot be marked PUBLIC_SANITIZED');
  }
  if (scope === 'PUBLIC_SANITIZED') {
    for (const source of document.sourceRecords || []) {
      if (source.visibility !== 'PUBLIC') errors.push(`public-sanitized workspace contains non-public source: ${source.sourceId}`);
    }
    for (const handoff of document.handoffs || []) {
      if (handoff.privacy !== 'PUBLIC') errors.push(`public-sanitized workspace contains non-public handoff: ${handoff.handoffId}`);
    }
  }
  if (artifactPath && ['PRIVATE_REPOSITORY_ONLY', 'LOCAL_BROWSER_ONLY'].includes(scope)) {
    const relative = normalizedRelative(path.resolve(artifactPath), root);
    if (/^(?:data|docs|assets|categories|comparisons|collaboration)\//.test(relative)) {
      errors.push(`private CHESSBOARD artifact is stored in a public-build source path: ${relative}`);
    }
  }
}

function validateReferences(document, context, sets, errors) {
  const actors = sets.actors;
  const markets = sets.marketDefinitions;
  const layers = sets.valueChainLayers;
  const controls = sets.controlPoints;
  const dependencies = sets.dependencies;
  const events = sets.events;
  const responses = sets.responses;
  const claims = sets.strategicClaims;
  const moats = sets.moatMechanisms;
  const positions = sets.positions;
  const sources = sets.sourceRecords;

  for (const market of document.marketDefinitions || []) {
    checkRefs(market.marketId, 'buyerActorRefs', market.buyerActorRefs, actors, 'actor', errors);
    checkRefs(market.marketId, 'includedAlternativeActorRefs', market.includedAlternativeActorRefs, actors, 'actor', errors);
    checkRefs(market.marketId, 'excludedAlternativeActorRefs', market.excludedAlternativeActorRefs, actors, 'actor', errors);
    if (market.phaseShiftMarketRef) checkRef(market.marketId, 'phaseShiftMarketRef', market.phaseShiftMarketRef, context.phaseShiftMarketIds, 'PhaseShift market', errors);
    checkRefs(market.marketId, 'sourceRefs', market.sourceRefs, sources, 'source', errors);
  }
  for (const actor of document.actors || []) {
    checkRefs(actor.actorId, 'marketRefs', actor.marketRefs, markets, 'market', errors);
    checkRefs(actor.actorId, 'dependencyRefs', actor.dependencyRefs, dependencies, 'dependency', errors);
    checkRefs(actor.actorId, 'controlPointRefs', actor.controlPointRefs, controls, 'control point', errors);
    checkRefs(actor.actorId, 'observedMoveRefs', actor.observedMoveRefs, events, 'event', errors);
    checkRefs(actor.actorId, 'sourceRefs', actor.sourceRefs, sources, 'source', errors);
  }
  for (const layer of document.valueChainLayers || []) {
    checkRefs(layer.layerId, 'actorRefs', layer.actorRefs, actors, 'actor', errors);
    checkRefs(layer.layerId, 'controlPointRefs', layer.controlPointRefs, controls, 'control point', errors);
    checkRefs(layer.layerId, 'sourceRefs', layer.sourceRefs, sources, 'source', errors);
  }
  for (const control of document.controlPoints || []) {
    checkRef(control.controlPointId, 'layerRef', control.layerRef, layers, 'value-chain layer', errors);
    checkRef(control.controlPointId, 'controllerActorRef', control.controllerActorRef, actors, 'actor', errors);
    checkRefs(control.controlPointId, 'dependentActorRefs', control.dependentActorRefs, actors, 'actor', errors);
    checkRefs(control.controlPointId, 'alternativeActorRefs', control.alternativeActorRefs, actors, 'actor', errors);
    checkRefs(control.controlPointId, 'sourceRefs', control.sourceRefs, sources, 'source', errors);
    checkRefs(control.controlPointId, 'counterEvidenceRefs', control.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const dependency of document.dependencies || []) {
    checkRefs(dependency.dependencyId, 'dependentActorRefs', dependency.dependentActorRefs, actors, 'actor', errors);
    checkRef(dependency.dependencyId, 'providerActorRef', dependency.providerActorRef, actors, 'actor', errors);
    checkRefs(dependency.dependencyId, 'alternativeActorRefs', dependency.alternativeActorRefs, actors, 'actor', errors);
    checkRef(dependency.dependencyId, 'controlPointRef', dependency.controlPointRef, controls, 'control point', errors);
    if (dependency.shockgraphDependencyRef) checkRef(dependency.dependencyId, 'shockgraphDependencyRef', dependency.shockgraphDependencyRef, context.shockgraphDependencyIds, 'ShockGraph dependency', errors);
    checkRefs(dependency.dependencyId, 'sourceRefs', dependency.sourceRefs, sources, 'source', errors);
    checkRefs(dependency.dependencyId, 'counterEvidenceRefs', dependency.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const edge of document.ecosystemEdges || []) {
    checkRef(edge.edgeId, 'fromActorRef', edge.fromActorRef, actors, 'actor', errors);
    checkRef(edge.edgeId, 'toActorRef', edge.toActorRef, actors, 'actor', errors);
    if (edge.fromActorRef === edge.toActorRef) errors.push(`${edge.edgeId} cannot be a self-edge`);
    checkRefs(edge.edgeId, 'marketRefs', edge.marketRefs, markets, 'market', errors);
    checkRefs(edge.edgeId, 'sourceRefs', edge.sourceRefs, sources, 'source', errors);
  }
  for (const response of document.responses || []) {
    checkRef(response.responseId, 'actorRef', response.actorRef, actors, 'actor', errors);
    checkRefs(response.responseId, 'targetActorRefs', response.targetActorRefs, actors, 'actor', errors);
    checkRefs(response.responseId, 'triggerEventRefs', response.triggerEventRefs, events, 'event', errors);
    checkRefs(response.responseId, 'sourceRefs', response.sourceRefs, sources, 'source', errors);
    checkRefs(response.responseId, 'counterEvidenceRefs', response.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const claim of document.strategicClaims || []) {
    checkRef(claim.claimId, 'actorRef', claim.actorRef, actors, 'actor', errors);
    checkRef(claim.claimId, 'controlPointRef', claim.controlPointRef, controls, 'control point', errors);
    checkRefs(claim.claimId, 'evidenceRefs', claim.evidenceRefs, sources, 'source', errors);
    checkRefs(claim.claimId, 'counterEvidenceRefs', claim.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const moat of document.moatMechanisms || []) {
    checkRef(moat.moatId, 'ownerActorRef', moat.ownerActorRef, actors, 'actor', errors);
    checkRefs(moat.moatId, 'attackerActorRefs', moat.attackerActorRefs, actors, 'actor', errors);
    checkRefs(moat.moatId, 'dependencyRefs', moat.dependencyRefs, dependencies, 'dependency', errors);
    checkRefs(moat.moatId, 'evidenceRefs', moat.evidenceRefs, sources, 'source', errors);
    checkRefs(moat.moatId, 'counterEvidenceRefs', moat.counterEvidenceRefs, sources, 'source', errors);
    checkRefs(moat.moatId, 'relatedClaimRefs', moat.relatedClaimRefs, claims, 'strategic claim', errors);
  }
  for (const antiMoat of document.antiMoats || []) {
    checkRef(antiMoat.antiMoatId, 'actorRef', antiMoat.actorRef, actors, 'actor', errors);
    checkRefs(antiMoat.antiMoatId, 'evidenceRefs', antiMoat.evidenceRefs, sources, 'source', errors);
    checkRefs(antiMoat.antiMoatId, 'counterEvidenceRefs', antiMoat.counterEvidenceRefs, sources, 'source', errors);
    checkRefs(antiMoat.antiMoatId, 'relatedClaimRefs', antiMoat.relatedClaimRefs, claims, 'strategic claim', errors);
  }
  for (const risk of document.commoditizationRisks || []) {
    checkRefs(risk.riskId, 'dependencyRefs', risk.dependencyRefs, dependencies, 'dependency', errors);
    checkRefs(risk.riskId, 'eventRefs', risk.eventRefs, events, 'event', errors);
    checkRefs(risk.riskId, 'evidenceRefs', risk.evidenceRefs, sources, 'source', errors);
    checkRefs(risk.riskId, 'counterEvidenceRefs', risk.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const event of document.events || []) {
    checkRefs(event.eventId, 'actorRefs', event.actorRefs, actors, 'actor', errors);
    checkRefs(event.eventId, 'affectedLayerRefs', event.affectedLayerRefs, layers, 'value-chain layer', errors);
    checkRefs(event.eventId, 'affectedControlPointRefs', event.affectedControlPointRefs, controls, 'control point', errors);
    checkRefs(event.eventId, 'affectedDependencyRefs', event.affectedDependencyRefs, dependencies, 'dependency', errors);
    checkRefs(event.eventId, 'sourceRefs', event.sourceRefs, sources, 'source', errors);
    if (event.shockgraphShockRef) checkRef(event.eventId, 'shockgraphShockRef', event.shockgraphShockRef, context.shockgraphShockIds, 'ShockGraph shock', errors);
  }
  for (const scenario of document.stressScenarios || []) {
    checkRef(scenario.scenarioId, 'threatActorRef', scenario.threatActorRef, actors, 'actor', errors);
    checkRefs(scenario.scenarioId, 'eventRefs', scenario.eventRefs, events, 'event', errors);
    checkRefs(scenario.scenarioId, 'affectedDependencyRefs', scenario.affectedDependencyRefs, dependencies, 'dependency', errors);
    checkRefs(scenario.scenarioId, 'affectedMoatRefs', scenario.affectedMoatRefs, moats, 'moat mechanism', errors);
    checkRefs(scenario.scenarioId, 'affectedPositionRefs', scenario.affectedPositionRefs, positions, 'position', errors);
    checkRefs(scenario.scenarioId, 'sourceRefs', scenario.sourceRefs, sources, 'source', errors);
  }
  for (const position of document.positions || []) {
    checkRef(position.positionId, 'targetLayerRef', position.targetLayerRef, layers, 'value-chain layer', errors);
    checkRef(position.positionId, 'actorRef', position.actorRef, actors, 'actor', errors);
    checkRefs(position.positionId, 'dependencyRefs', position.dependencyRefs, dependencies, 'dependency', errors);
    checkRefs(position.positionId, 'controlPointRefs', position.controlPointRefs, controls, 'control point', errors);
    checkRefs(position.positionId, 'responseRefs', position.responseRefs, responses, 'response', errors);
    checkRefs(position.positionId, 'evidenceRefs', position.evidenceRefs, sources, 'source', errors);
    checkRefs(position.positionId, 'counterEvidenceRefs', position.counterEvidenceRefs, sources, 'source', errors);
  }
  for (const gap of document.researchGaps || []) checkRefs(gap.gapId, 'relatedClaimRefs', gap.relatedClaimRefs, claims, 'strategic claim', errors);
  for (const handoff of document.handoffs || []) checkRefs(handoff.handoffId, 'relatedClaimRefs', handoff.relatedClaimRefs, claims, 'strategic claim', errors);
  for (const source of document.sourceRecords || []) {
    checkRefs(source.sourceId, 'supersedesSourceRefs', source.supersedesSourceRefs, sources, 'source', errors);
    checkRefs(source.sourceId, 'supportsClaimRefs', source.supportsClaimRefs, claims, 'strategic claim', errors);
    checkRefs(source.sourceId, 'refutesClaimRefs', source.refutesClaimRefs, claims, 'strategic claim', errors);
  }
}

function evidenceRequired(state) {
  return state === 'OBSERVED_FACT' || state === 'SOURCE_SUPPORTED_INFERENCE';
}

function validateSourceRecords(document, context, errors, warnings) {
  const snapshotAt = Date.parse(document.snapshot?.asOf);
  const sourceById = new Map((document.sourceRecords || []).map(source => [source.sourceId, source]));
  const supersededBy = new Map();
  const stagedSourceIds = [];

  for (const source of document.sourceRecords || []) {
    const omega = context.sourceById.get(source.sourceId);
    if (!omega) {
      stagedSourceIds.push(source.sourceId);
    } else {
      for (const field of ['title', 'visibility', 'sourceClass', 'evidenceEligible', 'provenanceEligible']) {
        if (source[field] !== omega[field]) errors.push(`${source.sourceId} ${field} does not match OMEGA source registry`);
      }
      const omegaUrl = omega.url || null;
      if (source.url !== omegaUrl) errors.push(`${source.sourceId} url does not match OMEGA source registry`);
    }
    if (source.visibility === 'PUBLIC' && (!source.url || !/^https?:\/\//i.test(source.url))) {
      errors.push(`${source.sourceId} PUBLIC source requires an HTTP(S) URL`);
    }
    const retrieved = Date.parse(source.retrievedAt);
    const verified = Date.parse(source.lastVerifiedAt);
    const published = source.publishedAt === null ? null : Date.parse(source.publishedAt);
    if (published !== null && published > retrieved) errors.push(`${source.sourceId} publishedAt is after retrievedAt`);
    if (retrieved > verified) errors.push(`${source.sourceId} retrievedAt is after lastVerifiedAt`);
    if (verified > snapshotAt) errors.push(`${source.sourceId} lastVerifiedAt is after snapshot.asOf`);
    const stale = Number.isFinite(snapshotAt) && Number.isFinite(verified) && (snapshotAt - verified) / DAY_MS > source.freshnessPolicyDays;
    if (stale && source.status === 'ACTIVE') errors.push(`${source.sourceId} is stale at snapshot.asOf but marked ACTIVE`);
    for (const priorId of source.supersedesSourceRefs || []) {
      if (!supersededBy.has(priorId)) supersededBy.set(priorId, []);
      supersededBy.get(priorId).push(source.sourceId);
      const prior = sourceById.get(priorId);
      if (prior) {
        if (prior.status !== 'SUPERSEDED') errors.push(`${source.sourceId} supersedes ${priorId}, which is not marked SUPERSEDED`);
        if (Date.parse(source.lastVerifiedAt) < Date.parse(prior.lastVerifiedAt)) errors.push(`${source.sourceId} cannot supersede newer verification ${priorId}`);
        if (source.publishedAt && prior.publishedAt && Date.parse(source.publishedAt) < Date.parse(prior.publishedAt)) {
          errors.push(`${source.sourceId} cannot supersede later-published source ${priorId}`);
        }
      }
    }
  }
  if (stagedSourceIds.length) {
    warnings.push(`OMEGA_PUBLICATION_GATE: ${stagedSourceIds.length} staged sourceRecords require OMEGA admission before publication: ${stagedSourceIds.join(', ')}`);
  }
  for (const source of document.sourceRecords || []) {
    if (source.status === 'SUPERSEDED' && !supersededBy.has(source.sourceId)) {
      errors.push(`${source.sourceId} is marked SUPERSEDED without an explicit superseding source`);
    }
  }

  const graph = new Map((document.sourceRecords || []).map(source => [source.sourceId, source.supersedesSourceRefs || []]));
  const visiting = new Set();
  const visited = new Set();
  function walk(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of graph.get(id) || []) if (walk(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  for (const id of graph.keys()) {
    if (walk(id)) {
      errors.push('source supersession graph contains a cycle');
      break;
    }
  }
  return sourceById;
}

function validateClaimQuality(document, sourceById, errors) {
  const snapshotAt = Date.parse(document.snapshot?.asOf);
  let counterEvidenceClaimCount = 0;
  for (const claim of document.strategicClaims || []) {
    const overlap = claim.evidenceRefs.filter(sourceId => claim.counterEvidenceRefs.includes(sourceId));
    if (overlap.length) errors.push(`${claim.claimId} uses the same source as evidence and counterevidence: ${overlap.join(', ')}`);
    if (claim.counterEvidenceRefs.length) counterEvidenceClaimCount += 1;
    if (evidenceRequired(claim.epistemicState) && claim.evidenceRefs.length === 0) {
      errors.push(`${claim.claimId} ${claim.epistemicState} requires evidenceRefs`);
    }
    if (claim.epistemicState === 'UNKNOWN') {
      if (claim.confidence !== 'UNKNOWN') errors.push(`${claim.claimId} UNKNOWN epistemic state requires UNKNOWN confidence`);
      if (claim.evidenceRefs.length) errors.push(`${claim.claimId} UNKNOWN claim cannot cite supporting evidence`);
    }
    if (['MODEL_HYPOTHESIS', 'SCENARIO', 'USER_ASSUMPTION'].includes(claim.epistemicState) && claim.confidence === 'HIGH') {
      errors.push(`${claim.claimId} ${claim.epistemicState} cannot claim HIGH confidence`);
    }
    if (Date.parse(claim.asOf) > snapshotAt) errors.push(`${claim.claimId} asOf is after snapshot.asOf`);
    if (!claim.counterEvidenceRefs.length && claim.contradictionStatus !== 'NONE') {
      errors.push(`${claim.claimId} contradictionStatus ${claim.contradictionStatus} lacks counterEvidenceRefs`);
    }
    if (claim.contradictionStatus === 'OPEN' && claim.confidence === 'HIGH') {
      errors.push(`${claim.claimId} has an open contradiction and cannot claim HIGH confidence`);
    }
    if (claim.contradictionStatus === 'RESOLVED' && !claim.resolution) {
      errors.push(`${claim.claimId} resolved contradiction requires resolution`);
    }
    if (claim.contradictionStatus !== 'RESOLVED' && claim.resolution) {
      errors.push(`${claim.claimId} unresolved contradiction cannot contain final resolution`);
    }

    const allEvidence = [...claim.evidenceRefs, ...claim.counterEvidenceRefs];
    for (const sourceId of allEvidence) {
      const source = sourceById.get(sourceId);
      if (source && source.evidenceEligible !== true) errors.push(`${claim.claimId} cites evidence-ineligible source ${sourceId}`);
    }
    if (evidenceRequired(claim.epistemicState) && claim.status === 'ACTIVE') {
      const activeEligible = claim.evidenceRefs.some(sourceId => {
        const source = sourceById.get(sourceId);
        return source?.evidenceEligible === true && source.status === 'ACTIVE';
      });
      if (!activeEligible) errors.push(`${claim.claimId} active ${claim.epistemicState} lacks current eligible evidence`);
    }
    for (const sourceId of claim.evidenceRefs) {
      const source = sourceById.get(sourceId);
      if (source && !source.supportsClaimRefs.includes(claim.claimId)) {
        errors.push(`${claim.claimId} evidence source ${sourceId} lacks reciprocal supportsClaimRefs trace`);
      }
    }
    for (const sourceId of claim.counterEvidenceRefs) {
      const source = sourceById.get(sourceId);
      if (source && !source.refutesClaimRefs.includes(claim.claimId)) {
        errors.push(`${claim.claimId} counterevidence source ${sourceId} lacks reciprocal refutesClaimRefs trace`);
      }
    }
  }
  if ((document.strategicClaims || []).length && counterEvidenceClaimCount === 0) {
    errors.push('strategic claim ledger must preserve counterevidence for at least one material claim');
  }
}

function validateEvidenceStates(document, errors) {
  const collections = [
    ['marketDefinitions', 'marketId'],
    ['actors', 'actorId'],
    ['valueChainLayers', 'layerId'],
    ['controlPoints', 'controlPointId'],
    ['dependencies', 'dependencyId'],
    ['ecosystemEdges', 'edgeId'],
    ['responses', 'responseId'],
    ['moatMechanisms', 'moatId'],
    ['commoditizationRisks', 'riskId'],
    ['positions', 'positionId']
  ];
  for (const [collection, idKey] of collections) {
    for (const record of document[collection] || []) {
      if (evidenceRequired(record.epistemicState) && !(record.sourceRefs || record.evidenceRefs || []).length) {
        errors.push(`${record[idKey]} ${record.epistemicState} requires source evidence`);
      }
    }
  }
  for (const event of document.events || []) {
    if (!event.sourceRefs.length) errors.push(`${event.eventId} market event requires sourceRefs`);
    if (Date.parse(event.observedAt) > Date.parse(document.snapshot.asOf)) errors.push(`${event.eventId} observedAt is after snapshot.asOf`);
  }
  for (const moat of document.moatMechanisms || []) {
    if (moat.status === 'OBSERVED_TEMPORARY' && !moat.evidenceRefs.length) {
      errors.push(`${moat.moatId} OBSERVED_TEMPORARY moat requires evidenceRefs`);
    }
  }
}

function validateChronology(document, errors) {
  const snapshotAt = Date.parse(document.snapshot?.asOf);
  if (Date.parse(document.snapshot?.researchCutoff) > snapshotAt) errors.push('snapshot.researchCutoff is after snapshot.asOf');
  if (Date.parse(document.selectionAuthority?.evaluatedAt) > snapshotAt) errors.push('selectionAuthority.evaluatedAt is after snapshot.asOf');
}

function validateChessboardArtifact(document, options = {}) {
  const schema = options.schema || readJson(DEFAULT_SCHEMA_PATH);
  const artifactPath = options.artifactPath || null;
  const context = options.context || computeExpectedContext(options);
  const errors = [];
  const warnings = [];
  const validate = compileSchema(schema);
  const schemaValid = validate(document);
  if (!schemaValid) {
    for (const error of validate.errors || []) errors.push(`schema ${error.instancePath || '<root>'} ${error.message}`);
  }

  for (const forbiddenPath of findForbiddenFieldPaths(document)) errors.push(`forbidden score/rank/probability field: ${forbiddenPath}`);
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return { errors: [...new Set(errors)], warnings, context, counts: {} };
  }
  if (!schemaValid) {
    return {
      errors: [...new Set(errors)],
      warnings,
      context,
      counts: {},
      selectionState: document.selectionAuthority?.state || null,
      expectedSelectionState: context.authority.state
    };
  }

  const sets = addUniqueIds(document, errors);
  validateSelectionAndIdentity(document, context, errors);
  validatePrivacy(document, artifactPath, context.root, errors);
  validateReferences(document, context, sets, errors);
  const sourceById = validateSourceRecords(document, context, errors, warnings);
  validateClaimQuality(document, sourceById, errors);
  validateEvidenceStates(document, errors);
  validateChronology(document, errors);

  const counts = Object.fromEntries(Object.keys(COLLECTION_IDS).map(collection => [collection, (document[collection] || []).length]));
  return {
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    context,
    counts,
    selectionState: document.selectionAuthority?.state || null,
    expectedSelectionState: context.authority.state
  };
}

function validateChessboardDocument(document, options = {}) {
  return validateChessboardArtifact(document, options).errors;
}

function parseArtifactArgument(argv = process.argv.slice(2)) {
  const fileIndex = argv.indexOf('--file');
  if (fileIndex >= 0) {
    if (!argv[fileIndex + 1]) throw new Error('--file requires a path');
    return path.resolve(process.cwd(), argv[fileIndex + 1]);
  }
  const positional = argv.find(argument => !argument.startsWith('-'));
  return positional ? path.resolve(process.cwd(), positional) : DEFAULT_ARTIFACT_PATH;
}

function hasExplicitArtifactArgument(argv = process.argv.slice(2)) {
  return argv.includes('--file') || argv.some(argument => !argument.startsWith('-'));
}

function main() {
  let artifactPath;
  try {
    artifactPath = parseArtifactArgument();
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(artifactPath)) {
    if (hasExplicitArtifactArgument()) {
      console.error(`[ERROR] CHESSBOARD artifact does not exist: ${artifactPath}`);
      process.exitCode = 1;
      return;
    }
    try {
      compileSchema(readJson(DEFAULT_SCHEMA_PATH));
    } catch (error) {
      console.error(`[ERROR] CHESSBOARD schema is invalid: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({
      artifact: normalizedRelative(artifactPath),
      status: 'NO_PRIVATE_CHESSBOARD_WORKSPACE',
      workspacePresent: false,
      warnings: ['Private CHESSBOARD dogfood is intentionally absent from this checkout.'],
      errors: []
    }, null, 2));
    console.log('[OK] CHESSBOARD schema is valid; no private workspace is present in this checkout.');
    return;
  }
  let document;
  try {
    document = readJson(artifactPath);
  } catch (error) {
    console.error(`[ERROR] CHESSBOARD artifact is not valid JSON: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const result = validateChessboardArtifact(document, { artifactPath });
  console.log(JSON.stringify({
    artifact: normalizedRelative(artifactPath),
    canonicalIdeaId: document.canonicalIdeaId || null,
    selectionState: result.selectionState,
    expectedSelectionState: result.expectedSelectionState,
    counts: result.counts,
    warnings: result.warnings,
    errors: result.errors
  }, null, 2));
  if (result.errors.length) process.exitCode = 1;
  else console.log('[OK] CHESSBOARD contract, identity, evidence, privacy, and semantic references are valid.');
}

if (require.main === module) main();

module.exports = {
  COLLECTION_IDS,
  DEFAULT_ARTIFACT_PATH,
  computeExpectedContext,
  discoverSelectionDiscrepancies,
  findForbiddenFieldPaths,
  hasExplicitArtifactArgument,
  parseArtifactArgument,
  resolveAuthoritativeSelection,
  validateChessboardArtifact,
  validateChessboardDocument
};
