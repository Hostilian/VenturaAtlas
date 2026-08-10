# OMEGA IX Implementation Contract

- Main thread owns synthesis, high-risk writes, integration, tests, and release evidence.
- Research specialists are read-only unless assigned an isolated bounded implementation.
- One writer per high-risk file family.
- Preserve pre-existing changes; never reset or mass-edit canonical data.
- Use canonical lifecycle/publisher paths for data writes.
- Fix generators, never generated `_site/` files directly.
- Secrets, private research, staging, and agent state must not enter the public artifact.
- Failing critical dependencies must produce `FAILED` or `DEGRADED`, never a false success.
- Stop the local autonomy scheduler while the baseline or exact artifact is under examination.

## Implemented controls

- Public build denies the entire legacy `rankings/` directory; the public checker independently forbids it and scans CSV text for secrets/internal metadata.
- Discovery candidates retain model prose as hypotheses but receive no checklist pass percentage, composite score, confidence, or automatic high priority.
- The standalone validator now emits `BLOCKED / INSUFFICIENT_EVIDENCE`, uses `assessedAt`, and never manufactures `validatedAt` without behavioral receipts.
- Provider capability matching defaults to `all`; fallback is not a wildcard; external-model access is distinct from external-evidence retrieval and fails closed.
- Record-level epistemic migration no longer promotes records to T1/T2 from citation count.
- Ranking code no longer treats a stored composite as full coverage, no longer derives evidence confidence from URL count, labels eligibility maturity, and emits the view-specific metric in `score`.
- Repository drift checks computed truth for canonical/staged/total/source/ranking counts and revisions; metadata/docs were regenerated at 294 + 185 = 479.
- Generated documentation reports actual artifact counts instead of claiming every canonical record has every artifact.
- Home and rankings label legacy score order, missing eligibility, missing coverage, and non-comparable scales.

## Deliberately not performed

- No canonical or staging records were bulk relabeled, promoted, deleted, or scored.
- No candidate was approved; the 14-thesis ledger has eight `RESEARCH_MORE` finalists and zero behavioral validations.
- No cloud deployment, secret creation, paid provider call, or GitHub publication was attempted.
- The Windows autonomy process was stopped for the evidence window, but its scheduled task remains enabled and `Ready`; its next logon/trigger can start writers again.
