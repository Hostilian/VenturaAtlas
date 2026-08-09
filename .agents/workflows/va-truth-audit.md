# Workflow: `/va-truth-audit`

## Purpose
Audit repository statistics, counts, schema compliance, public vs internal source separation, and ranking alignment.

## Execution Steps
1. Run `python scripts/audit_omega5_baseline.py`.
2. Execute `node scripts/deep-frontend-audit.js`.
3. Check `python scripts/validate-schema.py`.
