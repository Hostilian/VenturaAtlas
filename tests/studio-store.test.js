const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { mercuryWorkspace, MercuryStore } = require('../assets/js/core/mercury-store.js');

// Mock localStorage for Node.js test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

const { StudioStore, STAGES, NOTE_TYPES, SCORE_DIMENSIONS } = require('../assets/js/core/studio-store.js');

function legacyMercuryFixture() {
  let sequence = 0;
  const memory = new Map();
  const store = new MercuryStore({
    storage: {
      getItem: key => memory.get(key) || null,
      setItem: (key, value) => memory.set(key, String(value)),
      removeItem: key => memory.delete(key),
    },
    clock: () => '2026-08-25T10:00:00Z',
    idFactory: prefix => `${prefix}-studio-legacy-${++sequence}`,
  });
  const segment = store.addSegment({ name: 'Legacy segment', description: 'A pre-1.1 buyer segment.' });
  store.addOrganization({
    name: 'Legacy buyer record',
    segmentId: segment.segmentId,
    reachabilityBasis: 'Legacy basis that must be reviewed',
    evidenceRef: 'legacy-private-ref',
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
  return legacy;
}

test('StudioStore — Initialization and User Profile', () => {
  mockStorage.clear();
  const store = new StudioStore();
  
  const user = store.getUser();
  assert.ok(user.uid.startsWith('usr_'), 'User UID must have prefix usr_');
  assert.equal(user.displayName, 'Local user', 'Default display name must not invent a founder persona');
  assert.ok(user.color, 'User should have a display color');

  const defaultWorkspace = store.getWorkspace();
  assert.equal(defaultWorkspace.shortlist.length, 0, 'First-run workspace must not preselect ideas');

  store.setUser({ displayName: 'Alex Rivera', color: 'hsl(210, 80%, 50%)' });
  const updatedUser = store.getUser();
  assert.equal(updatedUser.displayName, 'Alex Rivera');
  assert.equal(updatedUser.color, 'hsl(210, 80%, 50%)');
});

test('StudioStore — Mercury state round-trips inside the existing decision packet', () => {
  mockStorage.clear();
  const store = new StudioStore();
  const mercury = mercuryWorkspace({
    now: '2026-08-25T10:00:00Z',
    workspaceId: 'mercury-test',
    canonicalIdeaId: 'idea-061',
    canonicalIdeaRevision: '934fffd425b1fce6',
    ventureName: 'FactBounty — Buyer-Funded Product Proof Exchange',
  });
  assert.equal(store.setMercuryWorkspace(mercury), true);
  const packet = store.exportDecisionPacket();
  mockStorage.clear();
  const imported = new StudioStore();
  const result = imported.importDecisionPacket(packet);
  assert.equal(result.success, true);
  assert.equal(imported.getMercuryWorkspace().workspaceId, 'mercury-test');
});

test('StudioStore — legacy Mercury migrates at packet-import and persisted-storage boundaries', () => {
  mockStorage.clear();
  const source = new StudioStore();
  const legacy = legacyMercuryFixture();
  const packet = { schemaVersion: '3.0.0', workspace: { ...source.getWorkspace(), mercury: legacy } };

  mockStorage.clear();
  const imported = new StudioStore();
  const result = imported.importDecisionPacket(packet);
  assert.equal(result.success, true);
  assert.equal(imported.getMercuryWorkspace().schemaVersion, '1.1.0');
  assert.equal(imported.getMercuryWorkspace().organizations[0].evidenceClass, 'UNVERIFIED_LEGACY');

  mockStorage.clear();
  mockStorage.set('va_workspace_v3', JSON.stringify({ ...source.getWorkspace(), mercury: legacy }));
  const loaded = new StudioStore();
  assert.equal(loaded.getMercuryWorkspace().schemaVersion, '1.1.0');
  assert.equal(loaded.getMercuryWorkspace().organizations[0].evidenceClass, 'UNVERIFIED_LEGACY');
  assert.equal(JSON.parse(mockStorage.get('va_workspace_v3')).mercury.schemaVersion, '1.1.0');
});

test('StudioStore — invalid or unpersistable Mercury state fails closed', () => {
  mockStorage.clear();
  const studio = new StudioStore();
  const invalid = mercuryWorkspace({ now: '2026-08-25T10:00:00Z', workspaceId: 'mercury-invalid' });
  invalid.unexpected = 'private-data-smuggling';
  assert.equal(studio.setMercuryWorkspace(invalid), false);
  assert.equal(studio.getMercuryWorkspace(), null);

  const originalSetItem = global.localStorage.setItem;
  global.localStorage.setItem = () => { throw new Error('quota denied'); };
  const mercuryStore = new MercuryStore({
    studioStore: studio,
    clock: () => '2026-08-25T10:00:00Z',
    idFactory: prefix => `${prefix}-quota-test`,
  });
  assert.throws(() => mercuryStore.addSegment({
    name: 'Should roll back',
    description: 'This record must not remain in memory after persistence failure.',
  }), /was not saved/);
  assert.equal(mercuryStore.getWorkspace().segments.length, 0);
  assert.equal(studio.getMercuryWorkspace(), null);
  global.localStorage.setItem = originalSetItem;

  assert.equal(studio.setMercuryWorkspace(mercuryWorkspace({ now: '2026-08-25T10:00:00Z', workspaceId: 'mercury-delete-test' })), true);
  const deleteStore = new MercuryStore({ studioStore: studio });
  global.localStorage.setItem = () => { throw new Error('storage disabled'); };
  assert.throws(() => deleteStore.reset(), /was not deleted/);
  assert.notEqual(studio.getMercuryWorkspace(), null);
  global.localStorage.setItem = originalSetItem;
});

test('StudioStore — Workspace Creation and Normalization', () => {
  mockStorage.clear();
  const store = new StudioStore();
  
  const ws = store.createWorkspace('Autumn Venture Sprint 2026', ['idea-061', 'idea-273']);
  assert.equal(ws.name, 'Autumn Venture Sprint 2026');
  assert.equal(ws.shortlist.length, 2);
  assert.equal(ws.shortlist[0].ideaId, 'idea-061');
  assert.equal(ws.shortlist[0].stage, 'inbox');
  assert.equal(ws.members[0].displayName, store.getUser().displayName);
});

test('StudioStore — Shortlist & Stage Transitions', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Test Workspace');

  assert.equal(store.isInShortlist('idea-001'), false);
  store.addToShortlist('idea-001', 'inbox', ['b2b', 'ai']);
  assert.equal(store.isInShortlist('idea-001'), true);

  const item = store.getShortlist().find(i => i.ideaId === 'idea-001');
  assert.equal(item.stage, 'inbox');
  assert.deepEqual(item.tags, ['b2b', 'ai']);

  // Move to Finalist stage
  store.setShortlistStage('idea-001', 'finalist');
  const updated = store.getShortlist().find(i => i.ideaId === 'idea-001');
  assert.equal(updated.stage, 'finalist');

  // Reorder shortlist
  store.addToShortlist('idea-002', 'inbox');
  store.reorderShortlist(['idea-002', 'idea-001']);
  const reordered = store.getShortlist();
  assert.equal(reordered[0].ideaId, 'idea-002');
  assert.equal(reordered[1].ideaId, 'idea-001');

  // Remove from shortlist
  store.removeFromShortlist('idea-001');
  assert.equal(store.isInShortlist('idea-001'), false);
});

test('StudioStore — Structured Notes', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Notes Test');

  const note = store.addNote({
    ideaId: 'idea-061',
    type: 'pro',
    content: 'Massive B2B pain with verifiable compliance budget.',
    isShared: true
  });

  assert.ok(note.id.startsWith('note_'));
  assert.equal(note.type, 'pro');
  assert.equal(note.content, 'Massive B2B pain with verifiable compliance budget.');

  const ideaNotes = store.getNotes('idea-061');
  assert.equal(ideaNotes.length, 1);

  // Update note
  store.updateNote(note.id, 'Updated note content with more detail.');
  assert.equal(store.getNotes('idea-061')[0].content, 'Updated note content with more detail.');

  // Delete note
  store.deleteNote(note.id);
  assert.equal(store.getNotes('idea-061').length, 0);
});

