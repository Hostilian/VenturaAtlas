# Product release gate matrix — FactBounty

## Verdict

**Not cleared for production.** The repository has strong local contract coverage, but live payment, signed webhook, payout, durable persistence, object verification, privacy operations, and external buyer evidence are still gates. This matrix is the checklist that must be satisfied before changing that verdict.

## Gate states

- `PASS`: fresh evidence receipt exists for the exact commit/environment.
- `PARTIAL`: local capability exists, but live or independent evidence is missing.
- `BLOCKED`: the current implementation intentionally fails closed or uses a simulator/fixture.
- `NOT_STARTED`: no evidence exists.

## P0 gates

| ID | Gate | Current state | Required test/evidence | Release owner |
|---|---|---|---|---|
| P0-01 | Payment creation | BLOCKED | Official provider test transaction; provider object ID persisted; idempotency replay returns same result | Payments |
| P0-02 | Signed webhook | BLOCKED | Valid signature accepted; invalid/tampered/replayed signature rejected; event ID unique | Payments/Security |
| P0-03 | Refund/chargeback | BLOCKED | Full and partial refund; chargeback hold; ledger reconciliation | Payments/Ops |
| P0-04 | Payout | BLOCKED | Provider marketplace payout in test mode; beneficiary and hold/release checks; tax review | Payments/Legal |
| P0-05 | Durable database | BLOCKED | Managed SQL migration, transaction isolation, concurrent-write test, backup and restore drill | Platform |
| P0-06 | Object verification | BLOCKED | Exact object HEAD; owner/request metadata; checksum, MIME, size, encryption, quarantine; expired URL rejection | Evidence |
| P0-07 | Authorization | PARTIAL | Buyer/responder/moderator/admin matrix; object ownership; token expiry/revocation; negative tests | Security |
| P0-08 | Consent and deletion | BLOCKED | Consent version receipt; export/delete request; retention worker; audit of access and deletion | Privacy |
| P0-09 | Abuse controls | BLOCKED | Rate limit, upload limits, duplicate account, suspicious evidence, moderation escalation | Trust/Ops |
| P0-10 | Audit ledger | PARTIAL | Append-only event IDs, correlation IDs, actor, timestamp, schema version, redacted payload | Platform |
| P0-11 | Observability | BLOCKED | Error/latency/payment/evidence dashboards; alert delivery; incident drill | Platform |
| P0-12 | Human moderation | BLOCKED | Two-person sample, disagreement rule, appeal path, decision SLA | Operations |
| P0-13 | Legal/privacy review | BLOCKED | Product-role, jurisdiction, consumer, tax, payout, and privacy review; approved copy | Legal |
| P0-14 | Real buyer evidence | NOT_STARTED | One consented buyer pays for one bounded request; delivery and value receipt | Founder |

## P1 gates

| ID | Gate | Required evidence |
|---|---|---|
| P1-01 | Accessibility | Keyboard, focus, screen-reader, and non-color status checks for all three roles |
| P1-02 | Reliability | Retry/idempotency tests, provider outage behavior, queued reconciliation, restore time objective |
| P1-03 | Cost controls | Per-request cost budget, storage lifecycle, model/provider budget, alert on anomaly |
| P1-04 | Support | Public contact, response target, refund wording, incident and complaint templates |
| P1-05 | Documentation | Operator runbook, responder instructions, buyer limitations, API contract, data map |
| P1-06 | Privacy-safe analytics | Event taxonomy, redaction tests, retention, access review, deletion propagation |

## Evidence packet required for release review

1. Commit SHA and environment manifest.
2. Test report with pass/fail counts and known limitations.
3. Payment provider receipts and webhook verification logs (secrets redacted).
4. Database migration, backup, restore, and concurrency receipts.
5. Object upload/verification/quarantine/deletion receipts.
6. Authz negative-test report.
7. Privacy/legal approval and copy version.
8. Incident tabletop result and operator sign-off.
9. One real buyer outcome receipt, if the release is a paid pilot.
10. Explicit go/no-go decision with named approver.

## Suggested verification commands

Run from the repository root after dependencies are installed:

```powershell
npm run typecheck
npm run test:factbounty
npm run test:runtime
npm run validate:public
npm run check:secrets
```

These commands validate repository behavior and public-artifact hygiene; they do not create a customer, payment, payout, or deployment receipt. Live provider tests require separate credentials, sandbox isolation, and explicit operator approval.

## Go/no-go rule

Go only when all P0 gates are `PASS`, the real buyer gate is positive, the contribution-margin calculation includes labor and provider costs, and the operator can stop, refund, delete, and reconcile. Otherwise remain `LOCAL PROTOTYPE / SUPERVISED PILOT NOT YET CLEARED`.
