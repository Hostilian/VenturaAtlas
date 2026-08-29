#!/usr/bin/env node
/**
 * Dex Task View Adapter (Non-Authoritative)
 * Projects the authoritative .agent-system/backlog.json into Dex format.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, '.agent-system', 'backlog.json');
const TARGET_PATH = path.join(ROOT, '.agent-state', 'views', 'dex-backlog.json');

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error('[DEX-ADAPTER] Error: .agent-system/backlog.json missing.');
    process.exit(1);
  }

  const backlog = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  const tasks = backlog.tasks || [];

  const dexTasks = tasks.map(t => ({
    id: t.id,
    name: t.title,
    status: t.status === 'COMPLETE' || t.status === 'LANDED' ? 'done' : (t.status === 'READY' ? 'ready' : 'blocked'),
    priority: t.priorityScore || 50,
    tags: [t.domain, t.urgency].filter(Boolean),
    assignee: t.assignedAgent || 'unassigned',
    dependencies: t.dependencies || [],
    metadata: {
      originalStatus: t.status,
      filesAffected: t.filesAffected || [],
      verificationMethod: t.verificationMethod || '',
    },
  }));

  const dexView = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    sourceAuthority: '.agent-system/backlog.json',
    authoritative: false,
    viewType: 'dex',
    taskCount: dexTasks.length,
    tasks: dexTasks,
  };

  const targetDir = path.dirname(TARGET_PATH);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(TARGET_PATH, JSON.stringify(dexView, null, 2), 'utf-8');

  if (process.argv.includes('--stdout')) {
    console.log(JSON.stringify(dexView, null, 2));
  } else {
    console.log(`[DEX-ADAPTER] Projected ${dexTasks.length} tasks to ${path.relative(ROOT, TARGET_PATH)}`);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
