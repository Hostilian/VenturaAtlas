#!/usr/bin/env python3
"""
Venture Atlas OS — Cloud Run Job Runner
=========================================
Hosted, unattended execution entrypoint for GCP Cloud Run Jobs.
Retrieves credentials from GCP Secret Manager, runs parallel discovery,
enforces ToS compliance, rebuilds derived metadata, and pushes commits
to GitHub Pages repository so research continues when laptop is OFF.
"""

import os
import sys
import json
import time
import datetime
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

def log_event(level: str, message: str, extra: dict = None):
    payload = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "severity": level,
        "service": "venture-atlas-cloud-runner",
        "message": message,
    }
    if extra:
        payload.update(extra)
    print(json.dumps(payload), flush=True)

def fetch_gcp_secret(secret_name: str, default: str = "") -> str:
    """Fetch secret from GCP Secret Manager if running in Cloud Run, else return env var."""
    env_val = os.environ.get(secret_name, "")
    if env_val:
        return env_val
    try:
        from google.cloud import secretmanager
        client = secretmanager.SecretManagerServiceClient()
        project_id = os.environ.get("GCP_PROJECT_ID", "venture-atlas-os")
        name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8").strip()
    except Exception:
        return default

def configure_environment():
    """Load API key pools from Secret Manager or Environment."""
    log_event("INFO", "Initializing Cloud Run Worker Environment")
    openrouter_keys = fetch_gcp_secret("OPENROUTER_API_KEYS", os.environ.get("OPENROUTER_API_KEY", ""))
    anthropic_keys = fetch_gcp_secret("ANTHROPIC_API_KEYS", os.environ.get("ANTHROPIC_API_KEY", ""))
    active_keys = fetch_gcp_secret("ACTIVE_API_KEYS", os.environ.get("ACTIVE_API_KEY", ""))
    deepseek_keys = fetch_gcp_secret("DEEPSEEK_API_KEYS", os.environ.get("DEEPSEEK_API_KEY", ""))
    
    if openrouter_keys:
        os.environ["OPENROUTER_API_KEYS"] = openrouter_keys
    if anthropic_keys:
        os.environ["ANTHROPIC_API_KEYS"] = anthropic_keys
    if active_keys:
        os.environ["ACTIVE_API_KEYS"] = active_keys
    if deepseek_keys:
        os.environ["DEEPSEEK_API_KEYS"] = deepseek_keys

def execute_discovery():
    """Run autonomous idea generator."""
    log_event("INFO", "Starting Autonomous Discovery Job Execution")
    cmd = [sys.executable, os.path.join(BASE_DIR, "scripts", "autonomous-idea-generator.py")]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE_DIR)
    if res.returncode == 0:
        log_event("INFO", "Autonomous Discovery Job Completed Successfully", {"output_tail": res.stdout[-300:]})
    else:
        log_event("ERROR", "Autonomous Discovery Job Encountered Warnings/Errors", {"stderr": res.stderr[-500:]})

def rebuild_metadata_and_site():
    """Rebuild search index, metadata, and _site staging directory."""
    log_event("INFO", "Rebuilding Derived Metadata & Site Artifacts")
    cmd = ["npm", "run", "build"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE_DIR, shell=True)
    if res.returncode == 0:
        log_event("INFO", "Build Pipeline Completed Successfully")
    else:
        log_event("ERROR", "Build Pipeline Failed", {"stderr": res.stderr[-500:]})

def push_updates_to_github():
    """Push new commits to GitHub main branch if GITHUB_TOKEN is available."""
    github_token = fetch_gcp_secret("GITHUB_TOKEN", os.environ.get("GITHUB_TOKEN", ""))
    if not github_token:
        log_event("NOTICE", "GITHUB_TOKEN not available — skipping git push")
        return
    
    log_event("INFO", "Committing and pushing autonomous updates to GitHub Pages repository")
    repo_url = f"https://x-access-token:{github_token}@github.com/Hostilian/VenturaAtlas.git"
    
    try:
        subprocess.run(["git", "config", "user.name", "VentureAtlas-Cloud-Bot"], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "config", "user.email", "cloud-bot@ventureatlas.os"], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "add", "."], cwd=BASE_DIR, check=True)
        
        status_res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, cwd=BASE_DIR)
        if not status_res.stdout.strip():
            log_event("INFO", "No changes to commit — repository up to date")
            return

        commit_msg = f"feat(autonomy): cloud-run discovery & metadata update [{datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}]"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "push", repo_url, "main"], cwd=BASE_DIR, check=True)
        log_event("INFO", "Successfully pushed autonomous updates to GitHub main branch!")
    except Exception as e:
        log_event("ERROR", "Failed to push updates to GitHub", {"error": str(e)})

def main():
    log_event("INFO", "=== Venture Atlas OS Cloud Control Plane Started ===")
    configure_environment()
    execute_discovery()
    rebuild_metadata_and_site()
    push_updates_to_github()
    log_event("INFO", "=== Cloud Control Plane Run Finished ===")

if __name__ == "__main__":
    main()
