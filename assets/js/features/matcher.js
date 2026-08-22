/* Venture Atlas OS — Founder Matcher Feature Engine */
function initMatcher() {
  const container = document.getElementById('matchResults');
  if (!container) return;

  const ideasData = window.VA?.ideas || [];

  function budgetMatches(idea, budget) {
    const cost = idea.atAGlance?.startupCost?.midpoint;
    if (!Number.isFinite(Number(cost))) return false;
    if (budget === 'zero') return cost <= 50;
    if (budget === 'low') return cost <= 500;
    if (budget === 'mid') return cost <= 5000;
    return true;
  }

  function computeMatchScore(idea, answers) {
    const overall = idea.atAGlance?.overallScore ?? getIdeaScore(idea, 'overall');
    let score = Number.isFinite(Number(overall)) ? Number(overall) : null;
    const profit = idea.compositeScores?.highestProfitPotential;
    const confidence = idea.scores?.overallConfidence?.value;
    if (answers.goal === 'profit') score = Number.isFinite(Number(profit)) ? Number(profit) : null;
    if (answers.goal === 'confidence') score = Number.isFinite(Number(confidence)) ? Number(confidence) : null;
    return score;
  }

  function shortlistMatches(ideaIds) {
    if (window.VAStudio?.store && Array.isArray(ideaIds)) {
      ideaIds.forEach(id => window.VAStudio.store.addToShortlist(id, 'interesting'));
    }
  }

  window.VAMatcher = {
    budgetMatches,
    computeMatchScore,
    shortlistMatches
  };
}

window.initMatcher = initMatcher;
