---
trigger: glob
globs:
  - "data/**/*.json"
  - "schemas/**/*.json"
description: Data integrity and schema validation rules for VenturaAtlas OS JSON data structures
---

# Data Integrity & Schema Rules

1. **ID Allocation**: Canonical IDs must follow `idea-XXX` zero-padded format and be allocated strictly sequentially via `allocate_next_canonical_id()`.
2. **Schema Gate**: All canonical idea objects must validate 100% against `schemas/idea.schema.json`.
3. **Source Reference Resolution**: Every entry in `sourceReferences` must resolve to a valid ID in `data/sources.json` or documented legacy namespace.
4. **Validation Summaries**: `data/validation-summary.json` must be written directly from `scripts/validate-data.js` findings.
