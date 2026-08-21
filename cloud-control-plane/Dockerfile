# Venture Atlas OS — Production Cloud Control Plane Dockerfile
# Optimized for GCP Cloud Run / Cloud Run Jobs

FROM node:22-bookworm-slim AS node-runtime

FROM python:3.11-slim

# Install system dependencies. Node 22 is copied from the official image below;
# Debian's default nodejs package is too old for package.json's runtime contract.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && node --version \
 && npm --version

WORKDIR /app

# Copy dependency specifications first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy python requirements if any, or install standard dependencies
RUN pip install --no-cache-dir requests urllib3 google-cloud-firestore google-cloud-secretmanager google-cloud-storage

# Copy full application codebase
COPY . .
RUN chmod 0500 cloud-control-plane/git_askpass.py

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    CLOUD_RUN_ENVIRONMENT=true

# Default entrypoint runs the cloud job runner
CMD ["python", "cloud-control-plane/job_runner.py"]
