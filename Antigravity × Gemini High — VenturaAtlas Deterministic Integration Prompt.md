# Antigravity × Gemini (High Reasoning) — Master Integration Prompt for VenturaAtlas

> Paste everything below this line into Google Antigravity as the first message of a **fresh session**, with the repo `Hostilian/VenturaAtlas` open at its root, model set to **Gemini 3.x** and **reasoning effort = High**. Do not preface it; run it as-is.

---

You are a senior staff engineer operating Google Antigravity with Gemini at **high reasoning**. Your job is to integrate, into the `Hostilian/VenturaAtlas` repository, **every idea from Syntax Podcast #998 "How to Fix Vibe Coding"** (Wes Bos & Scott Tolinski) — adapted, not copy-pasted, to this repo's real stack and to its **existing** quality infrastructure. Think in phases, verify each step against the actual files, and never paper over a failure.

## 0. The core thesis you must internalize

The podcast's entire argument is: **stop letting AI guess; make it run deterministic tools.** A deterministic tool is a pure function over the codebase — same input, same output, a binary pass/fail — as opposed to an LLM's "wishy-washy vibes" that "might pass and might not." Wes and Scott's closing instruction is literal: *"upon completion of any feature, always run the sequence."* Your entire job is to make that sequence real, fast, blocking, and un-ignorable in this repo.

The tools they name, by section, are:

| # | Section | Tools / ideas |
|---|---------|--------------|
| 1 | Code quality (04:49) | jscpd.dev, knip.dev, fallow.tools, wallace |
| 2 | Finding components (14:11) | Storybook AI |
| 3 | Finding bugs (17:42) | Sentry CLI, Spotlight |
| 4 | Formatting & linting (19:55) | Vite+ (type checking), ESLint, StyleLint, clint |
| 5 | Headless browsers (25:41) | agent-browser, chrome-devtools-mcp, Lightpanda |
| 6 | Tasks & todos (32:11) | dex (dex.rip), beads |
| 7 | Docs (33:32) | Context7 (MCP) |
| 8 | TanStack Code Mode (34:22) | TanStack Code Mode |
| 9 | Getting AI to use these tools (36:01) | AGENTS.md rules, a "quality-check skill", enforce the completion sequence, pre-commit blocking gate, custom ESLint plugins, "be in control of the output", Svelte Auto-Fixer pattern (MCP that reads a file and reports non-best-practice) |

Integrate **all nine**. For each, decide: implement natively, wire into existing infra, or document as optional — but every one must be addressed and accounted for in the final report.

## 1. Verified repo orientation (treat as ground truth; still re-confirm by reading files)

VenturaAtlas is a **static, dependency-light GitHub Pages site** — "a transparent opportunity database, startup research library, product-building playbook, and AI venture studio operating system." Deployment is GitHub Actions → Pages. No paid hosting/server is required, and you must keep it that way.

Real stack and tooling (from `package.json` v2.7.1, `engines.node >=20`):

- **HTML** pages (`index.html`, `offline.html`, `404.html`, plus many `docs/*.html` lab pages).
- **Vanilla JavaScript** under `assets/` and `scripts/`. **No React/Vue/Svelte frontend framework.**
- **Python worker** under `services/ventureatlas-worker/` plus many `scripts/*.py` validators.
- **Node/npm tooling**; `package.json` name `venture-atlas-os`.
- **TypeScript** is used **only** for `apps/factbounty` (`tsx`, `typescript` 5.7.3); `npm run typecheck` = `tsc -p apps/factbounty/tsconfig.json`.
- **Playwright** `@playwright/test` 1.62.1 is already a devDependency; `playwright.config.ts`; `npm run test:e2e` = `npx playwright test`; smoke tests under `tests/`.
- Data: JSON / CSV / JSON Schema (`data/ideas.schema.json`); canonical data is `data/ideas.json`.

Existing scripts you **must build on, not duplicate**:

