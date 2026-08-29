#!/usr/bin/env node
/**
 * Design Token & Variable Reference Validator
 * Verifies that all CSS files adhere to the VenturaAtlas design token system
 * and that no undefined CSS variables are referenced.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'assets', 'css');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'design-tokens-audit.json');

const REQUIRED_CORE_TOKENS = [
  '--bg',
  '--panel',
  '--text',
  '--muted',
  '--line',
  '--accent',
  '--radius',
  '--font',
];

function main() {
  const errors = [];
  const warnings = [];

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
  const definedTokens = new Set();
  const referencedTokens = new Map(); // token -> [files]

  // Pass 1: Collect all defined CSS custom properties
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.matchAll(/--[a-zA-Z0-9-_]+(?=\s*:)/g);
    for (const match of matches) {
      definedTokens.add(match[0]);
    }
  }

  // Check required core tokens
  for (const token of REQUIRED_CORE_TOKENS) {
    if (!definedTokens.has(token)) {
      errors.push(`Required core design token '${token}' is not defined in any CSS stylesheet.`);
    }
  }

  // Pass 2: Verify all var(--token) usages
  for (const file of files) {
    const relative = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf-8');
    const varMatches = content.matchAll(/var\(\s*(--[a-zA-Z0-9-_]+)(\s*,\s*[^)]+)?\)/g);
    for (const match of varMatches) {
      const token = match[1];
      const hasFallback = Boolean(match[2]);
      if (!definedTokens.has(token) && !hasFallback) {
        errors.push(`${relative}: Referenced CSS custom property '${token}' is not defined in the design system.`);
      }
      if (!referencedTokens.has(token)) {
        referencedTokens.set(token, []);
      }
      referencedTokens.get(token).push(relative);
    }
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: errors.length === 0 ? 'PASSED' : 'FAILED',
    metrics: {
      definedTokensCount: definedTokens.size,
      referencedTokensCount: referencedTokens.size,
      filesChecked: files.length,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    },
    definedTokens: Array.from(definedTokens).sort(),
    errors,
    warnings,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[DESIGN-TOKENS] Validated ${definedTokens.size} defined tokens across ${files.length} CSS files.`);
  if (errors.length > 0) {
    console.error(`[DESIGN-TOKENS] FAILED: ${errors.length} token error(s):`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`[DESIGN-TOKENS] OK: All ${referencedTokens.size} variable references are strictly resolved.`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
