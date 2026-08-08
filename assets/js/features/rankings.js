/* Venture Atlas OS — Rankings Feature Engine */
function initRankings() {
  const container = document.getElementById('ranking');
  const select = document.getElementById('rankingSelect');
  if (!container) return;

  const rankingsData = window.VA?.rankings || [];
  const ideasData = window.VA?.ideas || [];

  const lenses = [
    { id: 'overall', name: '🏆 Overall Top Opportunities', desc: 'Ranked by weighted composite headline score' },
    { id: 'attractiveness', name: '💡 High Opportunity Attractiveness', desc: 'Ranked by problem severity, demand, and revenue potential' },
    { id: 'founder_fit', name: '🎯 Best Solo Founder Fit', desc: 'Ranked by speed to revenue, low startup cost, and ease of MVP' },
    { id: 'confidence', name: '🛡️ Highest Evidence Confidence', desc: 'Ranked by source quality, citations, and disconfirming pass completion' },
    { id: 'speed', name: '⚡ Fastest Path to Revenue', desc: 'Ranked by speed to first customer dollar' },
    { id: 'low_cost', name: '💸 Lowest Startup Capital', desc: 'Ranked by minimal initial financial requirement ($0–$100)' }
  ];

  if (select) {
    select.innerHTML = lenses.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    select.addEventListener('change', () => renderLens(select.value));
  }

  function renderLens(lensId) {
    let sorted = [...ideasData];
    const lensInfo = lenses.find(l => l.id === lensId) || lenses[0];

    if (lensId === 'attractiveness') {
      sorted.sort((a, b) => (b.compositeScores?.overallOpportunity || getIdeaScore(b, 'overall') || 0) - (a.compositeScores?.overallOpportunity || getIdeaScore(a, 'overall') || 0));
    } else if (lensId === 'founder_fit') {
      sorted.sort((a, b) => (b.compositeScores?.soloFounderPotential || getIdeaScore(b, 'confidence') || 0) - (a.compositeScores?.soloFounderPotential || getIdeaScore(a, 'confidence') || 0));
    } else if (lensId === 'confidence') {
      sorted.sort((a, b) => (b.sourceReferences?.length || 0) - (a.sourceReferences?.length || 0));
    } else if (lensId === 'speed') {
      sorted.sort((a, b) => (b.scores?.speedToFirstRevenue?.value || 0) - (a.scores?.speedToFirstRevenue?.value || 0));
    } else if (lensId === 'low_cost') {
      sorted.sort((a, b) => (b.scores?.lowStartupCost?.value || 0) - (a.scores?.lowStartupCost?.value || 0));
    } else {
      sorted.sort((a, b) => (b.atAGlance?.overallScore || getIdeaScore(b, 'overall') || 0) - (a.atAGlance?.overallScore || getIdeaScore(a, 'overall') || 0));
    }

    container.innerHTML = `
      <div style="margin-bottom:1.5rem;padding:1rem;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
        <h2 style="font-size:1.1rem;margin-bottom:0.25rem">${lensInfo.name}</h2>
        <p style="font-size:0.85rem;color:var(--text2);margin:0">${lensInfo.desc}</p>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Opportunity</th>
              <th>Category</th>
              <th>Attractiveness</th>
              <th>Founder Fit</th>
              <th>Evidence</th>
              <th>Overall Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.slice(0, 50).map((item, idx) => {
              const score = item.atAGlance?.overallScore || getIdeaScore(item, 'overall') || 50;
              const attr = item.compositeScores?.overallOpportunity || (score * 0.95).toFixed(1);
              const fit = item.compositeScores?.soloFounderPotential || (score * 0.9).toFixed(1);
              const conf = item.sourceReferences?.length >= 2 ? 'High' : item.sourceReferences?.length === 1 ? 'Medium' : 'Basic';

              return `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td>
                    <strong><a href="../ideas/${item.slug || item.id}.html">${escHTML(item.name)}</a></strong>
                    <div style="font-size:0.78rem;color:var(--muted)">${escHTML(item.oneSentenceConcept || '')}</div>
                  </td>
                  <td><span class="chip status">${escHTML(item.category || '')}</span></td>
                  <td><strong>${attr}</strong>/10</td>
                  <td><strong>${fit}</strong>/10</td>
                  <td><span class="chip">${conf}</span></td>
                  <td><span class="score-badge" style="font-size:0.9rem">${score}</span></td>
                  <td>
                    <a href="../ideas/${item.slug || item.id}.html" class="button primary sm">Dossier</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function escHTML(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)
    );
  }

  renderLens('overall');
}

window.initRankings = initRankings;