test('StudioStore — Multi-Criteria Scorecards & Disagreement Calculation', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Scoring Test');

  // Voter 1: Alex
  store.setUser({ displayName: 'Alex' });
  store.saveScorecard({
    ideaId: 'idea-061',
    scores: {
      painSeverity: 9,
      willingnessToPay: 8.5,
      distributionAccess: 7,
      founderFit: 8,
      speedToRevenue: 6,
      validationCost: 9,
      differentiation: 8,
      defensibility: 7,
      regulatoryFriction: 6,
      aiLeverage: 8.5
    },
    dimensionNotes: {
      painSeverity: 'Regulatory deadlines force immediate compliance.'
    }
  });

  const card1 = store.getScorecard('idea-061', store.getUser().uid);
  assert.equal(card1.scores.painSeverity, 9);
  assert.equal(card1.scores.willingnessToPay, 8.5);

  const agg1 = store.getScorecardAggregation('idea-061');
  assert.equal(agg1.scorecardCount, 1);
  assert.equal(agg1.dimAverages.painSeverity, 9);
  assert.equal(agg1.disagreementIndex, 0);

  // Voter 2: Jordan (simulating a second user submitting to workspace)
  const currentWs = store.getWorkspace();
  currentWs.scorecards.push({
    id: `scorecard_idea-061_user-2`,
    ideaId: 'idea-061',
    uid: 'user-2',
    voterName: 'Jordan',
    scores: {
      painSeverity: 5, // Significant disagreement on pain
      willingnessToPay: 4,
      distributionAccess: 7,
      founderFit: 6,
      speedToRevenue: 5,
      validationCost: 7,
      differentiation: 6,
      defensibility: 5,
      regulatoryFriction: 4,
      aiLeverage: 6
    },
    dimensionNotes: {},
    updatedAt: new Date().toISOString()
  });
  store.setWorkspace(currentWs);

  const agg2 = store.getScorecardAggregation('idea-061');
  assert.equal(agg2.scorecardCount, 2);
  assert.equal(agg2.dimAverages.painSeverity, 7); // (9+5)/2
  assert.equal(agg2.dimDisagreements.painSeverity, 2); // std dev
  assert.equal(agg2.hasDisagreement, true);
});

