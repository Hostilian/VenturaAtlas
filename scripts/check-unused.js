#!/usr/bin/env node
/**
 * scripts/check-unused.js
 * Runs Knip dead code and unused export audit in advisory / report-only mode.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RECEIPT_PATH = path.resolve(process.cwd(), '.agent-state/quality-receipts/knip-audit.json');
fs.mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });

console.log('[KNIP] Auditing unused files, exports, and dead types (advisory)...');

try {
  const result = execFileSync('npx', ['knip', '--no-progress'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  const receipt = {
    schemaVersion: 1,
    tool: 'knip',
    status: 'passed',
    timestamp: new Date().toISOString(),
    output: result.trim() || 'No unused items detected.',
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  console.log('[KNIP] OK: No unused dependencies or dead exports found.');
  console.log(`[KNIP] Receipt written to ${path.relative(process.cwd(), RECEIPT_PATH)}`);
  process.exit(0);
} catch (err) {
  const output = (err.stdout || '') + '\n' + (err.stderr || '');
  console.log('[KNIP] Advisory report generated:');
  console.log(output.trim());

  // Count unused items for receipt
  const unusedFilesMatch = output.match(/Unused files\s+\((\d+)\)/);
  const unusedExportsMatch = output.match(/Unused exports\s+\((\d+)\)/);
  const unusedTypesMatch = output.match(/Unused exported types\s+\((\d+)\)/);

  const receipt = {
    schemaVersion: 1,
    tool: 'knip',
    status: 'advisory',
    timestamp: new Date().toISOString(),
    unusedFiles: unusedFilesMatch ? parseInt(unusedFilesMatch[1], 10) : 0,
    unusedExports: unusedExportsMatch ? parseInt(unusedExportsMatch[1], 10) : 0,
    unusedTypes: unusedTypesMatch ? parseInt(unusedTypesMatch[1], 10) : 0,
    output: output.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`[KNIP] Advisory receipt written to ${path.relative(process.cwd(), RECEIPT_PATH)}`);
  // Knip is advisory by default per §3.1
  process.exit(0);
}
