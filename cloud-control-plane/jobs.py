import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloud-jobs")

def execute_discovery_run():
    logger.info("Executing cloud discovery run job...")
    # Cloud discovery job runs generator
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.join(ROOT, "scripts"))
    try:
        import autonomous_idea_generator as gen
        gen.main()
    except Exception as e:
        logger.error(f"Discovery run failed: {e}")

def execute_candidate_publication(candidate_id: str = None):
    logger.info(f"Executing publication for candidate {candidate_id or 'all'}...")
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    import subprocess
    cmd = ["node", os.path.join(ROOT, "scripts", "build-repository-meta.js")]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if res.returncode == 0:
        logger.info(f"Candidate publication completed successfully for {candidate_id or 'all'}")
    else:
        logger.error(f"Candidate publication failed: {res.stderr}")
        raise RuntimeError(f"Publication failed for {candidate_id}")

def execute_watchdog():
    logger.info("Executing system health watchdog check...")
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    import subprocess
    cmd = ["node", os.path.join(ROOT, "scripts", "check-repository-consistency.js")]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if res.returncode == 0:
        logger.info("System health watchdog check passed cleanly.")
    else:
        logger.error(f"Watchdog consistency check failed: {res.stderr}")
        raise RuntimeError("System watchdog check detected drift or errors.")
