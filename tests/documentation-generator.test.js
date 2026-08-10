const assert = require('assert');
const test = require('node:test');

const { synchronizeArchitecture } = require('../scripts/update-documentation-stats');

test('architecture synchronization repairs comma-amplified counts and is idempotent', () => {
  const meta = { counts: { totalIdeas: 468, canonicalIdeas: 294, dossiers: 382, prompts: 4425 } };
  const corrupted = [
    'tracking 468 repository records; the public site serves 294 canonical records and 382 dossier files,',
    '6,2,2,4,425+ generated prompt packs'
  ].join(' ');

  const expected = [
    'tracking 468 repository records; the public site serves 294 canonical records and 382 dossier files,',
    '4,425+ generated prompt packs'
  ].join(' ');
  const once = synchronizeArchitecture(corrupted, meta);

  assert.strictEqual(once, expected);
  assert.strictEqual(synchronizeArchitecture(once, meta), expected);
});
