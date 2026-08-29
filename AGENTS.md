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
## Orchestration Layers & Single Source of Truth

### Reconciled multi-agent authority

`.agent-system/` is the single source of truth for live priorities, backlog status,
runtime state, and provider-health receipts. `.agents/` is the Antigravity role,
skill, hook, and file-ownership layer; its role files must not maintain a second
backlog or runtime-health truth. Codex-native configuration remains under
`.codex/`.

This repository explicitly reconciles multi-agent configuration across dedicated surfaces:

1. **Runtime Task, State & Priorities Authority (`.agent-system/`)**:
   - `.agent-system/backlog.json`: The authoritative prioritized work backlog, including recurring and externally blocked work. `.agent-system/BACKLOG.md` is its generated review projection.
   - `.agent-system/MASTER_GOAL.md`: Core system directives, 12 evaluation dimensions, and non-negotiable rules.
   - `.agent-system/state.json`: Live operational state and canonical metric tracking.
   - `.agent-system/provider-registry.json`: Provider tier definitions and freshness-checked health status.

2. **Specialist Agent Capability & Role Architecture (`.agents/`)**:
   - `.agents/AGENTS.md`: Multi-agent orchestration rules, file ownership boundaries, and operational domains.
   - `.agents/agents/*.md`: Specialist subagent specifications equipped with Antigravity 2.0 YAML frontmatter and workspace skill assignments.
   - `.agents/hooks.json`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`: Antigravity workspace extensions and lifecycle hooks.

3. **Codex CLI Configuration (`.codex/`)**:
   - Dedicated configuration for OpenAI Codex CLI (`.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/rules/destructive.rules`).

## Deterministic quality contract

- Upon completion of any feature, bugfix, or refactor, always run the deterministic completion sequence: `npm run quality:gate`.
- Run deterministic linters and test suites instead of guessing: `check-js`, `check-python`, `typecheck`, `check:eslint`, `check:stylelint`, `check:duplicates`, `check:unused`, `validate:source`, `check:inventory`, `check:browser`, `test:unit`, `check:bugs`, `check-task-graph`.
- When unsure of a library API (Playwright, ESLint, Knip, JSCPD, Node), query Context7 MCP before writing code; do not guess signatures.
- All `TODO` and `FIXME` comments must reference an authoritative task ID in format: `// TODO(TASK-ID): explanation`.
- Automated fixes are opt-in and human-reviewed (`npm run quality:fix`); never auto-delete unverified files.

## OMEGA missions

For an OMEGA mission, read the active run's `research/audits/<RUN_ID>/CODEX_SPEC.md`, `CODEX_PLAN.md`, `CODEX_IMPLEMENT.md`, and `CODEX_LOG.md`. Keep the log and change ledger resumable, concise, and evidence-based.