- `npm run format` / `npm run format:check` → `node scripts/check-format.js` (a **custom** formatter, **not Prettier** — do not introduce Prettier unless you explicitly justify replacing it).
- `npm run check-js` → `scripts/check-js-syntax.js`; `npm run check-python` → `scripts/check_python_syntax.py`; `npm run check-links` → `scripts/check-links.js`.
- `npm run lint` = `check-js && check-python && format:check`.
- `npm run validate:source` = a long chain of data/schema/link/proofops validators (`validate-data`, `validate-schema`, `validate:links`, `validate:terrain`, `validate:mercury`, `validate:chessboard`, `validate:census`, capital clocks, etc.).
- `npm run quality` = `quality:source && quality:artifact` → `node scripts/run-quality.js source|artifact`. **There is already a quality orchestrator. Extend it.**
- `npm run test` / `test:unit` → `node --test --test-concurrency=1 tests/*.test.js`; plus `test:python`, `test:race`, `test:providers`, `test:runtime`, `test:pwa`, `test:integration`, `test:e2e`.
- `npm run ci` and `npm run ci:full`.
- `npm run agents:status|watch|health|graph` and `npm run check-task-graph` — a task-graph already exists.

Existing agent infrastructure (this repo is **already an Antigravity workspace**):

- `AGENTS.md` at root with **durable invariants** — read it first and obey it. Highlights:
  - Never discard unknown edits; never reset the worktree; never rewrite unrelated files.
  - Never fabricate evidence/demand/validation/scores/dates/source-classes/deployment or collaboration state. "Missing information remains missing."
  - Canonical data is `data/ideas.json`; never mass-edit canonical JSON to bypass promotion/validation.
  - `_site/` (and generated output) is generated — **fix generators or source data, never patch generated output as source of truth.**
  - Keep secrets out of source, prompts, logs, command arguments, git remotes, and public artifacts.
  - "Configuration, hooks, rules, validators, cloud resources, tests, and UI controls are capabilities **only after their execution path is demonstrated.**"
  - "Run proportionate tests after changes."
- `.agent-system/` is the single source of truth for live priorities/backlog/runtime state (`backlog.json`, `state.json`, `MASTER_GOAL.md`, `provider-registry.json`).
- `.agents/` is the **Antigravity** role/skill/hook/file-ownership layer: `.agents/AGENTS.md`, `.agents/agents/*.md` (specs with Antigravity 2.0 YAML frontmatter), `.agents/hooks.json`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`.
- `.codex/` holds Codex CLI config.

**Implication:** this repo already has the Antigravity skill/hook surfaces the podcast wants you to use ("put it into skills", "put it in agents.md"). Your integration plugs into `.agents/skills/` and `.agents/hooks.json`, extends `scripts/run-quality.js`, and adds a single new `npm run quality` super-script — rather than introducing a parallel system.

## 2. Hard constraints (non-negotiable)

1. **Dependency-light.** All new tooling is `devDependencies` only. No runtime framework migration. No new runtime dependencies shipped to the static site. `npm ci` must still work and the GitHub Pages deploy must remain free/static.
2. **No paid/cloud services required for local checks.** Sentry, Spotlight, Lightpanda cloud, etc. must be **opt-in**: gated behind env vars / a `--with-sentry` flag, no hardcoded DSN, no secrets committed, no required production account. The default `npm run quality` must pass offline with zero external accounts.
3. **False-positive control.** `knip` and `jscpd` will misfire on generated files, data archives (`archive/`, `tmp/`), prompt packs (`prompts/`), dossiers (`ideas/`), docs, `financial-models/`, `launch-plans/`, etc. You **must** configure entry points and ignore paths carefully. **Never run `knip --fix`** or delete any "unused" file without manual verification — `knip` in an under-configured state can delete actively-used code. Treat every knip/jscpd hit as a *review item*, not an auto-fix.
4. **Don't paper over failures.** Never silence a rule, add broad `// eslint-disable` / `// knip-ignore`, or delete a file merely to make checks green. If you must ignore something, scope the ignore to the exact line, state the reason in a comment, and note it in the final report.
5. **Obey AGENTS.md invariants.** Fix generators/source data, not generated output. Don't mass-edit canonical JSON. Keep secrets out of everything. Capabilities exist only after their execution path is demonstrated — i.e., a new hook/rule counts only once you have actually run it and shown output.
6. **Run proportionate tests after changes** (per AGENTS.md). After wiring tools, run the relevant subset of `npm run test`, `npm run validate:source`, `npm run test:e2e`.
7. **Reuse, don't replace.** Extend `scripts/run-quality.js`, `scripts/check-format.js`, `scripts/check-js-syntax.js`, and the `.agents/` skill surfaces. Do not introduce a second quality orchestrator.
8. **Adapt tools to the stack; don't force-fit.** `Vite+`, `Storybook AI`, `TanStack Code Mode`, `clint`, `wallace`, and the Svelte Auto-Fixer are designed for framework/Node-app contexts. For each, either (a) implement a repo-native equivalent, (b) wire it only where it applies (e.g. `apps/factbounty`), or (c) document it as optional with a clear "when to adopt" trigger. Never install a heavy framework just to host a linter.

