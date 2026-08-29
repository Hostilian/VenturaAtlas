#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildReceipt: buildArtifactManifest } = require('./hash-public-artifact');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_DIRECTORY = path.join(ROOT, '.agent-state', 'quality-receipts');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const pythonCommand = process.env.PYTHON || 'python';

// Tier 1: Fast (<2s preflight on every edit / hook)
const FAST_STEPS = [
  ['fast-js-syntax', process.execPath, ['scripts/check-js-syntax.js']],
  ['fast-python-syntax', pythonCommand, ['scripts/check_python_syntax.py']],
  ['fast-css-preflight', process.execPath, ['scripts/check-css-fast.js']],
  ['fast-format-check', process.execPath, ['scripts/check-format.js']],
  ['fast-typecheck', npmCommand, ['run', 'typecheck']],
  ['fast-ai-antipatterns', process.execPath, ['scripts/validate-ai-antipatterns.js']],
  ['fast-design-tokens', process.execPath, ['scripts/validate-design-tokens.js']],
  ['fast-todos', process.execPath, ['scripts/validate-todos.js']],
  ['fast-task-graph', npmCommand, ['run', 'check-task-graph']],
];

// Tier 2: Agent (<15s complete static invariants and data boundaries)
const AGENT_STEPS = [
  ...FAST_STEPS,
  ['source-validation', npmCommand, ['run', 'validate:source']],
  ['completion-audit', npmCommand, ['run', 'validate:completion']],
  ['repository-meta-check', process.execPath, ['scripts/build-repository-meta.js', '--check']],
  ['projection-check', npmCommand, ['run', 'check:projections']],
  ['repository-consistency', npmCommand, ['run', 'check-consistency']],
  ['autonomy-contract', npmCommand, ['run', 'check:autonomy']],
  ['repository-drift', npmCommand, ['run', 'check:drift']],
  ['constitution-integrity', pythonCommand, ['scripts/verify_constitution.py']],
  ['privacy-scan', pythonCommand, ['scripts/check_privacy.py']],
  ['component-registry-check', process.execPath, ['scripts/discover-components.js', '--check']],
  ['headless-smoke', process.execPath, ['scripts/lightpanda-smoke.js']],
];

// Tier 3: Deep (<60s full unit tests, lints, complexity & dead code audits, headless browser)
const DEEP_STEPS = [
  ...AGENT_STEPS,
  ['node-unit-tests', npmCommand, ['run', 'test:unit']],
  ['python-tests', npmCommand, ['run', 'test:python']],
  ['stylelint-check', npxCommand, ['stylelint', 'assets/css/**/*.css']],
  ['knip-dead-code-audit', process.execPath, ['scripts/check-knip.js']],
  ['jscpd-duplication-gate', process.execPath, ['scripts/check-jscpd.js']],
  ['fallow-health-audit', process.execPath, ['scripts/check-fallow.js']],
  ['project-wallace-css-metrics', process.execPath, ['scripts/check-css-metrics.js']],
  ['agent-browser-verification', process.execPath, ['scripts/agent-browser.js']],
];

// Tier 4: Release (production bundle build, verified integrity, zero-dirty state)
const RELEASE_STEPS = [
  ...DEEP_STEPS,
  ['artifact-build-and-validation', npmCommand, ['run', 'build:verified']],
];

// Legacy compatibility aliases
const SOURCE_STEPS = [
  ['source-lint', npmCommand, ['run', 'lint']],
  ['factbounty-typecheck', npmCommand, ['run', 'typecheck']],
  ['node-unit-tests', npmCommand, ['run', 'test:unit']],
  ['python-tests', npmCommand, ['run', 'test:python']],
  ['source-validation', npmCommand, ['run', 'validate:source']],
  ['completion-audit', npmCommand, ['run', 'validate:completion']],
  ['repository-meta-check', process.execPath, ['scripts/build-repository-meta.js', '--check']],
  ['projection-check', npmCommand, ['run', 'check:projections']],
  ['repository-consistency', npmCommand, ['run', 'check-consistency']],
  ['task-graph', npmCommand, ['run', 'check-task-graph']],
  ['autonomy-contract', npmCommand, ['run', 'check:autonomy']],
  ['repository-drift', npmCommand, ['run', 'check:drift']],
  ['constitution-integrity', pythonCommand, ['scripts/verify_constitution.py']],
  ['privacy-scan', pythonCommand, ['scripts/check_privacy.py']],
];

