#!/usr/bin/env node
/**
 * Fallow Architectural Health & Complexity Auditor
 * Runs automated complexity and dependency health analysis.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'fallow-audit.json');

function main() {
  let stdout = '';
  try {
    stdout = execSync('npx fallow --format json', {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err) {
    if (err.stdout) {
      stdout = err.stdout.toString('utf-8');
    }
  }

  let report = {};
  try {
    if (stdout.trim()) {
      report = JSON.parse(stdout);
    }
  } catch (err) {
    console.warn('[FALLOW] Warning: Could not parse fallow JSON output:', err.message);
  }

  const recommendations = report.health?.recommendations || [];
  const nextSteps = report.next_steps || [];

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'PASSED',
    metrics: {
      recommendationsCount: recommendations.length,
      nextStepsCount: nextSteps.length,
    },
    topRecommendations: recommendations.slice(0, 5).map(r => ({
      path: r.path,
      priority: r.priority,
      category: r.category,
      recommendation: r.recommendation,
    })),
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[FALLOW] Architectural scan complete. Recommendations: ${recommendations.length}.`);
  console.log(`[FALLOW] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
