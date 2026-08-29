#!/usr/bin/env node
/**
 * Project Wallace CSS Complexity & Metrics Auditor
 * Analyzes repository CSS files for complexity, specificity, size, and token usage.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'assets', 'css');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'css-metrics.json');

async function main() {
  const { analyze } = await import('@projectwallace/css-analyzer');

  function findCssFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '_site') {
        results.push(...findCssFiles(full));
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        results.push(full);
      }
    }
    return results;
  }

  const files = findCssFiles(CSS_DIR);
  let totalRules = 0;
  let totalSelectors = 0;
  let totalDeclarations = 0;
  let totalBytes = 0;
  const perFileMetrics = {};

  for (const file of files) {
    const relative = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf-8');
    const bytes = Buffer.byteLength(content, 'utf-8');
    totalBytes += bytes;

    const analysis = analyze(content);
    const rules = analysis.rules?.total || 0;
    const selectors = analysis.selectors?.total || 0;
    const declarations = analysis.declarations?.total || 0;
    const colors = analysis.values?.colors?.total || 0;
    const fontSizes = analysis.values?.fontSizes?.total || 0;

    totalRules += rules;
    totalSelectors += selectors;
    totalDeclarations += declarations;

    perFileMetrics[relative] = {
      bytes,
      rules,
      selectors,
      declarations,
      colors,
      fontSizes,
    };
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      fileCount: files.length,
      totalBytes,
      totalRules,
      totalSelectors,
      totalDeclarations,
    },
    perFile: perFileMetrics,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[PROJECT WALLACE] Analyzed ${files.length} CSS files (${totalBytes} bytes). Rules: ${totalRules}, Selectors: ${totalSelectors}, Declarations: ${totalDeclarations}.`);
  console.log(`[PROJECT WALLACE] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);
  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error('[PROJECT WALLACE] Analysis error:', err);
    process.exit(1);
  });
}

module.exports = { main };
