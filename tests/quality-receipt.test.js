const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseStatusPaths, runQuality, shouldUseShell } = require('../scripts/run-quality');

const silentLogger = { log() {} };

test('porcelain parser preserves a leading dot in the first dirty path', () => {
  assert.deepEqual(
    parseStatusPaths(' M .github/workflows/deploy-pages.yml\0?? scripts/new.js\0'),
    ['.github/workflows/deploy-pages.yml', 'scripts/new.js'],
  );
});

test('Windows command-shell routing is limited to command wrappers', () => {
  if (process.platform === 'win32') {
    assert.equal(shouldUseShell('npm.cmd'), true);
    assert.equal(shouldUseShell('C:\\Program Files\\nodejs\\node.exe'), false);
  } else {
    assert.equal(shouldUseShell('npm'), false);
  }
});

test('quality receipt records named successful phases without command output', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'va-quality-pass-'));
  const receiptPath = path.join(directory, 'receipt.json');
  const result = runQuality({
    steps: [
      { id: 'syntax', command: 'node', args: ['--check', 'fixture.js'] },
      { id: 'privacy', command: 'python', args: ['privacy.py'] },
    ],
    receiptPath,
    execute: () => ({ status: 0 }),
    snapshot: () => new Map(),
    sourceCommit: () => 'abc123',
    environment: {},
    logger: silentLogger,
  });

  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(result.exitCode, 0);
  assert.equal(receipt.status, 'passed');
  assert.equal(receipt.sourceCommit, 'abc123');
  assert.deepEqual(receipt.validators.map(item => item.id), ['syntax', 'privacy']);
  assert.ok(!JSON.stringify(receipt).includes('stdout'));
  assert.ok(!JSON.stringify(receipt).includes('stderr'));
});

test('quality receipt stops on first failure and reports the exact phase', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'va-quality-fail-'));
  const receiptPath = path.join(directory, 'receipt.json');
  const executed = [];
  const result = runQuality({
    steps: [
      { id: 'first', command: 'node', args: ['first.js'] },
      { id: 'broken-validator', command: 'node', args: ['broken.js'] },
      { id: 'must-not-run', command: 'node', args: ['later.js'] },
    ],
    receiptPath,
    execute: step => {
      executed.push(step.id);
      return { status: step.id === 'broken-validator' ? 7 : 0 };
    },
    snapshot: () => new Map(),
    sourceCommit: () => 'def456',
    environment: {},
    logger: silentLogger,
  });

  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(result.exitCode, 7);
  assert.equal(receipt.status, 'failed');
  assert.equal(receipt.failedPhase, 'broken-validator');
  assert.equal(receipt.exitCode, 7);
  assert.deepEqual(executed, ['first', 'broken-validator']);
});

test('artifact quality receipt binds the validated tree digest and manifest', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'va-quality-artifact-'));
  const artifactPath = path.join(directory, '_site');
  const receiptPath = path.join(directory, 'artifact-receipt.json');
  const artifactManifestPath = path.join(directory, 'artifact-manifest.json');
  fs.mkdirSync(artifactPath);
  fs.writeFileSync(path.join(artifactPath, 'index.html'), '<h1>verified</h1>\n');

  const result = runQuality({
    profile: 'artifact',
    steps: [{ id: 'artifact-validation', command: 'node', args: ['fixture.js'] }],
    receiptPath,
    artifactPath,
    artifactManifestPath,
    execute: () => ({ status: 0 }),
    snapshot: () => new Map(),
    sourceCommit: () => 'artifact123',
    environment: {},
    logger: silentLogger,
  });

  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(artifactManifestPath, 'utf8'));
  assert.equal(result.exitCode, 0);
  assert.equal(receipt.receiptKind, 'artifact-quality');
  assert.equal(receipt.artifactDigest, manifest.treeSha256);
  assert.equal(receipt.artifactFileCount, 1);
  assert.equal(manifest.files[0].path, 'index.html');
});

test('quality receipt fails closed when HEAD changes during validation', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'va-quality-commit-drift-'));
  const commits = ['before123', 'after456'];
  const result = runQuality({
    steps: [{ id: 'unit', command: 'node', args: ['fixture.js'] }],
    receiptPath: path.join(directory, 'receipt.json'),
    execute: () => ({ status: 0 }),
    snapshot: () => new Map(),
    sourceCommit: () => commits.shift(),
    environment: {},
    logger: silentLogger,
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.receipt.failedPhase, 'commit-stability');
  assert.equal(result.receipt.sourceCommit, 'before123');
  assert.equal(result.receipt.finishedCommit, 'after456');
});
