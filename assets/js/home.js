/**
 * Venture Atlas OS — home.js
 * Index page interactive enhancements (Mobile nav, quick-filter chips, spotlight, category browser).
 */
(function() {
  'use strict';

  // Mobile nav toggle (handled centrally in site.js)
  function initMobileNav() {
    if (typeof window.initMobileNav === 'function') {
      window.initMobileNav();
    }
  }

  // Quick-filter chips
  let activeChips = {};

  function applyChipFilters() {
    const search = document.getElementById('search');
    const status = document.getElementById('status');

    const tags = Object.entries(activeChips)
      .filter(([, v]) => v && v.type === 'tag')
      .map(([, v]) => v.value).join(' ');

    if (tags && search) {
      search.value = tags;
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const statusChip = Object.entries(activeChips).find(([, v]) => v && v.type === 'status');
    if (statusChip && status) {
      status.value = statusChip[1].value;
      status.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const clearChips = document.getElementById('clearChips');
    const hasActive = Object.values(activeChips).some(Boolean);
    if (clearChips) clearChips.style.display = hasActive ? 'inline-flex' : 'none';
  }

  function initChips() {
    const chipRow = document.getElementById('chipRow');
    const clearChips = document.getElementById('clearChips');

    if (chipRow) {
      chipRow.addEventListener('click', e => {
        const chip = e.target.closest('.chip[data-chip-tag], .chip[data-chip-cost], .chip[data-chip-speed], .chip[data-chip-status]');
        if (!chip) return;
        const wasActive = chip.classList.contains('active');
        chip.classList.toggle('active', !wasActive);

        const key = chip.dataset.chipTag || chip.dataset.chipCost || chip.dataset.chipSpeed || chip.dataset.chipStatus;
        const type = chip.dataset.chipTag ? 'tag' : chip.dataset.chipCost ? 'cost' : chip.dataset.chipSpeed ? 'speed' : 'status';
        activeChips[key] = wasActive ? null : { type, value: key };
        applyChipFilters();
      });
    }

    if (clearChips) {
      clearChips.addEventListener('click', () => {
        document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
        activeChips = {};
        const s = document.getElementById('search');
        const st = document.getElementById('status');
        if (s) { s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); }
        if (st) { st.value = ''; st.dispatchEvent(new Event('change', { bubbles: true })); }
        clearChips.style.display = 'none';
      });
    }
  }

  // Spotlight Feature
  function renderSpotlight(idea) {
    if (!idea) return;
    const card = document.getElementById('spotlightCard');
    const loading = document.getElementById('spotlightLoading');
    if (loading) loading.style.display = 'none';
    if (!card) return;
    card.style.display = 'block';

    const name = document.getElementById('spotlightName');
    const cat = document.getElementById('spotlightCategory');
    const prob = document.getElementById('spotlightProblem');
    const cust = document.getElementById('spotlightCustomer');
    const link = document.getElementById('spotlightLink');
    const scores = document.getElementById('spotlightScores');

    if (name) name.textContent = idea.name || idea.title || 'Unknown Idea';
    if (cat) cat.textContent = idea.category || '';
    if (prob) {
      const desc = idea.oneSentenceConcept || idea.problem || idea.description || '';
      prob.textContent = desc.length > 220 ? desc.slice(0, 220) + '…' : desc;
    }
    if (cust) {
      const custText = idea.customer || idea.target_customer || idea.atAGlance?.targetCustomer || 'See dossier';
      cust.innerHTML = `<strong>Target customer:</strong> `;
      cust.appendChild(document.createTextNode(custText));
    }
    if (link) {
      const slug = idea.slug || idea.id || (idea.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.href = `./docs/idea.html?id=${encodeURIComponent(slug)}`;
    }

    if (scores) {
      const getScore = window.VentureAtlas?.getIdeaScore || ((i, d) => i.atAGlance?.[d] || null);
      const dims = [
        { key: 'overall', label: 'Overall' },
        { key: 'market', label: 'Market' },
        { key: 'confidence', label: 'Confidence' },
        { key: 'profit', label: 'Profit' }
      ];
      scores.innerHTML = '';
      dims.forEach(d => {
        const val = getScore(idea, d.key);
        const hasVal = val !== null && val !== undefined;
        const pct = hasVal ? Math.min(100, Math.max(0, val)) : 0;
        const displayScore = hasVal ? Math.round(pct) : 'N/A';
        const color = !hasVal ? 'var(--muted)' : pct >= 80 ? 'var(--score-hi)' : pct >= 60 ? 'var(--score-md)' : 'var(--score-lo)';

        const div = document.createElement('div');
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:2px';
        header.innerHTML = `<span style="color:var(--muted)">${d.label}</span><span style="color:${color};font-weight:700">${displayScore}</span>`;

        const bar = document.createElement('div');
        bar.className = 'score-bar-mini';
        const fill = document.createElement('div');
        fill.className = 'score-bar-mini-fill';
        fill.style.width = `${pct}%`;
        fill.style.background = color;
        bar.appendChild(fill);

        div.appendChild(header);
        div.appendChild(bar);
        scores.appendChild(div);
      });
    }
  }

  function pickSpotlight() {
    const rawIdeas = window.VA && window.VA.ideas;
    const allIdeas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas && rawIdeas.ideas ? rawIdeas.ideas : []);
    const canonicalIdeas = allIdeas.filter(i => i.status !== 'staged' && !(i.id && i.id.startsWith('candidate-')));
    if (!canonicalIdeas.length) {
      const loading = document.getElementById('spotlightLoading');
      if (loading) loading.textContent = 'No canonical ideas available.';
      return;
    }
    const pick = canonicalIdeas[Math.floor(Math.random() * canonicalIdeas.length)];
    renderSpotlight(pick);
  }

  function initSpotlight() {
    const spotlightRefresh = document.getElementById('spotlightRefresh');
    if (spotlightRefresh) {
      spotlightRefresh.addEventListener('click', pickSpotlight);
    }
    window.addEventListener('va:ready', pickSpotlight);
    setTimeout(pickSpotlight, 1000);
  }

  // Category Browse Grid (Event Delegation instead of inline onclick)
  function renderCategoryBrowse() {
    const rawCats = (window.VA && window.VA.categories) ? window.VA.categories : [];
    const cats = Array.isArray(rawCats) ? rawCats : (rawCats.categories || []);
    const rawIdeas = (window.VA && window.VA.ideas) ? window.VA.ideas : [];
    const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);
    const container = document.getElementById('categoryBrowse');
    if (!container || !cats.length) return;

    const catCount = {};
    ideas.forEach(i => {
      if (i.category && i.status !== 'staged' && !(i.id && i.id.startsWith('candidate-'))) {
        catCount[i.category] = (catCount[i.category] || 0) + 1;
      }
    });

    const emojis = {
      'ai': '🤖', 'data': '📊', 'marketplace': '🏪', 'saas': '☁️', 'food': '🍽️',
      'compliance': '⚖️', 'game': '🎮', 'research': '🔬', 'education': '🎓',
      'finance': '💰', 'health': '🏥', 'productivity': '⚡', 'developer': '💻',
      'eu': '🇪🇺', 'mobile': '📱', 'content': '✍️', 'travel': '✈️', 'social': '👥'
    };

    const getEmoji = name => {
      const lower = (name || '').toLowerCase();
      return Object.entries(emojis).find(([k]) => lower.includes(k))?.[1] || '💡';
    };

    container.innerHTML = '';
    cats.slice(0, 30).forEach(cat => {
      const catName = cat.name || cat.id || cat;
      const count = catCount[catName] || 0;
      const emoji = getEmoji(catName);

      const btn = document.createElement('button');
      btn.className = 'panel category-btn';
      btn.setAttribute('data-action', 'filter-category');
      btn.setAttribute('data-category', catName);
      btn.style.cssText = 'padding:1rem;text-align:left;cursor:pointer;border:none;transition:all 0.18s ease;display:flex;align-items:center;gap:0.75rem';
      btn.title = `Filter by ${catName}`;
      btn.innerHTML = `<span style="font-size:1.4rem">${emoji}</span>
        <div>
          <div style="font-size:0.825rem;font-weight:600">${catName}</div>
          <div style="font-size:0.72rem;color:var(--muted)">${count} idea${count !== 1 ? 's' : ''}</div>
        </div>`;

      container.appendChild(btn);
    });
  }

  function initCategoryBrowse() {
    const container = document.getElementById('categoryBrowse');
    if (container) {
      container.addEventListener('click', e => {
        const btn = e.target.closest('[data-action="filter-category"]');
        if (!btn) return;
        const catName = btn.getAttribute('data-category');
        const catSelect = document.getElementById('category');
        if (catSelect) {
          catSelect.value = catName;
          catSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const dir = document.getElementById('directory');
        if (dir) dir.scrollIntoView({ behavior: 'smooth' });
      });
    }
    window.addEventListener('va:ready', renderCategoryBrowse);
    setTimeout(renderCategoryBrowse, 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initChips();
    initSpotlight();
    initCategoryBrowse();
  });
})();
