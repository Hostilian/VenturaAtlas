const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');

test('OMEGA XVII legacy ingest cannot bypass the canonical publisher', () => {
  const result = spawnSync('python', ['scripts/ingest_omega_xvii_public_money_graph_20260817.py'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /Direct OMEGA XVII canonical ingestion is disabled/);
});

test('OMEGA XVIII legacy ingest cannot bypass the canonical publisher', () => {
  const result = spawnSync('python', ['scripts/ingest_omega_xviii_route_shock_20260818.py'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /Direct OMEGA XVIII canonical ingestion is disabled/);
});
