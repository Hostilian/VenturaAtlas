const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Ranking and collaboration UI do not claim missing evidence or realtime sync', () => {
  const rankings = fs.readFileSync(path.join(ROOT, 'assets/js/features/rankings.js'), 'utf8');
  const compare = fs.readFileSync(path.join(ROOT, 'assets/js/features/compare.js'), 'utf8');
  const site = fs.readFileSync(path.join(ROOT, 'assets/js/site.js'), 'utf8');
  const collaboration = fs.readFileSync(path.join(ROOT, 'docs/collaboration.html'), 'utf8');
  const collaborationJs = fs.readFileSync(path.join(ROOT, 'assets/js/features/collaboration.js'), 'utf8');
  assert.ok(!rankings.includes("item.checklist ? item.checklist + '%' : 'Verified'"));
  assert.match(rankings, /Number\.isFinite\(Number\(item\.checklist\)\)/);
  assert.match(rankings, /Legacy heuristic:/);
  assert.match(rankings, /no purchase evidence collected/);
  assert.ok((rankings.match(/Eligibility unproven/g) || []).length >= 2, 'desktop and mobile rankings must disclose eligibility');
  assert.ok(!rankings.includes('fullIdea.atAGlance?.overallScore ?? 0'));
  assert.match(rankings, /View score breakdown/);
  assert.match(rankings, /legacy_unverified/);
  assert.match(rankings, /No component dimensions were stored/);
  assert.ok(!compare.includes('High (Verified)'));
  assert.ok(!compare.includes('startupCost?.midpoint ?? 500'));
  assert.ok(!compare.includes('startupCost?.midpoint ?? 50'));
  assert.ok(!site.includes('if (v <= 10) v = v * 10'));
  assert.ok(!site.includes('const overall = x.atAGlance?.overallScore ?? 0'));
  assert.match(site, /const sourcesCount = citedSourceIds\.size;/, 'idea details must count distinct cited source IDs');
  assert.match(site, /const sourceMap = new Map/, 'idea details must resolve public citation metadata');
  assert.match(site, /target="_blank" rel="noopener noreferrer"/, 'external citation links must be safely linked');
  assert.ok(!collaboration.includes('Realtime Friend Collaboration Rooms'));
  assert.match(collaboration, /does not synchronize state/i);
  assert.match(collaborationJs, /does not synchronize/i);
  assert.doesNotMatch(collaborationJs, /Copy Invite Link|Get Share Link|Joining existing room|Live results for all members|invite friends/i);
  assert.doesNotMatch(collaborationJs, /Hidden until poll completes/i);
  assert.match(site, /NOT PROVEN · LEGACY LABEL:/);
});

test('Home labels the top-score order as legacy and eligibility-unproven', () => {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(home, /Legacy heuristic order only/i);
  assert.match(home, /eligibility, evidence coverage, and score-scale comparability are not established/i);
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
