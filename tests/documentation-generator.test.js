const assert = require('assert');
const test = require('node:test');

const { synchronizeArchitecture, synchronizeHomepage } = require('../scripts/update-documentation-stats');

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

test('homepage synchronization updates current description variants and is idempotent', () => {
  const meta = { counts: { canonicalIdeas: 302, categories: 130, sources: 316, prompts: 4625 } };
  const stale = [
    '<meta name="description" content="Browse 294+ business idea dossiers with heterogeneous evidence coverage.">',
    '<meta property="og:description" content="294+ business idea dossiers with legacy scores.">',
    '<span data-total-ideas>294</span>',
    '<span data-total-categories>122</span>'
  ].join('\n');
  const expected = stale
    .replace('Browse 294+', 'Browse 302+')
    .replace('content="294+', 'content="302+')
    .replace('>294<', '>302<')
    .replace('>122<', '>130<');

  const once = synchronizeHomepage(stale, meta);
  assert.strictEqual(once, expected);
  assert.strictEqual(synchronizeHomepage(once, meta), expected);
});
