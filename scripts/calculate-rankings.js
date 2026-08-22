const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');
const DIAGNOSTICS_DIR = path.join(ROOT, 'diagnostics');
const FALLBACK_PATH = path.join(DIAGNOSTICS_DIR, 'ranking-fallback.json');

/**
 * VenturaAtlas Ranking Calculation Orchestrator (Fail-Closed)
 *
 * Authoritative rankings are produced exclusively by scripts/va-ranker.py.
 * If va-ranker.py fails, this script exits FAIL-CLOSED and outputs a diagnostic
 * record rather than silently overwriting data/rankings.json with degraded JS math.
 */
function main() {
  if (!fs.existsSync(IDEAS_PATH)) {
    console.error('[ERROR] ideas.json not found');
    process.exit(1);
  }

  const isCheckMode = process.argv.includes('--check');

  try {
    const pyScript = path.join(ROOT, 'scripts', 'va-ranker.py');
    const cmd = isCheckMode ? `python "${pyScript}" --top 5` : `python "${pyScript}" --update`;
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    if (isCheckMode) {
      console.log('[OK] Ranking calculation check complete via va-ranker.py');
    }
    return;
  } catch (err) {
    console.error('[FAIL-CLOSED] Authoritative va-ranker.py execution failed:', err.message);
    
    // Write non-authoritative diagnostic fallback record
    try {
      if (!fs.existsSync(DIAGNOSTICS_DIR)) fs.mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
      const diagnosticRecord = {
        schemaVersion: '2.0.0',
        generatedAt: new Date().toISOString(),
        decisionGrade: false,
        fallback: true,
        authoritativeRankingsModified: false,
        reason: err.message,
        sourceScript: 'scripts/va-ranker.py'
      };
      fs.writeFileSync(FALLBACK_PATH, JSON.stringify(diagnosticRecord, null, 2) + '\n', 'utf8');
      console.error(`[FAIL-CLOSED] Wrote diagnostic record to diagnostics/ranking-fallback.json. Authoritative rankings untouched.`);
    } catch (diagErr) {
      console.error('[FAIL-CLOSED] Could not write diagnostic record:', diagErr.message);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
