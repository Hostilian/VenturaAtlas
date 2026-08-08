const fs = require('fs');
const path = require('path');
const { getRepositoryTruth } = require('./lib/repository-truth');

const ROOT = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const MANIFEST_PATH = path.join(ROOT, 'data', 'build-manifest.json');

function main() {
  const isCheckMode = process.argv.includes('--check');
  const truth = getRepositoryTruth();

  let gitCommit = 'local-dev';
  try {
    const { execSync } = require('child_process');
    gitCommit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (_) {}

  const buildRevision = `${truth.version}-${gitCommit}`;

  let existingTimestamp = new Date().toISOString();
  if (fs.existsSync(META_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
      if (
        prev.version === truth.version &&
        prev.dataRevision === truth.canonicalDataRevision &&
        prev.counts?.canonicalIdeas === truth.counts.canonicalIdeas &&
        prev.counts?.stagedIdeas === truth.counts.stagedIdeas &&
        prev.counts?.categories === truth.counts.categories &&
        prev.counts?.sources === truth.counts.sources &&
        prev.counts?.rankingViews === truth.counts.rankingViews
      ) {
        existingTimestamp = prev.generatedAt || existingTimestamp;
      }
    } catch (_) {}
  }

  const metaData = {
    project: 'VenturaAtlas',
    version: truth.version,
    schemaVersion: truth.schemaVersion,
    dataRevision: truth.canonicalDataRevision,
    buildRevision,
    gitCommit,
    generatedAt: existingTimestamp,
    counts: truth.counts,
    revisions: truth.revisions
  };

  if (isCheckMode) {
    if (!fs.existsSync(META_PATH)) {
      console.error('[ERROR] repository-meta.json does not exist');
      process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    if (
      current.version !== metaData.version ||
      current.counts.ideas !== truth.counts.ideas ||
      current.counts.canonicalIdeas !== truth.counts.canonicalIdeas ||
      current.counts.stagedIdeas !== truth.counts.stagedIdeas ||
      current.counts.categories !== truth.counts.categories ||
      current.counts.sources !== truth.counts.sources ||
      current.counts.rankingViews !== truth.counts.rankingViews
    ) {
      console.error('[ERROR] repository-meta.json is stale');
      console.error('Expected:', metaData.counts);
      console.error('Actual:', current.counts);
      process.exit(1);
    }
    console.log('[OK] repository-meta.json is up to date');
    process.exit(0);
  }

  fs.writeFileSync(META_PATH, JSON.stringify(metaData, null, 2) + '\n', 'utf8');

  // Generate data/build-manifest.json with per-file SHA256 hashes and byte sizes
  const manifest = {
    dataRevision: truth.canonicalDataRevision,
    buildRevision,
    gitCommit,
    generatedAt: new Date().toISOString(),
    files: truth.files
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`[OK] Generated repository-meta.json (v${truth.version}, ${truth.counts.canonicalIdeas} canonical + ${truth.counts.stagedIdeas} staged = ${truth.counts.totalIdeas} total ideas, ${truth.counts.categories} categories)`);
}

main();
