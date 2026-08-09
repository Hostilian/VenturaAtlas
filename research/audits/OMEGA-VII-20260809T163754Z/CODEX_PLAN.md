# OMEGA VII — Dependency Plan

| Milestone | Owner | Dependencies | Acceptance criteria | Validation command | Status | Blockers |
|---|---|---|---|---|---|---|
| M0 Baseline and durable state | primary | none | Baseline, dirty paths, spec, plan, runbook, log, ledger recorded | `git status --porcelain=v1 && git rev-parse HEAD` | in progress | none |
| M1 Codex instruction chain | primary + independent reviewer | M0 | Root guidance has no volatile counts; project config uses supported keys; hooks/rules/agents have executable sentinel tests | `codex execpolicy check`; isolated Codex load/spawn/hook probes | pending | project trust/hook review may require interactive confirmation |
| M2 Execution/data graph | repo, data, runtime reviewers | M0 | Authoritative producers/consumers, schemas, cloud writers, public projection, tests, and ghost paths mapped with file/symbol evidence | targeted static queries and fixture invocations | pending | none |
| M3 P0/P1 ledger | primary + reviewer | M2 | Findings have severity, reproduction, evidence, impact, status, and safe owner | machine/human ledger consistency check | pending | none |
| M4 Foundational fixes | isolated implementers | M3 | Confirmed safe P0/P1 fixes merged without touching user-owned changes | targeted regression/failure-injection tests | pending | overlap with dirty orchestrator paths may block direct edits |
| M5 Evidence/ranking/public chain | primary + data/UI reviewers | M4 | Missing/synthetic states explicit; public source boundary and ranking eligibility proven | schema, relationship, ranking, exact artifact privacy tests | pending | corpus migration may be prospective only |
| M6 Runtime/cloud/collaboration truth | runtime/security/UI reviewers | M4 | Critical failure propagates; auth fails closed; cloud/collaboration maturity is demonstrated or labeled | isolated endpoint/provider/two-client tests | pending | credentials/deployed infrastructure not assumed |
| M7 Research and adversarial validation | evidence + disconfirmation reviewers | M2 | Priority opportunities have current support, contradiction, freshness, and decision implications | retained-source audit | pending | research scope selected after triage |
| M8 Exact artifact and browser gates | primary + test adversary | M4-M7 | Same artifact is built, scanned, hashed, and journey-tested; PWA/accessibility results recorded | release verification commands in runbook | pending | browser/runtime availability |
| M9 Reproducibility and final review | independent reviewer/red team | M8 | generator fixed point, fresh clone, HEAD reconciliation, final digests and unknowns | clean isolated verification | pending | none |

Only one canonical-data writer may be active. Read-heavy reviewers may run in parallel. Milestone status changes require evidence in `CODEX_LOG.md` and `CHANGE_LEDGER.md`.
