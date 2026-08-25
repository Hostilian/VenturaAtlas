const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const VACapitalStore = require('../assets/js/core/capital-store.js');

test('all Capital schemas exist and are valid JSON Schema draft-2020-12', () => {
  const schemaFiles = [
    'capital-need.schema.json',
    'funding-source.schema.json',
    'grant-opportunity.schema.json',
    'cap-table.schema.json',
    'investor-pipeline.schema.json',
    'data-room.schema.json'
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

test('seed datasets in data/ parse cleanly and match schema prerequisites', () => {
  const sourcesPath = path.join(__dirname, '..', 'data', 'funding-sources.json');
  const grantsPath = path.join(__dirname, '..', 'data', 'grant-opportunities.json');
  const dogfoodPath = path.join(__dirname, '..', 'data', 'capital-dogfood.json');

  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  assert.ok(Array.isArray(sources) && sources.length >= 8);

  const grants = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
  assert.ok(Array.isArray(grants) && grants.length >= 4);
  for (const g of grants) {
    assert.ok(g.grantId.startsWith('grant-'));
    assert.ok(g.fundingRange.minAmount > 0);
    assert.ok(g.applicationEffortHours > 0);
    assert.ok(g.sourceUrl.startsWith('https://'));
  }

  const dogfood = JSON.parse(fs.readFileSync(dogfoodPath, 'utf8'));
  assert.ok(Array.isArray(dogfood.dogfoodVentures) && dogfood.dogfoodVentures.length >= 3);
  // Ensure FactBounty (idea-061) dogfood concludes outside equity is NOT needed
  const fb = dogfood.dogfoodVentures.find(v => v.ventureId === 'idea-061');
  assert.equal(fb.capitalAnalysis.outsideEquityNeededNow, false);
  assert.ok(fb.capitalAnalysis.recommendedPath.includes('CUSTOMER_PREPAY'));
});

test('VACapitalStore defaults are fully initialized and isolated locally', () => {
  const defaultWs = VACapitalStore.defaultState();
  assert.equal(defaultWs.schemaVersion, '1.0.0');
  assert.ok(defaultWs.capitalNeeds.length > 0);
  assert.ok(defaultWs.capTable.stakeholders.length > 0);
  assert.ok(defaultWs.investorPipeline.entries.length > 0);
  assert.ok(defaultWs.dataRoom.categories.length >= 4);

  // Test export and import cycle
  const exported = JSON.stringify(defaultWs, null, 2);
  const imported = VACapitalStore.importWorkspaceJson(exported);
  assert.equal(imported.workspaceId, defaultWs.workspaceId);
  assert.equal(imported.ventureId, defaultWs.ventureId);
});
