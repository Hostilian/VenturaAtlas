#!/usr/bin/env node
/**
 * scripts/merge-reset-xviii-ideas.js
 *
 * Merges data/reset-xviii-ideas-ingest.json into data/ideas.json.
 * Idempotent: skips any idea whose ID already exists.
 *
 * Usage:
 *   node scripts/merge-reset-xviii-ideas.js
 */

const fs = require('fs');
const path = require('path');

const IDEAS_PATH = path.join(__dirname, '..', 'data', 'ideas.json');
const INGEST_PATH = path.join(__dirname, '..', 'data', 'reset-xviii-ideas-ingest.json');

console.log('Loading ideas.json...');
const ideasData = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));

console.log('Loading reset-xviii-ideas-ingest.json...');
const ingestData = JSON.parse(fs.readFileSync(INGEST_PATH, 'utf8'));

const existingIds = new Set(ideasData.ideas.map(i => i.id));
let added = 0;
let skipped = 0;

for (const idea of ingestData.ideas) {
  if (existingIds.has(idea.id)) {
    console.log(`  SKIP (already exists): ${idea.id} — ${idea.name}`);
    skipped++;
  } else {
    ideasData.ideas.push(idea);
    existingIds.add(idea.id);
    console.log(`  ADD: ${idea.id} — ${idea.name}`);
    added++;
  }
}

if (added > 0) {
  console.log(`\nWriting updated ideas.json (${added} added, ${skipped} skipped)...`);
  fs.writeFileSync(IDEAS_PATH, JSON.stringify(ideasData, null, 2), 'utf8');
  console.log('Done.');
} else {
  console.log('\nNo new ideas to add. ideas.json unchanged.');
}
