const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Ranking and collaboration UI do not claim missing evidence or realtime sync', () => {
  const rankings = fs.readFileSync(path.join(ROOT, 'assets/js/features/rankings.js'), 'utf8');
  const compare = fs.readFileSync(path.join(ROOT, 'assets/js/features/compare.js'), 'utf8');
  const collaboration = fs.readFileSync(path.join(ROOT, 'docs/collaboration.html'), 'utf8');
  assert.ok(!rankings.includes("item.checklist ? item.checklist + '%' : 'Verified'"));
  assert.match(rankings, /Number\.isFinite\(Number\(item\.checklist\)\)/);
  assert.ok(!compare.includes('High (Verified)'));
  assert.ok(!compare.includes('startupCost?.midpoint ?? 500'));
  assert.ok(!compare.includes('startupCost?.midpoint ?? 50'));
  assert.ok(!collaboration.includes('Realtime Friend Collaboration Rooms'));
  assert.match(collaboration, /does not synchronize state/i);
});

test('Matcher preserves missing cost and score instead of inventing neutral defaults', () => {
  const source = fs.readFileSync(path.join(ROOT, 'assets/js/features/matcher.js'), 'utf8');
  const context = {
    window: { VA: { ideas: [] } },
    document: { getElementById: () => ({}) },
    getIdeaScore: () => null
  };
  vm.runInNewContext(source, context);
  context.window.initMatcher();
  assert.equal(context.window.VAMatcher.budgetMatches({ atAGlance: {} }, 'low'), false);
  assert.equal(context.window.VAMatcher.computeMatchScore({ atAGlance: {}, compositeScores: {}, scores: {} }, { goal: 'confidence' }), null);
  assert.equal(context.window.VAMatcher.computeMatchScore({ atAGlance: { overallScore: 0 }, compositeScores: {}, scores: {} }, { goal: 'growth' }), 0);
});
