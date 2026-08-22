# Technical Blueprint — BatteryDuty -- V2G Battery-Use Rights & Wear Clearinghouse

## System

- **Exact System:** Build a web application and bounded workflow for BatteryDuty -- V2G Battery-Use Rights & Wear Clearinghouse: battery-duty receipts, operating envelopes, wear allocation, and settlement exports.

### Automatic Work
- import charger and BMS exports
- normalize battery identifiers
- compute agreed throughput
- flag out-of-envelope events
- assemble receipts
- generate dispute packets

### Human Approval
- warranty conclusions
- settlement sign-off
- exception resolution
- contractual overrides

### Model Capabilities
- structured extraction
- evidence summarization
- uncertainty handling
- receipt drafting

### Tools And Integrations
- database
- object storage
- import jobs
- email/webhooks
- signed exports

### Knowledge Sources
- customer-authorized exports
- contract terms
- OEM warranty docs
- charging telemetry

### Suggested Stack
- TypeScript frontend
- API service
- PostgreSQL
- object storage
- background job queue

### Components
- web UI
- API service
- reconciliation worker
- evidence store
- billing

### Data Flow
- upload -> validation -> normalization -> settlement logic -> human review -> export

### Api Endpoints
- POST /fleets
- POST /dispatches
- GET /receipts/:id
- POST /receipts/:id/sign
- GET /exports/:id

### Database Entities
- Fleet
- Battery
- Dispatch
- Evidence
- Receipt
- Exception
- Settlement

- **Authentication:** Org roles with passkeys or OAuth/OIDC.
- **Payments:** Hosted checkout and webhook-confirmed billing.

### Analytics Events
- landing_view
- pilot_requested
- export_generated
- receipt_reviewed
- paid

### Logging Monitoring
- structured logs
- trace IDs
- reconciliation status
- cost and latency metrics

### Evaluation Criteria
- buyer trust
- dispute reduction
- accuracy of envelope tracking
- paid conversion

### Safety Guardrails
- authorized data only
- schema validation
- signed exports
- abstention on uncertain settlement claims

