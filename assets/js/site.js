/**
 * Venture Atlas OS — site.js (v2.2.0)
 * Main JavaScript engine for the static GitHub Pages site.
 *
 * Responsibilities:
 *   - Page-aware JSON data loading with boundary normalization and fetch caching
 *   - Render card grid, table, compare, rankings, prompts, graph
 *   - Search, filter, sort (with normalized duration sorting)
 *   - Dark / light mode with safe localStorage persistence
 *   - Event delegation replacing runtime inline onclick handlers
 *   - UI error states for fetch failures
 */

/* ================================================================
   GLOBAL NAMESPACE & STATE
   ================================================================ */
const VA = {
  ideas: [],
  rankings: [],
  prompts: [],
  sources: [],
  categories: [],
  relationships: [],
  dataErrors: {},
  base: ''
};

function getIdeaScore(idea, dimension) {
  if (!idea) return null;
  const cs = idea.compositeScores || {};
  const sc = idea.scores || {};
  const gl = idea.atAGlance || {};

  let val = null;
  if (dimension === 'overall') {
    val = gl.overallScore ?? cs.overallOpportunity ?? cs.compositeHeadline;
  } else if (dimension === 'market') {
    val = sc.marketDemand?.value ?? cs.marketDemand;
  } else if (dimension === 'confidence') {
    val = sc.confidence?.value ?? cs.confidence;
  } else if (dimension === 'profit') {
    val = sc.profitPotential?.value ?? cs.profitPotential;
  } else if (cs[dimension] !== undefined) {
    val = cs[dimension];
  } else if (sc[dimension] !== undefined) {
    val = typeof sc[dimension] === 'object' ? sc[dimension].value : sc[dimension];
  }

  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.min(100, Math.max(0, Number(val)));
}

function formatCompositeScore(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return `${Number(val).toFixed(1)} (scale unspecified)`;
}

function formatDimensionScore(val, maxScale = null) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  const num = Number(val);
  return maxScale == null ? `${num.toFixed(1)} (scale unspecified)` : `${num.toFixed(1)} / ${maxScale}`;
}

function formatConfidenceScore(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Unverified';
  const num = Number(val);
  if (num >= 70) return `High (${num.toFixed(0)}%)`;
  if (num >= 40) return `Medium (${num.toFixed(0)}%)`;
  if (num > 0) return `Low (${num.toFixed(0)}%)`;
  return 'Unverified';
}

window.VentureAtlas = {
  VA,
  getState: () => ({ ...VA }),
  readJsonStorage,
  writeJsonStorage,
  sanitizeUrl,
  parseDurationDays,
  getIdeaScore,
  formatCompositeScore,
  formatDimensionScore,
  formatConfidenceScore
};

// Backward compatibility bridge
window.VA = VA;

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ================================================================
   SAFE STORAGE HELPERS
   ================================================================ */
function readJsonStorage(key, fallback = []) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`[VA] Failed to read localStorage key "${key}":`, e);
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[VA] Failed to write localStorage key "${key}":`, e);
  }
}

/* ================================================================
   BOUNDARY NORMALIZATION & DATA LOADING
   ================================================================ */
const fetchCache = new Map();

function normalizeDataset(name, raw) {
  if (!raw) return [];
  switch (name) {
    case 'ideas':
      return Array.isArray(raw) ? raw : (raw.ideas || []);
    case 'rankings':
      return Array.isArray(raw) ? raw : (raw.rankings || raw.legacyData || []);
    case 'categories':
      return Array.isArray(raw) ? raw : (raw.categories || []);
    case 'sources':
      return Array.isArray(raw) ? raw : (raw.sources || []);
    case 'relationships':
      return Array.isArray(raw) ? raw : (raw.relationships || []);
    case 'prompts':
      return Array.isArray(raw) ? raw : (raw.prompts || []);
    default:
      return Array.isArray(raw) ? raw : [];
  }
}

const PAGE_DATA_REQUIREMENTS = {
  home: ['ideas', 'categories'],
  idea: ['ideas', 'sources', 'relationships'],
  compare: ['ideas'],
  rankings: ['ideas', 'rankings'],
  prompts: ['prompts', 'ideas'],
  sources: ['sources'],
  relationships: ['ideas', 'relationships'],
  categories: ['categories', 'ideas']
};

async function fetchDataset(root, file) {
  const targetFile = file === 'sources' ? 'public-sources' : file;
  const url = `${root}/data/${targetFile}.json`;
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${file}.json`);
      const raw = await res.json();
      return normalizeDataset(file, raw);
    } catch (err) {
      console.warn(`[VA] Could not load ${file}.json:`, err.message);
      VA.dataErrors[file] = err.message;
      return [];
    }
  })();
  fetchCache.set(url, promise);
  return promise;
}

async function loadData() {
  const root = document.body.dataset.root || '.';
  VA.base = root;
  const page = document.body.dataset.page || 'home';
  const requiredFiles = PAGE_DATA_REQUIREMENTS[page] || ['ideas', 'rankings', 'prompts', 'sources', 'categories', 'relationships'];

  try {
    const metaRes = await fetch(`${root}/data/repository-meta.json`);
    if (metaRes.ok) {
      VA.meta = await metaRes.json();
    }
  } catch (e) {
    console.warn('[VA] Could not load repository-meta.json:', e);
  }

  await Promise.all(requiredFiles.map(async f => {
    VA[f] = await fetchDataset(root, f);
  }));

  // Staging is intentionally private and is never fetched by the public client.
  VA.stagedIdeas = [];
  VA.stagingAvailability = 'not_public';
  VA.allIdeas = [...(VA.ideas || []), ...(VA.stagedIdeas || [])];

  const failedDatasets = Object.keys(VA.dataErrors);
  if (failedDatasets.length) {
    const alert = document.createElement('div');
    alert.className = 'panel error';
    alert.setAttribute('role', 'alert');
    alert.textContent = `Data unavailable: ${failedDatasets.join(', ')}. Results may be incomplete; retry when the connection is restored.`;
    const main = document.querySelector('main');
    if (main) main.prepend(alert);
  }
}

