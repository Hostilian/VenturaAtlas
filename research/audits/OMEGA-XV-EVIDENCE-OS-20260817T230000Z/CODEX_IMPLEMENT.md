# OMEGA XV / Evidence OS — Implementation Ledger

## Landed in the working tree

- Replaced the OMEGA XIV unit test's dependency on private staging with the committed research-run receipt.
- Added `scripts/run-quality.js`, a named, fail-closed source-quality orchestrator with an atomic private receipt and GitHub Step Summary support.
- Added CI artifact upload steps for the source-quality receipt.
- Replaced fake `format`, `format:check`, and `lint` aliases with executable checks over an explicit tracked-source scope.
- Added behavioral tests for receipt success, first-failure propagation, porcelain-path integrity, format detection/repair, and the disabled legacy canonical-ingest bypass.
- Disabled reuse of the OMEGA XVII script's direct canonical JSON write path.
- Added a separate receipt-backed artifact profile plus deterministic public-tree manifest and CI receipt upload.
- Extended the lossless grouped research catalog to 507 rows across 29 recoverable rounds, including later exclusions, archive receipts, graveyard items, the eight-item August regulatory wave, the eleven-item ProofOps / Reality Engine wave, and the twelve-item OMEGA XVI machine-rights wave.
- Reconciled all eight requested August regulatory spaces against current official sources and recorded each as research-only: two modules, two raw hypotheses, two duplicate families, one related-family merge, and one watch signal.
- Added a bounded generated-output cleaner, separate commit-stable source and artifact quality receipts, and an exact public-artifact build marker guarded by a writer lock.
- Added a non-promotable ProofOps research registry and one unrun external experiment object per candidate. Every candidate has explicit negative evidence, confidence, reality stage, proof externality, timing, and a `whatWouldKill` condition.
- Added mandatory-interface radar records and shared IdentityGraph, EvidenceCapsule, and TestScenario schemas for future vertical ProofOps implementations.

## Not claimed

- Concurrent OMEGA XVII/XVIII canonical records were not promoted or verified by this run.
- No CI run, deployment, buyer contact, payment, or live cloud behavior has been observed by this run.
- No independent lifecycle receipt exists for the concurrently imported OMEGA XVII/XVIII canonical records; website presence must not be read as evidence maturity.
- The local artifact was verified, but this run did not push, deploy, or observe a remote CI/deployment receipt.
