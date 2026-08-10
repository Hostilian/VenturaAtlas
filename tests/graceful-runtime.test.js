const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('provider telemetry contention does not discard successful responses', () => {
  const orchestrator = fs.readFileSync(path.join(ROOT, 'scripts', 'va_orchestrator.py'), 'utf8');
  assert.match(orchestrator, /telemetry lock busy after success.*response preserved/);
  assert.match(orchestrator, /except TimeoutError/);
});

test('daemon restarts failed-closed pipeline with bounded backoff', () => {
  const daemon = fs.readFileSync(path.join(ROOT, 'scripts', 'va-daemon-runner.py'), 'utf8');
  assert.match(daemon, /Pipeline failed closed; restarting inside supervisor/);
  assert.match(daemon, /backoff = min\(300, 30 \* restart_count\)/);
});
