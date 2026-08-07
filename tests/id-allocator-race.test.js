/**
 * Candidate UUID & Parallel Publisher Race Test Suite
 * ===================================================
 * Verifies that 20 simultaneous parallel candidate operations receive 20 unique UUIDs
 * and that simultaneous canonical publishers cannot allocate duplicate idea-XXX IDs.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

test('ID Allocator Race Test — 20 Concurrent Candidates & Simultaneous Publisher Uniqueness', () => {
  const pyScript = path.join(ROOT, 'tests', 'test_id_allocator_race.py');
  const output = execSync(`python "${pyScript}"`, { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(output.includes('PASS: 20 concurrent candidates received 20 unique candidate UUIDs'), 'Candidate UUID test must pass');
  assert.ok(output.includes('PASS: Simultaneous publishers allocated'), 'Publisher race test must pass');
});
