#!/usr/bin/env node
/**
 * scripts/check-stylelint.js
 * Runs Stylelint on CSS files and writes machine-readable receipt.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RECEIPT_PATH = path.resolve(process.cwd(), '.agent-state/quality-receipts/stylelint-audit.json');
fs.mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });

console.log('[STYLELINT] Scanning stylesheets in assets/css/ ...');

try {
  const result = execFileSync('npx', ['stylelint', 'assets/css/**/*.css'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  const receipt = {
    schemaVersion: 1,
    tool: 'stylelint',
    status: 'passed',
    timestamp: new Date().toISOString(),
    output: result.trim() || 'No stylelint issues detected.',
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  console.log('[STYLELINT] OK: CSS stylesheets conform to Stylelint rules.');
  console.log(`[STYLELINT] Receipt written to ${path.relative(process.cwd(), RECEIPT_PATH)}`);
  process.exit(0);
} catch (err) {
  const output = (err.stdout || '') + '\n' + (err.stderr || '');
  console.error('[STYLELINT] Stylelint reported issues:');
  console.error(output);

  const receipt = {
    schemaVersion: 1,
    tool: 'stylelint',
    status: 'failed',
    timestamp: new Date().toISOString(),
    output: output.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  process.exit(err.status || 1);
}
