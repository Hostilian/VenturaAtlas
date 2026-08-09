# Workflow: `/va-cloud-verify`

## Purpose
Verify Cloud Control Plane contracts, Cloud Run worker endpoints, fail-closed auth, and Secret Manager access.

## Execution Steps
1. Check `cloud-control-plane/app.py` and `services/ventureatlas-worker/app.py`.
2. Test unauthenticated POST request to verify 401 Unauthorized response.
3. Test authenticated GET `/health` endpoint to verify readiness.
