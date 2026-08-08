/* Venture Atlas OS — Compare Feature Matrix */
function initCompare() {
  const container = document.getElementById('comparison');
  const selects = document.querySelectorAll('[data-compare-select]');
  if (!container) return;

  const ideasData = window.VA?.ideas || [];

  selects.forEach((sel, idx) => {
    sel.innerHTML = `<option value="">Choose idea ${idx + 1}...</option>` +
      ideasData.map(i => `<option value="${i.id}">${i.name} (${i.id})</option>`).join('');

    sel.addEventListener('change', renderMatrix);
  });

  // Read URL query params e.g. ?ids=idea-001,idea-061
  const urlParams = new URLSearchParams(window.location.search);
  const idsQuery = urlParams.get('ids');
  if (idsQuery) {
    const selectedIds = idsQuery.split(',').map(s => s.trim()).filter(Boolean);
    selectedIds.forEach((id, idx) => {
      if (selects[idx]) {
        selects[idx].value = id;
      }
    });
  }

  function renderMatrix() {
    const chosenIds = Array.from(selects).map(s => s.value).filter(Boolean);
    const chosenIdeas = chosenIds.map(id => ideasData.find(i => i.id === id)).filter(Boolean);

    if (chosenIdeas.length < 2) {
      container.innerHTML = `
        <div class="empty">
          <strong>Select at least two ideas above to generate a decision comparison matrix.</strong>
          <p style="margin-top:0.5rem;font-size:0.875rem;color:var(--muted)">Compare problem severity, economics, sales/technical complexity, risks, and recommended first experiments side-by-side.</p>
        </div>
      `;
      return;
    }

    const rows = [
      { label: 'Overall Score', getVal: i => `<strong>${i.atAGlance?.overallScore || getIdeaScore(i, 'overall') || 50}/100</strong>` },
      { label: 'Opportunity Attractiveness', getVal: i => `${i.compositeScores?.overallOpportunity || (getIdeaScore(i, 'overall') * 0.95).toFixed(1)}/10` },
      { label: 'Founder Fit', getVal: i => `${i.compositeScores?.soloFounderPotential || (getIdeaScore(i, 'overall') * 0.9).toFixed(1)}/10` },
      { label: 'Evidence Confidence', getVal: i => i.sourceReferences?.length >= 2 ? 'High (Verified)' : 'Basic' },
      { label: 'Target Customer', getVal: i => i.atAGlance?.targetCustomer || i.targetCustomer || 'N/A' },
      { label: 'Problem Solved', getVal: i => i.atAGlance?.problemSolved || i.problemSolved || 'N/A' },
      { label: 'Revenue Model', getVal: i => i.atAGlance?.howItMakesMoney || i.howItMakesMoney || 'N/A' },
      { label: 'Startup Capital Needed', getVal: i => `$${(i.atAGlance?.startupCost?.midpoint || 50).toLocaleString()}` },
      { label: 'Time to MVP', getVal: i => i.atAGlance?.timeToMvp || '3-7 days' },
      { label: 'Time to First Revenue', getVal: i => i.atAGlance?.timeToFirstRevenue || '1-4 weeks' },
      { label: 'Main Advantage', getVal: i => i.atAGlance?.mainAdvantage || 'Low capital requirements' },
      { label: 'Main Risk', getVal: i => i.atAGlance?.mainRisk || 'Initial customer acquisition effort' },
      { label: '7-Day Validation Experiment', getVal: i => i.atAGlance?.bestNextValidationStep || 'Outreach to 25 prospective ICP buyers' }
    ];

    container.innerHTML = `
      <div style="margin-bottom:1.5rem;padding:1rem;background:var(--accent-l);border:1px solid var(--accent);border-radius:var(--radius)">
        <strong style="color:var(--accent-h)">💡 Decision Comparison Insight:</strong> Comparing ${chosenIdeas.length} opportunities. Notice how startup capital requirements and distribution channels differ across options.
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="min-width:180px">Dimension</th>
              ${chosenIdeas.map(i => `<th style="min-width:220px"><strong>${escHTML(i.name)}</strong><br><span style="font-size:0.75rem;color:var(--muted)">${i.id}</span></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td><strong>${row.label}</strong></td>
                ${chosenIdeas.map(i => `<td>${row.getVal(i)}</td>`).join('')}
              </tr>
            `).join('')}
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

  renderMatrix();
}

window.initCompare = initCompare;