## 3. Per-tool integration plan (address every one; adapt to this stack)

### 3.1 Code quality

**jscpd** (duplicate-code detection across ~150 languages; ships an MCP server / agent skill / AI reporter). Fits well — catches the exact anti-pattern Wes names: AI inlining a utility that should be a shared helper.
- Add `jscpd` as devDependency. Create `jscpd.json` at repo root.
- Configure: `threshold: 5`, `reporters: ["console","json","html"]`, output to `tmp/jscpd/`. **Ignore** `archive/`, `tmp/`, `prompts/`, `ideas/`, `financial-models/`, `launch-plans/`, `validation-plans/`, `technical-blueprints/`, `docs/`, `categories/`, `rankings/`, `data/` (generated/curated), `_site/`, `node_modules/`, `.snapshots/`. Limit `min-lines: 6`, `min-tokens: 50` to reduce noise on data-heavy Markdown.
- Expose `npm run check:duplicates` = `jscpd --config jscpd.json`. Fail only above threshold. Wire into `run-quality.js`.
- This is the "number one tool people aren't using that can help their slob" — surface its JSON output so the agent (or you) can pipe it back in: "fix these duplications by extracting a shared helper in `assets/js/utils/`."

**knip** (unused dependencies, exports, files in JS/TS projects). Fits the Node/`scripts/` + `apps/factbounty` surface.
- Add `knip` as devDependency. Create `knip.json` (or `knip.ts`) with explicit `entry` and `project` so it only scans the real JS/TS surface, **not** data/dossiers.
- Suggested `entry`: `index.html` referenced scripts, `scripts/*.js`, `assets/js/**/*.js`, `apps/factbounty/api/server.ts`. `ignore`: the same generated/data dirs as jscpd.
- Expose `npm run check:unused` = `knip --no-progress`. **Report-only by default.** Never `knip --fix` automatically. Provide `npm run check:unused:fix` as a **manual** alias with a loud warning comment, unused in CI.
- Wire into `run-quality.js` as a *non-failing advisory* in CI (exit 0 with a report) until a human triages, then promote to failing. Document this staging in `AGENTS.md`.

**fallow** (fallow.tools — code-quality analysis). Treat as advisory; integrate if it has a Node CLI that runs offline. If it requires a hosted account, **do not** add it as a hard dependency — instead create a repo-native equivalent: a `scripts/check-quality-fallow-style.js` that runs the existing `check-js-syntax` + `check-format:check` + `jscpd` + a small "complexity/hotspot" pass over `scripts/` and `assets/js/`. Document fallow.tools in `docs/QUALITY_TOOLS.md` as an optional upgrade path.

**wallace** — same treatment as fallow: verify it has a usable offline CLI; if not, document as optional and implement a native equivalent. Do not block on it.

### 3.2 Finding components (Storybook AI)

This repo has no component-framework runtime, so full Storybook is overkill. Instead, build a **repo-native component inventory** (the spirit of "find and use components, don't let AI reinvent them"):
- A `scripts/build-component-inventory.js` that scans `assets/js/` and `docs/*.html` for reusable units (functions, custom elements, shared UI snippets) and emits `data/component-inventory.json`.
- A custom ESLint rule (see §9) `prefer-known-utility` that warns when a new helper duplicates something already in the inventory — the jscpd detection is the enforcement layer; the inventory is the discoverability layer.
- Document **Storybook AI** in `docs/QUALITY_TOOLS.md` as the upgrade to adopt if/when `apps/factbounty` or any future framework surface grows real UI components.

### 3.3 Finding bugs (Sentry CLI, Spotlight)

