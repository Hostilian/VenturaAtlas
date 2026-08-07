# Venture Atlas OS — Changelog

## [2.3.0] - 2026-08-07

### Added
- **GCP Cloud Control Plane:** Added `cloud-control-plane/Dockerfile`, `cloud-control-plane/job_runner.py`, and `cloud-control-plane/terraform/main.tf` for 24/7 unattended cloud execution on Cloud Run Jobs, Cloud Scheduler, and Secret Manager.
- **Failure Injection Test Suite:** Added `tests/failure-injection.test.js` validating provider circuit breakers, artifact security, and metadata build consistency.
- **Single Source of Truth Synchronization:** Enhanced `scripts/update-documentation-stats.js` and `scripts/check-repository-drift.js` to automatically synchronize and validate `index.html` meta tags and `sw.js` `CACHE_VERSION` with `data/repository-meta.json`.

### Fixed
- Fixed live GitHub Pages stale count bug by integrating automated `index.html` meta tag and `sw.js` version synchronization into the build pipeline.
- Enforced intra-provider key pool retry loops in `scripts/va_orchestrator.py` with ToS compliance and circuit breaker backoffs.
