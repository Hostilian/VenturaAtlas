# Venture Atlas OS — Test Plan & Quality Assurance

## Automated Test Suites

1. **Unit & Integrity Tests (`npm run test:unit`):**
   - `tests/data-integrity.test.js` — Checks unique IDs, slugs, and source references.
   - `tests/pwa-contract.test.js` — Validates PWA shell, manifest, and offline fallbacks.
   - `tests/repository-consistency.test.js` — Ensures version alignment across package files.
   - `tests/runtime-contract.test.js` — Verifies clean JavaScript runtime without inline handler leaks.
   - `tests/smoke.test.js` — Validates required static artifacts and HTML content.
   - `tests/failure-injection.test.js` — Verifies provider circuit breaking, 429 backoff, and artifact security checks.

2. **Quality & Drift Verification (`npm run quality`):**
   - Strictly validates `data/ideas.json` against `data/ideas.schema.json`.
   - Validates link integrity across all dossiers.
   - Asserts zero stat block drift between `repository-meta.json`, `README.md`, `PROJECT_STATUS.md`, `index.html`, and `sw.js`.
