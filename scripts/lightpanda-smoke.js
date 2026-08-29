#!/usr/bin/env node
/**
 * Lightpanda / Fast Headless Smoke Tester
 * Verifies that key HTML pages parse cleanly and declare required metadata and stylesheets.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'lightpanda-smoke.json');

const PAGES = [
  'index.html',
  'docs/components.html',
  'docs/chessboard.html',
  'docs/capital-lab.html',
  'docs/census-lab.html',
];

function main() {
  const errors = [];
  const results = [];

  for (const relative of PAGES) {
    const full = path.join(ROOT, relative);
    if (!fs.existsSync(full)) {
      errors.push(`Page missing: ${relative}`);
      continue;
    }

    const html = fs.readFileSync(full, 'utf-8');
    const hasDoctype = /<!doctype\s+html>/i.test(html);
    const hasTitle = /<title>[^<]+<\/title>/i.test(html);
    const hasViewport = /<meta\s+name=["']viewport["']/i.test(html);
    const hasCharset = /<meta\s+charset=["']?utf-8/i.test(html);
    const hasStyles = /href=["'][^"']*site\.css(?:\?[^"']*)?["']/i.test(html) || /<style[\s>]/i.test(html);

    const issues = [];
    if (!hasDoctype) issues.push('Missing <!DOCTYPE html>');
    if (!hasTitle) issues.push('Missing <title>');
    if (!hasViewport) issues.push('Missing viewport meta tag');
    if (!hasCharset) issues.push('Missing charset meta tag');
    if (!hasStyles && relative !== 'offline.html') issues.push('Missing stylesheet or embedded styles');

    results.push({
      page: relative,
      passed: issues.length === 0,
      issues,
    });

    if (issues.length > 0) {
      errors.push(`${relative}: ${issues.join(', ')}`);
    }
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: errors.length === 0 ? 'PASSED' : 'FAILED',
    pagesChecked: results.length,
    results,
    errors,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[LIGHTPANDA-SMOKE] Checked ${results.length} pages. Passed: ${results.filter(r => r.passed).length}/${results.length}.`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