/* ================================================================
   THEME MANAGEMENT
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

    if (e.key === '/' && !typing) {
      e.preventDefault();
      const s = $('#search');
      if (s) { s.focus(); s.select(); }
    }

    if ((e.key === 'd' || e.key === 'D') && !typing && !e.ctrlKey && !e.metaKey) {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('va-theme', next);
      updateThemeBtn(next);
    }

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
   MOBILE NAVIGATION
   ================================================================ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle') || $('.nav-toggle');
  const links = document.getElementById('navlinks') || $('.navlinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });

  document.addEventListener('click', (e) => {
    if (links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
      toggle.focus();
    }
  });
}

/* ================================================================
   HELPERS & SANITIZATION
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
  const ALLOWED_STATUSES = new Set(['explore', 'validate', 'build', 'hold', 'archived', 'staged', 'researched', 'shortlisted', 'priority']);
  const cleanStatus = ALLOWED_STATUSES.has(status) ? status : 'explore';
  return `<span class="status-badge ${cleanStatus}">${esc(cleanStatus)}</span>`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeUrl(url) {
  if (!url) return '#';
  const str = String(url).trim();
  if (str.startsWith('./') || str.startsWith('/') || str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  return '#';
}

function labelCase(str) {
  return String(str ?? '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

function parseDurationDays(str) {
  if (!str) return 9999;
  const s = String(str).toLowerCase();
  if (s.includes('day') || s.includes('hours')) return 2;
  if (s.includes('1–2 week') || s.includes('1-2 week') || s.includes('2 week')) return 10;
  if (s.includes('3+') || s.includes('quarter') || s.includes('year') || s.includes('6+')) return 90;
  if (s.includes('3–8 week') || s.includes('3-8 week') || s.includes('month') || s.includes('4-8 week')) return 35;
  return 45;
}

/* ================================================================
   ANIMATED COUNT-UP
   ================================================================ */
function countUp(el, target, duration = 800) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = Number(target).toLocaleString();
    return;
  }
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function getIdeaScore(idea, dimension) {
  if (!idea) return null;
  const d = String(dimension || 'overall').toLowerCase();

  if (d === 'overall') {
    const v = idea.atAGlance?.overallScore ?? idea.compositeScores?.compositeHeadline ?? idea.scores?.overallOpportunity?.value;
    return typeof v === 'number' && !isNaN(v) ? v : null;
  }
  if (d === 'profit') {
    const v = idea.scores?.profitPotential?.value ?? idea.compositeScores?.profitPotential ?? idea.scores?.highestProfitPotential?.value;
    return typeof v === 'number' && !isNaN(v) ? v : null;
  }
  if (d === 'confidence') {
    const v = idea.scores?.confidence?.value ?? idea.compositeScores?.confidence ?? idea.scores?.overallConfidence?.value;
    return typeof v === 'number' && !isNaN(v) ? v : null;
  }
  if (d === 'market') {
    const v = idea.scores?.marketDemand?.value ?? idea.compositeScores?.marketDemand ?? idea.scores?.marketSize?.value;
    return typeof v === 'number' && !isNaN(v) ? v : null;
  }

  const generic = idea.scores?.[dimension]?.value ?? idea.compositeScores?.[dimension];
  return typeof generic === 'number' && !isNaN(generic) ? generic : null;
}

window.VentureAtlas.getIdeaScore = getIdeaScore;

function fillMetrics() {
  const counts = VA.meta?.counts || {};
  const map = {
    '[data-total-ideas]':      counts.canonicalIdeas ?? (VA.dataErrors.ideas ? null : VA.ideas.length),
    '[data-total-prompts]':    counts.prompts ?? null,
    '[data-total-sources]':    counts.sources ?? (VA.dataErrors.sources ? null : VA.sources.length),
    '[data-total-categories]': counts.categories ?? (VA.dataErrors.categories ? null : VA.categories.length)
  };
  Object.entries(map).forEach(([sel, val]) => {
    if (val === null || val === undefined) return;
    $$(sel).forEach(el => countUp(el, val));
  });
}

/* ================================================================
   FAVORITES (USING SAFE STORAGE & EVENT DELEGATION)
   ================================================================ */
const getFavs = () => readJsonStorage('va-favs', []);
const isFav = id => getFavs().includes(id);

function toggleFav(id, btn) {
  let favs = getFavs();
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id);
  } else {
    favs = [...favs, id];
  }
  writeJsonStorage('va-favs', favs);
  if (btn) {
    btn.textContent = favs.includes(id) ? '★' : '☆';
  }
}

function remember(id) {
  let r = readJsonStorage('va-recent', []).filter(x => x !== id);
  r.unshift(id);
  writeJsonStorage('va-recent', r.slice(0, 12));
}

function params() {
  return new URLSearchParams(location.search);
}

/* ================================================================
   CARD RENDERER & EVENT DELEGATION
   ================================================================ */
