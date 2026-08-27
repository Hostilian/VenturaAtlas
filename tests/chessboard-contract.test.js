const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { buildUnlocked } = require('../scripts/build-public-artifact');
const {
  computeExpectedContext,
  validateChessboardArtifact
} = require('../scripts/validate-chessboard');
const {
  ChessboardStore,
  validateChessboardWorkspace
} = require('../assets/js/core/chessboard-store');

const ROOT = path.resolve(__dirname, '..');
const WORKSPACE_PATH = path.join(ROOT, '.agent-state', 'chessboard', 'idea-061-market-structure.json');
const REPORT_PATH = path.join(ROOT, '.agent-state', 'chessboard', 'CHESSBOARD_REPORT.md');
const HAS_PRIVATE_DOGFOOD = fs.existsSync(WORKSPACE_PATH) && fs.existsSync(REPORT_PATH);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function assertSentinelsAbsent(root, sentinels) {
  const textExtensions = new Set(['.css', '.csv', '.html', '.js', '.json', '.md', '.txt', '.xml']);
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      if (!entry.isFile() || !textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
      const content = fs.readFileSync(absolute, 'utf8');
      for (const sentinel of sentinels) {
        assert.ok(!content.includes(sentinel), `${path.relative(root, absolute)} exposes private CHESSBOARD sentinel ${sentinel}`);
      }
    }
  }
}

test('strict CHESSBOARD contract validates the private dogfood workspace and preserves the OMEGA publication gate', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const workspace = readJson(WORKSPACE_PATH);
  const result = validateChessboardArtifact(workspace, { artifactPath: WORKSPACE_PATH });

  assert.deepEqual(result.errors, []);
  assert.equal(result.selectionState, 'NO_AUTHORITATIVE_ACTIVE_VENTURE');
  assert.equal(result.expectedSelectionState, 'NO_AUTHORITATIVE_ACTIVE_VENTURE');
  assert.equal(result.counts.strategicClaims, workspace.strategicClaims.length);
  assert.equal(result.counts.sourceRecords, workspace.sourceRecords.length);
  assert.ok(
    workspace.strategicClaims.some(claim => claim.counterEvidenceRefs.length && claim.contradictionStatus === 'NONE'),
    'counterevidence must remain independent from logical contradiction status'
  );
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /^OMEGA_PUBLICATION_GATE:/);
  assert.match(result.warnings[0], /admission before publication/);
  assert.deepEqual(validateChessboardWorkspace(workspace), []);
});

test('strict contract rejects undeclared probabilities, stale revisions, and invented active-venture authority', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const workspace = readJson(WORKSPACE_PATH);

  const scored = clone(workspace);
  scored.strategicClaims[0].successProbability = 0.9;
  const scoredResult = validateChessboardArtifact(scored, { artifactPath: WORKSPACE_PATH });
  assert.ok(scoredResult.errors.some(error => error.includes('additional properties')));
  assert.ok(scoredResult.errors.some(error => error.includes('forbidden score/rank/probability field')));

  const stale = clone(workspace);
  stale.canonicalIdeaRevision = '0'.repeat(64);
  const staleResult = validateChessboardArtifact(stale, { artifactPath: WORKSPACE_PATH });
  assert.ok(staleResult.errors.some(error => error.includes('canonicalIdeaRevision sha256 is stale')));

  const promoted = clone(workspace);
  promoted.selectionAuthority.state = 'AUTHORITATIVE_ACTIVE_VENTURE';
  promoted.selectionAuthority.activeVentureId = promoted.canonicalIdeaId;
  promoted.selectionAuthority.analysisTargetBasis = 'AUTHORITATIVE_SELECTION';
  const promotedResult = validateChessboardArtifact(promoted, { artifactPath: WORKSPACE_PATH });
  assert.ok(promotedResult.errors.some(error => error.includes('selectionAuthority.state must be NO_AUTHORITATIVE_ACTIVE_VENTURE')));
  assert.ok(promotedResult.errors.some(error => error.includes('activeVentureId does not match authoritative state')));
});

