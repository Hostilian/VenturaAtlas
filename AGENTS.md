# Venture Atlas OS — Repository Instructions

## Durable invariants

- Protect user work. Never discard unknown edits, reset the worktree, or rewrite unrelated files.
- Never fabricate evidence, demand, validation, scores, dates, source classes, deployment state, or collaboration state. Missing information remains missing.
- Canonical data is `data/ideas.json`. Discover the current authoritative staging location programmatically. Compute repository truth with the repository truth tooling; never infer current counts from this file.
- Preserve record IDs, lineage, negative evidence, historical provenance, and explicit uncertainty.
- Canonical writes must use the authorized lifecycle/publisher path and atomic I/O. Do not mass-edit canonical JSON to bypass promotion or validation.
- `_site/` is generated. Fix generators or source data; never patch generated output as the source of truth.
- `.agent-state/`, `.agents/`, `.codex/`, private research, provider state, and staging data are not public artifacts.
- Keep secrets out of source, prompts, logs, command arguments, Git remotes, and public artifacts.
- Configuration, hooks, rules, validators, cloud resources, tests, and UI controls are capabilities only after their execution path is demonstrated.
- Run proportionate tests after changes. For release claims, use the exact generated artifact for validation, privacy scanning, digesting, and browser checks.
- Preserve the existing Antigravity agent infrastructure where useful. Codex-native configuration lives separately under `.codex/`.

## OMEGA missions

For an OMEGA mission, read the active run's `research/audits/<RUN_ID>/CODEX_SPEC.md`, `CODEX_PLAN.md`, `CODEX_IMPLEMENT.md`, and `CODEX_LOG.md`. Keep the log and change ledger resumable, concise, and evidence-based.
