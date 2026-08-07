/**
 * FactBounty Web Portal Client JavaScript
 */

let activeBountyId = null;
let activeChallengeCode = null;

function showTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(`${tabName}-panel`).classList.add('active');

  if (tabName === 'buyer') loadBuyerBounties();
  if (tabName === 'responder') loadResponderRequests();
  if (tabName === 'moderator') loadModeratorQueue();
}

async function handlePostBounty(e) {
  e.preventDefault();
  const productUrl = document.getElementById('productUrl').value;
  const productTitle = document.getElementById('productTitle').value;
  const question = document.getElementById('question').value;
  const bountyAmount = parseInt(document.getElementById('bountyAmount').value, 10) * 100; // in cents

  try {
    const res1 = await fetch('/api/bounties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId: 'usr_buyer_demo', productUrl, productTitle, question, bountyAmount })
    });
    const data1 = await res1.json();
    if (!data1.success) throw new Error(data1.error);

    // Fund via local simulator
    const res2 = await fetch(`/api/bounties/${data1.bounty.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useStripe: false })
    });
    const data2 = await res2.json();

    alert(`Bounty funded & posted successfully! ID: ${data1.bounty.id}`);
    document.getElementById('bounty-form').reset();
    loadBuyerBounties();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function loadBuyerBounties() {
  const container = document.getElementById('buyer-bounties-list');
  try {
    const res = await fetch('/api/responder/requests'); // fetch all funded/matching
    const data = await res.json();

    if (!data.requests || data.requests.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8;">No active bounties yet. Create one above!</p>';
      return;
    }

    container.innerHTML = data.requests.map(b => `
      <div class="bounty-card">
        <span class="badge badge-funded">${b.state}</span>
        <strong>€${(b.bountyAmount / 100).toFixed(2)}</strong> — ${b.productTitle}
        <p style="margin-top: 8px;"><strong>Question:</strong> ${b.question}</p>
        <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">URL: ${b.productUrl}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: #ef4444;">Failed to load bounties: ${err.message}</p>`;
  }
}

async function loadResponderRequests() {
  const container = document.getElementById('responder-requests-list');
  try {
    const res = await fetch('/api/responder/requests');
    const data = await res.json();

    if (!data.requests || data.requests.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8;">No available requests matching your location right now.</p>';
      return;
    }

    container.innerHTML = data.requests.map(b => `
      <div class="bounty-card">
        <span class="badge badge-funded">${b.state}</span>
        <strong>€${(b.bountyAmount / 100).toFixed(2)} Bounty</strong> — ${b.productTitle}
        <p style="margin-top: 8px;"><strong>Question:</strong> ${b.question}</p>
        <button class="btn" style="margin-top: 12px;" onclick="acceptRequest('${b.id}')">Accept & Start Guided Capture</button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: #ef4444;">Failed to load requests: ${err.message}</p>`;
  }
}

async function acceptRequest(bountyId) {
  try {
    const res = await fetch(`/api/bounties/${bountyId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responderId: 'usr_resp_demo' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    activeBountyId = bountyId;
    activeChallengeCode = data.challengeCode;

    document.getElementById('capture-zone').style.display = 'block';
    document.getElementById('active-challenge-code').innerText = data.challengeCode;
    alert(`Request accepted! Challenge Code generated: ${data.challengeCode}`);
  } catch (err) {
    alert(`Accept error: ${err.message}`);
  }
}

async function handleSubmitEvidence() {
  if (!activeBountyId || !activeChallengeCode) {
    alert('Please accept a request first to generate a challenge code');
    return;
  }
  const mediaUrl = document.getElementById('mediaUrl').value;

  try {
    const res = await fetch(`/api/bounties/${activeBountyId}/submit-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responderId: 'usr_resp_demo',
        mediaUrl,
        challengeCode: activeChallengeCode,
        checklistFulfilledIds: ['chk_1', 'chk_2', 'chk_3'],
        reusableConsent: true
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert('Evidence submitted for moderation review!');
    document.getElementById('capture-zone').style.display = 'none';
    activeBountyId = null;
    activeChallengeCode = null;
    loadResponderRequests();
  } catch (err) {
    alert(`Submit error: ${err.message}`);
  }
}

async function loadModeratorQueue() {
  const container = document.getElementById('moderator-queue-list');
  try {
    const res = await fetch('/api/moderator/queue');
    const data = await res.json();

    if (!data.queue || data.queue.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8;">Moderation queue is clear (0 pending reviews).</p>';
      return;
    }

    container.innerHTML = data.queue.map(e => `
      <div class="evidence-card">
        <span class="badge badge-review">${e.state}</span>
        <strong>Bounty ID:</strong> ${e.bountyId} | <strong>Challenge:</strong> ${e.challengeCode}
        <p style="margin-top: 8px;"><strong>Media File:</strong> <a href="${e.mediaUrl}" target="_blank" style="color: #38bdf8;">${e.mediaUrl}</a></p>
        <div style="margin-top: 12px;">
          <button class="btn btn-success" onclick="reviewSubmission('${e.id}', 'approve')">Approve & Generate Card</button>
          <button class="btn btn-warning" onclick="reviewSubmission('${e.id}', 'request_correction')">Request Correction</button>
          <button class="btn btn-danger" onclick="reviewSubmission('${e.id}', 'reject')">Reject & Refund</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: #ef4444;">Failed to load queue: ${err.message}</p>`;
  }
}

async function reviewSubmission(evidenceId, decision) {
  try {
    const res = await fetch(`/api/moderator/evidence/${evidenceId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moderatorId: 'usr_mod_demo', decision, notes: `Reviewed decision: ${decision}` })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (decision === 'approve') {
      // Auto release simulated payout
      await fetch(`/api/moderator/bounties/${data.bounty.id}/release-payout`, { method: 'POST' });
      alert(`Evidence approved, card created & simulated payout released to responder!`);
    } else {
      alert(`Decision recorded: ${decision}`);
    }

    loadModeratorQueue();
  } catch (err) {
    alert(`Review error: ${err.message}`);
  }
}

// Initial load
loadBuyerBounties();
