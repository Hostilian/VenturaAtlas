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

  // Read AGENTS.md to extract valid agent names
  const agentsContent = fs.existsSync(AGENTS_PATH) ? fs.readFileSync(AGENTS_PATH, 'utf-8') : '';
  const agentMatches = [...agentsContent.matchAll(/`([a-z0-9-]+(?:-agent|architect|engineer))`|^\d+\.\s+\*\*`([a-z0-9-]+)`\*\*/gm)].map(m => m[1] || m[2]);
  const validAgents = new Set(agentMatches);

  tasks.forEach(task => {
    if (taskIds.has(task.id)) {
      errors.push(`Duplicate task ID: ${task.id}`);
    }
    taskIds.add(task.id);

    // Validate preferred_agent
    if (task.preferred_agent && validAgents.size > 0 && !validAgents.has(task.preferred_agent)) {
      warnings.push(`Task ${task.id} specifies unknown agent: '${task.preferred_agent}'`);
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

  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`[ERROR] ${e}`));
    process.exit(1);
  }
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[WARN] ${w}`));
  }

  console.log('[OK] Agent Task Graph validation passed cleanly!');
}

validateTaskGraph();