function card(x) {
  const overallVal = getIdeaScore(x, 'overall');
  const profitVal  = getIdeaScore(x, 'profit');
  const confVal    = getIdeaScore(x, 'confidence');

  const overallDisp = overallVal !== null ? overallVal : 'N/A';
  const profitDisp  = profitVal !== null ? profitVal : 'N/A';
  const confDisp    = confVal !== null ? `${confVal} (legacy)` : 'N/A';

  const scoreC  = overallVal !== null ? scoreClass(overallVal) : 'lo';
  const profitC = profitVal !== null ? scoreClass(profitVal) : 'lo';
  const confC   = 'neutral';

  const tags = (x.tags || []).slice(0, 4)
    .map(t => `<span class="chip">${esc(t)}</span>`)
    .join('');

  return `
<article class="card" role="listitem" data-id="${esc(x.id)}">
  <div class="eyebrow">${esc(x.category)}</div>
  <h3><a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">${esc(x.name)}</a></h3>
  <p>${esc(x.oneSentenceConcept || '')}</p>
  <div class="customer-line">
    <strong>Customer:</strong> ${esc(x.atAGlance?.targetCustomer || '—')}
  </div>
  <div class="scoreline">
    <div class="score-box ${scoreC}">
      <span class="val">${overallDisp}</span>
      Overall
    </div>
    <div class="score-box ${profitC}">
      <span class="val">${profitDisp}</span>
      Profit
    </div>
    <div class="score-box ${confC}">
      <span class="val">${confDisp}</span>
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
    <button class="button ghost sm" data-action="toggle-fav" data-id="${esc(x.id)}" aria-label="${isFav(x.id) ? 'Remove from' : 'Add to'} favorites">
      ${isFav(x.id) ? '★' : '☆'}
    </button>
    <label style="font-size:0.8rem;color:var(--muted);display:flex;align-items:center;gap:0.3rem">
      <input type="checkbox" class="compareCheck" value="${esc(x.id)}" aria-label="Select ${esc(x.name)} for comparison">
      Compare
    </label>
    <a class="button sm" href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}" aria-label="Open ${esc(x.name)} detail page">
      Open →
    </a>
  </div>
</article>`.trim();
}

function miniCard(x) {
  const overall = x.atAGlance?.overallScore ?? null;
  const scoreC  = overall === null ? 'neutral' : scoreClass(overall);
  return `
<article class="card" role="listitem" data-id="${esc(x.id)}" style="padding:0.9rem">
  <div class="eyebrow" style="font-size:0.68rem">${esc(x.category)}</div>
  <h3 style="font-size:0.88rem"><a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">${esc(x.name)}</a></h3>
  <div class="score-box ${scoreC}" style="display:inline-block;padding:0.25rem 0.5rem;border-radius:6px;font-size:0.75rem">
    <span class="val" style="font-size:0.95rem">${overall ?? 'N/A'}</span> score
  </div>
  <div style="font-size:0.8rem;color:var(--muted);margin-top:0.35rem">${esc(x.atAGlance?.timeToFirstRevenue || '—')}</div>
</article>`.trim();
}

