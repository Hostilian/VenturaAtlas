"""
Venture Atlas Worker Service — HTTP Task Endpoints
===================================================
Production HTTP API for Cloud Tasks / Cloud Scheduler triggers.
Exposes authenticated task handlers for multi-stage autonomous pipeline.
"""

import os
import sys
import json
import datetime
import shutil
import threading
import hmac
from http.server import HTTPServer, BaseHTTPRequestHandler
from config import PORT, WORKER_AUTH_TOKEN

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
TASK_LOCK = threading.Lock()
TASK_TIMEOUT_SECONDS = int(os.environ.get("VA_WORKER_TASK_TIMEOUT_SECONDS", "900"))
PLACEHOLDER_TOKENS = {"secret-internal-token", "changeme", "placeholder"}

def authentication_valid(provided, expected, is_dev=False):
    return bool(is_dev or (expected and expected not in PLACEHOLDER_TOKENS and hmac.compare_digest(provided or "", expected)))

def readiness_failures():
    failures = []
    token = os.environ.get("WORKER_AUTH_TOKEN", WORKER_AUTH_TOKEN)
    is_dev = os.environ.get("ENVIRONMENT", "production").lower() == "development"
    if not is_dev and (not token or token in PLACEHOLDER_TOKENS):
        failures.append("worker authentication is not configured")
    if not shutil.which("node"):
        failures.append("missing executable: node")
    if not os.path.isdir(os.path.join(ROOT, "data")):
        failures.append("repository data directory is unavailable")
    return failures

class TaskWorkerHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_GET(self):
        if self.path == "/health":
            self._send_json(200, {
                "status": "live",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "service": "ventureatlas-worker"
            })
        elif self.path == "/ready":
            failures = readiness_failures()
            self._send_json(503 if failures else 200, {
                "status": "not_ready" if failures else "ready",
                "failures": failures,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "service": "ventureatlas-worker"
            })
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        # Strict fail-closed authentication check
        auth_hdr = self.headers.get("X-Worker-Auth", "")
        expected_token = os.environ.get("WORKER_AUTH_TOKEN", WORKER_AUTH_TOKEN)
        is_dev = os.environ.get("ENVIRONMENT", "production").lower() == "development"
        
        if not authentication_valid(auth_hdr, expected_token, is_dev):
            self._send_json(401, {"error": "Unauthorized — Fail-closed authentication required"})
            return

        path = self.path.rstrip("/")
        start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        run_id = f"worker-{path.split('/')[-1]}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        
        task_cmd_map = {
            "/tasks/discover": [sys.executable, os.path.join(ROOT, "scripts", "autonomous-idea-generator.py")],
            "/tasks/evidence": [sys.executable, os.path.join(ROOT, "scripts", "build_public_sources.py")],
            "/tasks/score": [sys.executable, os.path.join(ROOT, "scripts", "va-ranker.py"), "--update"],
            "/tasks/redteam": [sys.executable, os.path.join(ROOT, "scripts", "check_privacy.py")],
            "/tasks/artifacts": ["node", os.path.join(ROOT, "scripts", "build-public-artifact.js")],
            "/tasks/maintenance": ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
        }

        if path in task_cmd_map:
            import subprocess
            try:
                if not TASK_LOCK.acquire(blocking=False):
                    self._send_json(409, {"error": "another repository writer task is active"})
                    return
                try:
                    res = subprocess.run(
                        task_cmd_map[path], capture_output=True, text=True,
                        cwd=ROOT, timeout=TASK_TIMEOUT_SECONDS
                    )
                finally:
                    TASK_LOCK.release()
                end_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
                status = "succeeded" if res.returncode == 0 else "failed"
                self._send_json(200 if res.returncode == 0 else 500, {
                    "runId": run_id,
                    "task": path.split('/')[-1],
                    "status": status,
                    "exitCode": res.returncode,
                    "startedAt": start_time,
                    "endedAt": end_time,
                    "outputTail": (res.stdout[-300:] if res.stdout else res.stderr[-300:])
                })
            except subprocess.TimeoutExpired:
                end_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
                self._send_json(504, {
                    "runId": run_id, "task": path.split('/')[-1], "status": "failed",
                    "error": "task timeout", "startedAt": start_time, "endedAt": end_time
                })
            except Exception as e:
                end_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
                self._send_json(500, {
                    "runId": run_id,
                    "task": path.split('/')[-1],
                    "status": "failed",
                    "error": str(e),
                    "startedAt": start_time,
                    "endedAt": end_time
                })
        else:
            self._send_json(404, {"error": "Task endpoint not found"})

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, TaskWorkerHandler)
    print(f"[WORKER] Venture Atlas Worker Service running on port {PORT}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
