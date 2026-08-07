const fs = require('fs');
const path = require('path');

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
  'meeting-packets',
  'prompts',
  'rankings',
  'research',
  'technical-blueprints',
  'templates',
  'validation-plans'
];

const DENIED_PATTERNS = [
  /\.env(\..*)?$/i,
  /node_modules/i,
  /^\.git/i,
  /^\.agent-state/i,
  /^\.agents/i,
  /^apps/i,
  /^tests/i,
  /^scripts/i,
  /package(-lock)?\.json$/i,
  /tsconfig.*\.json$/i
];

function isDenied(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
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
      fs.copyFileSync(src, dest);
      count++;
    }
  }
  return count;
}

function build() {
  console.log('=== Building Public GitHub Pages Staging Directory (_site) ===\n');

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

  console.log(`[OK] Staging complete! ${totalFiles} files written to: ${DIST}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