/* Global event delegation for favorites */
document.addEventListener('click', e => {
  const favBtn = e.target.closest('[data-action="toggle-fav"]');
  if (favBtn) {
    const id = favBtn.getAttribute('data-id');
    if (id) toggleFav(id, favBtn);
  }
});

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

  if (cat && cat.children.length <= 1) {
    VA.categories.forEach(c => {
      cat.insertAdjacentHTML('beforeend',
        `<option value="${esc(c.name)}">${esc(c.name)} (${c.count || 0})</option>`
      );
    });
  }

  const u = params();
  q.value      = u.get('q')        || '';
  cat.value    = u.get('category') || '';
  status.value = u.get('status')   || '';
  sort.value   = u.get('sort')     || 'overall';

  const sorters = {
    overall:   (a, b) => (b.atAGlance?.overallScore ?? 0) - (a.atAGlance?.overallScore ?? 0),
    profit:    (a, b) => (b.compositeScores?.highestProfitPotential ?? 0) - (a.compositeScores?.highestProfitPotential ?? 0),
    cost:      (a, b) => (a.atAGlance?.startupCost?.midpoint ?? 999) - (b.atAGlance?.startupCost?.midpoint ?? 999),
    confidence:(a, b) => (b.scores?.overallConfidence?.value ?? 0) - (a.scores?.overallConfidence?.value ?? 0),
    revenue:   (a, b) => parseDurationDays(a.atAGlance?.timeToFirstRevenue) - parseDurationDays(b.atAGlance?.timeToFirstRevenue),
    name:      (a, b) => a.name.localeCompare(b.name),
    updated:   (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
  };

  let currentScope = 'canonical';
  let visibleCount = 24;

  function getBaseList() {
    if (currentScope === 'staged') return VA.stagedIdeas || [];
    if (currentScope === 'all') return VA.allIdeas || [...(VA.ideas || []), ...(VA.stagedIdeas || [])];
    return VA.ideas || [];
  }

  function render() {
    let xs = [...getBaseList()];
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
      xs = xs.filter(x => (x.compositeScores?.fastestPathToRevenue >= 80) || parseDurationDays(x.atAGlance?.timeToFirstRevenue) <= 14);
    } else if (wSpeed === 'medium') {
      xs = xs.filter(x => parseDurationDays(x.atAGlance?.timeToFirstRevenue) > 14 && parseDurationDays(x.atAGlance?.timeToFirstRevenue) <= 60);
    } else if (wSpeed === 'strategic') {
      xs = xs.filter(x => parseDurationDays(x.atAGlance?.timeToFirstRevenue) > 60);
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

    const totalFiltered = xs.length;
    const sliced = xs.slice(0, visibleCount);

    wrap.innerHTML = sliced.length ? sliced.map(card).join('') : '';
    if (empty) empty.classList.toggle('hidden', totalFiltered > 0);

    let loadMoreWrap = $('#loadMoreWrap');
    if (!loadMoreWrap && wrap.parentNode) {
      loadMoreWrap = document.createElement('div');
      loadMoreWrap.id = 'loadMoreWrap';
      loadMoreWrap.style.cssText = 'text-align:center;margin:1.5rem 0 2rem;display:flex;flex-direction:column;align-items:center;gap:0.6rem;padding:1.25rem;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);';
      loadMoreWrap.innerHTML = `
        <div style="font-size:0.9rem;color:var(--text2);font-weight:500;">Load more results:</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;align-items:center;">
          <button id="loadMoreBtn" class="button secondary" style="min-width:190px">Show 10 More Ideas</button>
          <button id="loadAllBtn" class="button primary" style="min-width:190px">Show All Ideas</button>
        </div>
      `;
      wrap.parentNode.insertBefore(loadMoreWrap, wrap.nextSibling);

      const btn10 = $('#loadMoreBtn');
      if (btn10) {
        btn10.addEventListener('click', () => {
          visibleCount += 10;
          render();
        });
      }
      const btnAll = $('#loadAllBtn');
      if (btnAll) {
        btnAll.addEventListener('click', () => {
          visibleCount = totalFiltered;
          render();
        });
      }
    }

    if (loadMoreWrap) {
      if (sliced.length < totalFiltered) {
        loadMoreWrap.style.display = 'flex';
        const remaining = totalFiltered - sliced.length;
        const count = Math.min(10, remaining);
        const btn10 = $('#loadMoreBtn');
        const btnAll = $('#loadAllBtn');
        if (btn10) btn10.textContent = `Show ${count} More Idea${count !== 1 ? 's' : ''} (${remaining} left)`;
        if (btnAll) btnAll.textContent = `Show All ${totalFiltered.toLocaleString()} Ideas`;
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }

    const rc = $('#resultCount');
    if (rc) rc.textContent = `${totalFiltered.toLocaleString()} idea${totalFiltered !== 1 ? 's' : ''}`;

    renderTable(sliced);

    const usp = new URLSearchParams();
    if (q.value)                  usp.set('q', q.value);
    if (cat.value)                usp.set('category', cat.value);
    if (status.value)             usp.set('status', status.value);
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

  q.addEventListener('input', render);
  [cat, status, sort, $('#wizBudget'), $('#wizSpeed'), $('#wizSkill')].forEach(el => el && el.addEventListener('change', render));

  $$('.scope-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.scope-tab').forEach(t => {
        t.classList.remove('primary', 'active');
        t.classList.add('secondary');
      });
      tab.classList.remove('secondary');
      tab.classList.add('primary', 'active');
      currentScope = tab.getAttribute('data-scope') || 'canonical';
      visibleCount = 24;
      render();
    });
  });

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

  const rawOverall = x.atAGlance?.overallScore ?? getIdeaScore(x, 'overall');
  const overallScoreDisplay = rawOverall != null ? `${rawOverall} / 100` : 'Not scored';
  const overallScoreNumDisplay = rawOverall != null ? rawOverall : '—';
  
  const confidenceVal = x.scores?.overallConfidence?.value;
  const confidenceDisplay = Number.isFinite(Number(confidenceVal))
    ? `${Number(confidenceVal)} (legacy score; scale unspecified)`
    : 'Not assessed';
  
  const killStatusText = x.killCriteria ? (x.killCriteria.killFlagged ? '⚠ Flagged' : 'Pass') : 'Not assessed';
  const killStatusColor = x.killCriteria ? (x.killCriteria.killFlagged ? 'var(--score-lo)' : 'var(--score-hi)') : 'var(--muted)';

  const citedSourceIds = new Set();
  for (const reference of x.sourceReferences || []) {
    const sourceId = typeof reference === 'string' ? reference : reference?.id;
    if (sourceId) citedSourceIds.add(sourceId);
  }
  for (const evidence of x.evidence || []) {
    if (evidence?.sourceId) citedSourceIds.add(evidence.sourceId);
  }
  const sourcesCount = citedSourceIds.size;
  
  const valStatus = x.validationStatus || x.atAGlance?.validationStatus || null;
  const validationProvenance = x.validationProvenance || x.researchRunId || x.validationRunId;
  const validationProven = Boolean(validationProvenance);
  const legacyValidationLabel = x.legacyValidation?.label || null;
  const validationDisplay = legacyValidationLabel && !validationProven
    ? `NOT PROVEN · LEGACY LABEL: ${String(legacyValidationLabel).toUpperCase()}`
    : valStatus
      ? `${String(valStatus).toUpperCase()}${validationProven ? '' : ' · PROVENANCE UNAVAILABLE'}`
      : 'NOT RESEARCHED';
  const lastValidated = x.lastValidatedAt
    ? `${x.lastValidatedAt}${validationProven ? '' : ' (legacy date; unverified)'}`
    : 'No verified research date';

  const glanceEntries = [
    ['Target customer', x.atAGlance?.targetCustomer],
    ['Problem', x.atAGlance?.problemSolved],
    ['Revenue model', x.atAGlance?.howItMakesMoney],
    ['Startup cost', money(x.atAGlance?.startupCost)],
    ['Time to MVP', x.atAGlance?.timeToMvp],
    ['Time to first revenue', x.atAGlance?.timeToFirstRevenue],
    ['Overall score', `<strong style="color:var(--score-hi);font-size:1.1rem">${overallScoreDisplay}</strong>`],
    ['Evidence confidence', confidenceDisplay],
    ['Main advantage', x.atAGlance?.mainAdvantage],
    ['Main risk', x.atAGlance?.mainRisk],
    ['Best next step', x.atAGlance?.bestNextValidationStep],
  ].filter(([, v]) => v != null && v !== '');

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

  // Related ideas lookup
  const rels = (VA.relationships || []).filter(r => r.source === x.id || r.target === x.id);
  const relatedIds = Array.from(new Set([...(x.relatedIdeaIds || []), ...rels.map(r => r.source === x.id ? r.target : r.source)])).slice(0, 6);
  const relatedHtml = relatedIds.map(rid => {
    const y = VA.ideas.find(z => z.id === rid);
    const yScore = y?.atAGlance?.overallScore ?? getIdeaScore(y, 'overall');
    return y ? `<li><a href="idea.html?id=${rid}"><strong>${esc(y.name)}</strong></a> <span class="chip status">${esc(y.category)}</span> — <span class="score-badge sm">${yScore != null ? yScore : '—'}</span></li>` : '';
  }).join('');

  const sourceMap = new Map((VA.sources || []).map(source => [source.id, source]));
  const sourceReferencesHtml = Array.from(citedSourceIds).map(sourceId => {
    const source = sourceMap.get(sourceId);
    if (!source) return `<li><code>${esc(sourceId)}</code> — Public source metadata unavailable</li>`;
    const title = esc(source.title || sourceId);
    const publisher = source.publisher ? ` <span class="muted">(${esc(source.publisher)})</span>` : '';
    const url = typeof source.url === 'string' && /^https?:\/\//i.test(source.url) ? source.url : null;
    return `<li><code>${esc(sourceId)}</code> — ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}${publisher}</li>`;
  }).join('');

  let html = `
<!-- Quick Read Header -->
<section class="section" style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.5rem;margin-bottom:1.5rem">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
    <div>
      <div class="eyebrow">${esc(x.category)} &nbsp;·&nbsp; ${esc(x.id)} &nbsp;·&nbsp; <span class="chip ${validationProven && valStatus === 'validated' ? 'success' : 'warn'}">${esc(validationDisplay)}</span></div>
      <h1 style="font-size:clamp(1.5rem,4vw,2.5rem);margin:0.4rem 0 0.6rem">${esc(x.name)}</h1>
      <p class="lede" style="margin-bottom:1rem;color:var(--text2);font-size:1.05rem">${esc(x.oneSentenceConcept || '')}</p>
      <div class="chips" style="margin-bottom:1rem">
        ${(x.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
      </div>
    </div>
    <div style="text-align:right;background:var(--panel2);padding:1rem 1.25rem;border-radius:var(--radius-sm);border:1px solid var(--line);min-width:160px">
      <div style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;font-weight:700">Opportunity Score</div>
      <div style="font-size:2.2rem;font-weight:800;color:var(--accent);line-height:1.1">${overallScoreNumDisplay}</div>
      <div style="font-size:0.78rem;color:var(--text2);margin-top:0.2rem">${esc(confidenceDisplay)}</div>
    </div>
  </div>

  <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)">
    <button class="button ${isFav(x.id) ? 'secondary' : 'primary'} sm" id="favDetail">
      ${isFav(x.id) ? '★ Favorited' : '☆ Favorite'}
    </button>
    <button class="button secondary sm" id="addCompareBtn">⚖️ Compare</button>
    <button class="button secondary sm" id="addRoomBtn">👥 Add to Room</button>
    <button class="button secondary sm" id="copyLink">🔗 Share</button>
    <a class="button ghost sm" href="${VA.base}/ideas/${esc(x.slug || x.id)}.md" download>↓ Dossier (.md)</a>
    <a class="button ghost sm" href="${VA.base}/docs/calculator.html">🧮 Calculator</a>
  </div>
</section>

<!-- AI Validation Panel -->
<section class="section" style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.5rem;margin-bottom:1.5rem">
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem">
    <h2 style="font-size:1.2rem;margin:0;display:inline-flex;align-items:center;gap:0.4rem">
      🤖 Continuous AI Validation Panel
    </h2>
    <span style="font-size:0.8rem;color:var(--muted)">Last Refreshed: ${esc(lastValidated)}</span>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:0.75rem;margin-bottom:1rem">
    <div style="padding:0.75rem;background:var(--panel2);border-radius:var(--radius-sm);border:1px solid var(--line)">
      <div style="font-size:0.75rem;color:var(--muted)">Algorithmic Composite</div>
      <div style="font-size:1.25rem;font-weight:700;color:var(--text)">${overallScoreDisplay}</div>
    </div>
    <div style="padding:0.75rem;background:var(--panel2);border-radius:var(--radius-sm);border:1px solid var(--line)">
      <div style="font-size:0.75rem;color:var(--muted)">Evidence Confidence</div>
      <div style="font-size:1.25rem;font-weight:700;color:var(--accent)">${esc(confidenceDisplay)}</div>
    </div>
    <div style="padding:0.75rem;background:var(--panel2);border-radius:var(--radius-sm);border:1px solid var(--line)">
      <div style="font-size:0.75rem;color:var(--muted)">Evidence Citations</div>
      <div style="font-size:1.25rem;font-weight:700;color:var(--text)">${sourcesCount} ${sourcesCount === 1 ? 'Citation' : 'Citations'}</div>
    </div>
    <div style="padding:0.75rem;background:var(--panel2);border-radius:var(--radius-sm);border:1px solid var(--line)">
      <div style="font-size:0.75rem;color:var(--muted)">Kill Criteria Status</div>
      <div style="font-size:1.25rem;font-weight:700;color:${killStatusColor}">${killStatusText}</div>
    </div>
  </div>

  <div class="fit-explanation-box" style="margin-bottom:1rem">
    <strong style="color:var(--accent)">🔍 Next Recommended Experiment:</strong> ${esc(x.atAGlance?.bestNextValidationStep || 'No idea-specific experiment designed yet.')}<br>
    <strong style="color:var(--warn)">⚠ Unverified Assumption:</strong> ${esc(x.atAGlance?.mainRisk || 'Not yet assessed.')}
  </div>

  <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
    <button class="button secondary sm" id="challengeClaimBtn">🚩 Challenge Claim</button>
    <button class="button primary sm" id="requestValidationBtn">⚡ Request Deeper Validation</button>
  </div>
  <div id="userFeedbackOutput" style="margin-top:0.75rem"></div>
</section>

<!-- At a Glance Matrix -->
<section class="section">
  <h2>Executive Overview</h2>
  <div class="glance-grid">
    ${glanceEntries.map(([l, v]) => `
    <div class="glance-item">
      <div class="label">${esc(l)}</div>
      <div class="value">${typeof v === 'string' && !v.startsWith('<') ? esc(v) : v}</div>
    </div>`).join('')}
  </div>
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

  if (scoreItems) {
    html += `
