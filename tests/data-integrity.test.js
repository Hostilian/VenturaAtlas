const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('Data Integrity — Unique IDs & Slugs', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'data/ideas.json'), 'utf8'));
  const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);

  const ids = new Set();
  const slugs = new Set();

  for (const item of ideas) {
    assert(!ids.has(item.id), `Duplicate idea ID: ${item.id}`);
    ids.add(item.id);

    assert(!slugs.has(item.slug), `Duplicate idea slug: ${item.slug}`);
    slugs.add(item.slug);

    if (item.atAGlance && item.atAGlance.overallScore !== undefined) {
      const score = Number(item.atAGlance.overallScore);
      assert(score >= 0 && score <= 100, `Idea ${item.id} overallScore out of bounds (0-100): ${score}`);
    }
  }
});

test('Data Integrity — Relationships Validity', () => {
  const rawIdeas = JSON.parse(fs.readFileSync(path.join(root, 'data/ideas.json'), 'utf8'));
  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);
  const validIds = new Set(ideas.map(i => i.id));

  const rawRels = JSON.parse(fs.readFileSync(path.join(root, 'data/relationships.json'), 'utf8'));
  const rels = Array.isArray(rawRels) ? rawRels : (rawRels.relationships || []);

  for (const rel of rels) {
    if (rel.source) {
      assert(validIds.has(rel.source), `Relationship references non-existent source idea ID: ${rel.source}`);
    }
    if (rel.target) {
      assert(validIds.has(rel.target), `Relationship references non-existent target idea ID: ${rel.target}`);
    }
  }
});
