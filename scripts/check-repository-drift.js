const fs = require('fs');
const path = require('path');
const { getRepositoryTruth } = require('./lib/repository-truth');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const LOCK_PATH = path.join(ROOT, 'package-lock.json');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const INDEX_PATH = path.join(ROOT, 'data', 'search-index.json');

const STATS_FILES = [
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'PROJECT_STATUS.md'),
  path.join(ROOT, 'PROJECT_STATE.md')
];

function main() {
  const errors = [];
  const truth = getRepositoryTruth();

  if (!fs.existsSync(PKG_PATH) || !fs.existsSync(LOCK_PATH)) {
    errors.push('Missing package.json or package-lock.json');
  } else {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    const lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
    if (pkg.version !== lock.version) {
      errors.push(`Version mismatch: package.json (${pkg.version}) vs package-lock.json (${lock.version})`);
    }
    if (pkg.name !== lock.name) {
      errors.push(`Package name mismatch: package.json (${pkg.name}) vs package-lock.json (${lock.name})`);
    }
  }

  let meta = null;
  if (!fs.existsSync(META_PATH)) {
    errors.push('Missing data/repository-meta.json');
  } else {
    meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    if (meta.version !== pkg.version) {
      errors.push(`Version mismatch: repository-meta.json (${meta.version}) vs package.json (${pkg.version})`);
    }
  }

  if (fs.existsSync(IDEAS_PATH) && fs.existsSync(INDEX_PATH)) {
    const ideasRaw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const ideasList = Array.isArray(ideasRaw) ? ideasRaw : (ideasRaw.ideas || []);
    const indexRaw = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

    if (ideasList.length !== indexRaw.length) {
      errors.push(`Search index drift: ideas.json (${ideasList.length}) vs search-index.json (${indexRaw.length})`);
    }
  }

  if (meta && meta.counts) {
    for (const key of ['canonicalIdeas', 'stagedIdeas', 'totalIdeas', 'sources', 'rankingViews', 'rankingEntries']) {
      if (meta.counts[key] !== truth.counts[key]) {
        errors.push(`Repository truth drift: repository-meta counts.${key} (${meta.counts[key]}) != computed truth (${truth.counts[key]})`);
      }
    }
    if (meta.counts.ideas !== truth.counts.canonicalIdeas) {
      errors.push(`Repository truth drift: repository-meta counts.ideas (${meta.counts.ideas}) != computed canonical truth (${truth.counts.canonicalIdeas})`);
    }
    for (const key of ['canonicalDataRevision', 'stagingRevision', 'rankingsRevision', 'sourcesRevision']) {
      if (meta.revisions?.[key] !== truth.revisions[key]) {
        errors.push(`Repository truth drift: repository-meta revisions.${key} does not match computed truth`);
      }
    }
    STATS_FILES.forEach(filePath => {
      if (!fs.existsSync(filePath)) return;
      const content = fs.readFileSync(filePath, 'utf8');
      const basename = path.basename(filePath);

      const generatedFields = {
        'Canonical Ideas': meta.counts.canonicalIdeas,
        'Staged Ideas': meta.counts.stagedIdeas,
        'Total Ideas': meta.counts.totalIdeas,
        'Categories': meta.counts.categories,
        'Source References': meta.counts.sources,
        'Generated Prompts': meta.counts.prompts
      };
      for (const [label, expected] of Object.entries(generatedFields)) {
        const match = content.match(new RegExp(`- ${label}:\\s+(\\d+)`));
        if (!match) {
          errors.push(`Missing generated '${label}' stat in ${basename}`);
        } else if (parseInt(match[1], 10) !== expected) {
          errors.push(`Documentation stat drift in ${basename} for ${label}: found ${match[1]}, expected ${expected}`);
        }
      }
    });

    // Check index.html meta description drift
    const indexHtmlPath = path.join(ROOT, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      const htmlMatch = htmlContent.match(/content="Browse (\d+)\+/i);
      if (htmlMatch) {
        const htmlFound = parseInt(htmlMatch[1], 10);
        if (htmlFound !== meta.counts.ideas) {
          errors.push(`index.html meta tag drift: found ${htmlFound}, expected ${meta.counts.ideas}`);
        }
      }
    }

    // Check sw.js version drift
    const swPath = path.join(ROOT, 'sw.js');
    if (fs.existsSync(swPath)) {
      const swContent = fs.readFileSync(swPath, 'utf8');
      const swMatch = swContent.match(/const CACHE_VERSION = '([^']+)';/);
      if (swMatch) {
        const swVer = swMatch[1];
        if (swVer !== meta.version) {
          errors.push(`sw.js CACHE_VERSION drift: found ${swVer}, expected ${meta.version}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('[ERROR] Repository drift checks failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Repository drift check passed cleanly.');
}

main();
