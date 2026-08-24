const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('PWA Contract — Required Precache Files Exist', () => {
  const swContent = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const match = swContent.match(/const\s+REQUIRED_SHELL\s*=\s*\[([\s\S]*?)\];/);
  assert(match, 'sw.js must contain REQUIRED_SHELL array');

  const files = match[1].split(',').map(s => s.trim().replace(/['"\s]/g, '')).filter(Boolean);
  for (const relFile of files) {
    const cleanFile = relFile.replace(/^\.\//, '');
    assert(fs.existsSync(path.join(root, cleanFile)), `sw.js REQUIRED_SHELL file does not exist: ${cleanFile}`);
  }
});

test('PWA Contract — Manifest Icons Exist', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest.webmanifest must define non-empty icons array');

  for (const icon of manifest.icons) {
    const cleanSrc = icon.src.replace(/^\.\//, '');
    assert(fs.existsSync(path.join(root, cleanSrc)), `Web manifest icon missing: ${cleanSrc}`);
  }
});

test('PWA Contract — Offline Page Validation', () => {
  const offlineHtml = fs.readFileSync(path.join(root, 'offline.html'), 'utf8');
  assert(offlineHtml.toLowerCase().includes('offline'), 'offline.html must contain offline messaging');
});

test('PWA Contract — online assets refresh before the queryless offline fallback', () => {
  const swContent = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.match(swContent, /ventura-static-v\$\{CACHE_VERSION\}-\$\{DATA_REVISION\}/);
  assert.match(swContent, /caches\.match\(request, \{ ignoreSearch: true \}\)/);
  assert.match(swContent, /An online 404\/500 is still a real server response/);

  const staticBlock = swContent.slice(swContent.indexOf('// Static Assets -> Network-first'));
  const networkFetch = staticBlock.indexOf('await fetch(request)');
  const offlineFallback = staticBlock.indexOf('await caches.match(request, { ignoreSearch: true })');
  assert(networkFetch >= 0, 'static assets must attempt the network');
  assert(offlineFallback > networkFetch, 'static cache lookup must remain an offline fallback');
});

test('PWA Contract — Sitemap URLs Resolution', () => {
  const sitemapXml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert(!sitemapXml.includes('USERNAME') && !sitemapXml.includes('REPOSITORY'), 'sitemap.xml must not contain USERNAME or REPOSITORY placeholders');
});
