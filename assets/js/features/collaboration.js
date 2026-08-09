/* Venture Atlas OS — Real Friend Collaboration Engine (v2.3.0) */
function initCollaborationRoom() {
  const container = document.getElementById('roomApp');
  if (!container) return;

  const base = window.VA?.base || '..';
  const ideasData = window.VA?.ideas || [];
  const ideasMap = new Map(ideasData.map(i => [i.id, i]));

  // Parse room parameter ?r=<roomId>
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('r') || urlParams.get('room');
  const initialMode = urlParams.get('mode') || 'reaction';

  // Read local room session fallback
  let roomState = window.VentureAtlas?.readJsonStorage('va-room-session', null);

  if (roomId && (!roomState || roomState.id !== roomId)) {
    // Joining existing room by ID
    roomState = {
      id: roomId,
      name: `Room ${roomId.slice(0, 8)}`,
      nickname: 'Guest ' + Math.floor(Math.random() * 1000),
      votingMode: initialMode,
      resultsVisibility: 'after_vote',
      members: [],
      shortlist: window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || ['idea-061', 'idea-273'],
      votes: {},
      comments: []
    };
    window.VentureAtlas?.writeJsonStorage('va-room-session', roomState);
  }

  function saveState() {
    window.VentureAtlas?.writeJsonStorage('va-room-session', roomState);
    renderRoomUI();
  }

  function renderRoomUI() {
    if (!roomState || !roomState.id) {
      // Render Create Room Form
      container.innerHTML = `
        <div class="card" style="max-width:560px;margin:2rem auto;padding:2rem">
          <h2 style="margin-bottom:0.5rem">👥 Create a Friend Collaboration Room</h2>
          <p style="color:var(--text2);margin-bottom:1.5rem">Invite co-founders or team members to evaluate venture ideas together without requiring GitHub logins.</p>

          <form id="createRoomForm" style="display:flex;flex-direction:column;gap:1rem">
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Room Name</label>
              <input type="text" id="roomNameInput" placeholder="e.g. Founder Shortlist 2026" required style="width:100%;padding:0.6rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Your Nickname</label>
              <input type="text" id="roomNicknameInput" placeholder="e.g. Alex" required style="width:100%;padding:0.6rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Voting Mode</label>
              <select id="roomVotingModeSelect" style="width:100%;padding:0.6rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
                <option value="reaction">👍 Quick Reaction (Interested / Unsure / Pass)</option>
                <option value="scorecard">📊 Structured Scorecard (1-10 multi-dimension)</option>
                <option value="pairwise">⚔️ Pairwise Comparison (Idea A vs Idea B)</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:0.85rem;margin-bottom:0.3rem">Results Visibility (Mitigate Groupthink)</label>
              <select id="roomVisibilitySelect" style="width:100%;padding:0.6rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
                <option value="after_vote" selected>Hidden until I vote (Recommended)</option>
                <option value="live">Live results for all members</option>
                <option value="after_close">Hidden until poll completes</option>
              </select>
            </div>
            <button type="submit" class="button primary" style="margin-top:0.5rem">🚀 Launch Room &amp; Get Share Link</button>
          </form>
        </div>
      `;

      document.getElementById('createRoomForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newId = 'room-' + Math.random().toString(36).substring(2, 10);
        const storedShortlist = window.VentureAtlas?.readJsonStorage('va-room-shortlist', []) || ['idea-061', 'idea-273'];

        roomState = {
          id: newId,
          name: document.getElementById('roomNameInput').value.trim() || 'Venture Room',
          nickname: document.getElementById('roomNicknameInput').value.trim() || 'Founder',
          votingMode: document.getElementById('roomVotingModeSelect').value,
          resultsVisibility: document.getElementById('roomVisibilitySelect').value,
          members: [document.getElementById('roomNicknameInput').value.trim() || 'Founder'],
          shortlist: storedShortlist,
          votes: {},
          comments: [
            { user: 'System', text: 'Room created! Share the link to invite friends.', time: 'Just now' }
          ]
        };

        const url = new URL(window.location);
        url.searchParams.set('r', newId);
        window.history.pushState({}, '', url);
        saveState();
      });
      return;
    }

    // Render Active Room Dashboard
    const shareUrl = `${window.location.origin}${window.location.pathname}?r=${roomState.id}`;
    const shortlistedIdeas = (roomState.shortlist || []).map(id => ideasMap.get(id)).filter(Boolean);

    container.innerHTML = `
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <div class="eyebrow">Collaboration Room &nbsp;·&nbsp; ${escHTML(roomState.id)}</div>
            <h1 style="font-size:1.5rem;margin:0.25rem 0">${escHTML(roomState.name)}</h1>
            <p style="font-size:0.85rem;color:var(--text2);margin:0">Active User: <strong>${escHTML(roomState.nickname)}</strong> · Mode: <strong>${escHTML(roomState.votingMode)}</strong></p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button id="copyRoomLinkBtn" class="button secondary sm">🔗 Copy Invite Link</button>
            <button id="leaveRoomBtn" class="button ghost sm">Leave Room</button>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem">
        <!-- Main Shortlist & Voting Area -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2 style="font-size:1.2rem;margin:0">📋 Room Shortlist (${shortlistedIdeas.length})</h2>
            <a href="${base}/index.html" class="button secondary sm">+ Add More Ideas</a>
          </div>

          ${shortlistedIdeas.length === 0 ? `
            <div style="padding:2rem;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)">
              <p style="color:var(--text2)">No ideas shortlisted in this room yet.</p>
              <a href="${base}/index.html" class="button primary sm">Browse Ideas to Add</a>
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:1rem">
              ${shortlistedIdeas.map(idea => {
                const userVote = roomState.votes[idea.id] || null;
                const canSeeResults = roomState.resultsVisibility === 'live' || !!userVote;

                return `
                  <div class="card" style="padding:1.25rem">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                      <div>
                        <span class="chip status">${escHTML(idea.category)}</span>
                        <h3 style="font-size:1.15rem;margin:0.3rem 0"><a href="${base}/docs/idea.html?id=${encodeURIComponent(idea.id)}">${escHTML(idea.name)}</a></h3>
                      </div>
                      <span class="score-badge ${idea.atAGlance?.overallScore >= 85 ? 'high' : 'medium'}">${idea.atAGlance?.overallScore ?? '—'}</span>
                    </div>

                    <p style="font-size:0.88rem;color:var(--text2);margin-bottom:0.75rem">${escHTML(idea.oneSentenceConcept || '')}</p>

                    <!-- Voting Actions -->
                    <div style="background:var(--panel2);padding:0.75rem;border-radius:var(--radius-sm);border:1px solid var(--line);margin-bottom:0.75rem">
                      <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.4rem;color:var(--muted)">YOUR VOTE (${roomState.nickname})</div>
                      <div style="display:flex;gap:0.4rem">
                        <button class="button ${userVote === 'interested' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="interested">👍 Interested</button>
                        <button class="button ${userVote === 'unsure' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="unsure">🤔 Unsure</button>
                        <button class="button ${userVote === 'pass' ? 'primary' : 'secondary'} sm vote-btn" data-id="${escHTML(idea.id)}" data-val="pass">👎 Pass</button>
                      </div>
                    </div>

                    <!-- Group Signal Result -->
                    ${canSeeResults ? `
                      <div style="font-size:0.8rem;color:var(--text2);display:flex;gap:1rem;align-items:center">
                        <span><strong>Your Preference:</strong> ${userVote ? 'Voted (' + userVote + ')' : 'No vote yet'}</span>
                        <span>•</span>
                        <span><strong>Atlas Evidence Score:</strong> ${idea.atAGlance?.overallScore != null ? idea.atAGlance.overallScore + '/100' : 'Not scored'}</span>
                      </div>
                    ` : `
                      <div style="font-size:0.8rem;color:var(--muted);font-style:italic">Results hidden until you vote (Groupthink protection).</div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Room Sidebar: Chat & Export -->
        <div>
          <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.5rem">
            <h3 style="font-size:1rem;margin-bottom:0.75rem">💬 Room Discussion</h3>
            <div id="commentList" style="display:flex;flex-direction:column;gap:0.5rem;max-height:240px;overflow-y:auto;margin-bottom:0.75rem;padding-right:0.3rem">
              ${(roomState.comments || []).map(c => `
                <div style="font-size:0.8rem;background:var(--panel2);padding:0.4rem 0.6rem;border-radius:var(--radius-sm)">
                  <strong>${escHTML(c.user)}:</strong> ${escHTML(c.text)}
                </div>
              `).join('')}
            </div>
            <form id="commentForm" style="display:flex;gap:0.4rem">
              <input type="text" id="commentInput" placeholder="Add note or question..." required style="flex:1;padding:0.4rem 0.6rem;font-size:0.82rem;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg)">
              <button type="submit" class="button primary sm">Send</button>
            </form>
          </div>

          <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem">
            <h3 style="font-size:1rem;margin-bottom:0.75rem">📥 Decision Packet</h3>
            <p style="font-size:0.8rem;color:var(--text2);margin-bottom:1rem">Export room votes and evaluation scores into a machine-readable JSON packet.</p>
            <button id="exportPacketBtn" class="button secondary sm" style="width:100%">Download Vote Packet (.json)</button>
          </div>
        </div>
      </div>
    `;

    bindRoomEvents();
  }

  function bindRoomEvents() {
    const copyBtn = document.getElementById('copyRoomLinkBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?r=${roomState.id}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            copyBtn.innerHTML = '✓ Link Copied!';
            setTimeout(() => { copyBtn.innerHTML = '🔗 Copy Invite Link'; }, 2000);
          });
        }
      });
    }

    const leaveBtn = document.getElementById('leaveRoomBtn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        roomState = null;
        window.VentureAtlas?.writeJsonStorage('va-room-session', null);
        const url = new URL(window.location);
        url.searchParams.delete('r');
        window.history.pushState({}, '', url);
        renderRoomUI();
      });
    }

    container.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ideaId = btn.dataset.id;
        const val = btn.dataset.val;
        roomState.votes[ideaId] = val;
        saveState();
      });
    });

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

    const exportBtn = document.getElementById('exportPacketBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const packet = {
          schemaVersion: '2.0.0',
          roomId: roomState.id,
          roomName: roomState.name,
          exportedAt: new Date().toISOString(),
          members: roomState.members,
          shortlist: roomState.shortlist,
          votes: roomState.votes,
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
