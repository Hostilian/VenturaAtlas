const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Workflow Artifact Privacy — research-cycle.yml does not upload private staging queue', () => {
  const workflowPath = path.join(ROOT, '.github/workflows/research-cycle.yml');
  assert.ok(fs.existsSync(workflowPath), 'research-cycle.yml must exist');

  const content = fs.readFileSync(workflowPath, 'utf8');
  // Check upload-artifact paths block
  const uploadMatch = content.match(/uses:\s*actions\/upload-artifact@[\s\S]*?path:\s*\|([\s\S]*?)(?:if-no-files-found|\n\s*\w+:)/);
  assert.ok(uploadMatch, 'upload-artifact step must exist');

  const uploadedPaths = uploadMatch[1];
  assert.ok(!uploadedPaths.includes('data/idea-staging-queue.json'), 'data/idea-staging-queue.json must NOT be in upload-artifact path');
  assert.ok(!uploadedPaths.includes('.env'), '.env must NOT be in upload-artifact path');
  assert.ok(uploadedPaths.includes('sanitized-execution-receipt.json'), 'sanitized-execution-receipt.json must be in upload-artifact path');
});

test('Public Site Privacy — _site does not contain private staging or credentials', () => {
  const forbiddenFiles = [
    'data/idea-staging-queue.json',
    '.env',
    '.agent-state/provider-state.json',
    '.agent-state/provider-call-ledger.json',
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
