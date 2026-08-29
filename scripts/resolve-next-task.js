#!/usr/bin/env node
/**
 * Deterministic Next-Runnable Task Resolver
 * Evaluates the authoritative backlog task graph, filters out completed and blocked items,
 * verifies dependency satisfaction, and selects the next actionable task deterministically.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKLOG_PATH = path.join(ROOT, '.agent-system', 'backlog.json');
const STATE_PATH = path.join(ROOT, '.agent-system', 'state.json');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'next-task.json');

function main() {
  const isJson = process.argv.includes('--json');

  if (!fs.existsSync(BACKLOG_PATH) || !fs.existsSync(STATE_PATH)) {
    console.error('[RESOLVE-TASK] Error: Backlog or state file missing.');
    process.exit(1);
  }

  const backlog = JSON.parse(fs.readFileSync(BACKLOG_PATH, 'utf-8'));
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));

  const completedTasks = new Set([
    ...(state.completedTasks || []),
    ...(backlog.tasks || []).filter(t => t.status === 'COMPLETE' || t.status === 'LANDED').map(t => t.id),
  ]);

  const tasks = backlog.tasks || [];
  const runnableTasks = [];
  const blockedTasks = [];

  for (const task of tasks) {
    if (completedTasks.has(task.id)) continue;

    const deps = task.dependencies || [];
    const unsatisfiedDeps = deps.filter(d => !completedTasks.has(d));
    const isExplicitlyBlocked = typeof task.status === 'string' && (
      task.status.startsWith('BLOCKED_') ||
      task.status === 'REQUIRES_HUMAN_OR_EXTERNAL_AUTHORITY' ||
      task.status === 'DISABLED'
    );

    if (isExplicitlyBlocked || unsatisfiedDeps.length > 0) {
      blockedTasks.push({
        id: task.id,
        title: task.title,
        status: task.status,
        unsatisfiedDependencies: unsatisfiedDeps,
      });
    } else if (task.status === 'READY' || !task.status) {
      runnableTasks.push(task);
    }
  }

  // Sort deterministically: highest priorityScore first, then lowest id alphabetically
  runnableTasks.sort((a, b) => {
    const pDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
    if (pDiff !== 0) return pDiff;
    return a.id.localeCompare(b.id);
  });

  const nextTask = runnableTasks.length > 0 ? runnableTasks[0] : null;

  const result = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: nextTask ? 'TASK_AVAILABLE' : 'NO_RUNNABLE_TASKS',
    nextTask: nextTask ? {
      id: nextTask.id,
      title: nextTask.title,
      domain: nextTask.domain,
      priorityScore: nextTask.priorityScore,
      urgency: nextTask.urgency,
      assignedAgent: nextTask.assignedAgent,
      dependencies: nextTask.dependencies || [],
      filesAffected: nextTask.filesAffected || [],
      verificationMethod: nextTask.verificationMethod || '',
    } : null,
    runnableCount: runnableTasks.length,
    blockedCount: blockedTasks.length,
    completedCount: completedTasks.size,
    totalCount: tasks.length,
    runnableQueue: runnableTasks.map(t => ({ id: t.id, title: t.title, priority: t.priorityScore })),
    blockedQueue: blockedTasks,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(result, null, 2), 'utf-8');

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (nextTask) {
      console.log(`[NEXT-TASK] Selected: ${nextTask.id} — "${nextTask.title}" (Priority: ${nextTask.priorityScore}, Agent: ${nextTask.assignedAgent || 'unassigned'})`);
      console.log(`[NEXT-TASK] Runnable queue: ${runnableTasks.length} task(s) ready.`);
    } else {
      console.log(`[NEXT-TASK] No runnable tasks ready. ${blockedTasks.length} task(s) blocked, ${completedTasks.size} completed.`);
    }
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
