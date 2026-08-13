const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function unique(records, key, errors) {
  const ids = new Set();
  for (const record of records || []) {
    if (ids.has(record[key])) errors.push(`duplicate ${key}: ${record[key]}`);
    ids.add(record[key]);
  }
  return ids;
}

function validatePhaseShift(state, context = {}) {
  const errors = [];
  const schema = context.schema || JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', 'phaseshift.schema.json'), 'utf8'));
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  if (!validate(state)) for (const error of validate.errors || []) errors.push(`${error.instancePath || '<root>'} ${error.message}`);

  const collections = [
    ['markets', 'marketId'], ['phaseTransitions', 'transitionId'], ['enforcementEvents', 'enforcementId'],
    ['intermediaryAssessments', 'assessmentId'], ['milestones', 'milestoneId'], ['milestoneEdges', 'edgeId'],
    ['sourceConflicts', 'conflictId'], ['counterpartyDeadlocks', 'deadlockId']
  ];
  for (const [name, key] of collections) unique(state[name], key, errors);
  const markets = new Map((state.markets || []).map(item => [item.marketId, item]));
  const milestones = new Set((state.milestones || []).map(item => item.milestoneId));
  const sources = context.sourceById || new Map();
  const ideaIds = context.ideaIds || new Set();
  const dependencyIds = context.dependencyIds || new Set();
  const ecosystemIds = context.ecosystemIds || new Set();
  const counterparties = context.counterpartyById || new Map();

  const sourceRefs = [];
  for (const market of state.markets || []) {
    for (const id of market.ideaRefs || []) if (!ideaIds.has(id)) errors.push(`${market.marketId} unknown idea: ${id}`);
    for (const id of market.dependencyRefs || []) if (!dependencyIds.has(id)) errors.push(`${market.marketId} unknown dependency: ${id}`);
    for (const id of market.ecosystemRefs || []) if (!ecosystemIds.has(id)) errors.push(`${market.marketId} unknown ecosystem: ${id}`);
    if (market.status === 'WAIT_FOR_TRIGGER' && !market.waitTrigger) errors.push(`${market.marketId} WAIT_FOR_TRIGGER requires waitTrigger`);
    if (market.status !== 'WAIT_FOR_TRIGGER' && market.waitTrigger) errors.push(`${market.marketId} waitTrigger is only valid while waiting`);
    sourceRefs.push([market.marketId, market.sourceRefs]);
  }
  const phaseOrder = ['P0_SIGNAL','P1_SPEC_FORMING','P2_PREPARATION','P3_MIGRATION','P4_CUTOVER','P5_CONFORMANCE','P6_OPERATIONAL_SCALE','P7_EXCEPTION_OPTIMIZATION','P8_CONSOLIDATION','P9_COMMODITIZATION'];
  for (const transition of state.phaseTransitions || []) {
    const market = markets.get(transition.marketId);
    if (!market) errors.push(`${transition.transitionId} unknown market: ${transition.marketId}`);
    const delta = phaseOrder.indexOf(transition.to) - phaseOrder.indexOf(transition.from);
    if (delta === 0) errors.push(`${transition.transitionId} does not change phase`);
    if (transition.transitionKind === 'ADVANCE' && delta !== 1) errors.push(`${transition.transitionId} ADVANCE must move exactly one phase`);
    if (transition.transitionKind === 'SKIP' && delta <= 1) errors.push(`${transition.transitionId} SKIP must advance across at least one phase`);
    if (transition.transitionKind === 'REGRESSION' && delta >= 0) errors.push(`${transition.transitionId} REGRESSION must move backward`);
    for (const id of transition.affectedIdeaRefs || []) if (!market?.ideaRefs?.includes(id)) errors.push(`${transition.transitionId} affected idea is not linked to market: ${id}`);
    sourceRefs.push([transition.transitionId, transition.sourceRefs]);
  }
  for (const event of state.enforcementEvents || []) {
    if (!markets.has(event.marketId)) errors.push(`${event.enforcementId} unknown market: ${event.marketId}`);
    sourceRefs.push([event.enforcementId, event.sourceRefs]);
  }
  for (const item of state.intermediaryAssessments || []) {
    if (!markets.has(item.marketId)) errors.push(`${item.assessmentId} unknown market: ${item.marketId}`);
    const evidenceDimensions = ['approvalBarrier','switchingAbility','interoperability','specialization','concentration'].filter(key => item[key] !== 'UNKNOWN');
    if (item.saturation !== 'UNKNOWN' && evidenceDimensions.length < 2) errors.push(`${item.assessmentId} saturation cannot be inferred from provider count alone`);
    if (item.providerCount !== null && !item.asOf) errors.push(`${item.assessmentId} providerCount requires asOf`);
    sourceRefs.push([item.assessmentId, item.sourceRefs]);
  }
  for (const milestone of state.milestones || []) {
    if (!markets.has(milestone.marketId)) errors.push(`${milestone.milestoneId} unknown market: ${milestone.marketId}`);
    sourceRefs.push([milestone.milestoneId, milestone.sourceRefs]);
  }
  const graph = new Map();
  for (const edge of state.milestoneEdges || []) {
    if (!milestones.has(edge.from) || !milestones.has(edge.to)) errors.push(`${edge.edgeId} references unknown milestone`);
    if (edge.from === edge.to) errors.push(`${edge.edgeId} self-loop`);
    if (['PRECEDES','ENABLES'].includes(edge.relation)) {
      if (!graph.has(edge.from)) graph.set(edge.from, []);
      graph.get(edge.from).push(edge.to);
    }
  }
  const visiting = new Set(), visited = new Set();
  function walk(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of graph.get(id) || []) if (walk(next)) return true;
    visiting.delete(id); visited.add(id); return false;
  }
  for (const id of milestones) if (walk(id)) { errors.push('milestone PRECEDES/ENABLES graph contains a cycle'); break; }
  for (const conflict of state.sourceConflicts || []) {
    if (!markets.has(conflict.marketId)) errors.push(`${conflict.conflictId} unknown market: ${conflict.marketId}`);
    if (new Set((conflict.positions || []).map(item => item.sourceRef)).size < 2) errors.push(`${conflict.conflictId} must preserve at least two distinct source positions`);
    if (conflict.status === 'RESOLVED' && (!conflict.resolution || !conflict.resolvedAt || !(conflict.resolutionSourceRefs || []).length)) errors.push(`${conflict.conflictId} resolved conflict lacks resolution receipt`);
    if (conflict.status !== 'RESOLVED' && (conflict.resolution || conflict.resolvedAt)) errors.push(`${conflict.conflictId} unresolved conflict contains final resolution`);
    sourceRefs.push([conflict.conflictId, (conflict.positions || []).map(item => item.sourceRef)]);
    sourceRefs.push([conflict.conflictId, conflict.resolutionSourceRefs]);
  }
  for (const deadlock of state.counterpartyDeadlocks || []) {
    if (!markets.has(deadlock.marketId)) errors.push(`${deadlock.deadlockId} unknown market: ${deadlock.marketId}`);
    const cp = counterparties.get(deadlock.counterpartyAssessmentRef);
    if (!cp) errors.push(`${deadlock.deadlockId} unknown counterparty assessment`);
    const parties = new Map((cp?.parties || []).map(party => [party.role, party]));
    for (const role of deadlock.requiredRoles || []) if (!parties.has(role)) errors.push(`${deadlock.deadlockId} unknown required role: ${role}`);
    if (deadlock.status !== 'UNKNOWN') {
      const least = parties.get(deadlock.leastReadyCriticalRole);
      if (!deadlock.simultaneousReadinessRequired || !least || least.mustParticipate !== true || least.readiness === 'UNKNOWN') errors.push(`${deadlock.deadlockId} asserted deadlock lacks an evidenced least-ready critical role`);
    }
    if ((cp?.parties || []).every(party => party.readiness === 'UNKNOWN') && deadlock.status !== 'UNKNOWN') errors.push(`${deadlock.deadlockId} cannot infer deadlock from unknown readiness`);
    sourceRefs.push([deadlock.deadlockId, deadlock.sourceRefs]);
  }
  for (const [owner, refs] of sourceRefs) for (const id of refs || []) {
    const source = sources.get(id);
    if (!source || source.visibility !== 'PUBLIC' || source.evidenceEligible !== true || !['PRIMARY_OR_OFFICIAL','COMPANY_OR_INDUSTRY'].includes(source.sourceClass)) errors.push(`${owner} source is not eligible public evidence: ${id}`);
  }
  for (const [name, key] of collections) for (const item of state[name] || []) for (const [field, value] of Object.entries(item)) {
    if ((field.endsWith('At') || field === 'date' || field === 'asOf') && value !== null && value !== undefined && (!ISO.test(value) || !Number.isFinite(Date.parse(value)))) errors.push(`${item[key]} invalid ${field}: ${value}`);
  }
  return errors;
}

function main() {
  const state = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'phaseshift.json'), 'utf8'));
  const ideasRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ideas.json'), 'utf8'));
  const sourcesRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'));
  const shock = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'shockgraph.json'), 'utf8'));
  const ideas = Array.isArray(ideasRaw) ? ideasRaw : ideasRaw.ideas || [];
  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : sourcesRaw.sources || [];
  const errors = validatePhaseShift(state, {
    ideaIds: new Set(ideas.map(item => item.id)), sourceById: new Map(sources.map(item => [item.id, item])),
    dependencyIds: new Set(shock.dependencies.map(item => item.dependencyId)), ecosystemIds: new Set(shock.ecosystems.map(item => item.ecosystemId)),
    counterpartyById: new Map(shock.counterpartyAssessments.map(item => [item.assessmentId, item]))
  });
  console.log(JSON.stringify({ errors, counts: Object.fromEntries(Object.entries(state).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length])) }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validatePhaseShift };
