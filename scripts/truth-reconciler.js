#!/usr/bin/env node

/**
 * VenturaAtlas Truth Reconciler (OMEGA XX Proof-Predicate Kernel)
 *
 * Evaluates the 12 system health proof predicates from authoritative source files
 * and derives a policy-based aggregate status using the 4 Clocks model.
 *
 * Usage:
 *   node scripts/truth-reconciler.js          # Reconciles and writes data/system-health.json
 *   node scripts/truth-reconciler.js --check  # Non-mutating verification (exits 1 if FAIL)
 */

const fs = require('fs');
const path = require('path');
const { evaluateProofPredicates } = require('./lib/proof-predicates');

const ROOT = path.resolve(__dirname, '..');
const TARGET_PATH = path.join(ROOT, 'data', 'system-health.json');

function reconcileTruth(options = {}) {
  const isCheckMode = options.check || process.argv.includes('--check');

  // Verify provider freshness logic explicitly
  const providerRegistryPath = path.join(ROOT, '.agent-system', 'provider-registry.json');
  let registryFresh = false;
  let freshHealthyCount = 0;
  if (fs.existsSync(providerRegistryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(providerRegistryPath, 'utf8'));
      const checkedAt = reg.lastHealthCheck ? new Date(reg.lastHealthCheck) : null;
      const ttl = Number(reg.probeTtlSeconds || 3600);
      registryFresh = checkedAt && ((Date.now() - checkedAt.getTime()) / 1000) <= ttl;
      freshHealthyCount = Object.values(reg.providers || {}).filter(p => registryFresh && p.healthy === true).length;
    } catch {}
  }
  const providerReason = registryFresh
    ? `${freshHealthyCount} healthy providers active in registry`
    : 'provider receipts expired or missing; raw healthy flags are not current';

  const providerState = {
    freshness: registryFresh ? 'FRESH' : 'EXPIRED',
    reason: providerReason
  };

  const healthReport = evaluateProofPredicates();
  if (healthReport.components?.providerCapacity) {
    healthReport.components.providerCapacity.reason = providerReason;
    healthReport.components.providerCapacity.freshness = providerState.freshness;
  }

  if (isCheckMode) {
    console.log(`[TRUTH-RECONCILER --check] Aggregate status: ${healthReport.aggregateStatus}`);
    if (healthReport.aggregateStatus === 'FAIL') {
      console.error('[FAIL] Truth reconciliation failed one or more critical predicates.');
      if (require.main === module) process.exit(1);
    }
    return healthReport;
  }

  fs.writeFileSync(TARGET_PATH, JSON.stringify(healthReport, null, 2) + '\n', 'utf8');
  console.log(`[TRUTH-RECONCILER] Aggregate status: ${healthReport.aggregateStatus}. Report written to data/system-health.json`);
  return healthReport;
}

if (require.main === module) {
  reconcileTruth();
}

module.exports = { reconcileTruth };
