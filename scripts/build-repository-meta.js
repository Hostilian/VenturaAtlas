const fs = require('fs');
const path = require('path');
const { getRepositoryTruth } = require('./lib/repository-truth');

const ROOT = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const MANIFEST_PATH = path.join(ROOT, 'data', 'build-manifest.json');

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function atomicJsonWrite(targetPath, value) {
  const temporaryPath = `${targetPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(temporaryPath, targetPath);
}

function main() {
  const isCheckMode = process.argv.includes('--check');
  const truth = getRepositoryTruth({ includePrivateStaging: false });

  // A tracked generated file cannot embed HEAD: committing that file changes HEAD
  // and makes the freshly committed output stale. Use the canonical content
  // revision so identical inputs produce identical metadata in every checkout.
  const buildRevision = `${truth.version}-${truth.canonicalDataRevision}`;

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
    } catch (_metaErr) {
      // Previous meta unreadable; generate fresh timestamp
    }
  }

  const metaData = {
    project: 'VenturaAtlas',
    version: truth.version,
    schemaVersion: truth.schemaVersion,
    privateStagingIncluded: false,
    dataRevision: truth.canonicalDataRevision,
    buildRevision,
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
    const metaMatches =
      current.project === metaData.project &&
      current.version === metaData.version &&
      current.schemaVersion === metaData.schemaVersion &&
      current.privateStagingIncluded === false &&
      current.dataRevision === metaData.dataRevision &&
      current.buildRevision === metaData.buildRevision &&
      !Object.hasOwn(current, 'gitCommit') &&
      sameJson(current.counts, metaData.counts) &&
      sameJson(current.revisions, metaData.revisions);
    if (!metaMatches) {
      console.error('[ERROR] repository-meta.json is stale');
      process.exit(1);
    }
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.error('[ERROR] data/build-manifest.json does not exist');
      process.exit(1);
    }
    const currentManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const manifestMatches =
      currentManifest.dataRevision === truth.canonicalDataRevision &&
      currentManifest.buildRevision === buildRevision &&
      !Object.hasOwn(currentManifest, 'gitCommit') &&
      sameJson(currentManifest.files, truth.files);
    if (!manifestMatches) {
      console.error('[ERROR] data/build-manifest.json is stale');
      process.exit(1);
    }
    console.log('[OK] repository-meta.json is up to date');
    process.exit(0);
  }

  atomicJsonWrite(META_PATH, metaData);

  // Generate data/build-manifest.json with per-file SHA256 hashes and byte sizes
  let manifestTimestamp = new Date().toISOString();
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const previousManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      if (
        previousManifest.dataRevision === truth.canonicalDataRevision &&
        previousManifest.buildRevision === buildRevision &&
        !Object.hasOwn(previousManifest, 'gitCommit') &&
        sameJson(previousManifest.files, truth.files)
      ) {
        manifestTimestamp = previousManifest.generatedAt || manifestTimestamp;
      }
    } catch (_manifestErr) {
      // Previous manifest unreadable; generate fresh timestamp
    }
  }
  const manifest = {
    dataRevision: truth.canonicalDataRevision,
    buildRevision,
    generatedAt: manifestTimestamp,
    files: truth.files
  };
  atomicJsonWrite(MANIFEST_PATH, manifest);

  console.log(`[OK] Generated repository-meta.json (v${truth.version}, ${truth.counts.canonicalIdeas} canonical + ${truth.counts.stagedIdeas} staged = ${truth.counts.totalIdeas} total ideas, ${truth.counts.categories} categories)`);
}

main();
