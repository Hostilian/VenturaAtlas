/**
 * Staging & Allowlisting Build Script for GitHub Pages Deployment
 * Creates a clean, minimal _site directory containing only public static assets.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, '_site');

// Allowlisted root files
const ALLOW_FILES = [
  'index.html',
  '404.html',
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

// Allowlisted directories
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

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stat.isFile()) {
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log('=== Building Public GitHub Pages Staging Directory (_site) ===\n');

  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
  fs.mkdirSync(dist, { recursive: true });

  let fileCount = 0;

  for (const f of ALLOW_FILES) {
    const srcPath = path.join(root, f);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(dist, f));
      fileCount++;
    }
  }

  for (const d of ALLOW_DIRS) {
    const srcDir = path.join(root, d);
    if (fs.existsSync(srcDir)) {
      copyRecursive(srcDir, path.join(dist, d));
    }
  }

  console.log(`✅ Staging complete! Artifact written to: ${dist}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
