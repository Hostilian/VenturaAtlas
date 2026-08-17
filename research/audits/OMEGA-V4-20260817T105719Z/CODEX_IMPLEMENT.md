# Implementation

## Landed

- Capital Clock now requires `commercialEvidenceStatus: NO_PURCHASE_EVIDENCE_COLLECTED` and `noPurchaseEvidenceCollected: true` even when its record set is empty.
- Rankings UI now states that no purchase evidence has been collected and exposes a per-item score-breakdown disclosure, legacy maturity, stored dimensions, and missing-component state.
- Provider router now supports one cheap GET reachability probe per configured provider. It distinguishes `VERIFIED_REACHABLE`, `VERIFIED_REACHABLE_AUTH_FAILED`, `VERIFIED_UNREACHABLE`, and `UNCONFIGURED_OR_NO_KEYS`.
- Added `scripts/probe-provider-reachability.py`; the current live run reached the local Hermes/Ollama endpoint without recording secrets.
- TASK-004 moved to `LANDED` with UI and test evidence.
- Direct GitHub Actions inspection completed for all workflows exposed by `gh workflow list`.

## Not claimed

- No real Stripe checkout was completed. The adapter’s current path is still a synthetic session implementation, and no human-provided Stripe test key was available.
- No buyer interviews, payments, or commercial validation were synthesized.
- CI is not green across every workflow: Check links and Validate and Deploy Pages have failing recent runs; Quality Check and Validate data returned no runs.
