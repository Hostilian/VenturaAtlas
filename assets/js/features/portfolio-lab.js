/**
 * VenturaAtlas ORBIT — Portfolio Lab UI Controller
 * Wires the Portfolio Lab page (docs/portfolio-lab.html) to the portfolio engine.
 * Uses localStorage for persistence. Loads data from JSON files via fetch.
 * All allocation values are recommendations — never presented as exact or binding.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

const PortfolioLab = (() => {
  const STORAGE_KEY_PORTFOLIOS = 'va_orbit_portfolios';
  const STORAGE_KEY_ACTIVE     = 'va_orbit_active_portfolio';
  const STORAGE_KEY_FORECASTS  = 'va_orbit_forecasts';
  const STORAGE_KEY_SNAPSHOTS  = 'va_orbit_snapshots';

  let _ideas       = [];
  let _riskFactors = [];
  let _assets      = [];
  let _seedPortfolios = [];
  let _portfolios  = [];   // user's portfolios (localStorage)
  let _forecasts   = [];   // user's forecasts (localStorage)
  let _activePortfolioId = null;
  let _currentTab  = 'tab-build';

  const E = id => document.getElementById(id);
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ─────────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────────────────────────────────────

  const ROOT = (() => {
    const body = document.body;
    return body.dataset.root || '..';
  })();

  async function loadData() {
    try {
      const [ideasRes, rfRes, assetsRes, portfoliosRes] = await Promise.all([
        fetch(`${ROOT}/data/ideas.json`),
        fetch(`${ROOT}/data/portfolio-risk-factors.json`),
        fetch(`${ROOT}/data/strategic-assets.json`),
        fetch(`${ROOT}/data/portfolios.json`)
      ]);

      const ideasJson    = await ideasRes.json();
      const rfJson       = await rfRes.json();
      const assetsJson   = await assetsRes.json();
      const portfoliosJson = await portfoliosRes.json();

      _ideas       = ideasJson.ideas || [];
      _riskFactors = rfJson.riskFactors || [];
      _assets      = assetsJson.assets || [];
      _seedPortfolios = portfoliosJson.portfolios || [];

    } catch (err) {
      console.error('[PortfolioLab] Data load error:', err);
    }

    // Load user portfolios from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PORTFOLIOS);
      _portfolios = stored ? JSON.parse(stored) : [];
    } catch { _portfolios = []; }

    // Load user forecasts from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FORECASTS);
      _forecasts = stored ? JSON.parse(stored) : [];
    } catch { _forecasts = []; }

    // Merge seed portfolios (if not already imported)
    _seedPortfolios.forEach(sp => {
      if (!_portfolios.find(p => p.portfolioId === sp.portfolioId)) {
        _portfolios.push({ ...sp, _isSeed: true });
      }
    });

    // Restore active portfolio
    try {
      _activePortfolioId = localStorage.getItem(STORAGE_KEY_ACTIVE) || (_portfolios[0] || {}).portfolioId || null;
    } catch { _activePortfolioId = null; }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────────────

  function savePortfolios() {
    try { localStorage.setItem(STORAGE_KEY_PORTFOLIOS, JSON.stringify(_portfolios)); } catch {}
  }

  function saveForecasts() {
    try { localStorage.setItem(STORAGE_KEY_FORECASTS, JSON.stringify(_forecasts)); } catch {}
  }

  function setActivePortfolio(id) {
    _activePortfolioId = id;
    try { localStorage.setItem(STORAGE_KEY_ACTIVE, id); } catch {}
  }

  function getActivePortfolio() {
    return _portfolios.find(p => p.portfolioId === _activePortfolioId) || _portfolios[0] || null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAFE HTML
  // ─────────────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  function initTabs() {
    const tabs = qsa('[data-tab-btn]');
    const panels = qsa('[data-tab-panel]');

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tabBtn;
        tabs.forEach(t => { t.classList.toggle('active', t.dataset.tabBtn === target); t.setAttribute('aria-selected', t.dataset.tabBtn === target); });
        panels.forEach(p => { p.hidden = p.dataset.tabPanel !== target; });
        _currentTab = target;
        if (target === 'tab-analyze') renderAnalyzeTab();
        if (target === 'tab-forecasts') renderForecastsTab();
        if (target === 'tab-snapshot') renderSnapshotTab();
      });
    });

    // Activate first tab
    if (tabs.length > 0) tabs[0].click();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PORTFOLIO SELECTOR
  // ─────────────────────────────────────────────────────────────────────────

  function renderPortfolioSelector() {
    const sel = E('portfolioSelect');
    if (!sel) return;
    sel.innerHTML = _portfolios.map(p => `<option value="${esc(p.portfolioId)}" ${p.portfolioId === _activePortfolioId ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    sel.addEventListener('change', () => {
      setActivePortfolio(sel.value);
      renderBuildTab();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD TAB
  // ─────────────────────────────────────────────────────────────────────────

  function renderBuildTab() {
    const portfolio = getActivePortfolio();
    if (!portfolio) {
      const el = E('buildContent');
      if (el) el.innerHTML = '<p class="pl-notice">No portfolio loaded. Create one above.</p>';
      return;
    }

    renderEnvelopePanel(portfolio);
    renderBetsPanel(portfolio);
    renderIdeaSearch();
  }

  function renderEnvelopePanel(portfolio) {
    const env = portfolio.resourceEnvelope || {};
    const fields = [
      ['plHoursPerWeek',   'hoursPerWeek',      env.hoursPerWeek   || '',  'Available hours/week'],
      ['plAvailableCash',  'availableCash',      env.availableCash  || '',  'Available capital (€)'],
      ['plMaxActiveBets',  'maxActiveBets',      env.maxActiveBets  || 3,   'Max active bets (WIP limit)'],
      ['plReserveFraction','reserveFraction',    env.reserveFraction != null ? Math.round(env.reserveFraction * 100) : 20, 'Reserve % (do not allocate 100%)']
    ];

    const el = E('envelopePanel');
    if (!el) return;
    el.innerHTML = `
      <div class="pl-env-grid">
        ${fields.map(([id, key, val, label]) => `
          <label class="pl-field" for="${esc(id)}">
            <span class="pl-field-label">${esc(label)}</span>
            <input class="pl-input" id="${esc(id)}" type="number" value="${esc(val)}" data-env-key="${esc(key)}" min="0">
          </label>`).join('')}
        <label class="pl-field" for="plObjective">
          <span class="pl-field-label">Strategic objective</span>
          <select class="pl-input" id="plObjective" data-env-key="objectiveProfile">
            ${[
              ['maximize_first_revenue',     '🏦 Maximize first revenue'],
              ['maximize_long_term_equity',  '🚀 Maximize long-term equity'],
              ['maximize_learning_per_dollar','📚 Maximize learning per €'],
              ['maximize_reusable_assets',   '🔧 Maximize reusable assets'],
              ['maximize_strategic_optionality','🎯 Maximize strategic optionality'],
              ['minimize_downside',           '🛡 Minimize downside'],
              ['maximize_cashflow_plus_moonshot','⚡ Cashflow + moonshot exposure'],
              ['maximize_skill_development',  '🎓 Maximize skill development']
            ].map(([val, label]) => `<option value="${val}" ${portfolio.objectiveProfile === val ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <label class="pl-field" for="plRegime">
          <span class="pl-field-label">Strategic regime</span>
          <select class="pl-input" id="plRegime" data-env-key="strategicRegime">
            ${['SURVIVAL','CASHFLOW','EXPLORATION','GROWTH','SCALE'].map(r =>
              `<option value="${r}" ${portfolio.strategicRegime === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="pl-env-actions">
        <button class="button secondary pl-sm" id="saveEnvelopeBtn">Save constraints</button>
      </div>`;

    E('saveEnvelopeBtn').addEventListener('click', () => saveEnvelope(portfolio));
  }

  function saveEnvelope(portfolio) {
    const env = portfolio.resourceEnvelope || {};
    qsa('[data-env-key]', E('envelopePanel')).forEach(el => {
      const key = el.dataset.envKey;
      if (el.tagName === 'SELECT') {
        if (key === 'objectiveProfile') portfolio.objectiveProfile = el.value;
        else if (key === 'strategicRegime') portfolio.strategicRegime = el.value;
        else env[key] = el.value;
      } else {
        const val = parseFloat(el.value);
        if (!isNaN(val)) {
          if (key === 'reserveFraction') env.reserveFraction = val / 100;
          else env[key] = val;
        }
      }
    });
    portfolio.resourceEnvelope = env;
    portfolio.updatedAt = new Date().toISOString();
    savePortfolios();
    showToast('Constraints saved');
    if (_currentTab === 'tab-analyze') renderAnalyzeTab();
  }

  function renderBetsPanel(portfolio) {
    const el = E('betsPanel');
    if (!el) return;
    const bets = portfolio.bets || [];

    const ideaMap = {};
    _ideas.forEach(i => { ideaMap[i.id] = i; });

    if (bets.length === 0) {
      el.innerHTML = `<div class="pl-empty">No bets yet. Search for an idea below and click <strong>Add to Portfolio</strong>.</div>`;
      return;
    }

    el.innerHTML = bets.map((bet, idx) => {
      const idea = ideaMap[bet.ideaId];
      const score = idea?.atAGlance?.overallScore;
      const roleBadge = { ACTIVE: '🟢', RESERVED: '🔵', WATCH: '👁', PARKED: '⏸' }[bet.portfolioRole] || '○';
      const revBadge = { HIGHLY_REVERSIBLE: '↩↩', REVERSIBLE: '↩', PARTIALLY_REVERSIBLE: '↩?', EXPENSIVE_TO_REVERSE: '⚠', IRREVERSIBLE: '🔒' }[bet.reversibility] || '?';
      const levelLabel = (PortfolioEngine.COMMITMENT_LEVELS[bet.commitmentLevel] || {}).shortLabel || `L${bet.commitmentLevel}`;

      return `
        <div class="pl-bet-card" data-bet-idx="${idx}">
          <div class="pl-bet-header">
            <span class="pl-bet-role" title="Portfolio role">${roleBadge}</span>
            <span class="pl-bet-name">${esc(idea?.name || bet.ideaId)}</span>
            ${score != null ? `<span class="score-badge score-${score >= 80 ? 'hi' : score >= 60 ? 'md' : 'lo'}">${score}</span>` : ''}
          </div>
          <div class="pl-bet-meta">
            <span class="pl-badge">${esc(levelLabel)}</span>
            <span class="pl-badge" title="Reversibility">${esc(revBadge)} ${esc(bet.reversibility?.replace(/_/g,' ') || 'unknown')}</span>
            ${bet.sequenceOrder != null ? `<span class="pl-badge">Step ${bet.sequenceOrder}</span>` : ''}
          </div>
          <div class="pl-bet-actions">
            <select class="pl-input pl-input-sm" data-bet-field="portfolioRole" data-bet-idx="${idx}">
              ${['ACTIVE','RESERVED','WATCH','PARKED'].map(r => `<option value="${r}" ${bet.portfolioRole === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
            <select class="pl-input pl-input-sm" data-bet-field="commitmentLevel" data-bet-idx="${idx}">
              ${PortfolioEngine.COMMITMENT_LEVELS.map(l => `<option value="${l.level}" ${bet.commitmentLevel === l.level ? 'selected' : ''}>${l.level} — ${l.shortLabel}</option>`).join('')}
            </select>
            <select class="pl-input pl-input-sm" data-bet-field="reversibility" data-bet-idx="${idx}">
              ${['HIGHLY_REVERSIBLE','REVERSIBLE','PARTIALLY_REVERSIBLE','EXPENSIVE_TO_REVERSE','IRREVERSIBLE'].map(r => `<option value="${r}" ${bet.reversibility === r ? 'selected' : ''}>${r.replace(/_/g,' ')}</option>`).join('')}
            </select>
            <button class="button ghost pl-sm" data-remove-bet="${idx}">✕ Remove</button>
          </div>
        </div>`;
    }).join('');

    // Wire field changes
    qsa('[data-bet-field]', el).forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.betIdx);
        const field = sel.dataset.betField;
        const val = field === 'commitmentLevel' ? parseInt(sel.value) : sel.value;
        portfolio.bets[idx][field] = val;
        portfolio.updatedAt = new Date().toISOString();
        savePortfolios();
        if (_currentTab === 'tab-analyze') renderAnalyzeTab();
      });
    });

    // Wire remove buttons
    qsa('[data-remove-bet]', el).forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.removeBet);
        portfolio.bets.splice(idx, 1);
        portfolio.updatedAt = new Date().toISOString();
        savePortfolios();
        renderBetsPanel(portfolio);
        if (_currentTab === 'tab-analyze') renderAnalyzeTab();
      });
    });
  }

  function renderIdeaSearch() {
    const searchEl = E('ideaSearch');
    const resultsEl = E('ideaSearchResults');
    if (!searchEl || !resultsEl) return;

    const doSearch = () => {
      const q = searchEl.value.trim().toLowerCase();
      if (q.length < 2) { resultsEl.innerHTML = ''; return; }

      const matches = _ideas
        .filter(i => i.status !== 'archived')
        .filter(i => (i.name || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q) || (i.atAGlance?.targetCustomer || '').toLowerCase().includes(q))
        .slice(0, 12);

      const portfolio = getActivePortfolio();
      const selectedIds = new Set((portfolio?.bets || []).map(b => b.ideaId));

      resultsEl.innerHTML = matches.map(idea => {
        const score = idea.atAGlance?.overallScore;
        const inPortfolio = selectedIds.has(idea.id);
        return `<div class="pl-search-result ${inPortfolio ? 'in-portfolio' : ''}">
          <div class="pl-sr-main">
            <span class="pl-sr-name">${esc(idea.name)}</span>
            ${score != null ? `<span class="score-badge score-${score >= 80 ? 'hi' : score >= 60 ? 'md' : 'lo'}">${score}</span>` : ''}
            <span class="pl-sr-cat">${esc(idea.category || '')}</span>
          </div>
          <div class="pl-sr-actions">
            ${inPortfolio
              ? `<span class="pl-badge pl-badge-green">✓ In portfolio</span>`
              : `<button class="button secondary pl-sm" data-add-idea="${esc(idea.id)}">+ Add bet</button>`}
          </div>
        </div>`;
      }).join('');

      qsa('[data-add-idea]', resultsEl).forEach(btn => {
        btn.addEventListener('click', () => addIdeaToBet(btn.dataset.addIdea));
      });
    };

    searchEl.addEventListener('input', doSearch);
  }

  function addIdeaToBet(ideaId) {
    const portfolio = getActivePortfolio();
    if (!portfolio) return;

    const exists = (portfolio.bets || []).find(b => b.ideaId === ideaId);
    if (exists) { showToast('Already in portfolio'); return; }

    const maxActive = portfolio.resourceEnvelope?.maxActiveBets || 5;
    const activeCount = (portfolio.bets || []).filter(b => b.portfolioRole === 'ACTIVE').length;
    const role = activeCount < maxActive ? 'ACTIVE' : 'RESERVED';

    const newBet = {
      betId:           `bet-${ideaId}-${Date.now()}`,
      ideaId,
      portfolioRole:   role,
      commitmentLevel: 1,
      reversibility:   'HIGHLY_REVERSIBLE',
      sequenceOrder:   (portfolio.bets || []).length + 1,
      dependsOnBetIds: [],
      unlocksAfterSuccess: []
    };

    if (!portfolio.bets) portfolio.bets = [];
    portfolio.bets.push(newBet);
    portfolio.updatedAt = new Date().toISOString();
    savePortfolios();

    if (role === 'RESERVED') showToast('WIP limit reached — added as RESERVED');
    else showToast('Bet added to portfolio');

    renderBetsPanel(portfolio);
    if (_currentTab === 'tab-analyze') renderAnalyzeTab();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYZE TAB
  // ─────────────────────────────────────────────────────────────────────────

  function renderAnalyzeTab() {
    const portfolio = getActivePortfolio();
    const el = E('analyzeContent');
    if (!el) return;
    if (!portfolio) { el.innerHTML = '<p class="pl-notice">Select a portfolio first.</p>'; return; }

    const bets = portfolio.bets || [];
    const env = portfolio.resourceEnvelope || {};

    // Resource summary
    const rs = PortfolioEngine.buildResourceSummary(env, bets);

    // Attention load
    const attn = PortfolioEngine.estimateAttentionLoad(bets, _ideas);

    // Risk concentration
    const conc = PortfolioEngine.detectRiskConcentration(bets, _riskFactors);

    // Synergies
    const syn = PortfolioEngine.detectSynergies(bets, _assets, _ideas);

    // Sequence
    const seq = PortfolioEngine.generateSequence(bets);

    // Pareto (compare this portfolio against seed portfolios for context)
    const allPortfolios = _portfolios.map(p => ({
      id:      p.portfolioId,
      name:    p.name,
      metrics: PortfolioEngine.derivePortfolioMetrics(p, _ideas)
    }));
    const pareto = PortfolioEngine.computeParetoFrontier(allPortfolios, 'expectedUpside', 'optionValue');

    // Opportunity cost
    const oppCost = PortfolioEngine.computeOpportunityCost(portfolio, _ideas);

    // Fragility
    const fragility = PortfolioEngine.assessFragility(portfolio, _riskFactors, _ideas);

    el.innerHTML = `
      ${renderResourceCard(rs, attn, env)}
      ${renderFragilityCard(fragility)}
      ${renderRiskHeatmap(conc, bets)}
      ${renderSynergiesCard(syn)}
      ${renderSequenceCard(seq)}
      ${renderParetoCard(pareto, portfolio.portfolioId)}
      ${renderOpportunityCostCard(oppCost)}
    `;
  }

  function renderResourceCard(rs, attn, env) {
    const warn = s => s ? '<span class="pl-warn">⚠</span>' : '';
    const pct = v => v != null ? `${Math.round(v * 100)}%` : 'N/A';

    return `<div class="pl-card">
      <h3 class="pl-card-title">Resource Envelope</h3>
      <div class="pl-metrics-row">
        <div class="pl-metric">
          <span class="pl-metric-val ${rs.hoursOverallocated ? 'val-warn' : ''}">${rs.totalHoursCommitted.toFixed(1)} / ${rs.committableHoursPerWeek.toFixed(1)}</span>
          <span class="pl-metric-label">hrs/week committed / committable ${warn(rs.hoursOverallocated)}</span>
        </div>
        <div class="pl-metric">
          <span class="pl-metric-val ${rs.cashOverallocated ? 'val-warn' : ''}">€${rs.totalCapitalCommittedLow}–${rs.totalCapitalCommittedHigh} / €${rs.committableCash}</span>
          <span class="pl-metric-label">capital committed / committable ${warn(rs.cashOverallocated)}</span>
        </div>
        <div class="pl-metric">
          <span class="pl-metric-val ${rs.runwayWarning ? 'val-warn' : ''}">${rs.runwayMonths != null ? rs.runwayMonths.toFixed(1) + ' mo' : '—'}</span>
          <span class="pl-metric-label">runway ${warn(rs.runwayWarning)}</span>
        </div>
        <div class="pl-metric">
          <span class="pl-metric-val ${rs.wipOverLimit ? 'val-warn' : ''}">${rs.activeCount} / ${rs.maxActiveBets === Infinity ? '∞' : rs.maxActiveBets}</span>
          <span class="pl-metric-label">active bets / WIP limit ${warn(rs.wipOverLimit)}</span>
        </div>
        <div class="pl-metric">
          <span class="pl-metric-val pl-attn-${attn.band}">${attn.band.toUpperCase()}</span>
          <span class="pl-metric-label">attention load</span>
        </div>
        <div class="pl-metric">
          <span class="pl-metric-val">${pct(env.reserveFraction)}</span>
          <span class="pl-metric-label">reserve capacity</span>
        </div>
      </div>
      ${attn.rationale ? `<p class="pl-note">${esc(attn.rationale)}</p>` : ''}
      ${rs.hoursOverallocated ? '<div class="pl-alert pl-alert-warn">⚠ Hours over-allocated. Reduce active bets or extend timeline.</div>' : ''}
      ${rs.wipOverLimit ? '<div class="pl-alert pl-alert-warn">⚠ WIP limit exceeded. Consider parking a bet before starting another.</div>' : ''}
      ${rs.runwayWarning ? '<div class="pl-alert pl-alert-warn">⚠ Less than 3 months runway at current burn ceiling.</div>' : ''}
    </div>`;
  }

  function renderFragilityCard(fragility) {
    const icons = { fragile: '🔴', moderate: '🟡', robust: '🟢', unknown: '⚪' };
    return `<div class="pl-card">
      <h3 class="pl-card-title">Portfolio Fragility <span class="pl-fragility-icon">${icons[fragility.level] || '⚪'}</span> ${fragility.level.toUpperCase()}</h3>
      <p class="pl-note">A portfolio is fragile if a small assumption change destroys most of its appeal.</p>
      <ul class="pl-list">
        ${(fragility.rationale || []).map(r => `<li>${esc(r)}</li>`).join('')}
      </ul>
    </div>`;
  }

  function renderRiskHeatmap(conc, bets) {
    if (!conc || conc.length === 0) {
      return `<div class="pl-card"><h3 class="pl-card-title">Risk Concentration</h3><p class="pl-note">No shared risk factors detected across current bets, or risk factor data unavailable.</p></div>`;
    }

    const betIds = bets.map(b => b.ideaId);
    const levelColor = { high: 'hm-high', medium: 'hm-medium', low: 'hm-low', none: 'hm-none' };

    return `<div class="pl-card">
      <h3 class="pl-card-title">Risk Concentration Heatmap</h3>
      <p class="pl-note">Two bets sharing a risk factor are <em>not</em> independent. Correlation ≠ bad — but hidden concentration ≠ diversification.</p>
      <div class="pl-heatmap">
        ${conc.map(rf => `
          <div class="pl-hm-row">
            <div class="pl-hm-label" title="${esc(rf.portfolioImplication)}">${esc(rf.name)}</div>
            <div class="pl-hm-cells">
              ${bets.map(b => {
                const exposed = (rf.exposedIdeaIds || []).includes(b.ideaId);
                const idea = _ideas.find(i => i.id === b.ideaId);
                return `<div class="pl-hm-cell ${exposed ? levelColor[rf.concentrationLevel] || 'hm-medium' : 'hm-none'}" title="${esc((idea?.name || b.ideaId) + (exposed ? ' — EXPOSED' : ' — not exposed'))}"></div>`;
              }).join('')}
            </div>
            <span class="pl-hm-level pl-badge pl-badge-${rf.concentrationLevel}">${rf.concentrationLevel}</span>
          </div>`).join('')}
        <div class="pl-hm-row pl-hm-labels-row">
          <div class="pl-hm-label"></div>
          <div class="pl-hm-cells">
            ${bets.map(b => {
              const idea = _ideas.find(i => i.id === b.ideaId);
              return `<div class="pl-hm-col-label" title="${esc(idea?.name || b.ideaId)}">${esc(idea?.name?.substring(0,8) || b.ideaId)}</div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <details class="pl-details">
        <summary>Concentration details</summary>
        ${conc.filter(r => r.concentrationLevel !== 'low').map(rf => `
          <div class="pl-conc-detail">
            <strong>${esc(rf.name)}</strong> — ${rf.exposedBetCount}/${rf.totalBets} bets exposed
            ${rf.syntheticNote ? `<p class="pl-note">${esc(rf.syntheticNote)}</p>` : ''}
            ${rf.portfolioImplication ? `<p class="pl-note">${esc(rf.portfolioImplication)}</p>` : ''}
          </div>`).join('')}
      </details>
    </div>`;
  }

  function renderSynergiesCard(syn) {
    if (!syn || syn.length === 0) {
      return `<div class="pl-card"><h3 class="pl-card-title">Synergies</h3><p class="pl-note">No significant synergies detected. Adding ideas from the same domain or with shared buyers creates shared learning and asset reuse.</p></div>`;
    }

    const typeLabel = { shared_asset: '🔧 Shared asset', shared_buyer: '👤 Shared buyer', shared_domain_knowledge: '📚 Domain knowledge' };

    return `<div class="pl-card">
      <h3 class="pl-card-title">Synergies — Portfolio Network Effects</h3>
      <p class="pl-note">Positive interactions between bets. Unlike risk correlation, these create shared value.</p>
      ${syn.map(s => `
        <div class="pl-synergy">
          <span class="pl-syn-type">${typeLabel[s.type] || s.type}</span>
          <span class="pl-syn-desc">${esc(s.description)}</span>
          ${s.compoundsOverTime ? '<span class="pl-badge pl-badge-green">⬆ Compounds over time</span>' : ''}
        </div>`).join('')}
    </div>`;
  }

  function renderSequenceCard(seq) {
    if (!seq || seq.length === 0) {
      return `<div class="pl-card"><h3 class="pl-card-title">Recommended Sequence</h3><p class="pl-note">Add bets to see a recommended sequence.</p></div>`;
    }

    return `<div class="pl-card">
      <h3 class="pl-card-title">Venture Sequence — Dependency-Aware Order</h3>
      <p class="pl-note">Sorted by dependency + reversibility preference. Earlier steps are more reversible and resolve the most uncertainty. This is a recommendation — venture-specific variants are valid.</p>
      <div class="pl-sequence">
        ${seq.map(step => {
          const idea = _ideas.find(i => i.id === step.ideaId);
          const revClass = { HIGHLY_REVERSIBLE: 'rev-high', REVERSIBLE: 'rev-med', PARTIALLY_REVERSIBLE: 'rev-part', EXPENSIVE_TO_REVERSE: 'rev-exp', IRREVERSIBLE: 'rev-irr' }[step.reversibility] || '';
          return `
          <div class="pl-seq-step">
            <div class="pl-seq-horizon pl-seq-${step.step === 1 ? 'now' : step.step === 2 ? 'next' : 'later'}">${esc(step.horizonLabel)}</div>
            <div class="pl-seq-body">
              <div class="pl-seq-name">${esc(idea?.name || step.ideaId)}</div>
              <div class="pl-seq-meta">
                <span class="pl-badge">${esc(step.commitmentLabel)}</span>
                <span class="pl-badge ${revClass}">${esc(step.reversibility?.replace(/_/g,' ') || '')}</span>
                <span class="pl-badge">${esc(step.portfolioRole || 'ACTIVE')}</span>
              </div>
              ${step.killCriteria?.length > 0 ? `<div class="pl-seq-kill">Kill if: ${step.killCriteria.map(k => esc(k)).join(' | ')}</div>` : ''}
              ${step.ifSuccess?.length > 0 ? `<div class="pl-seq-unlock">✓ Unlocks: ${step.ifSuccess.map(s => esc(s.title || s.betId)).join(', ')}</div>` : ''}
              ${step.preMortem ? `<div class="pl-seq-premortem">Pre-mortem: ${esc(step.preMortem.substring(0, 100))}${step.preMortem.length > 100 ? '…' : ''}</div>` : ''}
            </div>
          </div>
          ${step.step < seq.length ? '<div class="pl-seq-arrow">↓</div>' : ''}`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderParetoCard(pareto, activeId) {
    if (!pareto || pareto.length < 2) {
      return `<div class="pl-card"><h3 class="pl-card-title">Pareto Frontier</h3><p class="pl-note">Add at least 2 portfolios to compare on the Pareto frontier. A portfolio is dominated if another is no worse on every objective and better on at least one.</p></div>`;
    }

    return `<div class="pl-card">
      <h3 class="pl-card-title">Pareto Frontier — Portfolio Comparison</h3>
      <p class="pl-note">Axes: Expected Upside (avg idea score) vs. Option Value (reversibility + low commitment). Non-dominated portfolios appear on the frontier. Dominated portfolios can be improved without tradeoff.</p>
      <div class="pl-pareto-table-wrap">
        <table class="pl-table">
          <thead><tr><th>Portfolio</th><th>Expected Upside</th><th>Option Value</th><th>Learning Value</th><th>Capital Required</th><th>Status</th></tr></thead>
          <tbody>
            ${pareto.map(p => `
              <tr class="${p.id === activeId ? 'pl-row-active' : ''} ${p.dominated ? 'pl-row-dominated' : ''}">
                <td>${esc(p.name)} ${p.id === activeId ? '<span class="pl-badge pl-badge-green">current</span>' : ''}</td>
                <td><div class="pl-bar-wrap"><div class="pl-bar" style="width:${p.metrics.expectedUpside}%"></div>${p.metrics.expectedUpside}</div></td>
                <td><div class="pl-bar-wrap"><div class="pl-bar" style="width:${p.metrics.optionValue}%"></div>${p.metrics.optionValue}</div></td>
                <td><div class="pl-bar-wrap"><div class="pl-bar" style="width:${p.metrics.learningValue}%"></div>${p.metrics.learningValue}</div></td>
                <td><div class="pl-bar-wrap"><div class="pl-bar" style="width:${p.metrics.capitalRequired}%"></div>${p.metrics.capitalRequired}</div></td>
                <td>${p.paretoFrontier ? '<span class="pl-badge pl-badge-green">🏆 Frontier</span>' : '<span class="pl-badge pl-badge-muted">Dominated</span>'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="pl-note-small">Scores are derived mechanically from available data. Use as directional signal — not a precise ranking.</p>
    </div>`;
  }

  function renderOpportunityCostCard(oppCost) {
    if (!oppCost || oppCost.length === 0) return '';
    return `<div class="pl-card">
      <h3 class="pl-card-title">Opportunity Cost — Largest Parked Opportunities</h3>
      <p class="pl-note">These are the highest-scored ideas not in this portfolio. Every commitment has alternatives.</p>
      <div class="pl-opp-list">
        ${oppCost.map(o => `
          <div class="pl-opp-item">
            <span class="pl-opp-name">${esc(o.name || o.ideaId)}</span>
            ${o.score ? `<span class="score-badge score-${o.score >= 80 ? 'hi' : o.score >= 60 ? 'md' : 'lo'}">${o.score}</span>` : ''}
            ${o.isAntiPortfolio ? `<span class="pl-badge pl-badge-muted">Consciously excluded: ${esc(o.antiPortfolioReason?.replace(/_/g,' ') || '')}</span>` : ''}
            ${o.revivedWhen ? `<span class="pl-opp-revival">Revival trigger: ${esc(o.revivedWhen)}</span>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORECASTS TAB
  // ─────────────────────────────────────────────────────────────────────────

  function renderForecastsTab() {
    const el = E('forecastsContent');
    if (!el) return;

    const portfolio = getActivePortfolio();
    const calib = PortfolioEngine.summarizeCalibration(_forecasts);

    el.innerHTML = `
      ${renderForecastForm()}
      ${renderForecastList()}
      ${renderCalibrationPanel(calib)}
    `;

    E('createForecastBtn')?.addEventListener('click', handleCreateForecast);
  }

  function renderForecastForm() {
    return `<div class="pl-card">
      <h3 class="pl-card-title">Create Resolvable Forecast</h3>
      <p class="pl-note">A forecast must be resolvable with objective criteria defined <em>before</em> resolution. Immutable history — new information creates a revision, not a silent edit.</p>
      <div class="pl-forecast-form">
        <label class="pl-field" for="fcQuestion">
          <span class="pl-field-label">Question (must be resolvable)</span>
          <input class="pl-input" id="fcQuestion" type="text" placeholder="e.g. Will at least 2 buyers request a pilot by 2026-10-01?">
        </label>
        <label class="pl-field" for="fcCriteria">
          <span class="pl-field-label">Resolution criteria (objective, pre-committed)</span>
          <textarea class="pl-input" id="fcCriteria" rows="2" placeholder="e.g. 2 documented explicit pilot requests via email or call recording."></textarea>
        </label>
        <div class="pl-forecast-row">
          <label class="pl-field" for="fcDeadline">
            <span class="pl-field-label">Deadline</span>
            <input class="pl-input" id="fcDeadline" type="date">
          </label>
          <label class="pl-field" for="fcClass">
            <span class="pl-field-label">Question class</span>
            <select class="pl-input" id="fcClass">
              ${['customer_interest','conversion','technical_completion','cost','timeline','regulatory_event','competitor_event','distribution','retention','portfolio_level','other']
                .map(c => `<option value="${c}">${c.replace(/_/g,' ')}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="pl-forecast-row">
          <label class="pl-field" for="fcForecaster">
            <span class="pl-field-label">Your name / identifier</span>
            <input class="pl-input" id="fcForecaster" type="text" placeholder="e.g. Founder">
          </label>
          <label class="pl-field" for="fcProbability">
            <span class="pl-field-label">Your probability (0–100%)</span>
            <input class="pl-input" id="fcProbability" type="number" min="0" max="100" placeholder="e.g. 65">
          </label>
        </div>
        <label class="pl-field" for="fcReasoning">
          <span class="pl-field-label">Reasoning (preserve what you knew at submission time)</span>
          <textarea class="pl-input" id="fcReasoning" rows="2" placeholder="Brief rationale — becomes part of immutable history."></textarea>
        </label>
        <button class="button primary" id="createForecastBtn">Create Forecast</button>
      </div>
    </div>`;
  }

  function handleCreateForecast() {
    const q   = (E('fcQuestion')?.value || '').trim();
    const crit= (E('fcCriteria')?.value || '').trim();
    const ddl = E('fcDeadline')?.value;
    const cls = E('fcClass')?.value || 'other';
    const who = (E('fcForecaster')?.value || 'Anonymous').trim();
    const prob= parseFloat(E('fcProbability')?.value);
    const reason = (E('fcReasoning')?.value || '').trim();

    if (!q) { showToast('Question required'); return; }
    if (!crit) { showToast('Resolution criteria required'); return; }
    if (!ddl) { showToast('Deadline required'); return; }
    if (isNaN(prob) || prob < 0 || prob > 100) { showToast('Probability must be 0–100'); return; }

    const forecastId = `fcast-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const submissionId = `sub-${Date.now()}`;
    const now = new Date().toISOString();

    const forecast = {
      forecastId,
      schemaVersion: '1.0.0',
      question: q,
      resolutionType: 'binary',
      resolutionCriteria: crit,
      deadline: new Date(ddl).toISOString(),
      questionClass: cls,
      linkedPortfolioId: _activePortfolioId,
      linkedIdeaIds: [],
      linkedBetIds: [],
      submissions: [{
        submissionId,
        forecaster: who,
        forecasterId: who.toLowerCase().replace(/\s+/g,'-'),
        forecasterType: 'human',
        submittedAt: now,
        probability: prob / 100,
        reasoning: reason,
        informationAvailable: `Submitted at ${now}`,
        isRevision: false,
        revisesSubmissionId: null
      }],
      resolution: null,
      scoring: null,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    };

    _forecasts.push(forecast);
    saveForecasts();
    showToast('Forecast created');
    renderForecastsTab();
  }

  function renderForecastList() {
    if (_forecasts.length === 0) {
      return `<div class="pl-card"><h3 class="pl-card-title">Open Forecasts</h3><p class="pl-note">No forecasts yet. Create one above.</p></div>`;
    }

    const open     = _forecasts.filter(f => f.status === 'OPEN');
    const resolved = _forecasts.filter(f => f.status === 'RESOLVED');
    const now = Date.now();

    const renderForecast = (f) => {
      const disagreement = PortfolioEngine.detectForecasterDisagreement(f);
      const latestSubs = {};
      (f.submissions || []).forEach(s => {
        if (!latestSubs[s.forecasterId] || new Date(s.submittedAt) > new Date(latestSubs[s.forecasterId].submittedAt)) {
          latestSubs[s.forecasterId] = s;
        }
      });
      const subs = Object.values(latestSubs);
      const ensemble = subs.length > 0 ? subs.reduce((s, x) => s + x.probability, 0) / subs.length : null;
      const deadlineDate = new Date(f.deadline);
      const daysLeft = Math.round((deadlineDate - now) / 86400000);
      const overdue = daysLeft < 0 && f.status === 'OPEN';

      return `<div class="pl-forecast-card ${f.status === 'RESOLVED' ? 'fc-resolved' : ''} ${overdue ? 'fc-overdue' : ''}">
        <div class="pl-fc-header">
          <span class="pl-fc-status pl-badge pl-badge-${f.status === 'OPEN' ? 'blue' : f.status === 'RESOLVED' ? 'green' : 'muted'}">${f.status}</span>
          <span class="pl-fc-class pl-badge">${(f.questionClass || '').replace(/_/g,' ')}</span>
          ${overdue ? '<span class="pl-badge pl-badge-warn">OVERDUE</span>' : ''}
        </div>
        <div class="pl-fc-question">${esc(f.question)}</div>
        <div class="pl-fc-meta">
          <span>Deadline: ${deadlineDate.toLocaleDateString()}</span>
          ${daysLeft >= 0 ? `<span class="pl-note">${daysLeft}d remaining</span>` : ''}
        </div>
        <div class="pl-fc-subs">
          ${subs.map(s => `
            <div class="pl-fc-sub">
              <span class="pl-fc-who">${esc(s.forecaster)}</span>
              <span class="pl-fc-prob">${Math.round(s.probability * 100)}%</span>
            </div>`).join('')}
          ${subs.length > 1 && ensemble !== null ? `<div class="pl-fc-sub pl-fc-ensemble"><span class="pl-fc-who">Ensemble avg</span><span class="pl-fc-prob">${Math.round(ensemble * 100)}%</span></div>` : ''}
        </div>
        ${disagreement.level === 'high' ? `<div class="pl-alert pl-alert-info">🔍 High disagreement (${disagreement.range}pp spread). Disagreement may be the signal — identify the crux assumption.</div>` : ''}
        ${f.status === 'OPEN' ? `
          <div class="pl-fc-actions">
            <input class="pl-input pl-input-sm" type="number" min="0" max="100" placeholder="Update probability %" id="upd-prob-${f.forecastId}">
            <input class="pl-input pl-input-sm" type="text" placeholder="Your name" id="upd-who-${f.forecastId}">
            <button class="button secondary pl-sm" data-submit-update="${f.forecastId}">Submit revision</button>
            <button class="button ghost pl-sm" data-resolve-forecast="${f.forecastId}">Resolve forecast</button>
          </div>` : ''}
        ${f.status === 'RESOLVED' && f.scoring ? `
          <div class="pl-fc-scores">
            ${(f.scoring.scores || []).map(s => `<div class="pl-fc-score"><span>${esc(s.forecaster || s.forecasterId)}</span> Brier: <strong>${s.brierScore}</strong></div>`).join('')}
            <div class="pl-fc-score pl-fc-ensemble"><span>Ensemble</span> Brier: <strong>${f.scoring.ensembleScore}</strong></div>
            <div class="pl-fc-score pl-fc-naive"><span>Naive (50%) baseline</span> Brier: <strong>${f.scoring.naiveBaselineScore}</strong></div>
          </div>` : ''}
      </div>`;
    };

    return `
      <div class="pl-card">
        <h3 class="pl-card-title">Open Forecasts (${open.length})</h3>
        ${open.length > 0 ? open.map(renderForecast).join('') : '<p class="pl-note">None open.</p>'}
      </div>
      ${resolved.length > 0 ? `<div class="pl-card">
        <h3 class="pl-card-title">Resolved Forecasts (${resolved.length})</h3>
        ${resolved.map(renderForecast).join('')}
      </div>` : ''}`;
  }

  function renderCalibrationPanel(calib) {
    return `<div class="pl-card">
      <h3 class="pl-card-title">Calibration</h3>
      ${calib.overallWarning ? `<div class="pl-alert pl-alert-warn">⚠ ${esc(calib.overallWarning)}</div>` : ''}
      <p class="pl-note">Good calibration: events predicted at ~70% should occur ~70% of the time. Calibration requires many resolved forecasts — do not draw conclusions from small samples.</p>
      <table class="pl-table">
        <thead><tr><th>Forecast range</th><th>Forecasts</th><th>Observed rate</th><th>Expected</th><th>Gap</th></tr></thead>
        <tbody>
          ${calib.bins.map(bin => `
            <tr class="${bin.warning ? 'pl-row-muted' : ''}">
              <td>${esc(bin.label)}</td>
              <td>${bin.count}</td>
              <td>${bin.sufficient ? bin.observedRate + '%' : '<span class="pl-note">—</span>'}</td>
              <td>${bin.expectedRate}%</td>
              <td>${bin.sufficient ? (bin.observedRate - bin.expectedRate > 0 ? '+' : '') + (bin.observedRate - bin.expectedRate) + 'pp' : '—'}</td>
            </tr>
            ${bin.warning ? `<tr class="pl-row-muted"><td colspan="5" class="pl-note-small">⚠ ${esc(bin.warning)}</td></tr>` : ''}`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  // Wire forecast update / resolve actions (delegated)
  function wireForecastActions() {
    document.addEventListener('click', e => {
      if (e.target.dataset.submitUpdate) handleForecastUpdate(e.target.dataset.submitUpdate);
      if (e.target.dataset.resolveForecast) handleForecastResolve(e.target.dataset.resolveForecast);
    });
  }

  function handleForecastUpdate(forecastId) {
    const f = _forecasts.find(x => x.forecastId === forecastId);
    if (!f || f.status !== 'OPEN') return;
    const probEl = E(`upd-prob-${forecastId}`);
    const whoEl  = E(`upd-who-${forecastId}`);
    const prob = parseFloat(probEl?.value);
    const who  = (whoEl?.value || 'Anonymous').trim();
    if (isNaN(prob) || prob < 0 || prob > 100) { showToast('Probability must be 0–100'); return; }

    const now = new Date().toISOString();
    f.submissions.push({
      submissionId: `sub-${Date.now()}`,
      forecaster: who,
      forecasterId: who.toLowerCase().replace(/\s+/g,'-'),
      forecasterType: 'human',
      submittedAt: now,
      probability: prob / 100,
      reasoning: '',
      informationAvailable: `Revision submitted at ${now}`,
      isRevision: true,
      revisesSubmissionId: null
    });
    f.updatedAt = now;
    saveForecasts();
    showToast('Probability updated');
    renderForecastsTab();
  }

  function handleForecastResolve(forecastId) {
    const f = _forecasts.find(x => x.forecastId === forecastId);
    if (!f) return;

    const outcome = confirm(`Resolve "${f.question}"\n\nClick OK for YES (outcome occurred), Cancel for NO.`);
    const source = prompt('Evidence / source for resolution:') || '';
    const now = new Date().toISOString();

    f.resolution = { outcome, resolvedAt: now, resolvedBy: 'user', source, notes: '' };
    f.status = 'RESOLVED';
    f.updatedAt = now;

    // Score it
    f.scoring = PortfolioEngine.computeBrierScore(f);
    if (f.scoring) f.scoring.computedAt = now;

    saveForecasts();
    showToast('Forecast resolved and scored');
    renderForecastsTab();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SNAPSHOT TAB
  // ─────────────────────────────────────────────────────────────────────────

  function renderSnapshotTab() {
    const el = E('snapshotContent');
    if (!el) return;

    let snapshots = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
      snapshots = stored ? JSON.parse(stored) : [];
    } catch {}

    const portfolio = getActivePortfolio();

    el.innerHTML = `
      <div class="pl-card">
        <h3 class="pl-card-title">Portfolio Snapshot</h3>
        <p class="pl-note">Snapshots preserve portfolio state at a moment in time — for honest retrospective review. The point is to remember what you believed, not just the latest state.</p>
        <div class="pl-snapshot-actions">
          <input class="pl-input" type="text" id="snapshotTrigger" placeholder="Why are you snapshotting? (e.g. After bet resolution, pre-pivot)">
          <button class="button primary" id="takeSnapshotBtn">📸 Take Snapshot</button>
          <button class="button secondary" id="exportPortfolioBtn">⬇ Export Portfolio JSON</button>
        </div>
      </div>
      ${snapshots.length > 0 ? `
        <div class="pl-card">
          <h3 class="pl-card-title">Snapshot History</h3>
          <div class="pl-snapshot-list">
            ${[...snapshots].reverse().map(snap => `
              <div class="pl-snap-item">
                <div class="pl-snap-header">
                  <span class="pl-snap-date">${new Date(snap.takenAt).toLocaleString()}</span>
                  ${snap.trigger ? `<span class="pl-snap-trigger">${esc(snap.trigger)}</span>` : ''}
                </div>
                <div class="pl-snap-meta">
                  <span class="pl-badge">${snap.betCount || 0} bets</span>
                  <span class="pl-badge">${snap.portfolioName ? esc(snap.portfolioName) : 'Portfolio'}</span>
                </div>
                <details class="pl-details">
                  <summary>View snapshot</summary>
                  <pre class="pl-pre">${esc(JSON.stringify(snap.state, null, 2))}</pre>
                </details>
              </div>`).join('')}
          </div>
        </div>` : '<div class="pl-card"><p class="pl-note">No snapshots yet.</p></div>'}`;

    E('takeSnapshotBtn')?.addEventListener('click', () => {
      const trigger = (E('snapshotTrigger')?.value || '').trim();
      const snap = {
        snapshotId: `snap-${Date.now()}`,
        takenAt: new Date().toISOString(),
        trigger,
        portfolioId: portfolio?.portfolioId,
        portfolioName: portfolio?.name,
        betCount: (portfolio?.bets || []).length,
        forecastCount: _forecasts.length,
        state: {
          portfolio: portfolio ? JSON.parse(JSON.stringify(portfolio)) : null,
          forecasts: JSON.parse(JSON.stringify(_forecasts))
        }
      };
      snapshots.push(snap);
      try { localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots)); } catch {}
      showToast('Snapshot saved');
      renderSnapshotTab();
    });

    E('exportPortfolioBtn')?.addEventListener('click', () => {
      const export_ = {
        exportedAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
        portfolio: portfolio,
        forecasts: _forecasts,
        assets: _assets
      };
      const blob = new Blob([JSON.stringify(export_, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbit-portfolio-${(portfolio?.portfolioId || 'export').replace(/[^a-z0-9-]/gi,'_')}-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NEW PORTFOLIO CREATION
  // ─────────────────────────────────────────────────────────────────────────

  function handleCreatePortfolio() {
    const name = (E('newPortfolioName')?.value || '').trim();
    if (!name) { showToast('Portfolio name required'); return; }

    const id = `port-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const now = new Date().toISOString();

    const newPortfolio = {
      portfolioId: id,
      schemaVersion: '1.0.0',
      name,
      description: '',
      objectiveProfile: 'maximize_learning_per_dollar',
      strategicRegime: 'EXPLORATION',
      horizon: 'months',
      resourceEnvelope: {
        availableCash: 500,
        cashCurrency: 'EUR',
        monthlyBurnCeiling: 100,
        hoursPerWeek: 15,
        maxActiveBets: 3,
        maxIrreversibleCapital: 100,
        explorationLossBudget: 200,
        moonShotBudgetFraction: 0.1,
        reserveFraction: 0.2,
        technicalCapacity: 'medium',
        salesCapacity: 'low',
        researchCapacity: 'medium',
        designCapacity: 'low',
        operationalCapacity: 'low',
        attentionCapacity: 'medium'
      },
      bets: [],
      scenarios: [],
      constraints: [],
      antiPortfolio: [],
      snapshots: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'user'
    };

    _portfolios.push(newPortfolio);
    savePortfolios();
    setActivePortfolio(id);
    renderPortfolioSelector();
    renderBuildTab();
    showToast(`Portfolio "${name}" created`);
    const modal = E('newPortfolioModal');
    if (modal) modal.hidden = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────────────────────────────────

  function showToast(msg) {
    let toast = E('plToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'plToast';
      toast.className = 'pl-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  async function init() {
    await loadData();
    initTabs();
    renderPortfolioSelector();
    renderBuildTab();
    wireForecastActions();

    E('createPortfolioBtn')?.addEventListener('click', () => {
      const modal = E('newPortfolioModal');
      if (modal) modal.hidden = !modal.hidden;
    });

    E('confirmCreatePortfolioBtn')?.addEventListener('click', handleCreatePortfolio);

    E('portfolioSelect')?.addEventListener('change', () => {
      setActivePortfolio(E('portfolioSelect').value);
      renderBuildTab();
      if (_currentTab === 'tab-analyze') renderAnalyzeTab();
    });

    // Theme toggle (reuse existing pattern)
    const themeBtn = E('themeBtn');
    const html = document.documentElement;
    const stored = localStorage.getItem('va_theme');
    if (stored) html.dataset.theme = stored;
    themeBtn?.addEventListener('click', () => {
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      html.dataset.theme = next;
      localStorage.setItem('va_theme', next);
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PortfolioLab.init);
