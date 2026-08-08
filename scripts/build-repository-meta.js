const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');
const PROMPTS_DIR = path.join(ROOT, 'prompts', 'idea-specific');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

const crypto = require('crypto');
const QUEUE_PATH = path.join(ROOT, 'data', 'idea-staging-queue.json');
const CATEGORIES_PATH = path.join(ROOT, 'data', 'categories.json');

function getCounts() {
  let canonicalIdeasCount = 0;
  let stagedIdeasCount = 0;
  const categoriesSet = new Set();

  if (fs.existsSync(IDEAS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || []);
    canonicalIdeasCount = list.length;
    list.forEach(i => {
      if (i.category) categoriesSet.add(i.category);
    });
  }

  if (fs.existsSync(QUEUE_PATH)) {
    const raw = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || raw.queue || []);
    stagedIdeasCount = list.length;
  }

  if (fs.existsSync(CATEGORIES_PATH)) {
    const raw = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.categories || []);
    list.forEach(c => {
      if (typeof c === 'string') categoriesSet.add(c);
      else if (c.name) categoriesSet.add(c.name);
    });
  }

  let sourcesCount = 0;
  if (fs.existsSync(SOURCES_PATH)) {
    const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.sources || []);
    sourcesCount = list.length;
  }

  let rankingsCount = 0;
  let rankingEntriesCount = 0;
  if (fs.existsSync(RANKINGS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.rankings || []);
    rankingsCount = list.length;
    if (list.length > 0 && Array.isArray(list[0].items)) {
      rankingEntriesCount = list[0].items.length;
    }
  }

  let promptsCount = 0;
  if (fs.existsSync(PROMPTS_DIR)) {
    const dirs = fs.readdirSync(PROMPTS_DIR);
    dirs.forEach(d => {
      const pDir = path.join(PROMPTS_DIR, d);
      if (fs.statSync(pDir).isDirectory()) {
        const files = fs.readdirSync(pDir).filter(f => f.endsWith('.md') && f !== 'README.md');
        if (files.length > 0) {
          promptsCount += files.length;
        } else if (fs.existsSync(path.join(pDir, 'README.md'))) {
          const readmeText = fs.readFileSync(path.join(pDir, 'README.md'), 'utf8');
          const matches = readmeText.match(/^###?\s+Prompt\s+\d+/gm);
          promptsCount += matches ? matches.length : 0;
        }
      }
    });
  }

  const totalIdeasCount = canonicalIdeasCount + stagedIdeasCount;

  return {
    ideas: canonicalIdeasCount,
    canonicalIdeas: canonicalIdeasCount,
    stagedIdeas: stagedIdeasCount,
    totalIdeas: totalIdeasCount,
    categories: categoriesSet.size,
    sources: sourcesCount,
    rankingViews: rankingsCount,
    rankingEntries: rankingEntriesCount,
    prompts: promptsCount
  };
}

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

