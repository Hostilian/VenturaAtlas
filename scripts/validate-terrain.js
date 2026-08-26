#!/usr/bin/env node
/**
 * TERRAIN Data Validator
 *
 * Validates all TERRAIN data files for:
 *   1. File existence
 *   2. Required fields and structural contracts
 *   3. Referential integrity (IDs cross-reference correctly)
 *   4. Evidence epistemic label discipline
 *   5. Solution-language detection in problem descriptions
 *   6. Privacy / private-content leak detection
 *   7. Status vs evidence consistency
 *
 * Usage:
 *   node scripts/validate-terrain.js          # validate + report
 *   node scripts/validate-terrain.js --check  # read-only CI mode, exits 1 on error
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SCHEMAS = path.join(ROOT, 'schemas');

const CHECK_MODE = process.argv.includes('--check');

let errorCount = 0;
let warnCount = 0;

function err(msg) {
  console.error(`  ✗ ERROR  ${msg}`);
  errorCount++;
}

function warn(msg) {
  console.warn(`  ⚠ WARN   ${msg}`);
  warnCount++;
}

function ok(msg) {
  console.log(`  ✓ OK     ${msg}`);
}

function section(title) {
  console.log(`\n── ${title} ──`);
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    err(`File not found: ${path.relative(ROOT, filePath)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    err(`JSON parse error in ${path.relative(ROOT, filePath)}: ${e.message}`);
    return null;
  }
}

const SOLUTION_WORDS = [
  /\bplatform\b/i,
  /\bai assistant\b/i,
  /\bai-powered\b/i,
  /\bdashboard\b/i,
  /\bmarketplace app\b/i,
  /\bneed a tool\b/i,
  /\bneed software\b/i,
  /\bneed an app\b/i,
  /\bneed a system\b/i,
  /\bwe should build\b/i,
  /\bour product\b/i,
  /\bour solution\b/i,
];

function detectSolutionLanguage(text, context) {
  for (const re of SOLUTION_WORDS) {
    if (re.test(text)) {
      warn(`Possible solution language in ${context}: matched "${re.source}" in "${text.slice(0, 80)}..."`);
    }
  }
}

function checkNoPrivate(obj, context) {
  const json = JSON.stringify(obj);
  if (/"visibility"\s*:\s*"PRIVATE"/i.test(json)) {
    err(`Private-visibility content found in ${context} — must not appear in public TERRAIN files`);
  }
  if (/"PRIVATE"/i.test(json) && /"visibility"/.test(json)) {
    err(`Possible private content in ${context}`);
  }
}

const VALID_EPISTEMIC = new Set([
  'OBSERVED', 'DIRECTLY_REPORTED', 'DOCUMENTED',
  'SOURCE_SUPPORTED_INFERENCE', 'ANALYST_INFERENCE',
  'AI_HYPOTHESIS', 'USER_HYPOTHESIS', 'UNKNOWN'
]);

function validateEvidenceItems(items, context) {
  if (!Array.isArray(items)) return;
  items.forEach((item, i) => {
    if (!item.epistemic) {
      err(`${context}[${i}] missing required 'epistemic' field`);
    } else if (!VALID_EPISTEMIC.has(item.epistemic)) {
      err(`${context}[${i}] unknown epistemic level: "${item.epistemic}"`);
    }
    if (!item.summary) {
      warn(`${context}[${i}] has no 'summary' — evidence should describe what was observed`);
    }
  });
}

function validateSchemas() {
  section('Schema Files');
  const required = [
    'terrain-actor.schema.json',
    'terrain-job.schema.json',
    'terrain-workflow.schema.json',
    'terrain-problem.schema.json',
    'terrain-problem-relation.schema.json'
  ];
  for (const f of required) {
    const p = path.join(SCHEMAS, f);
    if (!fs.existsSync(p)) {
      err(`Missing schema: ${f}`);
      continue;
    }
    const schema = loadJson(p);
    if (!schema) continue;
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
      err(`${f}: $schema must be 'https://json-schema.org/draft/2020-12/schema'`);
    } else {
      ok(`${f} — valid draft/2020-12 schema`);
    }
  }
}

function validateActors() {
  section('terrain-actors.json');
  const data = loadJson(path.join(DATA, 'terrain-actors.json'));
  if (!data) return null;

  if (!Array.isArray(data.actors)) {
    err('terrain-actors.json: top-level "actors" must be an array');
    return null;
  }

  const actorIds = new Set();
  for (const actor of data.actors) {
    if (!actor.actorId) { err('Actor missing actorId'); continue; }
    if (!/^actor-[a-z0-9-]+$/.test(actor.actorId)) {
      err(`Actor ${actor.actorId}: id must match pattern actor-[a-z0-9-]+`);
    }
    if (actorIds.has(actor.actorId)) {
      err(`Duplicate actorId: ${actor.actorId}`);
    }
    actorIds.add(actor.actorId);
    if (!actor.role) err(`Actor ${actor.actorId}: missing required 'role'`);
    if (!actor.organizationType) err(`Actor ${actor.actorId}: missing required 'organizationType'`);
    if (!actor.responsibility) err(`Actor ${actor.actorId}: missing required 'responsibility'`);
    if (actor.schemaVersion !== '1.0.0') err(`Actor ${actor.actorId}: schemaVersion must be '1.0.0'`);
    checkNoPrivate(actor, `actor ${actor.actorId}`);
  }

  ok(`${actorIds.size} actors validated`);
  return actorIds;
}

function validateJobs(actorIds) {
  section('terrain-jobs.json');
  const data = loadJson(path.join(DATA, 'terrain-jobs.json'));
  if (!data) return null;

  if (!Array.isArray(data.jobs)) {
    err('terrain-jobs.json: top-level "jobs" must be an array');
    return null;
  }

  const jobIds = new Set();
  for (const job of data.jobs) {
    if (!job.jobId) { err('Job missing jobId'); continue; }
    if (!/^job-[a-z0-9-]+$/.test(job.jobId)) {
      err(`Job ${job.jobId}: id must match pattern job-[a-z0-9-]+`);
    }
    if (jobIds.has(job.jobId)) err(`Duplicate jobId: ${job.jobId}`);
    jobIds.add(job.jobId);

    if (!job.statement) err(`Job ${job.jobId}: missing required 'statement'`);
    if (job.statement) {
      detectSolutionLanguage(job.statement, `job ${job.jobId} statement`);
    }

    if (!Array.isArray(job.actorIds) || job.actorIds.length === 0) {
      err(`Job ${job.jobId}: actorIds must be a non-empty array`);
    } else if (actorIds) {
      for (const aid of job.actorIds) {
        if (!actorIds.has(aid)) {
          err(`Job ${job.jobId}: references unknown actorId '${aid}'`);
        }
      }
    }

    if (job.schemaVersion !== '1.0.0') err(`Job ${job.jobId}: schemaVersion must be '1.0.0'`);
    validateEvidenceItems(job.evidence, `job ${job.jobId} evidence`);
    checkNoPrivate(job, `job ${job.jobId}`);
  }

  ok(`${jobIds.size} jobs validated`);
  return jobIds;
}

function validateWorkflows(actorIds) {
  section('terrain-workflows.json');
  const data = loadJson(path.join(DATA, 'terrain-workflows.json'));
  if (!data) return null;

  if (!Array.isArray(data.workflows)) {
    err('terrain-workflows.json: top-level "workflows" must be an array');
    return null;
  }

  const workflowIds = new Set();
  for (const wf of data.workflows) {
    if (!wf.workflowId) { err('Workflow missing workflowId'); continue; }
    if (!/^wf-[a-z0-9-]+$/.test(wf.workflowId)) {
      err(`Workflow ${wf.workflowId}: id must match pattern wf-[a-z0-9-]+`);
    }
    if (workflowIds.has(wf.workflowId)) err(`Duplicate workflowId: ${wf.workflowId}`);
    workflowIds.add(wf.workflowId);

    if (!wf.name) err(`Workflow ${wf.workflowId}: missing 'name'`);
    if (!wf.trigger) err(`Workflow ${wf.workflowId}: missing 'trigger'`);
    if (!wf.goal) err(`Workflow ${wf.workflowId}: missing 'goal'`);
    if (!wf.asOf) err(`Workflow ${wf.workflowId}: missing 'asOf' — workflow maps decay, date required`);
    if (wf.schemaVersion !== '1.0.0') err(`Workflow ${wf.workflowId}: schemaVersion must be '1.0.0'`);

    if (!Array.isArray(wf.actorIds) || wf.actorIds.length === 0) {
      err(`Workflow ${wf.workflowId}: actorIds must be a non-empty array`);
    } else if (actorIds) {
      for (const aid of wf.actorIds) {
        if (!actorIds.has(aid)) {
          err(`Workflow ${wf.workflowId}: references unknown actorId '${aid}'`);
        }
      }
    }

    if (!Array.isArray(wf.steps) || wf.steps.length === 0) {
      err(`Workflow ${wf.workflowId}: must have at least one step`);
    } else {
      const stepIds = new Set();
      for (const step of wf.steps) {
        if (!step.stepId) err(`Workflow ${wf.workflowId}: step missing stepId`);
        if (stepIds.has(step.stepId)) err(`Workflow ${wf.workflowId}: duplicate stepId '${step.stepId}'`);
        stepIds.add(step.stepId);
        if (step.order == null) err(`Workflow ${wf.workflowId} step ${step.stepId}: missing order`);
        if (!step.action) err(`Workflow ${wf.workflowId} step ${step.stepId}: missing 'action'`);
        if (!step.actor) err(`Workflow ${wf.workflowId} step ${step.stepId}: missing 'actor'`);
      }
    }

    validateEvidenceItems(wf.evidence, `workflow ${wf.workflowId} evidence`);
    checkNoPrivate(wf, `workflow ${wf.workflowId}`);
  }

  ok(`${workflowIds.size} workflows validated`);
  return workflowIds;
}

const VALID_PROBLEM_STATUS = new Set([
  'HYPOTHESIS', 'WEAK_EVIDENCE', 'OBSERVED', 'REPEATED',
  'WELL_SUPPORTED', 'CONTESTED', 'REJECTED', 'STALE'
]);

function validateProblems(actorIds, jobIds, workflowIds) {
  section('terrain-problems.json');
  const data = loadJson(path.join(DATA, 'terrain-problems.json'));
  if (!data) return null;

  if (!Array.isArray(data.problems)) {
    err('terrain-problems.json: top-level "problems" must be an array');
    return null;
  }

  if (data.problems.length === 0) {
    ok('Zero problems — empty state is valid');
    return new Set();
  }

  const problemIds = new Set();
  for (const p of data.problems) {
    if (!p.problemId) { err('Problem missing problemId'); continue; }
    if (!/^problem-[a-z0-9-]+$/.test(p.problemId)) {
      err(`Problem ${p.problemId}: id must match pattern problem-[a-z0-9-]+`);
    }
    if (problemIds.has(p.problemId)) err(`Duplicate problemId: ${p.problemId}`);
    problemIds.add(p.problemId);

    if (!p.title) err(`Problem ${p.problemId}: missing required 'title'`);
    if (!p.description) err(`Problem ${p.problemId}: missing required 'description'`);
    if (!p.asOf) err(`Problem ${p.problemId}: missing required 'asOf'`);
    if (p.schemaVersion !== '1.0.0') err(`Problem ${p.problemId}: schemaVersion must be '1.0.0'`);

    if (p.title) detectSolutionLanguage(p.title, `problem ${p.problemId} title`);
    if (p.description) detectSolutionLanguage(p.description, `problem ${p.problemId} description`);

    if (!p.status || !VALID_PROBLEM_STATUS.has(p.status)) {
      err(`Problem ${p.problemId}: invalid status '${p.status}'`);
    }
    if (p.status === 'WELL_SUPPORTED' && (!Array.isArray(p.evidence) || p.evidence.length === 0)) {
      err(`Problem ${p.problemId}: status is WELL_SUPPORTED but evidence array is empty — must have supporting evidence`);
    }

    if (!Array.isArray(p.actorIds) || p.actorIds.length === 0) {
      err(`Problem ${p.problemId}: actorIds must be a non-empty array`);
    } else if (actorIds) {
      for (const aid of p.actorIds) {
        if (!actorIds.has(aid)) {
          err(`Problem ${p.problemId}: references unknown actorId '${aid}'`);
        }
      }
    }

    if (Array.isArray(p.jobIds) && jobIds) {
      for (const jid of p.jobIds) {
        if (!jobIds.has(jid)) {
          err(`Problem ${p.problemId}: references unknown jobId '${jid}'`);
        }
      }
    }

    if (p.workflowId && workflowIds && !workflowIds.has(p.workflowId)) {
      err(`Problem ${p.problemId}: references unknown workflowId '${p.workflowId}'`);
    }

    validateEvidenceItems(p.evidence, `problem ${p.problemId} evidence`);
    validateEvidenceItems(p.counterEvidence, `problem ${p.problemId} counterEvidence`);

    checkNoPrivate(p, `problem ${p.problemId}`);
  }

  ok(`${problemIds.size} problems validated`);
  return problemIds;
}

const VALID_RELATION_TYPES = new Set([
  'ADDRESSES', 'PARTIALLY_ADDRESSES', 'DEPENDS_ON',
  'CREATES', 'REDUCES', 'SHIFTS', 'UNKNOWN'
]);

function validateProblemRelations(problemIds) {
  section('terrain-problem-relations.json');
  const data = loadJson(path.join(DATA, 'terrain-problem-relations.json'));
  if (!data) return;

  if (!Array.isArray(data.relations)) {
    err('terrain-problem-relations.json: top-level "relations" must be an array');
    return;
  }

  const ideasPath = path.join(DATA, 'ideas.json');
  let ideaIds = null;
  if (fs.existsSync(ideasPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(ideasPath, 'utf8'));
      const ideasArr = Array.isArray(raw) ? raw : (raw.ideas || []);
      ideaIds = new Set(ideasArr.map(i => i.id));
      ok(`Loaded ${ideaIds.size} idea IDs for referential integrity check`);
    } catch (e) {
      warn(`Could not parse ideas.json for ideaId verification: ${e.message}`);
    }
  }

  const relationIds = new Set();
  for (const rel of data.relations) {
    if (!rel.relationId) { err('Relation missing relationId'); continue; }
    if (!/^pri-[a-z0-9-]+$/.test(rel.relationId)) {
      err(`Relation ${rel.relationId}: id must match pattern pri-[a-z0-9-]+`);
    }
    if (relationIds.has(rel.relationId)) err(`Duplicate relationId: ${rel.relationId}`);
    relationIds.add(rel.relationId);

    if (rel.schemaVersion !== '1.0.0') err(`Relation ${rel.relationId}: schemaVersion must be '1.0.0'`);

    if (!rel.problemId) {
      err(`Relation ${rel.relationId}: missing problemId`);
    } else if (problemIds && !problemIds.has(rel.problemId)) {
      err(`Relation ${rel.relationId}: references unknown problemId '${rel.problemId}'`);
    }

    if (!rel.ideaId) {
      err(`Relation ${rel.relationId}: missing ideaId`);
    } else if (ideaIds && !ideaIds.has(rel.ideaId)) {
      err(`Relation ${rel.relationId}: references unknown ideaId '${rel.ideaId}' (not found in ideas.json)`);
    }

    if (!rel.relationType || !VALID_RELATION_TYPES.has(rel.relationType)) {
      err(`Relation ${rel.relationId}: invalid relationType '${rel.relationType}'`);
    }

    if (!rel.reasoning) {
      err(`Relation ${rel.relationId}: missing 'reasoning' — must explain why this connection holds`);
    }

    checkNoPrivate(rel, `relation ${rel.relationId}`);
  }

  ok(`${relationIds.size} problem-relations validated`);
}

console.log('\n════════════════════════════════════════');
console.log('  TERRAIN Validator');
if (CHECK_MODE) console.log('  Mode: CHECK (read-only CI)');
console.log('════════════════════════════════════════');

validateSchemas();
const actorIds = validateActors();
const jobIds = validateJobs(actorIds);
const workflowIds = validateWorkflows(actorIds);
const problemIds = validateProblems(actorIds, jobIds, workflowIds);
validateProblemRelations(problemIds);

console.log('\n════════════════════════════════════════');
console.log(`  RESULT: ${errorCount} error(s), ${warnCount} warning(s)`);
console.log('════════════════════════════════════════\n');

if (errorCount > 0) {
  process.exit(1);
}