test('StudioStore — Pairwise Tournament Leaderboard', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Tournament Test', ['idea-001', 'idea-002', 'idea-003']);

  store.savePairwiseVote({
    ideaA: 'idea-001',
    ideaB: 'idea-002',
    winnerId: 'idea-001',
    rationale: 'Lower startup capital and faster time to MVP.'
  });

  store.savePairwiseVote({
    ideaA: 'idea-001',
    ideaB: 'idea-003',
    winnerId: 'idea-001',
    rationale: 'Clearer distribution wedge.'
  });

  store.savePairwiseVote({
    ideaA: 'idea-002',
    ideaB: 'idea-003',
    winnerId: 'idea-002',
    rationale: 'B2B enterprise spend.'
  });

  const leaderboard = store.getPairwiseLeaderboard();
  assert.equal(leaderboard[0].ideaId, 'idea-001');
  assert.equal(leaderboard[0].wins, 2);
  assert.equal(leaderboard[0].winRate, 100);

  assert.equal(leaderboard[1].ideaId, 'idea-002');
  assert.equal(leaderboard[1].wins, 1);
  assert.equal(leaderboard[1].winRate, 50);

  assert.equal(leaderboard[2].ideaId, 'idea-003');
  assert.equal(leaderboard[2].wins, 0);
  assert.equal(leaderboard[2].winRate, 0);
});

test('StudioStore — Idea Variants Lab', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Variants Test', ['idea-061']);

  const variantA = store.createVariant({
    parentIdeaId: 'idea-061',
    title: 'Accountant Channel Wedge',
    changes: {
      targetCustomer: 'Mid-size accounting firms',
      wedge: 'Automated 1-click audit preparation report',
      pricingModel: '€299/mo per seat'
    },
    stage: 'interesting'
  });

  assert.ok(variantA.id.startsWith('var_idea-061'));
  assert.equal(variantA.title, 'Accountant Channel Wedge');
  assert.equal(variantA.changes.targetCustomer, 'Mid-size accounting firms');

  // Variant is automatically added to shortlist
  assert.equal(store.isInShortlist(variantA.id), true);

  // Fork a sub-variant (Lineage: Idea 061 -> Variant A -> Variant B)
  const variantB = store.createVariant({
    parentIdeaId: 'idea-061',
    parentVariantId: variantA.id,
    title: 'Self-Serve SME Direct Version',
    changes: {
      targetCustomer: 'Direct SMEs under 50 employees'
    }
  });

  assert.equal(variantB.parentVariantId, variantA.id);

  const variants = store.getVariants('idea-061');
  assert.equal(variants.length, 2);
});

