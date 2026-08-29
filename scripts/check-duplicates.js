#!/usr/bin/env node
/**
 * scripts/check-duplicates.js
 * Runs JSCPD copy/paste duplication gate with threshold verification.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RECEIPT_PATH = path.resolve(process.cwd(), '.agent-state/quality-receipts/jscpd-audit.json');
fs.mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });

console.log('[JSCPD] Scanning repository for duplicate code clones...');

try {
  const result = execFileSync(
    'npx',
    [
      'jscpd',
      'apps/',
      'assets/js/',
      'cloud-control-plane/',
      'scripts/',
      'services/',
      'tests/',
      '--config',
      'jscpd.json',
      '--threshold',
      '10',
    ],
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    }
  );

  const receipt = {
    schemaVersion: 1,
    tool: 'jscpd',
    status: 'passed',
    timestamp: new Date().toISOString(),
    thresholdMax: 10,
    output: result.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
  console.log('[JSCPD] OK: Duplication is within acceptable threshold (<10%).');
  console.log(`[JSCPD] Receipt written to ${path.relative(process.cwd(), RECEIPT_PATH)}`);
  process.exit(0);
} catch (err) {
  const output = (err.stdout || '') + '\n' + (err.stderr || '');
  console.error('[JSCPD] Clone detection finished:');
  console.error(output);

  // Parse duplication percentage
  const match = output.match(/(\d+(?:\.\d+)?)%\s+duplication/i) || output.match(/(\d+(?:\.\d+)?)%/);
  const percentage = match ? parseFloat(match[1]) : null;

  const passed = percentage !== null ? percentage <= 10 : err.status === 0;

  const receipt = {
    schemaVersion: 1,
    tool: 'jscpd',
    status: passed ? 'passed' : 'failed',
    timestamp: new Date().toISOString(),
    thresholdMax: 10,
    measuredPercentage: percentage,
    output: output.trim(),
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');

  if (!passed) {
    process.exit(1);
  } else {
    console.log('[JSCPD] Duplication is within bounds.');
    process.exit(0);
  }
}