<section class="section">
  <h2>Detailed Dimension Scores</h2>
  <div class="score-grid">${scoreItems}</div>
</section>`;
  }

  html += objSection('Composite & Sub-Scores', x.compositeScores);
  html += objSection('Financial Model & Scenarios', x.financialModel);
  html += objSection('Validation Plan', x.validationPlan);
  html += objSection('Technical Blueprint', x.technicalBlueprint);
  html += objSection('Launch Strategy', x.launchPlan);
  if (sourceReferencesHtml) {
    html += `
<section class="section">
  <h2>Source References &amp; Citations</h2>
  <ul class="source-reference-list">${sourceReferencesHtml}</ul>
</section>`;
  }

  if (relatedHtml) {
    html += `
<section class="section">
  <h2>Related Venture Ideas</h2>
  <ul style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:0.75rem;padding:0;list-style:none">${relatedHtml}</ul>
</section>`;
  }

  container.innerHTML = html;

  // Bind Action Button Handlers
  $('#favDetail')?.addEventListener('click', function() {
    toggleFav(x.id, this);
    this.textContent = isFav(x.id) ? '★ Favorited' : '☆ Favorite';
  });

  $('#addCompareBtn')?.addEventListener('click', () => {
    let compareIds = window.VentureAtlas?.readJsonStorage('va-compare-ids', []) || [];
    if (!compareIds.includes(x.id)) compareIds.push(x.id);
    window.VentureAtlas?.writeJsonStorage('va-compare-ids', compareIds);
    window.location.href = `${VA.base}/docs/compare.html?ids=${compareIds.map(encodeURIComponent).join(',')}`;
  });

  $('#addRoomBtn')?.addEventListener('click', () => {
    let roomList = window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || [];
    if (!roomList.includes(x.id)) roomList.push(x.id);
    window.VentureAtlas?.writeJsonStorage('va-room-shortlist', roomList);
    window.location.href = `${VA.base}/docs/room.html`;
  });

  $('#copyLink')?.addEventListener('click', () => {
    navigator.clipboard.writeText(location.href).then(() => alert('Share link copied to clipboard!'));
  });

  $('#challengeClaimBtn')?.addEventListener('click', () => {
    const out = $('#userFeedbackOutput');
    if (!out) return;
    out.innerHTML = `
      <div style="background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:1rem">
        <h4 style="margin:0 0 0.5rem">🚩 Challenge a Claim on ${esc(x.name)}</h4>
        <textarea id="challengeText" placeholder="Describe contradictory evidence or invalid assumptions..." style="width:100%;height:80px;padding:0.5rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);margin-bottom:0.5rem"></textarea>
        <div style="display:flex;gap:0.5rem">
          <button class="button primary sm" id="saveChallengeBtn">Save Local Challenge</button>
          <button class="button ghost sm" id="cancelFeedbackBtn">Cancel</button>
        </div>
      </div>
    `;
    $('#cancelFeedbackBtn')?.addEventListener('click', () => { out.innerHTML = ''; });
    $('#saveChallengeBtn')?.addEventListener('click', () => {
      const txt = $('#challengeText')?.value.trim();
      if (!txt) return;
      const challenges = window.VentureAtlas?.readJsonStorage('va-user-challenges', []) || [];
      challenges.push({ ideaId: x.id, ideaName: x.name, challenge: txt, timestamp: new Date().toISOString() });
      window.VentureAtlas?.writeJsonStorage('va-user-challenges', challenges);
      out.innerHTML = `<div style="color:var(--score-hi);font-size:0.9rem;padding:0.5rem 0">✓ Challenge saved locally (${challenges.length} total saved). You can export decision packets from the Collaboration Room.</div>`;
    });
  });

  $('#requestValidationBtn')?.addEventListener('click', () => {
    const out = $('#userFeedbackOutput');
    if (!out) return;
    const reqs = window.VentureAtlas?.readJsonStorage('va-validation-requests', []) || [];
    if (!reqs.some(r => r.ideaId === x.id)) {
      reqs.push({ ideaId: x.id, ideaName: x.name, requestedAt: new Date().toISOString(), status: 'queued_local' });
      window.VentureAtlas?.writeJsonStorage('va-validation-requests', reqs);
    }
    out.innerHTML = `<div style="color:var(--accent);font-size:0.9rem;padding:0.5rem 0">⚡ Validation request logged locally for <strong>${esc(x.name)}</strong> (${reqs.length} queued in local session).</div>`;
  });
}

/* ================================================================
   PROMPTS PAGE
   ================================================================ */
function initPrompts() {
  const q = $('#promptSearch');
  const container = $('#promptList');
  const count = $('#promptCount');
  if (!container) return;

  function render() {
    const term = q ? q.value.toLowerCase().trim() : '';
    const uId = params().get('id');

    let xs = Array.isArray(VA.prompts) ? [...VA.prompts] : [];
    if (uId) {
      xs = xs.filter(p => p.ideaId === uId || p.id === uId);
    }
    if (term) {
      xs = xs.filter(p =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.type || '').toLowerCase().includes(term) ||
        (p.ideaId || '').toLowerCase().includes(term) ||
        (p.prompt || p.text || '').toLowerCase().includes(term)
      );
    }

    if (count) count.textContent = `${xs.length.toLocaleString()} prompt templates`;

    if (!xs.length) {
      container.innerHTML = `<div class="empty">No prompt templates match your search.</div>`;
      return;
    }

    container.innerHTML = xs.slice(0, 100).map(p => `
