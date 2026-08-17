# OMEGA XV / Evidence OS — Implementation Ledger

## Landed in the working tree

- Replaced the OMEGA XIV unit test's dependency on private staging with the committed research-run receipt.
- Added `scripts/run-quality.js`, a named, fail-closed source-quality orchestrator with an atomic private receipt and GitHub Step Summary support.
- Added CI artifact upload steps for the source-quality receipt.
- Replaced fake `format`, `format:check`, and `lint` aliases with executable checks over an explicit tracked-source scope.
- Added behavioral tests for receipt success, first-failure propagation, porcelain-path integrity, format detection/repair, and the disabled legacy canonical-ingest bypass.
- Disabled reuse of the OMEGA XVII script's direct canonical JSON write path.

## Not claimed

- Concurrent OMEGA XVII/XVIII canonical records were not promoted or verified by this run.
- No CI run, deployment, buyer contact, payment, or live cloud behavior has been observed by this run.
- The exact public artifact is not verified until `build:verified` and the privacy/artifact checks complete on a stable tree.
