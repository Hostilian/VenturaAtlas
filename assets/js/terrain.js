/**
 * TERRAIN — Problem Atlas JavaScript Controller
 *
 * Responsibilities:
 *   - Fetch and parse data/terrain-index.json
 *   - Render interactive Problem Atlas dashboard
 *   - Real-time search and multi-facet filtering (Actor, Friction Archetype, Status)
 *   - Interactive visual workflow step sequence with shadow system highlighting
 *   - Epistemic evidence, counterevidence, and residual problem analysis
 *   - Bidirectional traceability linking directly to idea dossiers (docs/idea.html?id=...)
 */

(function () {
  'use strict';

  let terrainData = null;
  const urlParams = new URLSearchParams(window.location.search);
  const requestedIdea = urlParams.get('idea') || urlParams.get('id') || '';

  let activeFilters = {
    search: requestedIdea,
    actor: 'all',
    friction: 'all',
    status: 'all'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function loadTerrainIndex() {
    const container = $('#terrainApp');
    if (!container) return;

    try {
      const basePath = document.body.getAttribute('data-root') || '..';
      const res = await fetch(`${basePath}/data/terrain-index.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching terrain-index.json`);
      terrainData = await res.json();
      renderDashboard();
    } catch (err) {
      console.error('Failed to load TERRAIN index:', err);
      if (container) {
        container.innerHTML = `
          <div class="panel" style="padding:2rem;border-left:4px solid var(--score-lo);margin-top:1rem;">
            <h2 style="color:var(--score-lo);margin-bottom:0.5rem">Unable to load Problem Atlas</h2>
            <p style="color:var(--text2);margin-bottom:1rem">${escapeHtml(err.message)}</p>
            <p class="muted" style="font-size:0.9rem">Ensure data/terrain-index.json has been generated with <code>node scripts/build-terrain-index.js</code>.</p>
          </div>
        `;
      }
    }
  }

  function renderDashboard() {
    const container = $('#terrainApp');
    if (!container || !terrainData) return;

    const { counts, statusDistribution, frictionTypeDistribution, actorIndex } = terrainData;

    // Build filter options
    const actorOptions = (actorIndex || [])
      .map(a => `<option value="${escapeHtml(a.actorId)}">${escapeHtml(a.role)} (${escapeHtml(a.organizationType)})</option>`)
      .join('');

    const allFrictions = Object.keys(frictionTypeDistribution || {}).sort();
    const frictionOptions = allFrictions
      .map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)} (${frictionTypeDistribution[f]})</option>`)
      .join('');

    const statusOptions = Object.keys(statusDistribution || {}).sort()
      .map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${statusDistribution[s]})</option>`)
      .join('');

    container.innerHTML = `
      <!-- ── Metrics Bar ── -->
      <div class="metrics-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="panel metric" style="padding:1.25rem;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)">
          <strong style="font-size:2rem;color:var(--accent);display:block;font-weight:800">${counts.problems}</strong>
          <span class="muted" style="font-size:0.85rem">Real Problems Mapped</span>
        </div>
        <div class="panel metric" style="padding:1.25rem;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)">
          <strong style="font-size:2rem;color:var(--text);display:block;font-weight:800">${counts.actors}</strong>
          <span class="muted" style="font-size:0.85rem">Customer Roles</span>
        </div>
        <div class="panel metric" style="padding:1.25rem;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)">
          <strong style="font-size:2rem;color:var(--text);display:block;font-weight:800">${counts.jobs}</strong>
          <span class="muted" style="font-size:0.85rem">Jobs-to-be-Done (JTBD)</span>
        </div>
        <div class="panel metric" style="padding:1.25rem;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)">
          <strong style="font-size:2rem;color:var(--text);display:block;font-weight:800">${counts.workflows}</strong>
          <span class="muted" style="font-size:0.85rem">Current-State Workflows</span>
        </div>
        <div class="panel metric" style="padding:1.25rem;border-radius:var(--radius);background:var(--panel);border:1px solid var(--line)">
          <strong style="font-size:2rem;color:var(--score-hi);display:block;font-weight:800">${counts.relations}</strong>
          <span class="muted" style="font-size:0.85rem">Problem↔Idea Edges</span>
        </div>
      </div>

      <!-- ── Epistemic Notice ── -->
      <div class="notice" role="note" style="margin-bottom:1.5rem;border-left:4px solid var(--accent)">
        <strong>Problem-First Epistemic Discipline:</strong> All seed problems carry explicit 
        <span class="badge" style="background:var(--accent-l);color:var(--accent);padding:2px 6px;border-radius:4px;font-weight:700">AI_HYPOTHESIS</span> labels.
        Existing idea dossiers generate problem hypotheses only — not verified reality. Desk research and direct user discovery are required to escalate problem status.
      </div>

      <!-- ── Filters & Search Toolbar ── -->
      <section class="panel" style="padding:1.25rem;border-radius:var(--radius);margin-bottom:1.5rem;border:1px solid var(--line)" aria-label="Problem Atlas Filters">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;align-items:end">
          <div>
            <label for="terrainSearchInput" style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Search Problem, Actor, Job or Workflow</label>
            <input type="search" id="terrainSearchInput" placeholder="e.g. baseline, SCADA, reference, audit, Excel..." style="width:100%;padding:0.6rem 0.8rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)" />
          </div>
          <div>
            <label for="terrainActorFilter" style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Filter by Job Performer / Actor</label>
            <select id="terrainActorFilter" style="width:100%;padding:0.6rem 0.8rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
              <option value="all">All Actors (${counts.actors})</option>
              ${actorOptions}
            </select>
          </div>
          <div>
            <label for="terrainFrictionFilter" style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Filter by Friction Archetype</label>
            <select id="terrainFrictionFilter" style="width:100%;padding:0.6rem 0.8rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
              <option value="all">All Frictions (${allFrictions.length})</option>
              ${frictionOptions}
            </select>
          </div>
          <div>
            <label for="terrainStatusFilter" style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Problem Status</label>
            <select id="terrainStatusFilter" style="width:100%;padding:0.6rem 0.8rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
              <option value="all">All Statuses</option>
              ${statusOptions}
            </select>
          </div>
        </div>
      </section>

      <!-- ── Problems List Container ── -->
      <div id="terrainProblemList" aria-live="polite">
        <!-- Rendered by filterAndRenderProblems() -->
      </div>
    `;

    bindEvents();
    filterAndRenderProblems();
  }

  function bindEvents() {
    const searchInput = $('#terrainSearchInput');
    const actorFilter = $('#terrainActorFilter');
    const frictionFilter = $('#terrainFrictionFilter');
    const statusFilter = $('#terrainStatusFilter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase().trim();
        filterAndRenderProblems();
      });
    }

    if (actorFilter) {
      actorFilter.addEventListener('change', (e) => {
        activeFilters.actor = e.target.value;
        filterAndRenderProblems();
      });
    }

    if (frictionFilter) {
      frictionFilter.addEventListener('change', (e) => {
        activeFilters.friction = e.target.value;
        filterAndRenderProblems();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        activeFilters.status = e.target.value;
        filterAndRenderProblems();
      });
    }
  }

  function filterAndRenderProblems() {
    const list = $('#terrainProblemList');
    if (!list || !terrainData) return;

    const filtered = terrainData.problems.filter(p => {
      if (activeFilters.search) {
        const term = activeFilters.search;
        let match = false;
        if (p.searchText && p.searchText.includes(term)) match = true;
        if (!match && p.title && p.title.toLowerCase().includes(term)) match = true;
        if (!match && p.description && p.description.toLowerCase().includes(term)) match = true;
        if (!match && p.actors && p.actors.some(a => (a.role && a.role.toLowerCase().includes(term)) || (a.actorId && a.actorId.toLowerCase().includes(term)))) match = true;
        if (!match && p.jobs && p.jobs.some(j => j.statement && j.statement.toLowerCase().includes(term))) match = true;
        if (!match && p.workflowSummary && p.workflowSummary.name && p.workflowSummary.name.toLowerCase().includes(term)) match = true;
        if (!match && p.workflowSummary && p.workflowSummary.steps && p.workflowSummary.steps.some(s => s.action && s.action.toLowerCase().includes(term))) match = true;

        if (!match) return false;
      }
      if (activeFilters.actor !== 'all') {
        const hasActor = p.actors.some(a => a.actorId === activeFilters.actor);
        if (!hasActor) return false;
      }
      if (activeFilters.friction !== 'all') {
        if (!p.frictionTypes.includes(activeFilters.friction)) return false;
      }
      if (activeFilters.status !== 'all') {
        if (p.status !== activeFilters.status) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="panel" style="padding:3rem;text-align:center;border-radius:var(--radius);border:1px dashed var(--line);background:var(--panel)">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">🔍</div>
          <h3 style="margin-bottom:0.5rem">No matching problems found</h3>
          <p class="muted" style="margin-bottom:1.5rem">Try clearing or broadening your search filters.</p>
          <button type="button" class="button secondary" id="clearTerrainFilters">Reset Filters</button>
        </div>
      `;
      const btn = $('#clearTerrainFilters');
      if (btn) {
        btn.addEventListener('click', () => {
          activeFilters = { search: '', actor: 'all', friction: 'all', status: 'all' };
          $('#terrainSearchInput').value = '';
          $('#terrainActorFilter').value = 'all';
          $('#terrainFrictionFilter').value = 'all';
          $('#terrainStatusFilter').value = 'all';
          filterAndRenderProblems();
        });
      }
      return;
    }

    const basePath = document.body.getAttribute('data-root') || '..';

    list.innerHTML = `
      <div style="margin-bottom:1rem;font-size:0.9rem;color:var(--text2);display:flex;justify-content:space-between;align-items:center">
        <span>Showing <strong>${filtered.length}</strong> of <strong>${terrainData.problems.length}</strong> problems</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        ${filtered.map(p => renderProblemCard(p, basePath)).join('')}
      </div>
    `;

    // Attach expandable details toggle handlers
    $$('.problem-expand-toggle', list).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.problem-card');
        if (!card) return;
        const details = $('.problem-deep-details', card);
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
        btn.textContent = isExpanded ? '🔍 Show Full Workflow & Residual Analysis ▾' : '▴ Hide Deep Analysis';
        if (details) {
          details.style.display = isExpanded ? 'none' : 'block';
        }
      });
    });
  }

  function renderProblemCard(p, basePath) {
    const actorBadges = p.actors
      .map(a => `<span class="badge" style="background:var(--bg2);color:var(--text);padding:3px 8px;border-radius:4px;border:1px solid var(--line);font-size:0.8rem">👤 ${escapeHtml(a.role || a.actorId)}</span>`)
      .join(' ');

    const frictionBadges = p.frictionTypes
      .map(f => `<span class="badge" style="background:var(--score-md-bg);color:var(--score-md);padding:3px 8px;border-radius:4px;font-size:0.75rem;font-weight:600">⚡ ${escapeHtml(f)}</span>`)
      .join(' ');

    const linkedIdeaBadges = p.linkedIdeas
      .map(i => `
        <a href="${basePath}/docs/idea.html?id=${escapeHtml(i.ideaId)}" class="button ghost" style="display:inline-flex;align-items:center;gap:0.35rem;padding:4px 10px;font-size:0.8rem;border:1px solid var(--accent);color:var(--accent)">
          💡 <strong>${escapeHtml(i.ideaName || i.ideaId)}</strong> (${escapeHtml(i.relationType)}) →
        </a>
      `).join(' ');

    const jobStatements = p.jobs
      .map(j => `<div style="font-size:0.9rem;color:var(--text2);margin-bottom:0.25rem">🎯 <em>${escapeHtml(j.statement || j.jobId)}</em></div>`)
      .join('');

    const workaroundsList = p.currentWorkarounds
      .map(w => `<li style="font-size:0.85rem;margin-bottom:0.25rem">${escapeHtml(w)}</li>`)
      .join('');

    return `
      <article class="panel problem-card" style="padding:1.5rem;border-radius:var(--radius);border:1px solid var(--line);background:var(--panel);box-shadow:var(--shadow)" aria-labelledby="heading-${p.problemId}">
        <!-- Top bar: Status, Type, As of -->
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
          <div style="display:flex;gap:0.5rem;align-items:center">
            <span class="badge" style="background:var(--accent-l);color:var(--accent);padding:3px 8px;border-radius:4px;font-weight:700;font-size:0.75rem">
              ${escapeHtml(p.status)} (${escapeHtml(p.maxEpistemic)})
            </span>
            <span class="badge" style="background:var(--bg2);color:var(--text2);padding:3px 8px;border-radius:4px;font-size:0.75rem">
              ${escapeHtml(p.symptomOrRoot)} CAUSE
            </span>
          </div>
          <span class="muted" style="font-size:0.75rem">As of ${escapeHtml(p.asOf)}</span>
        </div>

        <!-- Problem Title & Description -->
        <h2 id="heading-${p.problemId}" style="font-size:1.25rem;font-weight:700;line-height:1.3;margin-bottom:0.5rem;color:var(--text)">
          ${escapeHtml(p.title)}
        </h2>
        <p style="color:var(--text2);font-size:0.95rem;line-height:1.5;margin-bottom:1rem">
          ${escapeHtml(p.description)}
        </p>

        <!-- Actors & Jobs -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:1rem;padding:0.75rem;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--line)">
          <div>
            <strong style="display:block;font-size:0.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.35rem">Real-World Performers:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem">${actorBadges}</div>
          </div>
          <div>
            <strong style="display:block;font-size:0.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.35rem">Job to be Done:</strong>
            ${jobStatements}
          </div>
        </div>

        <!-- Frictions & Workarounds Preview -->
        <div style="margin-bottom:1rem">
          <strong style="display:block;font-size:0.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.35rem">Observed Friction Types:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.75rem">${frictionBadges}</div>
          
          ${workaroundsList ? `
            <strong style="display:block;font-size:0.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.25rem">How it's handled today (Workarounds):</strong>
            <ul style="padding-left:1.25rem;margin-bottom:0.75rem;color:var(--text2)">${workaroundsList}</ul>
          ` : ''}
        </div>

        <!-- Linked Ideas -->
        <div style="padding-top:0.75rem;border-top:1px solid var(--line);margin-bottom:1rem;display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem">
          <span style="font-size:0.85rem;font-weight:600;color:var(--text)">Linked Venture Hypotheses:</span>
          ${linkedIdeaBadges || '<span class="muted" style="font-size:0.85rem">No linked ideas (White space)</span>'}
        </div>

        <!-- Expand Button -->
        <div style="display:flex;justify-content:flex-end">
          <button type="button" class="button secondary problem-expand-toggle" aria-expanded="false" style="font-size:0.85rem;padding:0.4rem 0.9rem">
            🔍 Show Full Workflow & Residual Analysis ▾
          </button>
        </div>

        <!-- Deep Details (Hidden by default) -->
        <div class="problem-deep-details" style="display:none;margin-top:1.25rem;padding-top:1.25rem;border-top:1px dashed var(--line2)">
          ${renderDeepDetails(p, basePath)}
        </div>
      </article>
    `;
  }

  function renderDeepDetails(p, basePath) {
    const wf = p.workflowSummary;

    return `
      <div style="display:grid;grid-template-columns:1fr;gap:1.5rem">
        <!-- ── Interactive Step-by-Step Workflow Map ── -->
        ${wf ? `
          <div style="background:var(--bg);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem">
              <div>
                <span style="font-size:0.75rem;font-weight:700;color:var(--accent);text-transform:uppercase">Current-State Workflow Map</span>
                <h4 style="font-size:1.1rem;margin:0.2rem 0;color:var(--text)">
                  📍 ${escapeHtml(wf.name)}
                </h4>
              </div>
              <span class="badge" style="background:var(--bg2);color:var(--text2);padding:2px 8px;border-radius:4px;font-size:0.75rem">
                ${wf.stepCount} Steps Mapped
              </span>
            </div>
            
            <p style="font-size:0.85rem;color:var(--text2);margin-bottom:1rem">
              <strong>Trigger:</strong> ${escapeHtml(wf.trigger)}<br>
              <strong>Goal:</strong> ${escapeHtml(wf.goal)}
            </p>

            <!-- Steps Timeline -->
            <div class="workflow-steps-timeline" style="display:flex;flex-direction:column;gap:0.75rem">
              ${(wf.steps || []).map(s => {
                const isAffected = (wf.affectedStepIds || []).includes(s.stepId);
                return `
                  <div style="display:grid;grid-template-columns:36px 1fr;gap:0.75rem;padding:0.75rem;border-radius:var(--radius-sm);background:${isAffected ? 'var(--panel)' : 'var(--panel2)'};border:${isAffected ? '1.5px solid var(--accent)' : '1px solid var(--line)'}">
                    <div style="display:flex;flex-direction:column;align-items:center">
                      <span style="width:28px;height:28px;border-radius:50%;background:${isAffected ? 'var(--accent)' : 'var(--line2)'};color:${isAffected ? '#fff' : 'var(--text)'};display:inline-flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700">
                        ${s.order}
                      </span>
                    </div>
                    <div>
                      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.4rem;margin-bottom:0.35rem">
                        <strong style="font-size:0.85rem;color:var(--text)">${escapeHtml(s.action)}</strong>
                        <span class="badge" style="font-size:0.7rem;background:var(--bg2);color:var(--text2);padding:1px 5px;border-radius:3px">👤 ${escapeHtml(s.actor)}</span>
                        ${s.system ? `<span class="badge" style="font-size:0.7rem;background:${s.isShadowSystem ? 'var(--score-md-bg)' : 'var(--bg)'};color:${s.isShadowSystem ? 'var(--score-md)' : 'var(--muted)'};padding:1px 5px;border-radius:3px">💻 ${escapeHtml(s.system)}${s.isShadowSystem ? ' (Shadow Tool)' : ''}</span>` : ''}
                        ${s.isHandoff ? `<span class="badge" style="font-size:0.7rem;background:var(--score-lo-bg);color:var(--score-lo);padding:1px 5px;border-radius:3px">🔄 Handoff</span>` : ''}
                      </div>
                      ${s.frictionNotes ? `
                        <div style="font-size:0.8rem;color:var(--score-md);margin-top:0.25rem">
                          ⚡ <strong>Friction:</strong> ${escapeHtml(s.frictionNotes)}
                        </div>
                      ` : ''}
                      ${(s.input || s.output) ? `
                        <div style="font-size:0.75rem;color:var(--muted);margin-top:0.25rem">
                          ${s.input ? `In: <code>${escapeHtml(s.input)}</code>` : ''}
                          ${s.output ? ` → Out: <code>${escapeHtml(s.output)}</code>` : ''}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ── Residual Problem & Solution Coverage Analysis ── -->
        <div style="background:var(--panel2);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
          <h4 style="font-size:1rem;margin-bottom:0.75rem;color:var(--text);display:flex;align-items:center;gap:0.4rem">
            🛡️ Solution Coverage &amp; Residual Problem Reality
          </h4>
          <p class="muted" style="font-size:0.85rem;margin-bottom:1rem">
            TERRAIN maps which specific steps a venture idea affects vs. what residual operational friction remains unsolved.
          </p>
          ${p.linkedIdeas.map(rel => `
            <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--line);font-size:0.85rem">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
                <a href="${basePath}/docs/idea.html?id=${escapeHtml(rel.ideaId)}" style="font-weight:700;color:var(--accent);font-size:0.95rem">
                  💡 ${escapeHtml(rel.ideaName || rel.ideaId)}
                </a>
                <span class="badge" style="background:var(--accent-l);color:var(--accent);padding:2px 6px;border-radius:3px;font-size:0.75rem;font-weight:600">
                  ${escapeHtml(rel.relationType)}
                </span>
              </div>
              <p style="color:var(--text2);margin-bottom:0.35rem">
                <strong>Affected Workflow Steps:</strong> <code>${escapeHtml((rel.workflowCoverage || []).join(', ') || 'N/A')}</code>
              </p>
              <p style="color:var(--score-md);margin-bottom:0.35rem">
                <strong>Residual Problem Reality:</strong> ${escapeHtml(rel.residualProblem || 'None documented')}
              </p>
            </div>
          `).join('')}
        </div>

        <!-- ── Epistemic Evidence & Counterevidence ── -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
          <!-- Evidence Base -->
          <div style="background:var(--bg);padding:1rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <h5 style="font-size:0.85rem;margin:0 0 0.5rem;color:var(--accent);text-transform:uppercase">
              Supporting Evidence (${p.evidenceCount})
            </h5>
            <ul style="padding-left:1.2rem;font-size:0.8rem;color:var(--text2)">
              ${(p.evidence || []).map(ev => `
                <li style="margin-bottom:0.4rem">
                  <span class="badge" style="font-size:0.65rem;background:var(--accent-l);color:var(--accent);padding:1px 4px;border-radius:2px">${escapeHtml(ev.epistemic)}</span>
                  ${escapeHtml(ev.summary)}
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Counterevidence -->
          <div style="background:var(--bg);padding:1rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <h5 style="font-size:0.85rem;margin:0 0 0.5rem;color:var(--score-md);text-transform:uppercase">
              Counterevidence &amp; Nuances (${p.counterEvidenceCount})
            </h5>
            <ul style="padding-left:1.2rem;font-size:0.8rem;color:var(--text2)">
              ${(p.counterEvidence || []).map(cev => `
                <li style="margin-bottom:0.4rem">
                  <span class="badge" style="font-size:0.65rem;background:var(--score-md-bg);color:var(--score-md);padding:1px 4px;border-radius:2px">${escapeHtml(cev.epistemic)}</span>
                  ${escapeHtml(cev.summary)}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- ── Research Gaps ── -->
        ${p.researchGaps && p.researchGaps.length ? `
          <div style="background:var(--panel2);padding:1rem;border-radius:var(--radius-sm);border:1px dashed var(--line2)">
            <h5 style="font-size:0.85rem;margin:0 0 0.4rem;color:var(--score-lo);text-transform:uppercase">
              🔬 Open Research Gaps (Required Before Promoting Status):
            </h5>
            <ul style="padding-left:1.25rem;font-size:0.85rem;color:var(--text2)">
              ${p.researchGaps.map(g => `<li style="margin-bottom:0.25rem">${escapeHtml(g)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- ── Causal Consequences & Desired Outcomes ── -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
          ${p.consequences && p.consequences.length ? `
            <div>
              <h5 style="font-size:0.85rem;margin:0 0 0.4rem;color:var(--score-lo);text-transform:uppercase">
                ⚠️ Consequences of Inaction:
              </h5>
              <ul style="padding-left:1.2rem;font-size:0.8rem;color:var(--text2)">
                ${p.consequences.map(c => `<li style="margin-bottom:0.25rem">${escapeHtml(c)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${p.desiredOutcomes && p.desiredOutcomes.length ? `
            <div>
              <h5 style="font-size:0.85rem;margin:0 0 0.4rem;color:var(--score-hi);text-transform:uppercase">
                🎯 Desired Solution-Neutral Outcomes:
              </h5>
              <ul style="padding-left:1.2rem;font-size:0.8rem;color:var(--text2)">
                ${p.desiredOutcomes.map(o => `<li style="margin-bottom:0.25rem">${escapeHtml(o)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTerrainIndex);
  } else {
    loadTerrainIndex();
  }

  window.initTerrain = loadTerrainIndex;
})();
