/**
 * Venture Atlas OS — Decision Packet Comparison Engine (v3.0.0)
 * Parses and synthesizes multiple exported vote-packet-*.json files side-by-side.
 * Computes mean, median, range, standard deviation, and flags polarized ideas.
 */

function initRoomCompare() {
  const container = document.getElementById('compareApp');
  if (!container) return;

  const base = window.VA?.base || '..';
  const ideasData = window.VA?.ideas || [];
  const ideasMap = new Map(ideasData.map(i => [i.id, i]));

  // State: array of loaded packet objects
  let loadedPackets = [];

  function render() {
    container.innerHTML = `
      <!-- Upload / Drop Zone Area -->
      <div class="card" style="padding:1.75rem;background:var(--panel);border:1px solid var(--line);margin-bottom:1.75rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1rem">
          <div>
            <h2 style="font-size:1.3rem;margin:0 0 0.3rem">📁 Load Friend Decision Packets</h2>
            <p style="font-size:0.88rem;color:var(--text2);margin:0">
              Select or drag in 2 or more <code>vote-packet-*.json</code> files exported by you and your co-founders.
            </p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="button secondary sm" id="btnLoadDemoPackets">✨ Load 3-Founder Demo Packets</button>
            <button class="button ghost sm" id="btnClearPackets" ${loadedPackets.length === 0 ? 'disabled' : ''}>Clear All</button>
          </div>
        </div>

        <!-- Drag & Drop Target -->
        <div id="dropZone" style="border:2px dashed var(--line);border-radius:var(--radius);padding:2rem;text-align:center;background:var(--panel2);cursor:pointer;transition:border-color 0.2s ease">
          <div style="font-size:2.2rem;margin-bottom:0.5rem">📥</div>
          <p style="font-weight:600;margin-bottom:0.25rem">Drag &amp; drop decision packet JSON files here</p>
          <p style="font-size:0.8rem;color:var(--muted);margin-bottom:1rem">or click to browse from your computer</p>
          <button class="button primary sm" id="btnBrowseFiles" type="button">Select .json Files</button>
          <input type="file" id="packetFileInput" multiple accept=".json,application/json" style="display:none">
        </div>

        <!-- Loaded Packets Pill Bar -->
        ${loadedPackets.length > 0 ? `
          <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--line)">
            <div style="font-size:0.8rem;font-weight:700;color:var(--muted);margin-bottom:0.5rem;text-transform:uppercase">
              Loaded Voters (${loadedPackets.length})
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
              ${loadedPackets.map((pkt, idx) => `
                <span class="chip status" style="font-size:0.82rem;padding:0.35rem 0.65rem">
                  👤 <strong>${esc(pkt.evaluator || pkt.nickname || pkt.roomName || 'Voter ' + (idx + 1))}</strong>
                  <span style="font-size:0.75rem;color:var(--muted);margin-left:0.3rem">(${Object.keys(pkt.votes || pkt.scorecards || {}).length} ideas rated)</span>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Synthesis & Comparison Results -->
      ${loadedPackets.length === 0 ? `
        <div class="panel empty" style="padding:3rem 1.5rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">⚖️</div>
          <h3 style="font-size:1.25rem;margin-bottom:0.4rem">No Decision Packets Loaded Yet</h3>
          <p style="color:var(--text2);max-width:520px;margin:0 auto 1.5rem">
            Once everyone has completed their evaluation in a Decision Room, export the packets and drop them here to synthesize consensus, surface disagreement, and choose a provisional winner.
          </p>
          <div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap">
            <button class="button primary sm" id="btnLoadDemoEmpty">✨ Load 3-Founder Demo Packets</button>
            <a href="${base}/docs/room.html" class="button secondary sm">Open Decision Room →</a>
          </div>
        </div>
      ` : renderSynthesisResults(loadedPackets)}
    `;

    bindEvents();
  }

  function renderSynthesisResults(packets) {
    // Collect all evaluated idea IDs across all packets
    const ideaIdSet = new Set();
    packets.forEach(p => {
      (p.shortlist || []).forEach(id => ideaIdSet.add(id));
      Object.keys(p.votes || {}).forEach(id => ideaIdSet.add(id));
      Object.keys(p.scorecards || {}).forEach(id => ideaIdSet.add(id));
      Object.keys(p.evaluations || {}).forEach(id => ideaIdSet.add(id));
    });

    const evaluatedIdeas = Array.from(ideaIdSet).map(id => {
      const raw = ideasMap.get(id);
      return {
        id,
        name: raw ? raw.name : id,
        category: raw ? raw.category : 'General',
        oneSentenceConcept: raw ? raw.oneSentenceConcept : '',
        overallScore: raw?.atAGlance?.overallScore ?? null,
        targetCustomer: raw?.atAGlance?.targetCustomer || '—'
      };
    });

    // Compute metrics for each idea across all loaded packets
    const ideaStats = evaluatedIdeas.map(idea => {
      const votes = [];
      const scores = [];
      const evaluations = [];

      packets.forEach(p => {
        const voterName = p.evaluator || p.nickname || p.roomName || 'Anonymous';
        
        // Reaction vote
        if (p.votes && p.votes[idea.id]) {
          votes.push({ voter: voterName, val: p.votes[idea.id] });
        }

        // Scorecard
        if (p.scorecards && p.scorecards[idea.id]) {
          const sc = p.scorecards[idea.id];
          const dims = Object.values(sc).filter(v => Number.isFinite(v));
          if (dims.length) {
            const avg = dims.reduce((a, b) => a + b, 0) / dims.length;
            scores.push({ voter: voterName, avg, dims: sc });
          }
        }

        // Evaluation notes
        if (p.evaluations && p.evaluations[idea.id]) {
          evaluations.push({ voter: voterName, ...p.evaluations[idea.id] });
        }
      });

      // Statistics calculations
      const numericScores = scores.map(s => s.avg);
      let mean = null;
      let median = null;
      let range = null;
      let stdDev = null;
      let isPolarized = false;

      if (numericScores.length > 0) {
        mean = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
        const sorted = [...numericScores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
        range = sorted[sorted.length - 1] - sorted[0];

        if (numericScores.length >= 2) {
          const variance = numericScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericScores.length;
          stdDev = Math.sqrt(variance);
          // High disagreement / polarization flag when stdDev >= 1.5 or range >= 3.0
          if (stdDev >= 1.5 || range >= 3.0) {
            isPolarized = true;
          }
        }
      }

      // Reaction counts
      const interestedCount = votes.filter(v => v.val === 'interested').length;
      const unsureCount = votes.filter(v => v.val === 'unsure').length;
      const passCount = votes.filter(v => v.val === 'pass').length;

      return {
        idea,
        votes,
        scores,
        evaluations,
        interestedCount,
        unsureCount,
        passCount,
        mean: mean !== null ? Number(mean.toFixed(2)) : null,
        median: median !== null ? Number(median.toFixed(2)) : null,
        range: range !== null ? Number(range.toFixed(2)) : null,
        stdDev: stdDev !== null ? Number(stdDev.toFixed(2)) : null,
        isPolarized
      };
    }).sort((a, b) => {
      if (b.mean !== null && a.mean !== null) return b.mean - a.mean;
      return b.interestedCount - a.interestedCount;
    });

    const topCandidate = ideaStats[0];
    const polarizedCandidates = ideaStats.filter(i => i.isPolarized);

    return `
      <!-- Summary KPI Row -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
          <div style="font-size:0.75rem;color:var(--muted);font-weight:700;text-transform:uppercase">Candidates Compared</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text);margin:0.2rem 0">${ideaStats.length}</div>
          <div style="font-size:0.8rem;color:var(--text2)">Across ${packets.length} friend packets</div>
        </div>

        <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
          <div style="font-size:0.75rem;color:var(--muted);font-weight:700;text-transform:uppercase">Top Consensus Leader</div>
          <div style="font-size:1.15rem;font-weight:800;color:var(--accent);margin:0.2rem 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${topCandidate ? esc(topCandidate.idea.name) : '—'}
          </div>
          <div style="font-size:0.8rem;color:var(--text2)">
            ${topCandidate?.mean != null ? 'Avg Score: ' + topCandidate.mean + '/10' : topCandidate?.interestedCount + ' 👍 Interested'}
          </div>
        </div>

        <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
          <div style="font-size:0.75rem;color:var(--muted);font-weight:700;text-transform:uppercase">Polarized Ideas (Split Votes)</div>
          <div style="font-size:1.8rem;font-weight:800;color:${polarizedCandidates.length ? 'var(--warn)' : 'var(--score-hi)'};margin:0.2rem 0">
            ${polarizedCandidates.length}
          </div>
          <div style="font-size:0.8rem;color:var(--text2)">
            ${polarizedCandidates.length ? 'Require team discussion' : 'Strong team consensus'}
          </div>
        </div>
      </div>

      <!-- Synthesis Table / Details -->
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        ${ideaStats.map((item, rank) => `
          <div class="card" style="padding:1.5rem;background:var(--panel);border:1px solid var(--line)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;border-bottom:1px solid var(--line);padding-bottom:1rem">
              <div>
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
                  <span class="badge sm" style="font-weight:800">#${rank + 1}</span>
                  <span class="chip status sm">${esc(item.idea.category)}</span>
                  ${item.isPolarized ? '<span class="chip warn sm">⚠ High Polarization (±' + item.stdDev + ')</span>' : ''}
                </div>
                <h3 style="font-size:1.25rem;margin:0.2rem 0">
                  <a href="${base}/docs/idea.html?id=${encodeURIComponent(item.idea.id)}">${esc(item.idea.name)}</a>
                </h3>
                <p style="font-size:0.85rem;color:var(--text2);margin:0">${esc(item.idea.oneSentenceConcept)}</p>
              </div>

              <div style="display:flex;gap:0.75rem;align-items:center;background:var(--panel2);padding:0.6rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
                ${item.mean !== null ? `
                  <div>
                    <div style="font-size:0.7rem;color:var(--muted);font-weight:700">MEAN SCORE</div>
                    <div style="font-size:1.4rem;font-weight:800;color:var(--accent)">${item.mean} <span style="font-size:0.75rem;font-weight:500;color:var(--muted)">/ 10</span></div>
                  </div>
                  <div style="border-left:1px solid var(--line);padding-left:0.75rem;font-size:0.75rem;color:var(--text2)">
                    <div>Median: <strong>${item.median}</strong></div>
                    <div>Std Dev: <strong>${item.stdDev ?? 0}</strong></div>
                  </div>
                ` : `
                  <div>
                    <div style="font-size:0.7rem;color:var(--muted);font-weight:700">REACTIONS</div>
                    <div style="font-size:0.95rem;font-weight:700;color:var(--text)">
                      👍 ${item.interestedCount} &nbsp;·&nbsp; 🤔 ${item.unsureCount} &nbsp;·&nbsp; 👎 ${item.passCount}
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- Friend Votes & Scores Grid -->
            <div style="margin-bottom:1rem">
              <h4 style="font-size:0.88rem;color:var(--muted);text-transform:uppercase;font-weight:700;margin-bottom:0.5rem">Individual Evaluations</h4>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem">
                ${packets.map(pkt => {
                  const voterName = pkt.evaluator || pkt.nickname || pkt.roomName || 'Voter';
                  const voteVal = pkt.votes?.[item.idea.id];
                  const scVal = pkt.scorecards?.[item.idea.id];
                  const evalVal = pkt.evaluations?.[item.idea.id];

                  const scDims = scVal ? Object.values(scVal).filter(v => Number.isFinite(v)) : [];
                  const scAvg = scDims.length ? (scDims.reduce((a, b) => a + b, 0) / scDims.length).toFixed(1) : null;

                  return `
                    <div style="background:var(--panel2);padding:0.75rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--line);font-size:0.82rem">
                      <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:0.35rem">
                        <span>👤 ${esc(voterName)}</span>
                        <span>
                          ${scAvg ? `<strong style="color:var(--accent)">${scAvg}/10</strong>` : ''}
                          ${voteVal ? `<span>${voteVal === 'interested' ? '👍' : voteVal === 'unsure' ? '🤔' : '👎'}</span>` : ''}
                        </span>
                      </div>

                      ${evalVal ? `
                        <div style="color:var(--text2);font-size:0.78rem;line-height:1.4">
                          ${evalVal.reasonToBuild ? `<div style="margin-bottom:0.2rem"><strong>Pro:</strong> ${esc(evalVal.reasonToBuild)}</div>` : ''}
                          ${evalVal.reasonNotToBuild ? `<div style="margin-bottom:0.2rem;color:var(--score-lo)"><strong>Con:</strong> ${esc(evalVal.reasonNotToBuild)}</div>` : ''}
                          ${evalVal.dealbreaker ? `<div style="color:var(--warn)"><strong>Blocker:</strong> ${esc(evalVal.dealbreaker)}</div>` : ''}
                        </div>
                      ` : '<div style="color:var(--muted);font-style:italic">No qualitative notes added.</div>'}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function bindEvents() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('packetFileInput');
    const btnBrowse = document.getElementById('btnBrowseFiles');
    const btnLoadDemo = document.getElementById('btnLoadDemoPackets') || document.getElementById('btnLoadDemoEmpty');
    const btnClear = document.getElementById('btnClearPackets');

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener('click', () => fileInput.click());
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', (e) => {
        if (e.target !== btnBrowse) fileInput.click();
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--line)';
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--line)';
        if (e.dataTransfer?.files) {
          handleFiles(e.dataTransfer.files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files) {
          handleFiles(e.target.files);
        }
      });
    }

    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', () => {
        loadDemoPackets();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        loadedPackets = [];
        render();
      });
    }
  }

  function handleFiles(files) {
    const fileList = Array.from(files);
    let loadedCount = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && typeof parsed === 'object') {
            loadedPackets.push(parsed);
          }
        } catch (err) {
          console.error('Failed to parse decision packet JSON:', err);
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          render();
        }
      };
      reader.readAsText(file);
    });
  }

  function loadDemoPackets() {
    loadedPackets = [
      {
        schemaVersion: '3.0.0',
        roomId: 'room-founder-shortlist',
        roomName: 'Founder Shortlist 2026',
        exportedAt: '2026-08-22T10:00:00Z',
        evaluator: 'Alex (Tech Lead)',
        shortlist: ['idea-061', 'idea-088', 'idea-273'],
        votes: { 'idea-061': 'interested', 'idea-088': 'interested', 'idea-273': 'pass' },
        scorecards: {
          'idea-061': { pain: 9.0, wtp: 8.5, distribution: 8.0, founderFit: 9.0, mvpSpeed: 8.0, capitalEfficiency: 8.5 },
          'idea-088': { pain: 7.5, wtp: 7.0, distribution: 6.5, founderFit: 7.0, mvpSpeed: 6.5, capitalEfficiency: 7.0 },
          'idea-273': { pain: 5.0, wtp: 4.5, distribution: 4.0, founderFit: 5.0, mvpSpeed: 6.0, capitalEfficiency: 5.0 }
        },
        evaluations: {
          'idea-061': {
            reasonToBuild: 'Urgent compliance mandate with clear enterprise buying budget.',
            reasonNotToBuild: 'Integration complexity across legacy systems.',
            dealbreaker: 'Audit logs must guarantee immutable tamper-resistance.',
            nextExperiment: 'Pitch 5 compliance managers with mock export schema.',
            confidence: 'HIGH'
          }
        }
      },
      {
        schemaVersion: '3.0.0',
        roomId: 'room-founder-shortlist',
        roomName: 'Founder Shortlist 2026',
        exportedAt: '2026-08-22T10:15:00Z',
        evaluator: 'Jordan (Commercial Lead)',
        shortlist: ['idea-061', 'idea-088', 'idea-273'],
        votes: { 'idea-061': 'interested', 'idea-088': 'unsure', 'idea-273': 'unsure' },
        scorecards: {
          'idea-061': { pain: 8.5, wtp: 9.0, distribution: 8.5, founderFit: 8.0, mvpSpeed: 7.5, capitalEfficiency: 8.0 },
          'idea-088': { pain: 6.5, wtp: 6.0, distribution: 5.5, founderFit: 6.0, mvpSpeed: 5.5, capitalEfficiency: 6.0 },
          'idea-273': { pain: 6.0, wtp: 5.0, distribution: 5.5, founderFit: 6.0, mvpSpeed: 7.0, capitalEfficiency: 6.0 }
        },
        evaluations: {
          'idea-061': {
            reasonToBuild: 'High customer willingness to pay and repeatable RFP sales cycles.',
            reasonNotToBuild: 'Need specialized security certifications.',
            dealbreaker: 'Lengthy procurement cycles over 6 months without interim paid pilots.',
            nextExperiment: 'Letter of intent with mid-sized B2B vendor.',
            confidence: 'HIGH'
          }
        }
      },
      {
        schemaVersion: '3.0.0',
        roomId: 'room-founder-shortlist',
        roomName: 'Founder Shortlist 2026',
        exportedAt: '2026-08-22T10:30:00Z',
        evaluator: 'Taylor (Product Lead)',
        shortlist: ['idea-061', 'idea-088', 'idea-273'],
        votes: { 'idea-061': 'interested', 'idea-088': 'pass', 'idea-273': 'interested' },
        scorecards: {
          'idea-061': { pain: 9.0, wtp: 8.0, distribution: 7.5, founderFit: 8.5, mvpSpeed: 8.0, capitalEfficiency: 8.5 },
          'idea-088': { pain: 6.0, wtp: 5.5, distribution: 5.0, founderFit: 5.5, mvpSpeed: 5.0, capitalEfficiency: 5.5 },
          'idea-273': { pain: 8.0, wtp: 7.5, distribution: 7.0, founderFit: 7.5, mvpSpeed: 8.5, capitalEfficiency: 7.5 }
        },
        evaluations: {
          'idea-061': {
            reasonToBuild: 'Extremely strong workflow automation wedge with high expansion potential.',
            reasonNotToBuild: 'Competitors might bundle basic compliance.',
            dealbreaker: 'Vendors insist on building in-house.',
            nextExperiment: 'Interactive prototype with 3 design partners.',
            confidence: 'HIGH'
          }
        }
      }
    ];

    render();
  }

  function esc(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)
    );
  }

  render();
}

window.initRoomCompare = initRoomCompare;
