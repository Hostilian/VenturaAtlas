/** VenturaAtlas Mercury — Customer Reality Lab UI. */

function initMercuryLab() {
  const root = document.getElementById('mercuryApp');
  const api = window.VAMercury;
  if (!root || !api) return;

  const store = new api.MercuryStore();
  const ideas = window.VA?.ideas || [];
  const requestedIdeaId = new URLSearchParams(window.location.search).get('idea')
    || new URLSearchParams(window.location.search).get('id');
  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const list = value => String(value || '').split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
  const money = values => Object.entries(values).length
    ? Object.entries(values).map(([currency, amount]) => `${currency} ${amount.toFixed(2)}`).join(' · ')
    : 'None recorded';

  function nextHumanAction(ws, summary) {
    if (!ws.canonicalIdeaId) return 'Choose one canonical venture. This creates no commercial evidence.';
    if (!ws.segments.length) return 'Define one narrow segment, its budget owner, current alternative, and observable buying trigger.';
    if (!summary.identifiedOrganizations) return 'Identify one real reachable buyer organization through a lawful, permission-respecting path; do not store personal contact data here.';
    if (!summary.conversations) return 'A human should conduct one consented problem conversation and retain the source privately; Mercury will not contact anyone.';
    if (!summary.qualified) return 'Review the observed facts and either qualify the opportunity with an evidence reference or record the loss reason.';
    if (!summary.netPayingOrganizations) return summary.payingOrganizations
      ? 'A historical payment is fully refunded. A human should diagnose the outcome before seeking another retained payment.'
      : 'A human should present one concrete paid offer and record acceptance, rejection, or collected payment without treating an invoice as revenue.';
    if (!summary.activatedOrganizations) return 'Run a human value review and record VALUE ACHIEVED only when the promised outcome is observed.';
    if (!summary.renewedOrganizations) return 'Ask the buyer to make a real renewal decision after value delivery; a first payment is not retention.';
    return 'Test the same segment, offer, and channel with an independent buyer before calling the motion repeatable.';
  }

  let notice = store.getRecoveryWarning();

  function optionRows(items, idKey, labelKey, includeBlank = true) {
    return `${includeBlank ? '<option value="">— Select —</option>' : ''}${items.map(item =>
      `<option value="${esc(item[idKey])}">${esc(item[labelKey])}</option>`).join('')}`;
  }

  function summaryCard(label, value, note = '') {
    return `<div class="panel" style="padding:1rem"><div style="font-size:.75rem;color:var(--text2);text-transform:uppercase;letter-spacing:.05em">${esc(label)}</div><div style="font-size:1.55rem;font-weight:700;margin:.15rem 0">${esc(value)}</div>${note ? `<div style="font-size:.76rem;color:var(--text2)">${esc(note)}</div>` : ''}</div>`;
  }

  function render() {
    const ws = store.getWorkspace();
    const summary = store.getSummary();
    const selectedIdeaId = ws.canonicalIdeaId || requestedIdeaId;
    const ideaOptions = ideas.map(idea => `<option value="${esc(idea.id)}" ${idea.id === selectedIdeaId ? 'selected' : ''}>${esc(idea.id)} — ${esc(idea.name)}</option>`).join('');
    const segmentOptions = optionRows(ws.segments, 'segmentId', 'name');
    const channelOptions = optionRows(ws.channels, 'channelId', 'name');
    const organizationOptions = optionRows(ws.organizations, 'organizationId', 'name');
    const offerOptions = optionRows(ws.offers, 'offerId', 'name');
    const opportunityOptions = `<option value="">— Select —</option>${ws.opportunities.map(item => {
      const org = ws.organizations.find(candidate => candidate.organizationId === item.organizationId);
      return `<option value="${esc(item.opportunityId)}">${esc(org?.name || item.organizationId)} — ${esc(item.stage)}</option>`;
    }).join('')}`;

    root.innerHTML = `
      <section class="panel" style="padding:1.25rem;margin-bottom:1rem;border-left:4px solid var(--accent)">
        <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap">
          <div>
            <div class="eyebrow">Mercury · local commercial workspace</div>
            <h1 style="margin:.25rem 0">${esc(ws.ventureName || 'Choose a venture to take to market')}</h1>
            <p style="margin:.25rem 0;color:var(--text2)">Highest operator-attested signal: <strong>${esc(summary.evidence.code)} — ${esc(summary.evidence.label)}</strong><br><span style="font-size:.78rem">${esc(summary.evidence.verification.replaceAll('_', ' '))}. This is a venture-wide maximum, not a contiguous funnel or independent verification.</span></p>
          </div>
          <span class="chip">🔒 Browser-local only</span>
        </div>
        <p style="margin:.8rem 0 0"><strong>Privacy boundary:</strong> records stay in this browser. They are not synchronized, emailed, committed, or published. Store only minimal business context; use non-identifying participant references and keep transcripts/contact details in an approved private system.</p>
      </section>

      ${notice ? `<div class="notice" role="alert" style="margin-bottom:1rem">${esc(notice)}</div>` : ''}
      <div id="mercuryStatus" role="status" aria-live="polite" class="sr-only"></div>

      <section aria-labelledby="commercial-scoreboard" style="margin-bottom:1.5rem">
        <h2 id="commercial-scoreboard">Observed commercial scoreboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:.75rem">
          ${summaryCard('Buyer/account records', summary.identifiedOrganizations, 'Real records; no synthetic fixtures')}
          ${summaryCard('Reachable, attested', summary.reachableOrganizations, 'Operator-attested; not independent proof')}
          ${summaryCard('Contact attempts', summary.contactAttempts)}
          ${summaryCard('Conversations', summary.conversations)}
          ${summaryCard('Qualified', summary.qualified)}
          ${summaryCard('Pilots', summary.pilots)}
          ${summaryCard('Ever paid', summary.payingOrganizations, 'Historical gross payment event')}
          ${summaryCard('Net-paying now', summary.netPayingOrganizations, 'Collected less recorded refunds')}
          ${summaryCard('Refunded', summary.refundedOrganizations)}
          ${summaryCard('Activated', summary.activatedOrganizations)}
          ${summaryCard('Renewed', summary.renewedOrganizations)}
          ${summaryCard('Lost', summary.lostOpportunities, 'Reason required')}
          ${summaryCard('Collected revenue', money(summary.revenueCollected), 'Invoices are excluded')}
        </div>
      </section>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:1rem;align-items:start">
        <section class="panel" style="padding:1.25rem">
          <h2>1. Venture and segment hypothesis</h2>
          <form id="ventureForm" class="mercury-form">
            <label>Canonical idea<select name="ideaId" required><option value="">— Select an idea —</option>${ideaOptions}</select></label>
            <button class="button" type="submit">Set active venture</button>
          </form>
          <hr>
          <form id="segmentForm" class="mercury-form">
            <label>Specific reachable segment<input name="name" required placeholder="e.g. EU data-centre developers with duplicate grid applications"></label>
            <label>Operational description<textarea name="description" required placeholder="Geography, size, workflow, and observable condition"></textarea></label>
            <label>Economic buyer roles<input name="buyerRoles" placeholder="Comma-separated; UNKNOWN is allowed"></label>
            <label>End-user roles<input name="userRoles" placeholder="Comma-separated"></label>
            <label>Budget owner<input name="budgetOwner" placeholder="Role authorized to spend, or UNKNOWN"></label>
            <label>Budget source<input name="budgetSource" placeholder="Department/category/project budget, or UNKNOWN"></label>
            <label>Why buy now?<textarea name="whyNow" placeholder="Trigger and consequence of delay; use UNKNOWN when unproven"></textarea></label>
            <label>Current alternatives<input name="alternatives" placeholder="Spreadsheet, consultant, internal build, do nothing"></label>
            <label>Reachability<select name="reachability"><option>UNKNOWN</option><option>VERY_HIGH</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label>
            <button class="button" type="submit">Add hypothesis segment</button>
          </form>
        </section>

        <section class="panel" style="padding:1.25rem">
          <h2>2. Trigger, channel, and offer</h2>
          ${ws.segments.length ? `
          <form id="triggerForm" class="mercury-form">
            <label>Segment<select name="segmentId" required>${segmentOptions}</select></label>
            <label>Trigger type<input name="type" required placeholder="audit finding, renewal, public incident…"></label>
            <label>Trigger description<textarea name="description" required></textarea></label>
            <label>Detectability<select name="detectability"><option>UNKNOWN</option><option>PUBLIC</option><option>PRIVATE</option></select></label>
            <label>Urgency window<input name="urgencyWindow" placeholder="UNKNOWN or a bounded window"></label>
            <button class="button secondary" type="submit">Add trigger hypothesis</button>
          </form>
          <hr>
          <form id="channelForm" class="mercury-form">
            <label>Segment<select name="segmentId" required>${segmentOptions}</select></label>
            <label>Channel<input name="name" required placeholder="Warm referral, specialist directory, marketplace…"></label>
            <label>Access path<input name="accessPath" placeholder="How can the buyer actually be reached?"></label>
            <button class="button secondary" type="submit">Add channel hypothesis</button>
          </form>
          <hr>
          <form id="offerForm" class="mercury-form">
            <label>Segment<select name="segmentId" required>${segmentOptions}</select></label>
            <label>Offer name<input name="name" required></label>
            <label>Concrete deliverable<textarea name="deliverable" required></textarea></label>
            <label>Motion<select name="motion"><option>FOUNDER_LED</option><option>SERVICE_FIRST</option><option>SELF_SERVE</option><option>CHANNEL_LED</option><option>MARKETPLACE</option><option>DEVELOPER_LED</option><option>OTHER</option></select></label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem"><label>Price hypothesis<input type="number" min="0" step="0.01" name="amount"></label><label>Currency<input name="currency" value="EUR" pattern="[A-Z]{3}"></label></div>
            <label>Pricing basis<input name="basis" placeholder="per pilot, per site, monthly…"></label>
            <label>Pilot type<select name="pilotType"><option>UNKNOWN</option><option>NONE</option><option>FREE</option><option>PAID</option></select></label>
            <button class="button" type="submit">Add offer hypothesis</button>
          </form>` : '<p class="empty">Add a segment before defining triggers, channels, or offers.</p>'}
        </section>

        <section class="panel" style="padding:1.25rem">
          <h2>3. Reachable organization and pipeline</h2>
          ${ws.segments.length ? `
          <form id="organizationForm" class="mercury-form">
            <label>Buyer/account label<input name="name" required autocomplete="off" placeholder="Non-identifying account label or business name"></label>
            <label>Buyer type<select name="actorType"><option value="ORGANIZATION">Organization</option><option value="INDIVIDUAL_ACCOUNT">Individual account (non-identifying)</option><option value="HOUSEHOLD">Household (non-identifying)</option><option value="MARKETPLACE_PARTICIPANT">Marketplace participant</option></select></label>
            <label>Segment<select name="segmentId" required>${segmentOptions}</select></label>
            <label>Record class<select name="recordClass"><option value="REAL">Real organization</option><option value="SYNTHETIC">Synthetic test fixture</option></select></label>
            <label>Reachability basis<textarea name="reachabilityBasis" required placeholder="How this organization can lawfully be reached; record an observed path, not an assumption"></textarea></label>
            <label>Private evidence reference<input name="evidenceRef" required placeholder="Reference to the approved private source"></label>
            <p class="small">Do not enter personal email, phone, or sensitive notes here.</p>
            <button class="button" type="submit">Add identified organization</button>
          </form>` : '<p class="empty">Add a segment first.</p>'}
          ${ws.organizations.length ? `
          <hr>
          <form id="opportunityForm" class="mercury-form">
            <label>Organization<select name="organizationId" required>${organizationOptions}</select></label>
            <label>Offer<select name="offerId" required>${offerOptions}</select></label>
            <p class="small">New opportunities start at IDENTIFIED. Record each observed transition below; paid/active/renewed states are event-derived.</p>
            <label>Private identification evidence reference<input name="evidenceRef" required></label>
            <button class="button secondary" type="submit">Create opportunity</button>
          </form>` : ''}
          <div style="margin-top:1rem">
            <h3>Pipeline</h3>
            ${ws.opportunities.length ? `<ol>${ws.opportunities.map(item => {
              const org = ws.organizations.find(orgItem => orgItem.organizationId === item.organizationId);
              return `<li><strong>${esc(org?.name || item.organizationId)}</strong> — ${esc(item.stage)}</li>`;
            }).join('')}</ol>` : '<p class="empty">No opportunities recorded.</p>'}
          </div>
          ${ws.opportunities.length ? `
          <hr>
          <form id="stageForm" class="mercury-form">
            <h3>Record a pipeline transition</h3>
            <label>Opportunity<select name="opportunityId" required>${opportunityOptions}</select></label>
            <label>Observed stage<select name="stage" required><option>CONTACTED</option><option>CONVERSATION</option><option>QUALIFIED</option><option>OFFERED</option><option>PILOT</option><option>LOST</option></select></label>
            <label>Private evidence reference<input name="evidenceRef" required></label>
            <label>Loss reason<textarea name="lossReason" placeholder="Required only for LOST; record an observed reason, not psychological speculation"></textarea></label>
            <button class="button secondary" type="submit">Record stage transition</button>
          </form>` : ''}
        </section>

        <section class="panel" style="padding:1.25rem">
          <h2>4. Observed interaction</h2>
          ${ws.organizations.length && ws.channels.length ? `
          <form id="interactionForm" class="mercury-form">
            <label>Organization<select name="organizationId" required>${organizationOptions}</select></label>
            <label>Channel<select name="channelId" required>${channelOptions}</select></label>
            <label>Interaction type<select name="interactionType"><option>CONTACT_ATTEMPT</option><option>CONVERSATION</option><option>FOLLOW_UP</option><option>PILOT_REVIEW</option><option>LOSS_REVIEW</option></select></label>
            <label>Outcome<select name="outcome"><option>UNKNOWN</option><option>NO_REPLY</option><option>REPLIED</option><option>QUALIFIED</option><option>DISQUALIFIED</option><option>NEXT_STEP</option><option>NO_INTEREST</option></select></label>
            <label>Observed facts<textarea name="facts" required placeholder="One fact per line. Record what happened, not what you hoped."></textarea></label>
            <fieldset><legend>Objection categories observed</legend>${api.MERCURY_OBJECTION_CATEGORIES.map(category => `<label style="display:block"><input type="checkbox" name="objectionCategories" value="${category}"> ${category.replaceAll('_', ' ')}</label>`).join('')}</fieldset>
            <label>Objection notes<textarea name="objections" placeholder="One observed objection per line; do not infer private motives"></textarea></label>
            <fieldset><legend>Signals supported by this evidence</legend>${api.MERCURY_SIGNALS.map(signal => `<label style="display:block"><input type="checkbox" name="signals" value="${signal}"> ${signal.replaceAll('_', ' ')}</label>`).join('')}</fieldset>
            <label>Private evidence reference<input name="evidenceRef" required placeholder="e.g. private-note-2026-08-25-01"></label>
            <p class="small">A reference is not proof by itself; keep the consented source in your approved private evidence store.</p>
            <button class="button" type="submit">Record interaction</button>
          </form>` : '<p class="empty">Add a buyer/account record and an explicit channel before recording an interaction. Use an UNKNOWN channel record when attribution is genuinely unknown.</p>'}
        </section>

        <section class="panel" style="padding:1.25rem">
          <h2>5. Payment, value, and retention evidence</h2>
          ${ws.organizations.length ? `
          <form id="eventForm" class="mercury-form">
            <label>Organization<select name="organizationId" required>${organizationOptions}</select></label>
            <label>Opportunity<select name="opportunityId" required>${opportunityOptions}</select></label>
            <label>Observed event<select name="eventType"><option>INVOICE_ISSUED</option><option>PAYMENT_COLLECTED</option><option>REFUND</option><option>VALUE_ACHIEVED</option><option>RENEWED</option><option>EXPANDED</option><option>REFERRED</option></select></label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem"><label>Amount<input type="number" min="0" step="0.01" name="amount"></label><label>Currency<input name="currency" value="EUR" pattern="[A-Z]{3}"></label></div>
            <label>Private evidence reference<input name="evidenceRef" required></label>
            <label style="display:block"><input type="checkbox" name="confirmObserved" required> I confirm this event happened and is not a forecast, signed-but-unpaid claim, or synthetic example.</label>
            <button class="button" type="submit">Record observed event</button>
          </form>` : '<p class="empty">No downstream commercial evidence exists.</p>'}
        </section>

        <section class="panel" style="padding:1.25rem">
          <h2>6. Current commercial brief</h2>
          ${ws.segments.length ? ws.segments.map(segment => `
            <article style="border-top:1px solid var(--line);padding:.8rem 0">
              <h3>${esc(segment.name)} <span class="chip sm">${esc(segment.status)}</span></h3>
              <dl>
                <dt>Budget owner</dt><dd>${esc(segment.budgetOwner || 'UNKNOWN')}</dd>
                <dt>Budget source</dt><dd>${esc(segment.budgetSource || 'UNKNOWN')}</dd>
                <dt>Buyer / user roles</dt><dd>${esc(`${segment.buyerRoles.join(', ') || 'UNKNOWN'} / ${segment.userRoles.join(', ') || 'UNKNOWN'}`)}</dd>
                <dt>Why now?</dt><dd>${esc(segment.whyNow)}</dd>
                <dt>Current alternative</dt><dd>${esc(segment.currentAlternatives.join(', ') || 'UNKNOWN')}</dd>
                <dt>Reachability</dt><dd>${esc(segment.reachability)}</dd>
                <dt>Trigger hypotheses</dt><dd>${esc(ws.triggers.filter(item => item.segmentId === segment.segmentId).map(item => item.description).join('; ') || 'UNKNOWN')}</dd>
                <dt>Offer / price hypotheses</dt><dd>${esc(ws.offers.filter(item => item.segmentId === segment.segmentId).map(item => `${item.name}: ${item.price.amount == null ? 'UNKNOWN' : `${item.price.currency} ${item.price.amount}`} ${item.price.basis} [${item.price.evidenceStatus}]`).join('; ') || 'UNKNOWN')}</dd>
                <dt>Channels</dt><dd>${esc(ws.channels.filter(item => item.segmentId === segment.segmentId).map(item => `${item.name} [${item.status}]`).join('; ') || 'UNKNOWN')}</dd>
                <dt>Observed outcomes</dt><dd>${(() => { const item = summary.segmentPerformance.find(candidate => candidate.segmentId === segment.segmentId); return item ? `${item.conversations} conversations · ${item.qualified} ever qualified · ${item.offered} ever offered · ${item.paying} ever paid · ${item.activated} value · ${item.renewed} renewed · ${item.lost} lost` : 'NONE'; })()}</dd>
                <dt>Scale / repeatability</dt><dd>UNKNOWN — counts do not establish a repeatable channel.</dd>
              </dl>
            </article>`).join('') : '<p class="empty">Commercially untested: no segment hypothesis recorded.</p>'}
          <p><strong>Biggest known boundary:</strong> ${summary.netPayingOrganizations ? 'A retained payment exists, but repeatability still requires independent buyers and renewals.' : summary.payingOrganizations ? 'A historical payment is fully refunded; there is no net-paying buyer.' : 'No collected payment evidence is recorded.'}</p>
          <p><strong>Highest-value next human action:</strong> ${esc(nextHumanAction(ws, summary))}</p>
        </section>
      </div>

      <section class="panel" style="padding:1.25rem;margin-top:1rem" aria-labelledby="segment-learning-title">
        <h2 id="segment-learning-title">Segment, objection, and loss learning</h2>
        <p>Counts are shown without conversion percentages while samples are small. Synthetic fixtures are excluded. “Paid” means a historical gross payment event; net collected revenue and refunds are shown separately above.</p>
        ${summary.segmentPerformance.length ? `<div class="table-wrap"><table><thead><tr><th>Segment</th><th>Orgs</th><th>Attempts</th><th>Conversations</th><th>Qualified</th><th>Offered</th><th>Pilots</th><th>Paid</th><th>Value</th><th>Renewed</th><th>Lost</th></tr></thead><tbody>${summary.segmentPerformance.map(item => `<tr><th scope="row">${esc(item.name)}</th><td>${item.organizations}</td><td>${item.contactAttempts}</td><td>${item.conversations}</td><td>${item.qualified}</td><td>${item.offered}</td><td>${item.pilots}</td><td>${item.paying}</td><td>${item.activated}</td><td>${item.renewed}</td><td>${item.lost}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No segment data exists.</p>'}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1rem">
          <div><h3>Observed objection categories</h3>${Object.keys(summary.objectionCounts).length ? `<ul>${Object.entries(summary.objectionCounts).map(([key, value]) => `<li>${esc(key.replaceAll('_', ' '))}: ${value}</li>`).join('')}</ul>` : '<p class="empty">None recorded.</p>'}</div>
          <div><h3>Observed loss reasons</h3>${Object.keys(summary.lossReasonCounts).length ? `<ul>${Object.entries(summary.lossReasonCounts).map(([key, value]) => `<li>${esc(key)}: ${value}</li>`).join('')}</ul>` : '<p class="empty">None recorded.</p>'}</div>
        </div>
      </section>

      <section class="panel" style="padding:1.25rem;margin-top:1rem">
        <h2>Private data portability</h2>
        <p>Export is schema-versioned and may contain private business context. Share it only through an approved private channel. Import validates structure and references before replacing local state.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="button secondary" id="exportMercury" type="button">Export private JSON</button>
          <label class="button secondary" for="importMercury">Import private JSON</label><input id="importMercury" type="file" accept="application/json" class="sr-only">
          <button class="button danger" id="resetMercury" type="button">Reset local Mercury data</button>
        </div>
      </section>`;

    bindHandlers(ws);
  }

  function report(message, isError = false) {
    notice = message;
    const status = document.getElementById('mercuryStatus');
    if (status) status.textContent = `${isError ? 'Error: ' : ''}${message}`;
  }

  function execute(action, success) {
    try {
      action();
      report(success);
      render();
    } catch (error) {
      report(error.message, true);
      render();
    }
  }

  function bindHandlers(ws) {
    document.getElementById('ventureForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const idea = ideas.find(item => item.id === new FormData(event.currentTarget).get('ideaId'));
      const canonicalIdeaRevision = window.VA?.meta?.canonicalSourceRevision || window.VA?.meta?.revisions?.canonicalRevision || null;
      execute(() => store.configureVenture({ canonicalIdeaId: idea.id, canonicalIdeaRevision, ventureName: idea.name }), 'Active venture updated and bound to the loaded canonical source revision. No commercial evidence was created.');
    });
    document.getElementById('segmentForm')?.addEventListener('submit', event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
      execute(() => store.addSegment({ ...data, buyerRoles: list(data.buyerRoles), userRoles: list(data.userRoles), currentAlternatives: list(data.alternatives) }), 'Segment hypothesis added.');
    });
    document.getElementById('triggerForm')?.addEventListener('submit', event => {
      event.preventDefault(); execute(() => store.addTrigger(Object.fromEntries(new FormData(event.currentTarget))), 'Trigger hypothesis added.');
    });
    document.getElementById('channelForm')?.addEventListener('submit', event => {
      event.preventDefault(); execute(() => store.addChannel(Object.fromEntries(new FormData(event.currentTarget))), 'Channel hypothesis added.');
    });
    document.getElementById('offerForm')?.addEventListener('submit', event => {
      event.preventDefault(); execute(() => store.addOffer(Object.fromEntries(new FormData(event.currentTarget))), 'Offer hypothesis added.');
    });
    document.getElementById('organizationForm')?.addEventListener('submit', event => {
      event.preventDefault(); execute(() => store.addOrganization(Object.fromEntries(new FormData(event.currentTarget))), 'Organization recorded. It is not a customer unless payment is evidenced.');
    });
    document.getElementById('opportunityForm')?.addEventListener('submit', event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
      const org = ws.organizations.find(item => item.organizationId === data.organizationId);
      execute(() => store.addOpportunity({ ...data, segmentId: org.segmentId }), 'Opportunity created at IDENTIFIED.');
    });
    document.getElementById('interactionForm')?.addEventListener('submit', event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); const data = Object.fromEntries(form);
      const org = ws.organizations.find(item => item.organizationId === data.organizationId);
      execute(() => store.recordInteraction({ ...data, segmentId: org.segmentId, facts: list(data.facts), objections: list(data.objections), objectionCategories: form.getAll('objectionCategories'), signals: form.getAll('signals') }), 'Observed interaction recorded.');
    });
    document.getElementById('stageForm')?.addEventListener('submit', event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
      execute(() => store.advanceOpportunity(data.opportunityId, data.stage, data.evidenceRef, data.lossReason), `Opportunity moved to ${data.stage}.`);
    });
    document.getElementById('eventForm')?.addEventListener('submit', event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
      execute(() => store.recordCommercialEvent(data), 'Observed commercial event recorded and scoreboard recomputed.');
    });
    document.getElementById('exportMercury')?.addEventListener('click', () => {
      const blob = new Blob([store.exportJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `${ws.workspaceId}.json`; anchor.click(); URL.revokeObjectURL(url);
      report('Private Mercury export created.');
    });
    document.getElementById('importMercury')?.addEventListener('change', async event => {
      const file = event.target.files?.[0]; if (!file) return;
      try { store.importJson(await file.text()); report('Private Mercury export imported.'); render(); }
      catch (error) { report(`Import rejected: ${error.message}`, true); render(); }
    });
    document.getElementById('resetMercury')?.addEventListener('click', () => {
      if (!window.confirm('Delete the Mercury workspace stored in this browser? Export first if you need a backup.')) return;
      store.reset(); report('Local Mercury workspace reset.'); render();
    });
  }

  render();
}

if (typeof window !== 'undefined') window.initMercuryLab = initMercuryLab;
if (typeof module !== 'undefined' && module.exports) module.exports = { initMercuryLab };
