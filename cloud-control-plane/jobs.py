import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloud-jobs")

def execute_discovery_run():
    logger.info("Executing cloud discovery run job...")
    # Cloud discovery job runs generator
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    import subprocess
    cmd = [sys.executable, os.path.join(ROOT, "scripts", "autonomous-idea-generator.py")]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, timeout=900)
    if res.returncode != 0:
        logger.error("Discovery run failed: %s", res.stderr[-500:])
        raise RuntimeError(f"Discovery run failed with return code {res.returncode}")
    return res.returncode

def execute_candidate_publication(candidate_id: str = None):
    logger.info(f"Executing publication for candidate {candidate_id or 'all'}...")
    raise RuntimeError(
        "Cloud candidate publication is disabled: use the serialized publisher "
        "with an explicit reviewed CANONICALIZE receipt."
    )

def execute_watchdog():
    logger.info("Executing system health watchdog check...")
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    import subprocess
    cmd = ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, timeout=300)
    if res.returncode == 0:
        logger.info("System health watchdog check passed cleanly.")
    else:
        logger.error(f"Watchdog consistency check failed: {res.stderr}")
        raise RuntimeError("System watchdog check detected drift or errors.")
