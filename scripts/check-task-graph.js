#!/usr/bin/env node
/**
 * Venture Atlas OS — Task Graph & Agent Catalog Validator
 * ========================================================
 * Validates data/agent-task-graph.json and .agent-system/backlog.json integrity:
 * 1. Unique task IDs
 * 2. Valid dependency references (no dangling task IDs)
 * 3. Cycle detection and topological sort validation
 * 4. Valid preferred_agent roles against .agents/AGENTS.md
 * 5. File existence checks for declared owned_paths
 * 6. Emits audit receipt
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const GRAPH_PATH = path.join(ROOT, 'data', 'agent-task-graph.json');
const BACKLOG_PATH = path.join(ROOT, '.agent-system', 'backlog.json');
const AGENTS_PATH = path.join(ROOT, '.agents', 'AGENTS.md');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'task-graph-audit.json');

function validateTaskGraph() {
  console.log('=== Validating Agent Task Graph Integrity ===');
  
  if (!fs.existsSync(GRAPH_PATH)) {
    console.error(`[ERROR] Task graph file missing at: ${GRAPH_PATH}`);
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
  const tasks = graphData.tasks || [];
  console.log(`Total tasks in capability graph: ${tasks.length}`);

  const taskIds = new Set();
  const errors = [];
  const warnings = [];
  const runtimePrivatePaths = new Set(graphData.runtime_private_paths || []);
  const runtimeGeneratedPaths = new Set(graphData.runtime_generated_paths || []);

  // Read AGENTS.md to extract valid agent names
  const agentsContent = fs.existsSync(AGENTS_PATH) ? fs.readFileSync(AGENTS_PATH, 'utf-8') : '';
  const agentMatches = [...agentsContent.matchAll(/`([a-z0-9-]+(?:-agent|architect|engineer))`|^\d+\.\s+\*\*`([a-z0-9-]+)`\*\*/gm)].map(m => m[1] || m[2]);
  const validAgents = new Set(agentMatches);

  if (graphData.total_tasks !== tasks.length) {
    errors.push(`Declared total_tasks ${graphData.total_tasks} does not match tasks length ${tasks.length}`);
  }

  tasks.forEach(task => {
    if (taskIds.has(task.id)) {
      errors.push(`Duplicate task ID: ${task.id}`);
    }
    taskIds.add(task.id);

    // Validate preferred_agent
    if (task.preferred_agent && validAgents.size > 0 && !validAgents.has(task.preferred_agent)) {
      warnings.push(`Task ${task.id} specifies unknown agent: '${task.preferred_agent}'`);
    }

    if (!Array.isArray(task.owned_paths) || task.owned_paths.length === 0) {
      errors.push(`Task ${task.id} does not declare any owned_paths`);
    }
    for (const ownedPath of task.owned_paths || []) {
      const resolved = path.resolve(ROOT, ownedPath);
      if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
        errors.push(`Task ${task.id} owned_path escapes repository root: ${ownedPath}`);
      } else if (!fs.existsSync(resolved) && !runtimePrivatePaths.has(ownedPath) && !runtimeGeneratedPaths.has(ownedPath)) {
        errors.push(`Task ${task.id} owned_path does not exist: ${ownedPath}`);
      }
    }
  });

  // Check dependencies
  tasks.forEach(task => {
    (task.dependencies || []).forEach(depId => {
      if (!taskIds.has(depId)) {
        errors.push(`Task ${task.id} has dangling dependency: ${depId}`);
      }
    });
    (task.blocks || []).forEach(blockId => {
      if (!taskIds.has(blockId)) {
        warnings.push(`Task ${task.id} references unknown blocks task: ${blockId}`);
      }
    });
  });

  const dependencyEdges = tasks.reduce((sum, task) => sum + (task.dependencies || []).length, 0);
  const blockEdges = tasks.reduce((sum, task) => sum + (task.blocks || []).length, 0);
  if (tasks.length > 1 && dependencyEdges === 0 && blockEdges === 0) {
    warnings.push('Task graph has no dependency or block edges; ordering/reachability is not represented');
  }

  // Capability graph cycle detection
  const taskById = new Map(tasks.map(task => [task.id, task]));
  const visiting = new Set();
  const visited = new Set();
  function visit(taskId, trail = []) {
    if (visiting.has(taskId)) {
      errors.push(`Capability graph dependency cycle detected: ${[...trail, taskId].join(' -> ')}`);
      return;
    }
    if (visited.has(taskId) || !taskById.has(taskId)) return;
    visiting.add(taskId);
    for (const dependency of taskById.get(taskId).dependencies || []) visit(dependency, [...trail, taskId]);
    visiting.delete(taskId);
    visited.add(taskId);
  }
  for (const taskId of taskIds) visit(taskId);

  // Authoritative backlog cycle detection
  if (fs.existsSync(BACKLOG_PATH)) {
    try {
      const backlog = JSON.parse(fs.readFileSync(BACKLOG_PATH, 'utf-8'));
      const bTasks = backlog.tasks || [];
      const bTaskById = new Map(bTasks.map(t => [t.id, t]));
      const bVisiting = new Set();
      const bVisited = new Set();

      function visitBacklog(taskId, trail = []) {
        if (bVisiting.has(taskId)) {
          errors.push(`Authoritative backlog dependency cycle detected: ${[...trail, taskId].join(' -> ')}`);
          return;
        }
        if (bVisited.has(taskId) || !bTaskById.has(taskId)) return;
        bVisiting.add(taskId);
        for (const dep of bTaskById.get(taskId).dependencies || []) {
          visitBacklog(dep, [...trail, taskId]);
        }
        bVisiting.delete(taskId);
        bVisited.add(taskId);
      }

      for (const t of bTasks) {
        visitBacklog(t.id);
      }
    } catch (err) {
      errors.push(`Failed to parse authoritative backlog: ${err.message}`);
    }
  }

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: errors.length === 0 ? 'PASSED' : 'FAILED',
    metrics: {
      totalCapabilityTasks: tasks.length,
      dependencyEdges,
      blockEdges,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    },
    errors,
    warnings,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`[ERROR] ${e}`));
    if (require.main === module) process.exit(1);
    return false;
  }
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[WARN] ${w}`));
  }

  console.log(warnings.length > 0
    ? '[OK] Agent Task Graph structural validation passed with disclosed warnings.'
    : '[OK] Agent Task Graph structural validation passed cleanly.');
  return true;
}

if (require.main === module) {
  validateTaskGraph();
}

module.exports = { validateTaskGraph };
