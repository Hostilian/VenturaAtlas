import os
from fastapi import Request, HTTPException, Security, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import config

security = HTTPBearer(auto_error=False)

def verify_worker_auth(
    credentials: HTTPAuthorizationCredentials = Security(security),
    x_worker_auth: str = Header(None, alias="X-Worker-Auth")
):
    is_dev = os.environ.get("ENVIRONMENT", "production").lower() == "development"
    expected_token = os.environ.get("WORKER_AUTH_TOKEN", config.WORKER_AUTH_TOKEN)

    token_provided = None
    if credentials and credentials.credentials:
        token_provided = credentials.credentials
    elif x_worker_auth:
        token_provided = x_worker_auth

    if not is_dev:
        if not expected_token or expected_token in ("secret-internal-token", "changeme", "placeholder"):
            raise HTTPException(status_code=401, detail="Fail-closed: Production worker token is unconfigured or using placeholder.")
        if not token_provided or token_provided != expected_token:
            raise HTTPException(status_code=401, detail="Unauthorized — Fail-closed worker authentication required.")
    return True
