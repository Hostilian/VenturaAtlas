const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('friend-facing validation controls disclose browser-local behavior', () => {
  const site = read('assets/js/site.js');
  assert.doesNotMatch(site, /Continuous AI Validation Panel|Request Deeper Validation|queued_local/);
  assert.match(site, /does not launch an AI or background job/i);
  assert.match(site, /No AI or background job was started/i);
  assert.match(site, /status: 'saved_local'/);
});

test('public idea routes never target excluded Markdown dossier paths', () => {
  const commandPalette = read('assets/js/features/command-palette.js');
  const dossiers = read('docs/dossiers.html');
  const site = read('assets/js/site.js');

  assert.match(commandPalette, /docs\/idea\.html\?id=/);
  assert.doesNotMatch(commandPalette, /ideas\/.*\.html/);
  assert.doesNotMatch(dossiers, /ideas\/.*\.md/);
  assert.doesNotMatch(site, /ideas\/.*\.md/);
});

test('first-run decision workspace does not invent a person or preselect ideas', () => {
  const store = read('assets/js/core/studio-store.js');
  assert.match(store, /displayName: 'Local user'/);
  assert.doesNotMatch(store, /Founder ' \+ Math\.floor/);
  assert.match(store, /const defaultShortlist = initialIdeas\.map/);
  assert.doesNotMatch(store, /\['idea-061', 'idea-273'\]/);
});

test('comparison reports unknown query IDs instead of silently dropping them', () => {
  const compare = read('assets/js/features/compare.js');
  assert.match(compare, /const missingIds = chosenIds\.filter/);
  assert.match(compare, /Unavailable idea ID/);
  assert.match(compare, /new Set\(idsQuery\.split/);
});

test('automation pages require receipts and avoid fixed activity claims', () => {
  const live = read('docs/live-progress.html');
  const activity = read('docs/research-activity.html');
  const home = read('assets/js/home.js');

  assert.match(live, /runtime-status\.js/);
  assert.match(live, /Unknown never silently becomes green/i);
  assert.match(activity, /CURRENT RECEIPTS, NOT A CLAIM OF PERPETUAL UPTIME/);
  assert.doesNotMatch(activity, /Today \(08 Aug 2026\)|228 Canonical|62 Citations|Enforced \(Active\)/);
  assert.doesNotMatch(home, /OPERATIONAL|repository-meta.*100/i);
});

test('public copy does not claim universal prompt or artifact coverage', () => {
  const home = read('index.html');
  const readme = read('README.md');
  const guide = read('SEARCH_AND_DISCOVERY_GUIDE.md');

  assert.doesNotMatch(home, /25 prompts per idea|Full Dossiers|Complete research packages/i);
  assert.doesNotMatch(readme, /one full dossier per canonical idea|25-per-idea prompt library/i);
  assert.doesNotMatch(guide, /Every canonical idea has \*\*25 prompts\*\*/i);
});