<div class="card" style="padding:1rem">
  <div class="eyebrow">${esc(p.ideaId || 'General')} · ${esc(p.type || 'Research')}</div>
  <h3 style="font-size:1rem;margin:0.3rem 0">${esc(p.title || 'Prompt Template')}</h3>
  <div style="font-size:0.8rem;background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);border:1px solid var(--line);font-family:monospace;white-space:pre-wrap;max-height:160px;overflow:auto;margin:0.5rem 0">${esc((p.prompt || p.text || '').slice(0, 400))}${(p.prompt || p.text || '').length > 400 ? '…' : ''}</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(p.ideaId || '')}" style="font-size:0.8rem">View Idea →</a>
    <button class="button secondary sm" data-action="copy-prompt" data-text="${esc(p.prompt || p.text || '')}">📋 Copy Prompt</button>
  </div>
</div>`).join('');
  }

  q?.addEventListener('input', render);
  render();

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="copy-prompt"]');
    if (!btn) return;
    const txt = btn.getAttribute('data-text');
    if (txt) {
      navigator.clipboard.writeText(txt).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy Prompt'; }, 1500);
      });
    }
  });
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
  ${s.url ? `<div style="margin:0.25rem 0"><a href="${sanitizeUrl(s.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.82rem;word-break:break-all">${esc(s.url)}</a></div>` : ''}
  <div class="source-meta">
    <span>${esc(s.id || '')}</span>
    ${s.publisher ? `<span>${esc(s.publisher)}</span>` : ''}
    ${s.date ? `<span>${esc(s.date)}</span>` : ''}
    ${s.type ? `<span>${esc(s.type)}</span>` : ''}
    ${s.researchRound ? `<span>Round ${esc(s.researchRound)}</span>` : ''}
    ${s.confidenceLabel ? `<span class="confidence-badge ${esc(s.confidenceLabel)}">${esc(s.confidenceLabel)}</span>` : ''}
  </div>
  ${s.supports ? `<div style="margin-top:0.4rem;font-size:0.8rem;color:var(--muted)">Supports: ${(s.supports || []).map(esc).join(', ')}</div>` : ''}
  ${s.importantCaveat ? `<div class="notice" style="margin-top:0.5rem;font-size:0.8rem">⚠ ${esc(s.importantCaveat)}</div>` : ''}
</div>`).join('');
  }

  q?.addEventListener('input', render);
  render();
}

