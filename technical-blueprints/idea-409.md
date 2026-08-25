# Technical Blueprint — SubsidySignal -- Public Aid Buying-Signal Intelligence

## System

- **Exact System:** Weekly curated brief: company name, aid event, published purpose, amount, scheme, commercial relevance note, confidence. Sell by territory + vertical. No fabricated contact intent.

### Automatic Work
- intake user request and validate input parameters
- parse and structure domain artifacts
- route notifications to matched participants
- log telemetry and generate verification summaries

### Human Approval
- initial customer onboarding review
- dispute and refund decisions
- high-impact exception handling

### Suggested Stack
- Frontend: Static HTML/TypeScript or Next.js web interface
- Backend: Serverless API (Node.js/Python) + PostgreSQL or SQLite
- Storage: Cloudflare R2 / AWS S3 for evidence documents
- Messaging: Twilio SMS / WhatsApp API / Postmark email
- Payments: Stripe Connect / Hosted Checkout

### Components
- Intake form / client portal
- Matching and routing engine
- Admin verification console
- Notification dispatcher
- Billing and escrow ledger

### Data Flow
- Request Submission -> Validation -> Match Query -> Candidate Notification -> Acceptance -> Delivery -> Payout

### Safety Guardrails
- Input sanitization and rate limiting
- Explicit authorization checks on all operations
- Audit logging of all transactions and state changes
