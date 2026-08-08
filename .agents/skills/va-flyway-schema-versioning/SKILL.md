---
name: va-flyway-schema-versioning
description: Flyway zero-downtime database schema versioning and lock-free migration discipline.
---

# Flyway Schema Versioning & Zero-Downtime Migrations

This skill defines database schema migration rules to prevent lock contention and deployment downtime.

## Migration Rules

1. **Backward-Compatible Schema Changes**:
   - Phase 1: Add new column (nullable or with default value).
   - Phase 2: Deploy updated application code writing to both old and new columns.
   - Phase 3: Backfill data and drop old column in subsequent release.

2. **Immutable Migration Files**:
   - Versioned migrations (`V1__...sql`, `V2__...sql`) must NEVER be modified once committed.
   - Non-repeatable schema fixes require new incremental version numbers.
