# Workflow: `/va-promote`

## Purpose
Promote a staged candidate from `data/idea-staging-queue.json` to canonical `data/ideas.json`.

## Execution Steps
1. Verify candidate has `evidenceStatus: "verified"` and attached external primary sources (`sXX`).
2. Run `python scripts/review-staged-ideas.py`.
3. Re-run `python scripts/va-ranker.py --update` and `node scripts/build-repository-meta.js`.
