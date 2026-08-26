# Antigravity Multi-Agent Orchestration & VenturaAtlas Development Discipline

> **Authority boundary:** `.agent-system/` owns live goals, backlog priorities,
> execution state, and provider-health receipts. This directory owns Antigravity
> role definitions, skills, hooks, workflows, and file-ownership boundaries.
> Do not create a competing task or provider-health registry here. Codex-native
> configuration remains isolated under `.codex/`.

> **Runtime Authority & Task Priorities**: Live execution priorities, current tasks, and operational state are maintained in [`.agent-system/BACKLOG.md`](file:///c:/Users/Hostilian/Downloads/venture-atlas-os-v2/venture-atlas-os-v2/.agent-system/BACKLOG.md) and [`.agent-system/state.json`](file:///c:/Users/Hostilian/Downloads/venture-atlas-os-v2/venture-atlas-os-v2/.agent-system/state.json). The files in this directory define the rich specialist subagent capabilities, skill bindings, and file ownership rules.

## 1. System Architecture & VenturaAtlas Domain Roster

This repository uses a deterministic, parallel subagent orchestration architecture. Specialist agents operate in isolated Git worktrees (`feat/va-<role>`) with strict file ownership boundaries, capability-aware provider routing, and serial integration review before merging to `main`.

### Core VenturaAtlas Specialist Roles

1. **`repository-forensics-agent`**: Read-only inspection of repository architecture, dependency graphs, generated vs. canonical data boundaries, historical intent, and drift detection.
2. **`data-integrity-agent`**: Schema enforcement (`data/ideas.schema.json`), ID allocation, dataset completeness, metadata generation (`data/repository-meta.json`), and referential integrity.
3. **`research-intelligence-agent`**: Market evidence discovery, competitor mapping, trend analysis, regulatory tracking, and research gap identification.
4. **`evidence-provenance-agent`**: Claim-to-source mapping, citation integrity, Tier A/B/C/D source quality scoring, verification timestamps, and disconfirming evidence tracking.
5. **`opportunity-economics-agent`**: Financial model templates, gross margin calculations, CAC/LTV assumptions, startup cost caps, founder labor economics, and sensitivity modeling.
6. **`ranking-and-fit-agent`**: Multi-lens opportunity ranking, Founder Constraint & Fit Engine (skills, resources, distribution channels, risk tolerance), and ranking sensitivity analysis.
7. **`product-ux-architect`**: Information architecture (DISCOVER → EVALUATE → BUILD), progressive disclosure, navigation, visual design system tokens, and mobile UX.
8. **`frontend-platform-agent`**: Dependency-light static application development (`index.html`, `docs/`, `assets/js/`, `assets/css/`), PWA service worker, accessible interaction, and local state persistence.
9. **`search-discovery-agent`**: Client-side search index generation (`data/search-index.json`), Ctrl+K global command palette, faceted query filtering, and related opportunity graph matching.
10. **`autonomous-orchestration-agent`**: Task graph scheduling (`data/agent-task-graph.json`), bounded execution CLI control (`--once`, `--max-cost`, `--max-concurrency`), and worktree lifecycle management.
11. **`provider-router-agent`**: Multi-provider registry (`config/providers.json`), capability-aware model scheduling, key pool rotation, and circuit breaker health management.
12. **`security-privacy-agent`**: Secret isolation verification (`_site/` scanning), prompt injection boundaries for scraped/LLM research, public vs. private data separation, and GDPR/privacy checks.
13. **`test-quality-agent`**: Unit testing (`tests/*.test.js`), PWA contract testing, accessibility audits, race condition verification, and E2E Playwright user journeys.
14. **`red-team-critic-agent`**: Adversarial review of research claims, "Why this might fail" analysis, assumption testing, overengineering detection, and fragile ranking audits.
15. **`integration-release-agent`**: Final serial gatekeeper. Executes `npm run quality` across worktree diffs, verifies build integrity, and merges validated branches into `main`.

---

## 2. File Ownership Rules

To prevent conflicting edits between concurrent agents, each agent owns specific file boundaries:

| Specialist Agent | Owned Directory / File Paths | Description / System |
| :--- | :--- | :--- |
| `repository-forensics-agent` | `docs/REPO_AUDIT_*.md`, read-only across repository | Forensics & drift detection |
| `data-integrity-agent` | `data/ideas.json`, `data/ideas.schema.json`, `data/categories.json`, `data/sources.json`, `scripts/build-repository-meta.js` | Canonical datasets & schemas |
| `research-intelligence-agent` | `launch-plans/`, `research/`, `ideas/`, `data/idea-staging-queue.json` | Research, idea discovery, GTM launch plans |
| `evidence-provenance-agent` | `schemas/provenance.schema.json`, `data/sources.json`, `research/source-log.md` | Source tiers & citation provenance |
| `opportunity-economics-agent` | `financial-models/`, `docs/calculator.html`, `assets/js/features/calculator.js` | Financial models & unit economics |
| `ranking-and-fit-agent` | `rankings/`, `data/rankings.json`, `scripts/va-ranker.py`, `docs/matcher.html`, `assets/js/features/matcher.js` | Multi-lens rankings & founder fit |
| `product-ux-architect` | `technical-blueprints/`, `index.html`, `docs/`, `assets/css/` | Technical blueprints, UX & UI architecture |
| `frontend-platform-agent` | `assets/js/core/`, `assets/js/ui/`, `assets/js/site.js`, `sw.js`, `manifest.webmanifest` | Frontend static engine & PWA caching |
| `search-discovery-agent` | `data/search-index.json`, `scripts/build-search-index.js`, `assets/js/features/command-palette.js` | Client search index & palette |
| `autonomous-orchestration-agent` | `data/agent-task-graph.json`, `scripts/va_runtime/orchestration/`, `scripts/autonomous-idea-generator.py` | Multi-agent task graphs & execution |
| `provider-router-agent` | `config/providers.json`, `scripts/va_orchestrator.py`, `scripts/va_runtime/provider_router.py` | Provider scheduling & circuit breakers |
| `security-privacy-agent` | `THREAT_MODEL.md`, `scripts/check-public-artifact.js`, `scripts/check_privacy.py` | Security scans & privacy boundary enforcement |
| `test-quality-agent` | `tests/`, `TEST_PLAN.md`, `playwright.config.ts` | Test suites & quality gates |
| `red-team-critic-agent` | `validation-plans/`, `scripts/va_runtime/adversarial_pass.py`, read-only across code | Validation plans & adversarial review |
| `integration-release-agent` | Root integration, `package.json`, `_site/`, `walkthrough.md`, `PROJECT_STATUS.md`, `README.md` | Gatekeeper, releases, merge coordination |
| `venture-ops-agent` | `data/relay-*.json`, `schemas/relay-*.schema.json`, `assets/js/core/relay-store.js`, `assets/js/features/relay-engine.js`, `assets/js/features/ops-lab.js`, `docs/ops-lab.html` | **RELAY:** Operations, fulfillment, capacity, quality & suppliers |
| `portfolio-strategy-agent` | `data/portfolios.json`, `assets/js/features/portfolio-engine.js`, `docs/portfolio-lab.html`, `rankings/best-little-capital.md` | **ORBIT:** Portfolio exploration, Pareto frontiers, Brier scoring |
| `organization-governance-agent` | `data/constellation-*.json`, `schemas/constellation-*.schema.json`, `assets/js/core/constellation-store.js`, `assets/js/features/constellation-engine.js`, `assets/js/features/constellation-lab.js`, `docs/org-lab.html` | **CONSTELLATION:** Org architecture, decision rights, hiring cases |
| `capital-strategy-agent` | `data/capital-*.json`, `data/funding-sources.json`, `data/grant-opportunities.json`, `schemas/capital-*.schema.json`, `schemas/cap-table.schema.json`, `schemas/investor-pipeline.schema.json`, `schemas/data-room.schema.json`, `assets/js/core/capital-store.js`, `assets/js/features/capital-engine.js`, `assets/js/features/capital-lab.js`, `docs/capital-lab.html` | **CAPITAL:** Cap tables, dilution, investor pipelines, capital clocks |
| `commercial-discovery-agent` | `schemas/mercury-*.schema.json`, `schemas/commercial-outcome-receipt.schema.json`, `assets/js/core/mercury-store.js`, `assets/js/features/mercury.js`, `docs/mercury.html`, `research/mercury/` | **MERCURY:** Customer discovery, pricing validation, commercial receipts |
| `market-measurement-agent` | `data/census-*.json`, `schemas/census-*.schema.json`, `assets/js/core/census-store.js`, `assets/js/features/census-engine.js`, `docs/census-lab.html`, `scripts/validate-census.js` | **CENSUS:** Denominator modeling, statistical units, population funnels, anti-TAM linter |
| `terrain-modeling-agent` | `data/terrain-*.json`, `schemas/terrain-*.schema.json`, `assets/js/terrain.js`, `docs/terrain.html`, `scripts/validate-terrain.js`, `scripts/build-terrain-index.js` | **TERRAIN:** Customer jobs, workflows, frictions, problem-to-idea mappings |

### FactBounty Subproduct Roles (`apps/factbounty/`)
- `factbounty-architect` (`apps/factbounty/shared/contracts/`)
- `factbounty-frontend` (`apps/factbounty/frontend/`, `components/`)
- `factbounty-backend` (`apps/factbounty/backend/`, `db/`, `api/`)

---

## 3. Branching & Worktree Policy

- Independent tasks MUST execute in separate Git worktrees (`feat/va-<role>`).
- Direct pushes to `main` by feature subagents are strictly prohibited.
- `integration-release-agent` is the single gatekeeper permitted to merge into `main` after running `npm run quality`.

---

## 4. Testing & Quality Requirements

- Zero committed secrets or live production credentials (enforced by `npm run check:secrets`).
- Mandatory statistical synchronization (`npm run check:drift`).
- Zero broken links across dossiers (`npm run validate:links`).
- Clean PWA precaching contract compliance (`npm run test:pwa`).
- 100% schema compliance for all canonical JSON data (`npm run validate:data`).

---

## 5. Capability-Aware Provider Routing

- Execution defaults to local/free tiers (`hermes-ollama`, `own-orch`) for simple operations.
- Capability scheduling routes complex reasoning, research, and adversarial reviews to appropriate tiers (`fcc-claude`, `active-api`, `deepseek-api`, `anthropic-full`).
- Circuit breaker opens after 3 consecutive failures for 180 seconds.
- Logged event stream maintained in `.agent-state/logs/unattended-runner.log`.

---

## 6 Core AI Agent Operational Categories & Workspace Skills

Every specialist subagent operates within one of 6 core operational categories and leverages corresponding workspace skills from `.agents/skills/`:

### 1. Multi-Agent Orchestration & Lock-Free Coordination
- Skills: `va-multiagent-coordination`, `va-multiagent-failover`
- Agents: `autonomous-orchestration-agent`, `provider-router-agent`, `ventureatlas-provider-runtime`

### 2. Security, Auth & Zero-Critical QA
- Skills: `va-security-codeql-zero-critical`, `va-stripe-payment-idempotency`
- Agents: `security-privacy-agent`, `ventureatlas-security`, `payments-engineer`

### 3. Data Systems, Outbox & Migrations
- Skills: `va-transactional-outbox-event-engine`, `va-flyway-schema-versioning`
- Agents: `data-integrity-agent`, `ventureatlas-data-safety`, `backend-engineer`

### 4. Regulatory, Compliance & Diligence
- Skills: `va-regulatory-compliance-validator`, `va-yc-investor-diligence-package`
- Agents: `research-intelligence-agent`, `evidence-provenance-agent`, `opportunity-economics-agent`

### 5. Frontend, UX, i18n & Accessibility
- Skills: `va-wcag-accessibility-design-tokens`, `va-i18n-multilingual-localization`
- Agents: `product-ux-architect`, `frontend-platform-agent`, `ventureatlas-public-site`, `frontend-engineer`

### 6. E2E Testing, Telemetry & Codebase Graph Analysis
- Skills: `va-playwright-e2e-critical-journeys`, `va-opentelemetry-observability-tracing`, `graphify-codebase-analysis`
- Agents: `test-quality-agent`, `red-team-critic-agent`, `integration-release-agent`, `ventureatlas-test-adversary`


## Installed Workspace Skill Catalog (.agents/skills/)

- `eushop-auth0-session-jwt-security`
- `eushop-autonomous-multiagent-coordination`
- `eushop-autonomous-multiagent-failover`
- `eushop-dac7-tax-reporting-engine`
- `eushop-dsa-notice-and-action-moderation`
- `eushop-flyway-schema-versioning`
- `eushop-flyway-zero-downtime-migrations`
- `eushop-i18n-multilingual-localization`
- `eushop-nextjs-static-export-pages`
- `eushop-opensearch-fulltext-search-benchmarking`
- `eushop-opentelemetry-observability-tracing`
- `eushop-playwright-e2e-critical-journeys`
- `eushop-playwright-visual-regression-testing`
- `eushop-postgis-geospatial-matching`
- `eushop-postgis-spatial-corridor-matching`
- `eushop-regulatory-compliance-validator`
- `eushop-security-codeql-taint-remediation`
- `eushop-security-codeql-zero-critical`
- `eushop-stripe-payment-idempotency`
- `eushop-transactional-outbox-event-engine`
- `eushop-wcag-accessibility-design-tokens`
- `eushop-yc-investor-diligence-package`
- `graphify-codebase-analysis`
