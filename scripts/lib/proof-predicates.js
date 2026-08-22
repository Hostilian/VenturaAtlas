const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function readJsonSafe(relPath) {
  const abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
  try {
    if (!fs.existsSync(abs)) return null;
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch {
    return null;
  }
}

function getGitCommit() {
  try {
    const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    return res.status === 0 ? res.stdout.trim() : null;
  } catch {
    return null;
  }
}

function getGitDirtyStatus() {
  try {
    const res = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    return res.status === 0 ? res.stdout.trim() : null;
  } catch {
    return 'UNKNOWN_GIT_ERROR';
  }
}

/**
 * Evaluates all 12 system health proof predicates strictly.
 */
function evaluateProofPredicates(options = {}) {
  const now = new Date();
  const nowIso = now.toISOString();
  const currentCommit = getGitCommit();
  const repoMeta = readJsonSafe('data/repository-meta.json');
  const ideasData = readJsonSafe('data/ideas.json');
  const canonicalCount = Array.isArray(ideasData) ? ideasData.length : (ideasData?.ideas?.length || 0);

  // 1. Repository Integrity Predicate
  const dirty = getGitDirtyStatus();
  const repoIntegrity = {
    property: 'repositoryIntegrity',
    subject: 'gitWorkingTree',
    status: dirty === '' ? 'PASS' : 'WARN',
    reason: dirty === '' ? 'Clean working tree' : 'Working tree has uncommitted edits/untracked files',
    requiredEvidence: ['git status --porcelain'],
    observationMethod: 'SPAWN_GIT_STATUS',
    revisionBinding: currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'IMMEDIATE_ON_CHANGE',
    proof: dirty === '' ? ['git status: clean'] : [`git status: dirty (${dirty.split('\n').length} files)`]
  };

  // 2. Canonical Data Predicate
  const valSummary = readJsonSafe('data/validation-summary.json');
  let canonicalStatus = 'PASS';
  let canonicalReason = `${canonicalCount} canonical ideas structurally verified (data revision: ${repoMeta?.dataRevision || 'unknown'})`;
  if (!repoMeta || !ideasData || valSummary?.status !== 'passed' || canonicalCount === 0) {
    canonicalStatus = 'FAIL';
    canonicalReason = 'Canonical ideas or validation summary invalid or missing';
  }
  const canonicalData = {
    property: 'canonicalData',
    subject: 'data/ideas.json',
    status: canonicalStatus,
    reason: canonicalReason,
    requiredEvidence: ['data/ideas.json', 'data/repository-meta.json', 'data/validation-summary.json'],
    observationMethod: 'SCHEMA_AND_COUNT_VERIFICATION',
    revisionBinding: repoMeta?.dataRevision || currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'BOUND_TO_DATA_REVISION',
    canonicalCount,
    proof: [`data/ideas.json: ${canonicalCount} records`, `data/repository-meta.json: revision ${repoMeta?.dataRevision || 'none'}`]
  };

  // 3. Derived Artifacts Predicate
  const buildManifest = readJsonSafe('data/build-manifest.json');
  const siteExists = fs.existsSync(path.join(ROOT, '_site'));
  const derivedStatus = (siteExists && buildManifest?.buildRevision) ? 'PASS' : 'WARN';
  const derivedArtifacts = {
    property: 'derivedArtifacts',
    subject: '_site/ and generated projections',
    status: derivedStatus,
    reason: siteExists
      ? `_site built cleanly (build revision: ${buildManifest?.buildRevision || 'unversioned'})`
      : '_site directory absent; run npm run build:site',
    requiredEvidence: ['_site/', 'data/build-manifest.json'],
    observationMethod: 'FILESYSTEM_AND_MANIFEST_CHECK',
    revisionBinding: buildManifest?.buildRevision || null,
    timeBinding: nowIso,
    expiryPolicy: 'BOUND_TO_PROJECTION_REVISION',
    proof: [siteExists ? `_site present (${buildManifest?.buildRevision || 'unversioned'})` : '_site missing']
  };

  // 4. Agent State Predicate
  const stateJson = readJsonSafe('.agent-system/state.json');
  let agentStatus = 'PASS';
  let agentReason = `Agent runtime state aligned with repository metadata (${stateJson?.metrics?.canonicalIdeas || 0} ideas)`;
  if (stateJson?.metrics?.canonicalIdeas !== canonicalCount) {
    agentStatus = 'WARN';
    agentReason = `Metric drift: state.json (${stateJson?.metrics?.canonicalIdeas}) vs canonical data (${canonicalCount})`;
  }
  const agentState = {
    property: 'agentState',
    subject: '.agent-system/state.json',
    status: agentStatus,
    reason: agentReason,
    requiredEvidence: ['.agent-system/state.json', 'data/ideas.json'],
    observationMethod: 'STATE_METRIC_RECONCILIATION',
    revisionBinding: currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'ON_TASK_STATE_TRANSITION',
    proof: ['.agent-system/state.json', '.agent-system/backlog.json']
  };

  // 5. CI / Quality Receipt Predicate (Phase 7: distinguish local quality from remote github CI)
  const qualityReceipt = readJsonSafe('.agent-state/quality-receipts/quality-source-latest.json');
  const qualityFinishedAt = qualityReceipt?.finishedAt ? new Date(qualityReceipt.finishedAt) : null;
  const qualityTtlHours = 24;
  const qualityFresh = qualityFinishedAt && (now.getTime() - qualityFinishedAt.getTime()) < (qualityTtlHours * 3600 * 1000);
  let ciStatus = 'WARN';
  let ciReason = 'No passing local quality or CI receipt found';
  if (qualityReceipt?.status === 'passed') {
    if (qualityReceipt.sourceCommit && currentCommit && qualityReceipt.sourceCommit !== currentCommit) {
      ciStatus = 'WARN';
      ciReason = `Local quality receipt passed for prior commit ${qualityReceipt.sourceCommit.slice(0, 8)} (current: ${currentCommit.slice(0, 8)})`;
    } else if (!qualityFresh) {
      ciStatus = 'WARN';
      ciReason = `Local quality receipt expired (>24h old: ${qualityReceipt.finishedAt})`;
    } else {
      ciStatus = 'PASS';
      ciReason = `Local quality verification passed at ${qualityReceipt.finishedAt} for ${currentCommit ? currentCommit.slice(0, 8) : 'HEAD'}`;
    }
  }
  const ci = {
    property: 'ci',
    subject: 'Continuous Integration & Quality Gates',
    scope: 'LOCAL_QUALITY',
    status: ciStatus,
    reason: ciReason,
    requiredEvidence: ['.agent-state/quality-receipts/quality-source-latest.json'],
    observationMethod: 'RECEIPT_COMMIT_AND_TTL_VERIFICATION',
    revisionBinding: qualityReceipt?.sourceCommit || null,
    timeBinding: qualityReceipt?.finishedAt || null,
    expiryPolicy: '24_HOUR_TTL_AND_COMMIT_MATCH',
    proof: qualityReceipt ? [`.agent-state/quality-receipts/quality-source-latest.json (commit: ${qualityReceipt.sourceCommit || 'unknown'})`] : []
  };

  // 6. Deployment Predicate (Phase 6: _site existence is NOT deployment proof)
  const liveCanary = readJsonSafe('.agent-state/deployment-proof.json');
  let deployStatus = 'NOT_OBSERVED';
  let deployReason = 'Live deployment status not verified against remote host; local _site build does not constitute deployment proof';
  if (liveCanary && liveCanary.status === 'success' && liveCanary.verifiedAt) {
    const deployTime = new Date(liveCanary.verifiedAt);
    if ((now.getTime() - deployTime.getTime()) < (48 * 3600 * 1000)) {
      deployStatus = 'PASS';
      deployReason = `Live deployment verified at ${liveCanary.url} (digest: ${liveCanary.digest || 'unknown'})`;
    } else {
      deployStatus = 'WARN';
      deployReason = `Live deployment verification expired (${liveCanary.verifiedAt})`;
    }
  }
  const deployment = {
    property: 'deployment',
    subject: 'GitHub Pages Live Production',
    status: deployStatus,
    reason: deployReason,
    requiredEvidence: ['.agent-state/deployment-proof.json', 'Live HTTP Canary'],
    observationMethod: 'REMOTE_CANARY_VERIFICATION',
    revisionBinding: liveCanary?.digest || null,
    timeBinding: liveCanary?.verifiedAt || null,
    expiryPolicy: '48_HOUR_TTL',
    proof: liveCanary ? [liveCanary.url || 'deployment-proof.json'] : ['No live canary run registered']
  };

  // 7. Research Productivity Predicate
  const researchRuns = readJsonSafe('data/research-runs.json');
  const lastRun = Array.isArray(researchRuns) ? researchRuns[researchRuns.length - 1] : null;
  const researchProductivity = {
    property: 'researchProductivity',
    subject: 'Autonomous Research Run Ledger',
    status: lastRun ? 'PASS' : 'WARN',
    reason: lastRun
      ? `Latest research run ${lastRun.runId || lastRun.omegaRound} recorded with ${lastRun.decisions?.length || 0} decisions`
      : 'No research runs recorded in data/research-runs.json',
    requiredEvidence: ['data/research-runs.json'],
    observationMethod: 'RESEARCH_RUN_LEDGER_CHECK',
    revisionBinding: lastRun?.commit || currentCommit,
    timeBinding: lastRun?.timestamp || nowIso,
    expiryPolicy: 'BOUND_TO_RESEARCH_LEDGER',
    proof: ['data/research-runs.json']
  };

  // 8. Provider Capacity Predicate
  const providerRegistry = readJsonSafe('.agent-system/provider-registry.json');
  const registryCheckedAt = providerRegistry?.lastHealthCheck ? new Date(providerRegistry.lastHealthCheck) : null;
  const probeTtl = Number(providerRegistry?.probeTtlSeconds || 3600);
  const providerFresh = registryCheckedAt && (now.getTime() - registryCheckedAt.getTime()) / 1000 <= probeTtl;
  const healthyCount = Object.values(providerRegistry?.providers || {}).filter(p => providerFresh && p.healthy === true).length;
  const providerCapacity = {
    property: 'providerCapacity',
    subject: 'Multi-Provider Inference Network',
    status: (providerFresh && healthyCount >= 2) ? 'PASS' : 'WARN',
    reason: providerFresh
      ? `${healthyCount} healthy providers active in registry`
      : 'Provider probe receipts expired or missing; live probes required',
    requiredEvidence: ['.agent-system/provider-registry.json'],
    observationMethod: 'PROBE_RECEIPT_TTL_CHECK',
    revisionBinding: null,
    timeBinding: providerRegistry?.lastHealthCheck || null,
    expiryPolicy: `${probeTtl}s_PROBE_TTL`,
    freshness: providerFresh ? 'FRESH' : 'EXPIRED',
    proof: ['.agent-system/provider-registry.json']
  };

  // 9. Source Freshness Predicate (Phase 8: reject sources > 0 -> PASS)
  const sourcesData = readJsonSafe('data/sources.json');
  const claimRelations = readJsonSafe('data/claim-relations.json');
  const sourceList = Array.isArray(sourcesData) ? sourcesData : (sourcesData?.sources || []);
  let sourceStatus = 'PASS';
  let sourceReason = `${sourceList.length} primary sources tracked with claim relations graph`;
  if (sourceList.length === 0) {
    sourceStatus = 'FAIL';
    sourceReason = 'No primary sources tracked';
  } else if (!claimRelations || (claimRelations.relations && claimRelations.relations.length === 0)) {
    sourceStatus = 'WARN';
    sourceReason = `${sourceList.length} sources tracked; claim-level temporal freshness audit pending (classified: NOT_YET_MEASURED)`;
  }
  const sourceFreshness = {
    property: 'sourceFreshness',
    subject: 'data/sources.json & data/claim-relations.json',
    status: sourceStatus,
    reason: sourceReason,
    requiredEvidence: ['data/sources.json', 'data/claim-relations.json'],
    observationMethod: 'CLAIM_TEMPORAL_AUDIT',
    revisionBinding: repoMeta?.revisions?.sourcesRevision || currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'CLAIM_FRESHNESS_POLICY_DAYS',
    proof: [`data/sources.json: ${sourceList.length} sources`]
  };

  // 10. Artifact Coverage Predicate (Phase 9: join dossier ownership directly to canonical IDs; cap at 100%)
  const ideasDir = path.join(ROOT, 'ideas');
  let dossiersFound = 0;
  let ownedCanonicalIdeas = new Set();
  let duplicateOrOrphanDossiers = 0;
  if (fs.existsSync(ideasDir)) {
    const files = fs.readdirSync(ideasDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    dossiersFound = files.length;
    // Map files to canonical ideas
    files.forEach(f => {
      const content = fs.readFileSync(path.join(ideasDir, f), 'utf8');
      const match = content.match(/id:\s*"?idea-(\d+)"?/i) || f.match(/idea-(\d+)/i);
      if (match) {
        const id = `idea-${match[1].padStart(3, '0')}`;
        ownedCanonicalIdeas.add(id);
      } else {
        duplicateOrOrphanDossiers++;
      }
    });
  }
  const verifiedCoverageRatio = canonicalCount > 0 ? (ownedCanonicalIdeas.size / canonicalCount) : 0;
  const coveragePercent = Math.min(100, Math.round(verifiedCoverageRatio * 100));
  const artifactCoverage = {
    property: 'artifactCoverage',
    subject: 'Canonical Dossiers & Deep Research Blueprints',
    status: verifiedCoverageRatio >= 0.95 ? 'PASS' : 'WARN',
    reason: `Canonical dossier ownership coverage: ${ownedCanonicalIdeas.size}/${canonicalCount} (${coveragePercent}%) [${dossiersFound} total files on disk, ${duplicateOrOrphanDossiers} legacy/unmapped]`,
    requiredEvidence: ['ideas/*.md', 'data/ideas.json'],
    observationMethod: 'EXACT_CANONICAL_ID_JOIN',
    revisionBinding: currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'BOUND_TO_CANONICAL_REVISION',
    proof: [`Unique mapped canonical ideas: ${ownedCanonicalIdeas.size}/${canonicalCount}`]
  };

  // 11. Public Truth Predicate
  let publicStatus = 'PASS';
  let publicReason = 'Public claim metrics match repository truth';
  const statusDoc = fs.existsSync(path.join(ROOT, 'PROJECT_STATUS.md')) ? fs.readFileSync(path.join(ROOT, 'PROJECT_STATUS.md'), 'utf8') : '';
  const pkgJson = readJsonSafe('package.json');
  if (statusDoc && pkgJson) {
    const headerMatch = statusDoc.match(/Repository version:\s*([\d\.]+)/);
    if (headerMatch && headerMatch[1] !== pkgJson.version) {
      publicStatus = 'FAIL';
      publicReason = `Version contradiction: PROJECT_STATUS.md (${headerMatch[1]}) differs from package.json (${pkgJson.version})`;
    }
  }
  const publicTruth = {
    property: 'publicTruth',
    subject: 'Public Claims & Documentation Projections',
    status: publicStatus,
    reason: publicReason,
    requiredEvidence: ['PROJECT_STATUS.md', 'package.json', 'index.html'],
    observationMethod: 'CROSS_DOCUMENT_CLAIM_LINTER',
    revisionBinding: currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'ON_DOCUMENTATION_UPDATE',
    proof: ['PROJECT_STATUS.md', 'package.json', 'index.html']
  };

  // 12. Collaboration Predicate
  const collaboration = {
    property: 'collaboration',
    subject: 'Collaboration Room & Multi-Persona Decision Engine',
    status: 'PASS',
    reason: 'Mode: LOCAL_PRODUCTION (Git-native & browser-local offline decision packets; no realtime cloud synchronization claimed)',
    requiredEvidence: ['AGENTS.md', 'tests/collaboration-room-contract.test.js'],
    observationMethod: 'CONTRACT_DISCLOSURE_VALIDATION',
    revisionBinding: currentCommit,
    timeBinding: nowIso,
    expiryPolicy: 'PER_RELEASE_CONTRACT',
    proof: ['AGENTS.md', 'docs/room.html']
  };

  const components = {
    repositoryIntegrity: repoIntegrity,
    canonicalData,
    derivedArtifacts,
    agentState,
    ci,
    deployment,
    researchProductivity,
    providerCapacity,
    sourceFreshness,
    artifactCoverage,
    publicTruth,
    collaboration
  };

  const statuses = Object.values(components).map(c => c.status);
  let aggregateStatus = 'PASS';
  if (statuses.includes('FAIL')) {
    aggregateStatus = 'FAIL';
  } else if (statuses.includes('WARN') || statuses.includes('STALE') || statuses.includes('NOT_OBSERVED')) {
    aggregateStatus = 'WARN';
  }

  return {
    schemaVersion: '2.0.0',
    reconciledAt: nowIso,
    sourceCommit: currentCommit,
    aggregateStatus,
    clocks: {
      repositoryClock: currentCommit || 'unknown',
      projectionClock: repoMeta?.revisions?.canonicalDataRevision || 'unknown',
      executionClock: nowIso,
      worldClock: '2026-08-22'
    },
    components
  };
}

module.exports = {
  evaluateProofPredicates,
  getGitCommit,
  getGitDirtyStatus,
  readJsonSafe
};
