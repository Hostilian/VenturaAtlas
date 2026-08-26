# Venture Atlas OS — Changelog

## [2.7.2] - 2026-08-25

### Added
- **TERRAIN Problem Atlas:** Added problem-first upstream modeling layer to ground venture ideas in observed workflows and jobs-to-be-done.
- **TERRAIN Schemas:** Added 5 draft-2020-12 schemas in `schemas/`: `terrain-actor.schema.json`, `terrain-job.schema.json`, `terrain-workflow.schema.json`, `terrain-problem.schema.json`, and `terrain-problem-relation.schema.json`.
- **Dogfood Problem Datasets:** Added verified seed datasets in `data/` for HeatProof (`idea-433`), FlexCovenant (`idea-434`), and FactBounty (`idea-061`) with strict `AI_HYPOTHESIS` epistemic tagging and counterevidence preservation.
- **Problem Atlas UI:** Added interactive static Problem Atlas browser at `docs/terrain.html` powered by `assets/js/terrain.js` and `data/terrain-index.json`.
- **Validation & Tooling:** Added `scripts/validate-terrain.js` with solution-language linter and privacy leak protection, plus `scripts/build-terrain-index.js` index builder integrated into `npm run validate:data` and `npm run generate`.
- **Contract Tests:** Added `tests/terrain-contract.test.js` validating schema compliance, referential integrity, JTBD solution-neutrality, and epistemic labeling.

## [2.3.0] - 2026-08-07

### Added
- **GCP Cloud Control Plane:** Added `cloud-control-plane/Dockerfile`, `cloud-control-plane/job_runner.py`, and `cloud-control-plane/terraform/main.tf` for 24/7 unattended cloud execution on Cloud Run Jobs, Cloud Scheduler, and Secret Manager.
- **Failure Injection Test Suite:** Added `tests/failure-injection.test.js` validating provider circuit breakers, artifact security, and metadata build consistency.
- **Single Source of Truth Synchronization:** Enhanced `scripts/update-documentation-stats.js` and `scripts/check-repository-drift.js` to automatically synchronize and validate `index.html` meta tags and `sw.js` `CACHE_VERSION` with `data/repository-meta.json`.

### Fixed
- Fixed live GitHub Pages stale count bug by integrating automated `index.html` meta tag and `sw.js` version synchronization into the build pipeline.
- Enforced intra-provider key pool retry loops in `scripts/va_orchestrator.py` with ToS compliance and circuit breaker backoffs.
