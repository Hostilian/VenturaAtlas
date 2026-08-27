# FactBounty supervised pilot runbook

## Status boundary

This runbook is for a human-supervised, fixed-scope pilot after the P0 release gates in `PRODUCT_READINESS.md` pass. It is not authorization to contact people, charge money, collect media, or pay responders. Those actions require an approved operator, lawful contact path, consent, configured providers, and a current legal/privacy review.

## Pilot design

- One narrow vertical.
- One observable product question.
- One buyer, one responder, one moderator, one operator.
- One fixed EUR price and explicit delivery SLA.
- One checklist version and one evidence format.
- Free substitute shown before the paid offer.
- No cohort expansion until the first request clears.

## Operator preflight

Record a signed preflight receipt containing:

1. Run ID, commit SHA, environment, and schema versions.
2. Feature flags and provider mode; demo mode must be false for a paid pilot.
3. Payment test receipt, signed-webhook verification, refund test, and reconciliation check.
4. Database migration version, backup timestamp, and successful restore proof.
5. Object-storage encryption, signed-URL expiry, upload-size/MIME limits, checksum and quarantine checks.
6. Role matrix and object-level authorization test results.
7. Consent text/version, retention deadline, deletion/export path, and support contact.
8. Incident owner, escalation contact, and stop authority.

If any preflight item is missing, stop and label the run `NOT_CLEARED`.

## Buyer conversation script

Use plain language and do not imply certification:

> We can investigate one specific question about one product and deliver a checklist-bound evidence report. We will show you the free alternatives first. The paid request costs **[amount/currency]**, is delivered by **[SLA]**, and may conclude that the evidence is inconclusive. Do you consent to this limited request and its stated retention period?

Record: buyer identity/account reference, consent timestamp and version, exact question, product URL/reference, free alternatives shown, price, delivery promise, acceptance criterion, and accept/reject reason. Do not record unnecessary personal data.

## Request lifecycle

1. **Draft:** operator checks the question is observable and within scope.
2. **Offered:** buyer sees price, SLA, limitations, refund terms, and consent.
3. **Paid:** payment provider confirms success through a verified webhook; never infer payment from a redirect.
4. **Funded:** ledger records gross amount, platform fee, expected responder amount, provider fees, and refund reserve.
5. **Assigned:** responder accepts the exact checklist version and confidentiality/consent terms.
6. **Challenged:** system issues a single-use challenge bound to request and expiry.
7. **Captured:** responder records only necessary evidence; raw media remains private.
8. **Verified:** storage HEAD/checksum/MIME/size/metadata/quarantine checks pass.
9. **Moderated:** moderator approves, rejects, or requests more evidence with reason.
10. **Delivered:** buyer receives the bounded report and evidence receipt.
11. **Settled:** refund window and dispute checks pass before payout release.
12. **Closed:** retention timer, deletion/export rights, outcome, and learning record are written.

## Evidence receipt minimum

```json
{
  "receiptVersion": "1.0",
  "runId": "pilot-run-id",
  "requestId": "request-id",
  "questionHash": "sha256:...",
  "checklistVersion": "checklist-v1",
  "challengeId": "challenge-id",
  "objectChecksum": "sha256:...",
  "capturedAt": "2026-08-27T00:00:00Z",
  "verifiedAt": "2026-08-27T00:00:00Z",
  "moderation": {"decision": "approved", "reviewerId": "redacted", "reasonCode": "scope_met"},
  "consent": {"version": "consent-v1", "recordedAt": "2026-08-27T00:00:00Z"},
  "limitations": ["one item", "one observation", "not a certification"],
  "disclosure": {"reusable": false, "retentionUntil": "2026-09-26T00:00:00Z"}
}
```

The example is a shape, not a live receipt. Replace all IDs and timestamps with generated values; never use fixture values in a production record.

## Moderator protocol

- Review against the exact checklist version, not memory.
- Separate “not observed” from “failed”.
- Request more evidence only when the buyer’s scope allows it.
- Record a reason code and free-text explanation.
- Escalate conflicts, suspected manipulation, privacy incidents, or identity concerns.
- Never infer authenticity from a checksum alone; it proves object consistency, not truth.

## Refund, dispute, and payout protocol

- Hold responder payout until approval, refund window, and manual fraud checks pass.
- A refund is a financial event requiring provider confirmation and a ledger entry.
- A buyer redirect, local simulator event, or invoice is not revenue evidence.
- For any dispute, freeze payout and preserve the relevant receipt while honouring deletion obligations for unrelated data.
- Reconcile provider events daily: gross, fees, refunds, chargebacks, platform share, responder share, and unmatched events must sum to zero.

## Metrics to record

| Metric | Definition | Kill signal |
|---|---|---|
| Paid conversion | accepted paid offers / qualified offers | zero after a bounded outreach sample |
| Delivery SLA | time from verified payment to delivered report | repeated breach |
| Reviewer agreement | independent decision agreement | unresolved disagreement |
| Correction rate | reports requiring correction / delivered reports | material recurring errors |
| Buyer value | buyer-stated decision or avoided cost | no decision value |
| Contribution margin | price minus payout, fees, labor, storage, support, refunds | negative after realistic labor |
| Repeat request | second paid request by same/comparable buyer | no repeat after value delivered |
| Incident rate | P0/P1 incidents per request | any unresolved P0 |

## Stop conditions

Stop the pilot immediately for payment mismatch, unauthorized access, missing consent, unverifiable evidence, suspected manipulation, unresolved reviewer conflict, deletion failure, or any P0 security/privacy incident. Record the stop reason and do not silently resume.

## End-of-pilot decision

Choose exactly one outcome:

- `KILL`: no payment, no value, uneconomic labor, or an unresolved safety/legal failure.
- `MANAGED_SERVICE`: value exists but automation is not justified; continue only with explicit human capacity limits.
- `NARROW_SELF_SERVE`: repeat value, positive contribution margin, stable evidence quality, and all P0 gates remain green.

Only `NARROW_SELF_SERVE` can justify a 20-request cohort, and even then Track A must update the evidence-backed commercial state through its authorized lifecycle.
