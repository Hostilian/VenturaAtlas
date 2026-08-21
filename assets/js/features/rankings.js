/* Venture Atlas OS — Canonical Rankings Feature Engine (v2.4.0) */
function initRankings() {
  const container = document.getElementById('ranking');
  const select = document.getElementById('rankingSelect');
  if (!container) return;

  const rawRankings = window.VA?.rankings || [];
  const rankingViews = Array.isArray(rawRankings) ? rawRankings : (rawRankings.rankings || []);
  const ideasData = window.VA?.ideas || [];
  const ideasMap = new Map(ideasData.map(i => [i.id, i]));
  const taxonomyByIdea = window.VA?.taxonomyByIdea || new Map();

  if (!rankingViews || rankingViews.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:2rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
        <h3>No Ranking Views Loaded</h3>
        <p style="color:var(--text2)">Unable to load canonical ranking views. Please check data connection.</p>
      </div>
    `;
    return;
  }

  // Populate ranking dropdown selector dynamically
  if (select) {
    select.innerHTML = rankingViews.map(v => 
      `<option value="${escHTML(v.id)}">${escHTML(v.title || v.id)} (${v.items?.length || 0} ideas)</option>`
    ).join('');
  }

  // Parse URL query parameter ?ranking=<id>
  function getQueryRanking() {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('ranking');
    if (paramId && rankingViews.some(v => v.id === paramId)) {
      return paramId;
    }
    return rankingViews[0]?.id || 'overall-top-opportunities';
  }

  let activeRankingId = getQueryRanking();
  if (select) select.value = activeRankingId;

  // Filter & Search states
  let searchQuery = '';
  let selectedFamily = 'all';
  let selectedLimit = 50;

  function renderActiveView() {
    const view = rankingViews.find(v => v.id === activeRankingId) || rankingViews[0];
    if (!view) return;

    // Filter items
    let filteredItems = (view.items || []).map(item => {
      const fullIdea = ideasMap.get(item.ideaId || item.id) || {};
      const taxonomy = taxonomyByIdea.get(fullIdea.id) || null;
      const eligibilityIssues = [];
      if (['candidate', 'staged'].includes(String(fullIdea.status || item.status || '').toLowerCase())) eligibilityIssues.push('candidate/staged');
      if (item.killFlagged || fullIdea.killCriteria?.killFlagged) eligibilityIssues.push('kill flagged');
      if (!Array.isArray(fullIdea.sourceReferences) || fullIdea.sourceReferences.length === 0) eligibilityIssues.push('no public evidence source');
      if (fullIdea.rankingEligibility?.eligible !== true) eligibilityIssues.push('eligibility not established');
      return {
        ...item,
        fullIdea,
        category: item.category || fullIdea.category || 'Uncategorized',
        family: taxonomy?.familyLabel || item.category || fullIdea.category || 'Uncategorized',
        pattern: taxonomy?.patternLabel || fullIdea.subcategory || 'Unclassified',
        name: item.name || fullIdea.name || item.ideaId,
        score: item.score ?? fullIdea.atAGlance?.overallScore ?? null,
        concept: fullIdea.oneSentenceConcept || '',
        eligibilityIssues
      };
    });

    // Normalized families replace the fragmented raw category list as the primary filter.
    const families = Array.from(new Set(filteredItems.map(i => i.family))).filter(Boolean).sort();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q) ||
        i.family.toLowerCase().includes(q) ||
        i.pattern.toLowerCase().includes(q) ||
        i.concept.toLowerCase().includes(q) ||
        (i.ideaId && i.ideaId.toLowerCase().includes(q))
      );
    }

    if (selectedFamily !== 'all') {
      filteredItems = filteredItems.filter(i => i.family === selectedFamily);
    }

    const totalMatching = filteredItems.length;
    const itemsToDisplay = selectedLimit === 'all' ? filteredItems : filteredItems.slice(0, Number(selectedLimit));
    const base = window.VA?.base || '..';
    const scoreBreakdown = (item) => {
      const dimensions = item.topDimensions && typeof item.topDimensions === 'object'
        ? Object.entries(item.topDimensions).filter(([, value]) => value !== null && value !== undefined)
        : [];
      const maturity = item.rankingMaturity || 'legacy_unverified';
      const evidence = item.rankingEligible === true ? 'Eligibility established' : 'Eligibility unproven';
      return `<details class="score-breakdown" style="margin-top:0.45rem">
        <summary style="cursor:pointer;font-size:0.78rem;color:var(--text2)">View score breakdown</summary>
        <div role="region" aria-label="Score breakdown for ${escHTML(item.name)}" style="margin-top:0.4rem;padding:0.55rem;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius-sm);font-size:0.76rem">
          <div><strong>Stored score:</strong> ${escHTML(item.score ?? 'N/A')} · <strong>Maturity:</strong> ${escHTML(maturity)} · <strong>${escHTML(evidence)}</strong></div>
          ${dimensions.length ? `<ul style="margin:0.4rem 0 0 1.1rem">${dimensions.map(([key, value]) => `<li><strong>${escHTML(key)}:</strong> ${escHTML(value)}</li>`).join('')}</ul>` : '<p style="margin:0.4rem 0 0;color:var(--text2)">No component dimensions were stored for this legacy view.</p>'}
          <p style="margin:0.45rem 0 0;color:var(--text2)">This is a reproducible legacy heuristic, not a verified commercial recommendation.</p>
        </div>
      </details>`;
    };

    container.innerHTML = `
      <div class="ranking-header" style="margin-bottom:1.25rem;padding:1.25rem;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <h2 style="font-size:1.25rem;margin-bottom:0.35rem;display:flex;align-items:center;gap:0.5rem">
              <span>🏆 ${escHTML(view.title)}</span>
              <span class="chip primary sm">Lens v2.4</span>
            </h2>
            <p style="font-size:0.9rem;color:var(--text2);margin-bottom:0.5rem">${escHTML(view.description || '')}</p>
            <p role="note" style="font-size:0.82rem;color:var(--score-lo);margin-bottom:0.5rem"><strong>Legacy heuristic:</strong> this stored view does not enforce the current evidence, kill-criteria, coverage, or scale eligibility contract. Items remain visible for provenance and are flagged until eligibility is established.</p>
            <p role="status" style="font-size:0.82rem;color:var(--score-lo);margin-bottom:0.5rem"><strong>Commercial boundary:</strong> no purchase evidence collected. Rankings are not commercial recommendations.</p>
            <div style="display:flex;gap:0.75rem;font-size:0.8rem;color:var(--muted);flex-wrap:wrap">
              <span><strong>Algorithm:</strong> ${escHTML(view.algorithmVersion || 'weighted-composite-v2')}</span>
              <span>•</span>
              <span><strong>Total Items:</strong> ${view.items?.length || 0}</span>
              <span>•</span>
              <span><strong>Matching:</strong> ${totalMatching}</span>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button id="shareRankingBtn" class="button secondary sm" style="display:inline-flex;align-items:center;gap:0.4rem">
              <span>🔗</span> Share Ranking
            </button>
            <button id="toggleWeightModalBtn" class="button secondary sm" style="display:inline-flex;align-items:center;gap:0.4rem">
              <span>⚙️</span> View Scoring Weights
            </button>
          </div>
        </div>

        <div class="ranking-filters" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:0.75rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)">
          <input type="text" id="rankingSearchInput" placeholder="Search ideas or categories..." value="${escHTML(searchQuery)}" aria-label="Search rankings" style="padding:0.4rem 0.6rem;font-size:0.85rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
          <select id="rankingCategoryFilter" aria-label="Filter by normalized market family" style="padding:0.4rem 0.6rem;font-size:0.85rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
            <option value="all">All Market Families (${families.length})</option>
            ${families.map(family => `<option value="${escHTML(family)}" ${family === selectedFamily ? 'selected' : ''}>${escHTML(family)}</option>`).join('')}
          </select>
          <select id="rankingLimitSelect" aria-label="Items per view" style="padding:0.4rem 0.6rem;font-size:0.85rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
            <option value="25" ${selectedLimit == 25 ? 'selected' : ''}>Show Top 25</option>
            <option value="50" ${selectedLimit == 50 ? 'selected' : ''}>Show Top 50</option>
            <option value="100" ${selectedLimit == 100 ? 'selected' : ''}>Show Top 100</option>
            <option value="all" ${selectedLimit === 'all' ? 'selected' : ''}>Show All (${totalMatching})</option>
          </select>
        </div>
      </div>

      <div id="weightInfoBox" style="display:none;margin-bottom:1.25rem;padding:1rem;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);font-size:0.85rem">
        <h4 style="margin-bottom:0.4rem">💡 Transparent Scoring Methodology</h4>
        <p style="color:var(--text2);margin-bottom:0.5rem">The current ranking engine combines eight legacy dimensions: overall opportunity (25%), bootstrapped potential (15%), solo-founder potential (15%), fastest path to revenue (10%), confidence (10%), differentiation (10%), profit potential (10%), and distribution (5%). Coverage and evidence limitations can make records incomparable.</p>
      </div>

      ${itemsToDisplay.length === 0 ? `
        <div style="padding:2rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
          <p style="color:var(--text2)">No ideas match the selected search filter.</p>
        </div>
      ` : `
        <!-- Desktop Workspace Table -->
        <div class="table-wrap desktop-ranking-table">
          <table>
            <thead>
              <tr>
                <th style="width:60px">Rank</th>
                <th>Idea &amp; Concept</th>
                <th>Family &amp; Type</th>
                <th style="width:100px">Score</th>
                <th style="width:100px">Evidence</th>
                <th style="width:200px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToDisplay.map((item, idx) => {
                const ideaId = item.ideaId || item.id;
                const scoreVal = typeof item.score === 'number' ? item.score.toFixed(1) : (item.score ?? 'N/A');
                const ideaUrl = `${base}/docs/idea.html?id=${encodeURIComponent(ideaId)}`;
                const isFav = isFavorite(ideaId);

                return `
                  <tr>
                    <td><strong>#${item.rank || (idx + 1)}</strong></td>
                    <td>
                      <div>
                        <strong><a href="${ideaUrl}" class="ranking-idea-link" data-id="${escHTML(ideaId)}">${escHTML(item.name)}</a></strong>
                        ${item.killFlagged ? '<span class="chip danger sm" style="margin-left:0.4rem">⚠ Kill Flagged</span>' : ''}
                        ${item.eligibilityIssues.length ? `<span class="chip warn sm" style="margin-left:0.4rem" title="${escHTML(item.eligibilityIssues.join(', '))}">Eligibility unproven</span>` : '<span class="chip success sm">Eligible</span>'}
                      </div>
                      ${item.concept ? `<div style="font-size:0.8rem;color:var(--text2);margin-top:0.15rem">${escHTML(item.concept)}</div>` : ''}
                    </td>
                    <td><span class="chip status">${escHTML(item.family)}</span><br><span class="muted">${escHTML(item.pattern)}</span></td>
                    <td><span class="score-badge ${getScoreClass(item.score)}" title="Click to view score breakdown">${scoreVal}</span></td>
                    <td><span class="chip neutral">${Number.isFinite(Number(item.checklist)) ? Number(item.checklist) + '% checklist' : 'Not assessed'}</span></td>
                    <td style="text-align:right">
                      <div style="display:inline-flex;gap:0.3rem;align-items:center;justify-content:flex-end">
                        <a href="${ideaUrl}" class="button primary sm" title="Open complete idea dossier">Open</a>
                        <button class="button secondary sm btn-fav" data-id="${escHTML(ideaId)}" title="Toggle favorite">${isFav ? '★' : '☆'}</button>
                        <button class="button secondary sm btn-compare" data-id="${escHTML(ideaId)}" title="Add to comparison">Compare</button>
                        <button class="button secondary sm btn-room" data-id="${escHTML(ideaId)}" title="Add to Room shortlist">+ Room</button>
                      </div>
                    </td>
                  </tr>
                  <tr class="score-breakdown-row"><td colspan="6">${scoreBreakdown(item)}</td></tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="mobile-ranking-cards" style="display:flex;flex-direction:column;gap:0.75rem">
          ${itemsToDisplay.map((item, idx) => {
            const ideaId = item.ideaId || item.id;
            const scoreVal = typeof item.score === 'number' ? item.score.toFixed(1) : (item.score ?? 'N/A');
            const ideaUrl = `${base}/docs/idea.html?id=${encodeURIComponent(ideaId)}`;

            return `
              <div class="card" style="padding:1rem">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.4rem">
                  <span style="font-weight:bold;font-size:0.9rem;color:var(--brand)">#${item.rank || (idx + 1)}</span>
                  <span class="score-badge ${getScoreClass(item.score)}">${scoreVal}</span>
                </div>
                <h3 style="font-size:1rem;margin-bottom:0.3rem">
                  <a href="${ideaUrl}">${escHTML(item.name)}</a>
                </h3>
                <div style="font-size:0.8rem;color:var(--text2);margin-bottom:0.5rem">${escHTML(item.concept)}</div>
                <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;margin-bottom:0.75rem">
                  <span class="chip status">${escHTML(item.family)}</span>
                  <span class="chip">${escHTML(item.pattern)}</span>
                  ${item.killFlagged ? '<span class="chip danger sm">⚠ Kill Flagged</span>' : ''}
                  ${item.eligibilityIssues.length ? `<span class="chip warn sm" title="${escHTML(item.eligibilityIssues.join(', '))}">Eligibility unproven</span>` : '<span class="chip success sm">Eligible</span>'}
                  <span class="chip neutral">${Number.isFinite(Number(item.checklist)) ? Number(item.checklist) + '% checklist' : 'Not assessed'}</span>
                </div>
                ${scoreBreakdown(item)}
                <div style="display:flex;gap:0.4rem">
                  <a href="${ideaUrl}" class="button primary sm" style="flex:1;text-align:center">Open Dossier</a>
                  <button class="button secondary sm btn-compare" data-id="${escHTML(ideaId)}">Compare</button>
                  <button class="button secondary sm btn-room" data-id="${escHTML(ideaId)}">+ Room</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    bindEvents();
  }

  function bindEvents() {
    const searchInput = document.getElementById('rankingSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderActiveView();
      });
    }

    const catFilter = document.getElementById('rankingCategoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        selectedFamily = e.target.value;
        renderActiveView();
      });
    }

    const limitSelect = document.getElementById('rankingLimitSelect');
    if (limitSelect) {
      limitSelect.addEventListener('change', (e) => {
        selectedLimit = e.target.value;
        renderActiveView();
      });
    }

    const shareBtn = document.getElementById('shareRankingBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?ranking=${encodeURIComponent(activeRankingId)}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            shareBtn.innerHTML = '<span>✓</span> Copied Link!';
            setTimeout(() => { shareBtn.innerHTML = '<span>🔗</span> Share Ranking'; }, 2000);
          });
        }
      });
    }

    const weightBtn = document.getElementById('toggleWeightModalBtn');
    if (weightBtn) {
      weightBtn.addEventListener('click', () => {
        const box = document.getElementById('weightInfoBox');
        if (box) {
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
        }
      });
    }

    // Delegation for Action Buttons
    container.addEventListener('click', (e) => {
      const compareBtn = e.target.closest('.btn-compare');
      if (compareBtn) {
        const id = compareBtn.dataset.id;
        let selected = window.VentureAtlas?.readJsonStorage('va-compare-ids', []) || [];
        if (!selected.includes(id)) {
          selected.push(id);
          window.VentureAtlas?.writeJsonStorage('va-compare-ids', selected);
        }
        window.location.href = `${window.VA?.base || '..'}/docs/compare.html?ids=${selected.map(encodeURIComponent).join(',')}`;
        return;
      }

      const favBtn = e.target.closest('.btn-fav');
      if (favBtn) {
        const id = favBtn.dataset.id;
        toggleFavorite(id);
        renderActiveView();
        return;
      }

      const roomBtn = e.target.closest('.btn-room');
      if (roomBtn) {
        const id = roomBtn.dataset.id;
        let shortlisted = window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || [];
        if (!shortlisted.includes(id)) {
          shortlisted.push(id);
          window.VentureAtlas?.writeJsonStorage('va-room-shortlist', shortlisted);
        }
        window.location.href = `${window.VA?.base || '..'}/docs/room.html`;
        return;
      }
    });
  }

  // Handle dropdown view switching
  if (select) {
    select.addEventListener('change', (e) => {
      activeRankingId = e.target.value;
      const url = new URL(window.location);
      url.searchParams.set('ranking', activeRankingId);
      window.history.pushState({}, '', url);
      renderActiveView();
    });
  }

  // Handle popstate for back/forward navigation
  window.addEventListener('popstate', () => {
    activeRankingId = getQueryRanking();
    if (select) select.value = activeRankingId;
    renderActiveView();
  });

  function isFavorite(id) {
    const favs = window.VentureAtlas?.readJsonStorage('va-favorites', []) || [];
    return favs.includes(id);
  }

  function toggleFavorite(id) {
    let favs = window.VentureAtlas?.readJsonStorage('va-favorites', []) || [];
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
    } else {
      favs.push(id);
    }
    window.VentureAtlas?.writeJsonStorage('va-favorites', favs);
  }

  function getScoreClass(score) {
    const s = Number(score || 0);
    if (s >= 85) return 'high';
    if (s >= 70) return 'medium';
    return 'low';
  }

  function escHTML(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)
    );
  }

  renderActiveView();
}

window.initRankings = initRankings;
