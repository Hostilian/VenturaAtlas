---
trigger: always_on
description: Agent role boundaries, ownership, and coordination guidelines
---

# Agent Ownership & Worktree Rules

1. **Worktree Isolation**: Sidecar agents operate in dedicated worktrees (`.agent-worktrees/`).
2. **Single Canonical Writer**: Only `scripts/va_runtime/publisher.py` is authorized to publish canonical `idea-XXX` items to `data/ideas.json`.
3. **Lock-Free Coordination**: Agents must log state updates to `.agent-state/logs/` and rebase onto `main` before submitting pull requests.
