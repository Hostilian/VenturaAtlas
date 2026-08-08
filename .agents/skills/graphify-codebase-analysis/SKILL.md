---
name: graphify-codebase-analysis
description: "Graphify AST Codebase Dependency & Structural Acceleration Skill for EUshop AI Agents"
---

# Graphify Codebase Dependency & Structural Acceleration Skill

## Overview

This skill leverages **Graphify** (`tools/graphify`) to construct graph-based structural dependency trees of the EUshop repository (`current repository`).

Use this skill whenever:
- Analyzing cross-module dependencies between `apps/web`, `services/core-service`, `packages/compliance`, and `packages/types`.
- Distributing non-overlapping tasks across parallel sidecar workers (`security`, `tests`, `frontend`, `docs`).
- Performing AST impact analysis before large refactoring cycles.

---

## Direct Usage Commands

### 1. Generate Graphify Codebase Analysis
```bash
python -m graphify analyze .
```

### 2. Inspect Dependency Edges
```bash
graphify export --format json --output docs/v66/codebase-graph.json
```

---

## Multi-Agent File Isolation Protocol

When distributing tasks to sidecar worktrees (`.agent-worktrees\`):
1. **Primary Lane (`.`)**: Core transaction & order processing (`OrderService.java`, `PaymentService.java`).
2. **Security Sidecar (`.agent-worktrees\security`)**: Authorization, path validation, CSP headers (`FileStorageService.java`, `SecurityConfig.java`).
3. **Tests Sidecar (`.agent-worktrees\tests`)**: Playwright E2E and property tests (`e2e/`, `test/`).
4. **Frontend Sidecar (`.agent-worktrees\frontend`)**: Design system tokens & WCAG accessibility (`apps/web/components/`).
5. **Docs Sidecar (`.agent-worktrees\docs`)**: Ground truth inventory & SBOM (`docs/v66/`).
