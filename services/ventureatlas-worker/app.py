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
from http.server import HTTPServer, BaseHTTPRequestHandler
from config import PORT, WORKER_AUTH_TOKEN

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))

class TaskWorkerHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_GET(self):
        if self.path in ("/health", "/ready"):
            self._send_json(200, {
                "status": "healthy",
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
        
        if not is_dev and (not expected_token or expected_token == "secret-internal-token" or auth_hdr != expected_token):
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
            "/tasks/publish": ["node", os.path.join(ROOT, "scripts", "build-repository-meta.js")],
            "/tasks/maintenance": ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
        }

        if path in task_cmd_map:
            import subprocess
            try:
                res = subprocess.run(task_cmd_map[path], capture_output=True, text=True, cwd=ROOT)
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
