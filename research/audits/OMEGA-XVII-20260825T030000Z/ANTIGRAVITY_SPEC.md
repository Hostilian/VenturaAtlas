# OMEGA-XVII Track B Specification — Runtime Truth & Content Completion

## 1. Mission Context & Objective
- **Track**: OMEGA-XVII Track B (Antigravity / Claude)
- **Branch**: `feat/va-content-omega17`
- **Scope Authority**: `AGENTS.md` -> `.agent-system/MASTER_GOAL.md` -> `.agents/AGENTS.md` -> user prompt.
- **Core Goals**:
  1. **Runtime Truth Assessment**: Verify real daemon, heartbeat, GCP Cloud Run (`AUT-007`), and Hermes hosting (`AUT-008`) status without faking liveness or modifying production infra.
  2. **Human Operational Brief**: Provide a concrete, actionable brief for human operators on what external credentials/billing are required.
  3. **Content Completion Gap**: Close the completion gap across `financial-models/`, `validation-plans/`, `technical-blueprints/`, and `launch-plans/` for all 324 canonical ideas in `data/ideas.json` without data fabrication or asserting assumptions as facts.
  4. **Agent Ownership Boundary Review**: Audit `.agents/AGENTS.md` to identify unassigned artifact paths and propose clear specialist ownership.
  5. **Shared State Delta**: Propose an authoritative state delta for `.agent-system/state.json` and `.agent-system/backlog.json` to be reconciled by release integration.

## 2. Invariant & Isolation Rules
- **Track A Exclusions**: Zero edits to `data/ideas.json`, `data/ideas.schema.json`, `data/categories.json`, `data/sources.json`, `tests/`, `THREAT_MODEL.md`.
- **Shared State Exclusions**: Zero direct edits to `.agent-system/state.json` or `.agent-system/backlog.json`.
- **Evidence Integrity**: All financial projections and validation steps must be explicitly labeled as analyst scenarios or pre-registration requirements rather than verified empirical facts.
