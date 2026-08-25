const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const {
  MercuryStore,
  validateMercuryWorkspace,
  migrateMercuryWorkspace,
  summarizeMercury,
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
  assert.equal(store.getSummary().pilots, 0, 'payment from OFFERED does not fabricate a pilot stage');

  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'PAYMENT_COLLECTED', amount: 500, currency: 'EUR', evidenceRef: 'repeat-payment-001' });
  assert.equal(store.getWorkspace().opportunities[0].stage, 'RENEWED', 'later payments cannot move lifecycle backward');
  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'VALUE_ACHIEVED', evidenceRef: 'repeat-value-001' });
  assert.equal(store.getWorkspace().opportunities[0].stage, 'RENEWED', 'later value events cannot move lifecycle backward');
  store.recordCommercialEvent({ organizationId: org.organizationId, opportunityId: opportunity.opportunityId, eventType: 'REFUND', amount: 1000, currency: 'EUR', evidenceRef: 'full-refund-001' });
  const refunded = store.getSummary();
  assert.equal(refunded.payingOrganizations, 1, 'historical gross payment remains auditable');
  assert.equal(refunded.netPayingOrganizations, 0, 'fully refunded buyer is not currently net-paying');
  assert.equal(refunded.refundedOrganizations, 1);
  assert.equal(refunded.revenueCollected.EUR, 0);
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

test('runtime import validation stays aligned with the strict JSON Schema on adversarial shapes', () => {
  const { store } = harness();
  segment(store);
  const base = store.getWorkspace();
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'schemas', 'mercury-workspace.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateSchema = ajv.compile(schema);
  assert.deepEqual(validateMercuryWorkspace(base), []);
  assert.equal(validateSchema(base), true);

  const mutations = [
    value => { delete value.workspaceId; },
    value => { value.ventureName = 42; },
    value => { value.segments[0].buyerRoles = 'not-an-array'; },
    value => { value.segments[0].currentAlternatives = null; },
    value => { value.segments[0].reachability = 'TELEPATHY'; },
    value => { value.segments[0].status = 'FABRICATED_ENUM'; },
    value => { value.segments[0].unexpected = 'smuggled'; },
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(base);
    mutate(candidate);
    assert.ok(validateMercuryWorkspace(candidate).length > 0);
    assert.equal(validateSchema(candidate), false);
    assert.throws(() => store.importJson(candidate));
  }
});

test('commercial state cannot be relabeled as a different canonical venture', () => {
  const { store } = harness();
  store.configureVenture({ canonicalIdeaId: 'idea-061', canonicalIdeaRevision: 'rev-a', ventureName: 'Venture A' });
  segment(store);
  assert.throws(() => store.configureVenture({ canonicalIdeaId: 'idea-062', canonicalIdeaRevision: 'rev-b', ventureName: 'Venture B' }), /cannot switch ventures/);
  assert.equal(store.getWorkspace().canonicalIdeaId, 'idea-061');
  assert.equal(store.getWorkspace().ventureName, 'Venture A');
});

test('invalid transitions and unsupported signals fail without mutating in-memory state', () => {
  const { store } = harness();
  const s = segment(store);
  const channel = store.addChannel({ segmentId: s.segmentId, name: 'Observed channel' });
  const org = organization(store, s, 'Mutation Guard Buyer');
  const opportunity = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, evidenceRef: 'identified-guard' });
  assert.throws(() => store.advanceOpportunity(opportunity.opportunityId, 'LOST', '', 'Observed loss'), /evidenceRef/);
  assert.equal(store.getWorkspace().opportunities[0].stage, 'IDENTIFIED');
  assert.throws(() => store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONTACT_ATTEMPT',
    outcome: 'NO_REPLY',
    facts: ['No reply was received.'],
    signals: ['COMMITMENT_MADE'],
    evidenceRef: 'no-reply-001',
  }), /cannot carry confirmed commercial signals/);
  assert.equal(store.getWorkspace().interactions.length, 0);
  assert.throws(() => store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    interactionType: 'CONVERSATION',
    outcome: 'QUALIFIED',
    facts: ['Channel omitted.'],
    evidenceRef: 'missing-channel',
  }), /unknown channelId/);
});

