---
name: eushop-flyway-zero-downtime-migrations
description: "Flyway Zero-Downtime Migration & Database Indexing Guidelines for EUshop"
---

# EUshop Flyway Zero-Downtime Database Migration Skill

## Overview

This skill establishes database migration discipline, zero-downtime schema updates, and index safety for PostgreSQL in `db/migrations`.

---

## 1. Migration Discipline Rules

- **Immutable Applied Migrations**: Never edit an already applied Flyway migration file (`V1__...`, `V2__...`). Create new versioned migrations (`V3__...`) for schema changes.
- **Expand-and-Contract Pattern**: Zero-downtime column renames or deletions must occur in 2 stages (add new column -> populate/sync -> drop old column in next release).
- **Index Safety**: Foreign keys and high-frequency search columns (`email`, `auth0_sub`, `status`, `country`) MUST have explicit indexes.