test('repository authority and the private A-Z report do not present idea-061 as an active venture', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const workspace = readJson(WORKSPACE_PATH);
  const context = computeExpectedContext();
  const report = fs.readFileSync(REPORT_PATH, 'utf8');
  const headings = [...report.matchAll(/^## ([A-Z])\. .+$/gm)].map(match => match[1]);
  const alphabet = Array.from({ length: 26 }, (_value, index) => String.fromCharCode(65 + index));

  assert.deepEqual(context.authority, {
    state: 'NO_AUTHORITATIVE_ACTIVE_VENTURE',
    activeVentureId: null
  });
  assert.equal(workspace.selectionAuthority.state, context.authority.state);
  assert.equal(workspace.selectionAuthority.activeVentureId, null);
  assert.equal(workspace.selectionAuthority.analysisTargetBasis, 'EXPLICIT_NON_AUTHORITATIVE_DOGFOOD');
  assert.deepEqual(headings, alphabet);
  assert.match(report, /It is not represented as an authoritative active venture\./);
  assert.match(report, /A human must select a venture before any system says one is active\./);
});

test('public artifact publishes the empty lab shell and denies the private workspace path', () => {
  const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'va-chessboard-public-'));
  const distPath = path.join(isolatedRoot, '_site');
  const receiptPath = path.join(isolatedRoot, 'public-artifact-build.json');
  try {
    buildUnlocked({ distPath, receiptPath });
    assert.ok(fs.existsSync(path.join(distPath, 'docs', 'chessboard.html')), 'public artifact must include the data-empty Market Structure Lab shell');
    assert.ok(!fs.existsSync(path.join(distPath, 'research', 'chessboard')), 'private CHESSBOARD research must remain denied');
    if (HAS_PRIVATE_DOGFOOD) {
      const workspace = readJson(WORKSPACE_PATH);
      assertSentinelsAbsent(distPath, [
        workspace.workspaceId,
        workspace.responses[0].responseId,
        workspace.strategicClaims[0].claimId
      ]);
    }
  } finally {
    fs.rmSync(isolatedRoot, { recursive: true, force: true });
  }
});

test('private CHESSBOARD strategy is ignored locally and absent from the Git index', () => {
  const tracked = execFileSync('git', ['ls-files', '--', 'research/chessboard', '.agent-state/chessboard'], {
    cwd: ROOT,
    encoding: 'utf8'
  }).trim();
  assert.equal(tracked, '', 'private CHESSBOARD strategy must never be tracked in Git');
  assert.doesNotThrow(() => execFileSync(
    'git',
    ['check-ignore', '--quiet', '.agent-state/chessboard/idea-061-market-structure.json'],
    { cwd: ROOT, stdio: 'ignore' }
  ));
});

test('Market Structure Lab page, navigation, and offline shell declare all required assets', () => {
  const page = fs.readFileSync(path.join(ROOT, 'docs', 'chessboard.html'), 'utf8');
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const site = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site.js'), 'utf8');
  const serviceWorker = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

  assert.match(page, /<body data-page="chessboard" data-root="\.\.">/);
  assert.match(page, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(page, /href="\.\/chessboard\.html" aria-current="page">Market Structure Lab<\/a>/);
  assert.match(page, /src="\.\.\/assets\/js\/site\.js\?v=/);
  assert.match(page, /src="\.\.\/assets\/js\/core\/chessboard-store\.js\?v=/);
  assert.match(page, /src="\.\.\/assets\/js\/features\/chessboard-lab\.js\?v=/);
  assert.match(home, /href="\.\/docs\/chessboard\.html"[^>]*>Market Structure Lab<\/a>/);
  assert.match(site, /navLink\('chessboard', 'docs\/chessboard\.html', 'Market Structure Lab'\)/);
  for (const asset of [
    './docs/chessboard.html',
    './assets/css/chessboard.css',
    './assets/js/core/chessboard-store.js',
    './assets/js/features/chessboard-engine.js',
    './assets/js/features/chessboard-lab.js'
  ]) {
    assert.ok(serviceWorker.includes(asset), `service worker shell omits ${asset}`);
  }
});

test('browser store supports empty, import, defensive-clone, reset, and rollback flows', { skip: !HAS_PRIVATE_DOGFOOD }, () => {
  const storage = new MemoryStorage();
  const store = new ChessboardStore({
    storage,
    clock: () => '2026-08-25T12:00:00Z',
    idFactory: () => 'chessboard-local-test'
  });
  const importCandidate = readJson(WORKSPACE_PATH);
  const canonicalName = importCandidate.ventureName;

  assert.equal(store.getSummary().empty, true);
  assert.equal(store.getWorkspace().selectionAuthority.state, 'NO_AUTHORITATIVE_ACTIVE_VENTURE');
  assert.equal(store.getWorkspace().canonicalIdeaId, null);

  const imported = store.importJson(importCandidate);
  assert.equal(imported.ventureName, canonicalName);
  assert.equal(store.getSummary().empty, false);
  assert.equal(store.canRollback(), true);

  importCandidate.ventureName = 'caller mutation';
  imported.ventureName = 'return-value mutation';
  const readClone = store.getWorkspace();
  readClone.ventureName = 'read mutation';
  assert.equal(store.getWorkspace().ventureName, canonicalName);
  assert.equal(JSON.parse(store.exportJson()).ventureName, canonicalName);

  const beforeInvalidImport = store.getWorkspace();
  const invalidImport = clone(beforeInvalidImport);
  delete invalidImport.strategicClaims[0].mechanism;
  assert.throws(() => store.importJson(invalidImport), /mechanism is required/);
  assert.deepEqual(store.getWorkspace(), beforeInvalidImport);

  store.rollback();
  assert.equal(store.getSummary().empty, true);
  assert.equal(store.canRollback(), false);

  store.importJson(readJson(WORKSPACE_PATH));
  store.reset();
  assert.equal(store.getSummary().empty, true);
  assert.equal(store.canRollback(), true);
  store.rollback();
  assert.equal(store.getSummary().empty, false);
  assert.equal(store.getWorkspace().ventureName, canonicalName);
});
