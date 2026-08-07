#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const healthFile = path.join(__dirname, '..', '.agent-state', 'provider-health.json');

if (fs.existsSync(healthFile)) {
  const h = JSON.parse(fs.readFileSync(healthFile, 'utf8'));
  console.log('\n=== PROVIDER HEALTH REPORT ===');
  console.log(`Checked At: ${h.timestamp}\n`);
  for (const [name, info] of Object.entries(h.providers)) {
    const icon = info.status === 'available' ? '✅' : info.status === 'degraded' ? '⚠️' : '❌';
    console.log(`  ${icon} ${name.padEnd(22)} status=${info.status.padEnd(12)} circuit=${info.circuit}`);
    if (info.reason) console.log(`     └─ Reason: ${info.reason}`);
  }
  console.log('==============================\n');
} else {
  console.log('No health report found at .agent-state/provider-health.json');
}