/* ================================================================
   RELATIONSHIP GRAPH (DYNAMIC NODE CAP & TRUNCATION NOTICE)
   ================================================================ */
function initGraph() {
  const svg = $('#graph');
  if (!svg) return;

  const GRAPH_NODE_CAP = 100;
  const W = 1200, H = 620;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const totalCount = VA.ideas.length;
  const nodes = VA.ideas.slice(0, GRAPH_NODE_CAP).map((x, i) => ({
    ...x,
    cx: 80 + (i % 10) * 114,
    cy: 55 + Math.floor(i / 10) * 88
  }));

  const allowed = new Set(nodes.map(x => x.id));
  const edges = (VA.relationships || [])
    .filter(e => allowed.has(e.source) && allowed.has(e.target))
    .slice(0, 150);

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
<a href="idea.html?id=${encodeURIComponent(n.id)}" tabindex="0">
  <circle cx="${n.cx}" cy="${n.cy}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <text x="${n.cx}" y="${n.cy + 4}" text-anchor="middle" font-size="8" fill="${stroke}" font-weight="700">${esc(n.id.slice(-3))}</text>
  <title>${esc(n.name)} — ${n.atAGlance?.overallScore ?? '?'}</title>
</a>`;
  }).join('');

  let infoNotice = '';
  if (totalCount > GRAPH_NODE_CAP) {
    infoNotice = `<text x="20" y="${H - 15}" font-size="11" fill="var(--muted)">Showing top ${GRAPH_NODE_CAP} of ${totalCount} nodes for layout readability.</text>`;
  }

  svg.innerHTML = lines + circles + infoNotice;
}

/* ================================================================
   CATEGORIES PAGE
   ================================================================ */
function initCategories() {
  const container = $('#categoryGrid');
  if (!container) return;

  container.innerHTML = VA.categories.map(c => `
<div class="card" style="cursor:pointer" data-action="open-category" data-category="${esc(c.name)}">
  <div class="eyebrow">${esc(c.name)}</div>
  <h3 style="font-size:1rem;margin:0.25rem 0">${esc(c.name)}</h3>
  <p style="font-size:0.82rem">${esc(c.description || '')}</p>
  <div style="margin-top:auto;font-weight:700;color:var(--accent);font-size:1.1rem">${c.count || 0}</div>
  <div style="font-size:0.78rem;color:var(--muted)">idea${(c.count || 0) !== 1 ? 's' : ''}</div>
</div>`).join('');

  container.addEventListener('click', e => {
    const cardEl = e.target.closest('[data-action="open-category"]');
    if (!cardEl) return;
    const catName = cardEl.getAttribute('data-category');
    if (catName) {
      location.href = `${VA.base}/index.html?category=${encodeURIComponent(catName)}`;
    }
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobileNavToggle') || document.getElementById('navToggle');
  const drawer = document.getElementById('mobileNavDrawer') || document.getElementById('navlinks');
  if (!toggle || !drawer) return;

  function closeMenu() {
    drawer.classList.remove('open');
    drawer.style.display = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = toggle.id === 'mobileNavToggle' ? '☰ Menu' : '☰';
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    drawer.classList.add('open');
    drawer.style.display = 'block';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = toggle.id === 'mobileNavToggle' ? '✕ Close' : '✕';
    document.body.classList.add('nav-open');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('open') || (drawer.style.display && drawer.style.display !== 'none');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
window.initMobileNav = initMobileNav;

function fillMetrics() {
  if (!VA.meta || !VA.meta.counts) return;
  const c = VA.meta.counts;
  const els = {
    '[data-metric="ideas"]': c.canonicalIdeas ?? c.ideas ?? null,
    '[data-metric="staged"]': c.stagedIdeas ?? null,
    '[data-metric="total"]': c.totalIdeas ?? null,
    '[data-metric="categories"]': c.categories ?? null,
    '[data-metric="sources"]': c.sources ?? null,
    '[data-metric="prompts"]': c.prompts ?? null
  };
  for (const [selector, val] of Object.entries(els)) {
    if (val === null || val === undefined) continue;
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
    });
  }
}

/* ================================================================
   ENTRY POINT & REUSABLE ERROR HANDLING
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadData();
  } catch (err) {
    const mainEl = document.querySelector('main') || document.body;
    mainEl.insertAdjacentHTML('afterbegin', `
<div class="notice" style="margin:2rem;background:var(--score-lo-bg);border:1px solid var(--score-lo);padding:1.5rem;border-radius:8px">
  <h3>⚠ Data Loading Failure</h3>
  <p>Venture Atlas OS encountered an error loading dataset resources: ${esc(err.message)}</p>
  <button onclick="location.reload()" class="button sm" style="margin-top:0.5rem">Retry Loading</button>
</div>`);
  }

  themeInit();
  initKeyboard();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${VA.base}/sw.js`).catch(() => {});
  }

  const page = document.body.dataset.page;
  const hasHeader = document.querySelector('.site-header');
  if (!hasHeader) {
    document.body.insertAdjacentHTML('afterbegin', `
<a href="#main" class="skip">Skip to content</a>
<header class="site-header" role="banner">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="${VA.base}/index.html">Venture Atlas OS</a>
    <div class="navlinks desktop-navlinks">
      <a href="${VA.base}/index.html">Ideas</a>
      <a href="${VA.base}/docs/rankings.html">Rankings</a>
      <a href="${VA.base}/docs/compare.html">Compare</a>
      <a href="${VA.base}/docs/matcher.html">Matcher</a>
      <a href="${VA.base}/docs/categories.html">Categories</a>
      <a href="${VA.base}/docs/dossiers.html">Dossiers</a>
      <a href="${VA.base}/docs/research.html">Research</a>
      <a href="${VA.base}/docs/sources.html">Sources</a>
      <a href="${VA.base}/docs/prompts.html">Prompts</a>
      <a href="${VA.base}/docs/timeline.html">Timeline</a>
      <a href="${VA.base}/docs/decisions.html">Decisions</a>
      <a href="${VA.base}/docs/room.html" style="color:var(--accent);font-weight:700">Rooms</a>
      <a href="${VA.base}/docs/methodology.html">Methodology</a>
      <a href="${VA.base}/docs/about.html">About</a>
    </div>
    <div style="display:flex;align-items:center;gap:0.4rem;margin-left:auto">
      <button id="themeBtn" aria-label="Toggle dark mode">☾</button>
      <button id="mobileNavToggle" class="mobile-nav-toggle" aria-label="Toggle Navigation Menu">☰ Menu</button>
    </div>
  </nav>
  <div id="mobileNavDrawer" class="mobile-nav-drawer" style="display:none">
    <div class="mobile-nav-content">
      <a href="${VA.base}/index.html">💡 Ideas Directory</a>
      <a href="${VA.base}/docs/rankings.html">🏆 Decision Rankings</a>
      <a href="${VA.base}/docs/compare.html">⚖️ Compare Ideas</a>
      <a href="${VA.base}/docs/matcher.html">🎯 Idea Matcher</a>
      <a href="${VA.base}/docs/categories.html">📂 Categories</a>
      <a href="${VA.base}/docs/dossiers.html">📄 Dossiers</a>
      <a href="${VA.base}/docs/research.html">🔬 Continuous Research</a>
      <a href="${VA.base}/docs/sources.html">📚 Sources &amp; Evidence</a>
      <a href="${VA.base}/docs/prompts.html">🤖 AI Research Prompts</a>
      <a href="${VA.base}/docs/timeline.html">📅 Research Timeline</a>
      <a href="${VA.base}/docs/decisions.html">🏛️ Decision Log</a>
      <a href="${VA.base}/docs/room.html">👥 Collaboration Rooms</a>
      <a href="${VA.base}/docs/methodology.html">📖 Research Constitution</a>
      <a href="${VA.base}/docs/about.html">ℹ️ About Venture Atlas</a>
    </div>
  </div>
</header>`);
    themeInit();
  }

  if (!document.querySelector('.footer')) {
    document.body.insertAdjacentHTML('beforeend', `
<footer class="footer" role="contentinfo">
  Decision support, not financial advice. Scores and scenarios are not guarantees. &nbsp;
  <a href="${VA.base}/research/completeness-audit.md">Completeness audit</a> · 
  <a href="${VA.base}/docs/methodology.html">Methodology</a> · 
  <a href="${VA.base}/docs/about.html">About</a>
</footer>`);
  }

  fillMetrics();
  initMobileNav();

  if (page === 'home')          initHome();
  if (page === 'idea')          initIdea();
  if (page === 'compare')       initCompare();
  if (page === 'rankings')      initRankings();
  if (page === 'prompts')       initPrompts();
  if (page === 'sources')       initSources();
  if (page === 'relationships') initGraph();
  if (page === 'categories')    initCategories();

  window.dispatchEvent(new CustomEvent('va:ready', { detail: { ideas: VA.ideas, categories: VA.categories } }));
});
