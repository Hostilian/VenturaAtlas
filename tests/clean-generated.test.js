const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { cleanDirectory } = require('../scripts/clean-generated');

test('generated cleanup removes only an allowlisted directory tree', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'va-clean-generated-'));
  const generated = path.join(root, '_site', 'nested');
  fs.mkdirSync(generated, { recursive: true });
  fs.writeFileSync(path.join(generated, 'artifact.txt'), 'generated');
  cleanDirectory('_site', { root, maxRetries: 2, retryDelay: 1 });
  assert.equal(fs.existsSync(path.join(root, '_site')), false);
});

test('generated cleanup rejects paths outside the allowlist', () => {
  assert.throws(() => cleanDirectory('data'), /Refusing to clean non-generated path/);
  assert.throws(() => cleanDirectory('../_site'), /Refusing to clean non-generated path/);
});

test('public artifact build and cleanup use the same writer lock', () => {
  const cleanSource = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'clean-generated.js'), 'utf8');
  const buildSource = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'build-public-artifact.js'), 'utf8');
  assert.match(cleanSource, /withPublicArtifactLock/);
  assert.match(buildSource, /withPublicArtifactLock/);
  assert.doesNotMatch(buildSource, /const ARTIFACT_LOCK/);
});
