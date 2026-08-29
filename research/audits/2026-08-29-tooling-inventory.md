# VenturaAtlas Repository Tooling Inventory (Phase 0 Baseline)

**Date:** 2026-08-29  
**Repository Version:** 2.7.1  
**Total Scripts In Scope:** ~180 script files, 70 npm script targets  
**Audit Purpose:** Syntax #998 Deterministic Tooling Modernization  

---

## 1. Executive Summary of Tooling Classification

| Classification | Count (Est.) | Description |
| :--- | :---: | :--- |
| **`KEEP` (Domain-Specific)** | ~145 | Core venture research generators, financial models, multi-lens opportunity validators, market engines, data schemas, and public artifact staging logic that cannot be replaced by generic tooling. |
| **`REPLACE` (Generic Replacements)** | ~15 | Hand-rolled linters, syntax checks, duplicate detectors, and complexity checkers being replaced by AST-level Rust/TypeScript deterministic tools (Fallow, ESLint, StyleLint, Knip, JSCPD, Wallace). |
| **`RETIRE_AFTER_MIGRATION`** | ~20 | Bespoke task-graph, watchdog, and status wrappers being superseded by git-native Beads issue graphs and modern Sentry/Spotlight runtime observability. |

---

## 2. Exhaustive Script Inventory

### A. Code Quality, Linting, & Formatting

| Script Name | Current Purpose | Target Classification | Deterministic Tooling Replacement |
| :--- | :--- | :---: | :--- |
| `scripts/check-js-syntax.js` | Hand-rolled JS syntax validator via `new Function` / `vm` compilation. | **`REPLACE`** | `eslint` / `oxlint` (AST parsing with full language support). |
| `scripts/check-format.js` | Custom indentation & whitespace linter. | **`REPLACE`** | `oxfmt` / `prettier` / `eslint-plugin-format`. |
| `scripts/check_python_syntax.py` | Python AST syntax compile verification. | **`KEEP`** | Keep as fast preflight; optional upgrade to `ruff`. |
| `scripts/check-links.js` | Internal Markdown link and dossier URI integrity checker. | **`KEEP`** | Domain-specific repo link graph integrity. |
| `scripts/check-duplicates.js` | Duplication checker wrapper. | **`REPLACE`** | `jscpd` + `fallow`. |
| `scripts/check-unused.js` | Unused dependency / export analyzer wrapper. | **`REPLACE`** | `knip` + `fallow`. |
| `scripts/check-fallow.js` | Fallow CLI runner. | **`KEEP`** | Primary Phase 1 deterministic quality engine. |
| `scripts/check-jscpd.js` | JSCPD runner. | **`KEEP`** | Phase 1 duplicate code gate. |
| `scripts/check-knip.js` | Knip runner. | **`KEEP`** | Phase 1 unused code gate. |
| `scripts/check-css-metrics.js` | Wallace CSS complexity analyzer. | **`KEEP`** | Phase 1 CSS metrics gate. |
| `scripts/check-css-fast.js` | Fast CSS preflight checker. | **`KEEP`** | Fast preflight token check. |
| `scripts/validate-ai-antipatterns.js`| Scans for forbidden AI boilerplate patterns. | **`KEEP`** | Domain-specific agent discipline validator. |
| `scripts/validate-design-tokens.js`| Validates CSS variable adherence across stylesheets. | **`KEEP`** | Domain-specific design system validator. |
| `scripts/validate-todos.js` | Enforces task-linked annotation syntax. | **`KEEP`** | Domain-specific task annotation validator. |
| `scripts/run-quality.js` | Multi-tier quality gate runner (`fast`, `agent`, `deep`, `release`, `gate`). | **`KEEP` (Extend)** | Primary orchestrator for deterministic completion sequence. |

---

### B. Task, Backlog, & Multi-Agent Orchestration

| Script Name | Current Purpose | Target Classification | Replacement / Modernization Path |
| :--- | :--- | :---: | :--- |
| `scripts/check-task-graph.js` | Custom JSON task graph dependency cycle and state checker. | **`RETIRE_AFTER_MIGRATION`** | `beads` (`bd`) dependency graph validation. |
| `scripts/agents-status.js` | Displays multi-agent queue status from `.agent-system/`. | **`RETIRE_AFTER_MIGRATION`** | `bd status` / `bd ready`. |
| `scripts/agents-watch.js` | Watchdog polling `.agent-system/tasks.json`. | **`RETIRE_AFTER_MIGRATION`** | `bd log` / `bd watch`. |
| `scripts/agents-health.js` | Provider & subagent health checker. | **`KEEP`** | Retain for LLM provider circuit-breaker tracking. |
| `scripts/agents-graph.js` | ASCII task graph renderer. | **`RETIRE_AFTER_MIGRATION`** | `bd graph` / `bd show`. |
| `scripts/beads-adapter.js` | Adapter bridging beads (`bd`) to `.agent-system/`. | **`KEEP`** | Phase 6 Beads primary bridge. |
| `scripts/dex-adapter.js` | Fallback adapter for Dex task tracking. | **`KEEP`** | Phase 6 Dex fallback option. |
| `scripts/task.js` | Unified task query, claim, and complete CLI. | **`KEEP`** | Front-end CLI for Beads/Dex interaction. |
| `scripts/resolve-next-task.js` | Task selector for autonomous runners. | **`KEEP`** | Bridges Beads `bd ready` to autonomous agent loops. |
| `scripts/sync_agent_task_graph.py` | Syncs agent worktrees to task graph. | **`RETIRE_AFTER_MIGRATION`** | Superseded by Beads git worktree state sync. |
| `scripts/build_massive_task_backlog.py`| Synthesizes backlog entries. | **`KEEP`** | One-off backlog expansion generator. |

