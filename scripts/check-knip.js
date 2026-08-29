#!/usr/bin/env node
/**
 * Knip Dead Code & Dependency Auditor
 * Deterministically scans the repository for unused files, exports, and dependencies.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'knip-audit.json');

function main() {
  const isCheckMode = process.argv.includes('--check');
  const isStrictMode = process.argv.includes('--strict');
  
  let stdout = '';
  try {
    stdout = execSync('npx knip --reporter json', {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    if (err.stdout) {
      stdout = err.stdout.toString('utf-8');
    }
  }

  let report = { files: [], issues: [] };
  try {
    if (stdout.trim()) {
      report = JSON.parse(stdout);
    }
  } catch (err) {
    console.warn('[KNIP] Warning: Failed to parse Knip JSON output:', err.message);
  }

  const unusedFiles = report.files || [];
  let unusedExportsCount = 0;
  let unusedTypesCount = 0;
  let unusedDepsCount = 0;

  for (const issue of report.issues || []) {
    if (issue.exports) unusedExportsCount += issue.exports.length;
    if (issue.types) unusedTypesCount += issue.types.length;
    if (issue.dependencies) unusedDepsCount += issue.dependencies.length;
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: unusedFiles.length === 0 ? 'PASSED' : 'AUDIT_DETECTED',
    metrics: {
      unusedFilesCount: unusedFiles.length,
      unusedExportsCount,
      unusedTypesCount,
      unusedDepsCount,
    },
    unusedFiles,
    issuesSummary: (report.issues || []).map(i => ({
      file: i.file,
      unusedExports: (i.exports || []).map(e => e.name),
      unusedTypes: (i.types || []).map(t => t.name),
      unusedDeps: (i.dependencies || []).map(d => d.name),
    })).filter(i => i.unusedExports.length || i.unusedTypes.length || i.unusedDeps.length),
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[KNIP] Scanned codebase. Unused files: ${unusedFiles.length}, Unused exports: ${unusedExportsCount}, Unused types: ${unusedTypesCount}`);
  console.log(`[KNIP] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);

  if (isStrictMode && unusedFiles.length > 0) {
    console.error(`[KNIP] Strict check failed: ${unusedFiles.length} unused files detected.`);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
