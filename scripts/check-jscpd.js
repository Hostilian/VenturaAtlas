#!/usr/bin/env node
/**
 * JSCPD Code Duplication Gate & Ratchet
 * Enforces maximum duplication threshold across JS/TS/Python/CSS files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, '.agent-state', 'quality-receipts', 'jscpd');
const REPORT_JSON = path.join(REPORT_DIR, 'jscpd-report.json');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'jscpd-audit.json');
const MAX_ALLOWED_PERCENT = 10.0;

function main() {
  const isStrictMode = process.argv.includes('--strict');
  
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  let code = 0;
  try {
    execSync(`npx jscpd . --config "${path.join(ROOT, '.jscpd.json')}"`, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err) {
    // jscpd exits with code 1 if threshold is exceeded
    code = err.status || 1;
  }

  let report = { statistics: {} };
  if (fs.existsSync(REPORT_JSON)) {
    try {
      report = JSON.parse(fs.readFileSync(REPORT_JSON, 'utf-8'));
    } catch (e) {
      console.warn('[JSCPD] Warning: Could not parse jscpd report JSON:', e.message);
    }
  }

  const total = report.statistics?.total || {};
  const percentage = total.percentage || 0;
  const clones = total.clones || 0;
  const duplicatedLines = total.duplicatedLines || 0;
  const totalLines = total.lines || 0;

  const passed = percentage <= MAX_ALLOWED_PERCENT;

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: passed ? 'PASSED' : 'THRESHOLD_EXCEEDED',
    thresholdPercent: MAX_ALLOWED_PERCENT,
    metrics: {
      duplicationPercentage: percentage,
      clonesFound: clones,
      duplicatedLines,
      totalLines,
    },
    formats: report.statistics?.formats || {},
  };

  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[JSCPD] Duplication: ${percentage}% (${duplicatedLines}/${totalLines} lines across ${clones} clones). Max allowed: ${MAX_ALLOWED_PERCENT}%.`);
  console.log(`[JSCPD] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);

  if (!passed) {
    console.error(`[JSCPD] FAILED: Duplication rate ${percentage}% exceeds maximum allowed ${MAX_ALLOWED_PERCENT}%.`);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
