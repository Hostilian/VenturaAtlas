# OMEGA VII — Change Ledger

| ID | File | Before | After | Why | Evidence | Test | Risk | Status |
|---|---|---|---|---|---|---|---|---|
| CHG-001 | `AGENTS.md` | Volatile record counts and `repository-meta.json` asserted as source of truth | Durable invariants; canonical/staging truth derived at runtime; Codex run-chain pointer | Prevent instruction drift and false authority | Baseline file contained hard-coded counts | instruction-load test pending | low | implemented, unverified |
| CHG-002 | `research/audits/OMEGA-VII-20260809T163754Z/*` | No run-specific OMEGA VII state | Frozen spec, dependency plan, runbook, log, and ledger | Make the mission resumable and auditable | Baseline inspection | content/consistency checks pending | low | implemented, unverified |
