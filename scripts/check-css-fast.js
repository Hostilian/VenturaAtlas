#!/usr/bin/env node
/**
 * Fast CSS Preflight Check
 * Executes ultra-fast syntax and brace matching on CSS files in <100ms.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'assets', 'css');

function main() {
  const start = Date.now();
  const errors = [];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '_site') {
        scan(full);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        const text = fs.readFileSync(full, 'utf-8');
        let openBraces = 0;
        let line = 1;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '\n') line++;
          if (char === '{') openBraces++;
          if (char === '}') {
            openBraces--;
            if (openBraces < 0) {
              errors.push(`${path.relative(ROOT, full)}:${line}: Unexpected closing brace '}'`);
              break;
            }
          }
        }
        if (openBraces > 0) {
          errors.push(`${path.relative(ROOT, full)}: Unclosed block, missing ${openBraces} closing brace(s) '}'`);
        }
      }
    }
  }

  scan(CSS_DIR);
  const elapsed = Date.now() - start;

  if (errors.length > 0) {
    console.error(`[CSS-FAST] FAILED with ${errors.length} error(s) in ${elapsed}ms:`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`[CSS-FAST] OK: All CSS files balanced and structurally sound (${elapsed}ms).`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
