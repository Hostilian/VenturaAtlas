const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePhaseShift } = require('../scripts/validate-phaseshift');
const { validateFunnel, deriveFunnel } = require('../scripts/validate-validation-funnel');

const eligibleSource = { visibility: 'PUBLIC', evidenceEligible: true, sourceClass: 'PRIMARY_OR_OFFICIAL' };
const context = {
  ideaIds: new Set(['idea-001']), dependencyIds: new Set(['dep-one']), ecosystemIds: new Set(['eco-one']),
  sourceById: new Map([['src-one', eligibleSource], ['src-two', eligibleSource]]),
  counterpartyById: new Map([['cp-one', { parties: [
    { role: 'buyer', mustParticipate: true, readiness: 'READY' },
    { role: 'supplier', mustParticipate: true, readiness: 'NOT_READY' }
  ]}]])
};

function market() {
  return { marketId: 'market-one', name: 'One market', phase: 'P2_PREPARATION', phaseConfidence: 'MEDIUM', status: 'ACTIVE', waitTrigger: null,
    valueNow: ['READINESS'], valueNext: ['EXCEPTION_HANDLING'], informationValue: 'HIGH', currentStartupValue: 'MEDIUM',
    observedAt: '2026-08-12T10:00:00Z', dependencyRefs: ['dep-one'], ecosystemRefs: ['eco-one'], ideaRefs: ['idea-001'], sourceRefs: ['src-one'] };
}
function state() { return { schemaVersion: '1.0.0', markets: [market()], phaseTransitions: [], enforcementEvents: [], intermediaryAssessments: [], milestones: [], milestoneEdges: [], sourceConflicts: [], counterpartyDeadlocks: [] }; }

test('non-linear P2 to P4 transition is explicit and allowed as SKIP', () => {
  const value = state();
  value.phaseTransitions.push({ transitionId: 'phase-one', marketId: 'market-one', from: 'P2_PREPARATION', to: 'P4_CUTOVER', transitionKind: 'SKIP', observedAt: '2026-08-12T10:00:00Z', effectiveAt: null, sourceRefs: ['src-one'], affectedIdeaRefs: ['idea-001'], reassessmentRequired: true });
  assert.deepEqual(validatePhaseShift(value, context), []);
});

test('affected transition idea must have explicit market edge', () => {
  const value = state(); context.ideaIds.add('idea-002');
  value.phaseTransitions.push({ transitionId: 'phase-one', marketId: 'market-one', from: 'P2_PREPARATION', to: 'P3_MIGRATION', transitionKind: 'ADVANCE', observedAt: '2026-08-12T10:00:00Z', effectiveAt: null, sourceRefs: ['src-one'], affectedIdeaRefs: ['idea-002'], reassessmentRequired: true });
  assert(validatePhaseShift(value, context).some(error => error.includes('not linked to market')));
  context.ideaIds.delete('idea-002');
});

test('provider count alone cannot infer saturation', () => {
  const value = state();
  value.intermediaryAssessments.push({ assessmentId: 'intermediary-one', marketId: 'market-one', saturation: 'SATURATED', providerCount: 100, asOf: '2026-08-12T10:00:00Z', approvalBarrier: 'UNKNOWN', switchingAbility: 'UNKNOWN', interoperability: 'UNKNOWN', specialization: 'UNKNOWN', concentration: 'UNKNOWN', sourceRefs: ['src-one'], ideaRefs: ['idea-001'] });
  assert(validatePhaseShift(value, context).some(error => error.includes('provider count alone')));
});

test('milestone dependency graph rejects cycles without flattening dates', () => {
  const value = state();
  value.milestones = [
    { milestoneId: 'milestone-a', marketId: 'market-one', kind: 'API_OPENS', label: 'API opens', date: '2027-01-01T00:00:00Z', certainty: 'ANNOUNCED', buyerImplication: 'Integration can begin', sourceRefs: ['src-one'] },
    { milestoneId: 'milestone-b', marketId: 'market-one', kind: 'FULL_OPERATION', label: 'Full operation', date: '2028-01-01T00:00:00Z', certainty: 'EXPECTED', buyerImplication: 'Exceptions become observable', sourceRefs: ['src-two'] }
  ];
  value.milestoneEdges = [
    { edgeId: 'milestone-edge-a-b', from: 'milestone-a', to: 'milestone-b', relation: 'PRECEDES' },
    { edgeId: 'milestone-edge-b-a', from: 'milestone-b', to: 'milestone-a', relation: 'ENABLES' }
  ];
  assert(validatePhaseShift(value, context).some(error => error.includes('cycle')));
});

