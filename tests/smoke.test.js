const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('Smoke Test — Required Files Existence', () => {
  const requiredFiles = [
    'index.html',
    'offline.html',
    'sw.js',
    'manifest.webmanifest',
    'sitemap.xml',
    'robots.txt',
    'assets/css/site.css',
    'assets/css/home.css',
    'assets/js/site.js',
    'assets/js/home.js',
    'data/ideas.json',
    'data/repository-meta.json',
    'data/categories.json',
    'data/sources.json',
    'data/rankings.json',
    'docs/idea.html'
  ];

  for (const file of requiredFiles) {
    assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);
  }
});

test('Smoke Test — Idea Data Integrity', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'data/ideas.json'), 'utf8'));
  const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);

  assert(ideas.length >= 180, `Expected at least 180 canonical ideas, got ${ideas.length}`);
  assert(ideas.every(x => x.id && x.name && x.category && x.slug), 'All ideas must have id, name, category, and slug');
});

test('Smoke Test — HTML Content Checks', () => {
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8').toLowerCase();
  assert(indexHtml.includes('directory'), 'index.html should include directory section');
  assert(indexHtml.includes('assets/js/home.js'), 'index.html should import assets/js/home.js');
});
