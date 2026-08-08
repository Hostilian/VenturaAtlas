#!/usr/bin/env python3
"""
Venture Atlas OS — Massive Continuous Orchestrator
===================================================
High-throughput continuous background orchestrator. Runs parallel discovery,
autonomous candidate scoring, ranking, search index generation, and quality
verification in a resilient infinite loop with auto-recovery.
"""

import os
import sys
import time
import datetime
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))

from va_runtime.atomic_io import read_json_safe

def log(msg):
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [MASSIVE-ORCHESTRATOR] {msg}", flush=True)

def run_command(cmd, cwd=BASE_DIR):
    try:
        res = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
        return res.returncode == 0, res.stdout, res.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    log("=== Venture Atlas Massive Continuous Work Engine Started ===")
    os.environ["IDEAS_PER_ITERATION"] = "5"
    os.environ["VA_DISCOVERY_MAX_CONCURRENCY"] = "5"

    iteration = 0
    while True:
        iteration += 1
        log(f"--- Starting Massive Work Iteration #{iteration} ---")

        # 1. Parallel Idea Generation
        log("Running parallel discovery workers...")
        ok, out, err = run_command("python scripts/autonomous-idea-generator.py")
        if ok:
            log("Discovery run completed successfully.")
        else:
            log(f"Discovery run warning: {err.strip()[:200]}")

        # 2. Migration & Candidate Sanitization
        log("Running candidate ID migration & data sanitization...")
        run_command("python scripts/migrations/migrate-staging-candidate-ids.py")

        # 3. Multi-dimensional Ranking
        log("Running multi-dimensional ranker...")
        ok_r, out_r, err_r = run_command("python scripts/va-ranker.py")
        if ok_r:
            log("Ranker completed successfully.")

        # 4. Search Index & Repository Metadata Update
        log("Rebuilding search index and repository metadata...")
        run_command("npm run generate")

        # 5. State Audit
        queue_path = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
        queue = read_json_safe(queue_path, default_if_missing=[])
        ideas_path = os.path.join(BASE_DIR, "data", "ideas.json")
        ideas_raw = read_json_safe(ideas_path, default_if_missing={"ideas": []})
        ideas_list = ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw

        log(f"Portfolio Status: {len(ideas_list)} Canonical Ideas | {len(queue)} Staged Candidates | Total: {len(ideas_list) + len(queue)}")

        # 6. Source Quality Verification
        log("Running quality verification gate...")
        ok_q, out_q, err_q = run_command("npm run quality:source")
        if ok_q:
            log("Quality verification gate: PASSED 100% GREEN.")
        else:
            log(f"Quality gate issue: {err_q.strip()[:200]}")

        log(f"--- Iteration #{iteration} complete. Sleeping 20s before next massive batch ---")
        time.sleep(20)

if __name__ == "__main__":
    main()
