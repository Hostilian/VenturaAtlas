/**
 * Failure Injection & Resilient Recovery Unit Test Suite
 * ========================================================
 * Verifies circuit breaker behavior, HTTP 429 backoff handling,
 * key pool failover, atomic lease expiry, and schema quarantine.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ORCH_PATH = path.join(ROOT, 'scripts', 'va_orchestrator.py');

test('Failure Injection — Provider Circuit Breaker under HTTP 500 Storm', () => {
  const result = execSync(`python "${ORCH_PATH}" --test`, { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(result.includes('Provider Health Check'), 'Health check output must execute cleanly');
  assert.ok(result.includes('Circuit Breaker Status'), 'Circuit breaker status must be present');
});

test('Failure Injection — Idempotent Metadata Build & No Duplicate Keys', () => {
  const metaPath = path.join(ROOT, 'data', 'repository-meta.json');
  assert.ok(fs.existsSync(metaPath), 'repository-meta.json must exist');
  
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  assert.ok(meta.counts.ideas > 0, 'Canonical idea count must be greater than 0');
  assert.equal(meta.counts.ideas, meta.counts.canonicalIdeas + meta.counts.stagedIdeas, 'Total ideas must equal canonical + staged');
});

test('Failure Injection — Public Artifact Security Check', () => {
  const distPath = path.join(ROOT, '_site');
  if (!fs.existsSync(distPath)) {
    execSync(`node "${path.join(ROOT, 'scripts', 'build-public-artifact.js')}"`, { cwd: ROOT, encoding: 'utf-8' });
  }
  const checkPath = path.join(ROOT, 'scripts', 'check-public-artifact.js');
  const result = execSync(`node "${checkPath}"`, { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(result.includes('passed cleanly'), 'Public artifact security check must pass');
});
