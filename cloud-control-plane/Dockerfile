# Venture Atlas OS — Production Cloud Control Plane Dockerfile
# Optimized for GCP Cloud Run / Cloud Run Jobs

FROM python:3.11-slim

# Install system dependencies (git, nodejs for npm build scripts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    nodejs \
    npm \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy python requirements if any, or install standard dependencies
RUN pip install --no-cache-dir requests urllib3 google-cloud-firestore google-cloud-secretmanager

# Copy full application codebase
COPY . .
RUN chmod 0500 cloud-control-plane/git_askpass.py

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    CLOUD_RUN_ENVIRONMENT=true

# Default entrypoint runs the cloud job runner
CMD ["python", "cloud-control-plane/job_runner.py"]
