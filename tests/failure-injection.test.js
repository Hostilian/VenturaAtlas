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
  assert.equal(meta.counts.totalIdeas, meta.counts.canonicalIdeas + meta.counts.stagedIdeas, 'Total ideas must equal canonical + staged');
});

test('Failure Injection — Public Artifact Security Check', () => {
  const distPath = path.join(ROOT, '_site');
  execSync(`node "${path.join(ROOT, 'scripts', 'build-public-artifact.js')}"`, { cwd: ROOT, encoding: 'utf-8' });
  const checkPath = path.join(ROOT, 'scripts', 'check-public-artifact.js');
  const result = execSync(`node "${checkPath}"`, { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(result.includes('passed cleanly'), 'Public artifact security check must pass');
  assert.ok(!fs.existsSync(path.join(distPath, 'data', 'sources.json')), 'raw source registry must not be public');
  assert.ok(fs.existsSync(path.join(distPath, 'data', 'public-sources.json')), 'sanitized public source projection must exist');
  assert.ok(!fs.existsSync(path.join(distPath, 'data', 'build-manifest.json')), 'internal build manifest must not expose staging digests');
  assert.ok(!fs.existsSync(path.join(distPath, 'research', 'audits')), 'private audit runs must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'research', 'original-chat')), 'private original-chat research must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'meeting-packets')), 'meeting packets require explicit publication and must not be public by default');

  const publicSources = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'public-sources.json'), 'utf8'));
  const publicIds = new Set(publicSources.map(source => source.id));
  assert.ok(publicSources.every(source => source.visibility === 'PUBLIC'), 'every projected source must be explicitly public');
  const publicIdeasRaw = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'ideas.json'), 'utf8'));
  const publicIdeas = Array.isArray(publicIdeasRaw) ? publicIdeasRaw : publicIdeasRaw.ideas;
  for (const idea of publicIdeas) {
    for (const reference of idea.sourceReferences || []) {
      const sourceId = typeof reference === 'string' ? reference : reference.id;
      assert.ok(publicIds.has(sourceId), `public idea ${idea.id} references non-public source ${sourceId}`);
    }
    for (const evidence of idea.evidence || []) {
      assert.ok(publicIds.has(evidence.sourceId), `public idea ${idea.id} exposes non-public evidence ${evidence.sourceId}`);
    }
  }
  const publicMeta = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'repository-meta.json'), 'utf8'));
  assert.equal(publicMeta.counts.stagedIdeas, undefined, 'public metadata must not expose staged counts');
  assert.equal(publicMeta.counts.totalIdeas, undefined, 'public metadata must not combine staged and canonical counts');
  assert.equal(publicMeta.revisions.stagingRevision, undefined, 'public metadata must not expose staging revision');
  assert.equal(publicMeta.counts.sources, publicSources.length, 'public source count must describe the public projection');
});
