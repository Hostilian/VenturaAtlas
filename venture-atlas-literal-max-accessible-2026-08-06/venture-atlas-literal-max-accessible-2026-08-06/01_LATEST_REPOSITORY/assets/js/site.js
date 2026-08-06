/**
 * Venture Atlas OS — site.js
 * Main JavaScript engine for the static GitHub Pages site.
 *
 * Responsibilities:
 *   - Load JSON data (ideas, rankings, prompts, sources, categories, relationships)
 *   - Render card grid, table, compare, rankings, prompts, graph
 *   - Search, filter, sort with URL state preservation
 *   - Dark / light mode with localStorage persistence
 *   - Score color coding (green ≥80, yellow 60–79, red <60)
 *   - Animated count-up for metric numbers
 *   - Favorites with localStorage
 *   - Keyboard shortcut: / to focus search, D to toggle dark mode
 *   - Feature strips: fastest to revenue, lowest cost
 *   - Top opportunities sidebar
 */

/* ================================================================
   GLOBAL STATE
   ================================================================ */
const VA = {
  ideas: [],
  rankings: [],
  prompts: [],
  sources: [],
  categories: [],
  relationships: [],
  base: ''
};

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ================================================================
   DATA LOADING
   ================================================================ */
async function loadData() {
  const root = document.body.dataset.root || '.';
  VA.base = root;
  const files = ['ideas', 'rankings', 'prompts', 'sources', 'categories', 'relationships'];
  await Promise.all(files.map(async f => {
    try {
      const res = await fetch(`${root}/data/${f}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${f}.json`);
      VA[f] = await res.json();
    } catch (e) {
      console.warn(`[VA] Could not load ${f}.json:`, e.message);
      VA[f] = [];
    }
  }));
}

/* ================================================================
   THEME
   ================================================================ */
function themeInit() {
  const saved = localStorage.getItem('va-theme') || 'light';
  document.documentElement.dataset.theme = saved;
  updateThemeBtn(saved);

  const btn = $('#themeBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('va-theme', next);
      updateThemeBtn(next);
    });
  }
}

function updateThemeBtn(theme) {
  const btn = $('#themeBtn');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀' : '☾';
  btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

/* ================================================================
   KEYBOARD SHORTCUTS
   ================================================================ */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

    // / — focus search
    if (e.key === '/' && !typing) {
      e.preventDefault();
      const s = $('#search');
      if (s) { s.focus(); s.select(); }
    }

    // D — toggle dark mode (not typing)
    if ((e.key === 'd' || e.key === 'D') && !typing && !e.ctrlKey && !e.metaKey) {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('va-theme', next);
      updateThemeBtn(next);
    }

    // Escape — clear search
    if (e.key === 'Escape' && typing) {
      const s = $('#search');
      if (s && document.activeElement === s) {
        s.value = '';
        s.dispatchEvent(new Event('input'));
        s.blur();
      }
    }
  });
}

/* ================================================================
   HELPERS
   ================================================================ */
function money(r) {
  if (!r) return 'Unknown';
  const fmt = n => `$${Number(n).toLocaleString()}`;
  if (r.currency && r.currency !== 'USD') {
    const sym = r.currency === 'EUR' ? '€' : r.currency;
    return `${sym}${Number(r.minimum || 0).toLocaleString()}–${sym}${Number(r.maximum || 0).toLocaleString()}`;
  }
  if (r.minimum === 0) return `$0–${fmt(r.maximum)}`;
  return `${fmt(r.minimum || 0)}–${fmt(r.maximum || 0)}`;
}

function scoreClass(val) {
  if (val >= 80) return 'hi';
  if (val >= 60) return 'md';
  return 'lo';
}

