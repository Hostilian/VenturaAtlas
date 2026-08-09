const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SECRET_CONTENT_PATTERNS } = require('../scripts/check-public-artifact.js');

const ROOT = path.resolve(__dirname, '..');

test('Container context excludes secrets and private operator state', () => {
  const ignorePath = path.join(ROOT, '.dockerignore');
  assert.ok(fs.existsSync(ignorePath), 'root Docker build context requires .dockerignore');
  const entries = new Set(
    fs.readFileSync(ignorePath, 'utf8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  );
  for (const required of [
    '.env',
    '.env.*',
    '.git',
    '.agent-state',
    '.agent-system',
    '.agents',
    '.codex',
    'node_modules',
    '_site',
    'research/audits',
    'research/original-chat',
    'meeting-packets'
  ]) {
    assert.ok(entries.has(required), `.dockerignore must exclude ${required}`);
  }
});

test('Public secret scanner recognizes provider-specific token formats', () => {
  const probes = [
    'sk-or-v1-FAKE0123456789abcdefghijklmnop',
    'sk-ant-FAKE0123456789abcdefghijklmnopqr'
  ];
  for (const probe of probes) {
    assert.ok(
      SECRET_CONTENT_PATTERNS.some(item => item.regex.test(probe)),
      `secret scanner must recognize ${probe.slice(0, 9)} token format`
    );
  }
});