Both are **opt-in, secret-free by default**.
- Do **not** hardcode a DSN. Read `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` from `.env` (already has `.env.example`).
- Add a `scripts/check-sentry.js` that no-ops with a helpful message ("Sentry not configured; set SENTRY_DSN to enable") unless `SENTRY_DSN` is present. When present, run `sentry-cli` checks (release/source-map upload in dry-run, `sentry-cli info`) and, if Spotlight is configured, the Spotlight capture check.
- Expose `npm run check:bugs` = `node scripts/check-sentry.js`. Wire into `run-quality.js` **only** when `SENTRY_DSN` is set; otherwise skip silently with a one-line notice.
- Add an MCP entry for the Sentry MCP server in the MCP config (§10), opt-in, so the agent can read trace data when the user authenticates — exactly the "compare trace against the plan doc" feedback loop from Sentry's published vibe-coding workflow.

### 3.4 Formatting & linting

**ESLint** (the headline deterministic tool — "analyzing the file, this is either a problem or it's not, yes or no"). Currently the repo uses a custom `check-js-syntax.js`; ESLint is the deterministic-upgrade.
- Add `eslint` (flat config, ESLint 9) as devDependency. Create `eslint.config.js`.
- Scope to `scripts/`, `assets/js/`, `tests/`, `services/ventureatlas-worker/**/*.{js,mjs}` if JS exists there, and `apps/factbounty` (TS-aware). **Ignore** generated/data/dossier dirs.
- Base on `@eslint/js` recommended + `eslint-plugin-import` (catch "AI inlined a utility instead of importing" — the podcast's core complaint) + your custom rules (§9). Keep config dependency-light; avoid heavy plugin trees.
- Expose `npm run check:eslint` = `eslint . --max-warnings=0`. Wire into `run-quality.js` and into `npm run lint`.

**StyleLint** — only if meaningful CSS exists. Scan `assets/**/*.css` and inline `<style>` is out of scope; target `assets/css/`. If the CSS surface is trivial, add StyleLint but scoped and as a non-failing advisory initially; document in `docs/QUALITY_TOOLS.md`. Do not force it to fail on a near-empty CSS surface.

**clint** — verify it's a real, offline, maintained CLI; if not, do not add. Document as optional. The repo-native equivalent is `check-format:check` + `check:eslint` + `check-js` already covering the intent.

**Vite+ / type checking** — the repo has no Vite. The native equivalent is `npm run typecheck` (already `tsc -p apps/factbounty/tsconfig.json`) for the only TS surface, plus `check-js` for vanilla JS. Do **not** introduce Vite. Document Vite+ as the path to adopt if `apps/factbounty` migrates to Vite.

**Preserve the existing formatter.** Do not replace `scripts/check-format.js` with Prettier. Have ESLint's `format`/stylistic rules **defer** to the repo formatter (set `eslint-plugin-*` stylistic rules off, or use `eslint-config-prettier`-style disabling only if you later adopt Prettier — which you should **not** do by default).

### 3.5 Headless browsers

The repo **already has Playwright** — extend it first; treat the others as optional accelerators.
- Extend `tests/` with deterministic smoke checks the podcast wants: page load without console errors, no unhandled promise rejections, no 404s on critical assets, PWA manifest + service-worker contract (build on the existing `test:pwa`), offline shell (`offline.html`) renders, and a "no secrets leaked into served HTML" check.
- Add `npm run check:browser` = `npx playwright test --grep @smoke` (a tagged smoke subset). Wire into `run-quality.js` and `ci:full`.
- **chrome-devtools-mcp** — add to the MCP config (§10) so the agent can drive a real Chrome DevTools session for ad-hoc debugging (performance trace, console errors, network waterfalls) on `python -m http.server 8000`. Opt-in; not a repo dependency.
- **agent-browser** — document as an optional agent-side browser driver in `docs/QUALITY_TOOLS.md`; do not add as a dependency unless it provides an offline Node API the repo needs.
- **Lightpanda** — an alternative headless browser engine; document as optional. If the user later wants faster CI browser runs, Lightpanda can be wired as a Playwright browser channel; not now.

### 3.6 Tasks & todos (dex, beads)

The repo **already has** `.agent-system/backlog.json` (the authoritative backlog) and `check-task-graph.js`. That is the "dex" pattern (committed JSON, blocking tasks, lives in the repo). Build on it:
- Formalize a **committed JSON task ledger** at `.agent-system/tasks.json` (or extend `backlog.json`) with: `id`, `title`, `status`, `blockedBy[]` (the "this is blocked by this" ordering Scott describes), `filePath` (code paths, per Scott's "passing in actual code paths"), `created/updated` commits. Reuse `npm run check-task-graph` to validate the DAG (no cycles, no orphaned blockers, no done-task blocking an open one).
- Provide a thin `scripts/task.js` CLI: `next` (print the next unblocked, not-started task), `add`, `done <id>`, `block <id> --by <id>`. This realizes "give me the next task to do" deterministically rather than "what should we do?"
- Wire an ESLint rule (§9) `require-task-id-on-todo` so `TODO`/`FIXME` comments must reference a task id — directly addressing "AI loves to lift a bunch of TODOs and then not check them off."
- Document **beads** in `docs/QUALITY_TOOLS.md` as the heavier alternative (DB-backed + git hooks) to adopt if the team outgrows the JSON ledger.

### 3.7 Docs (Context7)

- Add the **Context7 MCP server** to the MCP config (§10). This lets you look up library docs (Playwright, ESLint, knip, jscpd, Express, tsx, etc.) deterministically instead of guessing APIs — exactly Scott's point: "just having the docs in Context7 via MCP... still the best."
- Document in `docs/QUALITY_TOOLS.md` and add a line to `AGENTS.md`: "When unsure of a library API, query Context7 before writing code; do not guess signatures."

### 3.8 TanStack Code Mode

- Verify what TanStack Code Mode currently offers and whether it applies to `apps/factbounty` (TS). If it's a dev-server/codegen tool that requires a framework, **document as optional** with an adoption trigger ("adopt if `apps/factbounty` moves to a TanStack router/start setup"). Do not force it into the static-site surface.

### 3.9 Getting AI to use these tools (the load-bearing section)

This is the whole point. Implement exactly the three mechanisms Wes & Scott describe:

1. **AGENTS.md rules** — but treat them as *advisory* (Scott: an `agents.md` "don't do that" is "a sign that says don't that you can just walk past"). Add a `## Deterministic quality contract` section to `AGENTS.md` that states the completion sequence and points to the **enforceable** tools. Keep it lean (the roadmap.sh best practice: keep `AGENTS.md`/`GEMINI.md` lean and current).
2. **A quality-check skill** — create `.agents/skills/quality-check.md` (Antigravity 2.0 YAML frontmatter) that runs the quality commands. This is literally Scott's "my quality check skill... commands that run the quality check commands." Also mirror it as a `.codex/` rule for parity.
3. **The enforceable completion sequence + pre-commit gate** — the deterministic, blocking version of "upon completion of any feature, always run the sequence." See §7 and §8.
4. **Custom ESLint plugins** (deterministic + testable — Wes: "it is so easy to get the AI to write a deterministic plugin... then you can write tests against it"). See §9.
5. **"Be in control of the output"** — by default the sequence *reports*; auto-fixing is a separate, explicit, opt-in step (`npm run quality:fix`) that the human reviews. Never let the agent blindly "do whatever you gotta do to get these things passing."

## 4. Files to create / modify (concrete, with content sketches)

Create:
- `eslint.config.js` — flat config, scoped, with custom rules from §9.
- `eslint.rules/no-inline-duplicate-util.js` — custom rule (see §9).
- `eslint.rules/require-task-id-on-todo.js` — custom rule.
- `eslint.rules/no-hardcoded-secrets.js` — custom rule (reinforces AGENTS.md "keep secrets out of source").
- `eslint.rules/no-unguarded-storage.js` — custom rule for `localStorage`/service-worker/cache.
- `jscpd.json`, `knip.json` (or `knip.ts`), `.stylelintrc.json`.
- `scripts/check-sentry.js`, `scripts/check-duplicates.js` (wraps jscpd), `scripts/check-unused.js` (wraps knip, report-only), `scripts/build-component-inventory.js`, `scripts/task.js`, `scripts/check-eslint.js` (wraps eslint), `scripts/check-stylelint.js`.
- `tests/eslint-rules/*.test.js` — `node --test` tests for each custom ESLint rule (Wes: "write tests against it and see that it actually works").
- `tests/browser/smoke-errors.test.js` (Playwright) — console-error / 404 / secret-leak smoke.
- `.husky/pre-commit` — runs `npm run quality:gate` (blocking). (Husky as devDependency; if you prefer no husky, use a plain `.git/hooks` script + `scripts/install-hooks.js` — but husky is the lower-friction default and is dev-only.)
- **MCP config** — after auditing the current `.agents/` structure, create or update the repo's existing Antigravity/MCP configuration. If no canonical MCP config surface exists yet, **propose** `.antigravity/mcp.json` in your Phase 1 plan before adding it (do not invent a config path that conflicts with existing Antigravity workspace config). All servers opt-in and secret-free by default (read from env, documented in `.env.example`):
- `docs/QUALITY_TOOLS.md` — the catalog of every podcast tool, status (implemented / native-equivalent / optional), and adoption triggers.
- `.agents/skills/quality-check.md` — the Antigravity quality-check skill (YAML frontmatter + the sequence).

Modify:
- `package.json` — add devDependencies (`eslint`, `eslint-plugin-import`, `jscpd`, `knip`, `stylelint`, `husky`, `lint-staged`) and scripts (§6). Bump nothing else.
- `scripts/run-quality.js` — extend `source`/`artifact` to call the new checks in the §7 order; keep existing behavior intact; make new heavy/optional checks skippable via flags/env.
- `AGENTS.md` — add the lean `## Deterministic quality contract` section + the Context7 line.
- `.agents/hooks.json` — register a `pre-edit`/`post-edit` hook reference to the quality skill (optional, opt-in) and a `commit` gate.
- `playwright.config.ts` — add `@smoke` tag/project if not present.

## 5. New `package.json` scripts to add

```
"check:eslint": "node scripts/check-eslint.js",
"check:stylelint": "node scripts/check-stylelint.js",
"check:duplicates": "node scripts/check-duplicates.js",
"check:unused": "node scripts/check-unused.js",
"check:bugs": "node scripts/check-sentry.js",
"check:browser": "npx playwright test --grep @smoke",
"check:inventory": "node scripts/build-component-inventory.js",
"quality:gate": "node scripts/run-quality.js gate",
"quality:fix": "node scripts/run-quality.js fix --interactive",
"task": "node scripts/task.js"
```

Extend `quality` so `npm run quality` = existing `quality:source && quality:artifact` **plus** the new deterministic checks (eslint, stylelint-if-css, jscpd, knip-advisory, browser-smoke) in the §7 order. Keep `ci` and `ci:full` green. Add `lint-staged` config running `check:eslint` + `format:check` on staged JS/TS.

## 6. MCP configuration (`.antigravity/mcp.json`)

Opt-in servers, all secret-free by default (read from env, documented in `.env.example`):

- **context7** — docs lookup (always on; no secrets).
- **chrome-devtools-mcp** — drives Chrome DevTools for ad-hoc debugging of `python -m http.server 8000` (always on; local only).
- **sentry** (opt-in) — enabled only when `SENTRY_AUTH_TOKEN` is set; gives the agent the trace-vs-plan feedback loop.
- **jscpd** (if it ships an MCP server) — duplicate-code reporter for the agent; otherwise the JSON report from `check:duplicates` is piped manually.
- Optionally **lightpanda** as a Playwright browser channel (documented, not default).

Add an `.env.example` block documenting `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` and state plainly: none are required; default quality run is offline and account-free.

## 7. The deterministic completion sequence (the heart of the prompt)

`npm run quality:gate` runs, in order, **fail-fast** (a non-zero step aborts the sequence and the commit is blocked):

1. `npm run check-js` (existing — vanilla JS syntax)
2. `npm run check-python` (existing — Python syntax)
3. `npm run typecheck` (existing — `apps/factbounty` TS)
4. `npm run check:eslint` (new — deterministic lint, includes custom rules)
5. `npm run check:stylelint` (new — only if CSS surface present; otherwise skipped with notice)
6. `npm run format:check` (existing — custom formatter, **not** Prettier)
7. `npm run check:duplicates` (new — jscpd, threshold-gated)
8. `npm run check:unused` (new — knip, **advisory** by default; fails only after human promotion)
9. `npm run validate:source` (existing — data/schema/links/proofops/capital-clocks)
10. `npm run check:inventory` (new — component inventory freshness)
11. `npm run check:browser` (new — Playwright `@smoke`)
12. `npm run test:unit` (existing — `node --test`)
13. `npm run check:bugs` (new — Sentry/Spotlight, **skipped unless `SENTRY_DSN` set**)
14. `npm run check-task-graph` (existing — task DAG integrity)

This is the literal "upon completion of any feature, always run the sequence" — enforced as a pre-commit gate and as a required CI status check, so "it will never actually make its way into your code base until things pass" (Wes).

## 8. Pre-commit & CI gates

**Pre-commit** (`.husky/pre-commit` + `lint-staged`): run the **fast, staged** checks (`check:eslint` + `format:check` + `check-js`) on staged files, plus `check:unused`/`check:duplicates` as fast advisories. The full `npm run quality:gate` (the heavy `validate:source`/browser/unit sequence) is **recommended but configurable** — wire it in but allow it to be toggled (e.g. `VA_FULL_GATE=1` env or a `--full` flag) so it does not slow every commit; default pre-commit runs the fast subset and is still blocking. Discourage `--no-verify` bypass. This realizes Wes's blocking mechanism without making commits slow.
- **CI** (extend `.github/workflows`): the full `npm run quality:gate` (steps 1–12) runs as a **required, blocking** status check on every PR; run `npm run ci` for the full build+validate; run `npm run test:e2e` and `npm run ci:full` on `main`. Keep the Pages deploy workflow intact.
- Make the gate **fast**: cached Playwright browsers, `--max-warnings=0` eslint, and skip step 13 unless secrets present.

## 9. Custom ESLint rules (deterministic, tested — Wes's favorite point)

Each is a pure function `file → problems[]`, with a `node --test` suite in `tests/eslint-rules/`. Targets (repo-specific):

- `no-inline-duplicate-util` — flags a local helper that duplicates a function already in `data/component-inventory.json` or in `assets/js/utils/`. This is the *enforceable* version of "AI, don't reinvent the shared utility" — jscpd finds it; this rule blocks it at lint time.
- `require-task-id-on-todo` — every `TODO`/`FIXME`/`XXX` must end with a task id from `.agent-system/backlog.json` (e.g. `// TODO(VTA-142): ...`). Directly fixes "AI lifts TODOs and doesn't do them."
- `no-hardcoded-secrets` — fails on `DSN`, `api_key`, `secret`, `token`, `password` literals and `Bearer ...`. Reinforces AGENTS.md "keep secrets out of source."
- `no-unguarded-storage` — `localStorage`/`sessionStorage`/cache writes must be behind feature-detect + try/catch; no silent service-worker cache poisoning.
- `no-new-network-call-without-doc` — any `fetch`/`XMLHttpRequest`/`WebSocket` in `assets/js/` or `scripts/` must reference a doc path documenting the endpoint and data classification (lands on AGENTS.md "no new external network calls without documentation").
- `prefer-canonical-data-write` — flag direct mutation of `data/ideas.json` outside `scripts/` authorized publishers (enforces AGENTS.md "do not mass-edit canonical JSON to bypass promotion or validation").
- (Inspired by the Svelte-team example) one **repo-specific hard rule** of your choice that fails the build on a known anti-pattern in this repo — e.g. `no-edits-to-generated-output` (disallow writes to `_site/`/`tmp/`/generated dirs from source outside their generator). Pick the one that best fits after auditing.

These rules are the upgrade from "a sign that says don't" (agents.md) to "an enforceable thing... it's either a pass or a fail" (ESLint plugin). Write tests for each; ship them.

## 10. Execution phases (how you must proceed)

Work in this order. After each phase, run the relevant tests and report status before advancing.

- **Phase 0 — Audit.** Read `AGENTS.md`, `package.json`, `scripts/run-quality.js`, `scripts/check-format.js`, `scripts/check-js-syntax.js`, `playwright.config.ts`, `.agents/AGENTS.md`, `.agents/hooks.json`, `.agent-system/backlog.json`, `.env.example`. Confirm the verified facts in §1; correct anything that's changed. Do not edit yet.
- **Phase 1 — Propose.** Produce a short change plan listing every file you'll create/modify and the script table from §5. Surface anything that does *not* fit the stack and your adaptation decision (native-equivalent vs optional). Get the structure right before touching code.
- **Phase 2 — Add minimal deterministic tooling.** Install devDependencies; create `eslint.config.js`, `jscpd.json`, `knip.json`, `.stylelintrc.json`, the wrapper scripts. Keep configs scoped with ignore paths (§2.3).
- **Phase 3 — Wire the single `quality` super-script.** Extend `scripts/run-quality.js` to run the §7 sequence; add `quality:gate` and `quality:fix`. Keep existing `quality:source`/`quality:artifact` behavior.
- **Phase 4 — Gates.** Add `.husky/pre-commit` + `lint-staged`; extend `.github/workflows` with the required `quality:gate` status check. Keep Pages deploy intact.
- **Phase 5 — Agent surfaces & docs.** Add the `AGENTS.md` "Deterministic quality contract" section; create `.agents/skills/quality-check.md`; mirror into `.codex/`; write `docs/QUALITY_TOOLS.md` cataloging all nine podcast tools with status and adoption triggers; add the Context7 line to `AGENTS.md`.
- **Phase 6 — Custom ESLint rules + tests.** Implement §9 rules with `node --test` suites; add them to `eslint.config.js`.
- **Phase 7 — Browser checks.** Extend Playwright with `@smoke` tests (console errors, 404s, PWA/offline, secret-leak); add `check:browser`.
- **Phase 8 — Task ledger.** Formalize `.agent-system/tasks.json` + `scripts/task.js` + the `require-task-id-on-todo` rule; validate with `check-task-graph`.
- **Phase 9 — MCP.** Create `.antigravity/mcp.json` (context7, chrome-devtools-mcp, sentry opt-in, jscpd/lightpanda optional); update `.env.example`.
- **Phase 10 — Run the full sequence.** Execute `npm run quality:gate` end to end. Fix only real problems. Document any advisory (knip/jscpd) hits for human triage. Run `npm run ci` and `npm run test:e2e`.
- **Phase 11 — Final report** (§11).

## 11. Final report format

When done, output:
1. **Changed files** — grouped by created / modified, with one-line purpose each.
2. **The completion sequence** — the final `npm run quality:gate` step list, each marked PASS/FAIL/SKIPPED(advisory)/SKIPPED(no-secret) with the actual command output excerpt.
3. **Podcast tool coverage matrix** — all nine sections × {implemented natively | native-equivalent | optional} × adoption trigger, so it's auditable that *every* idea was addressed.
4. **Advisory items** — every knip/jscpd hit that is *not* auto-fixed, with file:line and a recommended action.
5. **Optional tools** — the ones documented-but-not-installed, with the exact "when to adopt" trigger.
6. **Verification** — `npm run ci` result, `npm run test:e2e` result, Pages deploy still green.
7. **Risks / follow-ups** — anything that needs a human decision (e.g. promoting knip from advisory to failing; adopting StyleLint as failing once CSS grows; adopting beads if the JSON ledger outgrows).

## 12. What you must NOT do

- Do not install Prettier or replace `scripts/check-format.js`.
- Do not introduce Vite, a frontend framework, or any runtime dependency for the static site.
- Do not hardcode a Sentry DSN or any secret; do not require a paid account for the default quality run.
- Do not run `knip --fix` or auto-delete "unused" files.
- Do not silence rules or add broad ignores to make checks green.
- Do not mass-edit `data/ideas.json` or patch generated output in `_site/`/`tmp/`.
- Do not create a second quality orchestrator parallel to `scripts/run-quality.js`.
- Do not skip phases; do not claim a capability works until you have actually executed it and shown output (AGENTS.md invariant).
- Do not let the agent auto-fix blindly; "be in control of the output" — fixes are opt-in (`quality:fix`) and reviewed.

---

**Begin with Phase 0 (audit) now. Read the files listed in Phase 0, confirm the §1 facts, then produce the Phase 1 change plan before editing anything. Integrate all nine sections of Syntax #998, adapted to this stack, with the deterministic completion sequence enforced as a blocking pre-commit + CI gate. Make VenturaAtlas the repo where AI stops guessing and starts producing maintainable, predictable code.**
