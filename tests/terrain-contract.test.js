const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('TERRAIN — all 5 schemas exist and define valid draft-2020-12 structures', () => {
  const schemaFiles = [
    'terrain-actor.schema.json',
    'terrain-job.schema.json',
    'terrain-workflow.schema.json',
    'terrain-problem.schema.json',
    'terrain-problem-relation.schema.json'
  ];

  for (const f of schemaFiles) {
    const p = path.join(root, 'schemas', f);
    assert.ok(fs.existsSync(p), `Schema ${f} must exist in schemas/`);
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(content.$schema, 'https://json-schema.org/draft/2020-12/schema', `${f} must use draft/2020-12`);
    assert.ok(content.properties, `Schema ${f} must define properties`);
    assert.ok(content.required, `Schema ${f} must declare required fields`);
  }
});

test('TERRAIN — actors dataset meets structural contracts', () => {
  const actorsPath = path.join(root, 'data', 'terrain-actors.json');
  assert.ok(fs.existsSync(actorsPath), 'data/terrain-actors.json must exist');

  const data = JSON.parse(fs.readFileSync(actorsPath, 'utf8'));
  assert.equal(data.schemaVersion, '1.0.0');
  assert.ok(Array.isArray(data.actors) && data.actors.length >= 3, 'Must have at least 3 seed actors');

  for (const actor of data.actors) {
    assert.match(actor.actorId, /^actor-[a-z0-9-]+$/, 'actorId pattern');
    assert.ok(actor.role, 'actor must have role');
    assert.ok(actor.organizationType, 'actor must have organizationType');
    assert.ok(actor.responsibility, 'actor must have responsibility');
  }
});

test('TERRAIN — jobs dataset contains solution-neutral statements', () => {
  const jobsPath = path.join(root, 'data', 'terrain-jobs.json');
  assert.ok(fs.existsSync(jobsPath), 'data/terrain-jobs.json must exist');

  const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  assert.ok(Array.isArray(data.jobs) && data.jobs.length >= 3, 'Must have at least 3 seed jobs');

  const solutionForbidden = [/\buse our app\b/i, /\binstall software\b/i, /\bbuy our platform\b/i];

  for (const job of data.jobs) {
    assert.match(job.jobId, /^job-[a-z0-9-]+$/, 'jobId pattern');
    assert.ok(job.statement, 'job must have statement');
    assert.ok(Array.isArray(job.actorIds) && job.actorIds.length > 0, 'job must link to at least one actor');

    // Solution-neutral test
    for (const re of solutionForbidden) {
      assert.ok(!re.test(job.statement), `Job statement "${job.statement}" must not contain solution language: ${re.source}`);
    }
  }
});

test('TERRAIN — workflows dataset defines current-state steps with frictions', () => {
  const wfPath = path.join(root, 'data', 'terrain-workflows.json');
  assert.ok(fs.existsSync(wfPath), 'data/terrain-workflows.json must exist');

  const data = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  assert.ok(Array.isArray(data.workflows) && data.workflows.length >= 3, 'Must have at least 3 seed workflows');

  for (const wf of data.workflows) {
    assert.match(wf.workflowId, /^wf-[a-z0-9-]+$/, 'workflowId pattern');
    assert.ok(wf.name, 'workflow must have name');
    assert.ok(wf.trigger, 'workflow must have trigger');
    assert.ok(wf.goal, 'workflow must have goal');
    assert.ok(wf.asOf, 'workflow must have asOf date for decay tracking');
    assert.ok(Array.isArray(wf.steps) && wf.steps.length >= 2, 'workflow must have at least 2 steps');
    assert.ok(Array.isArray(wf.frictions), 'workflow must declare frictions array');
    assert.ok(Array.isArray(wf.workarounds), 'workflow must declare workarounds array');
  }
});

