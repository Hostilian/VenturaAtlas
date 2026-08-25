/**
 * VenturaAtlas Constellation Lab UI Controller
 * Interactive Org Lab workspace implementing Person != Role clarity, Decision Rights,
 * Capability Gap Radar, Founder Load & Delegation, Knowledge Resilience, and Operating Cadence.
 */

(function () {
  'use strict';

  let currentTab = 'tab-roles';
  let workspace = null;
  let capabilitiesOntology = [];
  let fixturesData = [];

  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadSeedData() {
    try {
      const [capRes, fixRes] = await Promise.all([
        fetch('../data/constellation-capabilities.json'),
        fetch('../data/constellation-fixtures.json')
      ]);
      capabilitiesOntology = await capRes.json();
      const fixJson = await fixRes.json();
      fixturesData = fixJson.fixtures || [];
    } catch (err) {
      console.warn('[ConstellationLab] Seed data fetch failed, using fallbacks:', err);
    }
  }

  function init() {
    workspace = VAConstellationStore.loadWorkspace();
    setupEventListeners();
    render();
  }

  function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        render();
      });
    });

    const fixPicker = document.getElementById('constellationFixtureSelect');
    if (fixPicker) {
      fixPicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'default') {
          workspace = VAConstellationStore.resetWorkspace();
        } else {
          const fix = fixturesData.find(f => f.id === val);
          if (fix) {
            workspace.companyStage = fix.companyStage || 'SOLO_FOUNDER';
            if (fix.people) workspace.people = fix.people;
            if (fix.roles) workspace.roles = fix.roles;
            if (fix.decisionRights) workspace.decisionRights = fix.decisionRights;
            if (fix.knowledgeDomains) workspace.knowledgeDomains = fix.knowledgeDomains;
            if (fix.meetings) workspace.meetings = fix.meetings;
            if (fix.hiringCase) workspace.hiringCases = [fix.hiringCase];
          }
        }
        VAConstellationStore.saveWorkspace(workspace);
        render();
      });
    }
  }

  function render() {
    const container = document.getElementById('constellationLabContainer');
    if (!container) return;

    switch (currentTab) {
      case 'tab-roles':
        renderRolesTab(container);
        break;
      case 'tab-decisions':
        renderDecisionsTab(container);
        break;
      case 'tab-capabilities':
        renderCapabilitiesTab(container);
        break;
      case 'tab-delegation':
        renderDelegationTab(container);
        break;
      case 'tab-knowledge':
        renderKnowledgeTab(container);
        break;
      case 'tab-cadence':
        renderCadenceTab(container);
        break;
      default:
        renderRolesTab(container);
        break;
    }
  }

  // --- TAB 1: PEOPLE & ROLES ---
  function renderRolesTab(container) {
    const bottlenecks = VAConstellationEngine.detectBottlenecks(workspace);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>People &amp; Capacity Allocation</h3>
            <span class="badge badge-info">Stage: ${workspace.companyStage.replace(/_/g, ' ')}</span>
          </div>
          <div class="card-body">
            <div class="people-list">
              ${(workspace.people || []).map(p => {
                const diag = bottlenecks.personDiagnostics.find(d => d.personId === p.personId) || {};
                return `
                  <div class="person-card">
                    <div class="person-head">
                      <div>
                        <h4>${esc(p.displayName)}</h4>
                        <span class="badge ${p.relationship === 'FOUNDER' ? 'badge-primary' : (p.relationship === 'AI_AGENT_WORKER' ? 'badge-warning' : 'badge-secondary')}">
                          ${esc(p.relationship)}
                        </span>
                      </div>
                      <span class="capacity-total">${diag.totalHoursDemanded || 0} / ${p.totalWeeklyCapacityHours} hrs (${diag.totalAllocatedPercent || 0}%)</span>
                    </div>
                    <div class="progress-bar mt-2">
                      <div class="progress-fill ${diag.isOverallocated ? 'bg-danger' : ''}" style="width:Math.min(100, ${diag.totalAllocatedPercent || 0})%"></div>
                    </div>
                    <div class="assigned-roles-chips mt-2">
                      <strong>Assigned Roles:</strong>
                      ${(p.assignedRoleIds || []).map(rid => {
                        const r = workspace.roles.find(role => role.roleId === rid);
                        return `<span class="chip">${esc(r?.title || rid)}</span>`;
                      }).join(' ')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Operational Roles &amp; Accountabilities</h3>
            <span>${workspace.roles.length} Defined Roles</span>
          </div>
          <div class="card-body">
            <div class="roles-list">
              ${(workspace.roles || []).map(r => {
                const owner = workspace.people.find(p => p.personId === r.currentOwnerId);
                return `
                  <div class="role-card">
                    <div class="role-head">
                      <div>
                        <h4>${esc(r.title)}</h4>
                        <p class="role-purpose">${esc(r.purpose)}</p>
                      </div>
                      <span class="badge ${owner ? 'badge-success' : 'badge-danger'}">
                        ${owner ? `Owner: ${esc(owner.displayName)}` : 'VACANT / UNOWNED'}
                      </span>
                    </div>
                    <div class="role-body">
                      <div><strong>Accountable Outcomes:</strong></div>
                      <ul class="clean-list">
                        ${(r.accountableOutcomes || []).map(o => `<li>✓ ${esc(o)}</li>`).join('')}
                      </ul>
                      <div class="mt-2"><strong>Recurring Responsibilities:</strong></div>
                      <ul class="clean-list">
                        ${(r.recurringResponsibilities || []).map(resp => `
                          <li>${esc(resp.title)} (${esc(resp.cadence)})${resp.isDelegatable ? ' · <span class="text-success">[Delegatable]</span>' : ''}</li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 2: DECISION RIGHTS & AUTHORITY ---
  function renderDecisionsTab(container) {
    const bottlenecks = VAConstellationEngine.detectBottlenecks(workspace);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Company Decision Authority Map</h3>
          <span class="badge ${bottlenecks.approvalBottleneckSeverity === 'CRITICAL_CENTRALIZATION' ? 'badge-warning' : 'badge-success'}">
            Founder Centralization: ${Math.round(bottlenecks.founderApprovalRatio * 100)}%
          </span>
        </div>
        <div class="card-body">
          ${bottlenecks.hasDecisionCollision ? `
            <div class="alert alert-danger mb-3">
              <strong>⚠ Decision Authority Collision Detected:</strong>
              ${bottlenecks.decisionCollisions.map(c => `Two conflicting deciders registered on scope <code>${esc(c.scope)}</code> (${esc(c.decider1)} vs ${esc(c.decider2)}).`).join(' ')}
            </div>
          ` : ''}

          <table class="data-table">
            <thead>
              <tr>
                <th>Decision Class</th>
                <th>Scope</th>
                <th>Accountable Decider</th>
                <th>Veto Rights</th>
                <th>Autonomy Band</th>
                <th>Reversible?</th>
              </tr>
            </thead>
            <tbody>
              ${(workspace.decisionRights || []).map(d => {
                const deciderRole = workspace.roles.find(r => r.roleId === d.deciderRoleId);
                return `
                  <tr>
                    <td><strong>${esc(d.title)}</strong><br><small class="text-muted">${esc(d.description)}</small></td>
                    <td><code>${esc(d.scope)}</code></td>
                    <td><span class="chip">${esc(deciderRole?.title || d.deciderRoleId)}</span></td>
                    <td>${d.vetoRoleIds?.length ? d.vetoRoleIds.join(', ') : 'None'}</td>
                    <td><span class="badge badge-info">${esc(d.autonomyBand)}</span></td>
                    <td>${d.isReversible ? '<span class="text-success">Yes (Two-way)</span>' : '<span class="text-danger">No (One-way)</span>'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 3: CAPABILITIES & BOTTLENECK RADAR ---
  function renderCapabilitiesTab(container) {
    const requiredCaps = [
      'cap-sw-eng-architecture',
      'cap-prod-design',
      'cap-customer-discovery',
      'cap-growth-demand-gen',
      'cap-fin-modeling',
      'cap-legal-compliance',
      'cap-deep-research-synthesis',
      'cap-doc-generation'
    ];
    const cov = VAConstellationEngine.evaluateCapabilityCoverage(requiredCaps, workspace.people, capabilitiesOntology);
    const bottlenecks = VAConstellationEngine.detectBottlenecks(workspace);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>90-Day Capability Coverage Radar</h3>
            <span class="badge ${cov.coverageRatio >= 0.8 ? 'badge-success' : 'badge-warning'}">
              Coverage: ${Math.round(cov.coverageRatio * 100)}%
            </span>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Possessed By</th>
                </tr>
              </thead>
              <tbody>
                ${cov.missingCapabilities.concat(cov.singlePointsOfFailure).map(c => `
                  <tr>
                    <td><strong>${esc(c.name)}</strong></td>
                    <td><small>${esc(c.domain)}</small></td>
                    <td>
                      <span class="badge ${c.status === 'UNCOVERED_MISSING' ? 'badge-danger' : 'badge-warning'}">
                        ${c.status === 'UNCOVERED_MISSING' ? 'MISSING GAP' : 'SINGLE POINT (SPOF)'}
                      </span>
                    </td>
                    <td>${c.holders.length ? esc(c.holders.join(', ')) : '<em class="text-danger">None</em>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Systemic Bottleneck Diagnosis</h3>
          </div>
          <div class="card-body">
            <div class="diagnostic-box">
              <div class="diag-item">
                <strong>Unowned Critical Roles:</strong>
                <p class="diag-desc ${bottlenecks.unownedRolesCount > 0 ? 'text-danger' : 'text-success'}">
                  ${bottlenecks.unownedRolesCount > 0 ? `${bottlenecks.unownedRolesCount} roles currently vacant / unassigned.` : 'All operational roles have assigned accountable owners.'}
                </p>
              </div>
              <div class="diag-item">
                <strong>Centralized Approval Tax:</strong>
                <p class="diag-desc">
                  Founder personally decides ${Math.round(bottlenecks.founderApprovalRatio * 100)}% of decision classes (${bottlenecks.approvalBottleneckSeverity}).
                </p>
              </div>
              <div class="diag-item">
                <strong>Overallocated Team Members:</strong>
                <p class="diag-desc">
                  ${bottlenecks.overallocatedPeople.length > 0
                    ? bottlenecks.overallocatedPeople.map(p => `${esc(p.displayName)} is at ${p.totalAllocatedPercent}% allocation (${p.contextSwitchingScore}).`).join('; ')
                    : 'No person exceeds 100% capacity.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 4: FOUNDER LOAD & DELEGATION ---
  function renderDelegationTab(container) {
    const founder = workspace.people.find(p => p.relationship === 'FOUNDER' || p.relationship === 'CO_FOUNDER');
    const founderLoad = VAConstellationEngine.evaluateFounderLoad(founder, workspace.roles, workspace.decisionRights);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>Founder Load &amp; Leverage Breakdown</h3>
            <span class="badge badge-info">${founderLoad?.totalRecurringHours || 0} Recurring Hrs/Wk</span>
          </div>
          <div class="card-body">
            <div class="diag-item mb-3">
              <strong>Delegation Readiness:</strong>
              <p class="diag-desc text-success">
                ~${founderLoad?.delegatableHours || 0} hrs/week (${founderLoad?.delegatablePercentage || 0}%) can be standardized, automated, or delegated to contractors/AI.
              </p>
            </div>

            <h4>Ranked Delegation Candidates</h4>
            <table class="data-table mt-2">
              <thead>
                <tr>
                  <th>Responsibility</th>
                  <th>Role</th>
                  <th>Cadence</th>
                  <th>Hours/Wk</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                ${(founderLoad?.delegatableItems || []).map(item => `
                  <tr>
                    <td><strong>${esc(item.title)}</strong></td>
                    <td>${esc(item.roleTitle)}</td>
                    <td>${esc(item.cadence)}</td>
                    <td>~${item.estimatedHours} hrs</td>
                    <td><span class="badge ${item.delegationDifficulty === 'LOW' ? 'badge-success' : 'badge-info'}">${esc(item.delegationDifficulty)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Active Delegation Packets</h3>
            <span>${(workspace.delegations || []).length} Active</span>
          </div>
          <div class="card-body">
            ${(workspace.delegations || []).map(del => `
              <div class="delegation-packet-card">
                <h4>${esc(del.title)}</h4>
                <div class="packet-meta">
                  <span><strong>To:</strong> <code>${esc(del.delegateeRoleId)}</code></span>
                  <span><strong>Authority:</strong> <span class="badge badge-info">${esc(del.decisionAuthorityGranted)}</span></span>
                </div>
                <p class="mt-2"><strong>Intended Outcome:</strong> ${esc(del.intendedOutcome)}</p>
                <div><strong>Operating Constraints:</strong></div>
                <ul class="clean-list">
                  ${(del.operatingConstraints || []).map(c => `<li>• ${esc(c)}</li>`).join('')}
                </ul>
                <div class="mt-2"><strong>Escalation Rule:</strong> <small>${esc(del.escalationRule)}</small></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 5: KNOWLEDGE RESILIENCE ---
  function renderKnowledgeTab(container) {
    const risk = VAConstellationEngine.analyzeKnowledgeRisk(workspace.knowledgeDomains, workspace.people);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Knowledge Resilience &amp; Bus Factor Audit</h3>
          <span class="badge ${risk.continuityGrade === 'RESILIENT' ? 'badge-success' : 'badge-warning'}">
            Continuity Score: ${risk.continuityScore}/100 (${risk.continuityGrade.replace(/_/g, ' ')})
          </span>
        </div>
        <div class="card-body">
          <p class="card-subtitle mb-3">Identifies single-person critical knowledge concentrations and verifies continuity runbooks.</p>

          <table class="data-table">
            <thead>
              <tr>
                <th>Knowledge Domain</th>
                <th>Criticality</th>
                <th>Primary Owner</th>
                <th>Backup Owner</th>
                <th>Verified Runbook?</th>
                <th>Vulnerability Status</th>
              </tr>
            </thead>
            <tbody>
              ${risk.riskItems.map(item => `
                <tr>
                  <td><strong>${esc(item.name)}</strong></td>
                  <td><span class="badge ${item.criticality === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${esc(item.criticality)}</span></td>
                  <td>${esc(item.primaryOwner)}</td>
                  <td>${item.backupOwner ? esc(item.backupOwner) : '<em class="text-danger">None (Bus Factor 1)</em>'}</td>
                  <td>${item.hasVerifiedRunbook ? `✓ <code>${esc(item.runbookRef)}</code>` : '<span class="text-danger">Missing Runbook</span>'}</td>
                  <td>
                    <span class="badge ${item.vulnerability === 'CRITICAL_VULNERABILITY' ? 'badge-danger' : (item.vulnerability === 'MODERATE_RUNBOOK_BACKED' ? 'badge-warning' : 'badge-success')}">
                      ${esc(item.vulnerability.replace(/_/g, ' '))}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 6: CADENCE & HIRING CASES ---
  function renderCadenceTab(container) {
    const cadence = VAConstellationEngine.evaluateOperatingCadence(workspace.companyStage, workspace.meetings);
    const meetingAudit = VAConstellationEngine.analyzeMeetingContinuity(workspace.meetings);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>Operating Cadence &amp; Meeting Intelligence</h3>
            <span class="badge ${meetingAudit.meetingBloatAlert === 'HIGH_MEETING_BLOAT_DETECTED' ? 'badge-danger' : 'badge-success'}">
              ${meetingAudit.totalHumanHoursConsumed} Human-Hours/Wk
            </span>
          </div>
          <div class="card-body">
            <div class="cadence-box mb-3">
              <strong>Stage-Appropriate Rhythms (${workspace.companyStage.replace(/_/g, ' ')}):</strong>
              <ul class="clean-list mt-1">
                ${cadence.recommendedRituals.map(r => `<li>✓ ${esc(r)}</li>`).join('')}
              </ul>
              <small class="text-muted mt-2 block">Avoid: ${cadence.avoidRituals.join(', ')}</small>
            </div>

            <h4>Commitment Execution Track</h4>
            <div class="metric-badges my-2">
              <span class="badge badge-info">Total: ${meetingAudit.commitmentsSummary.total}</span>
              <span class="badge badge-success">Fulfilled: ${meetingAudit.commitmentsSummary.fulfilled}</span>
              <span class="badge badge-warning">Open: ${meetingAudit.commitmentsSummary.open}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Evidence-Based Hiring Business Cases</h3>
          </div>
          <div class="card-body">
            ${(workspace.hiringCases || []).map(hcase => {
              const evalRes = VAConstellationEngine.evaluateHiringNeed(hcase, { hasRepeatableSalesProcess: false, teamSize: 1 });
              return `
                <div class="hiring-case-card">
                  <div class="hcase-head">
                    <h4>${esc(hcase.proposedRoleTitle)}</h4>
                    <span class="badge ${evalRes.verdict === 'CHALLENGE_ASSUMPTION_PREMATURE' ? 'badge-danger' : 'badge-info'}">
                      ${esc(evalRes.verdict.replace(/_/g, ' '))}
                    </span>
                  </div>
                  <p class="mt-2"><strong>Bottleneck Solved:</strong> ${esc(hcase.bottleneckProblemSolved)}</p>
                  <div><strong>Evaluated Alternatives:</strong></div>
                  <ul class="clean-list">
                    ${(hcase.evaluatedAlternatives || []).map(a => `
                      <li><strong>${esc(a.alternativeType)}:</strong> ${esc(a.rationale)} (${esc(a.feasibility)})</li>
                    `).join('')}
                  </ul>
                  ${evalRes.flags.length ? `
                    <div class="alert alert-danger mt-2">
                      ${evalRes.flags.map(f => `⚠ ${esc(f)}`).join('<br>')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}

            <div class="workspace-portability mt-4">
              <h4>Private Org Workspace Backup</h4>
              <p>Organizational structures and private notes stay in local browser storage only.</p>
              <button id="exportOrgJsonBtn" class="btn btn-secondary">Export JSON Backup</button>
              <button id="resetOrgBtn" class="btn btn-danger">Reset to Default</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('exportOrgJsonBtn')?.addEventListener('click', () => {
      const json = VAConstellationStore.exportWorkspaceJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constellation-workspace-${workspace.ventureId}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('resetOrgBtn')?.addEventListener('click', () => {
      if (confirm('Reset Constellation Workspace to default state?')) {
        workspace = VAConstellationStore.resetWorkspace();
        render();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadSeedData();
    init();
  });
})();
