const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('OMEGA XIV stages the three-way battle without canonical promotion', () => {
  const queue = read('data/idea-staging-queue.json');
  const slugs = new Set(['nzia-bidproof-nonprice-tender-evidence-capsule', 'safe-origintrace-component-cost-origin-evidence', 'milestone-to-cash-funding-completion-evidence']);
  const staged = queue.filter(item => slugs.has(item.candidateSlug));
  assert.equal(staged.length, 3);
  assert.ok(staged.every(item => item.promotionEligible === false && item.atAGlance.overallScore === null));
  const queueReady = queue.find(item => item.candidateSlug === 'queueready-grid-connection-readiness-os');
  assert.equal(queueReady.researchAssessment.noveltyDistance, 'EXISTING_IDEA_REUNDERWRITE');
});

test('OMEGA XIV uses null-first capital amounts and explicit clocks', () => {
  const programs = read('data/capital-programs.json').programs;
  const clocks = read('data/capital-clock-ledger.json').clocks;
  assert.equal(programs.length, 5);
  assert.ok(programs.every(item => item.contestableAmount === null && item.currentlyAvailableAmount === null));
  assert.equal(clocks.length, 5);
  assert.ok(clocks.some(item => item.expiresAt === '2026-09-09T23:59:59Z'));
  assert.ok(clocks.some(item => item.expiresAt === null && item.state === 'OPEN'));
});