function statusBadge(status) {
  return `<span class="status-badge ${status}">${status}</span>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function labelCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

/* ================================================================
   ANIMATED COUNT-UP
   ================================================================ */
function countUp(el, target, duration = 800) {
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) ** 3; // ease-out cubic
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function fillMetrics() {
  const map = {
    '[data-total-ideas]':      VA.ideas.length,
    '[data-total-prompts]':    VA.prompts.length,
    '[data-total-sources]':    VA.sources.length,
    '[data-total-categories]': VA.categories.length
  };
  Object.entries(map).forEach(([sel, val]) => {
    $$(sel).forEach(el => countUp(el, val));
  });
}

/* ================================================================
   FAVORITES
   ================================================================ */
const getFavs = () => JSON.parse(localStorage.getItem('va-favs') || '[]');
const isFav = id => getFavs().includes(id);

function toggleFav(id, btn) {
  let favs = getFavs();
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id);
  } else {
    favs = [...favs, id];
  }
  localStorage.setItem('va-favs', JSON.stringify(favs));
  if (btn) btn.textContent = favs.includes(id) ? '★' : '☆';
}

/* ================================================================
   RECENTLY VIEWED
   ================================================================ */
function remember(id) {
  let r = JSON.parse(localStorage.getItem('va-recent') || '[]').filter(x => x !== id);
  r.unshift(id);
  localStorage.setItem('va-recent', JSON.stringify(r.slice(0, 12)));
}

/* ================================================================
   URL PARAMS
   ================================================================ */
function params() {
  return new URLSearchParams(location.search);
}

/* ================================================================
   CARD RENDERER
   ================================================================ */
function card(x) {
  const overall = x.atAGlance?.overallScore ?? 0;
  const profit  = x.compositeScores?.highestProfitPotential ?? 0;
  const conf    = x.scores?.overallConfidence?.value ?? 0;
  const scoreC  = scoreClass(overall);

  const tags = (x.tags || []).slice(0, 4)
    .map(t => `<span class="chip">${esc(t)}</span>`)
    .join('');

  return `
<article class="card" role="listitem" data-id="${x.id}">
  <div class="eyebrow">${esc(x.category)}</div>
  <h3><a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">${esc(x.name)}</a></h3>
  <p>${esc(x.oneSentenceConcept || '')}</p>
  <div class="customer-line">
    <strong>Customer:</strong> ${esc(x.atAGlance?.targetCustomer || '—')}
  </div>
  <div class="scoreline">
    <div class="score-box ${scoreC}">
      <span class="val">${overall}</span>
      Overall
    </div>
    <div class="score-box ${scoreClass(profit)}">
      <span class="val">${profit}</span>
      Profit
    </div>
    <div class="score-box ${scoreClass(conf * 10)}">
      <span class="val">${conf}/10</span>
      Confidence
    </div>
  </div>
  <div class="chips">${tags}</div>
  <div class="card-footer">
    <span class="risk">
      <strong>Risk:</strong> ${esc((x.atAGlance?.mainRisk || '').slice(0, 70))}${(x.atAGlance?.mainRisk || '').length > 70 ? '…' : ''}
    </span>
    ${statusBadge(x.status || 'explore')}
  </div>
  <div class="card-footer" style="border-top:none;padding-top:0.4rem">
    <button class="button ghost sm" onclick="toggleFav('${x.id}',this)" aria-label="${isFav(x.id) ? 'Remove from' : 'Add to'} favorites">
      ${isFav(x.id) ? '★' : '☆'}
    </button>
    <label style="font-size:0.8rem;color:var(--muted);display:flex;align-items:center;gap:0.3rem">
      <input type="checkbox" class="compareCheck" value="${x.id}" aria-label="Select ${esc(x.name)} for comparison">
      Compare
    </label>
    <a class="button sm" href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}" aria-label="Open ${esc(x.name)} detail page">
      Open →
    </a>
  </div>
</article>`.trim();
}

/* Small card variant for feature strips */
function miniCard(x) {
  const overall = x.atAGlance?.overallScore ?? 0;
  const scoreC  = scoreClass(overall);
  return `
<article class="card" role="listitem" data-id="${x.id}" style="padding:0.9rem">
  <div class="eyebrow" style="font-size:0.68rem">${esc(x.category)}</div>
  <h3 style="font-size:0.88rem"><a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">${esc(x.name)}</a></h3>
  <div class="score-box ${scoreC}" style="display:inline-block;padding:0.25rem 0.5rem;border-radius:6px;font-size:0.75rem">
    <span class="val" style="font-size:0.95rem">${overall}</span> score
  </div>
  <div style="font-size:0.8rem;color:var(--muted);margin-top:0.35rem">${esc(x.atAGlance?.timeToFirstRevenue || '—')}</div>
