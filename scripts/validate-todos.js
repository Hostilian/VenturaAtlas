#!/usr/bin/env node
/**
 * TODO & FIXME Backlog Linkage Validator
 * Enforces that every TODO/FIXME comment in the codebase explicitly references
 * an authoritative task ID (e.g. `// TODO(TASK-001): description` or `// TODO(CAP-001): description`).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'todos-audit.json');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '_site',
  '.git',
  '.agent-state',
  'dist',
  'tmp',
  'coverage',
]);

function loadValidTaskIds() {
  const ids = new Set();
  try {
    const backlog = JSON.parse(fs.readFileSync(path.join(ROOT, '.agent-system', 'backlog.json'), 'utf-8'));
    (backlog.tasks || []).forEach(t => ids.add(t.id));
  } catch (e) {
    console.warn('[TODOS] Warning: Could not read .agent-system/backlog.json:', e.message);
  }
  try {
    const graph = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'agent-task-graph.json'), 'utf-8'));
    (graph.tasks || []).forEach(t => ids.add(t.id));
  } catch (e) {
    console.warn('[TODOS] Warning: Could not read data/agent-task-graph.json:', e.message);
  }
  return ids;
}

function findSourceFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSourceFiles(full));
    } else if (entry.isFile() && /\.(js|ts|py|html|css)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const validTaskIds = loadValidTaskIds();
  const files = findSourceFiles(ROOT);
  const unlinkedTodos = [];
  const linkedTodos = [];
  const invalidTaskRefs = [];

  const TODO_REGEX = /(?:\/\/|#|\/\*|<!--)\s*(TODO|FIXME)(?:\(([^)]+)\))?\s*[:\s](.*)/gi;

  for (const file of files) {
    const relative = path.relative(ROOT, file).replace(/\\/g, '/');
    if (relative === 'scripts/validate-todos.js' || relative === 'scripts/validate-ai-antipatterns.js' || relative.startsWith('tests/quality-infrastructure')) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      const regex = new RegExp(TODO_REGEX);
      while ((match = regex.exec(line)) !== null) {
        const type = match[1].toUpperCase();
        const taskId = match[2] ? match[2].trim() : null;
        const comment = match[3] ? match[3].trim() : '';

        if (!taskId) {
          unlinkedTodos.push({
            file: relative,
            line: i + 1,
            type,
            comment,
            raw: line.trim(),
          });
        } else {
          linkedTodos.push({
            file: relative,
            line: i + 1,
            type,
            taskId,
            comment,
          });
          if (!validTaskIds.has(taskId)) {
            invalidTaskRefs.push({
              file: relative,
              line: i + 1,
              taskId,
              comment,
            });
          }
        }
      }
    }
  }

  const passed = unlinkedTodos.length === 0 && invalidTaskRefs.length === 0;

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: passed ? 'PASSED' : 'VIOLATIONS_DETECTED',
    metrics: {
      filesScanned: files.length,
      linkedTodosCount: linkedTodos.length,
      unlinkedTodosCount: unlinkedTodos.length,
      invalidTaskRefsCount: invalidTaskRefs.length,
    },
    linkedTodos,
    unlinkedTodos,
    invalidTaskRefs,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[TODOS] Scanned ${files.length} files. Linked TODOs: ${linkedTodos.length}, Unlinked: ${unlinkedTodos.length}, Invalid task refs: ${invalidTaskRefs.length}`);
  console.log(`[TODOS] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);

  if (!passed) {
    if (unlinkedTodos.length > 0) {
      console.error(`[TODOS] FAILED: Found ${unlinkedTodos.length} unlinked TODO(s). Format must be TODO(TASK-ID):`);
      unlinkedTodos.slice(0, 5).forEach(t => console.error(`  - ${t.file}:${t.line} [${t.type}]: ${t.comment}`));
    }
    if (invalidTaskRefs.length > 0) {
      console.error(`[TODOS] FAILED: Found ${invalidTaskRefs.length} TODO(s) referencing unknown task IDs:`);
      invalidTaskRefs.slice(0, 5).forEach(t => console.error(`  - ${t.file}:${t.line} Task '${t.taskId}' not found in backlog or task graph.`));
    }
    process.exit(1);
  }

  console.log(`[TODOS] OK: All TODO/FIXME items are strictly linked to authoritative tasks.`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
