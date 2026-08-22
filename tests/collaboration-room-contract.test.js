const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Collaboration room is explicitly browser-local and non-synchronized', () => {
  const roomHtml = fs.readFileSync(path.join(ROOT, 'docs/room.html'), 'utf8');
  const roomJs = fs.readFileSync(path.join(ROOT, 'assets/js/features/collaboration.js'), 'utf8');
  const configJs = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
  const deployDoc = fs.readFileSync(path.join(ROOT, 'docs/DEPLOY_COLLABORATION.md'), 'utf8');

  assert.match(roomHtml, /room state is stored only in this browser/i);
  assert.match(roomHtml, /not a synchronized shared room/i);
  assert.match(roomJs, /This workspace does not synchronize\./i);
  assert.match(roomJs, /A URL cannot transfer local room state/i);
  assert.match(roomJs, /Download Vote Packet \(\.json\)/i);
  assert.match(roomJs, /va-room-session/);
  assert.match(roomJs, /va-room-shortlist/);
  assert.match(configJs, /firebase:\s*null/);
  assert.match(deployDoc, /Firebase Anonymous Authentication/i);
  assert.match(deployDoc, /Local & Offline Fallback Mode/i);
});

test('Collaboration room does not pretend browser-local notes are synchronized collaboration', () => {
  const roomJs = fs.readFileSync(path.join(ROOT, 'assets/js/features/collaboration.js'), 'utf8');

  assert.doesNotMatch(roomJs, /shared room|realtime|sync between devices|live collaboration|copy invite link|join existing room/i);
  assert.match(roomJs, /local workspace created/i);
  assert.match(roomJs, /Export room votes and evaluation scores into a machine-readable JSON packet/i);
});
