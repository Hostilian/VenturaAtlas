const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('live provider proof is secret-free and requires overlapping external calls', () => {
  const proof = fs.readFileSync(path.join(ROOT, 'scripts', 'live-provider-proof.py'), 'utf8');
  assert.match(proof, /minimum-external/);
  assert.match(proof, /allow_own_orch=False/);
  assert.match(proof, /overlapProven/);
  assert.match(proof, /responseContentRecorded.*False/);
  assert.match(proof, /secretsRecorded.*False/);
  assert.doesNotMatch(proof, /OPENROUTER_API_KEY\s*=|ANTHROPIC_API_KEY\s*=/);
});
