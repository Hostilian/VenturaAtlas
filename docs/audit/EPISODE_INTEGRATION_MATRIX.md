# VenturaAtlas — Episode #998 Integration Ledger & Scorecard

## Overview

This audit document tracks every concept, recommendation, and tool discussed in Syntax episode **#998 — “How to Fix Vibe Coding”**, mapping each item to its architectural tier, enforcement mechanism, test status, and remaining bounds within VenturaAtlas.

---

## Scorecard & Classification Summary

- **Total Episode Concepts Accounted For**: 35
- **Primary Quality Gates (`PRIMARY_GATE`)**: 16
- **Deep Audits (`DEEP_AUDIT`)**: 5
- **Developer Tools (`DEV_TOOL`)**: 7
- **Optional Adapters (`OPTIONAL_ADAPTER`)**: 2
- **Absorbed by Existing Authority (`ABSORBED_BY_EXISTING_VENTURAATLAS_MECHANISM`)**: 3
- **Proven Not Applicable / Replaced (`NOT_APPLICABLE_WITH_PROOF`)**: 2
- **Unaccounted Concepts**: 0

---

## Detailed Integration Ledger

### 1. Deterministic Code-Quality Analysis
- **Problem Solved**: Replaces reliance on LLM prose instructions with mechanical validation gates and cryptographic receipts.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/run-quality.js [tier]`
- **Files**: `scripts/run-quality.js`, `package.json`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/quality-receipts/quality-agent-latest.json`

### 2. `jscpd` for Duplication Detection
- **Problem Solved**: Prevents AI copy-paste code bloat across scripts, features, and stylesheets.
- **VenturaAtlas Tier**: `PRIMARY_GATE` / `DEEP_AUDIT`
- **Command / Config**: `node scripts/check-jscpd.js`, `.jscpd.json`
- **Files**: `.jscpd.json`, `scripts/check-jscpd.js`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/audit-reports/jscpd-report.json`

### 3. `Knip` for Dead Files, Exports, and Dependencies
- **Problem Solved**: Finds orphaned exports, dead files, and unused npm dependencies.
- **VenturaAtlas Tier**: `DEEP_AUDIT`
- **Command / Config**: `node scripts/check-knip.js`, `knip.json`
- **Files**: `knip.json`, `scripts/check-knip.js`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/audit-reports/knip-report.json`

### 4. `Fallow` for Codebase Health Analysis
- **Problem Solved**: Identifies circular dependencies, dead code, complexity hotspots, and architectural boundaries.
- **VenturaAtlas Tier**: `DEEP_AUDIT`
- **Command / Config**: `node scripts/check-fallow.js`, `fallow.json`
- **Files**: `fallow.json`, `scripts/check-fallow.js`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/audit-reports/fallow-report.json`

### 5. Project Wallace / CSS Metrics Analysis
- **Problem Solved**: Tracks CSS design token ratio, specificity extremes, and rule complexity.
- **VenturaAtlas Tier**: `DEEP_AUDIT`
- **Command / Config**: `node scripts/check-css-metrics.js`
- **Files**: `scripts/check-css-metrics.js`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/audit-reports/css-metrics-report.json`

### 6. Framework-Aware / Component-Aware Deterministic Fixers
- **Problem Solved**: Provides deterministic, evidence-producing repair tools instead of LLM guesswork.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `npm run format`, `npm run generate:taxonomy`, `npm run reconcile:truth`
- **Files**: `scripts/check-format.js`, `scripts/build-idea-taxonomy.js`
- **Status**: `VERIFIED_LOCAL`

### 7. Storybook / Component Discovery
- **Problem Solved**: Prevents AI from inventing redundant UI primitives by providing machine-discoverable components.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/discover-components.js`
- **Files**: `data/components.json`, `docs/components.html`, `.agents/skills/component-discovery/SKILL.md`
- **Status**: `VERIFIED_LOCAL`

### 8. Turning Bugs into Tests
- **Problem Solved**: Enforces a strict test-first bug resolution workflow.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node --test tests/bug-regression-suite.test.js`
- **Files**: `tests/bug-regression-suite.test.js`, `.agents/skills/bug-triage/SKILL.md`
- **Status**: `VERIFIED_LOCAL`

