---
name: quality-check
description: Runs the full deterministic quality completion sequence, linters, duplication gates, and tests.
version: 1.0.0
---

# Quality Check Skill

## When to Use
Execute this skill upon completing any feature, bugfix, refactoring, or documentation update before committing code.

## Commands to Execute
```bash
# Fast Preflight Check (<2s)
npm run quality:fast

# Full Deterministic Pre-Commit Gate (<15s)
npm run quality:gate

# Deep Dynamic Analysis & Browser Tests (<60s)
npm run quality:deep
```

## Completion Sequence Rules
1. **Never guess**: Run deterministic tools over the codebase.
2. **Fail-closed**: Treat any exit code != 0 as a hard block.
3. **No automatic unverified deletion**: Treat knip and jscpd reports as review items.
4. **Link all TODOs**: Every `TODO` comment must include an authoritative task ID: `// TODO(TASK-ID): description`.
