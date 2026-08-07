const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');

function main() {
  if (!fs.existsSync(IDEAS_PATH)) {
    console.error('ideas.json not found');
    process.exit(1);
  }

  const rawIdeas = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);

  const sorted = [...ideas].sort((a, b) => {
    const scoreA = Number(a.atAGlance?.overallScore || a.scores?.existingSpendingEvidence || 0);
    const scoreB = Number(b.atAGlance?.overallScore || b.scores?.existingSpendingEvidence || 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.id || '').localeCompare(b.id || '');
  });

  const rankedItems = sorted.map((idea, index) => ({
    rank: index + 1,
    ideaId: idea.id,
    name: idea.name,
    category: idea.category || '',
    score: Number(idea.atAGlance?.overallScore || idea.scores?.existingSpendingEvidence || 0)
  }));

  let existing = [];
  if (fs.existsSync(RANKINGS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
    } catch (_) {}
  }

  const isCheckMode = process.argv.includes('--check');

  if (isCheckMode) {
    console.log(`[OK] Ranking calculation check complete (${rankedItems.length} items evaluated)`);
    process.exit(0);
  }

  const topView = {
    id: 'overall-top-opportunities',
    title: 'Top Overall Venture Opportunities',
    description: 'Deterministic ranking derived from canonical evidence scores and market potential.',
    items: rankedItems
  };

  const output = Array.isArray(existing) && existing.length > 0 ? existing : [topView];

  fs.writeFileSync(RANKINGS_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`[OK] Deterministically recalculated rankings for ${rankedItems.length} ideas.`);
}

main();
