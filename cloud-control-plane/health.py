import time

_START_TIME = time.time()

def get_health_status() -> dict:
    return {
        "status": "healthy",
        "service": "ventureatlas-worker",
        "uptimeSeconds": round(time.time() - _START_TIME, 2),
    }
