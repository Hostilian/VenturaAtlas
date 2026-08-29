# ADR-0002: Deterministic Linting & Formatting Strategy

**Status:** Accepted  
**Date:** 2026-08-29  
**Decision Makers:** VenturaAtlas Core Engineering / Antigravity Agent  
**Context:** Syntax.fm #998 ("How to Fix Vibe Coding") Phase 2  

---

## 1. Context & Problem Statement

The repository previously relied on hand-rolled regular expression and `vm` compilation scripts (`scripts/check-js-syntax.js` and `scripts/check-format.js`) to check JavaScript files. These scripts:
1. Did not perform full AST semantic analysis.
2. Lacked scope analysis, type awareness, and dead-code detection.
3. Provided no automated fixing capability (`--fix`).
4. Could not enforce custom multi-agent architecture invariants (e.g. forbidding direct writes to `_site/` or unlinked task comments).

We evaluated two architectural paths from Syntax #998:
- **Path A:** `Vite+` (Oxlint + Oxfmt + Vitest) — ultra-fast Rust-based tooling in a unified binary (`vp`).
- **Path B:** `ESLint 9 Flat Config` + `StyleLint` / `clint` + custom repository-native AST plugins.

---

## 2. Decision & Evaluation

We have implemented **ESLint 9 Flat Config (`eslint.config.mjs`)** paired with **StyleLint (`.stylelintrc.json`)** and **custom AST security/architecture rules (`eslint.rules/`)** as the primary deterministic standard, while documenting the Vite+ upgrade path.

### Evaluation Criteria Matrix

| Dimension | Path A: Vite+ (Oxlint/Oxfmt) | Path B: ESLint 9 + StyleLint (Selected) |
| :--- | :--- | :--- |
| **Custom Agent Rules** | Limited custom rule plugin API for bespoke repository invariants. | Rich AST visitor API allowing custom repository rules (`eslint.rules/`). |
| **CSS Linting** | Separate tool needed (or `clint`). | Comprehensive CSS parsing across 4 stylesheets via `stylelint-config-standard`. |
| **TypeScript / FactBounty** | Integrated type-checking via Vite+. | Native `typescript-eslint` plugin supporting `apps/factbounty/`. |
| **Execution Speed** | Sub-second (<100ms). | ~1.5s (fast enough for pre-commit and deep quality gates). |
| **Deterministic Parity** | Replaces syntax checks. | 100% parity with legacy `check-js-syntax.js` + catches deep scope/undef bugs. |

### Custom Architecture Rules Deployed

1. `custom/no-inline-duplicate-util`: Prevents agents from reinventing known utility functions in `assets/js/`.
2. `custom/require-task-id-on-todo`: Enforces `// TODO(TASK-ID): explanation` linked to authoritative backlog tasks.
3. `custom/no-hardcoded-secrets`: Forbids literal API keys, Stripe secret tokens, and private credentials.
4. `custom/no-unguarded-storage`: Requires `try/catch` wrapping around `localStorage` and `sessionStorage`.
5. `custom/prefer-canonical-data-write`: Forbids unsanctioned direct file writes to `data/ideas.json`.
6. `custom/no-edits-to-generated-output`: Prevents source files from writing directly into `_site/`.

---

## 3. Python Linting Strategy

For Python (`services/ventureatlas-worker/` and `scripts/*.py`), `scripts/check_python_syntax.py` is retained as a zero-dependency preflight AST compile check. `ruff` is designated as the recommended optional linter for environments with Python toolchains installed (`ruff check scripts/ services/`).

---

## 4. Consequences & Migration

- `npm run lint` executes `npm run check:eslint && npm run check:stylelint && npm run check-python`.
- Legacy `check-js-syntax.js` and `check-format.js` are superseded and marked for retirement.
- Quality gates (`npm run quality:gate` and `.github/workflows/deploy-pages.yml`) enforce clean passes.
