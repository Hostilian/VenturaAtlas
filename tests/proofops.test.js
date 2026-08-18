const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

test('ProofOps registry is research-only, complete, and paired with unrun experiments', () => {
  const result = spawnSync('python', ['scripts/validate-proofops.py'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/proofops-research.json'), 'utf8'));
  const experiments = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/proofops-experiments.json'), 'utf8'));
  assert.equal(registry.promotionEligible, false);
  assert.equal(registry.candidates.length, 11);
  assert.equal(experiments.experiments.length, 11);
  assert.ok(registry.candidates.every((candidate) => candidate.realityStage === 'DESK_RESEARCH'));
  assert.ok(experiments.experiments.every((experiment) => experiment.result === null && experiment.decision === null));
});