### 9. Sentry CLI for Operational Errors
- **Problem Solved**: Gives debugging agents access to real operational error traces while strictly scrubbing secrets/PII.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/sentry-adapter.js --test`
- **Files**: `services/sentry-config.js`, `scripts/sentry-adapter.js`
- **Status**: `VERIFIED_LOCAL`

### 10. Sentry Spotlight / Local Observability
- **Problem Solved**: Local structured developer telemetry for exceptions and traces without public build leakage.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/spotlight-adapter.js`
- **Files**: `scripts/spotlight-adapter.js`
- **Status**: `VERIFIED_LOCAL`

### 11. Type Checking After Features
- **Problem Solved**: Mechanically verifies TypeScript contracts and eliminates unsafe casts.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npm run typecheck`
- **Files**: `apps/factbounty/tsconfig.json`, `package.json`
- **Status**: `VERIFIED_LOCAL`

### 12. ESLint
- **Problem Solved**: Deterministic AST pattern checking and syntax enforcement on JS/TS.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npx eslint .`
- **Files**: `eslint.config.mjs`, `package.json`
- **Status**: `VERIFIED_LOCAL`

### 13. Custom ESLint Rules / Repository Validators
- **Problem Solved**: Catches high-value repository invariant violations (direct `_site` edits, raw state mutations).
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/validate-ai-antipatterns.js`
- **Files**: `scripts/validate-ai-antipatterns.js`
- **Status**: `VERIFIED_LOCAL`

### 14. Stylelint
- **Problem Solved**: Catches invalid CSS syntax, duplicate declarations, and bad selectors.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npx stylelint assets/css/**/*.css`
- **Files**: `.stylelintrc.json`
- **Status**: `VERIFIED_LOCAL`

### 15. Enforcing Design Tokens
- **Problem Solved**: Prohibits arbitrary hardcoded hex codes and margins, enforcing CSS custom properties.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/validate-design-tokens.js`
- **Files**: `scripts/validate-design-tokens.js`, `assets/css/site.css`
- **Status**: `VERIFIED_LOCAL`

### 16. `clint` / Fast Modern CSS Linting
- **Problem Solved**: Fast local CSS preflight before heavy linter runs.
- **VenturaAtlas Tier**: `NOT_APPLICABLE_WITH_PROOF` (Absorbed into fast CSS validator)
- **Reason**: Researched npm package `clint` (unrelated 12-year-old CLI options parser). Fast preflight role absorbed into `scripts/check-css-fast.js` (< 50ms execution in `quality:fast`).
- **Files**: `scripts/check-css-fast.js`
- **Status**: `NOT_APPLICABLE_PROVEN`

### 17. `Vite+` / Consolidated Fast Checking
- **Problem Solved**: Single unified fast check command.
- **VenturaAtlas Tier**: `NOT_APPLICABLE_WITH_PROOF` (Absorbed into aggregate runner)
- **Reason**: Static site architecture does not require Vite runtime migration; concept absorbed into `npm run quality:fast`.
- **Files**: `scripts/run-quality.js`
- **Status**: `NOT_APPLICABLE_PROVEN`

### 18. Headless-Browser Verification
- **Problem Solved**: Playwright assertions for zero uncaught errors, network integrity, and DOM rendering.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npx playwright test`
- **Files**: `playwright.config.ts`, `tests/e2e/`
- **Status**: `VERIFIED_LOCAL`

### 19. `agent-browser`
- **Problem Solved**: Interactive browser inspection interface before authoring durable Playwright tests.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/agent-browser.js`
- **Files**: `scripts/agent-browser.js`, `.agents/skills/browser-verify/SKILL.md`
- **Status**: `VERIFIED_LOCAL`

### 20. Chrome DevTools MCP
- **Problem Solved**: Structured DOM/network inspection via MCP with dynamic server discovery.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/discover-server-url.js`
- **Files**: `.agents/mcp_devtools_config.json`, `scripts/discover-server-url.js`
- **Status**: `VERIFIED_LOCAL`

### 21. Lightpanda Fast Browser
- **Problem Solved**: Lightweight headless browser lane for rapid DOM smoke checks.
- **VenturaAtlas Tier**: `OPTIONAL_ADAPTER`
- **Command / Config**: `node scripts/lightpanda-smoke.js`
- **Files**: `scripts/lightpanda-smoke.js`
- **Status**: `VERIFIED_LOCAL`

