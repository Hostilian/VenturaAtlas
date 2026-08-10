const assert = require('assert');
const test = require('node:test');

const { synchronizeArchitecture } = require('../scripts/update-documentation-stats');

test('architecture synchronization repairs comma-amplified counts and is idempotent', () => {
  const meta = { counts: { totalIdeas: 468, prompts: 4425 } };
  const corrupted = [
    'serving 468+ canonical & staged startup dossiers,',
    '6,2,2,4,425+ generated prompt packs'
  ].join(' ');

  const expected = [
    'serving 468+ canonical & staged startup dossiers,',
    '4,425+ generated prompt packs'
  ].join(' ');
  const once = synchronizeArchitecture(corrupted, meta);

  assert.strictEqual(once, expected);
  assert.strictEqual(synchronizeArchitecture(once, meta), expected);
});
