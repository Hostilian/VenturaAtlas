# Product-readiness package — FactBounty / Venture Atlas validation wedge

## Readiness verdict

FactBounty is a verified local prototype, not a production product. The application has a useful buyer → payment → responder → evidence → moderator → payout state machine and passing local tests, but production startup is intentionally blocked. The current Stripe adapter returns test-shaped mock results, the S3 verification path is fixture-shaped, and the store is a local JSON persistence layer. No real buyer, organization, conversation, payment, payout, revenue, retention, or external commercial receipt has been recorded. The product-ready target is therefore **production-safe pilot readiness**, not a false claim of live marketplace operation.

## Product definition

**User promise:** A buyer can request a bounded, evidence-backed answer to one observable product question; a responder can capture proof against a checklist; a moderator can approve or reject it; and the system preserves a reviewable receipt.

**Initial wedge:** one narrow vertical, one evidence type, one country/legal context, one fixed price, and one buyer/responder pair. The first paid test must be manually supervised. Broad marketplace liquidity, automated matching, autonomous AI decisions, and cross-border payouts are out of scope until the first wedge clears its gates.

**Non-promises:** FactBounty does not certify a product, guarantee truth, provide legal advice, verify identity without a real identity provider, or claim a live payment/payout merely because a local simulator test passed.

## Target users and jobs

| User | Job | Required outcome |
|---|---|---|
| Buyer | Ask one narrow, observable question | Receives a bounded evidence pack with limitations and provenance |
| Responder | Capture evidence without exposing unnecessary personal data | Upload succeeds, challenge is visible, checklist is traceable |
| Moderator | Decide whether evidence meets the agreed scope | Decision, notes, and reason are immutable and auditable |
| Operator | Run the pilot safely | Can see queue, payment state, consent, errors, costs, and refunds |

## v0.1 scope lock

### Must ship for a supervised paid pilot

- One fixed-price offer with explicit question, checklist, delivery time, currency, refund rule, and acceptance criterion.
- Buyer consent and responder consent recorded before collection.
- Authenticated roles: buyer, responder, moderator, operator/admin.
- Durable database with migrations, backups, transaction boundaries, and a tested restore.
- Real payment provider integration in a test account first, including signed webhooks, idempotency, refunds, and reconciliation.
- Private object storage with server-side encryption, short-lived signed URLs, MIME/size limits, malware/quarantine hook, and deletion/retention job.
- Evidence receipt containing request ID, checklist version, challenge ID, object checksum, timestamps, reviewer decision, and disclosure/consent state.
- Moderator queue with explicit approve/reject/request-more-evidence decisions.
- Payout hold until approval, refund window expiry, and fraud/manual-review checks.
- Rate limits, CSRF/origin policy where applicable, audit logs, secret management, structured errors, and monitoring.
- Human-run support channel, incident contact, refund procedure, and privacy request procedure.

### Must not ship in v0.1

- Unsupervised matching or automatic acceptance.
- AI-generated factual verdicts presented as authoritative. The current checklist endpoint is a static demo and must remain labelled as such until a governed model/evaluation path exists.
- Public media URLs, permanent signed URLs, raw identity documents, or unnecessary location/device data.
- Multi-country tax/legal claims, open responder enrollment, instant payouts, or a public marketplace liquidity claim.
- Any “production-ready”, “certified”, “verified buyer”, or “background AI worker” wording without a fresh execution receipt.

## Critical product gaps found in the current implementation

| Gap | Current evidence | Product risk | Required closure |
|---|---|---|---|
| Production startup is blocked | `apps/factbounty/config.ts` throws in `NODE_ENV=production` | Cannot safely launch | Complete and independently test payment, webhook, payout, persistence, privacy, and operations gates; then remove the block only in a reviewed change. |
| Stripe adapter is test-shaped | `apps/factbounty/payments/stripe-adapter.ts` returns `cs_test_`, `re_test_`, and `tr_test_` values and does not verify signatures | False payment/revenue state | Use official Stripe SDK calls, verify signatures with the webhook secret, persist event IDs, reject replays, and reconcile asynchronously. |
| S3 verification is fixture-shaped | `verifyUploadedObject` returns a hard-coded ready object | Evidence can be marked ready without an upload | HEAD the exact object, verify owner/request metadata, checksum, size, MIME, encryption, and quarantine status before ready. |
| Local JSON store | `apps/factbounty/db/store.ts` stores Maps in a local JSON file | Corruption, lost writes, unsafe concurrency, weak access control | Use PostgreSQL/managed SQL with migrations, row-level authorization, unique idempotency keys, backups, and restore drills. |
| Demo mode defaults on | `FACTBOUNTY_DEMO_MODE` defaults true | Accidental demo behavior in a pilot | Require an explicit environment value; fail closed if demo mode is enabled outside development/test. |
| Static AI endpoint | `/api/ai/suggest-checklist` returns hard-coded suggestions | Misleading AI claim and weak fit | Rename to “demo checklist suggestions” or implement a governed model adapter with evals, citations, abstention, logging, and human approval. |
| Payout semantics | API releases a percentage directly from the provider abstraction | Financial, tax, and dispute exposure | Define a ledger, platform fee, responder balance, refund/chargeback rules, KYC/AML review, tax treatment, and provider-specific Connect/marketplace controls with counsel. |
| Consent/retention UX | Consent is represented in payloads but pilot operations are not proven | Privacy and evidence-rights risk | Add consent text/version, purpose, retention deadline, deletion flow, export flow, and per-object access audit. |

## Product acceptance gates

The product may move from local prototype to supervised pilot only when every P0 gate has a named evidence receipt. A passing unit test is necessary but not sufficient for a live gate.

