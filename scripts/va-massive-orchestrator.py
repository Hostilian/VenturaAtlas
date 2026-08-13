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
import json
import uuid
import re
import signal
from dataclasses import dataclass
from typing import Callable, Literal, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))

from va_runtime.atomic_io import atomic_write_json, read_json_safe
from va_runtime.publisher import process_file_lock
from va_runtime.semantic_utility import semantic_digest

LOCK_PATH = os.path.join(BASE_DIR, ".agent-state", "locks", "massive-orchestrator.lock")

@dataclass
class StepResult:
    name: str
    status: Literal["succeeded", "failed", "skipped", "degraded"]
    returncode: Optional[int]
    duration_ms: int
    stdout_tail: str
    stderr_tail: str

@dataclass(frozen=True)
class StepSpec:
    name: str
    command: list
    criticality: Literal["REQUIRED", "OPTIONAL", "DEGRADED_ALLOWED"]
    dependencies: tuple[str, ...] = ()
    timeout_seconds: int = 900

def log(msg: str):
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [MASSIVE-ORCHESTRATOR] {msg}", flush=True)

def redact_runtime_text(value: str) -> str:
    result = value or ""
    for pattern in [r"github_pat_[A-Za-z0-9_]{20,}", r"gh[pousr]_[A-Za-z0-9]{20,}", r"sk-[A-Za-z0-9_-]{20,}", r"(?i)(bearer\s+)[A-Za-z0-9._~-]{16,}"]:
        result = re.sub(pattern, lambda match: (match.group(1) if match.lastindex else "") + "[REDACTED]", result)
    return result

