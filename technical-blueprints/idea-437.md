# Technical Blueprint — TradeScope -- Job-Level Legal Capability for Skilled Workers

## System

- **Exact System:** Build a web application and bounded workflow for TradeScope -- Job-Level Legal Capability for Skilled Workers: evidence capture, artifact generation, exception handling, and settlement exports.

### Automatic Work
- import source data
- normalize identifiers
- compute evidence artifacts
- flag exceptions
- draft exports

### Human Approval
- disputed conclusions
- contractual sign-off
- legal or regulatory assertions

### Model Capabilities
- structured extraction
- evidence summarization
- report drafting

### Tools And Integrations
- database
- object storage
- queue
- email/webhooks

### Knowledge Sources
- customer-authorized data
- contracts
- official docs
- internal rules

### Suggested Stack
- TypeScript frontend
- API service
- PostgreSQL
- background job queue
- signed exports

### Components
- web UI
- API service
- worker/evaluator
- evidence store
- billing

### Data Flow
- input -> validation -> normalization -> review -> export

### Api Endpoints
- POST /projects
- POST /projects/:id/runs
- GET /runs/:id
- GET /exports/:id

### Database Entities
- Project
- Evidence
- Finding
- Decision
- Export

- **Authentication:** org roles with passkeys or OAuth/OIDC.
- **Payments:** hosted checkout and webhooks.

### Analytics Events
- landing_view
- project_started
- run_finished
- export_generated
- paid

### Logging Monitoring
- structured logs
- trace IDs
- job status
- latency metrics

### Evaluation Criteria
- buyer trust
- evidence accuracy
- repeat use
- paid conversion

### Safety Guardrails
- authorized data only
- schema validation
- abstention on uncertain claims
