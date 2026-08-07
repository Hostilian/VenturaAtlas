# Venture Atlas OS — Operations Runbook

## Operational Commands

### Local Development & Testing
```bash
# Test multi-provider health check
python scripts/va_orchestrator.py --test

# Run single discovery pass
python scripts/autonomous-idea-generator.py

# Full build and quality suite
npm run ci
```

### Key Management & Secret Rotation
1. Update secrets in GCP Secret Manager:
   ```bash
   gcloud secrets versions add OPENROUTER_API_KEYS --data-file=keys.txt
   ```
2. For local testing, add comma-separated keys to `.env`:
   ```ini
   OPENROUTER_API_KEYS="sk-or-v1-key1,sk-or-v1-key2"
   ```

### Troubleshooting & Logs
- **Cloud Run Logs:** View logs in GCP Cloud Logging under service `venture-atlas-cloud-runner`.
- **Local Logs:** Inspect `.agent-state/logs/unattended-runner.log`.
