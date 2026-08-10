const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Windows autonomy task covers logon, unlock, wake, watchdog and bounded writer semantics', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'Install-VentureAtlas-AutonomyTask.ps1'), 'utf8');
  assert.match(source, /<LogonTrigger>/);
  assert.match(source, /<SessionStateChangeTrigger>/);
  assert.match(source, /Microsoft-Windows-Power-Troubleshooter/);
  assert.match(source, /<TimeTrigger>/);
  assert.match(source, /<MultipleInstancesPolicy>IgnoreNew<\/MultipleInstancesPolicy>/);
  assert.match(source, /<RestartOnFailure><Count>999<\/Count><Interval>PT1M<\/Interval>/);
  assert.match(source, /<WakeToRun>true<\/WakeToRun>/);
});