test('unknown readiness cannot be promoted into active deadlock', () => {
  const value = state();
  const unknownContext = { ...context, counterpartyById: new Map([['cp-one', { parties: [{ role: 'buyer', mustParticipate: true, readiness: 'UNKNOWN' }, { role: 'supplier', mustParticipate: true, readiness: 'UNKNOWN' }] }]]) };
  value.counterpartyDeadlocks.push({ deadlockId: 'deadlock-one', marketId: 'market-one', counterpartyAssessmentRef: 'cp-one', requiredRoles: ['buyer','supplier'], simultaneousReadinessRequired: true, leastReadyCriticalRole: 'supplier', buyerCanCompel: false, status: 'ACTIVE', observedAt: '2026-08-12T10:00:00Z', sourceRefs: ['src-one'], ideaRefs: ['idea-001'] });
  assert(validatePhaseShift(value, unknownContext).some(error => error.includes('unknown readiness')));
});

test('resolved source conflict preserves both positions and resolution evidence', () => {
  const value = state();
  value.sourceConflicts.push({ conflictId: 'conflict-one', marketId: 'market-one', claim: 'Operational date', positions: [
    { sourceRef: 'src-one', position: 'Interface available', publishedAt: null, updatedAt: null, effectiveAt: '2027-01-01T00:00:00Z', retrievedAt: '2026-08-12T10:00:00Z' },
    { sourceRef: 'src-two', position: 'Full workflow available', publishedAt: null, updatedAt: null, effectiveAt: '2028-01-01T00:00:00Z', retrievedAt: '2026-08-12T10:00:00Z' }
  ], difference: 'Different operational milestones', explanationHypothesis: 'Sources describe different layers', status: 'RESOLVED', resolution: 'Preserve two distinct milestones', resolutionSourceRefs: ['src-one','src-two'], resolvedAt: '2026-08-12T11:00:00Z' });
  assert.deepEqual(validatePhaseShift(value, context), []);
});

test('funnel rejects external and revenue claims without appropriate receipts', () => {
  const events = [];
  const states = ['GENERATED','DEDUPED','STAGED','DESK_RESEARCHED','COMMERCIAL_RESEARCHED','APPROVED_FOR_VALIDATION','CONTACTED','INTERVIEWED'];
  states.forEach((to, index) => events.push({ eventId: `funnel-event-${index}`, funnelId: 'funnel-one', lineageRef: 'lineage-one', ideaId: 'idea-001', from: index ? states[index - 1] : 'NONE', to, predecessorEventId: index ? `funnel-event-${index - 1}` : null, occurredAt: `2026-08-12T10:0${index}:00Z`, evidenceRefs: [], validationRunRefs: [], externalOutcome: to === 'INTERVIEWED', moneyCost: 0, currency: 'EUR', founderMinutes: 1, cashCollected: to === 'INTERVIEWED' ? 100 : 0 }));
  const errors = validateFunnel({ schemaVersion: '1.0.0', events }, { ideaIds: new Set(['idea-001']), validationRunsById: new Map() });
  assert(errors.some(error => error.includes('external state lacks')));
  assert(errors.some(error => error.includes('revenue lacks')));
});

test('funnel aggregates recompute from append-only events', () => {
  const events = [{ eventId: 'funnel-event-a', funnelId: 'funnel-one', lineageRef: 'l', ideaId: 'idea-001', from: 'NONE', to: 'GENERATED', predecessorEventId: null, occurredAt: '2026-08-12T10:00:00Z', evidenceRefs: [], validationRunRefs: [], externalOutcome: false, moneyCost: 12, currency: 'EUR', founderMinutes: 5, cashCollected: 0 }];
  assert.deepEqual(deriveFunnel(events), { current: { 'funnel-one': 'GENERATED' }, transitions: { GENERATED: 1, DEDUPED: 0, STAGED: 0, DESK_RESEARCHED: 0, COMMERCIAL_RESEARCHED: 0, APPROVED_FOR_VALIDATION: 0, CONTACTED: 0, INTERVIEWED: 0, DESIGN_PARTNER: 0, PAID_PILOT: 0, REPEAT_PAYMENT: 0 }, moneyCost: 12, founderMinutes: 5, cashCollected: 0, netValidationCost: 12 });
});
