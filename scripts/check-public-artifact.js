const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '_site');

const FORBIDDEN_PATTERNS = [
  /\.env(\..*)?$/i,
  /node_modules/i,
  /^\.git/i,
  /^\.agent-state/i,
  /^\.agents/i,
  /^apps/i,
  /^tests/i,
  /^scripts/i,
  /idea-staging-queue\.json$/i,
  /provider-state\.json$/i,
  /package(-lock)?\.json$/i,
  /tsconfig.*\.json$/i,
  /\.ts$/i,
  /\.py$/i
];

function checkDirectory(dirPath) {
  const errors = [];
  if (!fs.existsSync(dirPath)) {
    return [`_site directory does not exist`];
  }

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = path.relative(DIST, fullPath).replace(/\\/g, '/');

      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(relPath) || pattern.test(entry.name)) {
          errors.push(`Forbidden file/dir found in _site: ${relPath}`);
        }
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(dirPath);
  return errors;
}

function main() {
  console.log('=== Checking Public Artifact Security (_site) ===\n');
  const errors = checkDirectory(DIST);

  if (errors.length > 0) {
    console.error(`[ERROR] Security audit failed for _site artifact:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Public artifact security check passed cleanly.');
}

if (require.main === module) {
  main();
}

module.exports = { checkDirectory };
