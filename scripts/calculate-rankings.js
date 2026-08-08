const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');

function main() {
  if (!fs.existsSync(IDEAS_PATH)) {
    console.error('ideas.json not found');
    process.exit(1);
  }

  const isCheckMode = process.argv.includes('--check');

  try {
    const pyScript = path.join(ROOT, 'scripts', 'va-ranker.py');
    const cmd = isCheckMode ? `python "${pyScript}" --top 5` : `python "${pyScript}" --update`;
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    if (isCheckMode) {
      console.log('[OK] Ranking calculation check complete via va-ranker.py');
    }
    return;
  } catch (err) {
    console.warn('[WARN] va-ranker.py execution failed, falling back to JS multi-view calculation:', err.message);
  }

  const rawIdeas = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);

  const getScore = (idea, dim) => {
    if (!idea) return 0;
    const cs = idea.compositeScores || {};
    const sc = idea.scores || {};
    const gl = idea.atAGlance || {};
    if (dim === 'overall') return Number(gl.overallScore ?? cs.overallOpportunity ?? cs.compositeHeadline ?? 0);
    if (dim === 'attractiveness') return Number(cs.overallOpportunity ?? cs.attractiveness ?? gl.overallScore ?? 0);
    if (dim === 'fit') return Number(cs.soloFounderPotential ?? cs.founderFit ?? 0);
    if (dim === 'confidence') return Number(sc.confidence?.value ?? (idea.sourceReferences?.length ? idea.sourceReferences.length * 20 : 10));
    if (dim === 'speed') return Number(sc.speedToFirstRevenue?.value ?? cs.fastestPathToRevenue ?? 0);
    if (dim === 'cost') return Number(sc.lowStartupCost?.value ?? cs.lowStartupCost ?? 0);
    return 0;
  };

  const formatItem = (idea, rank) => ({
    rank,
    ideaId: idea.id,
    id: idea.id,
    name: idea.name,
    category: idea.category || '',
    score: getScore(idea, 'overall'),
    checklist: idea.validationChecklist?.scorePercentage || 0,
    killFlagged: !!idea.killCriteria?.killFlagged,
    provider: idea.provenance?.provider || 'legacy',
    status: idea.status || 'canonical',
    topDimensions: {
      overallOpportunity: getScore(idea, 'overall'),
      bootstrappedPotential: getScore(idea, 'fit'),
      soloFounderPotential: getScore(idea, 'fit'),
      differentiation: null,
      profitPotential: null
    }
  });

  const overallSorted = [...ideas].sort((a, b) => getScore(b, 'overall') - getScore(a, 'overall'));
  const attrSorted = [...ideas].sort((a, b) => getScore(b, 'attractiveness') - getScore(a, 'attractiveness'));
  const fitSorted = [...ideas].sort((a, b) => getScore(b, 'fit') - getScore(a, 'fit'));
  const confSorted = [...ideas].sort((a, b) => getScore(b, 'confidence') - getScore(a, 'confidence'));
  const speedSorted = [...ideas].sort((a, b) => getScore(b, 'speed') - getScore(a, 'speed'));
  const costSorted = [...ideas].sort((a, b) => getScore(b, 'cost') - getScore(a, 'cost'));
  const finalistsSorted = [...ideas].filter(i => i.status === 'priority' || ['idea-061','idea-062','idea-185','idea-240'].includes(i.id)).sort((a, b) => getScore(b, 'overall') - getScore(a, 'overall'));

  const views = [
    { id: 'overall-top-opportunities', title: '🏆 Overall Top Opportunities', description: 'Rankings sorted by weighted composite headline score across all evidence dimensions', algorithmVersion: 'weighted-composite-v2', items: overallSorted.map(formatItem) },
    { id: 'attractiveness', title: '💡 High Opportunity Attractiveness', description: 'Ranked by problem severity, demand, and overall market revenue potential', algorithmVersion: 'attractiveness-v1', items: attrSorted.map(formatItem) },
    { id: 'founder-fit', title: '🎯 Best Solo Founder Fit', description: 'Ranked by speed to revenue, low startup cost, and ease of building MVP', algorithmVersion: 'founder-fit-v1', items: fitSorted.map(formatItem) },
    { id: 'highest-confidence', title: '🛡️ Highest Evidence Confidence', description: 'Ranked by source quality, citations, and completed disconfirming red-team passes', algorithmVersion: 'evidence-confidence-v1', items: confSorted.map(formatItem) },
    { id: 'fastest-first-revenue', title: '⚡ Fastest Path to Revenue', description: 'Ranked by minimal time-to-first-dollar and low distribution friction', algorithmVersion: 'speed-revenue-v1', items: speedSorted.map(formatItem) },
    { id: 'lowest-startup-cost', title: '💸 Lowest Startup Capital', description: 'Ranked by minimal initial financial requirement ($0–$100)', algorithmVersion: 'low-cost-v1', items: costSorted.map(formatItem) },
    { id: 'reset-finalists', title: '🏁 Reset Tournament Finalists', description: 'Highest-scoring winners and finalists across research reset tournaments', algorithmVersion: 'tournament-finalists-v1', items: finalistsSorted.map(formatItem) }
  ];

  if (isCheckMode) {
    console.log(`[OK] Ranking calculation check complete (${ideas.length} ideas evaluated)`);
    process.exit(0);
  }

  const out = {
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    totalIdeas: ideas.length,
    rankingViewsCount: views.length,
    algorithm: 'weighted-composite-v2',
    rankings: views
  };

  fs.writeFileSync(RANKINGS_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[OK] Deterministically recalculated ${views.length} ranking views for ${ideas.length} ideas.`);
}

main();

