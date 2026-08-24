/* Venture Atlas OS — Command Palette (Ctrl+K / Cmd+K) */
(function() {
  'use strict';

  let searchIndex = [];
  let modalEl = null;
  let inputEl = null;
  let resultsEl = null;
  let selectedIdx = 0;
  let isOpen = false;

  function initCommandPalette() {
    createDOM();
    bindEvents();
    loadSearchIndex();
  }

  function createDOM() {
    const backdrop = document.createElement('div');
    backdrop.className = 'cmd-palette-backdrop';
    backdrop.id = 'cmdPaletteBackdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    backdrop.innerHTML = `
      <div class="cmd-palette-modal" role="dialog" aria-modal="true" aria-label="Global Command Palette">
        <div class="cmd-palette-input-wrap">
          <span class="cmd-palette-icon">🔍</span>
          <input type="text" class="cmd-palette-input" id="cmdPaletteInput" placeholder="Search opportunities, categories, prompts... (Ctrl+K)" autocomplete="off" />
          <kbd class="cmd-palette-kbd">ESC</kbd>
        </div>
        <ul class="cmd-palette-results" id="cmdPaletteResults" role="listbox"></ul>
        <div class="cmd-palette-footer">
          <span>Navigate <kbd class="cmd-palette-kbd">↑</kbd> <kbd class="cmd-palette-kbd">↓</kbd> · Select <kbd class="cmd-palette-kbd">↵</kbd></span>
          <span>Venture Atlas OS</span>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    modalEl = backdrop;
    inputEl = document.getElementById('cmdPaletteInput');
    resultsEl = document.getElementById('cmdPaletteResults');
  }

  function loadSearchIndex() {
    const rootPath = document.body.dataset.root || '.';
    fetch(`${rootPath}/data/search-index.json`)
      .then(res => res.json())
      .then(data => {
        searchIndex = data;
      })
      .catch(err => console.error('Failed to load command palette index', err));
  }

  function bindEvents() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleModal();
      } else if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    });

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    inputEl.addEventListener('input', () => {
      renderResults(inputEl.value.trim());
    });

    inputEl.addEventListener('keydown', (e) => {
      const items = resultsEl.querySelectorAll('.cmd-palette-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % items.length;
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        updateSelection(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIdx]) {
          items[selectedIdx].click();
        }
      }
    });
  }

  function toggleModal() {
    if (isOpen) closeModal();
    else openModal();
  }

  function openModal() {
    isOpen = true;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    inputEl.focus();
    renderResults('');
  }

  function closeModal() {
    isOpen = false;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    inputEl.value = '';
  }

  function renderResults(query) {
    resultsEl.innerHTML = '';
    selectedIdx = 0;
    const rootPath = document.body.dataset.root || '.';

    if (!query) {
      // Default quick actions
      const defaultActions = [
        { title: 'Find My Fit (Venture Matcher)', url: `${rootPath}/docs/matcher.html`, sub: 'Interactive founder constraint assessment' },
        { title: 'Leaderboard & Rankings', url: `${rootPath}/docs/rankings.html`, sub: 'Multi-lens decision leaderboards' },
        { title: 'Compare Selected Opportunities', url: `${rootPath}/docs/compare.html`, sub: 'Side-by-side comparison matrix' },
        { title: 'Economics & Financial Lab', url: `${rootPath}/docs/calculator.html`, sub: 'Unit economics and scenario modeling' },
        { title: 'Export Data (JSON / CSV)', url: `${rootPath}/docs/export.html`, sub: 'Full database downloads' }
      ];
      defaultActions.forEach((act, idx) => {
        resultsEl.appendChild(createItemEl(act.title, act.sub, act.url, idx === 0));
      });
      return;
    }

    const qLower = query.toLowerCase();
    const matches = searchIndex.filter(item => {
      return (item.name && item.name.toLowerCase().includes(qLower)) ||
             (item.category && item.category.toLowerCase().includes(qLower)) ||
             (item.problem && item.problem.toLowerCase().includes(qLower)) ||
             (item.tags && item.tags.some(t => t.toLowerCase().includes(qLower)));
    }).slice(0, 8);

    if (!matches.length) {
      resultsEl.innerHTML = '<li style="padding:1rem;text-align:center;color:var(--muted);font-size:0.875rem">No matching opportunities found</li>';
      return;
    }

    matches.forEach((item, idx) => {
      const title = item.name;
      const sub = `${item.category || 'Idea'} · Score: ${item.score || '—'}`;
      const url = `${rootPath}/docs/idea.html?id=${encodeURIComponent(item.id)}`;
      resultsEl.appendChild(createItemEl(title, sub, url, idx === 0));
    });
  }

  function createItemEl(title, subtitle, url, isSelected) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = `cmd-palette-item ${isSelected ? 'selected' : ''}`;
    a.href = url;
    a.innerHTML = `
      <div class="cmd-palette-item-left">
        <div>
          <div class="cmd-palette-item-title">${escapeHTML(title)}</div>
          <div class="cmd-palette-item-subtitle">${escapeHTML(subtitle)}</div>
        </div>
      </div>
      <span>→</span>
    `;
    a.addEventListener('click', closeModal);
    li.appendChild(a);
    return li;
  }

  function updateSelection(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIdx) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
  } else {
    initCommandPalette();
  }
})();
