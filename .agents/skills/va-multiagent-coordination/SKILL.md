---
name: va-multiagent-coordination
description: Multi-agent state synchronization, lock-free Git worktrees, and rebase protocol for VenturaAtlas OS.
---

# Multi-Agent State Synchronization & Lock-Free Worktree Discipline

This skill governs concurrent AI agent execution in VenturaAtlas OS to eliminate merge conflicts, state corruption, and lost updates.

## Core Rules

1. **Git Worktree Isolation**:
   - Every autonomous subagent MUST execute in a dedicated Git worktree branch (`feat/va-<role>-<taskid>`).
   - Direct concurrent writes to `main` branch are strictly prohibited.

2. **Lock-Free State Synchronization**:
   - Shared dataset updates (`data/ideas.json`, `data/sources.json`) must go through atomic schema verification and ID allocation locks.
   - Use `npm run check-consistency` to detect ID collisions or orphaned relationships.

3. **Rebase-Before-Merge Protocol**:
   - Before merging any feature worktree into `main`, rebase on latest `main`:
     ```bash
     git fetch origin main
     git rebase origin/main
     ```
   - Run full quality verification before merging:
     ```bash
     npm run quality
     ```
