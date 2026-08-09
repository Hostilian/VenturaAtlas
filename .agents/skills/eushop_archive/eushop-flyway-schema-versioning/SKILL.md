---
name: eushop-flyway-schema-versioning
description: "Flyway Schema Versioning & Lock-Free Migration Discipline Skill for EUshop"
---

# EUshop Flyway Schema Versioning Skill

## Overview

This skill provides lock-free migration patterns, DDL versioning rules, and checksum validation for Flyway in `db/migrations`.

---

## 1. Migration Naming & Versioning

- Migration filenames MUST follow format: `V{VERSION}__{description}.sql` (e.g. `V3__add_moderation_audit_table.sql`).
- All DDL statements MUST specify explicit constraint names and foreign key indexes.
