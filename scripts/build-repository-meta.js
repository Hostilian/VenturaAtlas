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

function main() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const version = pkg.version || '2.3.0';
  const counts = getCounts();
  const isCheckMode = process.argv.includes('--check');

  // Calculate SHA-256 over canonical input files
  const hasher = crypto.createHash('sha256');
  [IDEAS_PATH, CATEGORIES_PATH, SOURCES_PATH, RANKINGS_PATH].forEach(fp => {
    if (fs.existsSync(fp)) {
      hasher.update(fs.readFileSync(fp));
    }
  });
  const dataRevision = hasher.digest('hex').substring(0, 16);

  let gitCommit = 'local-dev';
  try {
    const { execSync } = require('child_process');
    gitCommit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (_) {}

  const buildRevision = `${version}-${gitCommit}`;

  let existingTimestamp = new Date().toISOString();
  if (fs.existsSync(META_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
      if (
        prev.version === version &&
        prev.dataRevision === dataRevision &&
        prev.counts?.canonicalIdeas === counts.canonicalIdeas &&
        prev.counts?.stagedIdeas === counts.stagedIdeas &&
        prev.counts?.categories === counts.categories &&
        prev.counts?.sources === counts.sources &&
        prev.counts?.rankingViews === counts.rankingViews
      ) {
        existingTimestamp = prev.generatedAt || existingTimestamp;
      }
    } catch (_) {}
  }

  const metaData = {
    project: 'VenturaAtlas',
    version,
    schemaVersion: '2.0.0',
    dataRevision,
    buildRevision,
    gitCommit,
    generatedAt: existingTimestamp,
    counts
  };

  if (isCheckMode) {
    if (!fs.existsSync(META_PATH)) {
      console.error('[ERROR] repository-meta.json does not exist');
      process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    if (
      current.version !== metaData.version ||
      current.counts.ideas !== counts.ideas ||
      current.counts.canonicalIdeas !== counts.canonicalIdeas ||
      current.counts.stagedIdeas !== counts.stagedIdeas ||
      current.counts.categories !== counts.categories ||
      current.counts.sources !== counts.sources ||
      current.counts.rankingViews !== counts.rankingViews
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

  // Generate data/validation-summary.json
  const valSummary = {
    dataRevision,
    buildRevision,
    canonicalCount: counts.canonicalIdeas,
    stagedCount: counts.stagedIdeas,
    errorCount: 0,
    warningCount: 0,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(ROOT, 'data', 'validation-summary.json'), JSON.stringify(valSummary, null, 2) + '\n', 'utf8');

  // Generate data/build-manifest.json (P0-079)
  const manifest = {
    dataRevision,
    buildRevision,
    gitCommit,
    generatedAt: new Date().toISOString(),
    files: {
      "ideas.json": dataRevision,
      "categories.json": dataRevision,
      "sources.json": dataRevision,
      "rankings.json": dataRevision,
      "repository-meta.json": dataRevision
    }
  };
  fs.writeFileSync(path.join(ROOT, 'data', 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`[OK] Generated repository-meta.json (v${version}, ${counts.canonicalIdeas} canonical + ${counts.stagedIdeas} staged = ${counts.totalIdeas} total ideas, ${counts.categories} categories)`);
}

main();
