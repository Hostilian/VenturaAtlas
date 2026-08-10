const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '..');

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'va-public-sources-'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'data'));
  fs.copyFileSync(
    path.join(ROOT, 'scripts', 'build_public_sources.py'),
    path.join(root, 'scripts', 'build_public_sources.py')
  );
  return root;
}

test('Public source projection fails closed when classification metadata is absent', t => {
  const root = fixtureRoot();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dataDir = path.join(root, 'data');
  fs.writeFileSync(
    path.join(dataDir, 'sources.json'),
    JSON.stringify([{ id: 'source-1', title: 'Unclassified', url: 'https://example.com' }])
  );
  const outputPath = path.join(dataDir, 'public-sources.json');
  fs.writeFileSync(outputPath, '[{"sentinel":true}]\n');

  assert.throws(() => execFileSync('python', [path.join(root, 'scripts', 'build_public_sources.py')], { encoding: 'utf8' }));
  assert.equal(fs.readFileSync(outputPath, 'utf8'), '[{"sentinel":true}]\n', 'failed projection must not replace prior output');
});

test('Public source projection publishes only explicitly eligible public records', t => {
  const root = fixtureRoot();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dataDir = path.join(root, 'data');
  const sources = [
    {
      id: 'external-1',
      title: 'Official source',
      url: 'https://example.com/official',
      visibility: 'PUBLIC',
      sourceClass: 'PRIMARY_OR_OFFICIAL',
      evidenceEligible: true,
      provenanceEligible: true
    },
    {
      id: 'internal-1',
      title: 'Conversation source',
      visibility: 'INTERNAL',
      sourceClass: 'INTERNAL_PROVENANCE_ARTIFACT',
      evidenceEligible: false,
      provenanceEligible: true
    }
  ];
  fs.writeFileSync(path.join(dataDir, 'sources.json'), JSON.stringify(sources));
  execFileSync('python', [path.join(root, 'scripts', 'build_public_sources.py')], { encoding: 'utf8' });
  const projected = JSON.parse(fs.readFileSync(path.join(dataDir, 'public-sources.json'), 'utf8'));
  assert.deepEqual(projected.map(source => source.id), ['external-1']);
});
