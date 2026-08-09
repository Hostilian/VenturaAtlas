# OMEGA VII — Operational Runbook

## Setup

Run from the repository root. Do not reset or clean the user's worktree. Record `git rev-parse HEAD` before and after each implementation wave. Use fixtures or isolated temporary directories for destructive/failure tests.

## Safe ordering

1. Freeze Git/runtime/instruction state.
2. Profile contracts and execution reachability without writes.
3. Reproduce and independently review a finding.
4. Apply schema → migration → producer → consumer → validator → public projection ordering.
5. Run targeted tests before broader gates.
6. Generate twice and require a fixed point.
7. Build one exact public artifact; scan, hash, and browser-test that same artifact without rebuilding.
8. Verify in a fresh isolated clone/worktree and reconcile HEAD drift.

## Baseline commands

```powershell
git status --porcelain=v1
git branch --show-current
git rev-parse HEAD
git log -n 30 --oneline --decorate
git diff --stat
git diff
git worktree list
node --version
npm --version
python --version
codex --version
```

## Validation ladder

```powershell
npm run check-js
npm run typecheck
npm run test:unit
npm run validate:source
npm run check-consistency
npm run check-task-graph
npm run check:drift
python scripts/verify_constitution.py
python scripts/check_privacy.py
npm run build:verified
npm run test:race
npm run test:providers
npm run test:e2e
```

Commands are hypotheses until executed in this run; record actual exit codes and artifacts in `CODEX_LOG.md`.

## Migration and rollback

- Snapshot affected canonical inputs to a temporary, excluded location before high-risk migration.
- Emit an input manifest, output manifest, method version, and migration receipt.
- Use atomic replacement and bounded locks for critical JSON.
- Roll back by restoring the verified snapshot only after resolving exact paths; never use `git reset --hard` or `git clean`.
- Quarantine uncertain legacy cohorts rather than deleting or silently relabeling them.

## Fresh-clone verification

Create an isolated temporary clone/worktree from the candidate commit, install from the lockfile, run generation to a fixed point, build once, scan/hash that artifact, and run all release gates without relying on `.agent-state`, local credentials, or untracked files.

## Release verification

Record commit, input manifest, tool versions, artifact digest, privacy result, test results, browser result, known limitations, and rollback/recovery path. Configured cloud resources or successful local responses are not deployment evidence.
