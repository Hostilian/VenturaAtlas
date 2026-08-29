#!/usr/bin/env node
/**
 * Deterministic AI Anti-Pattern & Invariant Validator
 * Scans repository source files for AI code generation defects, hallucinated patterns,
 * empty error swallows, hardcoded local paths, and unanchored security patterns.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'ai-antipatterns-audit.json');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '_site',
  '.git',
  '.agent-state',
  'dist',
  'tmp',
  'coverage',
]);

const FORBIDDEN_SOURCE_PATTERNS = [
  {
    id: 'LOCAL_USER_PATH_LEAK',
    regex: /[A-Za-z]:\\Users\\[a-zA-Z0-9_-]+|\/Users\/[a-zA-Z0-9_-]+\/(?:Downloads|Desktop|Documents)/,
    message: 'Hardcoded local user filesystem path detected (privacy/reproducibility violation). Use relative repo paths.',
    allowedFiles: [
      /check_privacy\.py$/,
      /check-autonomy-contract\.py$/,
      /security-boundary\.test\.js$/,
      /failure-injection\.test\.js$/,
      /validate-ai-antipatterns\.js$/,
      /^research\/audits\//,
      /^docs\/audit\//,
    ],
  },
  {
    id: 'EMPTY_CATCH_BLOCK',
    regex: /catch\s*\([^)]*\)\s*\{\s*\}/,
    message: 'Silent error swallowing in empty catch block. Log, rethrow, or record explicit degradation.',
    allowedFiles: [/tests\//, /validate-ai-antipatterns\.js$/],
  },
  {
    id: 'UNLINKED_TODO_PLACEHOLDER',
    regex: /\/\/\s*TODO(?!\s*\([A-Z0-9-]+\)\s*:)/i,
    message: 'Unlinked TODO comment detected. All TODOs must follow TODO(TASK-ID): syntax tied to backlog.',
    allowedFiles: [/validate-todos\.js$/, /validate-ai-antipatterns\.js$/, /tests\/quality-infrastructure\.test\.js$/],
  },
  {
    id: 'FAKE_IMPLEMENTATION_STUB',
    regex: /throw\s+new\s+Error\(\s*['"](?:Not implemented|TODO|Implement later)['"]\s*\)/i,
    message: 'Unfinished stub throw detected in production code.',
    allowedFiles: [/tests\//, /validate-ai-antipatterns\.js$/],
  },
];

function findSourceFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSourceFiles(full));
    } else if (entry.isFile() && /\.(js|ts|py|json|md|html|css)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const isStrictMode = process.argv.includes('--strict');
  const files = findSourceFiles(ROOT);
  const violations = [];

  for (const file of files) {
    const relative = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
      if (pattern.allowedFiles && pattern.allowedFiles.some(re => re.test(relative))) {
        continue;
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pattern.regex.test(line)) {
          // Allow pattern definitions themselves if commented with @allow-antipattern
          if (line.includes('@allow-antipattern')) continue;
          violations.push({
            ruleId: pattern.id,
            file: relative,
            line: i + 1,
            snippet: line.trim(),
            message: pattern.message,
          });
        }
      }
    }
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: violations.length === 0 ? 'PASSED' : 'VIOLATIONS_DETECTED',
    metrics: {
      filesScanned: files.length,
      violationsCount: violations.length,
    },
    violations,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[AI-ANTIPATTERNS] Scanned ${files.length} tracked files for AI code generation defects.`);
  if (violations.length > 0) {
    console.error(`[AI-ANTIPATTERNS] FAILED: ${violations.length} violation(s) detected:`);
    violations.slice(0, 10).forEach(v => {
      console.error(`  - [${v.ruleId}] ${v.file}:${v.line}: ${v.message} ("${v.snippet}")`);
    });
    if (violations.length > 10) {
      console.error(`  ... and ${violations.length - 10} more.`);
    }
    process.exit(1);
  }

  console.log(`[AI-ANTIPATTERNS] OK: Zero AI anti-patterns detected.`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
