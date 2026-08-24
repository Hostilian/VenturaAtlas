const assert = require('node:assert/strict');
const { test } = require('node:test');

const runtimeStatus = require('../assets/js/runtime-status.js');

const NOW = Date.parse('2026-08-24T12:00:00Z');

function response(ok, status, payload) {
  return {
    ok,
    status,
    async json() {
      return payload;
    }
  };
}

test('runtime status classifies only a fresh active heartbeat as live', () => {
  const snapshot = runtimeStatus.classifyControlPlane({
    runId: 'run-123',
    status: 'running',
    progress: 44,
    updatedAt: '2026-08-24T11:55:00Z'
  }, { nowMs: NOW });

  assert.equal(snapshot.state, 'live');
  assert.equal(snapshot.isLive, true);
  assert.equal(snapshot.progress, 44);
});

test('runtime status treats fresh sleeping heartbeat as verified, not live', () => {
  const snapshot = runtimeStatus.classifyControlPlane({
    runId: 'run-123',
    status: 'sleeping',
    updatedAt: '2026-08-24T11:55:00Z'
  }, { nowMs: NOW });

  assert.equal(snapshot.state, 'verified');
  assert.equal(snapshot.isLive, false);
  assert.equal(snapshot.isVerified, true);
});

test('runtime status rejects stale and future heartbeats as proof of continuity', () => {
  const stale = runtimeStatus.classifyControlPlane({
    runId: 'run-old',
    status: 'running',
    updatedAt: '2026-08-24T10:00:00Z'
  }, { nowMs: NOW });
  const future = runtimeStatus.classifyControlPlane({
    runId: 'run-future',
    status: 'running',
    updatedAt: '2026-08-24T12:10:01Z'
  }, { nowMs: NOW });

  assert.equal(stale.state, 'stale');
  assert.equal(stale.isLive, false);
  assert.equal(future.state, 'unknown');
  assert.equal(future.status, 'clock-error');
});

test('runtime status distinguishes successful and failed scheduled receipts', () => {
  const base = {
    id: 77,
    status: 'completed',
    updated_at: '2026-08-24T11:45:00Z',
    html_url: 'https://example.test/run/77'
  };
  const successful = runtimeStatus.classifyGithubRun({ ...base, conclusion: 'success' }, { nowMs: NOW });
  const failed = runtimeStatus.classifyGithubRun({ ...base, conclusion: 'failure' }, { nowMs: NOW });

  assert.equal(successful.state, 'verified');
  assert.equal(successful.isLive, false);
  assert.equal(failed.state, 'degraded');
});

test('resolver falls back from a missing local progress endpoint to scheduled receipts', async () => {
  const requested = [];
  const fetchImpl = async url => {
    requested.push(url);
    if (url.endsWith('/progress')) return response(false, 404, {});
    return response(true, 200, {
      workflow_runs: [{
        id: 81,
        event: 'schedule',
        status: 'completed',
        conclusion: 'success',
        updated_at: '2026-08-24T11:45:00Z'
      }]
    });
  };

  const snapshot = await runtimeStatus.resolveStatus({ fetchImpl, root: '.', nowMs: NOW });
  assert.equal(snapshot.source, 'github-actions');
  assert.equal(snapshot.state, 'verified');
  assert.match(requested[1], /event=schedule/);
});

test('resolver stays unknown when neither receipt source is valid', async () => {
  const snapshot = await runtimeStatus.resolveStatus({
    fetchImpl: async () => response(false, 503, {}),
    root: '.',
    nowMs: NOW
  });

  assert.equal(snapshot.state, 'unknown');
  assert.equal(snapshot.isVerified, false);
  assert.equal(snapshot.progress, 0);
});
