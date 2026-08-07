from fastapi import FastAPI, Depends, BackgroundTasks
import config
from auth import verify_worker_auth
from health import get_health_status

app = FastAPI(title="VentureAtlas Cloud Control Plane", version="2.3.0")

@app.get("/healthz")
def healthz():
    return get_health_status()

@app.post("/tasks/discovery-run", dependencies=[Depends(verify_worker_auth)])
def run_discovery_task(background_tasks: BackgroundTasks):
    from jobs import execute_discovery_run
    background_tasks.add_task(execute_discovery_run)
    return {"status": "accepted", "job": "discovery_run"}

@app.post("/tasks/publish-candidate", dependencies=[Depends(verify_worker_auth)])
def run_publish_task(payload: dict, background_tasks: BackgroundTasks):
    from jobs import execute_candidate_publication
    candidate_id = payload.get("candidateId")
    background_tasks.add_task(execute_candidate_publication, candidate_id)
    return {"status": "accepted", "candidateId": candidate_id}

@app.post("/tasks/watchdog", dependencies=[Depends(verify_worker_auth)])
def run_watchdog_task(background_tasks: BackgroundTasks):
    from jobs import execute_watchdog
    background_tasks.add_task(execute_watchdog)
    return {"status": "accepted", "job": "watchdog"}