---

### C. Runtime Observability & Browser QA

| Script Name | Current Purpose | Target Classification | Modernization Path |
| :--- | :--- | :---: | :--- |
| `scripts/check-sentry.js` | Sentry runtime health and configuration checker. | **`KEEP`** | Phase 3 error observability gate. |
| `scripts/sentry-adapter.js` | Node/browser Sentry bootstrap with PII scrubbing. | **`KEEP`** | Phase 3 Sentry client adapter. |
| `scripts/spotlight-adapter.js` | Local Spotlight sidecar runner (`spotlightjs.com`). | **`KEEP`** | Phase 3 local dev error overlay & MCP. |
| `scripts/agent-browser.js` | Headless browser runner for agent exploratory QA. | **`KEEP`** | Phase 4 agent browser exploratory suite. |
| `scripts/lightpanda-smoke.js` | Fast headless smoke tests via Lightpanda engine. | **`KEEP`** | Phase 4 ultra-fast static lab smoke engine. |
| `scripts/discover-server-url.js`| Resolves local HTTP server port dynamically. | **`KEEP`** | Helper for Spotlight / Agent-Browser. |

---

### D. Component System & Shared UI

| Script Name | Current Purpose | Target Classification | Modernization Path |
| :--- | :--- | :---: | :--- |
| `scripts/build-component-inventory.js` | Extracts and validates shared UI components across labs. | **`KEEP`** | Phase 5 component catalog generator. |
| `scripts/discover-components.js` | AST scanner extracting component markup & tokens. | **`KEEP`** | Phase 5 living Storybook catalog feeder. |

---

### E. Domain-Specific Research, Data, & Staging Keepers (Non-Negotiable)

| Category / Scripts | Purpose & Invariant | Classification |
| :--- | :--- | :---: |
| `scripts/validate-data.js`<br>`scripts/validate-schema.py`<br>`scripts/build-idea-taxonomy.js`<br>`scripts/truth-reconciler.js` | Core validation of 324 canonical ideas in `data/ideas.json`, JSON Schema draft-2020-12 adherence, category hierarchy, and multi-agent truth reconciliation. | **`KEEP`** |
| `scripts/validate-terrain.js`<br>`scripts/build-terrain-index.js` | **TERRAIN Lab:** Problem, customer job, workflow friction, and solution space graph integrity. | **`KEEP`** |
| `scripts/validate-mercury.js`<br>`scripts/validate-commercial-reality.js` | **MERCURY Lab:** Commercial validation receipts, customer interview logs, and pricing discovery evidence. | **`KEEP`** |
| `scripts/validate-chessboard.js` | **CHESSBOARD Lab:** Market structure, value-chain control points, and competitive response models. | **`KEEP`** |
| `scripts/validate-census.js` | **CENSUS Lab:** Statistical unit denomination, market funnels, and anti-TAM linter. | **`KEEP`** |
| `scripts/validate-shockgraph.js`<br>`scripts/validate-phaseshift.js`<br>`scripts/build-phase-forward-counterfactuals.js` | Market shock propagation, counterfactual scenario modeling, and macroeconomic phase shifts. | **`KEEP`** |
| `scripts/validate-capital-clock.js`<br>`scripts/validate-capital-clock-ledger.js`<br>`scripts/validate-cutover-inventory-clock.js`<br>`scripts/validate-absorption-frontier.js` | **CAPITAL Lab:** Venture capital countdowns, dilution schedules, cutover inventory, and absorption frontiers. | **`KEEP`** |
| `scripts/validate-authority-registries.js`<br>`scripts/validate-lifecycle-receipts.js`<br>`scripts/validate-validation-funnel.js`<br>`scripts/validate-proofops.py`<br>`scripts/validate-machine-rights.py`<br>`scripts/validate-completion-audit.js` | Cryptographic evidence receipts, validation funnels, ProofOps experiments, machine rights, and OMEGA mission completion audits. | **`KEEP`** |
| `scripts/build-public-artifact.js`<br>`scripts/clean-generated.js`<br>`scripts/hash-public-artifact.js`<br>`scripts/check-public-artifact.js`<br>`scripts/check_privacy.py`<br>`scripts/verify_constitution.py`<br>`scripts/check-autonomy-contract.py` | GitHub Pages public artifact builder (`_site/`), secret and privacy boundary scanning, and autonomy constitution verification. | **`KEEP`** |
| `scripts/build-search-index.js`<br>`scripts/build-repository-meta.js`<br>`scripts/update-documentation-stats.js`<br>`scripts/calculate-rankings.js` | Metadata projections, search index compilers, and multi-lens ranking engines. | **`KEEP`** |
| `scripts/ingest-*.py`<br>`scripts/ingest_*.py`<br>`scripts/generate-eighth-reset-*.py`<br>`scripts/apply-reset-xix.py`<br>`scripts/va-*.py`<br>`scripts/va_orchestrator.py` | Historical data ingestion receipts (Reset 1–20), dossier generators, multi-model consensus calculators, and research pipeline orchestrator. | **`KEEP`** |

---

## 3. Deprecation and Transition Plan

1. **Step 1:** Mark `check-js-syntax.js` and `check-format.js` as deprecated once `npm run lint:eslint` and `npm run format:check` prove 100% parity across broken test fixtures.
2. **Step 2:** Mark bespoke task scripts (`check-task-graph.js`, `agents-status.js`, `agents-watch.js`, `agents-graph.js`) as deprecated once `beads` (`bd`) is fully initialized and operational.
3. **Step 3:** Record all formal retirement decisions in `decisions/ADR-0005-task-graph-consolidation-beads-dex.md` and `decisions/ADR-0002-formatting-linting-strategy.md`.
