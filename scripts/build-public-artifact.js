const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { buildReceipt: buildArtifactManifest } = require('./hash-public-artifact');
const { deriveLifecycleForPublic } = require('./lib/lifecycle-receipts');

const ROOT = path.resolve(__dirname, '..');
const ROOT_REAL = fs.realpathSync(ROOT);
const DIST = path.join(ROOT, '_site');
const ARTIFACT_LOCK = path.join(ROOT, '.agent-state', 'locks', 'public-artifact.lock');
const ARTIFACT_BUILD_RECEIPT = path.join(ROOT, '.agent-state', 'quality-receipts', 'public-artifact-build-latest.json');
const lockSleepArray = new Int32Array(new SharedArrayBuffer(4));

const ALLOW_FILES = [
  'index.html',
  '404.html',
  'offline.html',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'sw.js',
  '.nojekyll',
  'SEARCH_AND_DISCOVERY_GUIDE.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'SECURITY.md'
];

const ALLOW_DIRS = [
  'assets',
  'categories',
  'collaboration',
  'comparisons',
  'data',
  'decisions',
  'docs',
  'financial-models',
  'launch-plans',
  'prompts',
  'technical-blueprints',
  'templates',
  'validation-plans'
];

const ALLOW_PATHS = [
  'research/assumptions.md',
  'research/completeness-audit.md',
  'research/final-summary.md',
  'research/methodology.md',
  'research/research-plan.md',
  'research/scoring-methodology.md'
];

const DENIED_PATTERNS = [
  /\.env(\..*)?$/i,
  /node_modules/i,
  /^\.git/i,
  /^\.agent-state/i,
  /^\.agents/i,
  /^\.codex/i,
  /^apps/i,
  /^tests/i,
  /^scripts/i,
  /^cloud-control-plane/i,
  /^services/i,
  /idea-staging-queue\.json$/i,
  /^data\/sources\.json$/i,
  /provider-state\.json$/i,
  /staged-id-migration\.json$/i,
  /migration-preflight\.json$/i,
  /package(-lock)?\.json$/i,
  /tsconfig.*\.json$/i,
  /^research\/(audits|original-chat|constitution)(\/|$)/i,
  /^meeting-packets(\/|$)/i,
  /^prompts\/original(?:\/|-|$)/i,
  /^prompts\/reconstructed-repository-build-prompt\.md$/i,
  /^docs\/REPO_AUDIT/i,
  /^ideas(\/|$)/i,
  /^rankings(\/|$)/i,
  /(^|\/)AGENTS(?:\.override)?\.md$/i
];

const PUBLIC_DATA_ALLOWLIST = new Set([
  'ideas.json',
  'ideas.schema.json',
  'idea-taxonomy.json',
  'categories.json',
  'public-sources.json',
  'rankings.json',
  'search-index.json',
  'research-proposal-catalog.json',
  'repository-meta.json',
  'relationships.json',
  'prompts.json',
  'validation-summary.json'
]);

let publicSourceIds = new Set();
let internalSourceIds = new Set();
let internalSourceTerms = new Set();
let lifecycleReceipts = { schemaVersion: '1.0.0', receipts: [] };
let researchRunIds = new Set();
let validationRunIds = new Set();
let researchRunById = new Map();
let validationRunById = new Map();
let claimRelationIds = new Set();
let trustedReviewerIds = new Set();
let rankingMethodKeys = new Set();
let publicLifecycleByIdea = new Map();

const PROJECTED_TEXT_EXTENSIONS = new Set(['.html', '.json', '.md', '.txt', '.xml', '.csv']);

function redactInternalSourceIds(text) {
  let projected = text;
  for (const term of internalSourceTerms) {
    projected = projected.replaceAll(term, 'INTERNAL_PROVENANCE_WITHHELD');
  }
  return projected;
}

function copyPublicFile(src, dest) {
  assertSafeSourcePath(src);
  if (PROJECTED_TEXT_EXTENSIONS.has(path.extname(src).toLowerCase())) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, redactInternalSourceIds(fs.readFileSync(src, 'utf8')), 'utf8');
  } else {
    fs.copyFileSync(src, dest);
  }
}