test('ever-reached funnel stages survive loss while pilot remains explicit', () => {
  const { store } = harness();
  const s = segment(store);
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Concrete offer', deliverable: 'Bounded outcome' });
  const org = organization(store, s, 'Loss Funnel Buyer');
  const opportunity = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'identified-loss-funnel' });
  progressToOffer(store, s, org, opportunity);
  store.advanceOpportunity(opportunity.opportunityId, 'LOST', 'loss-review-001', 'Procurement timing');
  const summary = store.getSummary();
  assert.equal(summary.qualified, 1);
  assert.equal(summary.offered, 1);
  assert.equal(summary.pilots, 0);
  assert.equal(summary.lostOpportunities, 1);
  assert.equal(store.getWorkspace().organizations[0].commercialStage, 'LOST');
});

test('legacy 1.0 workspaces migrate without earning reachability until human review', () => {
  const { store } = harness();
  const s = segment(store);
  const channel = store.addChannel({ segmentId: s.segmentId, name: 'Legacy channel' });
  const org = organization(store, s, 'Legacy Buyer');
  store.recordInteraction({
    organizationId: org.organizationId,
    segmentId: s.segmentId,
    channelId: channel.channelId,
    interactionType: 'CONVERSATION',
    outcome: 'UNKNOWN',
    facts: ['Legacy observation.'],
    evidenceRef: 'legacy-note',
  });
  const legacy = store.getWorkspace();
  legacy.schemaVersion = '1.0.0';
  delete legacy.segments[0].parentSegmentId;
  delete legacy.segments[0].budgetOwner;
  delete legacy.segments[0].budgetSource;
  delete legacy.organizations[0].actorType;
  delete legacy.organizations[0].reachabilityBasis;
  delete legacy.organizations[0].evidenceRef;
  delete legacy.organizations[0].evidenceClass;
  legacy.interactions[0].channelId = null;
  delete legacy.interactions[0].objectionCategories;
  const migrated = migrateMercuryWorkspace(legacy);
  assert.equal(migrated.schemaVersion, '1.1.0');
  assert.deepEqual(validateMercuryWorkspace(migrated), []);
  assert.equal(migrated.organizations[0].evidenceClass, 'UNVERIFIED_LEGACY');
  assert.equal(summarizeMercury(migrated).evidence.code, 'C0');
  assert.equal(summarizeMercury(migrated).unverifiedLegacyOrganizations, 1);

  const destination = harness().store;
  destination.importJson(migrated);
  destination.attestOrganizationReachability(org.organizationId, 'Reviewed lawful channel', 'reviewed-private-ref');
  assert.equal(destination.getSummary().evidence.code, 'C1');
  assert.equal(destination.getSummary().unverifiedLegacyOrganizations, 0);
});

test('buyer/account cascade deletion removes dependent private history', () => {
  const { store } = harness();
  const s = segment(store);
  const offer = store.addOffer({ segmentId: s.segmentId, name: 'Deletion offer', deliverable: 'Deletion test' });
  const org = organization(store, s, 'Delete Me Buyer');
  const opportunity = store.addOpportunity({ organizationId: org.organizationId, segmentId: s.segmentId, offerId: offer.offerId, evidenceRef: 'delete-id' });
  progressToOffer(store, s, org, opportunity);
  const impact = store.deleteOrganization(org.organizationId);
  assert.equal(impact.organizations, 1);
  assert.ok(impact.interactions > 0);
  assert.equal(store.getWorkspace().organizations.length, 0);
  assert.equal(store.getWorkspace().interactions.length, 0);
  assert.equal(store.getWorkspace().opportunities.length, 0);
  assert.equal(store.getSummary().evidence.code, 'C0');
});

test('storage read failure produces an explicit recovery warning instead of crashing', () => {
  const store = new MercuryStore({
    storage: { getItem() { throw new Error('storage blocked'); } },
    clock: () => '2026-08-25T10:00:00Z',
    idFactory: prefix => `${prefix}-read-failure`,
  });
  assert.match(store.getRecoveryWarning(), /storage blocked/);
  assert.equal(store.getSummary().evidence.code, 'C0');
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