| Gate | Priority | Pass evidence | Owner | Status |
|---|---:|---|---|---|
| Buyer payment | P0 | Test-mode payment + signed webhook + duplicate/replay test + reconciliation report | Payments | BLOCKED |
| Refund/chargeback | P0 | Refund, partial refund, chargeback/manual hold runbook and test receipt | Payments/Ops | BLOCKED |
| Responder payout | P0 | Provider test payout with beneficiary controls, hold/release proof, and ledger reconciliation | Payments/Legal | BLOCKED |
| Durable persistence | P0 | Migration, concurrent-write test, backup, restore, and access audit | Platform | BLOCKED |
| Evidence integrity | P0 | Upload → HEAD/checksum → quarantine → reviewer receipt test | Evidence | BLOCKED |
| Privacy | P0 | Data map, lawful basis/consent text, retention/delete/export test, DPA review | Privacy | BLOCKED |
| Auth and authorization | P0 | Role matrix, token expiry/revocation, object-level access tests | Security | PARTIAL |
| Abuse/fraud | P0 | Rate-limit, duplicate-account, suspicious evidence, and escalation playbook | Trust/Ops | BLOCKED |
| Human moderation | P0 | Two-person review sample, disagreement protocol, SLA, and appeal path | Operations | BLOCKED |
| Observability | P0 | Correlated logs, metrics, alerts, error budget, redaction check | Platform | BLOCKED |
| Accessibility | P1 | Keyboard/screen-reader smoke test for buyer/responder/moderator journeys | Frontend | PARTIAL |
| Support/refunds | P1 | Published contact, response target, refund wording, and incident template | Operations | BLOCKED |
| Legal/compliance | P0 | Jurisdiction/product-role review; no unsupported certification language | Legal | BLOCKED |
| Pilot demand | P0 | One consented real buyer and one paid bounded request | Founder | NOT STARTED |

## Instrumentation contract

Every pilot event must include `eventId`, `requestId`, actor role, timestamp, schema version, environment, and a redacted payload. Minimum events:

`offer_viewed`, `question_created`, `consent_recorded`, `checkout_started`, `payment_succeeded`, `payment_failed`, `webhook_received`, `request_funded`, `responder_assigned`, `challenge_issued`, `upload_started`, `upload_verified`, `evidence_submitted`, `moderation_started`, `evidence_approved`, `evidence_rejected`, `refund_requested`, `refund_completed`, `payout_held`, `payout_released`, `deletion_requested`, `deletion_completed`, `support_contacted`, `incident_opened`.

Never log raw media, payment secrets, authentication tokens, full identity documents, or unredacted personal data. Keep a separate immutable event receipt and an operationally deletable application record where legal requirements require deletion.

## Pilot success and kill criteria

The first pilot is an evidence-gathering experiment, not a scale launch.

**Success threshold:** one real buyer completes consent and pays for the fixed scope; delivery meets the stated SLA; a moderator can reproduce the evidence receipt; direct labor and provider cost are recorded; buyer either accepts the result or gives a specific correction; no P0 privacy/security/payment incident occurs.

**Expansion threshold:** repeat payment or a second paid request from the same or a comparable buyer, positive value evidence, and contribution margin measured after responder payout, review labor, storage, support, refunds, and payment fees.

**Kill conditions:** refusal to pay after seeing the free substitute; evidence cannot be verified; reviewer disagreement is unresolved; total labor makes the fixed price uneconomic; a payment/payout cannot be reconciled; consent or deletion cannot be honoured; or the buyer reports no decision value. A failed pilot is a valid result and must remain recorded.

## 30/60/90-day execution plan

### Days 0–30: make the supervised pilot safe

- Select one vertical and one observable question.
- Rewrite offer, limitations, refund policy, and consent text.
- Replace “100% complete” language with prototype/readiness language.
- Implement persistent-store interface and migration plan; do not cut over without backup/restore proof.
- Implement real test-provider webhook verification and idempotency path behind feature flags.
- Implement object HEAD/checksum/quarantine verification.
- Add event ledger, correlation IDs, redaction, and operator dashboard.
- Run one internal synthetic end-to-end drill and one security/privacy tabletop.

### Days 31–60: run and learn from paid pilots

- Contact only lawfully reachable, consented prospects in the chosen vertical.
- Show the free substitute, then offer the bounded paid request.
- Run 3–5 supervised paid requests only if the first clears the success threshold.
- Record delivery hours, correction rate, acceptance, refund/dispute, provider cost, and support load.
- Review every evidence receipt manually; sample reviewer agreement.
- Pause immediately on any P0 gate regression.

### Days 61–90: decide product direction

- Repeat to a 20-request cohort only after positive first-request evidence.
- Compare buyer retention, repeat purchase, contribution margin, and responder supply.
- Decide one of: kill, remain managed service, or build the narrowest self-serve slice.
- Publish a consented case study only after permission and privacy review.
- Re-score the idea using observed evidence; do not backfill validation into prior scores.

## Launch checklist

- [ ] Product boundary and non-promises approved.
- [ ] One fixed offer and one acceptance criterion.
- [ ] Payment, refund, payout, and tax review complete.
- [ ] Persistent store, backup, restore, and access audit complete.
- [ ] Evidence integrity and deletion tests complete.
- [ ] Role/auth/object authorization tests complete.
- [ ] Monitoring, alerts, redaction, and incident response ready.
- [ ] Support/refund contact reachable.
- [ ] One human-owned pilot owner and one backup.
- [ ] One real buyer consented and paid.

Until all P0 boxes are checked, the correct label remains **LOCAL PROTOTYPE / SUPERVISED PILOT NOT YET CLEARED**.