</article>`.trim();
}

/* ================================================================
   HOME PAGE
   ================================================================ */
function initHome() {
  const q      = $('#search');
  const cat    = $('#category');
  const status = $('#status');
  const sort   = $('#sort');
  const wrap   = $('#cards');
  const table  = $('#ideaTable');
  const empty  = $('#emptyState');

  if (!q || !wrap) return;

  // Populate category dropdown
  VA.categories.forEach(c => {
    cat.insertAdjacentHTML('beforeend',
      `<option value="${esc(c.name)}">${esc(c.name)} (${c.count})</option>`
    );
  });

  // Read URL params
  const u = params();
  q.value      = u.get('q')        || '';
  cat.value    = u.get('category') || '';
  status.value = u.get('status')   || '';
  sort.value   = u.get('sort')     || 'overall';

  // Sort functions
  const sorters = {
    overall:  (a, b) => (b.atAGlance?.overallScore ?? 0) - (a.atAGlance?.overallScore ?? 0),
    profit:   (a, b) => (b.compositeScores?.highestProfitPotential ?? 0) - (a.compositeScores?.highestProfitPotential ?? 0),
    cost:     (a, b) => (a.atAGlance?.startupCost?.midpoint ?? 999) - (b.atAGlance?.startupCost?.midpoint ?? 999),
    confidence:(a,b) => (b.scores?.overallConfidence?.value ?? 0) - (a.scores?.overallConfidence?.value ?? 0),
    revenue:  (a, b) => (a.atAGlance?.timeToFirstRevenue || 'z').localeCompare(b.atAGlance?.timeToFirstRevenue || 'z'),
    name:     (a, b) => a.name.localeCompare(b.name),
    updated:  (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
  };

  function render() {
    let xs   = [...VA.ideas];
    const term = q.value.toLowerCase().trim();

    if (term) {
      xs = xs.filter(x => {
        const hay = [
          x.name, x.oneSentenceConcept, x.category,
          x.atAGlance?.targetCustomer,
          x.atAGlance?.problemSolved,
          (x.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return hay.includes(term);
      });
    }

    if (cat.value)    xs = xs.filter(x => x.category === cat.value);
    if (status.value) xs = xs.filter(x => x.status   === status.value);

    // Venture Matcher Wizard filters
    const wBudget = $('#wizBudget')?.value;
    const wSpeed  = $('#wizSpeed')?.value;
    const wSkill  = $('#wizSkill')?.value;

    const wizResetBtn = $('#wizResetBtn');
    if (wizResetBtn) {
      wizResetBtn.style.display = (wBudget || wSpeed || wSkill) ? 'inline-block' : 'none';
    }

    if (wBudget === 'zero') {
      xs = xs.filter(x => (x.atAGlance?.startupCost?.maximum <= 100) || (x.compositeScores?.bestRequiringLittleCapital >= 80));
    } else if (wBudget === 'low') {
      xs = xs.filter(x => (x.atAGlance?.startupCost?.maximum <= 1000) || (x.compositeScores?.lowestCostLaunch >= 75));
    } else if (wBudget === 'medium') {
      xs = xs.filter(x => (x.atAGlance?.startupCost?.maximum <= 5000));
    }

    if (wSpeed === 'fast') {
      xs = xs.filter(x => (x.compositeScores?.fastestPathToRevenue >= 80) || /day|hours|1–2 weeks|2 days/i.test(x.atAGlance?.timeToFirstRevenue || ''));
    } else if (wSpeed === 'medium') {
      xs = xs.filter(x => /month|3–8 weeks|4–8 weeks/i.test(x.atAGlance?.timeToFirstRevenue || ''));
    } else if (wSpeed === 'strategic') {
      xs = xs.filter(x => /3\+|6\+|quarter/i.test(x.atAGlance?.timeToFirstRevenue || ''));
    }

    if (wSkill === 'solo') {
      xs = xs.filter(x => (x.compositeScores?.soloFounderPotential ?? 0) >= 75);
    } else if (wSkill === 'technical') {
      xs = xs.filter(x => (x.compositeScores?.bestForTechnicalFounder ?? 0) >= 75);
    } else if (wSkill === 'nontechnical') {
      xs = xs.filter(x => (x.compositeScores?.bestForNontechnicalFounder ?? 0) >= 55);
    } else if (wSkill === 'ai') {
      xs = xs.filter(x => (x.compositeScores?.aiAgentPotential ?? 0) >= 75);
    }

    const fn = sorters[sort.value] || sorters.overall;
    xs.sort(fn);

    // Render cards
    wrap.innerHTML = xs.length
      ? xs.map(card).join('')
      : '';

    // Empty state
    if (empty) empty.classList.toggle('hidden', xs.length > 0);

    // Result count
    const rc = $('#resultCount');
    if (rc) rc.textContent = `${xs.length.toLocaleString()} idea${xs.length !== 1 ? 's' : ''}`;

    // Table view
    renderTable(xs);

    // Preserve URL state
    const usp = new URLSearchParams();
    if (q.value)              usp.set('q', q.value);
    if (cat.value)            usp.set('category', cat.value);
    if (status.value)         usp.set('status', status.value);
    if (sort.value !== 'overall') usp.set('sort', sort.value);
    history.replaceState(null, '', `${location.pathname}${usp.toString() ? '?' + usp : ''}`);
  }

  function renderTable(xs) {
    const tbody = $('#tbody');
    if (!tbody) return;
    tbody.innerHTML = xs.map(x => {
      const sc = scoreClass(x.atAGlance?.overallScore ?? 0);
      return `
<tr>
  <td><a href="${VA.base}/docs/idea.html?id=${x.id}">${esc(x.name)}</a></td>
  <td>${esc(x.category)}</td>
  <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.atAGlance?.targetCustomer || '—')}</td>
  <td><span class="score-box ${sc}" style="display:inline-block;padding:0.2rem 0.4rem;border-radius:6px;font-size:0.82rem;font-weight:700">${x.atAGlance?.overallScore ?? '—'}</span></td>
  <td>${x.scores?.overallConfidence?.value ?? '—'}/10</td>
  <td>${esc(x.atAGlance?.timeToFirstRevenue || '—')}</td>
  <td>${money(x.atAGlance?.startupCost)}</td>
  <td>${statusBadge(x.status || 'explore')}</td>
