const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');
const { getRepositoryTruth } = require('../scripts/lib/repository-truth');

const root = path.resolve(__dirname, '..');

test('Repository Consistency — Version Synchronization', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/repository-meta.json'), 'utf8'));
  const swContent = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

  const swMatch = swContent.match(/const\s+CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
  assert(swMatch, 'sw.js must define CACHE_VERSION');

  const pkgVersion = pkg.version;
  assert.strictEqual(meta.version, pkgVersion, `repository-meta.json version (${meta.version}) matches package.json (${pkgVersion})`);
  assert.strictEqual(swMatch[1], pkgVersion, `sw.js CACHE_VERSION (${swMatch[1]}) matches package.json (${pkgVersion})`);
});

test('Repository Consistency — Metadata Count Alignment', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/repository-meta.json'), 'utf8'));
  const rawIdeas = JSON.parse(fs.readFileSync(path.join(root, 'data/ideas.json'), 'utf8'));
  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);

  assert.strictEqual(meta.counts.ideas, ideas.length, `repository-meta.json counts.ideas (${meta.counts.ideas}) matches ideas.json length (${ideas.length})`);
  const truth = getRepositoryTruth();
  assert.strictEqual(meta.counts.canonicalIdeas, truth.counts.canonicalIdeas);
  assert.strictEqual(meta.counts.stagedIdeas, truth.counts.stagedIdeas);
  assert.strictEqual(meta.counts.totalIdeas, truth.counts.totalIdeas);
  assert.strictEqual(meta.counts.rankingViews, truth.counts.rankingViews);
  assert.strictEqual(meta.counts.rankingEntries, truth.counts.rankingEntries);
  assert.strictEqual(meta.revisions.stagingRevision, truth.revisions.stagingRevision);
});
