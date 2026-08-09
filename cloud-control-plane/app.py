import os
import sys
import datetime
import subprocess
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
import config
from auth import verify_worker_auth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

app = FastAPI(title="VentureAtlas Cloud Control Plane", version="2.4.0")

class TaskResponse(BaseModel):
    runId: str
    task: str
    status: str
    exitCode: int
    startedAt: str
    endedAt: str
    outputTail: str

@app.get("/healthz")
@app.get("/ready")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "service": "ventureatlas-cloud-control-plane",
        "version": "2.4.0"
    }

TASK_CMD_MAP = {
    "discover": [sys.executable, os.path.join(ROOT, "scripts", "autonomous-idea-generator.py")],
    "evidence": [sys.executable, os.path.join(ROOT, "scripts", "build_public_sources.py")],
    "score": [sys.executable, os.path.join(ROOT, "scripts", "va-ranker.py"), "--update"],
    "redteam": [sys.executable, os.path.join(ROOT, "scripts", "check_privacy.py")],
    "artifacts": ["node", os.path.join(ROOT, "scripts", "build-public-artifact.js")],
    "publish": ["node", os.path.join(ROOT, "scripts", "build-repository-meta.js")],
    "maintenance": ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
}

@app.post("/tasks/{task_name}", dependencies=[Depends(verify_worker_auth)], response_model=TaskResponse)
def execute_task(task_name: str):
    if task_name not in TASK_CMD_MAP:
        raise HTTPException(status_code=404, detail=f"Task '{task_name}' not found. Available: {list(TASK_CMD_MAP.keys())}")

    start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run_id = f"task-{task_name}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"

    cmd = TASK_CMD_MAP[task_name]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    end_time = datetime.datetime.now(datetime.timezone.utc).isoformat()

    status = "succeeded" if res.returncode == 0 else "failed"
    tail = res.stdout[-300:] if res.stdout else (res.stderr[-300:] if res.stderr else "")

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