</tr>`.trim();
    }).join('');
  }

  // Event listeners
  q.addEventListener('input', render);
  [cat, status, sort, $('#wizBudget'), $('#wizSpeed'), $('#wizSkill')].forEach(el => el && el.addEventListener('change', render));

  const resetFn = () => {
    q.value = ''; cat.value = ''; status.value = ''; sort.value = 'overall';
    const wb = $('#wizBudget'); if (wb) wb.value = '';
    const ws = $('#wizSpeed');  if (ws) ws.value = '';
    const wk = $('#wizSkill');  if (wk) wk.value = '';
    render();
  };
  $('#reset')?.addEventListener('click', resetFn);
  $('#resetEmpty')?.addEventListener('click', resetFn);
  $('#wizResetBtn')?.addEventListener('click', resetFn);

  $('#random')?.addEventListener('click', () => {
    const x = VA.ideas[Math.floor(Math.random() * VA.ideas.length)];
    if (x) location.href = `${VA.base}/docs/idea.html?id=${x.id}`;
  });

  $('#compareSelected')?.addEventListener('click', () => {
    const ids = $$('.compareCheck:checked').map(x => x.value).slice(0, 4);
    if (ids.length < 2) {
      alert('Select at least two ideas using the Compare checkboxes to compare.');
      return;
    }
    location.href = `${VA.base}/docs/compare.html?ids=${ids.join(',')}`;
  });

  // View toggles
  function setView(mode) {
    ['cardsView', 'tableView', 'compactView'].forEach(id => {
      const btn = $(`#${id}`);
      if (btn) btn.setAttribute('aria-pressed', 'false');
    });
    if (mode === 'cards') {
      wrap.classList.remove('hidden', 'compact');
      table?.classList.add('hidden');
      $('#cardsView')?.setAttribute('aria-pressed', 'true');
    } else if (mode === 'table') {
      wrap.classList.add('hidden');
      table?.classList.remove('hidden');
      $('#tableView')?.setAttribute('aria-pressed', 'true');
    } else if (mode === 'compact') {
      wrap.classList.remove('hidden');
      wrap.classList.add('compact');
      table?.classList.add('hidden');
      $('#compactView')?.setAttribute('aria-pressed', 'true');
    }
  }

  $('#cardsView')?.addEventListener('click',   () => setView('cards'));
  $('#tableView')?.addEventListener('click',   () => setView('table'));
  $('#compactView')?.addEventListener('click', () => setView('compact'));

  render();

  // ── Top opportunities sidebar ──
  const topEl = $('#topIdeas');
  if (topEl) {
    const top = [...VA.ideas]
      .sort((a, b) => (b.atAGlance?.overallScore ?? 0) - (a.atAGlance?.overallScore ?? 0))
      .slice(0, 7);
    topEl.innerHTML = top.map(x => `
<li>
  <a href="${VA.base}/docs/idea.html?id=${x.id}">${esc(x.name)}</a>
  <span class="score-badge">${x.atAGlance?.overallScore ?? '—'}</span>
</li>`).join('');
  }

  // ── Feature strips ──
  const fastStrip = $('#fastStrip');
  if (fastStrip) {
    const fast = [...VA.ideas]
      .filter(x => x.compositeScores?.fastestPathToRevenue)
      .sort((a, b) => b.compositeScores.fastestPathToRevenue - a.compositeScores.fastestPathToRevenue)
      .slice(0, 5);
    fastStrip.innerHTML = fast.map(miniCard).join('');
  }

  const cheapStrip = $('#cheapStrip');
  if (cheapStrip) {
    const cheap = [...VA.ideas]
      .filter(x => x.compositeScores?.bestRequiringLittleCapital)
      .sort((a, b) => b.compositeScores.bestRequiringLittleCapital - a.compositeScores.bestRequiringLittleCapital)
      .slice(0, 5);
    cheapStrip.innerHTML = cheap.map(miniCard).join('');
  }
}

/* ================================================================
   IDEA DETAIL PAGE
   ================================================================ */
function objSection(title, obj) {
  if (!obj || typeof obj !== 'object') return '';
  const entries = Object.entries(obj);
  if (!entries.length) return '';

  return `
<section class="section">
  <h2>${esc(title)}</h2>
  ${entries.map(([k, v]) => {
    const label = labelCase(k);
    if (Array.isArray(v)) {
      return `
<details>
  <summary>${esc(label)}</summary>
  <ul style="margin-top:0.5rem;padding-left:1.25rem">
    ${v.map(z => `<li>${typeof z === 'object' ? `<pre style="font-size:0.78rem;overflow:auto">${esc(JSON.stringify(z, null, 2))}</pre>` : esc(String(z))}</li>`).join('')}
  </ul>
</details>`;
    }
    if (v && typeof v === 'object') {
      return `
<details>
  <summary>${esc(label)}</summary>
  <div class="kv" style="margin-top:0.5rem">
    ${Object.entries(v).map(([a, b]) => `
    <div>${esc(labelCase(a))}</div>
    <div>${Array.isArray(b) ? b.map(z => esc(String(z))).join(', ') : typeof b === 'object' ? esc(JSON.stringify(b)) : esc(String(b ?? ''))}</div>`).join('')}
  </div>
</details>`;
    }
    return `
<div class="kv" style="margin-top:0.25rem">
  <div><strong>${esc(label)}</strong></div>
  <div>${esc(String(v ?? ''))}</div>
</div>`;
  }).join('')}
</section>`;
}

