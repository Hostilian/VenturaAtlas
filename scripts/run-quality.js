#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildReceipt: buildArtifactManifest } = require('./hash-public-artifact');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_DIRECTORY = path.join(ROOT, '.agent-state', 'quality-receipts');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const pythonCommand = process.env.PYTHON || 'python';

const SOURCE_STEPS = [
  ['source-lint', npmCommand, ['run', 'lint']],
  ['factbounty-typecheck', npmCommand, ['run', 'typecheck']],
  ['node-unit-tests', npmCommand, ['run', 'test:unit']],
  ['python-tests', npmCommand, ['run', 'test:python']],
  ['source-validation', npmCommand, ['run', 'validate:source']],
  ['completion-audit', npmCommand, ['run', 'validate:completion']],
  ['repository-meta-generate', process.execPath, ['scripts/build-repository-meta.js']],
  ['repository-meta-check', process.execPath, ['scripts/build-repository-meta.js', '--check']],
  ['projection-check', npmCommand, ['run', 'check:projections']],
  ['repository-consistency', npmCommand, ['run', 'check-consistency']],
  ['task-graph', npmCommand, ['run', 'check-task-graph']],
  ['repository-drift', npmCommand, ['run', 'check:drift']],
  ['constitution-integrity', pythonCommand, ['scripts/verify_constitution.py']],
  ['privacy-scan', pythonCommand, ['scripts/check_privacy.py']],
];

const ARTIFACT_STEPS = [
  ['artifact-build-and-validation', npmCommand, ['run', 'build:verified']],
];

const PROFILES = { source: SOURCE_STEPS, artifact: ARTIFACT_STEPS };

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
  return parseStatusPaths(gitOutput(['status', '--porcelain=v1', '-z', '--untracked-files=all']));
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
  const before = snapshot();
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
  if (profile === 'artifact' && exitCode === 0) {
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
    } catch (error) {
      durations['artifact-tree-stability'] = Number((Number(process.hrtime.bigint() - stabilityStarted) / 1e9).toFixed(3));
      validators.push({ id: 'artifact-tree-stability', status: 'failed', exitCode: 1, durationSeconds: durations['artifact-tree-stability'] });
      failedPhase = 'artifact-tree-stability';
      failedCommand = 'deterministic public artifact stability verification';
      exitCode = 1;
    }
  }
  const finishingCommit = commit();
  if (startingCommit && finishingCommit && startingCommit !== finishingCommit) {
    validators.push({ id: 'commit-stability', status: 'failed', exitCode: 1, durationSeconds: 0 });
    durations['commit-stability'] = 0;
    if (exitCode === 0) {
      failedPhase = 'commit-stability';
      failedCommand = 'git rev-parse HEAD remained stable for the quality run';
      exitCode = 1;
    }
  }
  const after = snapshot();
  const affectedPaths = changedPaths(before, after);
  const warnings = [];
  if (affectedPaths.length > 0) warnings.push('The quality run changed worktree content; inspect affectedPaths.');
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
  try {
    const result = runQuality({ profile });
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(`[QUALITY] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { PROFILES, atomicWriteJson, changedPaths, parseStatusPaths, runQuality, shouldUseShell };
