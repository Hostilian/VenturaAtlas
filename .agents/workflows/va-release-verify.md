# Workflow: `/va-release-verify`

## Purpose
Full pre-release verification suite for Venture Atlas OS static build and PWA contracts.

## Execution Steps
1. Run `npm run quality`.
2. Verify static build output in `_site/` (HTML files, search index, RSS feed, sitemap).
3. Execute `node scripts/check-public-artifact.js` for security redaction.
