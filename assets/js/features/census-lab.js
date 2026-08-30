/**
 * census-lab.js
 * CENSUS Lab UI Controller
 * Dynamically loads data from censusStore, runs anti-theater linter, and renders the UI.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Load global components
  const esc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const store = window.censusStore;
  const engine = new window.CensusEngine(store);

  const urlParams = new URLSearchParams(window.location.search);
  const requestedIdeaId = urlParams.get('idea') || urlParams.get('id');
  
  if (requestedIdeaId) {
    document.querySelectorAll('header nav a').forEach(a => {
      try {
        const url = new URL(a.href, window.location.href);
        url.searchParams.set('idea', requestedIdeaId);
        a.href = url.toString();
      } catch (e) {}
    });
  }

  // Initialize Data
  await store.load();

  renderQuestions();
  renderSources();
  renderLinter();

  // Tab navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  function renderQuestions() {
    const container = document.getElementById('q-content');
    if (!container) return;
    
    let qs = store.getAllQuestions();
    // Sort by priority descending
    qs.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

    container.innerHTML = '';
    qs.forEach(q => {
      const pc = (q.priorityScore >= 9.0) ? 'pH' : 'pM';
      const pLabel = (q.priorityScore >= 9.0) ? 'H' : 'M';
      
      const d = document.createElement('div');
      d.className = 'q-card';
      d.innerHTML = `
        <div class="q-hdr">
          <span class="q-id">${esc(q.questionId)}</span>
          <span class="pchip ${pc}">PRIORITY ${q.priorityScore?.toFixed(1) || '0.0'}</span>
        </div>
        <div class="q-metric">${esc(q.metricStatement)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">
          &#127919; ${esc(q.ideaId)} &bull; &#128202; ${esc(q.precisionRequired)}
        </div>
        <div style="font-size:11px;color:var(--text-muted);background:var(--surface2);border-radius:4px;padding:8px;margin-bottom:4px;">
          <b>Method:</b> ${esc(q.methodology)}
        </div>
        <div style="font-size:11px;color:var(--text-muted);background:var(--surface2);border-radius:4px;padding:8px;">
          <b>Decision boundary:</b> ${esc(q.decisionBoundary)}
        </div>
      `;
      container.appendChild(d);
    });
  }

  function renderSources() {
    const container = document.getElementById('src-content');
    if (!container) return;
    
    const srcs = store.getAllSources();
    container.innerHTML = '';
    
    srcs.forEach(s => {
      const d = document.createElement('div');
      d.className = 'src-card';
      
      const lims = (s.limitations || []).map(l => `<div class="lim-item">${esc(l)}</div>`).join('');
      
      d.innerHTML = `
        <div class="src-pub">${esc(s.publisher)}</div>
        <div class="src-ds">${esc(s.datasetName)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">
          Measures: <b>${esc(s.measures || 'N/A')}</b>
        </div>
        <div style="font-size:10px;color:var(--text-dim);background:var(--surface2);border-radius:3px;padding:2px 6px;display:inline-block;margin-bottom:8px;">
          ${esc(s.sourceType)}
        </div>
        <div>${lims}</div>
      `;
      container.appendChild(d);
    });
  }

  function renderLinter() {
    const container = document.getElementById('lint-content');
    if (!container) return;
    
    const lintResult = engine.lintAll();
    const findings = lintResult.findings;
    
    const errs = findings.filter(f => f.severity === 'ERROR');
    const warns = findings.filter(f => f.severity === 'WARNING');
    
    const ec = errs.length > 0 ? 'var(--red)' : 'var(--green)';
    const wc = warns.length > 0 ? 'var(--amber)' : 'var(--green)';
    
    const passCount = lintResult.totalEstimates - errs.length;
    
    let html = `
      <div class="lint-sum">
        <div class="lint-stat">
          <div class="lint-val" style="color:var(--text)">${lintResult.totalEstimates}</div>
          <div class="lint-lbl">Estimates reviewed</div>
        </div>
        <div class="lint-stat">
          <div class="lint-val" style="color:${ec}">${errs.length}</div>
          <div class="lint-lbl">Errors (anti-theater)</div>
        </div>
        <div class="lint-stat">
          <div class="lint-val" style="color:${wc}">${warns.length}</div>
          <div class="lint-lbl">Warnings</div>
        </div>
        <div class="lint-stat">
          <div class="lint-val" style="color:var(--green)">${passCount}</div>
          <div class="lint-lbl">Pass (no error)</div>
        </div>
      </div>
    `;
    
    if (findings.length === 0) {
      html += `<div style="color:var(--green);font-size:14px;padding:12px;">All estimates pass anti-theater checks.</div>`;
    } else {
      findings.forEach(f => {
        html += `
          <div class="f-card f${f.severity}">
            <div class="f-rule">${esc(f.ruleId)}</div>
            <div class="f-msg">${esc(f.message)}</div>
          </div>
        `;
      });
    }
    
    container.innerHTML = html;
  }
});
