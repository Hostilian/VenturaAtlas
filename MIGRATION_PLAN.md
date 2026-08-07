# Venture Atlas OS — Migration & Upgrade Plan

## Single Source of Truth Migration
- Legacy manual count updates in `index.html` and `sw.js` are migrated to automated synchronization via `scripts/update-documentation-stats.js`.
- CI quality pipeline enforces zero-drift checks (`scripts/check-repository-drift.js`).
