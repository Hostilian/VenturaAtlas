const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Workflow Artifact Privacy — research-cycle.yml does not upload private staging queue', () => {
  const workflowPath = path.join(ROOT, '.github/workflows/research-cycle.yml');
  assert.ok(fs.existsSync(workflowPath), 'research-cycle.yml must exist');

  const content = fs.readFileSync(workflowPath, 'utf8');
  const uploadStart = content.indexOf('uses: actions/upload-artifact@');
  assert.ok(uploadStart >= 0, 'upload-artifact step must exist and be commit-pinned');
  const uploadStep = content.slice(uploadStart);
  assert.ok(!uploadStep.includes('data/idea-staging-queue.json'), 'data/idea-staging-queue.json must NOT be in upload-artifact path');
  assert.ok(!uploadStep.includes('.env'), '.env must NOT be in upload-artifact path');
  assert.match(uploadStep, /path:\s*\.agent-state\/sanitized-execution-receipt\.json/);
});

test('Public Site Privacy — _site does not contain private staging or credentials', () => {
  const forbiddenFiles = [
    'data/idea-staging-queue.json',
    '.env',
    '.agent-state/provider-state.json',
    '.agent-state/provider-call-ledger.json',
    'research/chessboard/idea-061-market-structure.json',
    'config/private-keys.json'
  ];

  const siteDir = path.join(ROOT, '_site');
  if (fs.existsSync(siteDir)) {
    forbiddenFiles.forEach(f => {
      const sitePath = path.join(siteDir, f);
      assert.ok(!fs.existsSync(sitePath), `Forbidden file ${f} must not exist in _site/`);
    });
  }
});
