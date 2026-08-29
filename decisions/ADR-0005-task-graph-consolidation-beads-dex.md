# ADR-0005: Task & Backlog Graph Consolidation (Beads & Dex)

**Status:** Accepted  
**Date:** 2026-08-29  
**Decision Makers:** VenturaAtlas Core Engineering / Antigravity Agent  
**Context:** Syntax.fm #998 ("How to Fix Vibe Coding") Phase 6  

---

## 1. Context & Problem Statement

VenturaAtlas previously operated a three-way custom task tracking structure across `.agent-system/backlog.json`, `.agent-system/state.json`, and multiple hand-rolled scripts (`scripts/check-task-graph.js`, `scripts/agents-status.js`, `scripts/agents-watch.js`, `scripts/agents-health.js`, `scripts/agents-graph.js`).

This custom architecture had several limitations:
1. No git-native atomic issue claiming across multi-agent worktrees.
2. Custom dependency cycle detection code that had to be manually maintained.
3. No standard MCP integration for agents to discover, claim, and close tasks.

---

## 2. Decision & Evaluation

We evaluated two modern deterministic task systems from Syntax #998:
- **`beads` (`bd`)**: A git-native, dependency-aware issue graph with atomic claiming for multi-agent swarms and its own MCP server.
- **`dex` (`dex.rip`)**: A lightweight Epic/Task/Subtask local markdown hierarchy in `.dex/`.

### Decision Matrix

| Capability | Beads (`bd`) (Primary) | Dex (`dex.rip`) (Fallback) |
| :--- | :--- | :--- |
| **Multi-Agent Atomic Claiming** | Built-in (`bd update --claim`). | File-lock based; manual coordination. |
| **Dependency Graph Logic** | Native DAG cycle detection & topological sorting. | Linear/Hierarchical parent-child tree. |
| **MCP Integration** | Native `bd mcp` server. | Custom adapter required. |
| **Persistence Model** | Git-native branch/commit state. | Markdown frontmatter files. |

---

## 3. Implementation & Migration Steps

1. **Pre-Migration Safety Backup:**
   - Full snapshot preserved at `research/audits/2026-08-29-backlog-pre-migration.json` (35 tasks, 0 lost).
2. **Beads Adapter & Projections (`scripts/beads-adapter.js`):**
   - Projects authoritative tasks into Beads nodes and edges (`.agent-state/views/beads-backlog.json`).
3. **Dex Adapter & Projections (`scripts/dex-adapter.js`):**
   - Maintained as a lightweight non-authoritative fallback projection (`.agent-state/views/dex-backlog.json`).
4. **Unified Task CLI (`scripts/task.js`):**
   - Provides commands `task next`, `task list`, `task done <id>`, `task block <id> <by>` ensuring deterministic dependency evaluation.
5. **Task Graph Validation (`scripts/check-task-graph.js`):**
   - Validates that the entire graph is strictly acyclic, unassigned work is flagged, and blockers are enforced.

---

## 4. Consequences

- 100% data retention of existing task history and lineage.
- Multi-agent runners can execute `node scripts/task.js next` to claim the highest-priority unblocked task deterministically.
- Deprecated legacy reporting scripts (`agents-status`, `agents-watch`, `agents-graph`) in favor of unified CLI and Beads projections.
