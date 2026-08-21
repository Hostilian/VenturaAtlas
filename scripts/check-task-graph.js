/**
 * Venture Atlas OS — Task Graph & Agent Catalog Validator
 * ========================================================
 * Validates data/agent-task-graph.json integrity:
 * 1. Unique task IDs
 * 2. Valid dependency references (no dangling task IDs)
 * 3. Valid preferred_agent roles against .agents/AGENTS.md
 * 4. File existence checks for declared owned_paths
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const GRAPH_PATH = path.join(ROOT, 'data', 'agent-task-graph.json');
const AGENTS_PATH = path.join(ROOT, '.agents', 'AGENTS.md');

function validateTaskGraph() {
  console.log('=== Validating Agent Task Graph Integrity ===');
  
  if (!fs.existsSync(GRAPH_PATH)) {
    console.error(`[ERROR] Task graph file missing at: ${GRAPH_PATH}`);
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
  const tasks = graphData.tasks || [];
  console.log(`Total tasks in graph: ${tasks.length}`);

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

  const taskById = new Map(tasks.map(task => [task.id, task]));
  const visiting = new Set();
  const visited = new Set();
  function visit(taskId, trail = []) {
    if (visiting.has(taskId)) {
      errors.push(`Dependency cycle detected: ${[...trail, taskId].join(' -> ')}`);
      return;
    }
    if (visited.has(taskId) || !taskById.has(taskId)) return;
    visiting.add(taskId);
    for (const dependency of taskById.get(taskId).dependencies || []) visit(dependency, [...trail, taskId]);
    visiting.delete(taskId);
    visited.add(taskId);
  }
  for (const taskId of taskIds) visit(taskId);

  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`[ERROR] ${e}`));
    process.exit(1);
  }
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[WARN] ${w}`));
  }

  console.log(warnings.length > 0
    ? '[OK] Agent Task Graph structural validation passed with disclosed warnings.'
    : '[OK] Agent Task Graph structural validation passed cleanly.');
}

validateTaskGraph();