const ARTIFACT_STEPS = [
  ['artifact-build-and-validation', npmCommand, ['run', 'build:verified']],
];

// 14-Step Deterministic Completion Gate (§7)
const GATE_STEPS = [
  ['check-js', npmCommand, ['run', 'check-js']],
  ['check-python', npmCommand, ['run', 'check-python']],
  ['typecheck', npmCommand, ['run', 'typecheck']],
  ['check-eslint', npmCommand, ['run', 'check:eslint']],
  ['check-stylelint', npmCommand, ['run', 'check:stylelint']],
  ['format-check', npmCommand, ['run', 'format:check']],
  ['check-duplicates', npmCommand, ['run', 'check:duplicates']],
  ['check-unused', npmCommand, ['run', 'check:unused']],
  ['validate-source', npmCommand, ['run', 'validate:source']],
  ['check-inventory', npmCommand, ['run', 'check:inventory']],
  ['check-browser', npmCommand, ['run', 'check:browser']],
  ['test-unit', npmCommand, ['run', 'test:unit']],
  ['check-bugs', npmCommand, ['run', 'check:bugs']],
  ['check-task-graph', npmCommand, ['run', 'check-task-graph']],
];

const PROFILES = {
  fast: FAST_STEPS,
  agent: AGENT_STEPS,
  deep: DEEP_STEPS,
  release: RELEASE_STEPS,
  gate: GATE_STEPS,
  source: SOURCE_STEPS,
  artifact: ARTIFACT_STEPS,
};

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function atomicWriteJson(targetPath, value) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, targetPath);
}

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  return result.status === 0 ? result.stdout : null;
}

function parseStatusPaths(raw) {
  if (raw === null || raw === '') return [];
  const records = raw.split('\0').filter(Boolean);
  const paths = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (record.length < 4) continue;
    paths.push(record.slice(3));
    if (record[0] === 'R' || record[0] === 'C' || record[1] === 'R' || record[1] === 'C') {
      index += 1;
      if (records[index]) paths.push(records[index]);
    }
  }
  return [...new Set(paths)].sort();
}

function statusPaths() {
  const raw = gitOutput(['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (raw === null) throw new Error('unable to establish Git worktree status');
  return parseStatusPaths(raw);
}

function snapshotWorktree() {
  const snapshot = new Map();
  for (const relativePath of statusPaths()) {
    const absolutePath = path.join(ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) {
      snapshot.set(relativePath, 'MISSING');
    } else if (fs.statSync(absolutePath).isFile()) {
      snapshot.set(relativePath, sha256(fs.readFileSync(absolutePath)));
    } else {
      snapshot.set(relativePath, 'DIRECTORY');
    }
  }
  return snapshot;
}

function changedPaths(before, after) {
  const allPaths = new Set([...before.keys(), ...after.keys()]);
  return [...allPaths].filter(item => before.get(item) !== after.get(item)).sort();
}

function executeStep(step) {
  return spawnSync(step.command, step.args, {
    cwd: ROOT,
    stdio: 'inherit',
    windowsHide: true,
    shell: shouldUseShell(step.command),
    env: process.env,
  });
}

function shouldUseShell(command) {
  return process.platform === 'win32' && /\.(cmd|bat)$/i.test(command);
}

function appendStepSummary(receipt, summaryPath) {
  if (!summaryPath) return;
  const failure = receipt.failedPhase ? `; failed phase: \`${receipt.failedPhase}\`` : '';
  const mutation = receipt.generatedMutationDetected
    ? `\n\nWorktree mutations detected: ${receipt.affectedPaths.map(item => `\`${item}\``).join(', ')}`
    : '';
  fs.appendFileSync(
    summaryPath,
    `## VenturaAtlas ${receipt.profile} quality\n\nStatus: **${receipt.status.toUpperCase()}**${failure}. Receipt commit: \`${receipt.sourceCommit || 'unknown'}\`.\n${mutation}\n`,
    'utf8',
  );
}

