import os
import sys
import json
import datetime
import subprocess
import shutil
import threading
import time
from typing import Any, Optional
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
import config
from auth import verify_worker_auth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from va_runtime.process_lock import process_file_lock
from va_runtime.atomic_io import atomic_write_json
from va_runtime.redaction import redact_secrets

app = FastAPI(title="VentureAtlas Cloud Control Plane", version="2.4.0")
TASK_LOCK = threading.Lock()
RUN_LOCK = threading.Lock()
RUNS: dict[str, dict[str, Any]] = {}
WRITER_LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "repository-writer.lock")
PROGRESS_PATH = os.path.join(ROOT, ".agent-state", "live-progress.json")
PROGRESS_EVENTS_PATH = os.path.join(ROOT, ".agent-state", "progress-events.ndjson")
TASK_TIMEOUT_SECONDS = int(os.environ.get("VA_WORKER_TASK_TIMEOUT_SECONDS", "900"))
WORKER_LOOP_INTERVAL_SECONDS = int(os.environ.get("VA_WORKER_LOOP_INTERVAL_SECONDS", "900"))
WORKER_LOOP_ENABLED = os.environ.get("VA_WORKER_LOOP_ENABLED", "1") not in {"0", "false", "False"}

class TaskResponse(BaseModel):
    runId: str
    task: str
    status: str
    exitCode: int
    startedAt: str
    endedAt: str
    outputTail: str

class RunSnapshot(BaseModel):
    runId: str
    task: str
    status: str
    progress: int
    startedAt: str
    updatedAt: str
    endedAt: str | None = None
    message: str = ""
    outputTail: str = ""


def _append_progress_event(event: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(PROGRESS_EVENTS_PATH), exist_ok=True)
    with open(PROGRESS_EVENTS_PATH, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=False) + "\n")


def _write_live_progress(snapshot: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(PROGRESS_PATH), exist_ok=True)
    atomic_write_json(PROGRESS_PATH, snapshot)
    _append_progress_event({
        "timestamp": snapshot["updatedAt"],
        "runId": snapshot["runId"],
        "task": snapshot["task"],
        "status": snapshot["status"],
        "progress": snapshot["progress"],
        "message": snapshot["message"],
    })


def _set_run(run_id: str, **patch: Any) -> dict[str, Any]:
    with RUN_LOCK:
        current = RUNS.get(run_id, {})
        current = {**current, **patch}
        RUNS[run_id] = current
    _write_live_progress(current)
    return current


def _task_progress(task_name: str, status: str, progress: int, started_at: str, message: str, ended_at: str | None = None, output_tail: str = "") -> dict[str, Any]:
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    payload = {
        "runId": f"loop-{task_name}",
        "task": task_name,
        "status": status,
        "progress": progress,
        "startedAt": started_at,
        "updatedAt": now,
        "endedAt": ended_at,
        "message": message,
        "outputTail": output_tail,
    }
    return payload


def _run_task_async(task_name: str, run_id: str) -> None:
    cmd = TASK_CMD_MAP[task_name]
    started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    _set_run(run_id, runId=run_id, task=task_name, status="running", progress=10, startedAt=started_at, updatedAt=started_at, endedAt=None, message=f"queued {task_name}", outputTail="")
    try:
        with process_file_lock(WRITER_LOCK_PATH, timeout_seconds=0):
            proc = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            tail: list[str] = []
            progress = 15
            _set_run(run_id, progress=progress, message=f"started {task_name}")
            last_emit = time.monotonic()
            while True:
                line = proc.stdout.readline() if proc.stdout else ""
                if line:
                    tail.append(line.rstrip())
                    tail = tail[-12:]
                    progress = min(95, progress + 3)
                    _set_run(run_id, progress=progress, message=line.strip()[:180], outputTail="\n".join(tail))
                    last_emit = time.monotonic()
                elif proc.poll() is not None:
                    break
                elif time.monotonic() - last_emit >= 15:
                    progress = min(95, progress + 1)
                    _set_run(run_id, progress=progress, message=f"still working on {task_name}", outputTail="\n".join(tail))
                    last_emit = time.monotonic()
                else:
                    time.sleep(0.25)
            return_code = proc.wait(timeout=5)
            ended_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            tail_text = redact_secrets("\n".join(tail)[-300:])
            final_status = "succeeded" if return_code == 0 else "failed"
            _set_run(
                run_id,
                status=final_status,
                progress=100 if return_code == 0 else progress,
                endedAt=ended_at,
                message=f"{task_name} {final_status}",
                outputTail=tail_text,
            )
            if return_code != 0:
                _append_progress_event({
                    "timestamp": ended_at,
                    "runId": run_id,
                    "task": task_name,
                    "status": "failed",
                    "progress": progress,
                    "message": tail_text or f"{task_name} failed",
                })
    except TimeoutError:
        ended_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        _set_run(run_id, status="failed", progress=progress if 'progress' in locals() else 10, endedAt=ended_at, message="repository writer is busy")
    except Exception as exc:
        ended_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        _set_run(run_id, status="failed", progress=10, endedAt=ended_at, message=f"{type(exc).__name__}: {exc}")
    finally:
        if TASK_LOCK.locked():
            TASK_LOCK.release()


