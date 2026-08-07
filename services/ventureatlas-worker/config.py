"""
Venture Atlas Worker Service — Environment Configuration
"""
import os

PORT = int(os.environ.get("PORT", "8080"))
WORKER_AUTH_TOKEN = os.environ.get("WORKER_AUTH_TOKEN", "secret-internal-token")
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "venture-atlas-os")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "production")
