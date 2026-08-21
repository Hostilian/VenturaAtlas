# EUDR API surface

Status: **partial official map; exact WSDL/schema package still requires fixture-level inspection**

## Established

- The Information System supports submission and management of due diligence statements (DDS).
- The Commission operates a LIVE environment with legal value and an ACCEPTANCE replica with no legal value.
- Automated APIs exist and received updated technical specifications in July 2026.
- Geolocation files can be tested independently for system compatibility.

## Operation inventory

| Capability | Status | Evidence / next check |
|---|---|---|
| Create/submit DDS | OFFICIAL, operation signature not captured | Information System launch; inspect current API package |
| Manage/query DDS | OFFICIAL at capability level | Same |
| Amend/update | UNKNOWN | Capture exact operation, permitted states, and legal effect |
| Retract/withdraw | UNKNOWN | Capture exact operation and state guards |
| Status polling | HYPOTHESIS | Confirm response model and polling limits |
| Bulk submission | UNKNOWN | Find hard payload/record/rate limits |
| Webhooks/callbacks | UNKNOWN | Do not claim absent until current API docs are inspected |
| Service accounts | UNKNOWN | Record auth principal, delegation, and certificate rules |
| Idempotency | UNKNOWN | Test duplicate submissions in ACCEPTANCE |
| Retry/backoff | UNKNOWN | Derive only from published errors or controlled tests |

## Auth and environments

| Question | Current answer |
|---|---|
| LIVE endpoint | Exists; filings may have legal value |
| ACCEPTANCE endpoint | Exists; training/replica, no legal value |
| Authentication mechanism | UNKNOWN in this slice |
| Production onboarding test | UNVERIFIED; do not call it certification |
| Sandbox-production fidelity | UNMEASURED |

Primary sources:

- https://environment.ec.europa.eu/news/eu-deforestation-regulation-information-system-launches-2024-12-06_en
- https://environment.ec.europa.eu/news/commission-updates-product-scope-and-tools-support-eudr-2026-07-13_en