function initIdea() {
  const idParam = params().get('id');
  const x = VA.ideas.find(y => y.id === idParam) || VA.ideas.find(y => y.slug === idParam);
  const container = $('#idea');
  if (!container) return;

  if (!x) {
    container.innerHTML = `<div class="empty"><strong>Idea not found.</strong> <a href="${VA.base}/index.html">Browse all ideas</a></div>`;
    return;
  }

  remember(x.id);
  document.title = `${x.name} — Venture Atlas OS`;

  // Breadcrumb
  const crumb = $('#crumb');
  if (crumb) {
    crumb.innerHTML = `
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="${VA.base}/index.html">Ideas</a>
  <span class="sep">›</span>
  <span>${esc(x.category)}</span>
  <span class="sep">›</span>
  <span>${esc(x.id)}</span>
</nav>`;
  }

  // At a Glance grid
  const glanceEntries = [
    ['ID', x.id],
    ['Status', statusBadge(x.status || '')],
    ['Target customer', x.atAGlance?.targetCustomer],
    ['Problem', x.atAGlance?.problemSolved],
    ['Revenue model', x.atAGlance?.howItMakesMoney],
    ['Startup cost', money(x.atAGlance?.startupCost)],
    ['Time to MVP', x.atAGlance?.timeToMvp],
    ['Time to first revenue', x.atAGlance?.timeToFirstRevenue],
    ['Overall score', `<strong style="color:var(--score-hi);font-size:1.1rem">${x.atAGlance?.overallScore}/100</strong>`],
    ['Confidence', `${x.atAGlance?.confidenceScore}/10`],
    ['Main advantage', x.atAGlance?.mainAdvantage],
    ['Main risk', x.atAGlance?.mainRisk],
    ['Best next step', x.atAGlance?.bestNextValidationStep],
  ].filter(([, v]) => v != null && v !== '');

  const glanceHtml = `
<div class="glance-grid">
  ${glanceEntries.map(([l, v]) => `
  <div class="glance-item">
    <div class="label">${esc(l)}</div>
    <div class="value">${typeof v === 'string' && !v.startsWith('<') ? esc(v) : v}</div>
  </div>`).join('')}
</div>`;

  // Score bars
  const scoreItems = Object.entries(x.scores || {}).map(([k, v]) => {
    if (!v || typeof v !== 'object') return '';
    const pct = Math.min(Math.max(parseFloat(v.value) || 0, 0), 10) * 10;
    const cls = scoreClass(pct);
    return `
<div class="score-item">
  <div class="score-item-header">
    <span class="label">${esc(labelCase(k))}</span>
    <span class="val" style="color:var(--score-${cls})">${v.value}/10</span>
  </div>
  <div class="bar"><span style="width:${pct}%;background:var(--score-${cls})"></span></div>
  <div class="justification">${esc(v.justification || '')} <span class="muted">Confidence: ${esc(v.confidence || '')}. Basis: ${esc(v.basis || '')}.</span></div>
</div>`;
  }).join('');

  // Related ideas
  const relatedHtml = (x.relatedIdeaIds || []).map(rid => {
    const y = VA.ideas.find(z => z.id === rid);
    return y
      ? `<li><a href="idea.html?id=${rid}">${esc(y.name)}</a> <span class="muted">— ${esc(y.category)}</span></li>`
      : '';
  }).join('');

  let html = `
<section class="section">
  <div class="eyebrow">${esc(x.category)} &nbsp;·&nbsp; ${esc(x.id)}</div>
  <h1 style="font-size:clamp(1.5rem,4vw,2.8rem);margin:0.5rem 0">${esc(x.name)}</h1>
  <p class="lede" style="margin:0.75rem 0 1rem">${esc(x.oneSentenceConcept || '')}</p>
  <div class="chips" style="margin-bottom:1rem">
    ${(x.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
  </div>
  <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
    <button class="button sm" id="favDetail" aria-label="${isFav(x.id) ? 'Remove from favorites' : 'Add to favorites'}">
      ${isFav(x.id) ? '★ Favorited' : '☆ Favorite'}
    </button>
    <button class="button ghost sm" id="copyLink">🔗 Copy link</button>
    <button class="button ghost sm" id="printPage">🖨 Print</button>
    <a class="button ghost sm" href="${VA.base}/ideas/${esc(x.slug || x.id)}.md" download>↓ Dossier (.md)</a>
    <a class="button ghost sm" href="${VA.base}/data/ideas.json" download>↓ JSON</a>
    <a class="button ghost sm" href="${VA.base}/docs/calculator.html">🧮 Calculator</a>
  </div>
</section>

<section class="section">
  <h2>At a Glance</h2>
  ${glanceHtml}
</section>`;

  if (x.elevatorPitch) {
    html += `
<section class="section">
  <h2>Elevator Pitch</h2>
  <blockquote style="border-left:3px solid var(--accent);padding:0.75rem 1rem;margin:0;background:var(--accent-l);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:0.95rem;color:var(--text2);line-height:1.65">
    ${esc(x.elevatorPitch)}
  </blockquote>
</section>`;
  }

  html += objSection('Customer Perspective', x.customer);
  html += objSection('Product Definition', x.product);
  html += objSection('What Future AI Should Build', x.futureAiBuild);
  html += objSection('Profitability Analysis', x.profitability);
  html += objSection('Earning Potential', x.earningPotential);
  html += objSection('Market and Competition', x.market);
  html += objSection('Validation Plan', x.validation);
  html += objSection('Go-to-Market Strategy', x.goToMarket);
  html += objSection('Build and Operations Plan', x.operations);
  html += objSection('Risks and Failure Modes', x.risks);
  html += objSection('Action Plan', x.actionPlan);

  html += `
<section class="section">
  <h2>Scores Breakdown</h2>
  ${scoreItems}
</section>`;

  if (relatedHtml) {
    html += `
<section class="section">
  <h2>Related Ideas</h2>
  <ul style="padding-left:1.25rem;line-height:2">${relatedHtml}</ul>
</section>`;
  }

  html += `
<section class="section">
  <h2>Build Prompts</h2>
  <p>Use the 25-prompt build pack to generate a business plan, GTM strategy, financial model, technical spec, and more.</p>
  <a class="button primary" href="${VA.base}/prompts/idea-specific/${x.id}/README.md">Open 25-prompt pack →</a>
  <a class="button ghost" href="${VA.base}/docs/prompts.html" style="margin-left:0.5rem">Full prompt library</a>
</section>

<section class="section">
  <h2>Source References</h2>
  ${(x.sourceReferences || []).map(sid => {
    const src = VA.sources.find(s => s.id === sid);
    if (!src) return `<div class="muted" style="font-size:0.82rem">${esc(sid)}</div>`;
    return `
<div class="source-card">
  <strong>${esc(src.title)}</strong>
  <div class="source-meta">
    <span>${esc(src.publisher || '')}</span>
    ${src.date ? `<span>${esc(src.date)}</span>` : ''}
    ${src.confidenceLabel ? `<span class="confidence-badge ${src.confidenceLabel}">${esc(src.confidenceLabel)}</span>` : ''}
  </div>
  ${src.url ? `<div style="margin-top:0.35rem"><a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem">${esc(src.url)}</a></div>` : ''}
</div>`;
  }).join('')}
  ${(x.sourceReferences || []).length === 0 ? '<p class="muted">Source references are listed in the Markdown dossier file.</p>' : ''}
</section>

<section class="section">
  <h2>Provenance</h2>
  <div class="kv">
    ${Object.entries(x.provenance || {}).map(([k, v]) => `<div><strong>${esc(labelCase(k))}</strong></div><div>${esc(String(v))}</div>`).join('')}
    <div><strong>Markdown dossier</strong></div>
    <div><a href="${VA.base}/ideas/${esc(x.slug || x.id)}.md">ideas/${esc(x.slug || x.id)}.md</a></div>
  </div>
</section>`;

  container.innerHTML = html;

  // Bind buttons
  $('#favDetail')?.addEventListener('click', function() { toggleFav(x.id, this); });
  $('#copyLink')?.addEventListener('click', () => {
    navigator.clipboard.writeText(location.href).then(() => {
      const btn = $('#copyLink');
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '🔗 Copy link'; }, 2000); }
    });
  });
  $('#printPage')?.addEventListener('click', () => window.print());

  // Animate score bars after render
  setTimeout(() => {
    $$('.bar > span').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { bar.style.width = w; });
      });
    });
  }, 100);
}

