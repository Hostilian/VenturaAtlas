# Venture Atlas OS — Deployment & Production Guide

## Deployment Architecture

Venture Atlas OS employs automated continuous deployment for both the public static site and the cloud control plane:

### 1. Static Presentation Plane (GitHub Pages)
- **Trigger:** Any push to `main` branch or manual trigger via GitHub Actions workflow (`.github/workflows/deploy-pages.yml`).
- **Steps:**
  1. `npm run quality` — Validates schema, JS syntax, unit tests, and repository consistency.
  2. `npm run build-site` — Stages allowlisted files into `_site/`.
  3. `actions/upload-pages-artifact` — Bundles static site.
  4. `actions/deploy-pages` — Deploys to `https://hostilian.github.io/VenturaAtlas/`.

### 2. Cloud Control Plane (GCP Cloud Run Jobs)
- **Container Build:** `cloud-control-plane/Dockerfile`
- **Terraform Provisions:** Managed in `cloud-control-plane/terraform/main.tf`.
- **Secrets:** Injected via GCP Secret Manager (`OPENROUTER_API_KEYS`, `ANTHROPIC_API_KEYS`, `ACTIVE_API_KEYS`, `DEEPSEEK_API_KEYS`, `GITHUB_TOKEN`).