function assertSafeSourcePath(src) {
  const stat = fs.lstatSync(src);
  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link in public artifact source: ${path.relative(ROOT, src)}`);
  }
  const realPath = fs.realpathSync(src);
  const relativeRealPath = path.relative(ROOT_REAL, realPath);
  if (relativeRealPath.startsWith(`..${path.sep}`) || path.isAbsolute(relativeRealPath)) {
    throw new Error(`Public artifact source escapes repository root: ${src}`);
  }
  return stat;
}

function writeJson(dest, value) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function projectIdeasForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);
  const projected = ideas.map(idea => {
    const result = { ...idea };
    const lifecycle = deriveLifecycleForPublic(idea, lifecycleReceipts, {
      publicSourceIds, researchRunIds, validationRunIds, researchRunById,
      validationRunById, claimRelationIds, trustedReviewerIds, rankingMethodKeys
    });
    publicLifecycleByIdea.set(idea.id, lifecycle);
    result.scoreMaturity = 'legacy_unverified';
    result.canonicalIdentity = lifecycle.canonicalIdentity;
    result.researchMaturity = lifecycle.researchMaturity;
    result.rankingEligible = lifecycle.rankingEligible;
    result.rankingUniverse = lifecycle.rankingUniverse;
    result.validationMaturity = lifecycle.validationMaturity;
    result.lifecycleReceiptStatus = lifecycle.receiptStatus;
    result.scoreScaleComparabilityEstablished = false;
    const legacyValidationLabel = result.validationStatus || result.atAGlance?.validationStatus;
    if (legacyValidationLabel && lifecycle.validationMaturity === 'NOT_VALIDATED') {
      result.legacyValidation = {
        label: legacyValidationLabel,
        recordedAt: result.lastValidatedAt || result.sourceCheckedAt || null,
        assessment: 'unproven legacy migration output; not evidence of validation'
      };
      result.validationStatus = 'unproven';
      if (result.atAGlance && typeof result.atAGlance === 'object') {
        result.atAGlance = { ...result.atAGlance, validationStatus: 'unproven' };
      }
      delete result.lastValidatedAt;
      delete result.sourceCheckedAt;
      delete result.evidenceFreshness;
    } else if (lifecycle.validationMaturity !== 'NOT_VALIDATED') {
      result.validationStatus = lifecycle.validationMaturity;
      if (result.atAGlance && typeof result.atAGlance === 'object') {
        result.atAGlance = { ...result.atAGlance, validationStatus: lifecycle.validationMaturity };
      }
    }
    if (result.epistemicMetadata && typeof result.epistemicMetadata === 'object') {
      result.legacyEpistemicMigration = {
        truthClass: result.epistemicMetadata.truthClass || null,
        confidenceClass: result.epistemicMetadata.confidenceClass || null,
        assessment: 'unproven record-level heuristic migration; not claim-level evidence'
      };
      result.epistemicMetadata = {
        truthClass: 'T4_UNKNOWN',
        confidenceClass: 'UNASSESSED',
        assessmentBasis: 'public projection has no verified claim-level evidence receipt'
      };
    }
    if (Array.isArray(result.sourceReferences)) {
      result.sourceReferences = result.sourceReferences.filter(reference => {
        const sourceId = typeof reference === 'string' ? reference : reference?.id;
        return publicSourceIds.has(sourceId);
      });
    }
    if (Array.isArray(result.evidence)) {
      result.evidence = result.evidence.filter(item => publicSourceIds.has(item?.sourceId));
    }
    return result;
  });
  const publicIdeasDocument = Array.isArray(raw) ? projected : { ...raw, ideas: projected };
  writeJson(dest, JSON.parse(redactInternalSourceIds(JSON.stringify(publicIdeasDocument))));
}

function projectValidationSummaryForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  writeJson(dest, {
    schemaVersion: '1.0.0',
    contract: 'structural-and-referential',
    contractStatus: raw.status,
    canonicalCount: raw.canonicalCount,
    errorCount: raw.errorCount,
    warningCount: raw.warningCount,
    epistemicValidation: 'not_assessed',
    note: 'A passing contract does not validate market claims, evidence quality, freshness, or ranking eligibility.'
  });
}

function projectRepositoryMetaForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const counts = { ...(raw.counts || {}) };
  delete counts.stagedIdeas;
  delete counts.totalIdeas;
  counts.sources = publicSourceIds.size;
  const publicPrompts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'prompts.json'), 'utf8'));
  counts.prompts = Array.isArray(publicPrompts) ? publicPrompts.length : 0;
  const projected = { ...raw, contract: 'public-projection', counts };
  delete projected.dataRevision;
  delete projected.buildRevision;
  delete projected.gitCommit;
  delete projected.generatedAt;
  delete projected.revisions;
  writeJson(dest, projected);
}

function projectRankingsForPublic(src, dest) {
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const legacyViews = raw.rankings || [];
  const overall = legacyViews.find(view => view.id === 'overall-top-opportunities') || legacyViews[0] || { items: [] };
  const researchedIds = (overall.items || []).map(item => item.ideaId || item.id).filter(id => publicLifecycleByIdea.get(id)?.rankingUniverse === 'RESEARCHED');
  const validationIds = (overall.items || []).map(item => item.ideaId || item.id).filter(id => publicLifecycleByIdea.get(id)?.rankingUniverse === 'VALIDATION');
  const projected = {
    ...raw,
    maturity: 'legacy_unverified',
    eligibilityEnforced: false,
    coverageAssessed: false,
    scaleComparabilityEstablished: false,
    universes: {
      legacy: { maturity: 'legacy_unverified', views: legacyViews.map(view => view.id) },
      hypothesis: { maturity: 'canonical_hypothesis', eligibleIds: [...publicLifecycleByIdea.keys()] },
      researched: { maturity: 'receipt_verified_eligibility_only', eligibleIds: researchedIds, scoresPublished: false },
      validation: { maturity: 'receipt_verified_eligibility_only', eligibleIds: validationIds, scoresPublished: false }
    },
    rankings: legacyViews.map(view => ({
      ...view,
      maturity: 'legacy_unverified',
      description: 'Legacy heuristic order retained for provenance; eligibility, evidence coverage, and score-scale comparability are not established.'
    }))
  };
  delete projected.generatedAt;
  delete projected.history;
  writeJson(dest, JSON.parse(redactInternalSourceIds(JSON.stringify(projected))));
}

function isDenied(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized.startsWith('data/')) {
    const filename = path.basename(normalized);
    if (!PUBLIC_DATA_ALLOWLIST.has(filename)) {
      return true;
    }
  }
  return DENIED_PATTERNS.some(pattern => pattern.test(normalized));
}

function copyRecursive(src, dest) {
  const stat = assertSafeSourcePath(src);
  let count = 0;

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      const srcItem = path.join(src, entry);
      const destItem = path.join(dest, entry);
      const relPath = path.relative(ROOT, srcItem);
      if (!isDenied(relPath)) {
        count += copyRecursive(srcItem, destItem);
      }
    }
  } else if (stat.isFile()) {
    const relPath = path.relative(ROOT, src);
    if (!isDenied(relPath)) {
      const normalized = relPath.replace(/\\/g, '/');
      if (normalized === 'data/ideas.json') {
        projectIdeasForPublic(src, dest);
      } else if (normalized === 'data/repository-meta.json') {
        projectRepositoryMetaForPublic(src, dest);
      } else if (normalized === 'data/rankings.json') {
        projectRankingsForPublic(src, dest);
      } else if (normalized === 'data/validation-summary.json') {
        projectValidationSummaryForPublic(src, dest);
      } else {
        copyPublicFile(src, dest);
      }
      count++;
    }
  }
  return count;
}

function buildUnlocked() {
  console.log('=== Building Public GitHub Pages Staging Directory (_site) ===\n');

  // Fail closed: a stale/missing public evidence projection must abort the build.
  console.log('[BUILD] Generating public sources projection (data/public-sources.json)...');
  execSync('python scripts/build_public_sources.py', { cwd: ROOT, stdio: 'inherit' });
  execSync('node scripts/validate-lifecycle-receipts.js', { cwd: ROOT, stdio: 'inherit' });
  const projectedSources = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'public-sources.json'), 'utf8')
  );
  publicSourceIds = new Set(projectedSources.map(source => source.id));
  const allSources = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'));
  lifecycleReceipts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lifecycle-receipts.json'), 'utf8'));
  const researchRuns = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'research-runs.json'), 'utf8'));
  const researchRunList = Array.isArray(researchRuns) ? researchRuns : researchRuns.runs || [];
  researchRunIds = new Set(researchRunList.map(run => run.runId));
  researchRunById = new Map(researchRunList.map(run => [run.runId, run]));
  const validationRuns = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'validation-runs.json'), 'utf8'));
  const validationRunList = Array.isArray(validationRuns) ? validationRuns : validationRuns.runs || [];
  validationRunIds = new Set(validationRunList.map(run => run.runId));
  validationRunById = new Map(validationRunList.map(run => [run.runId, run]));
  const claimRelations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'claim-relations.json'), 'utf8'));
  claimRelationIds = new Set((claimRelations.relations || []).map(relation => relation.relationId));
  const reviewerAuthorities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'reviewer-authorities.json'), 'utf8'));
  trustedReviewerIds = new Set((reviewerAuthorities.authorities || []).filter(item => item.active === true).map(item => `${item.id}:${item.role}`));
  const rankingMethods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ranking-method-registry.json'), 'utf8'));
  rankingMethodKeys = new Set((rankingMethods.methods || []).filter(item => item.active === true).map(item => `${item.methodVersion}:${item.scoreScaleVersion}`));
  internalSourceIds = new Set(
    allSources.filter(source => source.visibility !== 'PUBLIC').map(source => source.id)
  );
  internalSourceTerms = new Set(
    allSources
      .filter(source => source.visibility !== 'PUBLIC')
      .flatMap(source => [source.id, source.title].filter(Boolean))
  );

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  fs.mkdirSync(DIST, { recursive: true });

  let totalFiles = 0;

  for (const f of ALLOW_FILES) {
    const srcPath = path.join(ROOT, f);
    if (fs.existsSync(srcPath) && !isDenied(f)) {
      copyPublicFile(srcPath, path.join(DIST, f));
      totalFiles++;
    }
  }

  for (const d of ALLOW_DIRS) {
    const srcDir = path.join(ROOT, d);
    if (fs.existsSync(srcDir) && !isDenied(d)) {
      totalFiles += copyRecursive(srcDir, path.join(DIST, d));
    }
  }

  for (const relativePath of ALLOW_PATHS) {
    const srcPath = path.join(ROOT, relativePath);
    if (fs.existsSync(srcPath) && !isDenied(relativePath)) {
      const destPath = path.join(DIST, relativePath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      copyPublicFile(srcPath, destPath);
      totalFiles++;
    }
  }

  const artifactManifest = buildArtifactManifest(DIST);
  if (artifactManifest.fileCount !== totalFiles) {
    throw new Error(`Public artifact changed during build: copied ${totalFiles} files but hashed ${artifactManifest.fileCount}`);
  }
  fs.mkdirSync(path.dirname(ARTIFACT_BUILD_RECEIPT), { recursive: true });
  const temporaryReceipt = `${ARTIFACT_BUILD_RECEIPT}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryReceipt, `${JSON.stringify({
    schemaVersion: 1,
    receiptKind: 'public-artifact-build',
    fileCount: artifactManifest.fileCount,
    totalBytes: artifactManifest.totalBytes,
    treeSha256: artifactManifest.treeSha256,
  }, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryReceipt, ARTIFACT_BUILD_RECEIPT);
  console.log(`[OK] Staging complete! ${totalFiles} files written to: ${DIST}`);
}

function build() {
  fs.mkdirSync(path.dirname(ARTIFACT_LOCK), { recursive: true });
  const deadline = Date.now() + 30_000;
  while (true) {
    try {
      fs.mkdirSync(ARTIFACT_LOCK);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST' || Date.now() >= deadline) {
        throw new Error(`Could not acquire public-artifact writer lock: ${error.message}`);
      }
      Atomics.wait(lockSleepArray, 0, 0, 100);
    }
  }
  try {
    return buildUnlocked();
  } finally {
    fs.rmSync(ARTIFACT_LOCK, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  }
}

if (require.main === module) {
  build();
}

module.exports = { assertSafeSourcePath, build, buildUnlocked };
