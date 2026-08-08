# Antigravity Multi-Agent Orchestration & VenturaAtlas Development Discipline

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

| Specialist Agent | Owned Directory / File Paths |
| :--- | :--- |
| `repository-forensics-agent` | `docs/REPO_AUDIT_*.md`, read-only across repository |
| `data-integrity-agent` | `data/ideas.json`, `data/ideas.schema.json`, `data/categories.json`, `data/sources.json`, `scripts/build-repository-meta.js` |
| `research-intelligence-agent` | `research/`, `ideas/`, `data/idea-staging-queue.json` |
| `evidence-provenance-agent` | `schemas/provenance.schema.json`, `data/sources.json`, `research/source-log.md` |
| `opportunity-economics-agent` | `financial-models/`, `docs/calculator.html`, `assets/js/features/calculator.js` |
| `ranking-and-fit-agent` | `rankings/`, `data/rankings.json`, `scripts/va-ranker.py`, `docs/matcher.html`, `assets/js/features/matcher.js` |
| `product-ux-architect` | `index.html`, `docs/`, `assets/css/` |
| `frontend-platform-agent` | `assets/js/core/`, `assets/js/ui/`, `assets/js/site.js`, `sw.js`, `manifest.webmanifest` |
| `search-discovery-agent` | `data/search-index.json`, `scripts/build-search-index.js`, `assets/js/features/command-palette.js` |
| `autonomous-orchestration-agent` | `data/agent-task-graph.json`, `scripts/va_runtime/orchestration/`, `scripts/autonomous-idea-generator.py` |
| `provider-router-agent` | `config/providers.json`, `scripts/va_orchestrator.py`, `scripts/va_runtime/provider_router.py` |
| `security-privacy-agent` | `THREAT_MODEL.md`, `scripts/check-public-artifact.js`, `scripts/check_privacy.py` |
| `test-quality-agent` | `tests/`, `TEST_PLAN.md`, `playwright.config.ts` |
| `red-team-critic-agent` | `scripts/va_runtime/adversarial_pass.py`, read-only across code |
| `integration-release-agent` | Root integration, `package.json`, `_site/`, `walkthrough.md`, `PROJECT_STATUS.md`, `README.md` |

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
