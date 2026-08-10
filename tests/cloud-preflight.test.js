const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('cloud preflight is read-only and does not record secrets', () => {
  const source = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'preflight.py'), 'utf8');
  assert.match(source, /offLaptopExecutionProven/);
  assert.match(source, /secretsRecorded.*False/);
  assert.doesNotMatch(source, /terraform.*apply|gcloud.*deploy|secrets versions access/i);
});