def _worker_loop() -> None:
    loop_tasks = [t for t in ("discover", "evidence", "score", "maintenance") if t in TASK_CMD_MAP]
    while True:
        started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        loop_run_id = f"loop-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        _set_run(loop_run_id, runId=loop_run_id, task="loop", status="running", progress=0, startedAt=started_at, updatedAt=started_at, endedAt=None, message="starting background AI loop", outputTail="")
        for index, task_name in enumerate(loop_tasks, start=1):
            if not WORKER_LOOP_ENABLED:
                break
            step_run_id = f"{loop_run_id}-{task_name}"
            _run_task_async(task_name, step_run_id)
            _set_run(loop_run_id, progress=min(95, int(index / max(1, len(loop_tasks)) * 100)), message=f"completed {task_name}")
        ended_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        _set_run(loop_run_id, status="sleeping", progress=100, endedAt=ended_at, message=f"sleeping for {WORKER_LOOP_INTERVAL_SECONDS}s")
        time.sleep(max(5, WORKER_LOOP_INTERVAL_SECONDS))


@app.on_event("startup")
def start_worker_loop():
    if not WORKER_LOOP_ENABLED:
        return
    thread = threading.Thread(target=_worker_loop, name="ventureatlas-worker-loop", daemon=True)
    thread.start()


@app.get("/progress", response_model=RunSnapshot)
def current_progress():
    with RUN_LOCK:
        if RUNS:
            latest_key = sorted(RUNS.keys())[-1]
            return RUNS[latest_key]
    if os.path.exists(PROGRESS_PATH):
        with open(PROGRESS_PATH, "r", encoding="utf-8") as handle:
            return json.load(handle)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return {
        "runId": "idle",
        "task": "idle",
        "status": "idle",
        "progress": 0,
        "startedAt": now,
        "updatedAt": now,
        "endedAt": None,
        "message": "worker loop not started yet",
        "outputTail": "",
    }


@app.get("/tasks/{task_name}/status", response_model=RunSnapshot)
def task_status(task_name: str):
    matches = [run for run in RUNS.values() if run.get("task") == task_name]
    if matches:
        return sorted(matches, key=lambda r: r.get("updatedAt", ""))[-1]
    raise HTTPException(status_code=404, detail=f"No run recorded for task '{task_name}'")

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

@app.post("/tasks/{task_name}", dependencies=[Depends(verify_worker_auth)])
def execute_task(task_name: str, background_tasks: BackgroundTasks = BackgroundTasks()):
    if task_name not in TASK_CMD_MAP:
        raise HTTPException(status_code=404, detail=f"Task '{task_name}' not found. Available: {list(TASK_CMD_MAP.keys())}")

    start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run_id = f"task-{task_name}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"
    if not TASK_LOCK.acquire(blocking=False):
        raise HTTPException(status_code=409, detail="another repository writer task is active")
    _set_run(run_id, runId=run_id, task=task_name, status="queued", progress=5, startedAt=start_time, updatedAt=start_time, endedAt=None, message=f"queued {task_name}", outputTail="")
    background_tasks.add_task(_run_task_async, task_name, run_id)
    return {
        "runId": run_id,
        "task": task_name,
        "status": "queued",
        "startedAt": start_time,
        "progressUrl": "/progress",
        "runStatusUrl": f"/tasks/{task_name}/status",
    }
