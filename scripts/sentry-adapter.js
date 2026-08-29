#!/usr/bin/env node
/**
 * Sentry CLI & Telemetry Bridge
 * Dispatches test alerts, captures audit receipts, or validates DSN presence.
 */

const { initSentry, isConfigured } = require('../services/sentry-config');

function main() {
  const isTestAlert = process.argv.includes('--test-alert');
  const isCheckMode = process.argv.includes('--check');

  const telemetry = initSentry();

  if (isCheckMode) {
    console.log(`[SENTRY] Configured: ${isConfigured ? 'YES (DSN active)' : 'NO (local fallback active)'}`);
    process.exit(0);
  }

  if (isTestAlert) {
    if (!isConfigured) {
      console.log('[SENTRY] SENTRY_DSN not configured; test alert logged locally.');
      telemetry.captureMessage('VenturaAtlas Sentry Test Alert (Local Mode)');
      process.exit(0);
    }

    console.log('[SENTRY] Sending test alert to Sentry...');
    telemetry.captureMessage('VenturaAtlas Sentry Deterministic Verification Alert');
    console.log('[SENTRY] Alert sent.');
    process.exit(0);
  }

  console.log('[SENTRY] Usage: node scripts/sentry-adapter.js [--check | --test-alert]');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
