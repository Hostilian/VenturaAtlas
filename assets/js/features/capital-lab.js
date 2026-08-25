/**
 * VenturaAtlas Capital Lab UI Controller
 * Integrates VACapitalEngine, VACapitalStore, and seed data into a responsive 6-tab workspace.
 */

(function () {
  'use strict';

  let currentTab = 'tab-need';
  let workspace = null;
  let fundingSources = [];
  let grantOpportunities = [];
  let dogfoodVentures = [];

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
      const [srcRes, grantRes, dogRes] = await Promise.all([
        fetch('../data/funding-sources.json'),
        fetch('../data/grant-opportunities.json'),
        fetch('../data/capital-dogfood.json')
      ]);
      fundingSources = await srcRes.json();
      grantOpportunities = await grantRes.json();
      const dogData = await dogRes.json();
      dogfoodVentures = dogData.dogfoodVentures || [];
    } catch (err) {
      console.warn('[CapitalLab] Seed data fetch failed, using fallback arrays:', err);
    }
  }

  function init() {
    workspace = VACapitalStore.loadWorkspace();
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

    const venturePicker = document.getElementById('capitalVentureSelect');
    if (venturePicker) {
      venturePicker.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const df = dogfoodVentures.find(v => v.ventureId === selectedId);
        if (df) {
          workspace.ventureId = df.ventureId;
          workspace.ventureName = df.ventureName;
          if (df.capitalNeed) {
            workspace.capitalNeeds = [df.capitalNeed];
          }
          VACapitalStore.saveWorkspace(workspace);
          render();
        }
      });
    }
  }

  function render() {
    const container = document.getElementById('capitalLabContainer');
    if (!container) return;

    switch (currentTab) {
      case 'tab-need':
        renderNeedTab(container);
        break;
      case 'tab-sources':
        renderSourcesTab(container);
        break;
      case 'tab-grants':
        renderGrantsTab(container);
        break;
      case 'tab-dilution':
        renderDilutionTab(container);
        break;
      case 'tab-readiness':
        renderReadinessTab(container);
        break;
      case 'tab-pipeline':
        renderPipelineTab(container);
        break;
      default:
        renderNeedTab(container);
        break;
    }
  }

  // --- TAB 1: CAPITAL NEED & MILESTONE ---
  function renderNeedTab(container) {
    const need = workspace.capitalNeeds[0] || {};
    const evalResult = VACapitalEngine.evaluateCapitalNeed(need, workspace);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>Milestone-Linked Capital Need</h3>
            <span class="badge ${evalResult.canBootstrap ? 'badge-success' : 'badge-warning'}">
              ${evalResult.canBootstrap ? 'Bootstrappable / Customer-Funded' : 'External Capital Needed'}
            </span>
          </div>
          <div class="card-body">
            <form id="capitalNeedForm" class="form-grid">
              <div class="form-group">
                <label>Venture Name</label>
                <input type="text" id="needVentureName" class="form-control" value="${esc(workspace.ventureName)}">
              </div>
              <div class="form-group">
                <label>Capital Purpose</label>
                <select id="needPurpose" class="form-select">
                  <option value="CUSTOMER_ACQUISITION" ${need.purpose === 'CUSTOMER_ACQUISITION' ? 'selected' : ''}>Customer Acquisition & Pilots</option>
                  <option value="BUILD_MVP" ${need.purpose === 'BUILD_MVP' ? 'selected' : ''}>Build MVP / Core Workflow</option>
                  <option value="REGULATORY_CERTIFICATION" ${need.purpose === 'REGULATORY_CERTIFICATION' ? 'selected' : ''}>Regulatory & Security Certification</option>
                  <option value="KEY_HIRES" ${need.purpose === 'KEY_HIRES' ? 'selected' : ''}>Key Specialist Hires</option>
                  <option value="WORKING_CAPITAL" ${need.purpose === 'WORKING_CAPITAL' ? 'selected' : ''}>Working Capital / Receivables</option>
                </select>
              </div>
              <div class="form-group span-2">
                <label>What specific milestone does this capital buy?</label>
                <textarea id="needMilestone" class="form-control" rows="2">${esc(need.milestone)}</textarea>
                <small class="form-hint">Example: "Reach 15 funded consumer bounties and 1 paying merchant subscription."</small>
              </div>
              <div class="form-group span-2">
                <label>Target State Unlocked</label>
                <input type="text" id="needTargetState" class="form-control" value="${esc(need.targetState)}">
              </div>
              <div class="form-group">
                <label>Minimum Viable (€)</label>
                <input type="number" id="needMin" class="form-control" value="${need.amountRange?.minimumViable || 0}">
              </div>
              <div class="form-group">
                <label>Comfortable Raise (€)</label>
                <input type="number" id="needComfortable" class="form-control" value="${need.amountRange?.comfortable || 0}">
              </div>
              <div class="form-group">
                <label>Maximum Useful (€)</label>
                <input type="number" id="needMax" class="form-control" value="${need.amountRange?.maximumUseful || 0}">
              </div>
              <div class="form-group">
                <label>Time Horizon (Months)</label>
                <input type="number" id="needHorizon" class="form-control" value="${need.timeHorizonMonths || 6}">
              </div>
              <div class="form-group span-2">
                <button type="button" id="saveNeedBtn" class="btn btn-primary">Update Capital Need</button>
              </div>
            </form>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Capital Efficiency &amp; Risk Diagnostic</h3>
          </div>
          <div class="card-body">
            <div class="diagnostic-box">
              <div class="diag-item">
                <strong>Milestone Credibility:</strong>
                <span class="${evalResult.isMilestoneCredible ? 'text-success' : 'text-danger'}">
                  ${evalResult.isMilestoneCredible ? '✓ Defined & Measurable' : '⚠ Vague / Unmeasurable'}
                </span>
              </div>
              <div class="diag-item">
                <strong>Overfunding Risk:</strong>
                <p class="diag-desc">${esc(evalResult.risks.overfundingRisk)}</p>
              </div>
              <div class="diag-item">
                <strong>Underfunding Risk:</strong>
                <p class="diag-desc">${esc(evalResult.risks.underfundingRisk)}</p>
              </div>
              <div class="diag-item">
                <strong>Non-Dilutive Alternative:</strong>
                <p class="diag-desc text-info">${esc(evalResult.nonDilutiveAlternative)}</p>
              </div>
            </div>

            <div class="use-of-funds-section">
              <h4>Use of Funds Breakdown</h4>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>%</th>
                    <th>Amount (€)</th>
                    <th>Operational Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  ${(need.useOfFunds || []).map(item => `
                    <tr>
                      <td><strong>${esc(item.category)}</strong></td>
                      <td>${item.percentage}%</td>
                      <td>€${Number(item.amount).toLocaleString()}</td>
                      <td>${esc(item.operationalRationale)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('saveNeedBtn')?.addEventListener('click', () => {
      need.milestone = document.getElementById('needMilestone').value;
      need.targetState = document.getElementById('needTargetState').value;
      need.purpose = document.getElementById('needPurpose').value;
      need.amountRange = {
        currency: 'EUR',
        minimumViable: Number(document.getElementById('needMin').value),
        comfortable: Number(document.getElementById('needComfortable').value),
        maximumUseful: Number(document.getElementById('needMax').value)
      };
      need.timeHorizonMonths = Number(document.getElementById('needHorizon').value);
      workspace.ventureName = document.getElementById('needVentureName').value;
      VACapitalStore.saveWorkspace(workspace);
      render();
    });
  }

  // --- TAB 2: FUNDING SOURCE FIT MATRIX ---
  function renderSourcesTab(container) {
    const venture = {
      stage: 'COMMERCIAL_EXPERIMENTATION',
      observedMonthlyRevenue: 2500,
      scores: { marketDemand: { value: 8.0 } },
      commercialSignals: { hasUrgentBuyerDemand: true }
    };

    const fitResults = fundingSources.map(src => VACapitalEngine.evaluateFundingFit(venture, src));

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Funding Source Taxonomy &amp; Fit Analysis</h3>
          <p class="card-subtitle">Evaluating ${fundingSources.length} capital instruments against stage, risk, and ownership implications.</p>
        </div>
        <div class="card-body">
          <div class="sources-grid">
            ${fitResults.map(fit => {
              const src = fundingSources.find(s => s.sourceId === fit.sourceId) || {};
              const badgeClass = fit.verdict === 'RECOMMENDED' ? 'badge-success' : (fit.verdict === 'VIABLE_OPTION' ? 'badge-info' : 'badge-danger');
              return `
                <div class="source-card">
                  <div class="source-card-header">
                    <h4>${esc(fit.name)}</h4>
                    <span class="badge ${badgeClass}">${fit.verdict.replace('_', ' ')} (${fit.fitScore}/100)</span>
                  </div>
                  <p class="source-desc">${esc(src.description)}</p>
                  <div class="source-meta">
                    <div><strong>Dilution:</strong> ${src.dilutionProfile?.isDilutive ? `${src.dilutionProfile.typicalEquityRangePercent.min}-${src.dilutionProfile.typicalEquityRangePercent.max}%` : 'None (0%)'}</div>
                    <div><strong>Timeline:</strong> ${src.typicalTimelineWeeks?.min}-${src.typicalTimelineWeeks?.max} weeks</div>
                    <div><strong>Governance:</strong> ${esc(src.governanceImpact)}</div>
                  </div>
                  <div class="source-fit-reasons">
                    ${fit.reasons.map(r => `<div class="fit-pro">✓ ${esc(r)}</div>`).join('')}
                    ${fit.flags.map(f => `<div class="fit-con">⚠ ${esc(f)}</div>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 3: NON-DILUTIVE GRANT ENGINE ---
  function renderGrantsTab(container) {
    const ventureCtx = {
      entityType: 'SME',
      isIncorporated: true,
      cashReserves: 25000
    };

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Verified Non-Dilutive Grant Programs</h3>
          <p class="card-subtitle">5-State eligibility mapping and effort vs. award yield comparison.</p>
        </div>
        <div class="card-body">
          <div class="grants-list">
            ${grantOpportunities.map(grant => {
              const evalRes = VACapitalEngine.evaluateGrantEligibility(ventureCtx, grant);
              const stateBadge = evalRes.overallState === 'CONFIRMED' ? 'badge-success' : (evalRes.overallState === 'POTENTIALLY_ELIGIBLE' ? 'badge-info' : 'badge-warning');

              return `
                <div class="grant-card">
                  <div class="grant-header">
                    <div>
                      <h4>${esc(grant.programName)}</h4>
                      <span class="grant-authority">${esc(grant.issuingAuthority)} · ${esc(grant.jurisdiction)}</span>
                    </div>
                    <span class="badge ${stateBadge}">${evalRes.overallState.replace('_', ' ')}</span>
                  </div>
                  <div class="grant-metrics">
                    <div><strong>Funding Range:</strong> €${grant.fundingRange.minAmount.toLocaleString()} – €${grant.fundingRange.maxAmount.toLocaleString()} (${grant.fundingRange.coFundingRatePercent}% rate)</div>
                    <div><strong>Effort:</strong> ~${grant.applicationEffortHours} hrs (${grant.typicalSuccessRatePercent}% success rate)</div>
                    <div><strong>Expected Yield:</strong> ~€${evalRes.expectedHourlyYield}/hr</div>
                  </div>
                  <div class="grant-criteria-box">
                    <h5>Eligibility Requirements:</h5>
                    <ul class="criteria-list">
                      ${evalRes.criteriaResults.map(c => `
                        <li>
                          <span class="criterion-status">${c.status === 'CONFIRMED' ? '✓' : (c.status === 'POTENTIALLY_ELIGIBLE' ? '○' : '⚠')}</span>
                          <strong>${esc(c.title)}:</strong> ${esc(c.rationale)}
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                  <div class="grant-footer">
                    <small>Official Source: <a href="${esc(grant.sourceUrl)}" target="_blank" rel="noopener">${esc(grant.sourceUrl)}</a> (Verified: ${grant.verifiedAt})</small>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 4: CAP TABLE & DILUTION SIMULATOR ---
  function renderDilutionTab(container) {
    const capTable = workspace.capTable || { stakeholders: [] };
    const defaultRound = { preMoneyValuation: 1500000, amountRaised: 300000, newOptionPoolCreatedPercent: 5 };
    const simResult = VACapitalEngine.calculateDilution(capTable, defaultRound);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>Current Cap Table</h3>
            <span>Fully Diluted: ${capTable.totalAuthorizedShares.toLocaleString()} shares</span>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Stakeholder</th>
                  <th>Role</th>
                  <th>Shares</th>
                  <th>Ownership %</th>
                </tr>
              </thead>
              <tbody>
                ${capTable.stakeholders.map(s => `
                  <tr>
                    <td><strong>${esc(s.name)}</strong></td>
                    <td>${esc(s.role)}</td>
                    <td>${Number(s.sharesCount).toLocaleString()}</td>
                    <td>${s.ownershipPercent}%</td>
                  </tr>
                `).join('')}
                <tr>
                  <td><em>Unallocated Option Pool</em></td>
                  <td>OPTION_POOL</td>
                  <td>${Number(capTable.optionPool?.unallocatedShares || 0).toLocaleString()}</td>
                  <td>${capTable.optionPool?.poolPercentOfFullyDiluted || 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Financing Round Simulator</h3>
          </div>
          <div class="card-body">
            <div class="form-grid">
              <div class="form-group">
                <label>Pre-Money Valuation (€)</label>
                <input type="number" id="simPreMoney" class="form-control" value="${defaultRound.preMoneyValuation}">
              </div>
              <div class="form-group">
                <label>Investment Amount (€)</label>
                <input type="number" id="simInvestment" class="form-control" value="${defaultRound.amountRaised}">
              </div>
              <div class="form-group span-2">
                <label>New Option Pool Target (% of Post-Money)</label>
                <input type="number" id="simOptionPool" class="form-control" value="${defaultRound.newOptionPoolCreatedPercent}">
              </div>
              <div class="form-group span-2">
                <button type="button" id="runSimBtn" class="btn btn-primary">Recalculate Dilution</button>
              </div>
            </div>

            <div id="simResultsArea" class="sim-results">
              <h4>Post-Round Ownership Waterfall</h4>
              <div class="metric-badges">
                <span class="badge badge-info">Post-Money: €${simResult.postMoneyValuation.toLocaleString()}</span>
                <span class="badge badge-info">Price/Share: €${simResult.pricePerShare}</span>
                <span class="badge badge-warning">New Investor: ${simResult.newInvestorOwnershipPercent}%</span>
              </div>
              <table class="data-table mt-3">
                <thead>
                  <tr>
                    <th>Stakeholder</th>
                    <th>Prior %</th>
                    <th>Post %</th>
                    <th>Dilution</th>
                  </tr>
                </thead>
                <tbody>
                  ${simResult.stakeholders.map(s => `
                    <tr>
                      <td>${esc(s.name)}</td>
                      <td>${s.priorOwnershipPercent}%</td>
                      <td><strong>${s.postOwnershipPercent}%</strong></td>
                      <td class="text-danger">-${s.dilutionExperiencedPercent}%</td>
                    </tr>
                  `).join('')}
                  <tr>
                    <td><em>Incoming Investors</em></td>
                    <td>0%</td>
                    <td><strong>${simResult.newInvestorOwnershipPercent}%</strong></td>
                    <td class="text-success">+${simResult.newInvestorOwnershipPercent}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('runSimBtn')?.addEventListener('click', () => {
      const pre = Number(document.getElementById('simPreMoney').value);
      const inv = Number(document.getElementById('simInvestment').value);
      const pool = Number(document.getElementById('simOptionPool').value);
      const updated = VACapitalEngine.calculateDilution(capTable, {
        preMoneyValuation: pre,
        amountRaised: inv,
        newOptionPoolCreatedPercent: pool
      });
      render();
    });
  }

  // --- TAB 5: INVESTOR READINESS & DATA ROOM ---
  function renderReadinessTab(container) {
    const evidenceCtx = {
      interviewCount: 15,
      hasMarketSizing: true,
      hasRegulatoryTrigger: true,
      isMvpWorking: true,
      hasPrototype: true,
      paidPilotsCount: 3,
      grossMarginPercent: 78,
      hasMilestoneLinkage: true,
      isIncorporated: true,
      ipAssignedToEntity: true
    };
    const dataRoom = workspace.dataRoom || {};
    const readiness = VACapitalEngine.evaluateInvestorReadiness(evidenceCtx, dataRoom);

    container.innerHTML = `
      <div class="panel grid-panel">
        <div class="card">
          <div class="card-header">
            <h3>Investor Readiness Scorecard</h3>
            <span class="badge ${readiness.compositeScore >= 75 ? 'badge-success' : 'badge-warning'}">
              ${readiness.readinessStage.replace(/_/g, ' ')} (${readiness.compositeScore}/100)
            </span>
          </div>
          <div class="card-body">
            <div class="pillars-list">
              ${readiness.pillars.map(p => `
                <div class="pillar-item">
                  <div class="pillar-header">
                    <strong>${esc(p.name)}</strong>
                    <span>${p.score}/100</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width:${p.score}%"></div>
                  </div>
                  <small class="pillar-detail">${esc(p.details)}</small>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Data Room &amp; Diligence Index</h3>
            <span>${dataRoom.missingCriticalCount || 0} critical missing</span>
          </div>
          <div class="card-body">
            ${(dataRoom.categories || []).map(cat => `
              <div class="dataroom-cat">
                <h4>${esc(cat.categoryName)}</h4>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Stage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cat.items.map(item => `
                      <tr>
                        <td>${esc(item.documentTitle)}</td>
                        <td>${esc(item.requiredStage)}</td>
                        <td><span class="badge ${item.status === 'READY' ? 'badge-success' : (item.status === 'DRAFT' ? 'badge-info' : 'badge-warning')}">${esc(item.status)}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 6: PIPELINE & TERM SHEETS ---
  function renderPipelineTab(container) {
    const pipe = workspace.investorPipeline || { entries: [] };

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Private Investor CRM &amp; Pipeline</h3>
          <span>Target: €${pipe.targetRaiseAmount?.amount?.toLocaleString() || '50,000'}</span>
        </div>
        <div class="card-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Investor / Fund</th>
                <th>Type</th>
                <th>Relationship Stage</th>
                <th>Check Range</th>
                <th>Fit Score</th>
                <th>Feedback / Notes</th>
              </tr>
            </thead>
            <tbody>
              ${pipe.entries.map(inv => `
                <tr>
                  <td><strong>${esc(inv.firmOrName)}</strong></td>
                  <td>${esc(inv.investorType)}</td>
                  <td><span class="badge badge-info">${esc(inv.relationshipStage)}</span></td>
                  <td>€${inv.checkSizeRange?.min?.toLocaleString()} - €${inv.checkSizeRange?.max?.toLocaleString()}</td>
                  <td>${inv.sectorFitScore}/10</td>
                  <td>${esc(inv.notes)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="workspace-portability mt-4">
            <h4>Private Data Backup</h4>
            <p>Cap tables, private notes, and pipeline CRM entries remain in your browser storage only.</p>
            <button id="exportCapitalJsonBtn" class="btn btn-secondary">Export JSON Backup</button>
            <button id="resetCapitalBtn" class="btn btn-danger">Reset Workspace</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('exportCapitalJsonBtn')?.addEventListener('click', () => {
      const json = VACapitalStore.exportWorkspaceJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capital-workspace-${workspace.ventureId}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('resetCapitalBtn')?.addEventListener('click', () => {
      if (confirm('Reset Capital Workspace to default state?')) {
        workspace = VACapitalStore.resetWorkspace();
        render();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadSeedData();
    init();
  });
})();
