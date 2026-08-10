# Venture Atlas OS — Cloud Deployment Blueprint

## Unattended GCP Production Cloud Control Plane
- **Cloud Run Jobs:** Executes `cloud-control-plane/Dockerfile` container.
- **Secret Manager:** Provider pools for OpenRouter, Anthropic, Active, DeepSeek, NVIDIA NIM, and Cohere, plus `GITHUB_TOKEN`.
- **Cloud Scheduler:** Triggers job every 2 hours.
- **Terraform:** `cloud-control-plane/terraform/main.tf`.

The job uses one task with parallelism 1 to prevent overlapping repository writers. Within that task, idea workers and a bounded provider fanout can run concurrently. The image must be referenced by digest and the scheduler service account receives only `roles/run.invoker` on the job.

This repository contains the deployment contract, not proof that a deployment exists. Supply the intended GCP project, an immutable worker image digest, and Secret Manager versions before applying Terraform. Do not assume the currently selected `gcloud` project is the intended production project.
