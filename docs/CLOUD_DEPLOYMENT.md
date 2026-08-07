# Venture Atlas OS — Cloud Deployment Blueprint

## Unattended GCP Production Cloud Control Plane
- **Cloud Run Jobs:** Executes `cloud-control-plane/Dockerfile` container.
- **Secret Manager:** Credentials (`OPENROUTER_API_KEYS`, `ANTHROPIC_API_KEYS`, `GITHUB_TOKEN`).
- **Cloud Scheduler:** Triggers job every 2 hours.
- **Terraform:** `cloud-control-plane/terraform/main.tf`.