function runQuality(options = {}) {
  const profile = options.profile || 'source';
  const rawSteps = options.steps || PROFILES[profile];
  if (!rawSteps) throw new Error(`Unknown quality profile: ${profile}`);

  const steps = rawSteps.map(item => Array.isArray(item)
    ? { id: item[0], command: item[1], args: item[2] }
    : item);
  const receiptPath = options.receiptPath
    || process.env.VA_QUALITY_RECEIPT_PATH
    || path.join(RECEIPT_DIRECTORY, `quality-${profile}-latest.json`);
  const artifactPath = options.artifactPath || path.join(ROOT, '_site');
  const artifactManifestPath = options.artifactManifestPath
    || path.join(RECEIPT_DIRECTORY, 'public-artifact-manifest-latest.json');
  const artifactBuildReceiptPath = options.artifactBuildReceiptPath
    || path.join(RECEIPT_DIRECTORY, 'public-artifact-build-latest.json');
  const requireArtifactBuildReceipt = options.requireArtifactBuildReceipt ?? !options.steps;
  const execute = options.execute || executeStep;
  const snapshot = options.snapshot || snapshotWorktree;
  const commit = options.sourceCommit || (() => gitOutput(['rev-parse', 'HEAD'])?.trim() || null);
  const logger = options.logger || console;
  const environment = options.environment || process.env;
  const startedAt = new Date();
  const startingCommit = commit();
  let gitSnapshotAvailable = true;
  let before;
  try {
    before = snapshot();
  } catch (error) {
    gitSnapshotAvailable = false;
    before = new Map();
    logger.error?.(`[QUALITY] ${error.message}`);
  }
  const validators = [];
  const durations = {};
  let failedPhase = null;
  let failedCommand = null;
  let exitCode = 0;

  for (const step of steps) {
    logger.log(`[QUALITY] ${step.id}: ${step.command} ${step.args.join(' ')}`);
    const stepStarted = process.hrtime.bigint();
    const result = execute(step);
    const elapsedSeconds = Number(process.hrtime.bigint() - stepStarted) / 1e9;
    const stepExitCode = Number.isInteger(result.status) ? result.status : 1;
    durations[step.id] = Number(elapsedSeconds.toFixed(3));
    validators.push({
      id: step.id,
      status: stepExitCode === 0 ? 'passed' : 'failed',
      exitCode: stepExitCode,
      durationSeconds: durations[step.id],
    });
    if (stepExitCode !== 0) {
      failedPhase = step.id;
      failedCommand = [step.command, ...step.args].join(' ');
      exitCode = stepExitCode;
      break;
    }
  }

  let artifactManifest = null;
  if ((profile === 'artifact' || profile === 'release') && exitCode === 0) {
    const stabilityStarted = process.hrtime.bigint();
    try {
      const firstManifest = buildArtifactManifest(artifactPath);
      const secondManifest = buildArtifactManifest(artifactPath);
      let buildReceipt = null;
      if (requireArtifactBuildReceipt) {
        buildReceipt = JSON.parse(fs.readFileSync(artifactBuildReceiptPath, 'utf8'));
      }
      const stable = firstManifest.treeSha256 === secondManifest.treeSha256
        && firstManifest.fileCount === secondManifest.fileCount
        && (!buildReceipt || (
          buildReceipt.treeSha256 === secondManifest.treeSha256
          && buildReceipt.fileCount === secondManifest.fileCount
          && buildReceipt.totalBytes === secondManifest.totalBytes
        ));
      if (!stable) throw new Error('public artifact changed between build, validation, and receipt hashing');
      artifactManifest = secondManifest;
      atomicWriteJson(artifactManifestPath, artifactManifest);
      durations['artifact-tree-stability'] = Number((Number(process.hrtime.bigint() - stabilityStarted) / 1e9).toFixed(3));
      validators.push({ id: 'artifact-tree-stability', status: 'passed', exitCode: 0, durationSeconds: durations['artifact-tree-stability'] });
    } catch (_stabilityErr) {
      durations['artifact-tree-stability'] = Number((Number(process.hrtime.bigint() - stabilityStarted) / 1e9).toFixed(3));
      validators.push({ id: 'artifact-tree-stability', status: 'failed', exitCode: 1, durationSeconds: durations['artifact-tree-stability'] });
      failedPhase = 'artifact-tree-stability';
      failedCommand = 'deterministic public artifact stability verification';
      exitCode = 1;
    }
  }
  const finishingCommit = commit();
  if (!startingCommit || !finishingCommit || !gitSnapshotAvailable) {
    validators.push({ id: 'git-evidence', status: 'failed', exitCode: 1, durationSeconds: 0 });
    durations['git-evidence'] = 0;
    if (exitCode === 0) {
      failedPhase = 'git-evidence';
      failedCommand = 'Git revision and worktree evidence must be available';
      exitCode = 1;
    }
  } else if (startingCommit !== finishingCommit) {
    validators.push({ id: 'commit-stability', status: 'failed', exitCode: 1, durationSeconds: 0 });
    durations['commit-stability'] = 0;
    if (exitCode === 0) {
      failedPhase = 'commit-stability';
      failedCommand = 'git rev-parse HEAD remained stable for the quality run';
      exitCode = 1;
    }
  }
  let after;
  try {
    after = snapshot();
  } catch (error) {
    gitSnapshotAvailable = false;
    after = new Map(before);
    if (!validators.some(item => item.id === 'git-evidence')) {
      validators.push({ id: 'git-evidence', status: 'failed', exitCode: 1, durationSeconds: 0 });
      durations['git-evidence'] = 0;
    }
    if (exitCode === 0) {
      failedPhase = 'git-evidence';
      failedCommand = 'Git revision and worktree evidence must be available';
      exitCode = 1;
    }
  }
  const affectedPaths = changedPaths(before, after);
  const warnings = [];
  if (affectedPaths.length > 0) {
    warnings.push('Git-visible net worktree state changed during the quality run; inspect affectedPaths.');
    if ((profile === 'source' || profile === 'fast' || profile === 'agent' || profile === 'gate') && exitCode === 0) {
      failedPhase = 'git-visible-worktree-stability';
      failedCommand = 'source quality verification must preserve Git-visible net worktree state';
      exitCode = 1;
    }
  }
  if (startingCommit !== finishingCommit) warnings.push('HEAD changed while the quality run was executing; the receipt is failed closed.');
  const finishedAt = new Date();
  const receipt = {
    schemaVersion: 1,
    receiptKind: `${profile}-quality`,
    profile,
    status: exitCode === 0 ? 'passed' : 'failed',
    sourceCommit: startingCommit,
    finishedCommit: finishingCommit,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    failedPhase,
    failedCommand,
    exitCode,
    durations,
    validators,
    worktreeStabilityScope: 'GIT_VISIBLE_NET_STATE',
    generatedMutationDetected: affectedPaths.length > 0,
    affectedPaths,
    preexistingDirtyPaths: [...before.keys()].sort(),
    warnings,
    artifactDigest: artifactManifest?.treeSha256 || null,
    artifactFileCount: artifactManifest?.fileCount || null,
    artifactTotalBytes: artifactManifest?.totalBytes || null,
    artifactManifest: artifactManifest
      ? path.relative(ROOT, artifactManifestPath).replace(/\\/g, '/')
      : null,
  };
  atomicWriteJson(receiptPath, receipt);
  appendStepSummary(receipt, environment.GITHUB_STEP_SUMMARY);
  logger.log(`[QUALITY] ${receipt.status.toUpperCase()} receipt: ${path.relative(ROOT, receiptPath)}`);
  return { receipt, exitCode };
}

if (require.main === module) {
  const profile = process.argv[2] || 'source';
  if (profile === 'fix') {
    console.log('[QUALITY:FIX] Running explicit, opt-in code formatting and inventory refresh...');
    spawnSync(npmCommand, ['run', 'format'], { cwd: ROOT, stdio: 'inherit', shell: shouldUseShell(npmCommand) });
    spawnSync(process.execPath, ['scripts/build-component-inventory.js'], { cwd: ROOT, stdio: 'inherit' });
    console.log('[QUALITY:FIX] Opt-in formatting and inventory updates complete.');
    process.exitCode = 0;
  } else {
    try {
      const result = runQuality({ profile });
      process.exitCode = result.exitCode;
    } catch (error) {
      console.error(`[QUALITY] ${error.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = { PROFILES, atomicWriteJson, changedPaths, parseStatusPaths, runQuality, shouldUseShell };
