const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('all ORBIT schemas exist and define valid draft-2020-12 structures', () => {
  const schemaFiles = [
    'portfolio.schema.json',
    'venture-bet.schema.json',
    'forecast.schema.json',
    'strategic-asset.schema.json'
  ];

  for (const f of schemaFiles) {
    const p = path.join(__dirname, '..', 'schemas', f);
    assert.ok(fs.existsSync(p), `Schema ${f} must exist`);
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(content.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(content.properties, `Schema ${f} must have properties defined`);
  }
});

test('ORBIT seed datasets parse and meet contract requirements', () => {
  const dataFiles = [
    'portfolios.json',
    'portfolio-risk-factors.json',
    'strategic-assets.json',
    'forecasts.json'
  ];

  for (const f of dataFiles) {
    const p = path.join(__dirname, '..', 'data', f);
    assert.ok(fs.existsSync(p), `Data file ${f} must exist`);
    const content = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.ok(content, `Data file ${f} must parse cleanly`);
  }

  // Verify portfolios.json content
  const portJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'portfolios.json'), 'utf8'));
  assert.ok(Array.isArray(portJson.portfolios) && portJson.portfolios.length >= 3);
  for (const port of portJson.portfolios) {
    assert.ok(port.portfolioId);
    assert.ok(port.name);
    assert.ok(port.resourceEnvelope);
    assert.ok(Array.isArray(port.bets));
  }

  // Verify strategic-assets.json content
  const assetJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'strategic-assets.json'), 'utf8'));
  assert.ok(Array.isArray(assetJson.assets) && assetJson.assets.length >= 5);
  for (const a of assetJson.assets) {
    assert.ok(a.assetId);
    assert.ok(a.name);
    assert.ok(a.type);
    assert.ok(Array.isArray(a.linkedIdeaIds));
  }
});
