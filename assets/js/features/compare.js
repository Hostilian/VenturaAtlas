/* Venture Atlas OS — Compare Feature Matrix Engine (v2.4.0) */
function initCompare() {
  const container = document.getElementById('comparison');
  const selects = document.querySelectorAll('[data-compare-select]');
  if (!container) return;

  const ideasData = window.VA?.ideas || [];
  const base = window.VA?.base || '..';

  // Read URL query params e.g. ?ids=idea-001,idea-061
  const urlParams = new URLSearchParams(window.location.search);
  const idsQuery = urlParams.get('ids');

  // Also check stored compare IDs from localStorage if no URL query
  let initialIds = [];
  if (idsQuery) {
    initialIds = idsQuery.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    initialIds = window.VentureAtlas?.readJsonStorage('va-compare-ids', []) || [];
  }

  // Helper to extract score safely
  function getIdeaScore(idea, type) {
    if (!idea) return null;
    if (idea.atAGlance?.overallScore != null) return Number(idea.atAGlance.overallScore);
    return null;
  }

  // Populate selects
  selects.forEach((sel, idx) => {
    sel.innerHTML = `<option value="">Choose idea ${idx + 1}...</option>` +
      ideasData.map(i => `<option value="${i.id}" ${initialIds[idx] === i.id ? 'selected' : ''}>${escHTML(i.name)} (${i.id})</option>`).join('');

    sel.addEventListener('change', () => {
      updateUrlAndRender();
    });
  });

  function updateUrlAndRender() {
    const chosenIds = Array.from(selects).map(s => s.value).filter(Boolean);
    window.VentureAtlas?.writeJsonStorage('va-compare-ids', chosenIds);

    const url = new URL(window.location);
    if (chosenIds.length > 0) {
      url.searchParams.set('ids', chosenIds.join(','));
    } else {
      url.searchParams.delete('ids');
    }
    window.history.replaceState({}, '', url);

    renderMatrix(chosenIds);
  }

  function renderMatrix(chosenIds) {
    const chosenIdeas = chosenIds.map(id => ideasData.find(i => i.id === id)).filter(Boolean);

    if (chosenIdeas.length < 2) {
      container.innerHTML = `
        <div class="empty" style="padding:2.5rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
          <h3 style="margin-bottom:0.5rem">Select two to four ideas to generate a comparison matrix</h3>
          <p style="margin-bottom:1.5rem;color:var(--text2)">Compare problem severity, economics, sales/technical complexity, risks, and recommended first experiments side-by-side.</p>
          <div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap">
            <a href="${base}/docs/rankings.html" class="button secondary sm">🏆 View Top Rankings</a>
            <a href="${base}/docs/matcher.html" class="button primary sm">🎯 Find Matched Ideas</a>
          </div>
        </div>
      `;
      return;
    }

    // Determine highest score & lowest cost for metric delta highlighting
    const knownScores = chosenIdeas.map(i => getIdeaScore(i, 'overall')).filter(Number.isFinite);
    const knownCosts = chosenIdeas.map(i => Number(i.atAGlance?.startupCost?.midpoint)).filter(Number.isFinite);
    const highestScore = knownScores.length ? Math.max(...knownScores) : null;
    const lowestCost = knownCosts.length ? Math.min(...knownCosts) : null;

    const rows = [
      { 
        label: 'Overall Score', 
        getVal: i => {
          const s = i.atAGlance?.overallScore ?? getIdeaScore(i, 'overall');
          if (s == null) return `<span class="score-badge low">Not scored</span>`;
          const numS = Number(s);
          const isBest = numS === highestScore && chosenIdeas.length > 1;
          return `<span class="score-badge ${numS >= 85 ? 'high' : numS >= 70 ? 'medium' : 'low'}">${numS.toFixed(1)}</span> ${isBest ? '<span class="chip success sm">★ Best</span>' : ''}`;
        }
      },
      { 
        label: 'Attractiveness', 
        getVal: i => {
          const s = i.compositeScores?.overallOpportunity;
          return s != null ? `${s} (legacy score; scale unspecified)` : 'Not scored';
        }
      },
      { 
        label: 'Solo Founder Fit', 
        getVal: i => i.compositeScores?.soloFounderPotential != null
          ? `${i.compositeScores.soloFounderPotential} (legacy score; scale unspecified)`
          : 'Not scored'
      },
      { 
        label: 'Evidence Confidence', 
        getVal: i => `<span class="chip neutral">${Array.isArray(i.sourceReferences) ? i.sourceReferences.length : 0} public source reference(s); confidence not assessed</span>`
      },
      { label: 'Category', getVal: i => `<span class="chip status">${escHTML(i.category || 'N/A')}</span>` },
      { label: 'Target Customer', getVal: i => escHTML(i.atAGlance?.targetCustomer || i.targetCustomer || 'N/A') },
      { label: 'Problem Solved', getVal: i => escHTML(i.atAGlance?.problemSolved || i.problemSolved || 'N/A') },
      { label: 'Revenue Model', getVal: i => escHTML(i.atAGlance?.howItMakesMoney || i.howItMakesMoney || 'N/A') },
      { 
        label: 'Startup Capital', 
        getVal: i => {
          const rawCost = i.atAGlance?.startupCost?.midpoint;
          if (!Number.isFinite(Number(rawCost))) return 'Unspecified';
          const c = Number(rawCost);
          const isBestCost = lowestCost !== null && c === lowestCost && chosenIdeas.length > 1;
          return `<strong>$${c.toLocaleString()}</strong> ${isBestCost ? '<span class="chip success sm">Lowest</span>' : ''}`;
        }
      },
      { label: 'Time to MVP', getVal: i => escHTML(i.atAGlance?.timeToMvp || 'Unspecified') },
      { label: 'Time to Revenue', getVal: i => escHTML(i.atAGlance?.timeToFirstRevenue || 'Unspecified') },
      { label: 'Main Advantage', getVal: i => escHTML(i.atAGlance?.mainAdvantage || 'Not recorded') },
      { label: 'Main Risk', getVal: i => escHTML(i.atAGlance?.mainRisk || 'Not recorded') },
      { label: 'Validation Experiment', getVal: i => escHTML(i.atAGlance?.bestNextValidationStep || 'Not recorded') }
    ];

    container.innerHTML = `
      <div style="margin-bottom:1.25rem;padding:1rem 1.25rem;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem">
        <div>
          <strong style="color:var(--brand)">💡 Side-by-Side Comparison:</strong> Comparing ${chosenIdeas.length} venture opportunities.
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button id="shareCompareBtn" class="button secondary sm">🔗 Share Comparison</button>
          <button id="addCompareToRoomBtn" class="button secondary sm">👥 Add All to Room</button>
          <button id="launchPairwiseBtn" class="button primary sm">⚔️ Pairwise Vote</button>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="table-wrap desktop-ranking-table">
        <table>
          <thead>
            <tr>
              <th style="min-width:180px">Dimension</th>
              ${chosenIdeas.map(i => `
                <th style="min-width:220px">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                      <strong><a href="${base}/docs/idea.html?id=${encodeURIComponent(i.id)}">${escHTML(i.name)}</a></strong>
                      <div style="font-size:0.75rem;color:var(--muted)">${i.id}</div>
                    </div>
                    <button class="button secondary sm remove-idea-btn" data-id="${escHTML(i.id)}" title="Remove idea" style="padding:0.15rem 0.4rem;font-size:0.75rem">✕</button>
                  </div>
                </th>
              `).join('')}
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

      <!-- Mobile Cards -->
      <div class="mobile-ranking-cards" style="display:flex;flex-direction:column;gap:1rem">
        ${chosenIdeas.map(i => `
          <div class="card" style="padding:1.25rem">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
              <div>
                <span class="chip status">${escHTML(i.category || '')}</span>
                <h3 style="font-size:1.1rem;margin:0.25rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(i.id)}">${escHTML(i.name)}</a></h3>
              </div>
              <button class="button secondary sm remove-idea-btn" data-id="${escHTML(i.id)}">✕ Remove</button>
            </div>
            <p style="font-size:0.85rem;margin-bottom:0.75rem">${escHTML(i.oneSentenceConcept || '')}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.8rem;background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);margin-bottom:0.75rem">
              <div><strong>Score:</strong> ${i.atAGlance?.overallScore != null ? i.atAGlance.overallScore + '/100' : 'Not scored'}</div>
              <div><strong>Capital:</strong> ${i.atAGlance?.startupCost?.midpoint != null ? '$' + i.atAGlance.startupCost.midpoint.toLocaleString() : 'Unspecified'}</div>
              <div><strong>Time to MVP:</strong> ${escHTML(i.atAGlance?.timeToMvp || 'Unspecified')}</div>
              <div><strong>Revenue Speed:</strong> ${escHTML(i.atAGlance?.timeToFirstRevenue || 'Unspecified')}</div>
            </div>
            <a href="${base}/docs/idea.html?id=${encodeURIComponent(i.id)}" class="button primary sm" style="width:100%;text-align:center">Open Full Dossier</a>
          </div>
        `).join('')}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.remove-idea-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idToRemove = btn.dataset.id;
        selects.forEach(sel => {
          if (sel.value === idToRemove) sel.value = '';
        });
        updateUrlAndRender();
      });
    });

    const shareBtn = document.getElementById('shareCompareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            shareBtn.innerHTML = '✓ Copied Link!';
            setTimeout(() => { shareBtn.innerHTML = '🔗 Share Comparison'; }, 2000);
          });
        }
      });
    }

    const roomBtn = document.getElementById('addCompareToRoomBtn');
    if (roomBtn) {
      roomBtn.addEventListener('click', () => {
        const chosenIds = Array.from(selects).map(s => s.value).filter(Boolean);
        let shortlisted = window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || [];
        chosenIds.forEach(id => {
          if (!shortlisted.includes(id)) shortlisted.push(id);
        });
        window.VentureAtlas?.writeJsonStorage('va-room-shortlist', shortlisted);
        window.location.href = `${base}/docs/room.html`;
      });
    }

    const pairwiseBtn = document.getElementById('launchPairwiseBtn');
    if (pairwiseBtn) {
      pairwiseBtn.addEventListener('click', () => {
        const chosenIds = Array.from(selects).map(s => s.value).filter(Boolean);
        window.location.href = `${base}/docs/room.html?mode=pairwise&ideas=${chosenIds.map(encodeURIComponent).join(',')}`;
      });
    }
  }

  function escHTML(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)
    );
  }

  renderMatrix(initialIds);
}

window.initCompare = initCompare;
