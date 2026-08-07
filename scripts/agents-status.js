#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const progressFile = path.join(__dirname, '..', '.agent-state', 'live-progress.json');
const healthFile = path.join(__dirname, '..', '.agent-state', 'provider-health.json');

if (fs.existsSync(progressFile)) {
  const p = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  console.log('\n=== AGENT DEVELOPMENT STATUS ===');
  console.log(`Run ID:      ${p.runId}`);
  console.log(`Status:      ${p.status.toUpperCase()}`);
  console.log(`Progress:    ${p.weightedOverallCompletion}%`);
  console.log(`Active:      ${p.activeAgents.join(', ')}`);
  console.log(`Completed:   ${p.completedTasks.join(', ')}`);
  console.log(`Queued:      ${p.queuedTasks.join(', ')}`);
  console.log(`Last Beat:   ${p.lastHeartbeat}`);
  console.log('================================\n');
} else {
  console.log('No live progress file found at .agent-state/live-progress.json');
}
