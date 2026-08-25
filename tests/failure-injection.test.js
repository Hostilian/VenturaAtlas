/**
 * Runtime and public-boundary contract tests.
 * These tests do not claim to inject provider HTTP failures.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { buildUnlocked } = require('../scripts/build-public-artifact');
const { checkDirectory } = require('../scripts/check-public-artifact');

const ROOT = path.resolve(__dirname, '..');
const ORCH_PATH = path.join(ROOT, 'scripts', 'va_orchestrator.py');

test('Provider Health Contract — status and no-eligible-provider gate execute', () => {
  const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'va-provider-contract-'));
  try {
    const result = execFileSync(process.env.PYTHON || 'python', [ORCH_PATH, '--test', '--offline'], {
      cwd: ROOT,
      encoding: 'utf-8',
      env: {
        ...process.env,
        VA_ORCHESTRATOR_STATE_PATH: path.join(isolatedRoot, 'provider-state.json'),
        VA_ORCHESTRATOR_STATE_LOCK_PATH: path.join(isolatedRoot, 'provider-state.lock'),
        VA_ORCHESTRATOR_LOG_PATH: path.join(isolatedRoot, 'provider-health.log'),
      },
    });
    assert.ok(result.includes('Provider Health Check'), 'Health check output must execute cleanly');
    assert.ok(result.includes('External probes: DISABLED'), 'unit contract must never probe configured providers');
    assert.ok(result.includes('Circuit Breaker Status'), 'Circuit breaker status must be present');
  } finally {
    fs.rmSync(isolatedRoot, { recursive: true, force: true });
  }
});

test('Metadata Contract — portfolio arithmetic is internally consistent', () => {
  const metaPath = path.join(ROOT, 'data', 'repository-meta.json');
  assert.ok(fs.existsSync(metaPath), 'repository-meta.json must exist');
  
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  assert.ok(meta.counts.ideas > 0, 'Canonical idea count must be greater than 0');
  assert.equal(meta.counts.totalIdeas, meta.counts.canonicalIdeas + meta.counts.stagedIdeas, 'Total ideas must equal canonical + staged');
});

test('Public Artifact Contract — rebuild and enforce private-path projection', () => {
  const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'va-public-contract-'));
  const distPath = path.join(isolatedRoot, '_site');
  const receiptPath = path.join(isolatedRoot, 'public-artifact-build.json');
  const trackedProjectionPath = path.join(ROOT, 'data', 'public-sources.json');
  const projectionBefore = fs.statSync(trackedProjectionPath);
  buildUnlocked({ distPath, receiptPath });
  const projectionAfter = fs.statSync(trackedProjectionPath);
  assert.equal(projectionAfter.mtimeMs, projectionBefore.mtimeMs, 'artifact projection must not rewrite the tracked public-sources file');
  assert.equal(projectionAfter.ctimeMs, projectionBefore.ctimeMs, 'artifact projection must not replace the tracked public-sources file');
  assert.deepEqual(checkDirectory(distPath), [], 'Public artifact security check must pass');
  assert.ok(!fs.existsSync(path.join(distPath, 'data', 'sources.json')), 'raw source registry must not be public');
  assert.ok(fs.existsSync(path.join(distPath, 'data', 'public-sources.json')), 'sanitized public source projection must exist');
  assert.ok(!fs.existsSync(path.join(distPath, 'data', 'build-manifest.json')), 'internal build manifest must not expose staging digests');
  assert.ok(!fs.existsSync(path.join(distPath, 'research', 'audits')), 'private audit runs must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'research', 'chessboard')), 'private CHESSBOARD workspaces must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'research', 'original-chat')), 'private original-chat research must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'meeting-packets')), 'meeting packets require explicit publication and must not be public by default');
  assert.ok(!fs.existsSync(path.join(distPath, 'assets', 'AGENTS.override.md')), 'nested agent instructions must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'rankings')), 'legacy ranking markdown must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'ideas')), 'legacy dossier markdown with unsupported scores must not be public');
  assert.ok(!fs.existsSync(path.join(distPath, 'data', 'ideas.csv')), 'unqualified legacy score CSV must not be public');
  const publicHome = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  assert.ok(!publicHome.includes('data-scope="staged"'), 'public home must not expose private staging scope');
  assert.ok(!publicHome.includes('data-scope="all"'), 'public home must not combine private staging with published ideas');
  assert.ok(!/Staging Queue \(\s*\d+/.test(publicHome), 'public home must not expose a staged idea count');

  const publicSources = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'public-sources.json'), 'utf8'));
  const publicIds = new Set(publicSources.map(source => source.id));
  const internalTerms = new Set(
    JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'))
      .filter(source => source.visibility !== 'PUBLIC')
      .flatMap(source => [source.id, source.title].filter(Boolean))
  );
  assert.ok(publicSources.every(source => source.visibility === 'PUBLIC'), 'every projected source must be explicitly public');
  const publicIdeasRaw = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'ideas.json'), 'utf8'));
  const publicIdeas = Array.isArray(publicIdeasRaw) ? publicIdeasRaw : publicIdeasRaw.ideas;
  for (const idea of publicIdeas) {
    assert.equal(idea.scoreMaturity, 'legacy_unverified');
    assert.equal(idea.rankingEligible, false);
    assert.equal(idea.scoreScaleComparabilityEstablished, false);
    for (const reference of idea.sourceReferences || []) {
      const sourceId = typeof reference === 'string' ? reference : reference.id;
      assert.ok(publicIds.has(sourceId), `public idea ${idea.id} references non-public source ${sourceId}`);
    }
    for (const evidence of idea.evidence || []) {
      assert.ok(publicIds.has(evidence.sourceId), `public idea ${idea.id} exposes non-public evidence ${evidence.sourceId}`);
    }
  }
  const publicMeta = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'repository-meta.json'), 'utf8'));
  assert.equal(publicMeta.counts.stagedIdeas, undefined, 'public metadata must not expose staged counts');
  assert.equal(publicMeta.counts.totalIdeas, undefined, 'public metadata must not combine staged and canonical counts');
  assert.equal(publicMeta.contract, 'public-projection');
  assert.equal(publicMeta.revisions, undefined, 'public metadata must not expose revisions derived from private inputs');
  assert.equal(publicMeta.dataRevision, undefined, 'public metadata must not mislabel private input hashes as public revisions');
  assert.equal(publicMeta.generatedAt, undefined, 'public metadata must not expose a volatile private build timestamp');
  assert.match(publicMeta.canonicalSourceRevision, /^[a-f0-9]{16}$/, 'Mercury must bind to a stable public canonical-source revision without exposing private revision fields');
  assert.equal(publicMeta.counts.sources, publicSources.length, 'public source count must describe the public projection');
  const publicRankings = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'rankings.json'), 'utf8'));
  assert.equal(publicRankings.generatedAt, undefined, 'public rankings must not expose volatile daemon timestamps');
  assert.equal(publicRankings.history, undefined, 'public rankings must not expose private daemon execution history');
  assert.equal(publicRankings.maturity, 'legacy_unverified');
  assert.equal(publicRankings.eligibilityEnforced, false);
  assert.equal(publicRankings.coverageAssessed, false);
  assert.equal(publicRankings.scaleComparabilityEstablished, false);
  assert.ok(publicRankings.rankings.every(view => view.maturity === 'legacy_unverified'));
  assert.ok(publicRankings.rankings.every(view => !/all evidence dimensions/i.test(view.description)));
  const publicValidationSummary = JSON.parse(fs.readFileSync(path.join(distPath, 'data', 'validation-summary.json'), 'utf8'));
  assert.equal(publicValidationSummary.contract, 'structural-and-referential');
  assert.equal(publicValidationSummary.epistemicValidation, 'not_assessed');
  assert.equal(publicValidationSummary.status, undefined, 'ambiguous unscoped validation status must not be public');
  for (const idea of publicIdeas) {
    if (idea.legacyValidation) {
      assert.equal(idea.validationStatus, 'unproven', `public idea ${idea.id} must neutralize its legacy validation label`);
      assert.notEqual(idea.legacyValidation.label, undefined);
      assert.equal(idea.lastValidatedAt, undefined);
      assert.equal(idea.sourceCheckedAt, undefined);
    }
    if (idea.epistemicMetadata) {
      assert.equal(idea.epistemicMetadata.truthClass, 'T4_UNKNOWN', `public idea ${idea.id} must not retain a synthetic record-level T1/T2 label`);
      assert.equal(idea.epistemicMetadata.confidenceClass, 'UNASSESSED', `public idea ${idea.id} must not retain synthetic HIGH/MEDIUM confidence`);
      assert.ok(!['T1_VERIFIED_FACT', 'T2_REPUTABLE_ESTIMATE'].includes(idea.epistemicMetadata.truthClass));
      assert.notEqual(idea.epistemicMetadata.confidenceClass, 'HIGH');
      assert.match(idea.legacyEpistemicMigration.assessment, /unproven record-level heuristic/i);
    }
  }
  const textExtensions = new Set(['.html', '.js', '.json', '.css', '.md', '.txt', '.xml', '.csv']);
  const privateMercury = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'mercury', 'idea-061-commercial-hypothesis.json'), 'utf8'));
  const privateMercuryTerms = [
    privateMercury.workspaceId,
    privateMercury.segments[0].segmentId,
    privateMercury.triggers[0].triggerId,
    privateMercury.offers[0].offerId,
  ];
  const privateChessboard = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'chessboard', 'idea-061-market-structure.json'), 'utf8'));
  const privateChessboardTerms = [
    privateChessboard.workspaceId,
    privateChessboard.responses[0].responseId,
    privateChessboard.positions[0].positionId,
  ];
  const pending = [distPath];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
        const content = fs.readFileSync(absolute, 'utf8');
        for (const term of internalTerms) {
          assert.ok(!content.includes(term), `public text ${path.relative(distPath, absolute)} exposes internal source metadata ${term}`);
        }
        for (const term of privateMercuryTerms) {
          assert.ok(!content.includes(term), `public text ${path.relative(distPath, absolute)} exposes private Mercury value ${term}`);
        }
        for (const term of privateChessboardTerms) {
          assert.ok(!content.includes(term), `public text ${path.relative(distPath, absolute)} exposes private CHESSBOARD value ${term}`);
        }
      }
    }
  }
});
