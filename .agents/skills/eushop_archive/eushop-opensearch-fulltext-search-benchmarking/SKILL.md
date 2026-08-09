---
name: eushop-opensearch-fulltext-search-benchmarking
description: "Full-Text Search Benchmarking & OpenSearch Query Engine Skill for EUshop"
---

# EUshop Full-Text Search Benchmarking Skill

## Overview

This skill provides search benchmarking, PostgreSQL `pg_trgm` trigram indexing, and OpenSearch query abstraction guidelines.

---

## 1. Benchmarking Criteria

- **Target Latency**: p50 < 50ms, p95 < 150ms across 100,000 product items.
- **Typo Tolerance**: Trigram similarity threshold ≥ 0.3 for fuzzy brand and food queries.
- **Trigram Index Standard**:
  ```sql
  CREATE INDEX idx_food_name_trgm ON foods USING gin (name gin_trgm_ops);
  ```
