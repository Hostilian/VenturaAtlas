---
name: eushop-autonomous-multiagent-coordination
description: "Multi-Agent State Synchronization, Lock-Free Worktrees & Rebase Protocol for EUshop"
---

# EUshop Multi-Agent Coordination Skill

## Overview

This skill establishes multi-agent state logging, lock-free worktree task assignment, and branch rebase integration protocols.

---

## 1. Multi-Agent Synchronization Standard

- **Daemon Logging**: Append state updates to `.agent-state/logs/unattended-runner.log` using timestamped JSON format.
- **Git Worktree Isolation**: Primary worker owns `.`. Sidecar agents operate inside `.agent-worktrees\` on dedicated branches (`agent/*`).
- **Rebase Protocol**: Sidecar branches rebase onto `main` before submitting merge-ready PRs.
