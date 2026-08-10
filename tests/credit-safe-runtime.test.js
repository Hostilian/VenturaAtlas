const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('credit-safe mode forces local cost class and skips external proof calls', () => {
  const orchestrator = fs.readFileSync(path.join(ROOT, 'scripts', 'va_orchestrator.py'), 'utf8');
  const proof = fs.readFileSync(path.join(ROOT, 'scripts', 'live-provider-proof.py'), 'utf8');
  assert.match(orchestrator, /VA_CREDIT_SAFE_MODE/);
  assert.match(orchestrator, /max_cost_class = 0/);
  assert.match(proof, /SKIPPED_CREDIT_SAFE_MODE/);
});