def run_step(name: str, cmd: list, cwd: str = BASE_DIR, dry_run: bool = False,
              timeout_seconds: int = 900) -> StepResult:
    start = time.time()
    if dry_run:
        log(f"[DRY-RUN] Would run step '{name}': {' '.join(cmd)}")
        return StepResult(name, "skipped", 0, 0, "", "")

    try:
        popen_kwargs = {
            "cwd": cwd,
            "stdout": subprocess.PIPE,
            "stderr": subprocess.PIPE,
            "text": True,
        }
        if os.name == "nt":
            popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            popen_kwargs["start_new_session"] = True
        process = subprocess.Popen(cmd, **popen_kwargs)
        try:
            stdout, stderr = process.communicate(timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            if os.name == "nt":
                subprocess.run(
                    ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                    capture_output=True, text=True, timeout=10,
                )
            else:
                os.killpg(process.pid, signal.SIGKILL)
            stdout, stderr = process.communicate(timeout=10)
            duration_ms = int((time.time() - start) * 1000)
            return StepResult(
                name, "failed", -1, duration_ms,
                redact_runtime_text((stdout or "").strip()[-300:]),
                f"BUDGET_EXHAUSTED: timeout after {timeout_seconds}s",
            )
        duration_ms = int((time.time() - start) * 1000)
        status = "succeeded" if process.returncode == 0 else "failed"
        stdout_tail = redact_runtime_text(stdout.strip()[-300:] if stdout else "")
        stderr_tail = redact_runtime_text(stderr.strip()[-300:] if stderr else "")
        return StepResult(name, status, process.returncode, duration_ms, stdout_tail, stderr_tail)
    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        return StepResult(name, "failed", -1, duration_ms, "", str(e))

def execute_iteration(step_specs: list[StepSpec], dry_run: bool = False,
                      runner: Callable[..., StepResult] = run_step,
                      content_probe: Callable[[], dict] | None = None,
                      deadline_monotonic: float | None = None) -> tuple[list[StepResult], str, dict]:
    """Execute one explicit DAG iteration and derive a truthful aggregate status."""
    results: list[StepResult] = []
    result_by_name: dict[str, StepResult] = {}
    spec_by_name = {spec.name: spec for spec in step_specs}
    before = content_probe() if content_probe else {}
    discovery_no_op = False
    for spec in step_specs:
        unknown_dependencies = [dep for dep in spec.dependencies if dep not in spec_by_name]
        if unknown_dependencies:
            result = StepResult(spec.name, "failed", -1, 0, "", f"unknown dependencies: {unknown_dependencies}")
        else:
            blocking = [
                dep for dep in spec.dependencies
                if result_by_name.get(dep) is None or result_by_name[dep].status != "succeeded"
            ]
            if blocking:
                result = StepResult(spec.name, "skipped", None, 0, "", f"blocked by dependencies: {', '.join(blocking)}")
            elif discovery_no_op and spec.name in {"migration", "ranking", "generate", "quality:source"}:
                result = StepResult(spec.name, "skipped", None, 0, "", "NO_OP: no semantic content delta")
            else:
                remaining = None if deadline_monotonic is None else deadline_monotonic - time.monotonic()
                if remaining is not None and remaining <= 0:
                    result = StepResult(
                        spec.name, "failed", None, 0, "",
                        "BUDGET_EXHAUSTED before required stage",
                    )
                else:
                    timeout_seconds = spec.timeout_seconds
                    if remaining is not None:
                        timeout_seconds = max(0.001, min(timeout_seconds, remaining))
                    result = runner(
                        spec.name, spec.command, cwd=BASE_DIR, dry_run=dry_run,
                        timeout_seconds=timeout_seconds
                    )
        results.append(result)
        result_by_name[spec.name] = result
        if spec.name == "discovery" and result.status == "succeeded" and content_probe:
            discovery_no_op = semantic_digest(before) == semantic_digest(content_probe())

    if dry_run:
        final_status = "DRY_RUN"
    elif any(
        result_by_name[spec.name].status != "succeeded"
        for spec in step_specs if spec.criticality == "REQUIRED" and
        not (discovery_no_op and result_by_name[spec.name].status == "skipped")
    ):
        final_status = "FAILED"
    elif any(result.status in {"failed", "degraded"} for result in results):
        final_status = "DEGRADED"
    else:
        final_status = "SUCCEEDED_NO_OP" if discovery_no_op else "SUCCEEDED_USEFUL"
    after = content_probe() if content_probe else before
    utility = {"outcome": "NO_OP" if semantic_digest(before) == semantic_digest(after) else "MATERIAL_CHANGE",
               "semanticRevisionBefore": semantic_digest(before), "semanticRevisionAfter": semantic_digest(after)}
    return results, final_status, utility


def _receipt(run_id: str, iteration: int, started_at: str, ended_at: str,
             specs: list[StepSpec], results: list[StepResult], final_status: str, utility: dict | None = None) -> dict:
    spec_by_name = {spec.name: spec for spec in specs}
    return {
        "schemaVersion": "1.0.0",
        "runId": run_id,
        "iteration": iteration,
        "startedAt": started_at,
        "endedAt": ended_at,
        "finalStatus": final_status,
        "utility": utility or {"outcome": "UNKNOWN"},
        "steps": [
            {
                "name": result.name,
                "criticality": spec_by_name[result.name].criticality,
                "dependencies": list(spec_by_name[result.name].dependencies),
                "status": result.status,
                "returncode": result.returncode,
                "durationMs": result.duration_ms,
                "stdoutTail": result.stdout_tail,
                "stderrTail": result.stderr_tail,
            }
            for result in results
        ]
    }


def content_snapshot() -> dict:
    ideas_raw = read_json_safe(os.path.join(BASE_DIR, "data", "ideas.json"), default_if_missing={"ideas": []})
    queue = read_json_safe(os.path.join(BASE_DIR, "data", "idea-staging-queue.json"), default_if_missing=[])
    return {"canonicalIdeas": ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw,
            "stagedIdeas": queue if isinstance(queue, list) else []}


def main() -> int:
    parser = argparse.ArgumentParser(description="Venture Atlas Bounded Massive Orchestrator")
    parser.add_argument("--once", action="store_true", help="Run a single orchestration iteration and exit")
    parser.add_argument("--continuous", action="store_true", help="Run continuous background orchestration")
    parser.add_argument("--max-iterations", type=int, default=1, help="Maximum number of iterations (default: 1)")
    parser.add_argument("--max-runtime-minutes", type=int, default=60, help="Maximum runtime budget in minutes")
    parser.add_argument("--sleep-seconds", type=int, default=20, help="Sleep duration between iterations in continuous mode")
    parser.add_argument("--dry-run", action="store_true", help="Log steps without executing sub-commands")
    parser.add_argument("--step-timeout-seconds", type=int, default=900, help="Per-child hard timeout")
    parser.add_argument("--receipt-dir", default=os.path.join(BASE_DIR, ".agent-state", "orchestrator-runs"))
    args = parser.parse_args()

    max_iterations = 1 if args.once and not args.continuous else args.max_iterations
    start_time = time.monotonic()
    max_runtime_sec = args.max_runtime_minutes * 60
    deadline_monotonic = start_time + max_runtime_sec

    log("=== Venture Atlas Bounded Orchestrator Initialized ===")
    log(f"Config: max_iterations={max_iterations}, max_runtime_minutes={args.max_runtime_minutes}, dry_run={args.dry_run}")

    ideas_per_iter = os.environ.get("IDEAS_PER_ITERATION", "15")
    max_concurrency = os.environ.get("VA_DISCOVERY_MAX_CONCURRENCY", "15")
    os.environ["IDEAS_PER_ITERATION"] = ideas_per_iter
    os.environ["VA_DISCOVERY_MAX_CONCURRENCY"] = max_concurrency

    run_id = f"orchestrator-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{uuid.uuid4().hex[:8]}"
    overall_exit = 0
    if max_runtime_sec <= 0:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        spec = StepSpec("runtime-budget", ["internal"], "REQUIRED")
        result = StepResult("runtime-budget", "failed", None, 0, "", "BUDGET_EXHAUSTED before required work")
        receipt_path = os.path.join(args.receipt_dir, f"{run_id}-iteration-000.json")
        atomic_write_json(receipt_path, _receipt(run_id, 0, now, now, [spec], [result], "FAILED"))
        log(f"[FAILED] Runtime budget exhausted before required work. Receipt: {receipt_path}")
        return 1
    with process_file_lock(LOCK_PATH):
        iteration = 0
        while iteration < max_iterations:
            iteration += 1
            elapsed = time.monotonic() - start_time
            if elapsed >= max_runtime_sec:
                log(f"[BUDGET EXCEEDED] Max runtime of {args.max_runtime_minutes} minutes reached. Terminating orchestrator cleanly.")
                break

            npm_cmd = ["npm.cmd", "run", "generate"] if os.name == "nt" else ["npm", "run", "generate"]
            npm_q_cmd = ["npm.cmd", "run", "quality:source"] if os.name == "nt" else ["npm", "run", "quality:source"]
            timeout = max(1, args.step_timeout_seconds)
            specs = [
                StepSpec("discovery", [sys.executable, "scripts/autonomous-idea-generator.py", "--max-concurrency", max_concurrency], "REQUIRED", (), timeout),
                StepSpec("migration", [sys.executable, "scripts/migrations/migrate-staging-candidate-ids.py"], "REQUIRED", ("discovery",), timeout),
                StepSpec("ranking", [sys.executable, "scripts/va-ranker.py"], "REQUIRED", ("migration",), timeout),
                StepSpec("generate", npm_cmd, "REQUIRED", ("ranking",), timeout),
                StepSpec("quality:source", npm_q_cmd, "REQUIRED", ("generate",), timeout),
            ]
            iteration_started = datetime.datetime.now(datetime.timezone.utc).isoformat()
            results, final_status, utility = execute_iteration(
                specs, dry_run=args.dry_run, content_probe=content_snapshot,
                deadline_monotonic=deadline_monotonic,
            )
            iteration_ended = datetime.datetime.now(datetime.timezone.utc).isoformat()
            receipt = _receipt(run_id, iteration, iteration_started, iteration_ended, specs, results, final_status, utility)
            receipt_path = os.path.join(args.receipt_dir, f"{run_id}-iteration-{iteration:03d}.json")
            atomic_write_json(receipt_path, receipt)

            # State Telemetry Summary
            queue_path = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
            queue = read_json_safe(queue_path, default_if_missing=[])
            ideas_path = os.path.join(BASE_DIR, "data", "ideas.json")
            ideas_raw = read_json_safe(ideas_path, default_if_missing={"ideas": []})
            ideas_list = ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw

            log(f"Portfolio Status: {len(ideas_list)} Canonical Ideas | {len(queue)} Staged Candidates | Total: {len(ideas_list) + len(queue)}")
            log("Iteration #{} Status: {} | {}".format(
                iteration,
                final_status,
                ", ".join(f"{result.name}={result.status}" for result in results)
            ))
            log(f"Run receipt: {receipt_path}")
            if final_status == "FAILED":
                overall_exit = 1
                log("[FAILED] Required stage failed or was dependency-skipped; stopping bounded run.")
                break

            if iteration < max_iterations and args.continuous:
                log(f"Sleeping {args.sleep_seconds}s before iteration #{iteration + 1}...")
                time.sleep(args.sleep_seconds)

    final_label = "FAILED" if overall_exit else ("DRY_RUN" if args.dry_run else "SUCCEEDED")
    log(f"=== Venture Atlas Bounded Orchestrator Final Status: {final_label} ===")
    return overall_exit

if __name__ == "__main__":
    raise SystemExit(main())
