# Technical Blueprint — HeatProof -- Retrofit Outcome Clearinghouse

## System

- **Exact System:** Build a web application and bounded workflow for HeatProof -- Retrofit Outcome Clearinghouse: measured retrofit outcomes, weather normalization, and settlement-grade reports.

### Automatic Work
- import meter and weather data
- compare sold vs measured performance
- draft outcome statements
- flag likely causes
- prepare dispute packets

### Human Approval
- remediation conclusions
- legal or warranty claims
- disputed measurements
- final publication

### Model Capabilities
- structured analysis
- report drafting
- uncertainty handling
- cause attribution support

### Tools And Integrations
- database
- object storage
- meter APIs or CSV import
- weather data
- email/webhooks

### Knowledge Sources
- customer-authorized data
- product specs
- commissioning notes
- warranty terms

### Suggested Stack
- TypeScript frontend
- API service
- PostgreSQL
- background jobs
- object storage

### Components
- web UI
- evidence store
- reconciliation engine
- report export
- billing

### Data Flow
- upload -> validate -> normalize -> compare -> review -> export

### Api Endpoints
- POST /projects
- POST /projects/:id/runs
- GET /runs/:id
- GET /exports/:id
- POST /runs/:id/approve

### Database Entities
- Project
- Property
- MeterReading
- WeatherSeries
- Outcome
- Evidence
- Decision

- **Authentication:** OIDC or passkeys with organization roles.
- **Payments:** hosted checkout plus webhooks.

### Analytics Events
- landing_view
- project_started
- run_finished
- finding_reviewed
- paid

### Logging Monitoring
- structured logs
- trace IDs
- cost and latency metrics

### Evaluation Criteria
- buyer trust
- report accuracy
- dispute resolution value
- paid conversion

### Safety Guardrails
- authorized data only
- schema validation
- abstention on uncertain causal claims

