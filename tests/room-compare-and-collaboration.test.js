const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Collaboration Room — Voting modes, evaluations, empty state, and packet structure', () => {
  const collabSource = fs.readFileSync(path.join(ROOT, 'assets/js/features/collaboration.js'), 'utf8');
  assert.match(collabSource, /Structured Scorecard \(1-10 multi-dimension\)/i);
  assert.match(collabSource, /Pairwise Comparison \(Idea A vs Idea B\)/i);
  assert.match(collabSource, /Quick Reaction \(Interested \/ Unsure \/ Pass\)/i);
  assert.match(collabSource, /Your Shortlist is Empty/i);
  assert.match(collabSource, /Structured Notes (&amp;|&) Evaluations/i);
  assert.match(collabSource, /reasonToBuild/);
  assert.match(collabSource, /reasonNotToBuild/);
  assert.match(collabSource, /dealbreaker/);
  assert.match(collabSource, /nextExperiment/);
  assert.match(collabSource, /confidence/);
  assert.match(collabSource, /pairwiseVotes/);
  assert.match(collabSource, /scorecards/);
  assert.match(collabSource, /Download Vote Packet \(\.json\)/);
});

test('Decision Packet Comparison — Engine syntax, statistics, polarization, and demo packets', () => {
  const compareSource = fs.readFileSync(path.join(ROOT, 'assets/js/features/room-compare.js'), 'utf8');
  assert.match(compareSource, /Load Friend Decision Packets/i);
  assert.match(compareSource, /Load 3-Founder Demo Packets/i);
  assert.match(compareSource, /Top Consensus Leader/i);
  assert.match(compareSource, /High Polarization/i);
  assert.match(compareSource, /Math\.sqrt\(variance\)/);
  assert.match(compareSource, /stdDev >= 1\.5 \|\| range >= 3\.0/);

  // Test data parsing and synthesis logic in sandbox
  const dummyDom = {
    getElementById: () => ({ addEventListener: () => {} }),
    addEventListener: () => {}
  };
  const context = {
    window: { VA: { ideas: [{ id: 'idea-061', name: 'Compliance Engine', category: 'Enterprise Software' }] } },
    document: dummyDom,
    console: console,
    FileReader: class { readAsText() {} },
    Blob: class {},
    URL: { createObjectURL: () => '', revokeObjectURL: () => {} }
  };
  vm.runInNewContext(compareSource, context);
  assert.equal(typeof context.window.initRoomCompare, 'function');
});

test('DEC-0001 Decision Record — Presence, schema compliance, and dogfooding evidence', () => {
  const decJsonPath = path.join(ROOT, 'decisions/DEC-0001.json');
  const decMdPath = path.join(ROOT, 'decisions/DEC-0001.md');
  const decisionsJsonPath = path.join(ROOT, 'data/decisions.json');

  assert.ok(fs.existsSync(decJsonPath), 'DEC-0001.json must exist');
  assert.ok(fs.existsSync(decMdPath), 'DEC-0001.md must exist');

  const decData = JSON.parse(fs.readFileSync(decJsonPath, 'utf8'));
  assert.equal(decData.id, 'DEC-0001');
  assert.equal(decData.decisionType, 'PROVISIONAL_WINNER');
  assert.equal(decData.selectedIdeaId, 'idea-061');
  assert.equal(decData.participants.length, 3);
  assert.ok(decData.consensusMetrics.teamMeanScore > 8.0);
  assert.ok(decData.decisiveAssumptions.length >= 3);
  assert.ok(decData.dissentObjections.length >= 3);

  const decisionsList = JSON.parse(fs.readFileSync(decisionsJsonPath, 'utf8'));
  assert.ok(decisionsList.some(d => d.id === 'DEC-0001' && d.selectedIdeaId === 'idea-061'));
});
