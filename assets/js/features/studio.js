/**
 * Venture Atlas OS — Decision Studio Feature UI (v3.0.0)
 * Coordinates Kanban Shortlist, 10-Dimension Scorecards, Pairwise Tournament,
 * Variants Lab, Finalist & Provisional Winner Board, Validation Tracker, and Export/Import.
 */

function initDecisionStudio() {
  const rootEl = document.getElementById('roomApp');
  if (!rootEl) return;

  const store = window.VAStudio ? window.VAStudio.store : null;
  const firebaseAdapter = window.VAFirebase ? window.VAFirebase.adapter : null;
  if (!store) {
    console.error('[DecisionStudio] VAStudio store not found.');
    return;
  }

  const base = window.VA?.base || '..';
  const ideas = window.VA?.ideas || [];
  const ideasMap = new Map(ideas.map(i => [i.id, i]));
  const taxonomyMap = window.VA?.taxonomyByIdea || new Map();

  // URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const requestedRoomId = urlParams.get('r') || urlParams.get('room');
  let activeTab = urlParams.get('tab') || 'kanban';
  let requestedLocalRoomUnavailable = false;

  // Check if room ID is provided in URL
  if (requestedRoomId && store.getWorkspace()?.id !== requestedRoomId) {
    const existingIndex = store.listWorkspaces().find(w => w.id === requestedRoomId);
    if (existingIndex) {
      // Load workspace from local index
      // (already handled if loaded)
    } else if (firebaseAdapter && firebaseAdapter.isConfigured()) {
      // Connect to remote room
      firebaseAdapter.connectRoom(requestedRoomId, store);
    } else {
      requestedLocalRoomUnavailable = true;
    }
  } else if (requestedRoomId && firebaseAdapter && firebaseAdapter.isConfigured()) {
    firebaseAdapter.connectRoom(requestedRoomId, store);
  }

  // Active scorecard & pairwise selection state
  let selectedScorecardIdeaId = null;
  let activePairIndex = 0;

  function render() {
    const ws = store.getWorkspace();
    const user = store.getUser();
    const syncInfo = firebaseAdapter ? firebaseAdapter.getStatus() : { message: 'Local-First Studio', status: 'LOCAL_ONLY' };
    const hasSharedBackend = Boolean(syncInfo.isConfigured && firebaseAdapter?.activeRoomId);
    const isLiveRoom = syncInfo.status === 'SYNCED' && syncInfo.isLiveRoom;
    const shortlist = store.getShortlist();
    const variants = store.getVariants();
    const decision = store.getDecision();

    // Map all shortlist IDs to idea or variant objects
    const shortlistItems = shortlist.map(item => {
      const isVariant = item.ideaId.startsWith('var_');
      let details = null;
      if (isVariant) {
        const v = store.getVariant(item.ideaId);
        const parentIdea = v ? ideasMap.get(v.parentIdeaId) : null;
        details = {
          id: item.ideaId,
          name: v ? `[Variant] ${v.title}` : item.ideaId,
          category: parentIdea ? parentIdea.category : 'Variant',
          oneSentenceConcept: v?.changes?.summary || v?.changes?.wedge || 'Customized Idea Variant',
          targetCustomer: v?.changes?.targetCustomer || parentIdea?.atAGlance?.targetCustomer || '—',
          overallScore: parentIdea?.atAGlance?.overallScore ?? null,
          isVariant: true,
          parentIdea: parentIdea
        };
      } else {
        const raw = ideasMap.get(item.ideaId);
        details = {
          id: item.ideaId,
          name: raw ? raw.name : item.ideaId,
          category: raw ? raw.category : 'General',
          oneSentenceConcept: raw ? raw.oneSentenceConcept : '',
          targetCustomer: raw?.atAGlance?.targetCustomer || '—',
          overallScore: raw?.atAGlance?.overallScore ?? null,
          isVariant: false,
          parentIdea: null
        };
      }
      return { ...item, details };
    });

    // Default selected idea for scorecards
    if (!selectedScorecardIdeaId && shortlistItems.length > 0) {
      selectedScorecardIdeaId = shortlistItems[0].ideaId;
    }

    rootEl.innerHTML = `
      <!-- Studio Header -->
      <div class="studio-header card" style="margin-bottom:1.5rem;padding:1.5rem;background:var(--panel);border:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <div class="eyebrow" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
              <span>Decision Studio v3.0</span>
              <span>·</span>
              <span class="sync-badge ${isLiveRoom ? 'live' : 'local'}">
                ${isLiveRoom ? '🟢 Live Cloud Room' : hasSharedBackend ? `🟠 Cloud Room · ${esc(syncInfo.status)}` : '🔒 Private Browser Store'}
              </span>
              <span>·</span>
              <code>${esc(ws.id)}</code>
            </div>
            <h1 style="font-size:clamp(1.4rem,3.5vw,2rem);margin:0.2rem 0" id="wsTitle">${esc(ws.name)}</h1>
            <p style="color:var(--text2);font-size:0.88rem;margin:0">
              Active User: <strong><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${esc(user.color)};margin-right:4px"></span>${esc(user.displayName)}</strong> · 
              ${hasSharedBackend ? 'Members' : 'Local profiles'}: <strong>${ws.members.length}</strong> · 
              Shortlist: <strong>${shortlist.length} ideas</strong>
              ${decision ? ` · <span class="chip success sm">Winner Declared: ${esc(decision.selectedTitle)}</span>` : ''}
            </p>
          </div>

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            ${hasSharedBackend ? '<button class="button secondary sm" id="btnShareInvite">🔗 Copy Cloud Room Link</button>' : ''}
            <button class="button secondary sm" id="btnExportPacket">📥 ${hasSharedBackend ? 'Export Backup' : 'Share by Exporting Packet'} (.json)</button>
            <button class="button secondary sm" id="btnImportPacket">📤 Import Packet</button>
            <button class="button ghost sm" id="btnEditUser">👤 Profile</button>
            <button class="button primary sm" id="btnNewWorkspace">+ New Room</button>
          </div>
        </div>

        ${!hasSharedBackend ? `
          <div class="notice" role="note" style="margin-top:1rem">
            <strong>Private to this browser:</strong> a room URL cannot transfer this workspace to a friend. Export a packet and send the file; friends can import it here or combine packets in <a href="${base}/docs/room-compare.html">Compare Packets</a>.
            ${ws.mercury ? '<br><strong>Mercury data included:</strong> this unencrypted packet also contains the local Customer Reality Lab workspace. Review it for private business context before sharing.' : ''}
          </div>
        ` : ''}

        ${requestedLocalRoomUnavailable ? `
          <div class="notice" role="alert" style="margin-top:1rem;border-color:var(--warn)">
            <strong>This shared-room link is not available in this browser.</strong> Cloud sync is not configured and room <code>${esc(requestedRoomId)}</code> is not stored locally. Ask the sender for an exported decision packet, then use <strong>Import Packet</strong>.
          </div>
        ` : ''}

        ${decision ? `
          <div class="winner-banner" style="margin-top:1.25rem;padding:1rem 1.25rem;background:hsl(145, 80%, 96%);border:1px solid hsl(145, 60%, 75%);border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
            <div>
              <div style="font-size:0.75rem;font-weight:700;color:hsl(145, 80%, 25%);text-transform:uppercase">🏆 Provisional Winner Selected</div>
              <div style="font-size:1.15rem;font-weight:700;color:hsl(145, 90%, 20%);margin:0.2rem 0">${esc(decision.selectedTitle)}</div>
              <div style="font-size:0.85rem;color:hsl(145, 70%, 25%)">${esc(decision.rationale)}</div>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button class="button ghost sm" style="color:hsl(145, 90%, 20%);border-color:hsl(145, 60%, 75%)" id="btnViewDecision">View Decision Details</button>
              <button class="button secondary sm" id="btnReopenDecision">Reopen Decision</button>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Studio Navigation Tabs -->
      <div class="studio-tabs" role="tablist" style="display:flex;gap:0.4rem;border-bottom:1px solid var(--line);margin-bottom:1.5rem;overflow-x:auto;padding-bottom:0.2rem">
        <button class="studio-tab-btn ${activeTab === 'kanban' ? 'active' : ''}" data-tab="kanban" role="tab" aria-selected="${activeTab === 'kanban'}">
          📋 Shortlist Kanban (${shortlist.length})
        </button>
        <button class="studio-tab-btn ${activeTab === 'scorecard' ? 'active' : ''}" data-tab="scorecard" role="tab" aria-selected="${activeTab === 'scorecard'}">
          📊 10-D Scorecards (${ws.scorecards.length})
        </button>
        <button class="studio-tab-btn ${activeTab === 'pairwise' ? 'active' : ''}" data-tab="pairwise" role="tab" aria-selected="${activeTab === 'pairwise'}">
          ⚔️ Pairwise Tournament (${ws.pairwise.length})
        </button>
        <button class="studio-tab-btn ${activeTab === 'variants' ? 'active' : ''}" data-tab="variants" role="tab" aria-selected="${activeTab === 'variants'}">
          💡 Variants Lab (${variants.length})
        </button>
        <button class="studio-tab-btn ${activeTab === 'decision' ? 'active' : ''}" data-tab="decision" role="tab" aria-selected="${activeTab === 'decision'}">
          🏆 Finalists &amp; Winner
        </button>
        <button class="studio-tab-btn ${activeTab === 'experiments' ? 'active' : ''}" data-tab="experiments" role="tab" aria-selected="${activeTab === 'experiments'}">
          🧪 Validation Tracker (${ws.experiments.length})
        </button>
        <button class="studio-tab-btn ${activeTab === 'notes' ? 'active' : ''}" data-tab="notes" role="tab" aria-selected="${activeTab === 'notes'}">
          💬 Structured Notes (${ws.notes.length})
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="studioTabContent">
        ${renderTabContent(activeTab, shortlistItems, ws, user)}
      </div>

      <!-- Hidden Import File Input -->
      <input type="file" id="importFileInput" accept=".json,application/json" style="display:none">
    `;

    bindEvents(ws, user, shortlistItems);
  }

  function renderTabContent(tab, shortlistItems, ws, user) {
    switch (tab) {
      case 'kanban':
        return renderKanbanTab(shortlistItems, ws);
      case 'scorecard':
        return renderScorecardTab(shortlistItems, ws, user);
      case 'pairwise':
        return renderPairwiseTab(shortlistItems, ws, user);
      case 'variants':
        return renderVariantsTab(shortlistItems, ws, user);
      case 'decision':
        return renderDecisionTab(shortlistItems, ws, user);
      case 'experiments':
        return renderExperimentsTab(shortlistItems, ws, user);
      case 'notes':
        return renderNotesTab(shortlistItems, ws, user);
      default:
        return renderKanbanTab(shortlistItems, ws);
    }
  }

  /* ================================================================
     TAB 1: KANBAN SHORTLIST
     ================================================================ */
  function renderKanbanTab(items, ws) {
    const stages = window.VAStudio.STAGES;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem">
        <div>
          <h2 style="font-size:1.25rem;margin:0">Pipeline Stages</h2>
          <p style="font-size:0.85rem;color:var(--text2);margin:0">Advance ideas as you investigate, score, and test them with your team.</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <a href="${base}/index.html" class="button secondary sm">+ Browse &amp; Add More Ideas</a>
          <a href="${base}/docs/compare.html?ids=${encodeURIComponent(items.map(i => i.ideaId).slice(0, 4).join(','))}" class="button secondary sm">⚖️ Compare Candidates</a>
        </div>
      </div>

      ${items.length === 0 ? `
        <div class="panel empty" style="text-align:center;padding:3rem 1.5rem">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">💡</div>
          <h3 style="font-size:1.2rem;margin-bottom:0.4rem">Your Shortlist is Empty</h3>
          <p style="color:var(--text2);max-width:480px;margin:0 auto 1.25rem">Explore the published business hypotheses or create custom variants to evaluate.</p>
          <a href="${base}/index.html" class="button primary">Browse Ideas Catalog</a>
        </div>
      ` : `
        <div class="kanban-board" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;align-items:start">
          ${stages.map(stage => {
            const stageItems = items.filter(i => i.stage === stage.id);
            return `
              <div class="kanban-column" style="background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);padding:1rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid ${stage.color}">
                  <span style="font-weight:700;font-size:0.88rem;color:var(--text)">${esc(stage.label)}</span>
                  <span class="badge sm">${stageItems.length}</span>
                </div>

                <div class="kanban-cards" style="display:flex;flex-direction:column;gap:0.75rem">
                  ${stageItems.length === 0 ? `
                    <div style="font-size:0.78rem;color:var(--muted);text-align:center;padding:1.5rem 0.5rem;border:1px dashed var(--line);border-radius:var(--radius-sm)">
                      No ideas in ${esc(stage.label)}
                    </div>
                  ` : stageItems.map(item => `
                    <div class="card kanban-card" style="padding:1rem;background:var(--panel);border:1px solid var(--line);position:relative">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.35rem">
                        <span class="chip status sm">${esc(item.details.category)}</span>
                        ${item.details.overallScore != null ? `<span class="score-badge sm">${item.details.overallScore}</span>` : ''}
                      </div>

                      <h3 style="font-size:0.98rem;margin:0.25rem 0 0.4rem;line-height:1.3">
                        <a href="${base}/docs/idea.html?id=${encodeURIComponent(item.details.parentIdea ? item.details.parentIdea.id : item.ideaId)}">
                          ${esc(item.details.name)}
                        </a>
                      </h3>

                      <p style="font-size:0.8rem;color:var(--text2);margin-bottom:0.6rem;line-height:1.4">
                        ${esc(item.details.oneSentenceConcept || '')}
                      </p>

                      <div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.6rem">
                        <strong>Buyer:</strong> ${esc(item.details.targetCustomer)}
                      </div>

                      <!-- Stage selector & actions -->
                      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.5rem;border-top:1px solid var(--line);gap:0.3rem">
                        <select class="stage-select" data-id="${esc(item.ideaId)}" style="font-size:0.75rem;padding:0.2rem 0.4rem;border-radius:var(--radius-sm);border:1px solid var(--line);background:var(--bg)">
                          ${stages.map(s => `
                            <option value="${esc(s.id)}" ${s.id === item.stage ? 'selected' : ''}>Move to: ${esc(s.label)}</option>
                          `).join('')}
                        </select>
                        <div style="display:flex;gap:0.2rem">
                          <button class="button ghost sm btn-quick-note" data-id="${esc(item.ideaId)}" title="Add note" style="padding:0.2rem 0.4rem;font-size:0.75rem">📝</button>
                          <button class="button ghost sm btn-remove-shortlist" data-id="${esc(item.ideaId)}" title="Remove from shortlist" style="padding:0.2rem 0.4rem;font-size:0.75rem;color:var(--score-lo)">✕</button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  /* ================================================================
     TAB 2: 10-DIMENSION SCORECARDS
     ================================================================ */
  function renderScorecardTab(items, ws, user) {
    if (items.length === 0) {
      return `<div class="panel empty"><p>Add ideas to your shortlist to score them.</p></div>`;
    }

    const currentIdeaId = selectedScorecardIdeaId || items[0].ideaId;
    const currentItem = items.find(i => i.ideaId === currentIdeaId) || items[0];
    const userCard = store.getScorecard(currentIdeaId, user.uid);
    const agg = store.getScorecardAggregation(currentIdeaId);
    const dims = window.VAStudio.SCORE_DIMENSIONS;

    const userScores = userCard?.scores || {};
    const userNotes = userCard?.dimensionNotes || {};

    return `
      <div style="display:grid;grid-template-columns:280px 1fr;gap:1.5rem;align-items:start">
        <!-- Sidebar idea selector -->
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);padding:1rem">
          <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.75rem;text-transform:uppercase;color:var(--muted)">Shortlist Candidates</div>
          <div style="display:flex;flex-direction:column;gap:0.4rem">
            ${items.map(item => {
              const card = store.getScorecard(item.ideaId, user.uid);
              const isSelected = item.ideaId === currentIdeaId;
              return `
                <button class="button ${isSelected ? 'primary' : 'ghost'} sm scorecard-select-btn" data-id="${esc(item.ideaId)}" style="text-align:left;justify-content:space-between;width:100%;padding:0.5rem 0.75rem">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.details.name)}</span>
                  <span>${card ? '✓' : '—'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Main Scorecard Form -->
        <div class="card" style="padding:1.5rem;background:var(--panel);border:1px solid var(--line)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid var(--line)">
            <div>
              <span class="chip status sm">${esc(currentItem.details.category)}</span>
              <h2 style="font-size:1.35rem;margin:0.25rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(currentItem.ideaId)}">${esc(currentItem.details.name)}</a></h2>
              <p style="font-size:0.85rem;color:var(--text2);margin:0">${esc(currentItem.details.oneSentenceConcept)}</p>
            </div>
            
            <div style="display:flex;gap:1rem;align-items:center;background:var(--panel2);padding:0.75rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
              <div>
                <div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;font-weight:700">Team Score</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--accent)">${agg ? agg.compositeScore + ' / 10' : 'Not scored'}</div>
                <div style="font-size:0.75rem;color:var(--text2)">${agg ? agg.scorecardCount + ' voter(s)' : 'No votes yet'}</div>
              </div>
              ${agg?.hasDisagreement ? `
                <div style="border-left:1px solid var(--line);padding-left:0.75rem">
                  <span class="chip warn sm">⚠ Disagreement</span>
                  <div style="font-size:0.72rem;color:var(--warn);margin-top:0.2rem">High variance among team</div>
                </div>
              ` : ''}
            </div>
          </div>

          <form id="scorecardForm" data-id="${esc(currentIdeaId)}">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.25rem;margin-bottom:1.5rem">
              ${dims.map(dim => {
                const currentVal = userScores[dim.id] ?? 5;
                const teamAvg = agg?.dimAverages?.[dim.id];
                const teamDisag = agg?.dimDisagreements?.[dim.id];
                const noteVal = userNotes[dim.id] || '';

                return `
                  <div class="score-dimension-card" style="background:var(--panel2);padding:1rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem">
                      <label style="font-weight:700;font-size:0.88rem">${esc(dim.label)}</label>
                      <span class="dim-val-badge" id="val_${dim.id}" style="font-weight:800;font-size:1.1rem;color:var(--accent)">${currentVal}/10</span>
                    </div>

                    <p style="font-size:0.78rem;color:var(--text2);margin-bottom:0.75rem">${esc(dim.desc)}</p>

                    <input type="range" class="dim-slider" name="${esc(dim.id)}" min="1" max="10" step="0.5" value="${currentVal}" style="width:100%;margin-bottom:0.5rem">

                    <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--muted);margin-bottom:0.5rem">
                      <span>1 (Weak / High Risk)</span>
                      <span>5 (Neutral)</span>
                      <span>10 (Outstanding)</span>
                    </div>

                    ${teamAvg != null ? `
                      <div style="font-size:0.75rem;color:var(--text2);background:var(--bg);padding:0.3rem 0.5rem;border-radius:4px;display:flex;justify-content:space-between;margin-bottom:0.5rem">
                        <span>Team Avg: <strong>${teamAvg}/10</strong></span>
                        ${teamDisag >= 1.5 ? `<span style="color:var(--warn)">⚠ Disagreement (±${teamDisag})</span>` : `<span>Consensus (±${teamDisag || 0})</span>`}
                      </div>
                    ` : ''}

                    <input type="text" name="note_${esc(dim.id)}" value="${esc(noteVal)}" placeholder="Add rationale or objection..." style="width:100%;font-size:0.78rem;padding:0.35rem 0.5rem;border:1px solid var(--line);border-radius:4px;background:var(--bg)">
                  </div>
                `;
              }).join('')}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-top:1rem;border-top:1px solid var(--line)">
              <div style="font-size:0.85rem;color:var(--muted)">Scores are saved locally and synced to room members.</div>
              <button type="submit" class="button primary">💾 Save My Scorecard</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /* ================================================================
     TAB 3: PAIRWISE TOURNAMENT
     ================================================================ */
  function renderPairwiseTab(items, ws, user) {
    if (items.length < 2) {
      return `
        <div class="panel empty" style="padding:2rem;text-align:center">
          <p>Add at least 2 ideas to your shortlist to run pairwise matchups.</p>
        </div>
      `;
    }

    // Generate all pairwise combinations
    const pairs = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        pairs.push({ a: items[i], b: items[j] });
      }
    }

    const currentPair = pairs[activePairIndex % pairs.length];
    const leaderboard = store.getPairwiseLeaderboard();
    const existingVote = store.getPairwiseVotes().find(
      p => ((p.ideaA === currentPair.a.ideaId && p.ideaB === currentPair.b.ideaId) ||
            (p.ideaA === currentPair.b.ideaId && p.ideaB === currentPair.a.ideaId)) &&
           p.uid === user.uid
    );

    return `
      <div style="display:grid;grid-template-columns:1fr 340px;gap:1.5rem;align-items:start">
        <!-- Active Matchup Arena -->
        <div class="card" style="padding:1.5rem;background:var(--panel);border:1px solid var(--line)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <div>
              <span class="eyebrow">Matchup ${activePairIndex + 1} of ${pairs.length}</span>
              <h2 style="font-size:1.3rem;margin:0.2rem 0">Head-to-Head Comparison</h2>
              <p style="font-size:0.85rem;color:var(--text2);margin:0">If you and your team could only build ONE of these two opportunities, which would you pick?</p>
            </div>
            <div style="display:flex;gap:0.3rem">
              <button class="button secondary sm btn-prev-pair" ${activePairIndex === 0 ? 'disabled' : ''}>← Prev</button>
              <button class="button secondary sm btn-next-pair" ${activePairIndex >= pairs.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
          </div>

          <!-- 2 Contender Cards -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem">
            <!-- Candidate A -->
            <div class="contender-box ${existingVote?.winnerId === currentPair.a.ideaId ? 'chosen' : ''}" style="background:var(--panel2);padding:1.25rem;border-radius:var(--radius);border:2px solid ${existingVote?.winnerId === currentPair.a.ideaId ? 'var(--accent)' : 'var(--line)'}">
              <span class="chip status sm">${esc(currentPair.a.details.category)}</span>
              <h3 style="font-size:1.15rem;margin:0.4rem 0 0.5rem">${esc(currentPair.a.details.name)}</h3>
              <p style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem">${esc(currentPair.a.details.oneSentenceConcept)}</p>
              
              <div style="font-size:0.78rem;color:var(--muted);margin-bottom:1rem">
                <div><strong>Customer:</strong> ${esc(currentPair.a.details.targetCustomer)}</div>
                <div><strong>Atlas Score:</strong> ${currentPair.a.details.overallScore ?? '—'} / 100</div>
              </div>

              <button class="button ${existingVote?.winnerId === currentPair.a.ideaId ? 'primary' : 'secondary'} btn-vote-pair" data-winner="${esc(currentPair.a.ideaId)}" data-a="${esc(currentPair.a.ideaId)}" data-b="${esc(currentPair.b.ideaId)}" style="width:100%">
                👉 Select ${esc(currentPair.a.details.name)}
              </button>
            </div>

            <!-- Candidate B -->
            <div class="contender-box ${existingVote?.winnerId === currentPair.b.ideaId ? 'chosen' : ''}" style="background:var(--panel2);padding:1.25rem;border-radius:var(--radius);border:2px solid ${existingVote?.winnerId === currentPair.b.ideaId ? 'var(--accent)' : 'var(--line)'}">
              <span class="chip status sm">${esc(currentPair.b.details.category)}</span>
              <h3 style="font-size:1.15rem;margin:0.4rem 0 0.5rem">${esc(currentPair.b.details.name)}</h3>
              <p style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem">${esc(currentPair.b.details.oneSentenceConcept)}</p>
              
              <div style="font-size:0.78rem;color:var(--muted);margin-bottom:1rem">
                <div><strong>Customer:</strong> ${esc(currentPair.b.details.targetCustomer)}</div>
                <div><strong>Atlas Score:</strong> ${currentPair.b.details.overallScore ?? '—'} / 100</div>
              </div>

              <button class="button ${existingVote?.winnerId === currentPair.b.ideaId ? 'primary' : 'secondary'} btn-vote-pair" data-winner="${esc(currentPair.b.ideaId)}" data-a="${esc(currentPair.a.ideaId)}" data-b="${esc(currentPair.b.ideaId)}" style="width:100%">
                👉 Select ${esc(currentPair.b.details.name)}
              </button>
            </div>
          </div>

          <!-- Tie / Pass options -->
          <div style="display:flex;justify-content:center;gap:0.75rem">
            <button class="button ghost sm btn-vote-pair" data-winner="tie" data-a="${esc(currentPair.a.ideaId)}" data-b="${esc(currentPair.b.ideaId)}">⚖️ It's a Tie</button>
            <button class="button ghost sm btn-vote-pair" data-winner="pass" data-a="${esc(currentPair.a.ideaId)}" data-b="${esc(currentPair.b.ideaId)}">⏭️ Skip Matchup</button>
          </div>
        </div>

        <!-- Leaderboard & Matrix -->
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem">
          <h3 style="font-size:1.05rem;margin-bottom:0.75rem">🏆 Pairwise Leaderboard</h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${leaderboard.map((item, rank) => {
              const details = items.find(i => i.ideaId === item.ideaId)?.details;
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-sm);font-size:0.85rem">
                  <div>
                    <span style="font-weight:800;color:var(--muted);margin-right:0.4rem">#${rank + 1}</span>
                    <strong>${esc(details ? details.name : item.ideaId)}</strong>
                  </div>
                  <div style="text-align:right">
                    <span style="font-weight:700;color:var(--accent)">${item.winRate}%</span>
                    <span style="font-size:0.72rem;color:var(--muted)">(${item.wins}W - ${item.losses}L)</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ================================================================
     TAB 4: IDEA VARIANTS LAB
     ================================================================ */
  function renderVariantsTab(items, ws, user) {
    const variants = store.getVariants();

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem">
        <div>
          <h2 style="font-size:1.25rem;margin:0">Idea Variants &amp; Branching Lab</h2>
          <p style="font-size:0.85rem;color:var(--text2);margin:0">
            Fork any idea to tailor buyer segments, distribution wedges, pricing models, or narrower MVP scopes without mutating canonical research data.
          </p>
        </div>
        <button class="button primary sm" id="btnCreateVariant">+ Create New Variant</button>
      </div>

      ${variants.length === 0 ? `
        <div class="panel empty" style="text-align:center;padding:2.5rem 1.5rem">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">💡</div>
          <h3>No Variants Created Yet</h3>
          <p style="color:var(--text2);max-width:480px;margin:0 auto 1.25rem">Customize an existing business idea with a specific wedge, pricing model, or distribution channel for your team.</p>
          <button class="button primary" id="btnCreateVariantEmpty">+ Create Your First Variant</button>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem">
          ${variants.map(v => {
            const parent = ideasMap.get(v.parentIdeaId);
            return `
              <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                  <div>
                    <span class="chip status sm">Forked from: ${esc(parent ? parent.name : v.parentIdeaId)}</span>
                    <h3 style="font-size:1.1rem;margin:0.35rem 0">${esc(v.title)}</h3>
                  </div>
                  <span class="chip neutral sm">${esc(v.stage)}</span>
                </div>

                <div style="font-size:0.82rem;color:var(--text2);margin-bottom:0.75rem;background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);border:1px solid var(--line)">
                  ${v.changes.targetCustomer ? `<div><strong>Target Buyer:</strong> ${esc(v.changes.targetCustomer)}</div>` : ''}
                  ${v.changes.wedge ? `<div><strong>Beachhead Wedge:</strong> ${esc(v.changes.wedge)}</div>` : ''}
                  ${v.changes.pricingModel ? `<div><strong>Pricing Model:</strong> ${esc(v.changes.pricingModel)}</div>` : ''}
                  ${v.changes.distribution ? `<div><strong>Distribution Channel:</strong> ${esc(v.changes.distribution)}</div>` : ''}
                  ${v.changes.summary ? `<div style="margin-top:0.4rem;color:var(--text)">${esc(v.changes.summary)}</div>` : ''}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--muted)">
                  <span>Created by <strong>${esc(v.creatorName)}</strong></span>
                  <div style="display:flex;gap:0.3rem">
                    <button class="button ghost sm btn-delete-variant" data-id="${esc(v.id)}" style="color:var(--score-lo)">Delete</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  /* ================================================================
     TAB 5: FINALISTS & PROVISIONAL WINNER
     ================================================================ */
  function renderDecisionTab(items, ws, user) {
    const finalists = items.filter(i => i.stage === 'finalist' || i.stage === 'winner');
    const decision = store.getDecision();

    return `
      <div style="margin-bottom:1.5rem">
        <h2 style="font-size:1.3rem;margin:0 0 0.25rem">Finalists &amp; Provisional Winner Studio</h2>
        <p style="font-size:0.85rem;color:var(--text2);margin:0">
          Synthesize candidate tradeoffs, identify decisive assumptions, and record an explicit provisional decision with clear falsification triggers.
        </p>
      </div>

      ${decision ? `
        <!-- Formal Decision Card -->
        <div class="card" style="padding:1.5rem;background:hsl(145, 80%, 98%);border:2px solid hsl(145, 60%, 70%);border-radius:var(--radius);margin-bottom:2rem">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1rem">
            <div>
              <span class="chip success">🏆 Provisional Winner Declared</span>
              <h3 style="font-size:1.4rem;color:hsl(145, 90%, 20%);margin:0.4rem 0">${esc(decision.selectedTitle)}</h3>
              <div style="font-size:0.85rem;color:hsl(145, 70%, 25%)">
                Decided on ${new Date(decision.decidedAt).toLocaleDateString()} by <strong>${esc(decision.participants.join(', '))}</strong> · Confidence: <strong>${esc(decision.confidenceLevel.toUpperCase())}</strong>
              </div>
            </div>
            <button class="button secondary sm" id="btnReopenDecision2">Reopen Decision</button>
          </div>

          <div style="background:#fff;padding:1.25rem;border-radius:var(--radius-sm);border:1px solid hsl(145, 50%, 85%);margin-bottom:1rem">
            <h4 style="font-size:0.92rem;color:hsl(145, 90%, 20%);margin-bottom:0.4rem">💡 Core Rationale: Why this candidate?</h4>
            <p style="font-size:0.88rem;color:var(--text);line-height:1.5">${esc(decision.rationale)}</p>

            ${decision.decisiveAssumptions.length > 0 ? `
              <h4 style="font-size:0.92rem;color:hsl(145, 90%, 20%);margin:0.75rem 0 0.3rem">🎯 Decisive Assumptions (What must hold true?)</h4>
              <ul style="font-size:0.85rem;padding-left:1.25rem;line-height:1.6;margin:0">
                ${decision.decisiveAssumptions.map(a => `<li>${esc(a)}</li>`).join('')}
              </ul>
            ` : ''}

            ${decision.dissentObjections.length > 0 ? `
              <h4 style="font-size:0.92rem;color:hsl(30, 90%, 30%);margin:0.75rem 0 0.3rem">⚠️ Recorded Dissent &amp; Unresolved Objections</h4>
              <ul style="font-size:0.85rem;padding-left:1.25rem;line-height:1.6;margin:0;color:hsl(30, 80%, 25%)">
                ${decision.dissentObjections.map(d => `<li>${esc(d)}</li>`).join('')}
              </ul>
            ` : ''}

            ${decision.nextExperiment ? `
              <h4 style="font-size:0.92rem;color:var(--accent);margin:0.75rem 0 0.3rem">🧪 Next Recommended Falsification Test</h4>
              <p style="font-size:0.85rem;color:var(--text);margin:0">${esc(decision.nextExperiment)}</p>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Finalists Comparison Board -->
      <h3 style="font-size:1.1rem;margin-bottom:0.75rem">Candidate Finalists (${finalists.length})</h3>
      ${finalists.length === 0 ? `
        <div class="panel empty" style="padding:2rem;text-align:center">
          <p>No finalists selected yet. Move promising candidates to the <strong>Finalist</strong> stage on the Kanban board.</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:1.5rem">
          ${finalists.map(item => {
            const agg = store.getScorecardAggregation(item.ideaId);
            return `
              <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
                <span class="chip status sm">${esc(item.details.category)}</span>
                <h4 style="font-size:1.1rem;margin:0.4rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(item.ideaId)}">${esc(item.details.name)}</a></h4>
                <p style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem">${esc(item.details.oneSentenceConcept)}</p>

                <div style="background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);margin-bottom:1rem;font-size:0.8rem">
                  <div><strong>Team Score:</strong> ${agg ? agg.compositeScore + ' / 10' : 'Not scored'}</div>
                  <div><strong>Buyer:</strong> ${esc(item.details.targetCustomer)}</div>
                </div>

                <button class="button primary sm btn-declare-winner" data-id="${esc(item.ideaId)}" data-title="${esc(item.details.name)}" style="width:100%">
                  🏆 Select as Provisional Winner
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  /* ================================================================
     TAB 6: VALIDATION EXPERIMENTS
     ================================================================ */
  function renderExperimentsTab(items, ws, user) {
    const experiments = store.getExperiments();

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem">
        <div>
          <h2 style="font-size:1.25rem;margin:0">Falsification &amp; Validation Loop</h2>
          <p style="font-size:0.85rem;color:var(--text2);margin:0">Design cheap, fast tests to falsify decisive assumptions before investing build time.</p>
        </div>
        <button class="button primary sm" id="btnNewExperiment">+ Plan New Experiment</button>
      </div>

      ${experiments.length === 0 ? `
        <div class="panel empty" style="text-align:center;padding:2.5rem 1.5rem">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">🧪</div>
          <h3>No Validation Experiments Planned</h3>
          <p style="color:var(--text2);max-width:480px;margin:0 auto 1.25rem">Validate customer willingness to pay or acquisition feasibility with a structured experiment.</p>
          <button class="button primary" id="btnNewExperimentEmpty">+ Plan Your First Test</button>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${experiments.map(exp => {
            const idea = items.find(i => i.ideaId === exp.ideaId)?.details;
            return `
              <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                  <div>
                    <span class="chip status sm">${esc(idea ? idea.name : exp.ideaId)}</span>
                    <h3 style="font-size:1.1rem;margin:0.35rem 0">${esc(exp.hypothesis)}</h3>
                  </div>
                  <span class="chip ${exp.status === 'passed' ? 'success' : exp.status === 'failed' ? 'danger' : 'neutral'} sm">
                    ${esc(exp.status.toUpperCase())}
                  </span>
                </div>

                <div style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem">
                  ${exp.testDesign ? `<div><strong>Test Design:</strong> ${esc(exp.testDesign)}</div>` : ''}
                  ${exp.targetMetric ? `<div><strong>Target Metric:</strong> ${esc(exp.targetMetric)}</div>` : ''}
                  ${exp.costBudget ? `<div><strong>Budget:</strong> ${esc(exp.costBudget)}</div>` : ''}
                  ${exp.outcomeSummary ? `<div style="margin-top:0.4rem;color:var(--text)"><strong>Outcome:</strong> ${esc(exp.outcomeSummary)}</div>` : ''}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.5rem;border-top:1px solid var(--line);gap:0.5rem">
                  <select class="exp-status-select" data-id="${esc(exp.id)}" style="font-size:0.75rem;padding:0.25rem 0.5rem;border-radius:4px;border:1px solid var(--line);background:var(--bg)">
                    <option value="planned" ${exp.status === 'planned' ? 'selected' : ''}>Status: Planned</option>
                    <option value="running" ${exp.status === 'running' ? 'selected' : ''}>Status: Running</option>
                    <option value="passed" ${exp.status === 'passed' ? 'selected' : ''}>Status: Passed</option>
                    <option value="failed" ${exp.status === 'failed' ? 'selected' : ''}>Status: Failed</option>
                    <option value="inconclusive" ${exp.status === 'inconclusive' ? 'selected' : ''}>Status: Inconclusive</option>
                  </select>

                  <button class="button secondary sm btn-log-outcome" data-id="${esc(exp.id)}">📝 Log Outcome</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  /* ================================================================
     TAB 7: STRUCTURED NOTES FEED
     ================================================================ */
  function renderNotesTab(items, ws, user) {
    const notes = store.getNotes();
    const noteTypes = window.VAStudio.NOTE_TYPES;

    return `
      <div style="display:grid;grid-template-columns:1fr 320px;gap:1.5rem;align-items:start">
        <!-- Notes Feed -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2 style="font-size:1.25rem;margin:0">Team Notes &amp; Observations (${notes.length})</h2>
          </div>

          ${notes.length === 0 ? `
            <div class="panel empty"><p>No notes written yet. Add notes to track pros, cons, objections, and market insights.</p></div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:0.75rem">
              ${notes.map(n => {
                const idea = items.find(i => i.ideaId === n.ideaId)?.details;
                const typeObj = noteTypes.find(t => t.id === n.type);
                return `
                  <div class="card" style="padding:1rem;background:var(--panel);border:1px solid var(--line)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
                      <div>
                        <span class="chip status sm">${typeObj?.icon || '📝'} ${esc(typeObj?.label || n.type)}</span>
                        <span style="font-weight:700;font-size:0.85rem;margin-left:0.4rem">${esc(idea ? idea.name : n.ideaId)}</span>
                      </div>
                      <span style="font-size:0.72rem;color:var(--muted)">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p style="font-size:0.88rem;color:var(--text);margin-bottom:0.5rem;line-height:1.4">${esc(n.content)}</p>

                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--muted)">
                      <span>By <strong>${esc(n.authorName)}</strong></span>
                      <button class="button ghost sm btn-delete-note" data-id="${esc(n.id)}" style="color:var(--score-lo);font-size:0.75rem;padding:0.1rem 0.3rem">Delete</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Add Note Sidebar -->
        <div class="card" style="padding:1.25rem;background:var(--panel);border:1px solid var(--line)">
          <h3 style="font-size:1.05rem;margin-bottom:0.75rem">✍️ Add Structured Note</h3>
          <form id="addNoteForm">
            <div style="margin-bottom:0.75rem">
              <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.25rem">Idea Candidate</label>
              <select id="noteIdeaSelect" style="width:100%;padding:0.4rem;font-size:0.82rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
                ${items.map(i => `<option value="${esc(i.ideaId)}">${esc(i.details.name)}</option>`).join('')}
              </select>
            </div>

            <div style="margin-bottom:0.75rem">
              <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.25rem">Note Category</label>
              <select id="noteTypeSelect" style="width:100%;padding:0.4rem;font-size:0.82rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
                ${noteTypes.map(t => `<option value="${esc(t.id)}">${t.icon} ${esc(t.label)}</option>`).join('')}
              </select>
            </div>

            <div style="margin-bottom:0.75rem">
              <label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.25rem">Observation / Note</label>
              <textarea id="noteContentInput" rows="4" placeholder="Write observation, pro/con, or assumption..." required style="width:100%;padding:0.5rem;font-size:0.85rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)"></textarea>
            </div>

            <button type="submit" class="button primary sm" style="width:100%">Save Note</button>
          </form>
        </div>
      </div>
    `;
  }

  /* ================================================================
     EVENT LISTENERS & BINDINGS
     ================================================================ */
  function bindEvents(ws, user, items) {
    // Tab switching
    rootEl.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        const url = new URL(window.location);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url);
        render();
      });
    });

    // Share / Invite link copy
    const btnShare = document.getElementById('btnShareInvite');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('r', ws.id);
        navigator.clipboard.writeText(url.toString()).then(() => {
          btnShare.textContent = '✓ Cloud Room Link Copied';
          setTimeout(() => { btnShare.textContent = '🔗 Copy Cloud Room Link'; }, 2500);
        }).catch(() => {
          prompt('Copy this room URL to share with co-founders:', url.toString());
        });
      });
    }

    // Export packet
    const btnExport = document.getElementById('btnExportPacket');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = store.exportDecisionPacket();
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `decision-packet-${ws.id}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }

    // Import packet
    const btnImport = document.getElementById('btnImportPacket');
    const fileInput = document.getElementById('importFileInput');
    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = store.importDecisionPacket(evt.target.result);
          if (res.success) {
            alert('Decision packet imported successfully!');
            render();
          } else {
            alert(`Failed to import packet: ${res.error}`);
          }
        };
        reader.readAsText(file);
      });
    }

    // Profile modal
    const btnEditUser = document.getElementById('btnEditUser');
    if (btnEditUser) {
      btnEditUser.addEventListener('click', () => {
        const newName = prompt('Enter your display name / nickname:', user.displayName);
        if (newName && newName.trim()) {
          store.setUser({ displayName: newName.trim() });
          render();
        }
      });
    }

    // New workspace
    const btnNewWs = document.getElementById('btnNewWorkspace');
    if (btnNewWs) {
      btnNewWs.addEventListener('click', () => {
        const name = prompt('Enter a name for the new decision workspace:', 'Founder Shortlist');
        if (name && name.trim()) {
          const newWs = store.createWorkspace(name.trim());
          const url = new URL(window.location);
          url.searchParams.set('r', newWs.id);
          window.history.pushState({}, '', url);
          render();
        }
      });
    }

    // Stage change select
    rootEl.querySelectorAll('.stage-select').forEach(sel => {
      sel.addEventListener('change', () => {
        store.setShortlistStage(sel.dataset.id, sel.value);
        render();
      });
    });

    // Remove from shortlist
    rootEl.querySelectorAll('.btn-remove-shortlist').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Remove this idea from your decision shortlist?')) {
          store.removeFromShortlist(btn.dataset.id);
          render();
        }
      });
    });

    // Quick note button on card
    rootEl.querySelectorAll('.btn-quick-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = prompt('Add note for this idea:');
        if (text && text.trim()) {
          store.addNote({ ideaId: btn.dataset.id, content: text.trim() });
          render();
        }
      });
    });

    // Scorecard idea selection
    rootEl.querySelectorAll('.scorecard-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedScorecardIdeaId = btn.dataset.id;
        render();
      });
    });

    // Scorecard sliders live badge update
    rootEl.querySelectorAll('.dim-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const badge = document.getElementById(`val_${slider.name}`);
        if (badge) badge.textContent = `${slider.value}/10`;
      });
    });

    // Scorecard form submission
    const scForm = document.getElementById('scorecardForm');
    if (scForm) {
      scForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ideaId = scForm.dataset.id;
        const formData = new FormData(scForm);
        const scores = {};
        const dimensionNotes = {};

        window.VAStudio.SCORE_DIMENSIONS.forEach(dim => {
          scores[dim.id] = Number(formData.get(dim.id));
          const note = formData.get(`note_${dim.id}`);
          if (note) dimensionNotes[dim.id] = note;
        });

        store.saveScorecard({ ideaId, scores, dimensionNotes });
        if (firebaseAdapter) {
          firebaseAdapter.pushScorecard(store.getScorecard(ideaId));
        }
        alert('Scorecard saved!');
        render();
      });
    }

    // Pairwise vote buttons
    rootEl.querySelectorAll('.btn-vote-pair').forEach(btn => {
      btn.addEventListener('click', () => {
        const ideaA = btn.dataset.a;
        const ideaB = btn.dataset.b;
        const winnerId = btn.dataset.winner;
        store.savePairwiseVote({ ideaA, ideaB, winnerId });
        if (firebaseAdapter) {
          firebaseAdapter.pushPairwise(store.getPairwiseVotes().slice(-1)[0]);
        }
        activePairIndex++;
        render();
      });
    });

    // Pairwise pagination
    const btnPrevPair = rootEl.querySelector('.btn-prev-pair');
    const btnNextPair = rootEl.querySelector('.btn-next-pair');
    if (btnPrevPair) btnPrevPair.addEventListener('click', () => { activePairIndex = Math.max(0, activePairIndex - 1); render(); });
    if (btnNextPair) btnNextPair.addEventListener('click', () => { activePairIndex++; render(); });

    // Create variant modal/prompt
    const btnVariant = document.getElementById('btnCreateVariant') || document.getElementById('btnCreateVariantEmpty');
    if (btnVariant) {
      btnVariant.addEventListener('click', () => {
        const parentId = prompt('Enter the ID of the parent idea to fork (e.g. idea-061):', items[0]?.ideaId || 'idea-061');
        if (!parentId) return;
        const title = prompt('Enter a title for this variant (e.g. Compliance-First SME Wedge):');
        if (!title) return;
        const targetCustomer = prompt('Target buyer for this variant (optional):', '') || '';
        const wedge = prompt('Beachhead offering/wedge (optional):', '') || '';
        const summary = prompt('Why is this variant better/different? (optional):', '') || '';

        store.createVariant({
          parentIdeaId: parentId.trim(),
          title: title.trim(),
          changes: { targetCustomer, wedge, summary },
          stage: 'interesting'
        });
        activeTab = 'variants';
        render();
      });
    }

    // Delete variant
    rootEl.querySelectorAll('.btn-delete-variant').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this idea variant?')) {
          store.deleteVariant(btn.dataset.id);
          render();
        }
      });
    });

    // Declare winner flow
    rootEl.querySelectorAll('.btn-declare-winner').forEach(btn => {
      btn.addEventListener('click', () => {
        const ideaId = btn.dataset.id;
        const title = btn.dataset.title;

        const rationale = prompt(`Declare "${title}" as Provisional Winner.\n\nExplain the core rationale (why this idea over other finalists?):`);
        if (!rationale || !rationale.trim()) return;

        const assumption = prompt('What is the #1 decisive assumption that must hold true?', '') || '';
        const dissent = prompt('Were there any minority concerns or objections to note?', '') || '';
        const nextTest = prompt('What is the cheapest next experiment to falsify this?', '') || '';

        store.recordDecision({
          selectedId: ideaId,
          selectedTitle: title,
          isVariant: ideaId.startsWith('var_'),
          rationale: rationale.trim(),
          decisiveAssumptions: assumption ? [assumption.trim()] : [],
          dissentObjections: dissent ? [dissent.trim()] : [],
          confidenceLevel: 'high',
          nextExperiment: nextTest.trim()
        });

        if (firebaseAdapter) {
          firebaseAdapter.pushDecision(store.getDecision());
        }

        activeTab = 'decision';
        render();
      });
    });

    // Reopen decision
    const btnReopen = document.getElementById('btnReopenDecision') || document.getElementById('btnReopenDecision2');
    if (btnReopen) {
      btnReopen.addEventListener('click', () => {
        const reason = prompt('Reason for reopening this decision:');
        if (reason !== null) {
          store.reopenDecision(reason);
          if (firebaseAdapter) {
            firebaseAdapter.pushDecision(null);
          }
          render();
        }
      });
    }

    // Plan experiment
    const btnNewExp = document.getElementById('btnNewExperiment') || document.getElementById('btnNewExperimentEmpty');
    if (btnNewExp) {
      btnNewExp.addEventListener('click', () => {
        const ideaId = prompt('Enter Idea ID for experiment:', items[0]?.ideaId || 'idea-061');
        if (!ideaId) return;
        const hypothesis = prompt('What assumption / hypothesis are you testing?');
        if (!hypothesis) return;
        const testDesign = prompt('How will you test it cheaply (landing page, 10 cold calls, mock RFP)?') || '';
        const targetMetric = prompt('Target success metric (e.g., 3 paid deposits)?') || '';

        store.addExperiment({
          ideaId: ideaId.trim(),
          hypothesis: hypothesis.trim(),
          testDesign: testDesign.trim(),
          targetMetric: targetMetric.trim()
        });
        activeTab = 'experiments';
        render();
      });
    }

    // Update experiment status
    rootEl.querySelectorAll('.exp-status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        store.updateExperiment(sel.dataset.id, { status: sel.value });
        render();
      });
    });

    // Log experiment outcome
    rootEl.querySelectorAll('.btn-log-outcome').forEach(btn => {
      btn.addEventListener('click', () => {
        const outcome = prompt('Log observed outcome and results:');
        if (outcome && outcome.trim()) {
          store.updateExperiment(btn.dataset.id, {
            outcomeSummary: outcome.trim(),
            status: 'passed'
          });
          render();
        }
      });
    });

    // Add note form
    const noteForm = document.getElementById('addNoteForm');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ideaId = document.getElementById('noteIdeaSelect').value;
        const type = document.getElementById('noteTypeSelect').value;
        const content = document.getElementById('noteContentInput').value;
        if (content.trim()) {
          const note = store.addNote({ ideaId, type, content: content.trim() });
          if (firebaseAdapter) {
            firebaseAdapter.pushNote(note);
          }
          render();
        }
      });
    }

    // Delete note
    rootEl.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', () => {
        store.deleteNote(btn.dataset.id);
        render();
      });
    });
  }

  // Subscribe to store updates for live re-rendering
  store.subscribe((event) => {
    // Only re-render if not currently typing in a text field
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
    if (!isTyping) {
      render();
    }
  });

  if (firebaseAdapter) {
    firebaseAdapter.onStatusChange(() => render());
  }

  render();
}

window.initDecisionStudio = initDecisionStudio;
// Backward compatibility bridge for old script tags
window.initCollaborationRoom = initDecisionStudio;
