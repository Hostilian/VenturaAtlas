# Venture Atlas cloud control plane

This directory defines a bounded Cloud Run Job, a two-hour Cloud Scheduler trigger, private versioned staging storage, provider secrets, and dedicated worker/invoker service accounts. Unreviewed discovery stays private and Git publication is disabled by default.

## Deployment prerequisites

- A GCP project with billing enabled and enough IAM rights to enable APIs, create service accounts, build images, and deploy Cloud Run resources.
- Terraform 1.5+, `gcloud`, and an authenticated GCP account.
- Enabled versions in at least three of the six provider-pool secrets created by the bootstrap phase. Values are deliberately never copied from GitHub Actions secrets.

Run from PowerShell:

```powershell
./cloud-control-plane/deploy.ps1 -ProjectId YOUR_PROJECT_ID
```

The script fails closed in phases: it verifies billing, bootstraps Artifact Registry and empty Secret Manager containers, stops until at least three provider pools have versions, builds the worker in Cloud Build, resolves an immutable image digest, applies the full Terraform graph, executes the job, and runs the deployment preflight.

## Hermes off-machine path

Hermes is excluded from cloud routing unless `OLLAMA_BASE_URL` is a non-local HTTPS endpoint and `OLLAMA_AUTH_TOKEN` is available. Supply an authenticated Ollama-compatible endpoint with `-HermesBaseUrl`; add its bearer token as an enabled version of `va-ollama-auth-token`. This repository does not create a GPU host automatically because that commits to an infrastructure provider, GPU type, region, and recurring cost. The external endpoint must enforce TLS and authentication.

The worker reads secrets through its dedicated service identity at runtime. It does not place secret values in Terraform state, command arguments, logs, or the container image.
