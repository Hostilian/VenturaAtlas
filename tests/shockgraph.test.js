const test = require('node:test');
const assert = require('node:assert/strict');
const schema = require('../schemas/shockgraph.schema.json');
const { validateShockgraph, buildShockgraphReport } = require('../scripts/validate-shockgraph');

function fixture() {
  return {
    schemaVersion: '1.0.0',
    dependencies: [{
      dependencyId: 'dep-rule-one', type: 'REGULATION', name: 'Rule One', status: 'ADOPTED',
      checkedAt: '2026-08-12T10:00:00Z', sourceRefs: ['s01'], ideaRefs: ['idea-001', 'idea-002'], volatility: 'HIGH'
    }],
    shocks: [{
      shockId: 'shock-rule-delay', dependencyId: 'dep-rule-one', kind: 'APPLICATION_DELAY',
      observedAt: '2026-08-12T10:00:00Z', effectiveAt: '2027-01-01T00:00:00Z', sourceRefs: ['s01'],
      affectedIdeaRefs: ['idea-001'], direction: 'NEGATIVE', reviewRequired: true
    }],
    obligations: [
      { obligationId: 'obl-rule-a', instrumentId: 'rule-one', actor: 'manufacturer', object: 'product', action: 'record', scope: 'large firms', effectiveAt: '2027-01-01T00:00:00Z', maturity: 'ADOPTED', secondaryLegislationPending: false, exemptions: ['micro firms'], sourceRefs: ['s01'], ideaRefs: ['idea-001'] },
      { obligationId: 'obl-rule-b', instrumentId: 'rule-one', actor: 'platform', object: 'report', action: 'submit', scope: 'covered products', effectiveAt: '2028-01-01T00:00:00Z', maturity: 'SECONDARY_ACT_PENDING', secondaryLegislationPending: true, sourceRefs: ['s01'], ideaRefs: ['idea-002'] }
    ],
    ecosystems: [{ ecosystemId: 'eco-rule-api', name: 'Rule API', topology: 'CENTRAL_PUBLIC_API', providerDensity: 'EMERGING', stage: 'PREPARATION', sourceRefs: ['s01'], ideaRefs: ['idea-001'] }],
    counterpartyAssessments: [{
      assessmentId: 'cp-idea-one', ideaId: 'idea-001', coordinationTax: 'HIGH', weakestCriticalParty: 'supplier', sourceRefs: [],
      parties: [{ role: 'supplier', mustParticipate: true, canBeForced: null, controlsData: true, controlsDecision: false, controlsBudget: false, readiness: 'UNKNOWN' }]
    }]
  };
}

const context = { schema, ideaIds: new Set(['idea-001', 'idea-002', 'idea-003']), sourceIds: new Set(['s01']) };

test('valid explicit graph supports multi-date obligations and unknown readiness', () => {
  assert.deepEqual(validateShockgraph(fixture(), context), []);
});

test('blast radius cannot expand beyond explicit dependency edges', () => {
  const graph = fixture();
  graph.shocks[0].affectedIdeaRefs.push('idea-003');
  assert.ok(validateShockgraph(graph, context).some(error => error.includes('non-edge idea')));
});

test('shocks queue review and do not contain score or decision mutation', () => {
  const graph = fixture();
  assert.equal(graph.shocks[0].reviewRequired, true);
  assert.equal('scoreDelta' in graph.shocks[0], false);
  assert.equal('decision' in graph.shocks[0], false);
});

test('concentration report uses explicit edges and reports mapping coverage', () => {
  const report = buildShockgraphReport(fixture(), 3);
  assert.equal(report.dependencies[0].ideaCount, 2);
  assert.equal(report.counts.mappedIdeas, 2);
  assert.equal(report.mappingCoverage, 2 / 3);
});
