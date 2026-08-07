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
  let canonicalIdeasCount = 0;
  let stagedIdeasCount = 0;
  let totalIdeasCount = 0;
  const categoriesSet = new Set();

  if (fs.existsSync(IDEAS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || []);
    totalIdeasCount = list.length;
    list.forEach(i => {
      if (i.status === 'staged') {
        stagedIdeasCount++;
      } else {
        canonicalIdeasCount++;
      }
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
      const pPath = path.join(PROMPTS_DIR, d, 'README.md');
      if (fs.existsSync(pPath)) {
        promptsCount += 25; // 25 prompts per pack standard
      }
    });
  }

  return {
    ideas: totalIdeasCount,
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
  const version = pkg.version || '2.2.0';
  const counts = getCounts();
  const isCheckMode = process.argv.includes('--check');

  let existingTimestamp = new Date().toISOString();
  if (fs.existsSync(META_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
      if (
        prev.version === version &&
        prev.counts?.ideas === counts.ideas &&
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
  console.log(`[OK] Generated repository-meta.json (v${version}, ${counts.canonicalIdeas} canonical + ${counts.stagedIdeas} staged = ${counts.totalIdeas} total ideas, ${counts.categories} categories)`);
}

main();