test('StudioStore — Provisional Winner Decision & Reopening Flow', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Decision Test', ['idea-061', 'idea-273']);

  assert.equal(store.getDecision(), null);

  const decision = store.recordDecision({
    selectedId: 'idea-061',
    selectedTitle: 'FactBounty Automated Compliance',
    isVariant: false,
    rationale: 'Highest founder fit, clearest customer urgency, and immediate regulatory catalyst.',
    decisiveAssumptions: [
      'Mid-market compliance officers have autonomous purchasing authority under €5k/yr',
      'Data connectors can be integrated in under 2 weeks'
    ],
    dissentObjections: [
      'Jordan noted enterprise sales cycle might exceed 3 months'
    ],
    confidenceLevel: 'high',
    nextExperiment: '10 cold calls to certified compliance officers to secure 3 pilot LOIs',
    reconsiderationTriggers: [
      'If < 2 out of 10 prospective buyers agree to an interview within 14 days'
    ]
  });

  assert.ok(decision.id.startsWith('dec_'));
  assert.equal(decision.selectedId, 'idea-061');
  assert.equal(decision.confidenceLevel, 'high');
  assert.equal(decision.decisiveAssumptions.length, 2);

  // Shortlist stage was set to winner
  const winnerItem = store.getShortlist().find(i => i.ideaId === 'idea-061');
  assert.equal(winnerItem.stage, 'winner');

  // Reopen decision
  store.reopenDecision('Validation experiment showed prolonged sales cycle');
  assert.equal(store.getDecision(), null);
  const reopenedItem = store.getShortlist().find(i => i.ideaId === 'idea-061');
  assert.equal(reopenedItem.stage, 'finalist');
});

test('StudioStore — Validation Experiment Tracking', () => {
  mockStorage.clear();
  const store = new StudioStore();
  store.createWorkspace('Validation Test', ['idea-061']);

  const exp = store.addExperiment({
    ideaId: 'idea-061',
    hypothesis: 'Buyers will commit €500 deposit on a landing page mockup',
    testDesign: 'Create landing page with Stripe test mode pre-order button and run €50 LinkedIn ads',
    targetMetric: '3 deposits from 100 visitors',
    costBudget: '€50 / 4 hours'
  });

  assert.ok(exp.id.startsWith('exp_'));
  assert.equal(exp.status, 'planned');

  store.updateExperiment(exp.id, {
    status: 'passed',
    outcomeSummary: 'Received 4 deposits and 12 email inquiries within 48 hours.',
    decisionImpact: 'continue'
  });

  const updatedExp = store.getExperiments('idea-061')[0];
  assert.equal(updatedExp.status, 'passed');
  assert.equal(updatedExp.outcomeSummary, 'Received 4 deposits and 12 email inquiries within 48 hours.');
});

test('StudioStore — Export & Import Decision Packets', () => {
  mockStorage.clear();
  const store1 = new StudioStore();
  store1.createWorkspace('Packet Test', ['idea-061']);
  store1.addNote({ ideaId: 'idea-061', type: 'pro', content: 'Strong unit economics' });
  store1.saveScorecard({ ideaId: 'idea-061', scores: { painSeverity: 9, founderFit: 8 } });

  const packetJson = store1.exportDecisionPacket();
  assert.ok(typeof packetJson === 'string');

  const parsed = JSON.parse(packetJson);
  assert.equal(parsed.schemaVersion, '3.0.0');
  assert.equal(parsed.workspace.name, 'Packet Test');
  assert.equal(parsed.workspace.notes.length, 1);
  assert.equal(parsed.workspace.scorecards.length, 1);

  // Restore in a clean store instance
  mockStorage.clear();
  const store2 = new StudioStore();
  const importResult = store2.importDecisionPacket(packetJson);
  assert.equal(importResult.success, true);
  assert.equal(store2.getWorkspace().name, 'Packet Test');
  assert.equal(store2.getNotes('idea-061').length, 1);
  assert.equal(store2.getScorecard('idea-061', store1.getUser().uid).scores.painSeverity, 9);
});
