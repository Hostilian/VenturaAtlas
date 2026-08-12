const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');

function uniqueIds(records, key, errors) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record[key])) errors.push(`Duplicate ${key}: ${record[key]}`);
    seen.add(record[key]);
  }
  return seen;
}

function validateShockgraph(graph, context) {
  const errors = [];
  const schema = context.schema || JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', 'shockgraph.schema.json'), 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false, formats: { 'date-time': true } });
  const validate = ajv.compile(schema);
  if (!validate(graph)) {
    for (const error of validate.errors || []) errors.push(`${error.instancePath || '<root>'} ${error.message}`);
  }

  const ideaIds = context.ideaIds || new Set();
  const sourceIds = context.sourceIds || new Set();
  const dependencyIds = uniqueIds(graph.dependencies || [], 'dependencyId', errors);
  uniqueIds(graph.shocks || [], 'shockId', errors);
  uniqueIds(graph.obligations || [], 'obligationId', errors);
  uniqueIds(graph.ecosystems || [], 'ecosystemId', errors);
  uniqueIds(graph.counterpartyAssessments || [], 'assessmentId', errors);

  const checkRefs = (records, recordKey, refKey, allowed, label) => {
    for (const record of records || []) {
      for (const ref of record[refKey] || []) {
        if (!allowed.has(ref)) errors.push(`${record[recordKey]} references unknown ${label}: ${ref}`);
      }
    }
  };
  checkRefs(graph.dependencies, 'dependencyId', 'ideaRefs', ideaIds, 'idea');
  checkRefs(graph.dependencies, 'dependencyId', 'sourceRefs', sourceIds, 'source');
  checkRefs(graph.shocks, 'shockId', 'affectedIdeaRefs', ideaIds, 'idea');
  checkRefs(graph.shocks, 'shockId', 'sourceRefs', sourceIds, 'source');
  checkRefs(graph.obligations, 'obligationId', 'ideaRefs', ideaIds, 'idea');
  checkRefs(graph.obligations, 'obligationId', 'sourceRefs', sourceIds, 'source');
  checkRefs(graph.ecosystems, 'ecosystemId', 'ideaRefs', ideaIds, 'idea');
  checkRefs(graph.ecosystems, 'ecosystemId', 'sourceRefs', sourceIds, 'source');
  checkRefs(graph.counterpartyAssessments, 'assessmentId', 'sourceRefs', sourceIds, 'source');

  const dependencies = new Map((graph.dependencies || []).map(dep => [dep.dependencyId, dep]));
  for (const shock of graph.shocks || []) {
    if (!dependencyIds.has(shock.dependencyId)) errors.push(`${shock.shockId} references unknown dependency: ${shock.dependencyId}`);
    const explicitIdeaRefs = new Set(dependencies.get(shock.dependencyId)?.ideaRefs || []);
    for (const ideaRef of shock.affectedIdeaRefs || []) {
      if (!explicitIdeaRefs.has(ideaRef)) errors.push(`${shock.shockId} blast radius contains non-edge idea: ${ideaRef}`);
    }
  }
  for (const assessment of graph.counterpartyAssessments || []) {
    if (!ideaIds.has(assessment.ideaId)) errors.push(`${assessment.assessmentId} references unknown idea: ${assessment.ideaId}`);
    if (assessment.parties?.some(party => party.readiness === undefined)) errors.push(`${assessment.assessmentId} has inferred readiness`);
  }
  return errors;
}

function buildShockgraphReport(graph, canonicalIdeaCount) {
  const mappedIdeas = new Set((graph.dependencies || []).flatMap(dep => dep.ideaRefs || []));
  const dependencies = (graph.dependencies || []).map(dep => ({
    dependencyId: dep.dependencyId,
    name: dep.name,
    ideaCount: (dep.ideaRefs || []).length,
    volatility: dep.volatility
  })).sort((a, b) => b.ideaCount - a.ideaCount || a.dependencyId.localeCompare(b.dependencyId));
  return {
    schemaVersion: '1.0.0',
    counts: {
      dependencies: graph.dependencies?.length || 0,
      shocks: graph.shocks?.length || 0,
      obligations: graph.obligations?.length || 0,
      ecosystems: graph.ecosystems?.length || 0,
      counterpartyAssessments: graph.counterpartyAssessments?.length || 0,
      mappedIdeas: mappedIdeas.size,
      canonicalIdeas: canonicalIdeaCount
    },
    mappingCoverage: canonicalIdeaCount ? mappedIdeas.size / canonicalIdeaCount : 0,
    dependencies
  };
}

function main() {
  const graph = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'shockgraph.json'), 'utf8'));
  const ideasRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ideas.json'), 'utf8'));
  const ideas = Array.isArray(ideasRaw) ? ideasRaw : ideasRaw.ideas || [];
  const sourcesRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'));
  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : sourcesRaw.sources || [];
  const errors = validateShockgraph(graph, {
    ideaIds: new Set(ideas.map(idea => idea.id)),
    sourceIds: new Set(sources.map(source => source.id))
  });
  const report = buildShockgraphReport(graph, ideas.length);
  console.log(JSON.stringify({ errors, report }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateShockgraph, buildShockgraphReport };
