#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const progressFile = path.join(__dirname, '..', '.agent-state', 'live-progress.json');
const eventsFile = path.join(__dirname, '..', '.agent-state', 'progress-events.ndjson');

function render() {
  console.clear();
  console.log('========================================================================');
  console.log('            VENTURE ATLAS AGENT ORCHESTRATION DASHBOARD                 ');
  console.log('========================================================================\n');

  if (fs.existsSync(progressFile)) {
    const p = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    const barLen = 30;
    const filled = Math.round((p.weightedOverallCompletion / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    console.log(`Progress: [${bar}] ${p.weightedOverallCompletion}%  | Run: ${p.runId} | Status: ${p.status}`);
    console.log(`Active Agents: ${p.activeAgents.join(', ')}`);
    console.log(`Completed Tasks: ${p.completedTasks.length} | Queued: ${p.queuedTasks.length}\n`);

    console.log('Recent Milestones:');
    (p.recentMilestones || []).slice(-5).forEach(m => console.log(`  • ${m}`));
    console.log('');
  }

  if (fs.existsSync(eventsFile)) {
    const lines = fs.readFileSync(eventsFile, 'utf8').trim().split('\n').filter(Boolean);
    console.log('Latest Telemetry Events:');
    lines.slice(-6).forEach(line => {
      try {
        const ev = JSON.parse(line);
        console.log(`  [${ev.timestamp.slice(11, 19)}] [${ev.agentId}] [${ev.type.toUpperCase()}] ${ev.message}`);
      } catch (e) {}
    });
  }

  console.log('\n========================================================================');
  console.log('Press Ctrl+C to exit watch mode');
}

render();
if (process.argv.includes('--loop')) {
  setInterval(render, 3000);
}
