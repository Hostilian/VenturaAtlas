const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const RelayStore = require('../assets/js/core/relay-store.js');

test('all 9 Relay schemas exist and define valid draft-2020-12 structures', () => {
  const schemaFiles = [
    'relay-process.schema.json',
    'relay-fulfillment.schema.json',
    'relay-quality-defect.schema.json',
    'relay-capacity-model.schema.json',
    'relay-supplier.schema.json',
    'relay-support-case.schema.json',
    'relay-cost-to-serve.schema.json',
    'relay-improvement.schema.json',
    'relay-workspace.schema.json'
  ];

  for (const f of schemaFiles) {
    const p = path.join(__dirname, '..', 'schemas', f);
    assert.ok(fs.existsSync(p), `Schema ${f} must exist`);
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(content.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(content.properties, `Schema ${f} must define properties`);
  }
});

test('Relay seed datasets parse cleanly and meet structural contracts', () => {
  const archetypesPath = path.join(__dirname, '..', 'data', 'relay-archetypes.json');
  const fixturesPath = path.join(__dirname, '..', 'data', 'relay-fixtures.json');

  assert.ok(fs.existsSync(archetypesPath), 'relay-archetypes.json must exist');
  assert.ok(fs.existsSync(fixturesPath), 'relay-fixtures.json must exist');

  const archetypes = JSON.parse(fs.readFileSync(archetypesPath, 'utf8'));
  const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

  assert.ok(Array.isArray(archetypes.archetypes) && archetypes.archetypes.length >= 7);
  assert.ok(Array.isArray(fixtures.fixtures) && fixtures.fixtures.length >= 3);

  // Validate archetype structure
  for (const arc of archetypes.archetypes) {
    assert.ok(arc.archetypeId);
    assert.ok(arc.name);
    assert.ok(arc.defaultFlowUnit);
    assert.ok(Array.isArray(arc.defaultStages));
  }

  // Validate fixture structure
  for (const fix of fixtures.fixtures) {
    assert.ok(fix.fixtureId);
    assert.ok(fix.name);
    assert.ok(fix.ventureId);
    assert.ok(fix.process);
    assert.ok(Array.isArray(fix.fulfillments));
  }
});

test('RelayStore initializes default workspace and provides isolated CRUD operations', () => {
  const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  };

  const store = new RelayStore(mockStorage);
  const ws = store.getWorkspace();
  assert.ok(ws);
  assert.ok(ws.workspaceId);
  assert.equal(ws.processes.length, 1);
  assert.equal(ws.fulfillments.length, 1);

  // Test state transition
  const updated = store.updateFulfillmentState('ful-fb-101', 'CLOSED', 'Order delivered and verified');
  assert.equal(updated.state, 'CLOSED');
  assert.ok(updated.stateHistory.length >= 1);

  // Test export / import
  const exported = store.exportJson();
  assert.ok(exported.includes('ful-fb-101'));

  const importResult = store.importJson(exported);
  assert.equal(importResult.success, true);
});