/* ================================================================
   COMPARE PAGE
   ================================================================ */
function initCompare() {
  const ids      = (params().get('ids') || '').split(',').filter(Boolean);
  const selects  = $$('[data-compare-select]');
  const container = $('#comparison');

  selects.forEach((s, i) => {
    s.innerHTML = '<option value="">Choose an idea…</option>' +
      VA.ideas.map(x => `<option value="${x.id}" ${ids[i] === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
    s.addEventListener('change', render);
  });

  function render() {
    const xs = selects
      .map(s => VA.ideas.find(x => x.id === s.value))
      .filter(Boolean);

    history.replaceState(null, '', '?ids=' + selects.map(s => s.value).filter(Boolean).join(','));

    if (!container) return;

    if (xs.length === 0) {
      container.innerHTML = '<div class="empty"><strong>Choose two to four ideas to compare.</strong></div>';
      return;
    }

    // Fields to compare
    const rows = [
      ['Category',       x => x.category],
      ['Status',         x => statusBadge(x.status)],
      ['Customer',       x => esc(x.atAGlance?.targetCustomer || '—')],
      ['Problem',        x => esc(x.atAGlance?.problemSolved || '—')],
      ['Revenue model',  x => esc(x.atAGlance?.howItMakesMoney || '—')],
      ['Startup cost',   x => esc(money(x.atAGlance?.startupCost))],
      ['MVP time',       x => esc(x.atAGlance?.timeToMvp || '—')],
      ['First revenue',  x => esc(x.atAGlance?.timeToFirstRevenue || '—')],
      ['Overall score',  x => {
        const v = x.atAGlance?.overallScore ?? 0;
        return `<span class="score-box ${scoreClass(v)}" style="display:inline-block;padding:0.2rem 0.5rem;border-radius:6px;font-weight:700;font-size:0.9rem">${v}</span>`;
      }],
      ['Confidence',     x => `${x.scores?.overallConfidence?.value ?? '—'}/10`],
      ['Main advantage', x => esc(x.atAGlance?.mainAdvantage || '—')],
      ['Main risk',      x => esc(x.atAGlance?.mainRisk || '—')],
      ['Next step',      x => esc(x.atAGlance?.bestNextValidationStep || '—')],
    ];

    container.innerHTML = `
<div class="table-wrap" style="margin-top:1rem">
  <table>
    <thead>
      <tr>
        <th>Field</th>
        ${xs.map(x => `<th><a href="idea.html?id=${x.id}">${esc(x.name)}</a></th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(([label, fn]) => `
      <tr>
        <td><strong>${esc(label)}</strong></td>
        ${xs.map(x => `<td>${fn(x)}</td>`).join('')}
      </tr>`).join('')}
    </tbody>
  </table>
</div>`;
  }

  render();
}

/* ================================================================
   RANKINGS PAGE
   ================================================================ */
function initRankings() {
  const sel     = $('#rankingSelect');
  const container = $('#ranking');
  if (!sel) return;

  sel.innerHTML = VA.rankings.map(r =>
    `<option value="${esc(r.id)}">${esc(r.title)}</option>`
  ).join('');

  const wanted = params().get('id');
  if (wanted) sel.value = wanted;

  function render() {
    const r = VA.rankings.find(x => x.id === sel.value);
    if (!r || !container) return;

    history.replaceState(null, '', '?id=' + sel.value);

    container.innerHTML = `
<section class="section">
  <h1>${esc(r.title)}</h1>
  <p style="margin-bottom:1rem">${esc(r.method || '')}</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Idea</th>
          <th>Score</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        ${(r.items || []).map(it => {
          const cls = scoreClass(it.score || 0);
          return `
<tr>
  <td class="rank-num ${(it.rank || 99) <= 3 ? 'top3' : ''}">${it.rank}</td>
  <td><a href="idea.html?id=${esc(it.ideaId)}">${esc(it.name)}</a></td>
  <td><span class="score-box ${cls}" style="display:inline-block;padding:0.2rem 0.5rem;border-radius:6px;font-weight:700">${it.score}</span></td>
  <td style="font-size:0.85rem;color:var(--text2)">${esc(it.reason || '')}</td>
</tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</section>`;
  }

  sel.addEventListener('change', render);
  render();
}

/* ================================================================
   PROMPTS PAGE
   ================================================================ */
function initPrompts() {
  const q = $('#promptSearch');
  const container = $('#promptList');
  const count = $('#promptCount');
  if (!q || !container) return;

  function render() {
    const term = q.value.toLowerCase().trim();
    const xs = term
      ? VA.prompts.filter(p => JSON.stringify(p).toLowerCase().includes(term))
      : VA.prompts;

    if (count) count.textContent = `${xs.length.toLocaleString()} prompts`;

    container.innerHTML = xs.slice(0, 500).map(p => `
<div class="prompt-card">
  <div class="type-badge">${esc(p.type || 'prompt')}</div>
  <h3 style="font-size:0.95rem;margin:0.4rem 0">${esc(p.title || '')}</h3>
  <div class="source-meta">
    ${p.wordCount ? `<span>${p.wordCount} words</span>` : ''}
    ${p.sourceStatus ? `<span>${esc(p.sourceStatus)}</span>` : ''}
    ${p.ideaId ? `<span><a href="idea.html?id=${p.ideaId}">→ ${esc(p.ideaId)}</a></span>` : ''}
  </div>
  ${p.path ? `<a class="button ghost sm" href="${VA.base}/${esc(p.path)}" style="margin-top:0.65rem">Open prompt →</a>` : ''}
</div>`).join('');
  }

  q.addEventListener('input', render);
  render();
}

/* ================================================================
   SOURCES PAGE
   ================================================================ */
function initSources() {
  const q = $('#sourceSearch');
  const container = $('#sourceList');
  const count = $('#sourceCount');
  if (!container) return;

  function render() {
    const term = q ? q.value.toLowerCase().trim() : '';
    const xs = term
      ? VA.sources.filter(s => JSON.stringify(s).toLowerCase().includes(term))
      : VA.sources;

    if (count) count.textContent = `${xs.length.toLocaleString()} sources`;

    container.innerHTML = xs.map(s => `
<div class="source-card">
  <strong>${esc(s.title || s.id)}</strong>
  ${s.url ? `<div style="margin:0.25rem 0"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem;word-break:break-all">${esc(s.url)}</a></div>` : ''}
  <div class="source-meta">
    <span>${esc(s.id || '')}</span>
    ${s.publisher ? `<span>${esc(s.publisher)}</span>` : ''}
    ${s.date ? `<span>${esc(s.date)}</span>` : ''}
    ${s.type ? `<span>${esc(s.type)}</span>` : ''}
    ${s.researchRound ? `<span>Round ${esc(s.researchRound)}</span>` : ''}
    ${s.confidenceLabel ? `<span class="confidence-badge ${s.confidenceLabel}">${esc(s.confidenceLabel)}</span>` : ''}
  </div>
  ${s.supports ? `<div style="margin-top:0.4rem;font-size:0.8rem;color:var(--muted)">Supports: ${(s.supports || []).map(esc).join(', ')}</div>` : ''}
  ${s.importantCaveat ? `<div class="notice" style="margin-top:0.5rem;font-size:0.8rem">⚠ ${esc(s.importantCaveat)}</div>` : ''}
</div>`).join('');
  }

  q?.addEventListener('input', render);
  render();
}

/* ================================================================
   RELATIONSHIP GRAPH
   ================================================================ */
function initGraph() {
  const svg = $('#graph');
  if (!svg) return;

  const W = 1200, H = 620;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const nodes = VA.ideas.slice(0, 70).map((x, i) => ({
    ...x,
    cx: 80 + (i % 10) * 114,
    cy: 55 + Math.floor(i / 10) * 88
  }));

  const allowed = new Set(nodes.map(x => x.id));
  const edges = (VA.relationships || [])
    .filter(e => allowed.has(e.source) && allowed.has(e.target))
    .slice(0, 120);

  const lines = edges.map(e => {
    const a = nodes.find(n => n.id === e.source);
    const b = nodes.find(n => n.id === e.target);
    if (!a || !b) return '';
    return `<line x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}" stroke="var(--accent)" stroke-width="1" opacity="0.15"/>`;
  }).join('');

  const circles = nodes.map(n => {
    const sc = scoreClass(n.atAGlance?.overallScore ?? 0);
    const fill = sc === 'hi' ? 'var(--score-hi-bg)' : sc === 'md' ? 'var(--score-md-bg)' : 'var(--score-lo-bg)';
    const stroke = sc === 'hi' ? 'var(--score-hi)' : sc === 'md' ? 'var(--score-md)' : 'var(--score-lo)';
    return `
<a href="idea.html?id=${n.id}" tabindex="0">
  <circle cx="${n.cx}" cy="${n.cy}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <text x="${n.cx}" y="${n.cy + 4}" text-anchor="middle" font-size="8" fill="${stroke}" font-weight="700">${esc(n.id.slice(-3))}</text>
  <title>${esc(n.name)} — ${n.atAGlance?.overallScore ?? '?'}</title>
</a>`;
  }).join('');

  svg.innerHTML = lines + circles;
}

/* ================================================================
   CATEGORIES PAGE
   ================================================================ */
function initCategories() {
  const container = $('#categoryGrid');
  if (!container) return;

  container.innerHTML = VA.categories.map(c => `
<div class="card" style="cursor:pointer" onclick="location.href='${VA.base}/index.html?category=${encodeURIComponent(c.name)}'">
  <div class="eyebrow">${esc(c.name)}</div>
  <h3 style="font-size:1rem;margin:0.25rem 0">${esc(c.name)}</h3>
  <p style="font-size:0.82rem">${esc(c.description || '')}</p>
  <div style="margin-top:auto;font-weight:700;color:var(--accent);font-size:1.1rem">${c.count}</div>
  <div style="font-size:0.78rem;color:var(--muted)">idea${c.count !== 1 ? 's' : ''}</div>
</div>`).join('');
}

/* ================================================================
   ENTRY POINT
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Load all data
  await loadData();

  // Theme and keyboard
  themeInit();
  initKeyboard();

  // Service worker registration for offline PWA functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${VA.base}/sw.js`).catch(() => {});
  }

  // Inject nav on pages that use it (non-home pages that don't have their own header)
  const page = document.body.dataset.page;
  const hasHeader = document.querySelector('.site-header');
  if (!hasHeader) {
    document.body.insertAdjacentHTML('afterbegin', `
<a href="#main" class="skip">Skip to content</a>
<header class="site-header" role="banner">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="${VA.base}/index.html">Venture Atlas OS</a>
    <div class="navlinks">
      <a href="${VA.base}/index.html#directory">Ideas</a>
      <a href="${VA.base}/docs/rankings.html">Rankings</a>
      <a href="${VA.base}/docs/compare.html">Compare</a>
      <a href="${VA.base}/docs/calculator.html">Calculator</a>
      <a href="${VA.base}/docs/prompts.html">Prompts</a>
      <a href="${VA.base}/docs/sources.html">Sources</a>
      <a href="${VA.base}/docs/methodology.html">Methodology</a>
      <a href="${VA.base}/docs/about.html">About</a>
    </div>
    <button id="themeBtn" aria-label="Toggle dark mode">☾</button>
  </nav>
</header>`);
    // Re-bind theme button (it was just created)
    themeInit();
  }

  // Inject footer on pages that don't have one
  if (!document.querySelector('.footer')) {
    document.body.insertAdjacentHTML('beforeend', `
<footer class="footer" role="contentinfo">
  Decision support, not financial advice. Scores and scenarios are not guarantees. &nbsp;
  <a href="${VA.base}/research/completeness-audit.md">Completeness audit</a> · 
  <a href="${VA.base}/docs/methodology.html">Methodology</a> · 
  <a href="${VA.base}/docs/about.html">About</a>
</footer>`);
  }

  // Fill metrics with count-up animation
  fillMetrics();

  // Page-specific initialization
  if (page === 'home')          initHome();
  if (page === 'idea')          initIdea();
  if (page === 'compare')       initCompare();
  if (page === 'rankings')      initRankings();
  if (page === 'prompts')       initPrompts();
  if (page === 'sources')       initSources();
  if (page === 'relationships') initGraph();
  if (page === 'categories')    initCategories();
});