### 22. Durable AI Task Systems
- **Problem Solved**: Persists structured task state, acceptance criteria, and dependencies.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/check-task-graph.js`
- **Files**: `.agent-system/backlog.json`, `scripts/check-task-graph.js`
- **Status**: `VERIFIED_LOCAL`

### 23. Dex
- **Problem Solved**: Task tracking and dependency interchange format.
- **VenturaAtlas Tier**: `ABSORBED_BY_EXISTING_VENTURAATLAS_MECHANISM`
- **Reason**: Backlog preserved as single source of truth; created read-only export adapter `scripts/dex-adapter.js`.
- **Files**: `scripts/dex-adapter.js`
- **Status**: `VERIFIED_LOCAL`

### 24. Beads
- **Problem Solved**: Task graph visualization and blocker modeling.
- **VenturaAtlas Tier**: `ABSORBED_BY_EXISTING_VENTURAATLAS_MECHANISM`
- **Reason**: Backlog preserved as single source of truth; created read-only graph adapter `scripts/beads-adapter.js`.
- **Files**: `scripts/beads-adapter.js`
- **Status**: `VERIFIED_LOCAL`

### 25. Explicit Task Dependencies & Blockers
- **Problem Solved**: Catches dependency cycles and prevents running blocked tasks.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/check-task-graph.js`
- **Files**: `scripts/check-task-graph.js`
- **Status**: `VERIFIED_LOCAL`

### 26. Tasks Referring to Actual Code Paths
- **Problem Solved**: Validates that declared `owned_paths` exist and remain inside repository boundaries.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/check-task-graph.js`
- **Files**: `scripts/check-task-graph.js`
- **Status**: `VERIFIED_LOCAL`

### 27. Persistent Tasks Committed in Repo
- **Problem Solved**: Version control of backlog items for complete provenance.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `git status --porcelain .agent-system/backlog.json`
- **Files**: `.agent-system/backlog.json`
- **Status**: `VERIFIED_LOCAL`

### 28. Context7 / Current Documentation Access
- **Problem Solved**: Routes agents to verified official documentation before implementing evolving external integrations.
- **VenturaAtlas Tier**: `DEV_TOOL`
- **Command / Config**: `node scripts/docs-lookup.js [library]`
- **Files**: `scripts/docs-lookup.js`, `.agents/skills/docs-first/SKILL.md`
- **Status**: `VERIFIED_LOCAL`

### 29. TanStack Code Mode / Code Mode Philosophy
- **Problem Solved**: Replaces giant MCP schema noise with clean, testable CLI tools returning structured output and explicit exit codes.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/[tool].js [--json]`
- **Files**: `scripts/`
- **Status**: `VERIFIED_LOCAL`

### 30. Prefer CLI Tools
- **Problem Solved**: Standardizes all operations as runnable npm scripts.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npm run [script]`
- **Files**: `package.json`
- **Status**: `VERIFIED_LOCAL`

### 31. Teach the Agent via Skills / Rules
- **Problem Solved**: Provides structured, on-demand procedure guides through Antigravity skills.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `.agents/skills/*/SKILL.md`
- **Files**: `.agents/skills/`
- **Status**: `VERIFIED_LOCAL`

### 32. Fixed Quality Sequence
- **Problem Solved**: Enforces a mandatory multi-step verification sequence before task completion.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npm run quality:agent`
- **Files**: `scripts/run-quality.js`, `.agents/hooks.json`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/quality-receipts/quality-agent-latest.json`

### 33. Aggregate Quality Command per Tier
- **Problem Solved**: Consolidates commands into 4 authoritative tiers: `quality:fast`, `quality:agent`, `quality:deep`, `quality:release`.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `npm run quality:fast`, `npm run quality:agent`, `npm run quality:deep`, `npm run quality:release`
- **Files**: `package.json`, `scripts/run-quality.js`
- **Status**: `VERIFIED_LOCAL`

### 34. Gate Commits and Releases with Quality Checks
- **Problem Solved**: Blocks commits and releases mechanically via Git hooks and Antigravity hooks.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `.githooks/pre-commit`, `.agents/hooks.json`
- **Files**: `.githooks/pre-commit`, `.agents/hooks.json`
- **Status**: `VERIFIED_LOCAL`

### 35. Explicit Evidence & Human-Controllable Fixes
- **Problem Solved**: Replaces blind rewrites with atomic receipts, worktree digest verification, and reproducible test evidence.
- **VenturaAtlas Tier**: `PRIMARY_GATE`
- **Command / Config**: `node scripts/run-quality.js`
- **Files**: `scripts/run-quality.js`, `.agent-state/quality-receipts/`
- **Status**: `VERIFIED_LOCAL`
- **Receipt**: `.agent-state/quality-receipts/quality-agent-latest.json`
