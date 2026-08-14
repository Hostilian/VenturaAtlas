'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const audit = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'audits', 'OMEGA-XIII-20260812T174230Z', 'COMPLETION_AUDIT.json'), 'utf8'));

test('OMEGA XIII completion audit covers all 45 conditions without a false completion claim', () => {
  assert.deepEqual(audit.conditions.map(condition => condition.id), Array.from({ length: 45 }, (_, index) => index + 1));
  const open = audit.conditions.filter(condition => condition.status !== 'PROVEN');
  assert.ok(open.length > 0);
  assert.equal(audit.completionClaim, false);
  for (const condition of open) assert.ok(condition.closureNeeded);
});

test('completion evidence paths resolve inside the repository', () => {
  for (const condition of audit.conditions) {
    assert.ok(condition.evidence.length > 0);
    for (const relativePath of condition.evidence) {
      const resolved = path.resolve(ROOT, relativePath);
      assert.ok(resolved.startsWith(`${ROOT}${path.sep}`));
      assert.ok(fs.existsSync(resolved), `${relativePath} must exist`);
    }
  }
});
