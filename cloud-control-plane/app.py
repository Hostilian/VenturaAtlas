import os
import sys
import json
import datetime
import subprocess
import shutil
import threading
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
import config
from auth import verify_worker_auth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from va_runtime.process_lock import process_file_lock
from va_runtime.redaction import redact_secrets

app = FastAPI(title="VentureAtlas Cloud Control Plane", version="2.4.0")
TASK_LOCK = threading.Lock()
WRITER_LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "repository-writer.lock")
TASK_TIMEOUT_SECONDS = int(os.environ.get("VA_WORKER_TASK_TIMEOUT_SECONDS", "900"))

class TaskResponse(BaseModel):
    runId: str
    task: str
    status: str
    exitCode: int
    startedAt: str
    endedAt: str
    outputTail: str

@app.get("/healthz")
def health_check():
    return {
        "status": "live",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "service": "ventureatlas-cloud-control-plane",
        "version": "2.4.0"
    }

@app.get("/ready")
def readiness_check():
    failures = []
    token = os.environ.get("WORKER_AUTH_TOKEN", config.WORKER_AUTH_TOKEN)
    if os.environ.get("ENVIRONMENT", "production").lower() != "development" and (
        not token or token in {"secret-internal-token", "changeme", "placeholder"}
    ):
        failures.append("worker authentication is not configured")
    for executable in (sys.executable, "node"):
        if executable != sys.executable and not shutil.which(executable):
            failures.append(f"missing executable: {executable}")
    for command in TASK_CMD_MAP.values():
        script = command[1] if len(command) > 1 and os.path.isabs(command[1]) else None
        if script and not os.path.exists(script):
            failures.append(f"missing task script: {script}")
    if TASK_LOCK.locked():
        failures.append("repository writer is busy")
    else:
        try:
            with process_file_lock(WRITER_LOCK_PATH, timeout_seconds=0):
                pass
        except TimeoutError:
            failures.append("repository writer is busy")
    data_dir = os.path.join(ROOT, "data")
    for name in ("ideas.json", "sources.json", "rankings.json"):
        path = os.path.join(data_dir, name)
        try:
            with open(path, "r", encoding="utf-8") as handle:
                json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            failures.append(f"canonical data unavailable: {name}: {type(exc).__name__}")
    if not os.access(data_dir, os.W_OK):
        failures.append("repository data directory is not writable")
    if failures:
        raise HTTPException(status_code=503, detail={"status": "not_ready", "failures": failures})
    return {"status": "ready", "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}

TASK_CMD_MAP = {
    "discover": [sys.executable, os.path.join(ROOT, "scripts", "autonomous-idea-generator.py")],
    "evidence": [sys.executable, os.path.join(ROOT, "scripts", "build_public_sources.py")],
    "score": [sys.executable, os.path.join(ROOT, "scripts", "va-ranker.py"), "--update"],
    "redteam": [sys.executable, os.path.join(ROOT, "scripts", "check_privacy.py")],
    "artifacts": ["node", os.path.join(ROOT, "scripts", "build-public-artifact.js")],
    "maintenance": ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
}

@app.post("/tasks/{task_name}", dependencies=[Depends(verify_worker_auth)], response_model=TaskResponse)
def execute_task(task_name: str):
    if task_name not in TASK_CMD_MAP:
        raise HTTPException(status_code=404, detail=f"Task '{task_name}' not found. Available: {list(TASK_CMD_MAP.keys())}")

    start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run_id = f"task-{task_name}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"

    cmd = TASK_CMD_MAP[task_name]
    if not TASK_LOCK.acquire(blocking=False):
        raise HTTPException(status_code=409, detail="another repository writer task is active")
    try:
        try:
            with process_file_lock(WRITER_LOCK_PATH, timeout_seconds=0):
                res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, timeout=TASK_TIMEOUT_SECONDS)
        except TimeoutError:
            raise HTTPException(status_code=409, detail="another repository writer process is active")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail={"runId": run_id, "task": task_name, "status": "failed", "reason": "timeout"})
    finally:
        TASK_LOCK.release()
    end_time = datetime.datetime.now(datetime.timezone.utc).isoformat()

    status = "succeeded" if res.returncode == 0 else "failed"
    tail = redact_secrets(res.stdout[-300:] if res.stdout else (res.stderr[-300:] if res.stderr else ""))

    if res.returncode != 0:
        raise HTTPException(status_code=500, detail={
            "runId": run_id,
            "task": task_name,
            "status": "failed",
            "exitCode": res.returncode,
            "startedAt": start_time,
            "endedAt": end_time,
            "outputTail": tail
        })

    return TaskResponse(
        runId=run_id,
        task=task_name,
        status=status,
        exitCode=res.returncode,
        startedAt=start_time,
        endedAt=end_time,
        outputTail=tail
    )
