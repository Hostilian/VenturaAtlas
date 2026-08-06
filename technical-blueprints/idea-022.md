# Technical Blueprint — Subscription Change Tracker

## System

- **Exact System:** Build a web application and bounded AI workflow for Subscription Change Tracker: Alert users to verified price, feature, plan, and policy changes. The product should keep inputs, evidence, decisions, outputs, and change history structured and auditable.

### Automatic Work
- normalize inputs
- retrieve allowed evidence
- run repeatable analyses
- generate structured drafts
- detect missing data
- prepare reports

### Human Approval
- external publishing
- payments or refunds
- high-impact decisions
- ambiguous failures
- legal or safety conclusions

### Model Capabilities
- strong structured output
- tool use
- retrieval
- multilingual reasoning where relevant
- calibrated uncertainty

### Tools And Integrations
- database
- object storage
- queue
- email/webhooks
- payment provider
- domain APIs after verification

### Knowledge Sources
- customer-authorized data
- official documentation
- versioned internal rules
- human-reviewed examples

### Suggested Stack
- static GitHub Pages for research front end
- TypeScript web app for product MVP
- PostgreSQL
- object storage
- background job queue
- provider-neutral model adapter

### Components
- web UI
- API service
- worker/evaluator
- policy engine
- evidence store
- billing
- analytics

### Data Flow
- input -> validation -> authorization -> deterministic checks -> AI analysis -> evaluation -> approval -> export -> telemetry

### Api Endpoints
- POST /projects
- POST /projects/:id/runs
- GET /runs/:id
- POST /runs/:id/approve
- GET /exports/:id
- POST /webhooks/provider

### Database Entities
- User
- Organization
- Project
- InputArtifact
- Run
- Evidence
- Finding
- Decision
- Approval
- Invoice
- Event

- **Authentication:** Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.

- **Payments:** Hosted checkout and webhooks; keep the provider authoritative for payment state.

### Analytics Events
- landing_view
- pricing_view
- project_started
- input_completed
- run_finished
- finding_reviewed
- exported
- paid
- returned

### Logging Monitoring
- structured logs
- trace IDs
- job status
- error budgets
- cost and latency metrics
- privacy-safe audit events

### Evaluation Criteria
- task success
- false-positive/negative rate
- human agreement
- latency
- cost per run
- user correction rate
- paid conversion

### Safety Guardrails
- authorized inputs only
- prompt-injection isolation
- output schemas
- abstention
- approval gates
- rate limits
- abuse reporting

### Failure Handling
- preserve partial evidence
- show actionable error
- retry only idempotent steps
- fallback provider when policy allows
- manual review queue

- **Mvp Complexity:** 3–8 weeks

### Build Sequence
- write acceptance tests
- model data and permissions
- build one vertical slice
- add billing boundary
- instrument analytics
- run paid pilot
- automate repeated manual work

- **First Prototype:** A static or command-line prototype that processes one authorized example and produces a reviewable evidence report.
