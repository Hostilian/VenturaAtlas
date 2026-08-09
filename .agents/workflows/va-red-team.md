# Workflow: `/va-red-team`

## Purpose
Adversarial red-team pass inspecting claim support, overengineering, fragile ranking assumptions, and placebo features.

## Execution Steps
1. Run read-only audit across `data/ideas.json` and `ideas/*.md`.
2. Audit score dimension coverage and flag unevidenced assumptions.
3. Output red-team report in `research/audits/`.
