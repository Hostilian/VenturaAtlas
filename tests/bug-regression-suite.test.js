/**
 * VenturaAtlas Bug Triage & Regression Test Suite
 * Test-first verification of deterministic engineering constraints and quality invariants.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

describe('Bug Triage & Deterministic Invariant Regressions', () => {

  test('Design Token Integrity: validates defined custom properties without error', () => {
    const output = execSync('node scripts/validate-design-tokens.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[DESIGN-TOKENS\] OK: All \d+ variable references are strictly resolved\./);
  });

  test('AI Anti-Pattern Gate: verifies zero anti-patterns in source code', () => {
    const output = execSync('node scripts/validate-ai-antipatterns.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[AI-ANTIPATTERNS\] OK: Zero AI anti-patterns detected\./);
  });

  test('TODO Backlog Linkage: verifies all TODOs adhere to TODO(TASK-ID) convention', () => {
    const output = execSync('node scripts/validate-todos.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[TODOS\] OK: All TODO\/FIXME items are strictly linked to authoritative tasks\./);
  });

  test('Task Graph Cycle Detection: verifies capability graph is acyclic and intact', () => {
    const output = execSync('node scripts/check-task-graph.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[OK\] Agent Task Graph structural validation passed cleanly\./);
  });

  test('Task Graph Resolver: deterministically returns ready task from authoritative backlog', () => {
    const output = execSync('node scripts/resolve-next-task.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[NEXT-TASK\] Selected: /);
  });

  test('View Adapters: Dex and Beads generate valid non-authoritative JSON projections', () => {
    execSync('node scripts/dex-adapter.js', { cwd: ROOT });
    execSync('node scripts/beads-adapter.js', { cwd: ROOT });

    const dexPath = path.join(ROOT, '.agent-state', 'views', 'dex-backlog.json');
    const beadsPath = path.join(ROOT, '.agent-state', 'views', 'beads-backlog.json');

    assert.ok(fs.existsSync(dexPath), 'Dex backlog view must exist');
    assert.ok(fs.existsSync(beadsPath), 'Beads backlog view must exist');

    const dex = JSON.parse(fs.readFileSync(dexPath, 'utf-8'));
    const beads = JSON.parse(fs.readFileSync(beadsPath, 'utf-8'));

    assert.strictEqual(dex.authoritative, false, 'Dex view must be non-authoritative');
    assert.strictEqual(beads.authoritative, false, 'Beads view must be non-authoritative');
    assert.ok(Array.isArray(dex.tasks) && dex.tasks.length > 0, 'Dex must contain projected tasks');
    assert.ok(Array.isArray(beads.nodes) && beads.nodes.length > 0, 'Beads must contain projected nodes');
  });

  test('Component Registry: verifies all registered UI components have valid script and style assets', () => {
    const output = execSync('node scripts/discover-components.js --check', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[COMPONENTS\] OK: \d+ registered components verified\./);
  });

  test('Headless Smoke Gate: verifies critical HTML entry points pass structural sanity', () => {
    const output = execSync('node scripts/lightpanda-smoke.js', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
    assert.match(output, /\[LIGHTPANDA-SMOKE\] Checked \d+ pages\. Passed: \d+\/\d+\./);
  });

  test('Sentry Data Scrubber: verifies sensitive tokens, stripe keys, and PII are redacted', () => {
    const { scrubSensitiveData } = require('../services/sentry-config');
    // Build mock Stripe keys at runtime to avoid triggering GitHub secret scanning.
    const MOCK_STRIPE_KEY_A = ['sk', 'live', 'secretkey12345678901234567890'].join('_');
    const MOCK_STRIPE_KEY_B = ['sk', 'live', '999999999999999999999999'].join('_');
    const mockEvent = {
      request: {
        headers: {
          authorization: `Bearer ${MOCK_STRIPE_KEY_A}`,
          cookie: 'session_id=123',
        },
        data: `Customer email is john.doe@example.com and stripe token is ${MOCK_STRIPE_KEY_B}`,
      },
      extra: {
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        card: '4111 2222 3333 4444',
      },
    };

    const sanitized = scrubSensitiveData(mockEvent);
    assert.strictEqual(sanitized.request.headers.authorization, '[REDACTED_HEADER]');
    assert.strictEqual(sanitized.request.headers.cookie, '[REDACTED_HEADER]');
    assert.strictEqual(sanitized.extra.card, '[REDACTED_HEADER]');
    assert.ok(!sanitized.request.data.includes('john.doe@example.com'), 'Email must be redacted');
    assert.ok(!sanitized.request.data.includes('sk_live_'), 'Stripe key must be redacted');
    assert.ok(!sanitized.extra.jwt.includes('eyJhbGciOi'), 'JWT must be redacted');
  });

});

