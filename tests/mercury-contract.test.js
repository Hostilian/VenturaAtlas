const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validateMercuryDocument } = require('../scripts/validate-mercury');

const ROOT = path.resolve(__dirname, '..');

test('Mercury page states its local-only boundary and does not load a remote commercial SDK', () => {
  const page = fs.readFileSync(path.join(ROOT, 'docs', 'mercury.html'), 'utf8');
  assert.match(page, /browser-local notebook/i);
  assert.match(page, /No commercial data has been sent anywhere/i);
  assert.doesNotMatch(page, /firebase-(?:app|firestore)|stripe\.com|hubspot|salesforce/i);
  assert.match(page, /assets\/js\/core\/studio-store\.js/);
  assert.match(page, /assets\/js\/core\/mercury-store\.js/);
});

test('Mercury stores no personal contact fields and records participant evidence by private reference', () => {
  const source = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'core', 'mercury-store.js'), 'utf8');
  assert.doesNotMatch(source, /\b(email|phoneNumber|linkedinUrl|homeAddress)\s*:/i);
  assert.match(source, /evidenceRef/);
  assert.match(source, /claimsNotEarned/);
});

test('Mercury hypothesis example is excluded from the public artifact allowlist', () => {
  const builder = fs.readFileSync(path.join(ROOT, 'scripts', 'build-public-artifact.js'), 'utf8');
  assert.doesNotMatch(builder, /research\/mercury/);
  const example = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'mercury', 'idea-061-commercial-hypothesis.json'), 'utf8'));
  assert.equal(example.organizations.length, 0);
  assert.equal(example.interactions.length, 0);
  assert.equal(example.commercialEvents.length, 0);
  assert.ok(example.segments.every(item => item.status === 'HYPOTHESIS'));
});

test('service worker includes the Mercury shell for offline use', () => {
  const serviceWorker = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  assert.match(serviceWorker, /docs\/mercury\.html/);
  assert.match(serviceWorker, /assets\/js\/core\/mercury-store\.js/);
  assert.match(serviceWorker, /assets\/js\/features\/mercury\.js/);
});

test('Decision Studio warns that packet exports include private Mercury data', () => {
  const studio = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'features', 'studio.js'), 'utf8');
  assert.match(studio, /Mercury data included/);
  assert.match(studio, /every JSON export/);
  assert.match(studio, /unencrypted/);
});

test('Mercury commercial brief is bound to the canonical idea name and data revision', () => {
  const repositoryMeta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'repository-meta.json'), 'utf8'));
  const example = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'mercury', 'idea-061-commercial-hypothesis.json'), 'utf8'));
  assert.equal(example.canonicalIdeaRevision, repositoryMeta.revisions.canonicalRevision);
  assert.deepEqual(validateMercuryDocument(example), []);

  const stale = structuredClone(example);
  stale.canonicalIdeaRevision = '0000000000000000000000000000000000000000';
  stale.ventureName = 'Invented canonical title';
  const errors = validateMercuryDocument(stale);
  assert.ok(errors.some(error => error.includes('canonicalIdeaRevision is stale')));
  assert.ok(errors.some(error => error.includes('ventureName does not match')));
});

test('Mercury UI exposes the end-to-end loss, objection, and segment-learning flows', () => {
  const source = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'features', 'mercury.js'), 'utf8');
  assert.match(source, /id="stageForm"/);
  assert.match(source, /Objection categories observed/);
  assert.match(source, /Segment, objection, and loss learning/);
  assert.match(source, /Highest-value next human action/);
});

test('active launch hypothesis is truth-bounded and the damaged-label cohort stays repaired', () => {
  const activePlan = fs.readFileSync(path.join(ROOT, 'launch-plans', 'idea-061.md'), 'utf8');
  assert.match(activePlan, /unverified hypothesis snapshot/i);
  assert.match(activePlan, /no scraping or automated direct messages/i);
  assert.match(activePlan, /Mercury Customer Reality Lab/);

  const damagedLabels = [
    'Initial iche', 'Value roposition', 'Pricing aunch', 'First10 ustomers',
    'Product ed rowth', 'Marketplace istribution', 'Sales ssets', 'First ntegration',
  ];
  for (let ideaNumber = 61; ideaNumber <= 70; ideaNumber += 1) {
    const plan = fs.readFileSync(path.join(ROOT, 'launch-plans', `idea-${String(ideaNumber).padStart(3, '0')}.md`), 'utf8');
    for (const label of damagedLabels) assert.ok(!plan.includes(label), `idea-${ideaNumber} still contains damaged label ${label}`);
  }
});
