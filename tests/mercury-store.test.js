const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MercuryStore,
  validateMercuryWorkspace,
  studioStorageAdapter,
} = require('../assets/js/core/mercury-store');

function harness() {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  let sequence = 0;
  const store = new MercuryStore({
    storage,
    clock: () => '2026-08-25T10:00:00Z',
    idFactory: prefix => `${prefix}-test-${++sequence}`,
  });
  return { store, storage };
}

function segment(store) {
  return store.addSegment({
    name: 'EU operators with a current filing deadline',
    description: 'A bounded, reachable operating segment.',
    buyerRoles: ['operations director'],
    userRoles: ['compliance analyst'],
    whyNow: 'A filing deadline is active.',
    currentAlternatives: ['spreadsheet'],
    reachability: 'MEDIUM',
  });
}

function organization(store, s, name, recordClass = 'REAL') {
  return store.addOrganization({
    name,
    segmentId: s.segmentId,
    recordClass,
    reachabilityBasis: recordClass === 'REAL' ? 'Public company channel observed.' : 'Synthetic fixture only.',
    evidenceRef: recordClass === 'REAL' ? `private-org-ref-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'synthetic-fixture',
  });
}

function progressToOffer(store, s, org, opportunity) {
  const channel = store.getWorkspace().channels.find(item => item.segmentId === s.segmentId)
    || store.addChannel({ segmentId: s.segmentId, name: 'Permission-respecting test channel' });
  store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONTACT_ATTEMPT',
    outcome: 'REPLIED',
    facts: ['A permission-respecting contact attempt received a reply.'],
    evidenceRef: `contact-${opportunity.opportunityId}`,
  });
  store.advanceOpportunity(opportunity.opportunityId, 'CONTACTED', `contact-${opportunity.opportunityId}`);
  store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONVERSATION',
    outcome: 'QUALIFIED',
    facts: ['A human recorded a qualified commercial conversation.'],
    evidenceRef: `conversation-${opportunity.opportunityId}`,
  });
  store.advanceOpportunity(opportunity.opportunityId, 'CONVERSATION', `conversation-${opportunity.opportunityId}`);
  store.advanceOpportunity(opportunity.opportunityId, 'QUALIFIED', `qualification-${opportunity.opportunityId}`);
  store.advanceOpportunity(opportunity.opportunityId, 'OFFERED', `proposal-${opportunity.opportunityId}`);
}

test('fresh Mercury workspace is empty and commercially C0', () => {
  const { store } = harness();
  const summary = store.getSummary();
  assert.equal(summary.evidence.code, 'C0');
  assert.equal(summary.identifiedOrganizations, 0);
  assert.equal(summary.conversations, 0);
  assert.equal(summary.payingOrganizations, 0);
  assert.deepEqual(summary.revenueCollected, {});
});

test('synthetic fixtures never become commercial evidence', () => {
  const { store } = harness();
  const s = segment(store);
  const synthetic = organization(store, s, 'Synthetic Co', 'SYNTHETIC');
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Synthetic offer', deliverable: 'Fixture only' });
  const opportunity = store.addOpportunity({ organizationId: synthetic.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'fixture-only' });
  progressToOffer(store, s, synthetic, opportunity);
  store.advanceOpportunity(opportunity.opportunityId, 'PILOT', 'synthetic-pilot-only');
  assert.equal(store.getSummary().evidence.code, 'C0');
  assert.equal(store.getSummary().identifiedOrganizations, 0);
  assert.equal(store.getSummary().pilots, 0);
});

test('objection and loss analytics are derived from real records by segment', () => {
  const { store } = harness();
  const s = segment(store);
  const org = organization(store, s, 'Observed Buyer');
  const channel = store.addChannel({ segmentId: s.segmentId, name: 'Observed channel' });
  const opportunity = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, evidenceRef: 'identified-loss-001' });
  store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONVERSATION',
    outcome: 'NO_INTEREST',
    facts: ['Buyer said the deadline was not funded.'],
    objections: ['No approved budget this quarter.'],
    objectionCategories: ['BUDGET', 'TIMING'],
    evidenceRef: 'private-note-loss-001',
  });
  store.advanceOpportunity(opportunity.opportunityId, 'LOST', 'private-note-loss-001', 'No approved budget this quarter');

  const summary = store.getSummary();
  assert.deepEqual(summary.objectionCounts, { BUDGET: 1, TIMING: 1 });
  assert.deepEqual(summary.lossReasonCounts, { 'No approved budget this quarter': 1 });
  assert.equal(summary.segmentPerformance[0].conversations, 1);
  assert.equal(summary.segmentPerformance[0].lost, 1);
});

test('interaction signals advance only their explicit evidence rung', () => {
  const { store } = harness();
  const s = segment(store);
  const channel = store.addChannel({ segmentId: s.segmentId, name: 'Warm referral' });
  const org = organization(store, s, 'Example Buyer Ltd');
  assert.equal(store.getSummary().evidence.code, 'C1');

  store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONVERSATION',
    outcome: 'NEXT_STEP',
    facts: ['Buyer described a recent incident.'],
    signals: ['PROBLEM_CONFIRMED', 'WORKAROUND_CONFIRMED', 'URGENCY_CONFIRMED', 'EVALUATION_ACCEPTED', 'OFFER_ACCEPTED', 'COMMITMENT_MADE'],
    evidenceRef: 'private-note-001',
  });
  const summary = store.getSummary();
  assert.equal(summary.evidence.code, 'C7');
  assert.equal(summary.conversations, 1);
  assert.equal(summary.payingOrganizations, 0);
});

test('invoice is not revenue and payment/value/renewal are separately derived', () => {
  const { store } = harness();
  const s = segment(store);
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Paid pilot', deliverable: 'One bounded evidence review', amount: 500, currency: 'EUR' });
  const org = organization(store, s, 'Buyer GmbH');
  const opportunity = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'identified-001' });
  progressToOffer(store, s, org, opportunity);

  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'INVOICE_ISSUED', evidenceRef: 'invoice-001' });
  assert.equal(store.getSummary().evidence.code, 'C1');
  assert.deepEqual(store.getSummary().revenueCollected, {});
  assert.throws(() => store.recordCommercialEvent({ organizationId: org.organizationId, eventType: 'PAYMENT_COLLECTED', amount: 0, currency: 'EUR', evidenceRef: 'payment-000' }), /positive amount/);

  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'PAYMENT_COLLECTED', amount: 500, currency: 'EUR', evidenceRef: 'payment-001' });
  assert.equal(store.getSummary().evidence.code, 'C8');
  assert.equal(store.getSummary().revenueCollected.EUR, 500);
  assert.equal(store.getWorkspace().opportunities[0].stage, 'PAID');

  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'VALUE_ACHIEVED', evidenceRef: 'activation-001' });
  assert.equal(store.getSummary().evidence.code, 'C9');
  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'RENEWED', amount: 500, currency: 'EUR', evidenceRef: 'renewal-001' });
  assert.equal(store.getSummary().evidence.code, 'C10');
  assert.equal(store.getSummary().revenueCollected.EUR, 500, 'renewal event is not double-counted as collected revenue without a payment event');
});

test('cross-organization events and out-of-sequence maturity claims fail closed', () => {
  const { store } = harness();
  const s = segment(store);
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Pilot', deliverable: 'Review', amount: 100, currency: 'EUR' });
  const orgA = organization(store, s, 'Buyer A');
  const orgB = organization(store, s, 'Buyer B');
  const opportunityB = store.addOpportunity({ organizationId: orgB.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'identified-b' });
  progressToOffer(store, s, orgB, opportunityB);

  assert.throws(() => store.recordCommercialEvent({
    organizationId: orgA.organizationId,
    opportunityId: opportunityB.opportunityId,
    eventType: 'PAYMENT_COLLECTED',
    amount: 1,
    currency: 'EUR',
    evidenceRef: 'trust-me',
  }), /another organization/);
  assert.throws(() => store.recordCommercialEvent({
    organizationId: orgA.organizationId,
    eventType: 'REFERRED',
    evidenceRef: 'standalone-referral',
  }), /requires an opportunity/);
  assert.equal(store.getSummary().evidence.code, 'C1');
  assert.equal(store.getSummary().payingOrganizations, 0);
});

test('payment, value, refunds, and maturity remain scoped to one opportunity and currency', () => {
  const { store } = harness();
  const s = segment(store);
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Pilot', deliverable: 'Review', amount: 100, currency: 'EUR' });
  const org = organization(store, s, 'Buyer A');
  const first = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'identified-first' });
  const second = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'identified-second' });
  progressToOffer(store, s, org, first);
  progressToOffer(store, s, org, second);
  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: first.opportunityId, eventType: 'PAYMENT_COLLECTED', amount: 100, currency: 'EUR', evidenceRef: 'payment-first' });

  assert.throws(() => store.recordCommercialEvent({
    organizationId: org.organizationId,
    opportunityId: second.opportunityId,
    eventType: 'VALUE_ACHIEVED',
    evidenceRef: 'value-second-without-payment',
  }), /this opportunity/);
  assert.throws(() => store.recordCommercialEvent({
    organizationId: org.organizationId,
    opportunityId: first.opportunityId,
    eventType: 'REFUND',
    amount: 100,
    currency: 'USD',
    evidenceRef: 'wrong-currency-refund',
  }), /exceeds prior collected payment/);
  assert.equal(store.getSummary().evidence.code, 'C8');
});

test('import rejects broken references and unearned paid pricing claims', () => {
  const { store } = harness();
  const s = segment(store);
  store.addOffer({ segmentId: s.segmentId, name: 'Pilot', deliverable: 'Review', amount: 100, currency: 'EUR' });
  const valid = store.getWorkspace();
  assert.deepEqual(validateMercuryWorkspace(valid), []);

  const broken = structuredClone(valid);
  broken.offers[0].price.evidenceStatus = 'PAID';
  assert.throws(() => store.importJson(broken), /cannot claim PAID/);
  assert.equal(store.getWorkspace().offers[0].price.evidenceStatus, 'HYPOTHESIS');
});

test('Studio adapter persists Mercury inside the existing decision packet workspace', () => {
  let mercury = null;
  const studio = {
    getMercuryWorkspace: () => mercury,
    setMercuryWorkspace: value => { mercury = value; return true; },
  };
  const adapter = studioStorageAdapter(studio);
  adapter.setItem('ignored', JSON.stringify({ schemaVersion: '1.0.0' }));
  assert.equal(JSON.parse(adapter.getItem('ignored')).schemaVersion, '1.0.0');
  adapter.removeItem('ignored');
  assert.equal(adapter.getItem('ignored'), null);
});
