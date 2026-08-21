const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { buildTaxonomy, validateTaxonomy } = require('../scripts/build-idea-taxonomy');

const ROOT = path.resolve(__dirname, '..');
const ideasDocument = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ideas.json'), 'utf8'));
const ideas = Array.isArray(ideasDocument) ? ideasDocument : ideasDocument.ideas;
const relationships = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'relationships.json'), 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'idea-taxonomy.json'), 'utf8'));

test('normalized taxonomy covers every canonical idea exactly once', () => {
  assert.deepEqual(validateTaxonomy(taxonomy, ideas), []);
  assert.equal(taxonomy.ideaCount, ideas.length);
  assert.equal(new Set(taxonomy.assignments.map(item => item.ideaId)).size, ideas.length);
  assert.ok(taxonomy.familyCount >= 10 && taxonomy.familyCount <= 20);
  assert.ok(taxonomy.familyCount < new Set(ideas.map(idea => idea.category)).size);
  assert.ok(taxonomy.patternCount >= 8 && taxonomy.patternCount <= 15);
  assert.equal(taxonomy.reviewQueueCount, taxonomy.reviewQueue.length);
  assert.ok(taxonomy.reviewQueue.every(item => item.reasons.length > 0));
});

test('taxonomy is a deterministic projection of ideas and relationships', () => {
  assert.deepEqual(buildTaxonomy(ideas, relationships), taxonomy);
});

test('close ideas share a market family while venture patterns preserve their distinction', () => {
  const byId = new Map(taxonomy.assignments.map(item => [item.ideaId, item]));
  const factBounty = byId.get('idea-061');
  const measureGraph = byId.get('idea-062');
  assert.equal(factBounty.familyId, measureGraph.familyId);
  assert.notEqual(factBounty.patternId, measureGraph.patternId);
  assert.ok(factBounty.secondaryPatternIds.includes(measureGraph.patternId));
  assert.ok(measureGraph.secondaryPatternIds.includes(factBounty.patternId));
  assert.notEqual(factBounty.positioning.deliverable, measureGraph.positioning.deliverable);
  assert.ok(factBounty.closestIdeas.some(item => item.ideaId === 'idea-062'));
  assert.ok(factBounty.closestIdeas.every(item => item.reasons.length > 0 && item.difference));
});

test('adjudicated identity-only duplicates are removed with a permanent receipt', () => {
  const duplicatePairs = new Set();
  for (const assignment of taxonomy.assignments) {
    const closest = assignment.closestIdeas[0];
    if (closest?.band === 'potential-duplicate') {
      duplicatePairs.add([assignment.ideaId, closest.ideaId].sort().join('|'));
      assert.equal(closest.score, 100);
      assert.match(closest.difference, /Exact normalized-name match/);
    }
  }
  assert.equal(duplicatePairs.size, 0);
  const receipt = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'idea-taxonomy-adjudications.json'), 'utf8'));
  assert.equal(receipt.removedCount, 10);
  assert.equal(receipt.nonIdentityFieldsRequiredEqual, true);
  for (const pair of receipt.pairs) {
    assert.ok(ideas.some(idea => idea.id === pair.canonicalId));
    assert.ok(!ideas.some(idea => idea.id === pair.removedDuplicateId));
  }
});

test('every classifier ambiguity has a signed semantic override note', () => {
  const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'idea-taxonomy-overrides.json'), 'utf8'));
  assert.equal(taxonomy.reviewQueueCount, 0);
  assert.equal(overrides.overrides.length, 54);
  assert.equal(taxonomy.assignments.filter(item => item.classification.method === 'MANUAL_SEMANTIC_OVERRIDE').length, 54);
  assert.ok(overrides.overrides.every(item => item.reviewNote && item.familyId && item.patternId));
});

test('directory, detail, ranking, and comparison views expose normalized differentiation', () => {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const site = fs.readFileSync(path.join(ROOT, 'assets/js/site.js'), 'utf8');
  const compare = fs.readFileSync(path.join(ROOT, 'assets/js/features/compare.js'), 'utf8');
  const rankings = fs.readFileSync(path.join(ROOT, 'assets/js/features/rankings.js'), 'utf8');
  const playwright = fs.readFileSync(path.join(ROOT, 'playwright.config.ts'), 'utf8');
  assert.match(index, /id="family"/);
  assert.match(index, /id="pattern"/);
  assert.match(index, /value="similarity"/);
  assert.match(index, /value="distinctive"/);
  assert.match(site, /Closest portfolio alternatives/);
  assert.match(site, /Potential duplicate/);
  assert.match(compare, /Core Deliverable/);
  assert.match(compare, /Closest Portfolio Alternative/);
  assert.match(rankings, /All Market Families/);
  assert.match(playwright, /python -m http\.server 8080 --directory _site/);
  assert.doesNotMatch(playwright, /npx http-server/);
});
