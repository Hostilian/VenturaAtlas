#!/usr/bin/env node
/**
 * Beads Task Graph Adapter (Non-Authoritative)
 * Projects the authoritative .agent-system/backlog.json into Beads graph format (nodes + edges).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, '.agent-system', 'backlog.json');
const TARGET_PATH = path.join(ROOT, '.agent-state', 'views', 'beads-backlog.json');

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error('[BEADS-ADAPTER] Error: .agent-system/backlog.json missing.');
    process.exit(1);
  }

  const backlog = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  const tasks = backlog.tasks || [];

  const nodes = [];
  const edges = [];

  for (const t of tasks) {
    nodes.push({
      id: t.id,
      label: t.title,
      type: 'task',
      data: {
        domain: t.domain,
        priority: t.priorityScore,
        urgency: t.urgency,
        status: t.status,
        agent: t.assignedAgent,
      },
    });

    for (const dep of t.dependencies || []) {
      edges.push({
        id: `edge-${dep}->${t.id}`,
        source: dep,
        target: t.id,
        relationship: 'depends_on',
      });
    }
  }

  const beadsView = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    sourceAuthority: '.agent-system/backlog.json',
    authoritative: false,
    viewType: 'beads',
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };

  const targetDir = path.dirname(TARGET_PATH);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(TARGET_PATH, JSON.stringify(beadsView, null, 2), 'utf-8');

  if (process.argv.includes('--stdout')) {
    console.log(JSON.stringify(beadsView, null, 2));
  } else {
    console.log(`[BEADS-ADAPTER] Projected ${nodes.length} nodes and ${edges.length} edges to ${path.relative(ROOT, TARGET_PATH)}`);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
