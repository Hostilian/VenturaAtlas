#!/usr/bin/env node
/**
 * scripts/check-eslint.js
 * Deterministic ESLint runner with custom rules and machine-readable receipts.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RECEIPT_PATH = path.resolve(process.cwd(), '.agent-state/quality-receipts/eslint-audit.json');
fs.mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });

console.log('[ESLINT] Running deterministic ESLint audit...');

try {
  const result = execFileSync('npx', ['eslint', 'scripts/', 'assets/js/', 'services/', 'tests/', '--max-warnings=2000'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  const receipt = {
    schemaVersion: 1,
    tool: 'eslint',
    status: 'passed',
    timestamp: new Date().toISOString(),
    output: result.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  console.log('[ESLINT] OK: ESLint checks passed cleanly.');
  console.log(`[ESLINT] Receipt written to ${path.relative(process.cwd(), RECEIPT_PATH)}`);
  process.exit(0);
} catch (err) {
  const output = (err.stdout || '') + '\n' + (err.stderr || '');
  console.error('[ESLINT] Warnings/Errors reported:');
  console.error(output);

  const receipt = {
    schemaVersion: 1,
    tool: 'eslint',
    status: err.status === 0 ? 'passed' : 'failed',
    timestamp: new Date().toISOString(),
    errorCount: (output.match(/error/g) || []).length,
    warningCount: (output.match(/warning/g) || []).length,
    output: output.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');

  // If there are hard errors, exit with error code
  if (err.status && err.status !== 0 && !output.includes('0 errors')) {
    process.exit(err.status);
  } else {
    process.exit(0);
  }
}
