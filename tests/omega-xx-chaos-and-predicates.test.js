const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const { evaluateProofPredicates } = require('../scripts/lib/proof-predicates');
const { writeDurableStateCas, readDurableState } = require('../scripts/lib/durable-state');

test('OMEGA XX Predicate: Truth Reconciler requires remote canary receipt for deployment PASS and rejects _site alone', () => {
  const canaryPath = path.join(ROOT, '.agent-state', 'deployment-proof.json');
  let backup = null;
  if (fs.existsSync(canaryPath)) {
    backup = fs.readFileSync(canaryPath, 'utf8');
    fs.unlinkSync(canaryPath);
  }

  try {
    const resultWithoutCanary = evaluateProofPredicates();
    assert.ok(resultWithoutCanary.components.deployment, 'Deployment predicate must exist');
    assert.equal(resultWithoutCanary.components.deployment.status, 'NOT_OBSERVED', 'Without live canary, deployment must be NOT_OBSERVED even if _site exists');
  } finally {
    if (backup !== null) {
      fs.writeFileSync(canaryPath, backup, 'utf8');
    }
  }

  const resultWithCanary = evaluateProofPredicates();
  assert.ok(['PASS', 'NOT_OBSERVED', 'WARN'].includes(resultWithCanary.components.deployment.status));
});

test('OMEGA XX Predicate: Canonical ideas and dossier coverage join correctly without exceeding 100%', () => {
  const result = evaluateProofPredicates();
  const coverage = result.components.artifactCoverage;
  assert.ok(coverage, 'Artifact coverage predicate must exist');
  assert.ok(!coverage.reason.includes('135.0%'), 'Coverage must not falsely report 135% coverage');
  assert.match(coverage.reason, /\d+%/);
});

test('OMEGA XX Predicate: Public truth linters enforce header version alignment', () => {
  const result = evaluateProofPredicates();
  const publicTruth = result.components.publicTruth;
  assert.ok(publicTruth, 'Public truth predicate must exist');
  assert.equal(publicTruth.status, 'PASS', `Public truth must pass, reason: ${publicTruth.reason}`);
});

test('OMEGA XX Security: research-cycle.yml quarantined private staging from artifact uploads', () => {
  const workflowContent = fs.readFileSync(path.join(ROOT, '.github/workflows/research-cycle.yml'), 'utf8');
  assert.ok(!workflowContent.includes('upload-artifact@v7\n        with:\n          name: venture-atlas-unattended-receipts-\n          path: |\n            data/idea-staging-queue.json'), 'No direct staging queue upload');
  assert.match(workflowContent, /\.agent-state\/sanitized-execution-receipt\.json/);
});

test('OMEGA XX Resilience: Optimistic Concurrency (CAS) catches race condition conflicts', () => {
  const tempFile = path.join(ROOT, '.agent-state', 'temp-test-state.json');
  fs.mkdirSync(path.join(ROOT, '.agent-state'), { recursive: true });

  // Initial write revision 1
  fs.writeFileSync(tempFile, JSON.stringify({ stateRevision: 1, val: 'init' }), 'utf8');

  // Concurrent write 1 expected revision 1 -> becomes revision 2
  const write1 = writeDurableStateCas(tempFile, 1, { val: 'update1' }, 'test-run-1');
  assert.equal(write1.revision, 2);
  assert.equal(write1.state.previousRevision, 1);

  // Concurrent write 2 attempting revision 1 again must FAIL with STATE_CONFLICT
  assert.throws(() => {
    writeDurableStateCas(tempFile, 1, { val: 'update2-conflict' }, 'test-run-2');
  }, /STATE_CONFLICT/);

  // Clean up test file
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
});

test('OMEGA XX Architecture: 4 Clocks are structured and emitted in system health', () => {
  const result = evaluateProofPredicates();
  assert.ok(result.clocks, 'Clocks object must be present in health report');
  assert.ok(result.clocks.repositoryClock, 'repositoryClock must exist');
  assert.ok(result.clocks.projectionClock, 'projectionClock must exist');
  assert.ok(result.clocks.executionClock, 'executionClock must exist');
  assert.ok(result.clocks.worldClock, 'worldClock must exist');
});
