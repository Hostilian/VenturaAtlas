# OMEGA-XVII Track A Specification: Integrity, Governance & Verified Ground Truth

**Audit Run ID:** `OMEGA-XVII-20260825T030000Z`
**Supersedes:** Prior thin stub (2026-08-25); this version uses live-verified data from 2026-08-26T18:20Z
**Author:** Codex / Antigravity (Track A)
**Authority Hierarchy:** `AGENTS.md` -> `.agent-system/MASTER_GOAL.md` -> `.codex/rules/destructive.rules` -> Track A Prompt
**Cooperating Track:** Track B (Claude / Antigravity) — proposes, does not write state files

---

## 1. Mission Context & Mandate

OMEGA-XVII was assigned to Track A to close the paper trail and governance debt accumulated from OMEGA-XVI. Track B delivered +1,020 content artifact files during OMEGA-XVII. Track A is the designated sole authoritative writer of `.agent-system/state.json` and `.agent-system/backlog.json`.

The prior thin CODEX stubs in this directory were written without running the actual test suite or performing a full-cohort content audit. This document corrects that by superseding them with live-verified findings.

## 2. Stage 1 Verification Scope

1. Close the OMEGA-XVI paper trail.
2. Re-verify dossier counts: `ideas/*.md` vs `data/ideas.json` vs `data/repository-meta.json`.
3. Confirm `security@ventureatlas.os` is eliminated from all live files.
4. Re-run the real test/quality suite; reconcile against MERCURY_REPORT verified numbers.
5. Full-cohort content quality audit across all 1,298 artifact files (not just idea-061-070).
6. Reconcile `state.json`/`backlog.json` with `filePresenceCount` and `contentQualityAudit` fields.

## 3. Evidence Standards

All numbers are sourced from live PowerShell filesystem queries run on the actual worktree at the timestamp above. No number is copied from memory, prior prompts, or Track B proposals without independent verification. Where a prior audit claim is narrower or inaccurate, this document says so explicitly, names the discrepancy, and corrects it. This document does not assert commercial validation, production deployment, or always-on operation.
