#!/usr/bin/env node
/**
 * scripts/task.js
 * Command-line interface for deterministic task ledger management.
 * Commands: next, add, done, block, list, check
 */
import fs from 'node:fs';
import path from 'node:path';

const BACKLOG_PATH = path.resolve(process.cwd(), '.agent-system/backlog.json');
const TASKS_PATH = path.resolve(process.cwd(), '.agent-system/tasks.json');

function loadBacklog() {
  if (fs.existsSync(BACKLOG_PATH)) {
    return JSON.parse(fs.readFileSync(BACKLOG_PATH, 'utf8'));
  }
  return { schemaVersion: '3.0.0', tasks: [] };
}

function saveBacklog(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(BACKLOG_PATH, JSON.stringify(data, null, 2), 'utf8');
  syncTasksLedger(data);
}

function syncTasksLedger(backlogData) {
  const ledger = {
    schemaVersion: '1.0.0',
    syncedAt: new Date().toISOString(),
    taskCount: backlogData.tasks.length,
    tasks: backlogData.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      blockedBy: t.dependencies || [],
      filePath: t.filesAffected || [],
      priorityScore: t.priorityScore || 50.0,
      urgency: t.urgency || 'P2',
      assignedAgent: t.assignedAgent || 'unassigned',
    })),
  };
  fs.writeFileSync(TASKS_PATH, JSON.stringify(ledger, null, 2), 'utf8');
}

const args = process.argv.slice(2);
const command = args[0] || 'next';

const backlog = loadBacklog();
const tasks = backlog.tasks || [];

switch (command) {
  case 'next': {
    const completedSet = new Set(
      tasks.filter((t) => ['COMPLETE', 'LANDED', 'DONE'].includes(t.status)).map((t) => t.id)
    );

    const available = tasks.filter((t) => {
      if (['COMPLETE', 'LANDED', 'DONE'].includes(t.status)) return false;
      const deps = t.dependencies || [];
      return deps.every((d) => completedSet.has(d));
    });

    if (available.length === 0) {
      console.log('[TASK] No unblocked pending tasks available. All tasks resolved!');
      process.exit(0);
    }

    available.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    const nextTask = available[0];

    console.log(`[TASK:NEXT] Task ID: ${nextTask.id}`);
    console.log(`  Title:     ${nextTask.title}`);
    console.log(`  Domain:    ${nextTask.domain || 'General'}`);
    console.log(`  Urgency:   ${nextTask.urgency || 'P1'}`);
    console.log(`  Priority:  ${nextTask.priorityScore}`);
    console.log(`  Agent:     ${nextTask.assignedAgent || 'unassigned'}`);
    if (nextTask.filesAffected && nextTask.filesAffected.length) {
      console.log(`  Paths:     ${nextTask.filesAffected.join(', ')}`);
    }
    break;
  }

  case 'list': {
    console.log(`[TASK:LIST] ${tasks.length} total tasks in authoritative ledger:`);
    for (const t of tasks) {
      const icon = ['COMPLETE', 'LANDED', 'DONE'].includes(t.status) ? '✓' : '○';
      console.log(`  ${icon} [${t.id}] (${t.status}) ${t.title} [${t.urgency || 'P2'}]`);
    }
    break;
  }

  case 'done': {
    const id = args[1];
    if (!id) {
      console.error('[TASK] Error: specify task ID: node scripts/task.js done <id>');
      process.exit(1);
    }
    const target = tasks.find((t) => t.id === id);
    if (!target) {
      console.error(`[TASK] Error: Task '${id}' not found in backlog.`);
      process.exit(1);
    }
    target.status = 'COMPLETE';
    saveBacklog(backlog);
    console.log(`[TASK:DONE] Marked task '${id}' as COMPLETE.`);
    break;
  }

  case 'add': {
    const id = args[1];
    const title = args.slice(2).join(' ');
    if (!id || !title) {
      console.error('[TASK] Error: usage: node scripts/task.js add <ID> <Title>');
      process.exit(1);
    }
    if (tasks.some((t) => t.id === id)) {
      console.error(`[TASK] Error: Task ID '${id}' already exists.`);
      process.exit(1);
    }
    tasks.push({
      id,
      title,
      domain: 'General',
      priorityScore: 50.0,
      urgency: 'P2',
      status: 'NOT_STARTED',
      assignedAgent: 'ventureatlas-integration',
      dependencies: [],
      filesAffected: [],
    });
    saveBacklog(backlog);
    console.log(`[TASK:ADD] Created task '${id}': ${title}`);
    break;
  }

  case 'block': {
    const id = args[1];
    const byIdx = args.indexOf('--by');
    const blockerId = byIdx !== -1 ? args[byIdx + 1] : null;
    if (!id || !blockerId) {
      console.error('[TASK] Error: usage: node scripts/task.js block <ID> --by <BLOCKER-ID>');
      process.exit(1);
    }
    const target = tasks.find((t) => t.id === id);
    if (!target) {
      console.error(`[TASK] Error: Task '${id}' not found.`);
      process.exit(1);
    }
    target.dependencies = target.dependencies || [];
    if (!target.dependencies.includes(blockerId)) {
      target.dependencies.push(blockerId);
    }
    saveBacklog(backlog);
    console.log(`[TASK:BLOCK] Task '${id}' now blocked by '${blockerId}'.`);
    break;
  }

  case 'sync': {
    syncTasksLedger(backlog);
    console.log(`[TASK:SYNC] Synced ${tasks.length} tasks to ${path.relative(process.cwd(), TASKS_PATH)}`);
    break;
  }

  default:
    console.log(`Unknown task command '${command}'. Use next | list | done | add | block | sync.`);
}
