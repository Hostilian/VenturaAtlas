#!/usr/bin/env python3
"""
Venture Atlas OS — Resilient Bounded Massive Orchestrator
=========================================================
High-throughput bounded background orchestrator. Runs parallel discovery,
autonomous candidate scoring, ranking, search index generation, and quality
verification with explicit run budgets, process locks, and step telemetry.
"""

import os
import sys
import time
import argparse
import datetime
import subprocess
import contextlib
from dataclasses import dataclass
from typing import Literal, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))

from va_runtime.atomic_io import read_json_safe
from va_runtime.publisher import process_file_lock

LOCK_PATH = os.path.join(BASE_DIR, ".agent-state", "locks", "massive-orchestrator.lock")

@dataclass
class StepResult:
    name: str
    status: Literal["succeeded", "failed", "skipped", "degraded"]
    returncode: Optional[int]
    duration_ms: int
    stdout_tail: str
    stderr_tail: str

def log(msg: str):
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [MASSIVE-ORCHESTRATOR] {msg}", flush=True)

def run_step(name: str, cmd: list, cwd: str = BASE_DIR, dry_run: bool = False) -> StepResult:
    start = time.time()
    if dry_run:
        log(f"[DRY-RUN] Would run step '{name}': {' '.join(cmd)}")
        return StepResult(name, "skipped", 0, 0, "", "")

    try:
        res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
        duration_ms = int((time.time() - start) * 1000)
        status = "succeeded" if res.returncode == 0 else "failed"
        stdout_tail = res.stdout.strip()[-300:] if res.stdout else ""
        stderr_tail = res.stderr.strip()[-300:] if res.stderr else ""
        return StepResult(name, status, res.returncode, duration_ms, stdout_tail, stderr_tail)
    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        return StepResult(name, "failed", -1, duration_ms, "", str(e))

def main():
    parser = argparse.ArgumentParser(description="Venture Atlas Bounded Massive Orchestrator")
    parser.add_argument("--once", action="store_true", help="Run a single orchestration iteration and exit")
    parser.add_argument("--continuous", action="store_true", help="Run continuous background orchestration")
    parser.add_argument("--max-iterations", type=int, default=1, help="Maximum number of iterations (default: 1)")
    parser.add_argument("--max-runtime-minutes", type=int, default=60, help="Maximum runtime budget in minutes")
    parser.add_argument("--sleep-seconds", type=int, default=20, help="Sleep duration between iterations in continuous mode")
    parser.add_argument("--dry-run", action="store_true", help="Log steps without executing sub-commands")
    args = parser.parse_args()

    max_iterations = 1 if args.once and not args.continuous else args.max_iterations
    start_time = time.time()
    max_runtime_sec = args.max_runtime_minutes * 60

    log("=== Venture Atlas Bounded Orchestrator Initialized ===")
    log(f"Config: max_iterations={max_iterations}, max_runtime_minutes={args.max_runtime_minutes}, dry_run={args.dry_run}")

    os.environ["IDEAS_PER_ITERATION"] = "5"
    os.environ["VA_DISCOVERY_MAX_CONCURRENCY"] = "5"

    with process_file_lock(LOCK_PATH):
        iteration = 0
        while iteration < max_iterations:
            iteration += 1
            elapsed = time.time() - start_time
            if elapsed >= max_runtime_sec:
                log(f"[BUDGET EXCEEDED] Max runtime of {args.max_runtime_minutes} minutes reached. Terminating orchestrator cleanly.")
                break

            log(f"--- Starting Bounded Work Iteration #{iteration}/{max_iterations} ---")

            # 1. Parallel Idea Generation
            log("Step 1/5: Running discovery workers...")
            r1 = run_step("discovery", [sys.executable, "scripts/autonomous-idea-generator.py"], dry_run=args.dry_run)
            if r1.status == "failed":
                log(f"[WARN] Discovery worker encountered errors: {r1.stderr_tail}")

            # 2. Candidate Sanitization & Migration
            log("Step 2/5: Sanitizing candidate IDs & queue metadata...")
            r2 = run_step("migration", [sys.executable, "scripts/migrations/migrate-staging-candidate-ids.py"], dry_run=args.dry_run)
            if r2.status == "failed":
                log(f"[ERROR] Migration failed: {r2.stderr_tail}")

            # 3. Multi-dimensional Ranking
            log("Step 3/5: Computing multi-dimensional rankings...")
            r3 = run_step("ranking", [sys.executable, "scripts/va-ranker.py"], dry_run=args.dry_run)

            # 4. Search Index & Metadata Generation
            log("Step 4/5: Building search index & repository metadata...")
            npm_cmd = ["npm.cmd", "run", "generate"] if os.name == "nt" else ["npm", "run", "generate"]
            r4 = run_step("generate", npm_cmd, dry_run=args.dry_run)

            # 5. Source Quality Verification Gate
            log("Step 5/5: Running quality verification gate...")
            npm_q_cmd = ["npm.cmd", "run", "quality:source"] if os.name == "nt" else ["npm", "run", "quality:source"]
            r5 = run_step("quality:source", npm_q_cmd, dry_run=args.dry_run)

            # State Telemetry Summary
            queue_path = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
            queue = read_json_safe(queue_path, default_if_missing=[])
            ideas_path = os.path.join(BASE_DIR, "data", "ideas.json")
            ideas_raw = read_json_safe(ideas_path, default_if_missing={"ideas": []})
            ideas_list = ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw

            log(f"Portfolio Status: {len(ideas_list)} Canonical Ideas | {len(queue)} Staged Candidates | Total: {len(ideas_list) + len(queue)}")
            log(f"Iteration #{iteration} Status: Discovery={r1.status}, Ranking={r3.status}, Metadata={r4.status}, Quality={r5.status}")

            if iteration < max_iterations and args.continuous:
                log(f"Sleeping {args.sleep_seconds}s before iteration #{iteration + 1}...")
                time.sleep(args.sleep_seconds)

    log("=== Venture Atlas Bounded Orchestrator Completed ===")

if __name__ == "__main__":
    main()
