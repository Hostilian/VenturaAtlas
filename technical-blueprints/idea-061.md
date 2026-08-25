# Technical Blueprint — FactBounty — Buyer-Funded Product Proof Exchange

## System

- **Exact ystem:** AI Agentic Evidence Verification & Graph Construction Engine

- **Automatic ork:** Incoming media OCR, image authenticity pre-check, product categorization

- **Human pproval:** Final payout release and dispute arbitration

### Model apabilities
- Multimodal vision model (Gemini 1.5 / GPT-4o)
- OCR text extraction

### Tools nd ntegrations
- Stripe API
- Cloud Storage
- Vision API

### Knowledge ources
- Product catalogs
- Barcode databases
- Historical proof graph

### Suggested tack
- Node.js / TypeScript
- PostgreSQL
- Python AI microservice

### Components
- Bounty Exchange Web UI
- Verification Worker Microservice
- Public API

- **Data low:** Request -> Stripe Auth -> Notification -> Worker Upload -> Vision Check -> Release

### Api ndpoints
- POST /v1/bounties
- GET /v1/evidence/:id
- POST /v1/evidence/:id/submit

### Database ntities
- Users
- Bounties
- EvidenceSubmissions
- Transactions
- Products

- **Authentication:** Session cookie for web UI; API Key / x402 for agentic API

- **Payments:** Stripe Connect Custom / Express onboarding

### Analytics vents
- BountyCreated
- ProofSubmitted
- PayoutReleased
- DisputeOpened

### Logging onitoring
- Structured JSON logging
- Sentry error tracking

### Evaluation riteria
- Precision of AI pre-screening
- Time to completion
- Dispute rate

### Safety uardrails
- EXIF GPS removal
- CSAM image hashing filter
- PII redaction

### Failure andling
- Automatic refund on 48h timeout
- Human moderator escalation

- **Mvp omplexity:** Low — founder manually handles matching, review, and edge cases. No automated pipeline required for first 100 requests.

### Build equence
- Stripe setup
- Submission web form
- Worker upload page
- Admin dashboard

- **First rototype:** A single HTML page with: (a) a form to submit a product URL, question, and evidence template; (b) a Stripe Checkout link for €5; (c) a browser capture page that generates a random 6-digit code and records via MediaRecorder; (d) a Notion database where the founder reviews submissions and releases Stripe payouts manually. Entire prototype can be built and tested in 48 hours.
