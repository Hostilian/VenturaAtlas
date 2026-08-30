/**
 * VenturaAtlas RELAY — Ops Lab UI Controller
 * Wires the Ops Lab page (docs/ops-lab.html) to RelayStore and RelayEngine.
 */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('relayLabContainer');
  const fixtureSelect = document.getElementById('relayFixtureSelect');
  const tabButtons = document.querySelectorAll('.tab-nav .tab-btn');

  if (!container || typeof RelayStore === 'undefined' || typeof RelayEngine === 'undefined') {
    return;
  }

  const store = new RelayStore();
  let activeTab = 'tab-flow';
  let fixtures = [];

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

  // Fetch fixtures from data/relay-fixtures.json
  try {
    const res = await fetch('../data/relay-fixtures.json');
    if (res.ok) {
      const data = await res.json();
      fixtures = data.fixtures || [];
    }
  } catch (e) {
    console.warn('[OpsLab] Could not load fixtures:', e);
  }

  // Handle Fixture Selection
  if (fixtureSelect) {
    fixtureSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId === 'default') {
        store.resetWorkspace();
      } else {
        const fixture = fixtures.find(f => f.fixtureId === selectedId);
        if (fixture) {
          store.loadFixture(fixture);
        }
      }
      render();
    });
  }

  // Handle Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      render();
    });
  });


  function render() {
    const ws = store.getWorkspace();
    if (!ws) {
      container.innerHTML = '<div class="notice">No active workspace loaded.</div>';
      return;
    }

    const flowMetrics = RelayEngine.evaluateFlowMetrics(ws.fulfillments);
    const capacityAssessment = RelayEngine.evaluateCapacityAndBottlenecks(ws.processes[0], ws.fulfillments, ws.capacityModels[0] || {});
    const qualityHealth = RelayEngine.evaluateQualityHealth(ws.defects, ws.fulfillments);
    const supplierRisk = RelayEngine.evaluateSupplierRisk(ws.suppliers);
    const operationalDebt = RelayEngine.detectOperationalDebt(ws);

    let html = '';

    // Render Tab 1: Fulfillment & Flow
    if (activeTab === 'tab-flow') {
      html += renderFlowTab(ws, flowMetrics, capacityAssessment, operationalDebt);
    }
    // Render Tab 2: Quality & Defect Radar
    else if (activeTab === 'tab-quality') {
      html += renderQualityTab(ws, qualityHealth);
    }
    // Render Tab 3: Capacity & Bottlenecks
    else if (activeTab === 'tab-capacity') {
      html += renderCapacityTab(ws, capacityAssessment, flowMetrics);
    }
    // Render Tab 4: Cost to Serve
    else if (activeTab === 'tab-cost') {
      html += renderCostTab(ws);
    }
    // Render Tab 5: Supplier Resilience
    else if (activeTab === 'tab-suppliers') {
      html += renderSuppliersTab(ws, supplierRisk);
    }
    // Render Tab 6: Support & Continuous Improvement
    else if (activeTab === 'tab-improvement') {
      html += renderImprovementTab(ws);
    }

    container.innerHTML = html;
    attachDynamicEventListeners();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TAB RENDERERS
  // ───────────────────────────────────────────────────────────────────────────

  function renderFlowTab(ws, flow, cap, debt) {
    const process = ws.processes[0] || { name: 'Generic Fulfillment Process', stages: [] };

    return `
      <!-- Scoreboard -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Active WIP</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${flow.activeWipCount} <span style="font-size:0.85rem;color:var(--text2)">units</span></div>
          <div style="font-size:0.75rem;color:var(--text2)">In-flight delivery</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Avg Lead Time</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${flow.avgLeadTimeHours}h</div>
          <div style="font-size:0.75rem;color:var(--text2)">Order to accepted</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Flow Efficiency</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${(flow.flowEfficiency * 100).toFixed(1)}%</div>
          <div style="font-size:0.75rem;color:var(--text2)">Touch / total time</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">First-Pass Yield</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${(flow.firstPassYield * 100).toFixed(1)}%</div>
          <div style="font-size:0.75rem;color:var(--text2)">Delivered without rework</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Bottleneck Stage</div>
          <div style="font-size:1.1rem;font-weight:700;margin:0.2rem 0;color:var(--accent)">${cap.bottleneckStageName}</div>
          <div style="font-size:0.75rem;color:var(--text2)">Throughput constraint</div>
        </div>
      </div>

      ${debt.length > 0 ? `
        <div class="notice" style="margin-bottom:1.5rem">
          <strong>Operational Debt Detected:</strong>
          <ul style="margin:0.5rem 0 0 1.2rem;padding:0">
            ${debt.map(d => `<li><strong>${d.title}:</strong> ${d.detail}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Process Stages Map -->
      <section class="panel" style="padding:1.25rem;margin-bottom:1.5rem">
        <h2 style="margin-top:0">Process Stage Architecture: ${process.name}</h2>
        <p style="color:var(--text2);font-size:0.85rem">${process.purpose || ''}</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1rem">
          ${(process.stages || []).map(stg => `
            <div style="border:1px solid var(--border);border-radius:6px;padding:0.75rem;background:${stg.isBottleneckRisk ? 'rgba(239,68,68,0.05)' : 'var(--bg)'}">
              <div style="font-weight:600;font-size:0.9rem">${stg.sequenceOrder}. ${stg.name}</div>
              <div style="font-size:0.75rem;color:var(--text2);margin-top:0.3rem">
                Touch: ${stg.standardTouchTimeMinutes}m · Wait: ${stg.standardWaitTimeMinutes}m
              </div>
              <div style="font-size:0.75rem;margin-top:0.4rem">
                <span class="chip" style="font-size:0.7rem">${stg.automationLevel || 'MANUAL'}</span>
                ${stg.isBottleneckRisk ? '<span class="chip" style="background:#fee2e2;color:#991b1b;font-size:0.7rem">Bottleneck</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Active Fulfillment Work Orders -->
      <section class="panel" style="padding:1.25rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h2 style="margin:0">Fulfillment Work Orders (${ws.fulfillments.length})</h2>
          <button id="addFulfillmentBtn" class="button primary" style="font-size:0.8rem">+ New Order</button>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
            <thead>
              <tr style="border-bottom:1px solid var(--border);text-align:left;color:var(--text2)">
                <th style="padding:0.5rem">Order ID</th>
                <th style="padding:0.5rem">Customer</th>
                <th style="padding:0.5rem">State</th>
                <th style="padding:0.5rem">Touch / Wait</th>
                <th style="padding:0.5rem">Rework</th>
                <th style="padding:0.5rem">Cost</th>
                <th style="padding:0.5rem">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${ws.fulfillments.map(f => `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:0.6rem 0.5rem;font-family:monospace;font-weight:600">${f.fulfillmentId}</td>
                  <td style="padding:0.6rem 0.5rem">${f.customerRef}</td>
                  <td style="padding:0.6rem 0.5rem">
                    <select class="form-select state-select" data-id="${f.fulfillmentId}" style="font-size:0.75rem;padding:0.2rem">
                      ${RelayEngine.FULFILLMENT_STATES.map(st => `
                        <option value="${st}" ${st === f.state ? 'selected' : ''}>${st}</option>
                      `).join('')}
                    </select>
                  </td>
                  <td style="padding:0.6rem 0.5rem">${f.touchTimeMinutes}m / ${f.waitTimeMinutes}m</td>
                  <td style="padding:0.6rem 0.5rem">${f.reworkCount > 0 ? `<span style="color:#dc2626;font-weight:600">${f.reworkCount} rework</span>` : '0'}</td>
                  <td style="padding:0.6rem 0.5rem">${f.costToServe?.currency || 'EUR'} ${f.costToServe?.totalCost || 0}</td>
                  <td style="padding:0.6rem 0.5rem">
                    <button class="button ghost qc-btn" data-id="${f.fulfillmentId}" style="font-size:0.75rem;padding:0.2rem 0.5rem">Log Defect</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderQualityTab(ws, quality) {
    return `
      <!-- Quality Scoreboard -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Total Defects</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${quality.totalDefects}</div>
          <div style="font-size:0.75rem;color:var(--text2)">${quality.openDefects} unresolved</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Customer Escape Rate</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0;color:${quality.escapes > 0 ? '#dc2626' : 'var(--text)'}">${quality.escapeRatePercent}%</div>
          <div style="font-size:0.75rem;color:var(--text2)">Defects reaching customer</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Cost of Poor Quality</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">EUR ${quality.totalCostOfPoorQuality}</div>
          <div style="font-size:0.75rem;color:var(--text2)">Direct rework + scrap losses</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">CAPA Closure Rate</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${quality.capaClosureRatePercent}%</div>
          <div style="font-size:0.75rem;color:var(--text2)">Verified effective fixes</div>
        </div>
      </div>

      <!-- Defect & CAPA Ledger -->
      <section class="panel" style="padding:1.25rem">
        <h2 style="margin-top:0">Quality Defects &amp; 5-Whys Root Cause Analysis</h2>
        ${ws.defects.length === 0 ? '<p style="color:var(--text2)">Zero active defects logged. Quality control operating cleanly.</p>' : `
          <div style="display:flex;flex-direction:column;gap:1rem">
            ${ws.defects.map(d => `
              <div style="border:1px solid var(--border);border-left:4px solid ${d.isEscape ? '#dc2626' : '#eab308'};border-radius:6px;padding:1rem">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div>
                    <span style="font-family:monospace;font-weight:600">${d.defectId}</span>
                    <span class="chip" style="margin-left:0.5rem">${d.category}</span>
                    <span class="chip" style="background:${d.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}">${d.severity}</span>
                    ${d.isEscape ? '<span class="chip" style="background:#fee2e2;color:#991b1b">Customer Escape</span>' : '<span class="chip">Caught at Internal QC</span>'}
                  </div>
                  <span style="font-size:0.75rem;color:var(--text2)">Status: <strong>${d.status}</strong></span>
                </div>
                <p style="margin:0.5rem 0;font-size:0.9rem">${d.description}</p>
                
                <!-- 5 Whys Box -->
                <div style="background:rgba(0,0,0,0.02);border:1px solid var(--border);border-radius:4px;padding:0.75rem;margin-top:0.5rem;font-size:0.8rem">
                  <div style="font-weight:600;margin-bottom:0.3rem">🔍 5-Whys Diagnostic:</div>
                  <ol style="margin:0 0 0.5rem 1.2rem;padding:0">
                    ${(d.rootCauseAnalysis?.fiveWhys || []).map(w => `<li>${w}</li>`).join('')}
                  </ol>
                  <div><strong>Identified Root Cause:</strong> ${d.rootCauseAnalysis?.identifiedRootCause || 'Under investigation'}</div>
                </div>

                <!-- CAPA Section -->
                <div style="margin-top:0.75rem;font-size:0.8rem;display:flex;justify-content:space-between;align-items:center">
                  <div><strong>Corrective Action:</strong> ${d.correctiveAction?.description || 'None assigned'}</div>
                  <div>${d.correctiveAction?.isVerifiedEffective ? '<span style="color:#16a34a;font-weight:600">✓ Verified Effective</span>' : '<span style="color:#ca8a04">Pending Verification</span>'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </section>
    `;
  }

  function renderCapacityTab(ws, cap, flow) {
    const process = ws.processes[0] || {};
    return `
      <!-- Capacity Simulator -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Demonstrated Capacity</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${cap.demonstratedWeeklyCapacity} <span style="font-size:0.85rem;color:var(--text2)">units/wk</span></div>
          <div style="font-size:0.75rem;color:var(--text2)">Theoretical max: ${cap.theoreticalMaxCapacity}</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Current Demand</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${cap.currentDemandWeekly} <span style="font-size:0.85rem;color:var(--text2)">units/wk</span></div>
          <div style="font-size:0.75rem;color:var(--text2)">Utilization: ${(cap.utilizationRate * 100).toFixed(0)}%</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Demand Cliff Limit</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0;color:${cap.isAtDemandCliff ? '#dc2626' : 'var(--text)'}">${cap.demandCliffUnitsPerWeek} <span style="font-size:0.85rem;color:var(--text2)">units/wk</span></div>
          <div style="font-size:0.75rem;color:var(--text2)">Threshold where delivery collapses</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Little's Law Validation</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${cap.littlesLawExpectedWip} <span style="font-size:0.85rem;color:var(--text2)">expected WIP</span></div>
          <div style="font-size:0.75rem;color:var(--text2)">Actual WIP: ${cap.wipCount}</div>
        </div>
      </div>

      <section class="panel" style="padding:1.25rem;margin-bottom:1.5rem">
        <h2 style="margin-top:0">Constraint &amp; Demand Spike Stress Testing</h2>
        <p style="color:var(--text2);font-size:0.85rem">Simulate what happens operationally if customer volume spikes 2× or 10× tomorrow.</p>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-top:1rem">
          <div style="border:1px solid var(--border);border-radius:6px;padding:1rem">
            <h3 style="margin:0 0 0.5rem;font-size:1rem">Baseline (1× Demand: ${cap.demonstratedWeeklyCapacity} units/wk)</h3>
            <div style="font-size:0.85rem;color:var(--text2)">Status: <span style="color:#16a34a;font-weight:600">Stable Flow</span></div>
            <div style="font-size:0.85rem;margin-top:0.3rem">Lead Time: ~${flow.avgLeadTimeHours || 24}h · Bottleneck Stage: ${cap.bottleneckStageName}</div>
          </div>
          <div style="border:1px solid var(--border);border-radius:6px;padding:1rem;background:rgba(234,179,8,0.05)">
            <h3 style="margin:0 0 0.5rem;font-size:1rem">2× Demand (${cap.demonstratedWeeklyCapacity * 2} units/wk)</h3>
            <div style="font-size:0.85rem;color:#ca8a04;font-weight:600">⚠ Queue Saturation Risk</div>
            <div style="font-size:0.85rem;margin-top:0.3rem">Utilization: ${(cap.demonstratedWeeklyCapacity * 2 / cap.demonstratedWeeklyCapacity * 100).toFixed(0)}%. Lead times double due to queue accumulation.</div>
          </div>
          <div style="border:1px solid var(--border);border-radius:6px;padding:1rem;background:rgba(239,68,68,0.05)">
            <h3 style="margin:0 0 0.5rem;font-size:1rem">10× Demand (${cap.demonstratedWeeklyCapacity * 10} units/wk)</h3>
            <div style="font-size:0.85rem;color:#dc2626;font-weight:600">🚨 Demand Cliff Collapse</div>
            <div style="font-size:0.85rem;margin-top:0.3rem">Current operating model fails. Required intervention: ${ws.capacityModels[0]?.requiredInterventionAtCliff || 'Restructure workflow into straight-through automation'}</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderCostTab(ws) {
    const costModel = ws.costModels[0] || { totalCostToServePerUnit: 200, baseDeliveryCost: {} };
    return `
      <!-- Cost-to-Serve Analyzer -->
      <section class="panel" style="padding:1.25rem;margin-bottom:1.5rem">
        <h2 style="margin-top:0">Unit Cost-to-Serve Breakdown: ${costModel.flowUnit || 'Delivery Unit'}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem">
          <div style="padding:0.75rem;border:1px solid var(--border);border-radius:6px">
            <div style="font-size:0.75rem;color:var(--text2)">Direct Labor</div>
            <div style="font-size:1.3rem;font-weight:700">EUR ${costModel.baseDeliveryCost?.directLabor || 0}</div>
          </div>
          <div style="padding:0.75rem;border:1px solid var(--border);border-radius:6px">
            <div style="font-size:0.75rem;color:var(--text2)">Compute / APIs</div>
            <div style="font-size:1.3rem;font-weight:700">EUR ${costModel.baseDeliveryCost?.computeOrApi || 0}</div>
          </div>
          <div style="padding:0.75rem;border:1px solid var(--border);border-radius:6px">
            <div style="font-size:0.75rem;color:var(--text2)">Inspection &amp; QC</div>
            <div style="font-size:1.3rem;font-weight:700">EUR ${costModel.baseDeliveryCost?.inspection || 0}</div>
          </div>
          <div style="padding:0.75rem;border:1px solid var(--border);border-radius:6px">
            <div style="font-size:0.75rem;color:var(--text2)">Exception / Rework Overhead</div>
            <div style="font-size:1.3rem;font-weight:700;color:#dc2626">EUR ${costModel.exceptionOverheadCost?.expectedReworkPerUnit || 0}</div>
          </div>
          <div style="padding:0.75rem;border:1px solid var(--border);border-radius:6px;background:rgba(0,0,0,0.02)">
            <div style="font-size:0.75rem;color:var(--text2)">Total Cost to Serve</div>
            <div style="font-size:1.3rem;font-weight:700;color:var(--accent)">EUR ${costModel.totalCostToServePerUnit || 0}</div>
          </div>
        </div>
      </section>

      <!-- Fulfillments Cost Variance Ledger -->
      <section class="panel" style="padding:1.25rem">
        <h2 style="margin-top:0">Order-Level Cost Variance &amp; Margin Erosion</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
            <thead>
              <tr style="border-bottom:1px solid var(--border);text-align:left;color:var(--text2)">
                <th style="padding:0.5rem">Order ID</th>
                <th style="padding:0.5rem">Customer</th>
                <th style="padding:0.5rem">Base Labor</th>
                <th style="padding:0.5rem">Compute</th>
                <th style="padding:0.5rem">Rework Cost</th>
                <th style="padding:0.5rem">Support</th>
                <th style="padding:0.5rem">Total Cost</th>
                <th style="padding:0.5rem">Variance vs Baseline</th>
              </tr>
            </thead>
            <tbody>
              ${ws.fulfillments.map(f => {
                const cts = RelayEngine.calculateCostToServe(f, costModel);
                return `
                  <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:0.6rem 0.5rem;font-family:monospace;font-weight:600">${f.fulfillmentId}</td>
                    <td style="padding:0.6rem 0.5rem">${f.customerRef}</td>
                    <td style="padding:0.6rem 0.5rem">EUR ${cts.directLabor}</td>
                    <td style="padding:0.6rem 0.5rem">EUR ${cts.computeOrApi}</td>
                    <td style="padding:0.6rem 0.5rem;color:${cts.rework > 0 ? '#dc2626' : 'var(--text)'}">EUR ${cts.rework}</td>
                    <td style="padding:0.6rem 0.5rem">EUR ${cts.support}</td>
                    <td style="padding:0.6rem 0.5rem;font-weight:700">EUR ${cts.totalCost}</td>
                    <td style="padding:0.6rem 0.5rem">
                      <span class="chip" style="background:${cts.costVariancePercent > 20 ? '#fee2e2' : '#f3f4f6'};color:${cts.costVariancePercent > 20 ? '#991b1b' : 'inherit'}">
                        ${cts.costVariancePercent >= 0 ? `+${cts.costVariancePercent}%` : `${cts.costVariancePercent}%`}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSuppliersTab(ws, supRisk) {
    return `
      <!-- Supplier Resilience Matrix -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Critical Suppliers</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${supRisk.criticalCount}</div>
          <div style="font-size:0.75rem;color:var(--text2)">Total: ${supRisk.totalSuppliers}</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Single-Source Risk</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0;color:${supRisk.singleSourceCriticalCount > 0 ? '#dc2626' : 'var(--text)'}">${supRisk.singleSourceCriticalCount}</div>
          <div style="font-size:0.75rem;color:var(--text2)">Zero backup provider</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">High-Variance Suppliers</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${supRisk.highVarianceCount}</div>
          <div style="font-size:0.75rem;color:var(--text2)">Unpredictable lead times</div>
        </div>
        <div class="panel" style="padding:1rem">
          <div style="font-size:0.75rem;color:var(--text2);text-transform:uppercase">Resilience Score</div>
          <div style="font-size:1.6rem;font-weight:700;margin:0.2rem 0">${supRisk.resilienceScore} / 100</div>
          <div style="font-size:0.75rem;color:var(--text2)">${supRisk.resilienceLevel}</div>
        </div>
      </div>

      <section class="panel" style="padding:1.25rem">
        <h2 style="margin-top:0">Operational Supplier &amp; Vendor Registry</h2>
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${ws.suppliers.map(sup => `
            <div style="border:1px solid var(--border);border-radius:6px;padding:1rem">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0 0 0.3rem;font-size:1rem">${sup.name}</h3>
                  <span class="chip">${sup.category}</span>
                  <span class="chip" style="background:${sup.criticality === 'CRITICAL' ? '#fee2e2' : '#f3f4f6'};color:${sup.criticality === 'CRITICAL' ? '#991b1b' : 'inherit'}">${sup.criticality}</span>
                  ${sup.isSingleSource ? '<span class="chip" style="background:#fee2e2;color:#991b1b">Single Source (No Backup)</span>' : '<span class="chip">Dual Sourced</span>'}
                </div>
                <div style="text-align:right;font-size:0.8rem;color:var(--text2)">
                  Lead Time: <strong>${sup.standardLeadTimeDays}d</strong> (±${sup.leadTimeVarianceDays}d)
                </div>
              </div>
              <p style="margin:0.5rem 0;font-size:0.85rem"><strong>Supplies:</strong> ${(sup.supplies || []).join(', ')}</p>
              <div style="background:rgba(0,0,0,0.02);border:1px solid var(--border);border-radius:4px;padding:0.6rem;font-size:0.8rem">
                <strong>🛡️ Business Continuity Contingency:</strong> ${sup.continuityPlan || 'No explicit continuity plan documented.'}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderImprovementTab(ws) {
    return `
      <!-- Support Cases -->
      <section class="panel" style="padding:1.25rem;margin-bottom:1.5rem">
        <h2 style="margin-top:0">Customer Support Cases (${ws.supportCases.length})</h2>
        ${ws.supportCases.length === 0 ? '<p style="color:var(--text2)">Zero support tickets currently open.</p>' : `
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
              <thead>
                <tr style="border-bottom:1px solid var(--border);text-align:left;color:var(--text2)">
                  <th style="padding:0.5rem">Case ID</th>
                  <th style="padding:0.5rem">Customer</th>
                  <th style="padding:0.5rem">Category</th>
                  <th style="padding:0.5rem">Severity</th>
                  <th style="padding:0.5rem">Resolution Time</th>
                  <th style="padding:0.5rem">Defect Link</th>
                </tr>
              </thead>
              <tbody>
                ${ws.supportCases.map(c => `
                  <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:0.6rem 0.5rem;font-family:monospace;font-weight:600">${c.caseId}</td>
                    <td style="padding:0.6rem 0.5rem">${c.customerRef}</td>
                    <td style="padding:0.6rem 0.5rem">${c.category}</td>
                    <td style="padding:0.6rem 0.5rem"><span class="chip">${c.severity}</span></td>
                    <td style="padding:0.6rem 0.5rem">${c.resolutionMinutes}m</td>
                    <td style="padding:0.6rem 0.5rem">${c.linkedDefectId || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </section>

      <!-- Continuous Improvement (PDCA) Ledger -->
      <section class="panel" style="padding:1.25rem">
        <h2 style="margin-top:0">Continuous Improvement (PDCA) Ledger (${ws.improvements.length})</h2>
        ${ws.improvements.length === 0 ? '<p style="color:var(--text2)">No active PDCA improvement cycles registered.</p>' : `
          <div style="display:flex;flex-direction:column;gap:1rem">
            ${ws.improvements.map(imp => `
              <div style="border:1px solid var(--border);border-left:4px solid #16a34a;border-radius:6px;padding:1rem">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div>
                    <h3 style="margin:0 0 0.2rem;font-size:1rem">${imp.title}</h3>
                    <span class="chip">${imp.status}</span>
                  </div>
                  <span style="font-size:0.8rem;color:#16a34a;font-weight:600">
                    Delta: ${imp.verifiedResult?.deltaPercent}%
                  </span>
                </div>
                <p style="margin:0.5rem 0;font-size:0.85rem"><strong>Problem:</strong> ${imp.problemStatement}</p>
                <div style="font-size:0.8rem;color:var(--text2)">
                  Baseline: <strong>${imp.baselineMetric?.value}${imp.baselineMetric?.unit}</strong> → Verified Outcome: <strong>${imp.verifiedResult?.measuredValue}${imp.baselineMetric?.unit}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </section>
    `;
  }

  function attachDynamicEventListeners() {
    // State selector updates
    document.querySelectorAll('.state-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const fId = e.target.getAttribute('data-id');
        const newState = e.target.value;
        store.updateFulfillmentState(fId, newState, 'Manual operator transition in Ops Lab');
        render();
      });
    });

    // Add fulfillment button
    const addBtn = document.getElementById('addFulfillmentBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const id = `ful-new-${Date.now().toString().slice(-4)}`;
        store.addFulfillment({
          fulfillmentId: id,
          ventureId: store.getWorkspace().ventureId,
          processId: store.getWorkspace().processes[0]?.processId || 'proc-default',
          customerRef: 'cust-demo-client',
          offerRef: 'offer-standard',
          state: 'REQUESTED',
          createdAt: new Date().toISOString(),
          promisedDeliveryAt: new Date(Date.now() + 86400000 * 3).toISOString(),
          deliveredAt: null,
          acceptedAt: null,
          stateHistory: [{ state: 'REQUESTED', timestamp: new Date().toISOString(), reason: 'Order created in Ops Lab' }],
          touchTimeMinutes: 15,
          waitTimeMinutes: 30,
          reworkCount: 0,
          qualityPassed: true,
          costToServe: {
            currency: 'EUR',
            directLaborCost: 100,
            computeOrApiCost: 15,
            supplierCost: 0,
            reworkCost: 0,
            inspectionCost: 20,
            shippingCost: 0,
            supportOverheadCost: 10,
            totalCost: 145
          },
          exceptionNote: null
        });
        render();
      });
    }

    document.querySelectorAll('.qc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fId = e.target.getAttribute('data-id');
        const defectDesc = window.prompt(`Log a defect for fulfillment ${fId}:`);
        if (defectDesc) {
          store.addDefect({
            defectId: 'def-' + Date.now(),
            fulfillmentId: fId,
            description: defectDesc,
            timestamp: new Date().toISOString(),
            status: 'OPEN'
          });
          render();
        }
      });
    });
  }

  // Initial render
  render();
});
