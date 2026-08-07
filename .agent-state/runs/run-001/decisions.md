# Run 001 — Decisions Log

| Decision ID | Topic | Resolution | Rationale |
|-------------|-------|------------|-----------|
| DEC-001 | Application Location | `apps/factbounty/` | Isolates MVP cleanly while preserving existing static site & scripts |
| DEC-002 | Primary Language | TypeScript + Node.js | Strict contract typing, Zod runtime validation, shared front/back types |
| DEC-003 | Payment Fallback | Local Payment Simulator | Ensures full E2E testability without live Stripe credentials |
