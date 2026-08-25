const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const VAConstellationStore = require('../assets/js/core/constellation-store.js');

test('all Constellation schemas exist and are valid JSON Schema draft-2020-12', () => {
  const schemaFiles = [
    'constellation-role.schema.json',
    'constellation-person.schema.json',
    'constellation-capability.schema.json',
    'constellation-decision-right.schema.json',
    'constellation-delegation.schema.json',
    'constellation-meeting-packet.schema.json',
    'constellation-hiring-case.schema.json',
    'constellation-workspace.schema.json'
  ];

  for (const filename of schemaFiles) {
    const fullPath = path.join(__dirname, '..', 'schemas', filename);
    assert.ok(fs.existsSync(fullPath), `Schema file ${filename} must exist`);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    assert.equal(content.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(content.title, `Schema ${filename} must have a title`);
    assert.ok(content.properties, `Schema ${filename} must have properties defined`);
  }
});

test('seed capabilities in data/ match schema prerequisites', () => {
  const capsPath = path.join(__dirname, '..', 'data', 'constellation-capabilities.json');
  const caps = JSON.parse(fs.readFileSync(capsPath, 'utf8'));
  assert.ok(Array.isArray(caps) && caps.length >= 8);
  for (const c of caps) {
    assert.ok(c.capabilityId.startsWith('cap-'));
    assert.ok(c.name.length > 3);
    assert.ok(c.domain);
    assert.ok(c.evidenceOfMastery.length > 5);
  }
});

test('VAConstellationStore defaults are fully initialized and isolated locally', () => {
  const defaultWs = VAConstellationStore.defaultState();
  assert.equal(defaultWs.schemaVersion, '1.0.0');
  assert.ok(defaultWs.people.length >= 2);
  assert.ok(defaultWs.roles.length >= 4);
  assert.ok(defaultWs.decisionRights.length >= 4);
  assert.ok(defaultWs.knowledgeDomains.length >= 3);

  // Test export and import cycle
  const exported = JSON.stringify(defaultWs, null, 2);
  const imported = VAConstellationStore.importWorkspaceJson(exported);
  assert.equal(imported.workspaceId, defaultWs.workspaceId);
  assert.equal(imported.companyStage, defaultWs.companyStage);
  assert.equal(imported.roles.length, defaultWs.roles.length);
});
