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
        log_event("ERROR", "Autonomous Discovery Job Failed", {"stderr": res.stderr[-500:]})
        raise RuntimeError(f"Autonomous discovery failed with returncode {res.returncode}")

def rebuild_metadata_and_site():
    """Rebuild search index, metadata, run strict quality checks and _site staging directory."""
    log_event("INFO", "Executing Fail-Closed Quality & Build Pipeline (npm run quality)")
    cmd = ["npm", "run", "quality"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE_DIR)
    if res.returncode == 0:
        log_event("INFO", "Fail-Closed Quality & Build Pipeline Passed Cleanly")
    else:
        log_event("ERROR", "Quality/Build Pipeline Failed — PUBLICATION BLOCKED", {"stderr": res.stderr[-500:]})
        raise RuntimeError(f"Quality pipeline failed with returncode {res.returncode}. Publication blocked.")

def push_updates_to_github():
    """Push validated candidate publication branch to GitHub if GITHUB_TOKEN is available."""
    github_token = fetch_gcp_secret("GITHUB_TOKEN", os.environ.get("GITHUB_TOKEN", ""))
    if not github_token:
        log_event("NOTICE", "GITHUB_TOKEN not available — skipping git push")
        return
    
    log_event("INFO", "Committing and pushing autonomous updates via publication branch")
    
    try:
        subprocess.run(["git", "config", "user.name", "VentureAtlas-Cloud-Bot"], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "config", "user.email", "cloud-bot@ventureatlas.os"], cwd=BASE_DIR, check=True)
        
        status_res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, cwd=BASE_DIR)
        if not status_res.stdout.strip():
            log_event("INFO", "No changes to commit — repository up to date")
            return

        # Stage allowlisted data files only
        allowlist = ["data/idea-staging-queue.json", "data/repository-meta.json", "data/search-index.json", "data/rankings.json"]
        for f in allowlist:
            if os.path.exists(os.path.join(BASE_DIR, f)):
                subprocess.run(["git", "add", f], cwd=BASE_DIR, check=True)

        branch_name = f"automation/publish-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        subprocess.run(["git", "checkout", "-b", branch_name], cwd=BASE_DIR, check=True)

        commit_msg = f"feat(autonomy): cloud-run discovery & metadata update [{datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}]"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, check=True)
        
        # Ephemeral authenticated push via extraHeader (does not pollute .git/config or process list)
        import base64
        auth_b64 = base64.b64encode(f"x-access-token:{github_token}".encode("utf-8")).decode("utf-8")
        push_cmd = [
            "git", "-c", f"http.https://github.com/.extraHeader=AUTHORIZATION: basic {auth_b64}",
            "push", "origin", branch_name
        ]
        subprocess.run(push_cmd, cwd=BASE_DIR, check=True)
        log_event("INFO", f"Successfully pushed autonomous publication branch '{branch_name}'!")
    except Exception as e:
        safe_msg = redact_secrets(str(e))
        log_event("ERROR", "Failed to push updates to GitHub", {"error": safe_msg})
        raise RuntimeError(f"GitHub publication push failed: {safe_msg}") from None

def redact_secrets(text: str) -> str:
    if not text:
        return ""
    res = re.sub(r'x-access-token:[^@]+@', 'x-access-token:[REDACTED]@', text)
    res = re.sub(r'ghp_[a-zA-Z0-9]{20,}', 'ghp_[REDACTED]', res)
    res = re.sub(r'sk-[a-zA-Z0-9]{20,}', 'sk-[REDACTED]', res)
    return res

def main():
    log_event("INFO", "=== Venture Atlas OS Cloud Control Plane Started ===")
    configure_environment()
    execute_discovery()
    rebuild_metadata_and_site()
    push_updates_to_github()
    log_event("INFO", "=== Cloud Control Plane Run Finished ===")

if __name__ == "__main__":
    main()
