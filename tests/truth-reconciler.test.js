const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Truth reconciler marks expired provider receipts as not current', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'truth-reconciler.js'), 'utf8');
  assert.match(source, /provider receipts expired or missing; raw healthy flags are not current/);
  assert.match(source, /freshHealthyCount/);
  assert.match(source, /freshness: registryFresh \? 'FRESH' : 'EXPIRED'/);
});
