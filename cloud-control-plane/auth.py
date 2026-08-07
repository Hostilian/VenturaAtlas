from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import config

security = HTTPBearer(auto_error=False)

def verify_worker_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not config.WORKER_AUTH_TOKEN:
        # Dev mode / unconfigured token -> allow for local testing
        return True
    if not credentials or credentials.credentials != config.WORKER_AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized worker access token")
    return True
