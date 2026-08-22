# Technical Blueprint — WaterSpec -- Quality-Adjusted Reclaimed-Water Settlement

## System

- **Exact System:** Build a web application and bounded workflow for WaterSpec -- Quality-Adjusted Reclaimed-Water Settlement: quality bands, reliability tracking, and contract settlement.

### Automatic Work
- ingest quality readings
- normalize delivery periods
- compute reliability metrics
- flag exceptions
- export settlement sheets

### Human Approval
- contract disputes
- quality exceptions
- final settlement sign-off

### Model Capabilities
- structured extraction
- report drafting
- exception summarization

### Tools And Integrations
- database
- object storage
- import jobs
- webhooks/email

### Knowledge Sources
- customer-authorized readings
- contract terms
- project specs

### Suggested Stack
- TypeScript frontend
- API service
- PostgreSQL
- background jobs

### Components
- web UI
- ingestion worker
- evidence store
- settlement engine

### Data Flow
- upload -> normalize -> compare -> review -> export

### Api Endpoints
- POST /contracts
- POST /contracts/:id/readings
- GET /settlements/:id
- GET /exports/:id

### Database Entities
- Contract
- Reading
- QualityBand
- Evidence
- Settlement

- **Authentication:** org roles with passkeys or OIDC.
- **Payments:** hosted checkout and invoicing.

### Analytics Events
- landing_view
- project_started
- settlement_generated
- paid

### Logging Monitoring
- structured logs
- trace IDs
- status metrics

### Evaluation Criteria
- contract usefulness
- buyer trust
- repeat use
- paid conversion

### Safety Guardrails
- authorized data only
- schema validation
- abstention on uncertain quality claims

