const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');
const PROMPTS_DIR = path.join(ROOT, 'prompts', 'idea-specific');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

function getCounts() {
  let ideasCount = 0;
  const categoriesSet = new Set();
  if (fs.existsSync(IDEAS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || []);
    ideasCount = list.length;
    list.forEach(i => {
      if (i.category) categoriesSet.add(i.category);
    });
  }

  let sourcesCount = 0;
  if (fs.existsSync(SOURCES_PATH)) {
    const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.sources || []);
    sourcesCount = list.length;
  }

  let rankingsCount = 0;
  if (fs.existsSync(RANKINGS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.rankings || []);
    rankingsCount = list.length;
  }

  let promptsCount = 0;
  if (fs.existsSync(PROMPTS_DIR)) {
    const dirs = fs.readdirSync(PROMPTS_DIR);
    dirs.forEach(d => {
      const pPath = path.join(PROMPTS_DIR, d, 'README.md');
      if (fs.existsSync(pPath)) {
        promptsCount += 25; // 25 prompts per pack standard
      }
    });
  }

  return {
    ideas: ideasCount,
    categories: categoriesSet.size,
    sources: sourcesCount,
    rankings: rankingsCount,
    prompts: promptsCount
  };
}

function main() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const version = pkg.version || '2.1.1';
  const counts = getCounts();
  const isCheckMode = process.argv.includes('--check');

  let existingTimestamp = '2026-08-07T05:10:19.286Z';
  if (fs.existsSync(META_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
      if (
        prev.version === version &&
        prev.counts?.ideas === counts.ideas &&
        prev.counts?.categories === counts.categories &&
        prev.counts?.sources === counts.sources &&
        prev.counts?.rankings === counts.rankings
      ) {
        existingTimestamp = prev.generatedAt || existingTimestamp;
      } else {
        existingTimestamp = new Date().toISOString();
      }
    } catch (_) {}
  }

  const metaData = {
    project: 'VenturaAtlas',
    version,
    schemaVersion: '2.0.0',
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
      current.counts.categories !== counts.categories ||
      current.counts.sources !== counts.sources ||
      current.counts.rankings !== counts.rankings
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
  console.log(`[OK] Generated repository-meta.json (v${version}, ${counts.ideas} ideas, ${counts.categories} categories)`);
}

main();
