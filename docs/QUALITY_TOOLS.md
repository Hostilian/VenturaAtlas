# Deterministic Quality Tools Catalog — Syntax #998 Architecture

This document catalogs every deterministic tool, quality pattern, and practice from **Syntax Podcast #998 ("How to Fix Vibe Coding")**, detailing its adaptation, integration status, execution paths, and adoption triggers in VenturaAtlas.

---

## 1. Tool Coverage & Status Matrix

| # | Section | Tool / Practice | Status in VenturaAtlas | Native Execution Command | Adoption Trigger / Rationale |
|---|---|---|---|---|---|
| **1** | Code Quality | **jscpd** | **Implemented Natively** | `npm run check:duplicates` | Configured with `jscpd.json`, `<10%` threshold gate, JSON receipt output. |
| **1** | Code Quality | **knip** | **Implemented Natively** | `npm run check:unused` | Scans JS/TS surfaces in advisory mode; avoids unverified auto-deletion. |
| **1** | Code Quality | **fallow** | **Native Equivalent** | `npm run check:fallow` | Architecture scanner checking module boundary complexity without paid accounts. |
| **1** | Code Quality | **wallace** | **Native Equivalent** | `npm run check:css-metrics` | Project Wallace AST analyzer measuring rules, selectors, specificity, and colors. |
| **2** | Finding Components | **Storybook AI** | **Native Equivalent** | `npm run check:inventory` | Zero-CDN component registry (`data/component-inventory.json`) + `docs/components.html` harness. Adopt Storybook if UI framework added. |
| **3** | Finding Bugs | **Sentry CLI** | **Implemented Natively** | `npm run check:bugs` | Fail-closed telemetry check; active when `SENTRY_DSN` is set, skips cleanly otherwise. |
| **3** | Finding Bugs | **Spotlight** | **Implemented Natively** | `node scripts/spotlight-adapter.js` | Sidecar telemetry adapter connecting to port 8969 when active. |
| **4** | Formatting & Linting | **ESLint** | **Implemented Natively** | `npm run check:eslint` | ESLint 9 Flat Config + 7 custom deterministic invariant rules. |
| **4** | Formatting & Linting | **StyleLint** | **Implemented Natively** | `npm run check:stylelint` | Scans `assets/css/` stylesheets against modern CSS conventions. |
| **4** | Formatting & Linting | **clint** | **Native Equivalent** | `npm run lint` | Custom formatter `scripts/check-format.js` + syntax checkers. |
| **4** | Formatting & Linting | **Vite+ / Types** | **Native Equivalent** | `npm run typecheck` | Strict `tsc -p apps/factbounty/tsconfig.json` for TypeScript. |
| **5** | Headless Browsers | **agent-browser** | **Implemented Natively** | `node scripts/agent-browser.js` | Headless Playwright engine capturing visual receipts & verifying DOM landmarks. |
| **5** | Headless Browsers | **chrome-devtools** | **Implemented Natively** | `.antigravity/mcp.json` | MCP configuration for direct Chrome DevTools debugging. |
| **5** | Headless Browsers | **Lightpanda** | **Native Equivalent** | `npm run check:smoke` | Ultra-fast HTML structural preflight; Playwright channel available. |
| **6** | Tasks & TODOs | **dex** | **Implemented Natively** | `npm run task next` | Committed JSON task ledger (`.agent-system/tasks.json`) + `scripts/task.js` CLI. |
| **6** | Tasks & TODOs | **beads** | **Native Equivalent** | `npm run view:beads` | Non-authoritative dependency graph projection (`beads-adapter.js`). |
| **7** | Docs | **Context7** | **Implemented Natively** | `.antigravity/mcp.json` | Docs MCP server looking up APIs deterministically before guessing signatures. |
| **8** | TanStack Code Mode | **Code Mode** | **Documented Optional** | N/A | Adopt if `apps/factbounty` moves to a TanStack start/router architecture. |
| **9** | AI Enforcement | **AGENTS.md & Skills**| **Implemented Natively** | `npm run quality:gate` | Deterministic completion sequence, `.agents/skills/quality-check.md`, pre-commit hooks. |

---

## 2. The 14-Step Deterministic Completion Sequence (`npm run quality:gate`)

Whenever completing a task, feature, or refactor, execute the full sequence:

```bash
npm run quality:gate
```

This sequence executes fail-fast:
1. `check-js`: Vanilla JavaScript AST syntax check.
2. `check-python`: Python AST syntax check.
3. `typecheck`: Factbounty TypeScript compiler verification.
4. `check:eslint`: ESLint 9 Flat Config with 7 custom rules.
5. `check:stylelint`: CSS stylesheet validation.
6. `format:check`: Custom repository formatter check.
7. `check:duplicates`: JSCPD duplicate code clone gate (<10%).
8. `check:unused`: Knip dead-code & unused export audit (advisory).
9. `validate:source`: Data integrity, schemas, and links validation.
10. `check:inventory`: Component inventory freshness.
11. `check:browser`: Playwright `@smoke` headless browser tests.
12. `test:unit`: Node native test runner test suite.
13. `check:bugs`: Sentry/Spotlight telemetry verification (secret-free fallback).
14. `check-task-graph`: Task capability graph cycle and dependency check.

---

## 3. Opt-in Telemetry Configuration

Set the following variables in `.env` to enable remote telemetry (never hardcoded in source):

```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=ventura-atlas
SENTRY_PROJECT=os
```

If these variables are omitted, all quality gates pass offline and locally with zero external network dependencies.
