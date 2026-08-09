const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '_site');

const ALLOW_FILES = [
  'index.html',
  '404.html',
  'offline.html',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'sw.js',
  '.nojekyll',
  'SEARCH_AND_DISCOVERY_GUIDE.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'SECURITY.md'
];

const ALLOW_DIRS = [
  'assets',
  'categories',
  'collaboration',
  'comparisons',
  'data',
  'decisions',
  'docs',
  'financial-models',
  'ideas',
  'launch-plans',
  'prompts',
  'rankings',
  'technical-blueprints',
  'templates',
  'validation-plans'
];

const ALLOW_PATHS = [
  'research/assumptions.md',
  'research/completeness-audit.md',
  'research/final-summary.md',
  'research/methodology.md',
  'research/research-plan.md',
  'research/scoring-methodology.md'
];

const DENIED_PATTERNS = [
  /\.env(\..*)?$/i,
  /node_modules/i,
  /^\.git/i,
  /^\.agent-state/i,
  /^\.agents/i,
  /^\.codex/i,
  /^apps/i,
  /^tests/i,
  /^scripts/i,
  /^cloud-control-plane/i,
  /^services/i,
  /idea-staging-queue\.json$/i,
  /^data\/sources\.json$/i,
  /provider-state\.json$/i,
  /staged-id-migration\.json$/i,
  /migration-preflight\.json$/i,
  /package(-lock)?\.json$/i,
  /tsconfig.*\.json$/i,
  /^research\/(audits|original-chat|constitution)(\/|$)/i,
  /^meeting-packets(\/|$)/i,
  /^prompts\/original(?:\/|-|$)/i,
  /^prompts\/reconstructed-repository-build-prompt\.md$/i
];

const PUBLIC_DATA_ALLOWLIST = new Set([
  'ideas.json',
  'ideas.csv',
  'ideas.schema.json',
  'categories.json',
  'public-sources.json',
  'rankings.json',
  'search-index.json',
  'repository-meta.json',
  'relationships.json',
  'prompts.json',
  'validation-summary.json'
]);

let publicSourceIds = new Set();

function writeJson(dest, value) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function projectIdeasForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);
  const projected = ideas.map(idea => {
    const result = { ...idea };
    if (Array.isArray(result.sourceReferences)) {
      result.sourceReferences = result.sourceReferences.filter(reference => {
        const sourceId = typeof reference === 'string' ? reference : reference?.id;
        return publicSourceIds.has(sourceId);
      });
    }
    if (Array.isArray(result.evidence)) {
      result.evidence = result.evidence.filter(item => publicSourceIds.has(item?.sourceId));
    }
    return result;
  });
  writeJson(dest, Array.isArray(raw) ? projected : { ...raw, ideas: projected });
}

function projectRepositoryMetaForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const counts = { ...(raw.counts || {}) };
  delete counts.stagedIdeas;
  delete counts.totalIdeas;
  counts.sources = publicSourceIds.size;
  const revisions = { ...(raw.revisions || {}) };
  delete revisions.stagingRevision;
  writeJson(dest, { ...raw, counts, revisions });
}

function isDenied(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized.startsWith('data/')) {
    const filename = path.basename(normalized);
    if (!PUBLIC_DATA_ALLOWLIST.has(filename)) {
      return true;
    }
  }
  return DENIED_PATTERNS.some(pattern => pattern.test(normalized));
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  let count = 0;

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      const srcItem = path.join(src, entry);
      const destItem = path.join(dest, entry);
      const relPath = path.relative(ROOT, srcItem);
      if (!isDenied(relPath)) {
        count += copyRecursive(srcItem, destItem);
      }
    }
  } else if (stat.isFile()) {
    const relPath = path.relative(ROOT, src);
    if (!isDenied(relPath)) {
      const normalized = relPath.replace(/\\/g, '/');
      if (normalized === 'data/ideas.json') {
        projectIdeasForPublic(src, dest);
      } else if (normalized === 'data/repository-meta.json') {
        projectRepositoryMetaForPublic(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
      count++;
    }
  }
  return count;
}

function build() {
  console.log('=== Building Public GitHub Pages Staging Directory (_site) ===\n');

  // Fail closed: a stale/missing public evidence projection must abort the build.
  console.log('[BUILD] Generating public sources projection (data/public-sources.json)...');
  execSync('python scripts/build_public_sources.py', { cwd: ROOT, stdio: 'inherit' });
  const projectedSources = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'public-sources.json'), 'utf8')
  );
  publicSourceIds = new Set(projectedSources.map(source => source.id));

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });

  let totalFiles = 0;

  for (const f of ALLOW_FILES) {
    const srcPath = path.join(ROOT, f);
    if (fs.existsSync(srcPath) && !isDenied(f)) {
      fs.copyFileSync(srcPath, path.join(DIST, f));
      totalFiles++;
    }
  }

  for (const d of ALLOW_DIRS) {
    const srcDir = path.join(ROOT, d);
    if (fs.existsSync(srcDir) && !isDenied(d)) {
      totalFiles += copyRecursive(srcDir, path.join(DIST, d));
    }
  }

  for (const relativePath of ALLOW_PATHS) {
    const srcPath = path.join(ROOT, relativePath);
    if (fs.existsSync(srcPath) && !isDenied(relativePath)) {
      const destPath = path.join(DIST, relativePath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      totalFiles++;
    }
  }

  console.log(`[OK] Staging complete! ${totalFiles} files written to: ${DIST}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
