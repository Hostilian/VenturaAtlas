#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const graphFile = path.join(__dirname, '..', '.agent-state', 'task-graph.json');

if (fs.existsSync(graphFile)) {
  const g = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
  console.log('\n=== AGENT TASK GRAPH ===\n');
  g.nodes.forEach(node => {
    const statusIcon = node.status === 'completed' ? '✅' : node.status === 'in_progress' ? '🔄' : '⏳';
    const deps = node.dependencies.length ? `(depends on: ${node.dependencies.join(', ')})` : '(root)';
    console.log(`${statusIcon} [${node.id}] ${node.name}`);
    console.log(`   Agent: ${node.agent} | Weight: ${node.weight}% | Status: ${node.status} ${deps}\n`);
  });
  console.log('========================\n');
} else {
  console.log('No task graph found at .agent-state/task-graph.json');
}
