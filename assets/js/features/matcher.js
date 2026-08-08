/* Venture Atlas OS — Founder Matcher Feature Engine */
function initMatcher() {
  const container = document.getElementById('matchResults');
  if (!container) return;

  const ideasData = window.VA?.ideas || [];

  function budgetMatches(idea, budget) {
    const cost = idea.atAGlance?.startupCost?.midpoint || 50;
    if (budget === 'zero') return cost <= 50;
    if (budget === 'low') return cost <= 500;
    if (budget === 'mid') return cost <= 5000;
    return true;
  }

  function computeMatchScore(idea, answers) {
    let score = idea.atAGlance?.overallScore || getIdeaScore(idea, 'overall') || 50;
    if (answers.goal === 'profit') score = idea.compositeScores?.highestProfitPotential || score;
    if (answers.goal === 'confidence') score = idea.scores?.overallConfidence?.value || score;
    return score;
  }

  window.VAMatcher = {
    budgetMatches,
    computeMatchScore
  };
}

window.initMatcher = initMatcher;
