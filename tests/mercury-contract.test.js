const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

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
  assert.match(studio, /unencrypted packet/);
});
