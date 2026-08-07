# Antigravity Multi-Agent Orchestration & Development Discipline

## 1. Orchestration & Roles

This repository uses a deterministic, parallel subagent orchestration architecture for major development initiatives.

### Core Agent Roles
1. **Repository Researcher (`repository-researcher`)**: Read-only inspection of conventions, existing code, dependencies, and artifacts.
2. **Product Architect (`product-architect`)**: System specifications, data models, state machines, API contracts, and acceptance criteria.
3. **Frontend Engineer (`frontend-engineer`)**: Buyer, responder, and moderator UI components, state management, and forms.
4. **Backend Engineer (`backend-engineer`)**: Domain entities, database migrations, persistence, REST API routes, and event handling.
5. **Evidence Capture Engineer (`evidence-capture-engineer`)**: Browser-native camera/screen recording, cryptographic challenge generation, capture metadata, and S3-compatible media upload workflows.
6. **Payments Engineer (`payments-engineer`)**: Payment provider abstraction, local payment simulator, Stripe test-mode integration, webhook reconciliation, and payout state.
7. **Security Reviewer (`security-reviewer`)**: Read-only threat modeling, authorization verification, data privacy (GDPR/DSA), input sanitization, and dependency vulnerability audits.
8. **Test Engineer (`test-engineer`)**: Unit tests, API integration tests, state machine boundary tests, accessibility checks, and Playwright end-to-end user journeys.
9. **Integration Reviewer (`integration-reviewer`)**: Code review, contract verification, cross-component integration, and test suite execution prior to merging.

---

## 2. File Ownership Rules

To prevent conflicting edits between concurrent agents, each agent owns specific file boundaries:

| Agent | Owned Directory / File Paths |
|-------|------------------------------|
| `product-architect` | `apps/factbounty/shared/contracts/` |
| `frontend-engineer` | `apps/factbounty/frontend/`, `apps/factbounty/components/` |
| `backend-engineer` | `apps/factbounty/backend/`, `apps/factbounty/db/`, `apps/factbounty/api/` |
| `evidence-capture-engineer` | `apps/factbounty/capture/`, `apps/factbounty/media/` |
| `payments-engineer` | `apps/factbounty/payments/`, `apps/factbounty/simulators/` |
| `test-engineer` | `apps/factbounty/tests/`, `tests/e2e/` |
| `security-reviewer` | Read-only across all code; writes only to security audit reports |
| `integration-reviewer` | Root integration files, `package.json`, root configs |

---

## 3. Branching & Worktree Policy

- Independent tasks MUST execute in separate Git branches or worktrees (`feat/factbounty-<role>`).
- Direct pushes to `main` by feature subagents are prohibited until validated by the `integration-reviewer`.
- Merge conflicts must be resolved cleanly by rebasing on `main`.

---

## 4. Testing & Quality Requirements

- All state transitions must be verified with typed domain errors.
- Every API endpoint requires authorization tests (Role-Based Access Control).
- Mandatory Playwright E2E journey for the core buyer → simulator → capture → moderator → payout loop.
- Zero committed secrets or live production credentials (use `.env.example` placeholders).

---

## 5. Provider Fallback & Health Policy

- Local deterministic rules & Antigravity internal capabilities serve as the primary execution engine.
- Providers are health-checked before work assignment.
- Circuits open after 3 consecutive failures for 300 seconds.
- Every routing decision is logged to `.agent-state/progress-events.ndjson`.

---

## 6. Progress Telemetry

- Events appended to `.agent-state/progress-events.ndjson`.
- State summarized in `.agent-state/live-progress.json` and rendered in `LIVE_PROGRESS.md`.
- Live watching via `npm run agents:watch`.
