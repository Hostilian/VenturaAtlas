#!/usr/bin/env node
/**
 * TERRAIN Index Builder
 *
 * Builds data/terrain-index.json — a lightweight denormalized index
 * combining actors, jobs, workflows, problems, and problem-idea relations
 * for use by the Problem Atlas UI (docs/terrain.html).
 *
 * Usage:
 *   node scripts/build-terrain-index.js          # build and write
 *   node scripts/build-terrain-index.js --check  # validate would-be output, no write
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

const CHECK_MODE = process.argv.includes('--check');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function build() {
  const actorsData = loadJson(path.join(DATA, 'terrain-actors.json'));
  const jobsData = loadJson(path.join(DATA, 'terrain-jobs.json'));
  const workflowsData = loadJson(path.join(DATA, 'terrain-workflows.json'));
  const problemsData = loadJson(path.join(DATA, 'terrain-problems.json'));
  const relationsData = loadJson(path.join(DATA, 'terrain-problem-relations.json'));

  const actorMap = {};
  for (const actor of (actorsData.actors || [])) {
    actorMap[actor.actorId] = actor;
  }

  const jobMap = {};
  for (const job of (jobsData.jobs || [])) {
    jobMap[job.jobId] = job;
  }

  const workflowMap = {};
  for (const wf of (workflowsData.workflows || [])) {
    workflowMap[wf.workflowId] = wf;
  }

  let ideaMap = {};
  const ideasPath = path.join(DATA, 'ideas.json');
  if (fs.existsSync(ideasPath)) {
    const raw = JSON.parse(fs.readFileSync(ideasPath, 'utf8'));
    const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);
    for (const idea of ideas) {
      ideaMap[idea.id] = { id: idea.id, name: idea.name, slug: idea.slug, category: idea.category };
    }
  }

  const relationsByProblem = {};
  for (const rel of (relationsData.relations || [])) {
    if (!relationsByProblem[rel.problemId]) {
      relationsByProblem[rel.problemId] = [];
    }
    relationsByProblem[rel.problemId].push({
      relationId: rel.relationId,
      ideaId: rel.ideaId,
      ideaName: ideaMap[rel.ideaId] ? ideaMap[rel.ideaId].name : null,
      ideaSlug: ideaMap[rel.ideaId] ? ideaMap[rel.ideaId].slug : null,
      ideaCategory: ideaMap[rel.ideaId] ? ideaMap[rel.ideaId].category : null,
      relationType: rel.relationType,
      workflowCoverage: rel.workflowCoverage || [],
      residualProblem: rel.residualProblem || null,
      confidence: rel.confidence
    });
  }

  const problemCards = (problemsData.problems || []).map(p => {
    const actors = (p.actorIds || []).map(aid => {
      const a = actorMap[aid];
      return a ? { actorId: aid, role: a.role, organizationType: a.organizationType } : { actorId: aid };
    });

    const jobs = (p.jobIds || []).map(jid => {
      const j = jobMap[jid];
      return j ? { jobId: jid, statement: j.statement } : { jobId: jid };
    });

    let workflowSummary = null;
    if (p.workflowId && workflowMap[p.workflowId]) {
      const wf = workflowMap[p.workflowId];
      workflowSummary = {
        workflowId: wf.workflowId,
        name: wf.name,
        trigger: wf.trigger,
        goal: wf.goal,
        stepCount: (wf.steps || []).length,
        affectedStepIds: p.workflowStepIds || [],
        steps: wf.steps || [],
        handoffs: wf.handoffs || [],
        frictions: wf.frictions || [],
        workarounds: wf.workarounds || []
      };
    }

    const evidenceEpistemics = (p.evidence || []).map(e => e.epistemic);
    const maxEpistemic = resolveMaxEpistemic(evidenceEpistemics);
    const frictionTypes = [...new Set((p.frictions || []).map(f => f.type))];
    const linkedIdeas = relationsByProblem[p.problemId] || [];

    return {
      problemId: p.problemId,
      title: p.title,
      description: p.description,
      status: p.status,
      symptomOrRoot: p.symptomOrRoot || 'UNKNOWN',
      asOf: p.asOf,
      actors,
      jobs,
      workflowSummary,
      contexts: p.contexts || [],
      frictionTypes,
      evidence: p.evidence || [],
      evidenceCount: (p.evidence || []).length,
      counterEvidence: p.counterEvidence || [],
      counterEvidenceCount: (p.counterEvidence || []).length,
      maxEpistemic,
      currentWorkarounds: p.currentWorkarounds || [],
      currentAlternativesCount: (p.currentAlternatives || []).length,
      consequences: p.consequences || [],
      desiredOutcomes: p.desiredOutcomes || [],
      researchGaps: p.researchGaps || [],
      researchGapCount: (p.researchGaps || []).length,
      linkedIdeas,
      linkedIdeaCount: linkedIdeas.length,
      searchText: [
        p.title,
        p.description,
        ...actors.map(a => a.role),
        ...jobs.map(j => j.statement),
        ...(p.contexts || []),
        ...(p.consequences || []),
        ...(p.currentWorkarounds || [])
      ].join(' ').toLowerCase()
    };
  });

  const index = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    counts: {
      problems: problemCards.length,
      actors: Object.keys(actorMap).length,
      jobs: Object.keys(jobMap).length,
      workflows: Object.keys(workflowMap).length,
      relations: (relationsData.relations || []).length
    },
    statusDistribution: buildStatusDistribution(problemCards),
    frictionTypeDistribution: buildFrictionDistribution(problemCards),
    problems: problemCards,
    actorIndex: Object.values(actorMap).map(a => ({
      actorId: a.actorId,
      role: a.role,
      organizationType: a.organizationType
    })),
    jobIndex: Object.values(jobMap).map(j => ({
      jobId: j.jobId,
      statement: j.statement,
      frequency: j.frequency || 'UNKNOWN'
    }))
  };

  return index;
}

const EPISTEMIC_ORDER = [
  'OBSERVED', 'DIRECTLY_REPORTED', 'DOCUMENTED',
  'SOURCE_SUPPORTED_INFERENCE', 'ANALYST_INFERENCE',
  'AI_HYPOTHESIS', 'USER_HYPOTHESIS', 'UNKNOWN'
];

function resolveMaxEpistemic(levels) {
  if (!levels || levels.length === 0) return 'UNKNOWN';
  let best = EPISTEMIC_ORDER.length - 1;
  for (const lvl of levels) {
    const i = EPISTEMIC_ORDER.indexOf(lvl);
    if (i !== -1 && i < best) best = i;
  }
  return EPISTEMIC_ORDER[best];
}

function buildStatusDistribution(cards) {
  const dist = {};
  for (const c of cards) {
    dist[c.status] = (dist[c.status] || 0) + 1;
  }
  return dist;
}

function buildFrictionDistribution(cards) {
  const dist = {};
  for (const c of cards) {
    for (const ft of c.frictionTypes) {
      dist[ft] = (dist[ft] || 0) + 1;
    }
  }
  return dist;
}

try {
  console.log('\n════════════════════════════════════════');
  console.log('  TERRAIN Index Builder');
  if (CHECK_MODE) console.log('  Mode: CHECK (no write)');
  console.log('════════════════════════════════════════');

  const index = build();

  console.log(`\n  Problems:    ${index.counts.problems}`);
  console.log(`  Actors:      ${index.counts.actors}`);
  console.log(`  Jobs:        ${index.counts.jobs}`);
  console.log(`  Workflows:   ${index.counts.workflows}`);
  console.log(`  Relations:   ${index.counts.relations}`);
  console.log(`  Status dist: ${JSON.stringify(index.statusDistribution)}`);

  if (CHECK_MODE) {
    console.log('\n  ✓ Index would build cleanly (--check mode, no file written)');
    process.exit(0);
  }

  const outPath = path.join(ROOT, 'data', 'terrain-index.json');
  fs.writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`\n  ✓ Written: ${path.relative(ROOT, outPath)}`);
  console.log('════════════════════════════════════════\n');
} catch (e) {
  console.error(`\n  ✗ FATAL: ${e.message}`);
  process.exit(1);
}
