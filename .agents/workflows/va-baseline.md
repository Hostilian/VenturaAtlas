# Workflow: `/va-baseline`

## Purpose
Capture baseline repository commit, uncommitted diffs, environment versions, and data integrity hashes before starting work.

## Execution Steps
1. Execute `git rev-parse HEAD` and `git status --porcelain`.
2. Inspect environment versions (`node --version`, `python --version`).
3. Run `node scripts/build-repository-meta.js --check` to verify baseline truth.
