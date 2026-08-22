# Technical Blueprint — FlexCovenant -- Industrial Flexibility Performance Contract OS

## System

- **Exact System:** Build a web application and bounded workflow for FlexCovenant -- Industrial Flexibility Performance Contract OS: flexibility commitments, dispatch tracking, and settlement history.

### Automatic Work
- ingest dispatch events
- normalize site commitments
- compute performance against contract
- flag exceptions
- export settlement records

### Human Approval
- contractual exceptions
- payment disputes
- contract amendments

### Model Capabilities
- structured extraction
- report drafting
- exception summarization

### Tools And Integrations
- database
- queue
- object storage
- utility APIs or CSV import
- email/webhooks

### Knowledge Sources
- customer-authorized dispatch data
- contract terms
- utility program docs
- internal policy rules

### Suggested Stack
- TypeScript frontend
- API service
- PostgreSQL
- worker queue
- signed exports

### Components
- web UI
- dispatch worker
- evidence store
- settlement engine

### Data Flow
- commit -> dispatch -> measure -> review -> export

### Api Endpoints
- POST /sites
- POST /sites/:id/dispatches
- GET /contracts/:id
- GET /exports/:id

### Database Entities
- Site
- Contract
- Dispatch
- Evidence
- PerformanceEvent
- Settlement

- **Authentication:** OIDC or passkeys.
- **Payments:** hosted checkout and invoicing.

### Analytics Events
- landing_view
- assessment_requested
- dispatch_logged
- export_generated
- paid

### Logging Monitoring
- structured logs
- trace IDs
- status dashboards

### Evaluation Criteria
- buyer trust
- measurement accuracy
- repeat use
- paid conversion

### Safety Guardrails
- authorized data only
- schema validation
- abstention on uncertain settlement claims

