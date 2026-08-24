/* Venture Atlas OS — Browser-Local Decision Workspace (v3.0.0) */
function initCollaborationRoom() {
  const container = document.getElementById('roomApp');
  if (!container) return;

  const base = window.VA?.base || '..';
  const ideasData = window.VA?.ideas || [];
  const ideasMap = new Map(ideasData.map(i => [i.id, i]));

  // Parse room parameter ?r=<roomId>
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('r') || urlParams.get('room');

  // Read local room session fallback
  let roomState = window.VentureAtlas?.readJsonStorage('va-room-session', null);

  const unavailableRoomId = roomId && (!roomState || roomState.id !== roomId) ? roomId : null;
  if (unavailableRoomId) roomState = null;

  // Active pairwise index
  let activePairIndex = 0;

  function saveState() {
    window.VentureAtlas?.writeJsonStorage('va-room-session', roomState);
    renderRoomUI();
  }

  const SCORE_DIMS = [
    { id: 'pain', label: 'Pain Severity', desc: 'Is this an urgent, burning hair problem for buyers?' },
    { id: 'wtp', label: 'Willingness to Pay', desc: 'Is there clear, established budget and purchasing power?' },
    { id: 'distribution', label: 'Distribution Feasibility', desc: 'Can you reach and acquire customers without massive paid CAC?' },
    { id: 'founderFit', label: 'Founder-Idea Fit', desc: 'Does your team possess domain advantage and sustained interest?' },
    { id: 'mvpSpeed', label: 'Speed to MVP', desc: 'Can a functional prototype be deployed within weeks?' },
    { id: 'capitalEfficiency', label: 'Capital Efficiency', desc: 'Can you reach cash-flow positivity with minimal upfront funding?' }
  ];

  function renderRoomUI() {
    if (!roomState || !roomState.id) {
      // Render Create Room Form
      container.innerHTML = `
        <div class="card" style="max-width:580px;margin:2rem auto;padding:2rem;background:var(--panel);border:1px solid var(--line)">
          <h1 style="font-size:clamp(1.5rem,4vw,2.1rem);margin-bottom:0.5rem">Create a Local Decision Workspace</h1>
          <p style="color:var(--text2);margin-bottom:1.5rem">Evaluate ideas on this device, then export a decision packet for asynchronous sharing. This workspace does not synchronize.</p>
          ${unavailableRoomId ? `<p role="note" style="color:var(--warn);background:var(--warn-bg);padding:0.75rem;border-radius:var(--radius-sm);margin-bottom:1rem">Workspace ${escHTML(unavailableRoomId)} is not stored in this browser. A URL cannot transfer local room state; ask for an exported decision packet instead.</p>` : ''}

          <form id="createRoomForm" style="display:flex;flex-direction:column;gap:1.1rem">
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Room Name</label>
              <input type="text" id="roomNameInput" placeholder="e.g. Founder Shortlist 2026" required style="width:100%;padding:0.65rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Your Nickname / Persona</label>
              <input type="text" id="roomNicknameInput" placeholder="e.g. Alex" required style="width:100%;padding:0.65rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Initial Voting Mode</label>
              <select id="roomVotingModeSelect" style="width:100%;padding:0.65rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
                <option value="reaction">👍 Quick Reaction (Interested / Unsure / Pass)</option>
                <option value="scorecard">📊 Structured Scorecard (1-10 multi-dimension)</option>
                <option value="pairwise">⚔️ Pairwise Comparison (Idea A vs Idea B)</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Results Visibility (Mitigate Groupthink)</label>
              <select id="roomVisibilitySelect" style="width:100%;padding:0.65rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
                <option value="after_vote" selected>Hidden until I vote (Recommended)</option>
                <option value="always">Always show my local results</option>
              </select>
            </div>
            <button type="submit" class="button primary" style="margin-top:0.5rem;padding:0.75rem">🚀 Create Local Workspace</button>
          </form>
        </div>
      `;

      document.getElementById('createRoomForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newId = 'room-' + Math.random().toString(36).substring(2, 10);
        // Do NOT default to hardcoded ideas; start empty if no user shortlist exists
        const storedShortlist = window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || [];

        roomState = {
          id: newId,
          name: document.getElementById('roomNameInput').value.trim() || 'Venture Room',
          nickname: document.getElementById('roomNicknameInput').value.trim() || 'Founder',
          votingMode: document.getElementById('roomVotingModeSelect').value || 'reaction',
          resultsVisibility: document.getElementById('roomVisibilitySelect').value || 'after_vote',
          members: [document.getElementById('roomNicknameInput').value.trim() || 'Founder'],
          shortlist: storedShortlist,
          votes: {},
          scorecards: {},
          pairwiseVotes: [],
          evaluations: {},
          comments: [
            { user: 'System', text: 'local workspace created. Export room votes and evaluation scores into a machine-readable JSON packet to share with friends.', time: 'Just now' }
          ]
        };

        const url = new URL(window.location);
        url.searchParams.set('r', newId);
        window.history.pushState({}, '', url);
        saveState();
      });
      return;
    }

    // Ensure state schema backwards compatibility
    if (!roomState.scorecards) roomState.scorecards = {};
    if (!roomState.pairwiseVotes) roomState.pairwiseVotes = [];
    if (!roomState.evaluations) roomState.evaluations = {};
    if (!roomState.votingMode) roomState.votingMode = 'reaction';

    // Render Active Room Dashboard
    const shortlistedIdeas = (roomState.shortlist || []).map(id => ideasMap.get(id)).filter(Boolean);

    container.innerHTML = `
      <!-- Room Header -->
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem 1.5rem;margin-bottom:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <div class="eyebrow" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
              <span>Browser Workspace</span> &nbsp;·&nbsp;
              <span class="sync-badge">Local-First</span> &nbsp;·&nbsp;
              <code>${escHTML(roomState.id)}</code>
            </div>
            <h1 style="font-size:clamp(1.4rem,3vw,1.8rem);margin:0.2rem 0">${escHTML(roomState.name)}</h1>
            <p style="font-size:0.88rem;color:var(--text2);margin:0">
              Evaluator: <strong>${escHTML(roomState.nickname)}</strong> · 
              Shortlist: <strong>${shortlistedIdeas.length} idea${shortlistedIdeas.length === 1 ? '' : 's'}</strong> ·
              Current Mode: <strong>${escHTML(roomState.votingMode.toUpperCase())}</strong>
            </p>
          </div>

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
            <!-- Mode Switcher -->
            <div class="segmented-control" style="display:inline-flex;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:2px">
              <button class="button ${roomState.votingMode === 'reaction' ? 'primary' : 'ghost'} sm btn-switch-mode" data-mode="reaction" style="font-size:0.75rem;padding:0.3rem 0.6rem">👍 Reaction</button>
              <button class="button ${roomState.votingMode === 'scorecard' ? 'primary' : 'ghost'} sm btn-switch-mode" data-mode="scorecard" style="font-size:0.75rem;padding:0.3rem 0.6rem">📊 Scorecard</button>
              <button class="button ${roomState.votingMode === 'pairwise' ? 'primary' : 'ghost'} sm btn-switch-mode" data-mode="pairwise" style="font-size:0.75rem;padding:0.3rem 0.6rem">⚔️ Pairwise</button>
            </div>
            <a href="${base}/docs/room-compare.html" class="button secondary sm">⚖️ Compare Packets</a>
            <button id="leaveRoomBtn" class="button ghost sm">Leave Room</button>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:minmax(0, 1.8fr) minmax(280px, 1fr);gap:1.5rem;align-items:start">
        <!-- Main Shortlist & Voting Area -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
            <h2 style="font-size:1.25rem;margin:0">
              ${roomState.votingMode === 'reaction' ? '👍 Quick Reaction Evaluation' :
                roomState.votingMode === 'scorecard' ? '📊 Multi-Criteria Scorecards (1–10)' :
                '⚔️ Head-to-Head Pairwise Comparison'}
            </h2>
            <a href="${base}/index.html" class="button secondary sm">+ Add Ideas from Catalog</a>
          </div>

          ${shortlistedIdeas.length === 0 ? `
            <div class="panel empty" style="padding:2.5rem 1.5rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
              <div style="font-size:2.5rem;margin-bottom:0.75rem">💡</div>
              <h3 style="font-size:1.2rem;margin-bottom:0.4rem">Your Shortlist is Empty</h3>
              <p style="color:var(--text2);max-width:480px;margin:0 auto 1.25rem">
                Explore ${ideasData.length} published business hypotheses or add a starter set to begin scoring.
              </p>
              <div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap">
                <button class="button primary sm" id="btnAddCuratedStarter">+ Add 3 Starter Ideas</button>
                <a href="${base}/index.html" class="button secondary sm">Browse Full Catalog →</a>
              </div>
            </div>
          ` : renderVotingArea(shortlistedIdeas, roomState)}
        </div>

        <!-- Room Sidebar: Per-Idea Notes, Chat & Export -->
        <div>
          <!-- Decision Packet Export -->
          <div class="card" style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.5rem">
            <h3 style="font-size:1.05rem;margin-bottom:0.4rem">📥 Export Decision Packet</h3>
            <p style="font-size:0.82rem;color:var(--text2);margin-bottom:1rem">
              Export room votes and evaluation scores into a machine-readable JSON packet to share with co-founders.
            </p>
            <button id="exportPacketBtn" class="button primary sm" style="width:100%;margin-bottom:0.5rem">Download Vote Packet (.json)</button>
            <a href="${base}/docs/room-compare.html" class="button secondary sm" style="width:100%;text-align:center;display:block">⚖️ Open Packet Comparison Tool →</a>
          </div>

          <!-- Room Notes Feed -->
          <div class="card" style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem">
            <h3 style="font-size:1.05rem;margin-bottom:0.75rem">💬 Local Room Notes</h3>
            <div id="commentList" style="display:flex;flex-direction:column;gap:0.5rem;max-height:260px;overflow-y:auto;margin-bottom:0.75rem;padding-right:0.3rem">
              ${(roomState.comments || []).map(c => `
                <div style="font-size:0.8rem;background:var(--panel2);padding:0.5rem 0.65rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
                  <div style="display:flex;justify-content:space-between;margin-bottom:0.15rem">
                    <strong>${escHTML(c.user)}</strong>
                    <span style="font-size:0.7rem;color:var(--muted)">${escHTML(c.time || '')}</span>
                  </div>
                  <div style="color:var(--text)">${escHTML(c.text)}</div>
                </div>
              `).join('')}
            </div>
            <form id="commentForm" style="display:flex;gap:0.4rem">
              <input type="text" id="commentInput" placeholder="Add room note or question..." required style="flex:1;padding:0.45rem 0.65rem;font-size:0.82rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg);color:var(--text)">
              <button type="submit" class="button secondary sm">Post</button>
            </form>
          </div>
        </div>
      </div>
    `;

    bindRoomEvents(shortlistedIdeas);
  }

  function renderVotingArea(ideas, state) {
    if (state.votingMode === 'pairwise') {
      return renderPairwiseMode(ideas, state);
    } else if (state.votingMode === 'scorecard') {
      return renderScorecardMode(ideas, state);
    } else {
      return renderReactionMode(ideas, state);
    }
  }

  /* ── 1. REACTION MODE ── */
  function renderReactionMode(ideas, state) {
    return `
      <div style="display:flex;flex-direction:column;gap:1.25rem">
        ${ideas.map(idea => {
          const userVote = state.votes[idea.id] || null;
          const evalObj = state.evaluations[idea.id] || {};
          const hasEval = evalObj.reasonToBuild || evalObj.reasonNotToBuild || evalObj.dealbreaker;

          return `
            <div class="card" style="padding:1.35rem;background:var(--panel);border:1px solid var(--line)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;margin-bottom:0.5rem">
                <div>
                  <span class="chip status sm">${escHTML(idea.category)}</span>
                  <h3 style="font-size:1.15rem;margin:0.3rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(idea.id)}">${escHTML(idea.name)}</a></h3>
                </div>
                <div style="display:flex;gap:0.4rem;align-items:center">
                  <span class="score-badge ${idea.atAGlance?.overallScore >= 85 ? 'high' : 'medium'}">${idea.atAGlance?.overallScore ?? '—'}</span>
                  <button class="button ghost sm btn-remove-idea" data-id="${escHTML(idea.id)}" title="Remove from room" style="color:var(--score-lo);padding:0.2rem 0.4rem">✕</button>
                </div>
              </div>

              <p style="font-size:0.88rem;color:var(--text2);margin-bottom:0.75rem;line-height:1.45">${escHTML(idea.oneSentenceConcept || '')}</p>

              <!-- Reaction Buttons -->
              <div style="background:var(--panel2);padding:0.75rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--line);margin-bottom:0.75rem">
                <div style="font-size:0.75rem;font-weight:700;margin-bottom:0.4rem;color:var(--muted);text-transform:uppercase">Your Reaction (${escHTML(state.nickname)})</div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
                  <button class="button ${userVote === 'interested' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="interested">👍 Interested</button>
                  <button class="button ${userVote === 'unsure' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="unsure">🤔 Unsure</button>
                  <button class="button ${userVote === 'pass' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="pass">👎 Pass</button>
                </div>
              </div>

              <!-- Expandable Structured Notes Panel -->
              ${renderIdeaEvaluationPanel(idea, evalObj, hasEval)}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ── 2. SCORECARD MODE (1-10 Multi-Dimension) ── */
  function renderScorecardMode(ideas, state) {
    return `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        ${ideas.map(idea => {
          const card = state.scorecards[idea.id] || {};
          const evalObj = state.evaluations[idea.id] || {};
          const hasEval = evalObj.reasonToBuild || evalObj.reasonNotToBuild || evalObj.dealbreaker;

          // Compute composite score for this user
          const scoredValues = SCORE_DIMS.map(d => card[d.id]).filter(v => Number.isFinite(v));
          const avgScore = scoredValues.length ? (scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length).toFixed(1) : null;

          return `
            <div class="card" style="padding:1.35rem;background:var(--panel);border:1px solid var(--line)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;margin-bottom:0.75rem;border-bottom:1px solid var(--line);padding-bottom:0.75rem">
                <div>
                  <span class="chip status sm">${escHTML(idea.category)}</span>
                  <h3 style="font-size:1.2rem;margin:0.25rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(idea.id)}">${escHTML(idea.name)}</a></h3>
                  <p style="font-size:0.85rem;color:var(--text2);margin:0">${escHTML(idea.oneSentenceConcept || '')}</p>
                </div>
                <div style="text-align:right;background:var(--panel2);padding:0.5rem 0.75rem;border-radius:var(--radius-sm);border:1px solid var(--line);min-width:100px">
                  <div style="font-size:0.7rem;color:var(--muted);font-weight:700">MY SCORE</div>
                  <div style="font-size:1.4rem;font-weight:800;color:var(--accent)">${avgScore ? avgScore + ' / 10' : '—'}</div>
                </div>
              </div>

              <!-- Score Sliders Grid -->
              <form class="scorecard-idea-form" data-id="${escHTML(idea.id)}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0.85rem;margin-bottom:1rem">
                ${SCORE_DIMS.map(dim => {
                  const val = card[dim.id] ?? 5;
                  return `
                    <div style="background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
                      <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem">
                        <label style="font-size:0.82rem;font-weight:700">${escHTML(dim.label)}</label>
                        <span class="score-val-label" id="val_${escHTML(idea.id)}_${dim.id}" style="font-weight:800;color:var(--accent);font-size:0.95rem">${val}/10</span>
                      </div>
                      <input type="range" class="score-slider" data-idea="${escHTML(idea.id)}" name="${escHTML(dim.id)}" min="1" max="10" step="0.5" value="${val}" style="width:100%">
                      <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:var(--muted)">
                        <span>1 (Weak)</span>
                        <span>5 (Neutral)</span>
                        <span>10 (Strong)</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </form>

              <!-- Expandable Structured Notes Panel -->
              ${renderIdeaEvaluationPanel(idea, evalObj, hasEval)}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ── 3. PAIRWISE MODE (Tournament A vs B) ── */
  function renderPairwiseMode(ideas, state) {
    if (ideas.length < 2) {
      return `
        <div class="panel empty" style="padding:2rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
          <p>Pairwise comparison requires at least 2 ideas in your shortlist.</p>
          <a href="${base}/index.html" class="button primary sm">+ Add More Ideas</a>
        </div>
      `;
    }

    // Generate all combinations
    const pairs = [];
    for (let i = 0; i < ideas.length; i++) {
      for (let j = i + 1; j < ideas.length; j++) {
        pairs.push({ a: ideas[i], b: ideas[j] });
      }
    }

    const currentPair = pairs[activePairIndex % pairs.length];
    const existingVote = (state.pairwiseVotes || []).find(
      p => ((p.ideaA === currentPair.a.id && p.ideaB === currentPair.b.id) ||
            (p.ideaA === currentPair.b.id && p.ideaB === currentPair.a.id))
    );

    // Compute pairwise leaderboard
    const winsMap = {};
    const matchesMap = {};
    ideas.forEach(i => { winsMap[i.id] = 0; matchesMap[i.id] = 0; });
    (state.pairwiseVotes || []).forEach(v => {
      if (v.winnerId && v.winnerId !== 'tie' && v.winnerId !== 'pass') {
        winsMap[v.winnerId] = (winsMap[v.winnerId] || 0) + 1;
      }
      if (v.ideaA && v.winnerId !== 'pass') matchesMap[v.ideaA] = (matchesMap[v.ideaA] || 0) + 1;
      if (v.ideaB && v.winnerId !== 'pass') matchesMap[v.ideaB] = (matchesMap[v.ideaB] || 0) + 1;
    });

    const leaderboard = ideas.map(idea => {
      const wins = winsMap[idea.id] || 0;
      const total = matchesMap[idea.id] || 0;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { idea, wins, total, winRate };
    }).sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

    return `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <!-- Matchup Arena Card -->
        <div class="card" style="padding:1.5rem;background:var(--panel);border:1px solid var(--line)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <span class="eyebrow">Matchup ${activePairIndex + 1} of ${pairs.length}</span>
            <div style="display:flex;gap:0.4rem">
              <button class="button secondary sm btn-prev-pair" ${activePairIndex === 0 ? 'disabled' : ''}>← Prev</button>
              <button class="button secondary sm btn-next-pair" ${activePairIndex >= pairs.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
          </div>

          <h3 style="font-size:1.15rem;margin:0 0 1rem;text-align:center">If you could only build ONE of these two ventures, which do you choose?</h3>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem">
            <!-- Candidate A -->
            <div class="contender-box ${existingVote?.winnerId === currentPair.a.id ? 'chosen' : ''}" style="background:var(--panel2);padding:1.25rem;border-radius:var(--radius);border:2px solid ${existingVote?.winnerId === currentPair.a.id ? 'var(--accent)' : 'var(--line)'};display:flex;flex-direction:column">
              <span class="chip status sm">${escHTML(currentPair.a.category)}</span>
              <h4 style="font-size:1.1rem;margin:0.4rem 0 0.5rem"><a href="${base}/docs/idea.html?id=${encodeURIComponent(currentPair.a.id)}">${escHTML(currentPair.a.name)}</a></h4>
              <p style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem;flex:1">${escHTML(currentPair.a.oneSentenceConcept || '')}</p>
              
              <div style="font-size:0.78rem;color:var(--muted);margin-bottom:1rem">
                <div><strong>Buyer:</strong> ${escHTML(currentPair.a.atAGlance?.targetCustomer || '—')}</div>
                <div><strong>Atlas Score:</strong> ${currentPair.a.atAGlance?.overallScore ?? '—'}/100</div>
              </div>

              <button class="button ${existingVote?.winnerId === currentPair.a.id ? 'primary' : 'secondary'} btn-vote-pair" data-winner="${escHTML(currentPair.a.id)}" data-a="${escHTML(currentPair.a.id)}" data-b="${escHTML(currentPair.b.id)}">
                👉 Select ${escHTML(currentPair.a.name)}
              </button>
            </div>

            <!-- Candidate B -->
            <div class="contender-box ${existingVote?.winnerId === currentPair.b.id ? 'chosen' : ''}" style="background:var(--panel2);padding:1.25rem;border-radius:var(--radius);border:2px solid ${existingVote?.winnerId === currentPair.b.id ? 'var(--accent)' : 'var(--line)'};display:flex;flex-direction:column">
              <span class="chip status sm">${escHTML(currentPair.b.category)}</span>
              <h4 style="font-size:1.1rem;margin:0.4rem 0 0.5rem"><a href="${base}/docs/idea.html?id=${encodeURIComponent(currentPair.b.id)}">${escHTML(currentPair.b.name)}</a></h4>
              <p style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem;flex:1">${escHTML(currentPair.b.oneSentenceConcept || '')}</p>
              
              <div style="font-size:0.78rem;color:var(--muted);margin-bottom:1rem">
                <div><strong>Buyer:</strong> ${escHTML(currentPair.b.atAGlance?.targetCustomer || '—')}</div>
                <div><strong>Atlas Score:</strong> ${currentPair.b.atAGlance?.overallScore ?? '—'}/100</div>
              </div>

              <button class="button ${existingVote?.winnerId === currentPair.b.id ? 'primary' : 'secondary'} btn-vote-pair" data-winner="${escHTML(currentPair.b.id)}" data-a="${escHTML(currentPair.a.id)}" data-b="${escHTML(currentPair.b.id)}">
                👉 Select ${escHTML(currentPair.b.name)}
              </button>
            </div>
          </div>

          <div style="display:flex;justify-content:center;gap:0.75rem">
            <button class="button ghost sm btn-vote-pair" data-winner="tie" data-a="${escHTML(currentPair.a.id)}" data-b="${escHTML(currentPair.b.id)}">⚖️ Tie</button>
            <button class="button ghost sm btn-vote-pair" data-winner="pass" data-a="${escHTML(currentPair.a.id)}" data-b="${escHTML(currentPair.b.id)}">⏭️ Skip</button>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
          <h3 style="font-size:1.05rem;margin-bottom:0.75rem">🏆 Pairwise Tournament Standings</h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${leaderboard.map((item, idx) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0.8rem;background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius-sm);font-size:0.85rem">
                <div>
                  <strong style="margin-right:0.4rem;color:var(--muted)">#${idx + 1}</strong>
                  <a href="${base}/docs/idea.html?id=${encodeURIComponent(item.idea.id)}">${escHTML(item.idea.name)}</a>
                </div>
                <div style="display:flex;gap:1rem;align-items:center">
                  <span style="font-weight:700;color:var(--accent)">${item.winRate}% win rate</span>
                  <span style="font-size:0.75rem;color:var(--muted)">(${item.wins}W / ${item.total} matches)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ── 4. STRUCTURED PER-IDEA EVALUATION & NOTES PANEL ── */
  function renderIdeaEvaluationPanel(idea, evalObj, hasEval) {
    return `
      <details class="idea-eval-details" style="background:var(--bg);border:1px solid var(--line);border-radius:var(--radius-sm);margin-top:0.75rem">
        <summary style="padding:0.6rem 0.85rem;font-size:0.82rem;font-weight:700;cursor:pointer;color:var(--accent);display:flex;justify-content:space-between;align-items:center">
          <span>📝 Structured Notes &amp; Evaluations ${hasEval ? '✓ (Recorded)' : ''}</span>
          <span style="font-size:0.75rem;color:var(--muted)">Click to expand</span>
        </summary>

        <form class="eval-form" data-id="${escHTML(idea.id)}" style="padding:1rem;display:flex;flex-direction:column;gap:0.75rem;border-top:1px solid var(--line)">
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text);margin-bottom:0.25rem">💡 Strongest Reasons to Build (Why this venture?)</label>
            <textarea name="reasonToBuild" rows="2" placeholder="e.g. Unmet regulatory mandate, high WTP, zero direct competition..." style="width:100%;padding:0.45rem;font-size:0.8rem;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text)">${escHTML(evalObj.reasonToBuild || '')}</textarea>
          </div>

          <div>
            <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--score-lo);margin-bottom:0.25rem">⚠️ Reasons NOT to Build (Biggest risks / headwinds)</label>
            <textarea name="reasonNotToBuild" rows="2" placeholder="e.g. Lengthy enterprise sales cycles, platform dependency..." style="width:100%;padding:0.45rem;font-size:0.8rem;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text)">${escHTML(evalObj.reasonNotToBuild || '')}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <div>
              <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text);margin-bottom:0.25rem">🛑 Potential Dealbreaker</label>
              <input type="text" name="dealbreaker" value="${escHTML(evalObj.dealbreaker || '')}" placeholder="Fatal assumption if false..." style="width:100%;padding:0.45rem;font-size:0.8rem;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text)">
            </div>
            <div>
              <label style="display:block;font-size:0.78rem;font-weight:700;color:var(--text);margin-bottom:0.25rem">🧪 Next Falsification Test</label>
              <input type="text" name="nextExperiment" value="${escHTML(evalObj.nextExperiment || '')}" placeholder="5 cold calls, mock landing page..." style="width:100%;padding:0.45rem;font-size:0.8rem;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text)">
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.4rem">
            <label style="font-size:0.78rem;color:var(--muted)">
              Confidence: 
              <select name="confidence" style="padding:0.2rem 0.4rem;font-size:0.78rem;border-radius:4px;border:1px solid var(--line);background:var(--panel)">
                <option value="HIGH" ${evalObj.confidence === 'HIGH' ? 'selected' : ''}>High</option>
                <option value="MEDIUM" ${evalObj.confidence === 'MEDIUM' || !evalObj.confidence ? 'selected' : ''}>Medium</option>
                <option value="LOW" ${evalObj.confidence === 'LOW' ? 'selected' : ''}>Low</option>
              </select>
            </label>
            <button type="submit" class="button secondary sm">Save Evaluation</button>
          </div>
        </form>
      </details>
    `;
  }

  function bindRoomEvents(ideas) {
    // Mode Switcher buttons
    container.querySelectorAll('.btn-switch-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        roomState.votingMode = btn.dataset.mode;
        saveState();
      });
    });

    // Leave Room
    const leaveBtn = document.getElementById('leaveRoomBtn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        if (confirm('Leave this decision room session?')) {
          roomState = null;
          window.VentureAtlas?.writeJsonStorage('va-room-session', null);
          const url = new URL(window.location);
          url.searchParams.delete('r');
          window.history.pushState({}, '', url);
          renderRoomUI();
        }
      });
    }

    // Curated starter button for empty state
    const btnStarter = document.getElementById('btnAddCuratedStarter');
    if (btnStarter) {
      btnStarter.addEventListener('click', () => {
        roomState.shortlist = ['idea-061', 'idea-088', 'idea-273'];
        window.VentureAtlas?.writeJsonStorage('va-room-shortlist', roomState.shortlist);
        saveState();
      });
    }

    // Remove idea from shortlist
    container.querySelectorAll('.btn-remove-idea').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        roomState.shortlist = (roomState.shortlist || []).filter(item => item !== id);
        delete roomState.votes[id];
        delete roomState.scorecards[id];
        delete roomState.evaluations[id];
        window.VentureAtlas?.writeJsonStorage('va-room-shortlist', roomState.shortlist);
        saveState();
      });
    });

    // Reaction Vote buttons
    container.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ideaId = btn.dataset.id;
        const val = btn.dataset.val;
        roomState.votes[ideaId] = val;
        saveState();
      });
    });

    // Scorecard range slider inputs
    container.querySelectorAll('.score-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const ideaId = slider.dataset.idea;
        const dim = slider.name;
        const valLabel = document.getElementById(`val_${ideaId}_${dim}`);
        if (valLabel) valLabel.textContent = `${slider.value}/10`;

        if (!roomState.scorecards[ideaId]) roomState.scorecards[ideaId] = {};
        roomState.scorecards[ideaId][dim] = Number(slider.value);
        window.VentureAtlas?.writeJsonStorage('va-room-session', roomState);
      });
    });

    // Pairwise Vote buttons
    container.querySelectorAll('.btn-vote-pair').forEach(btn => {
      btn.addEventListener('click', () => {
        const ideaA = btn.dataset.a;
        const ideaB = btn.dataset.b;
        const winnerId = btn.dataset.winner;

        // Remove existing vote for this pair if any
        roomState.pairwiseVotes = (roomState.pairwiseVotes || []).filter(
          p => !((p.ideaA === ideaA && p.ideaB === ideaB) || (p.ideaA === ideaB && p.ideaB === ideaA))
        );

        roomState.pairwiseVotes.push({
          ideaA,
          ideaB,
          winnerId,
          voter: roomState.nickname,
          timestamp: new Date().toISOString()
        });

        activePairIndex++;
        saveState();
      });
    });

    const btnPrevPair = container.querySelector('.btn-prev-pair');
    const btnNextPair = container.querySelector('.btn-next-pair');
    if (btnPrevPair) btnPrevPair.addEventListener('click', () => { activePairIndex = Math.max(0, activePairIndex - 1); renderRoomUI(); });
    if (btnNextPair) btnNextPair.addEventListener('click', () => { activePairIndex++; renderRoomUI(); });

    // Evaluation form submissions
    container.querySelectorAll('.eval-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ideaId = form.dataset.id;
        const formData = new FormData(form);

        if (!roomState.evaluations) roomState.evaluations = {};
        roomState.evaluations[ideaId] = {
          ideaId,
          evaluator: roomState.nickname,
          reasonToBuild: formData.get('reasonToBuild') || '',
          reasonNotToBuild: formData.get('reasonNotToBuild') || '',
          dealbreaker: formData.get('dealbreaker') || '',
          nextExperiment: formData.get('nextExperiment') || '',
          confidence: formData.get('confidence') || 'MEDIUM',
          updatedAt: new Date().toISOString()
        };

        saveState();
        alert('Evaluation saved for this idea!');
      });
    });

    // Room notes / chat form
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('commentInput');
        if (input && input.value.trim()) {
          roomState.comments.push({
            user: roomState.nickname,
            text: input.value.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          input.value = '';
          saveState();
        }
      });
    }

    // Export Decision / Vote Packet
    const exportBtn = document.getElementById('exportPacketBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const packet = {
          schemaVersion: '3.0.0',
          roomId: roomState.id,
          roomName: roomState.name,
          exportedAt: new Date().toISOString(),
          evaluator: roomState.nickname,
          votingMode: roomState.votingMode,
          members: roomState.members,
          shortlist: roomState.shortlist,
          votes: roomState.votes,
          scorecards: roomState.scorecards,
          pairwiseVotes: roomState.pairwiseVotes,
          evaluations: roomState.evaluations,
          comments: roomState.comments
        };

        const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vote-packet-${roomState.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  function escHTML(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)
    );
  }

  renderRoomUI();
}

window.initCollaborationRoom = initCollaborationRoom;
