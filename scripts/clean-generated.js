#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GENERATED_DIRECTORIES = ['_site', 'dist', 'coverage', 'playwright-report', 'test-results'];

function cleanDirectory(relativePath, options = {}) {
  if (!GENERATED_DIRECTORIES.includes(relativePath)) {
    throw new Error(`Refusing to clean non-generated path: ${relativePath}`);
  }
  const target = path.resolve(options.root || ROOT, relativePath);
  const expectedParent = path.resolve(options.root || ROOT);
  if (path.dirname(target) !== expectedParent) {
    throw new Error(`Generated cleanup target escaped repository root: ${target}`);
  }
  fs.rmSync(target, {
    recursive: true,
    force: true,
    maxRetries: options.maxRetries ?? 8,
    retryDelay: options.retryDelay ?? 150,
  });
}

function main() {
  for (const directory of GENERATED_DIRECTORIES) cleanDirectory(directory);
  console.log(`[CLEAN] removed generated directories: ${GENERATED_DIRECTORIES.join(', ')}`);
}

if (require.main === module) main();

module.exports = { GENERATED_DIRECTORIES, cleanDirectory };