test('TERRAIN — problems dataset enforces epistemic labeling & counterevidence', () => {
  const probPath = path.join(root, 'data', 'terrain-problems.json');
  assert.ok(fs.existsSync(probPath), 'data/terrain-problems.json must exist');

  const data = JSON.parse(fs.readFileSync(probPath, 'utf8'));
  assert.ok(Array.isArray(data.problems) && data.problems.length >= 3, 'Must have at least 3 seed problems');

  const validEpistemic = new Set([
    'OBSERVED', 'DIRECTLY_REPORTED', 'DOCUMENTED',
    'SOURCE_SUPPORTED_INFERENCE', 'ANALYST_INFERENCE',
    'AI_HYPOTHESIS', 'USER_HYPOTHESIS', 'UNKNOWN'
  ]);

  for (const prob of data.problems) {
    assert.match(prob.problemId, /^problem-[a-z0-9-]+$/, 'problemId pattern');
    assert.ok(prob.title, 'problem must have title');
    assert.ok(prob.description, 'problem must have description');
    assert.ok(prob.status, 'problem must have status');
    assert.ok(prob.asOf, 'problem must have asOf date');
    assert.ok(Array.isArray(prob.actorIds) && prob.actorIds.length > 0, 'problem must link to actor');

    // Epistemic label check
    if (Array.isArray(prob.evidence)) {
      for (const ev of prob.evidence) {
        assert.ok(validEpistemic.has(ev.epistemic), `Evidence item must have valid epistemic label, got: ${ev.epistemic}`);
      }
    }

    // Counterevidence preserved check (§32)
    assert.ok(Array.isArray(prob.counterEvidence), 'counterEvidence array must be present');
    for (const cev of prob.counterEvidence) {
      assert.ok(validEpistemic.has(cev.epistemic), `Counter-evidence item must have valid epistemic label, got: ${cev.epistemic}`);
    }

    // Research gaps present
    assert.ok(Array.isArray(prob.researchGaps), 'researchGaps array must be present');
  }
});

test('TERRAIN — problem relations link to canonical ideas with coverage & residual analysis', () => {
  const relPath = path.join(root, 'data', 'terrain-problem-relations.json');
  const ideasPath = path.join(root, 'data', 'ideas.json');
  const probPath = path.join(root, 'data', 'terrain-problems.json');

  assert.ok(fs.existsSync(relPath), 'data/terrain-problem-relations.json must exist');
  assert.ok(fs.existsSync(ideasPath), 'data/ideas.json must exist');

  const relData = JSON.parse(fs.readFileSync(relPath, 'utf8'));
  const ideasData = JSON.parse(fs.readFileSync(ideasPath, 'utf8'));
  const probData = JSON.parse(fs.readFileSync(probPath, 'utf8'));

  const canonicalIdeaIds = new Set((Array.isArray(ideasData) ? ideasData : (ideasData.ideas || [])).map(i => i.id));
  const problemIds = new Set(probData.problems.map(p => p.problemId));

  assert.ok(Array.isArray(relData.relations) && relData.relations.length >= 3);

  for (const rel of relData.relations) {
    assert.match(rel.relationId, /^pri-[a-z0-9-]+$/, 'relationId pattern');
    assert.ok(problemIds.has(rel.problemId), `problemId ${rel.problemId} must exist in terrain-problems.json`);
    assert.ok(canonicalIdeaIds.has(rel.ideaId), `ideaId ${rel.ideaId} must exist in canonical ideas.json`);
    assert.ok(rel.relationType, 'relation must declare relationType');
    assert.ok(rel.residualProblem, 'relation must state residual problem (what remains unsolved)');
    assert.ok(rel.reasoning, 'relation must provide reasoning');
  }
});

test('TERRAIN — privacy protection (no PRIVATE leaks in public files)', () => {
  const files = [
    'data/terrain-actors.json',
    'data/terrain-jobs.json',
    'data/terrain-workflows.json',
    'data/terrain-problems.json',
    'data/terrain-problem-relations.json',
    'data/terrain-index.json'
  ];

  for (const f of files) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(!/"visibility"\s*:\s*"PRIVATE"/i.test(content), `${f} must not contain PRIVATE visibility items`);
  }
});

test('TERRAIN — index builder compiles cleanly and matches data integrity', () => {
  const indexPath = path.join(root, 'data', 'terrain-index.json');
  assert.ok(fs.existsSync(indexPath), 'data/terrain-index.json must exist');

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  assert.equal(index.schemaVersion, '1.0.0');
  assert.ok(index.counts.problems >= 3);
  assert.ok(index.counts.actors >= 3);
  assert.ok(index.counts.jobs >= 3);
  assert.ok(index.counts.workflows >= 3);
  assert.ok(index.counts.relations >= 3);
  assert.equal(index.problems.length, index.counts.problems);
});
