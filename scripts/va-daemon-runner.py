#!/usr/bin/env python3
"""
Venture Atlas OS — Continuous Daemon Runner
============================================
Pure-Python cross-platform daemon. Runs the full pipeline indefinitely.

Usage:
  python scripts/va-daemon-runner.py                          # run forever, 120s interval
  python scripts/va-daemon-runner.py --interval 60             # 60-second between runs
  python scripts/va-daemon-runner.py --iterations 5            # stop after 5 runs
  python scripts/va-daemon-runner.py --interval 300 --rank     # rank after each run
  python scripts/va-daemon-runner.py --test                    # 2 runs, 5s interval (test mode)

Ctrl+C to stop gracefully.
"""

import os
import sys
import time
import datetime
import signal
import json
import subprocess
import argparse
from va_runtime.atomic_io import atomic_write_json
from va_runtime.process_lock import process_file_lock

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_PATH     = os.path.join(BASE_DIR, '.agent-state', 'logs', 'unattended-runner.log')
STATE_PATH   = os.path.join(BASE_DIR, '.agent-state', 'provider-state.json')
LOCK_PATH    = os.path.join(BASE_DIR, '.agent-state', 'locks', 'autonomy-supervisor.lock')
HEARTBEAT_PATH = os.path.join(BASE_DIR, '.agent-state', 'autonomy-heartbeat.json')
SCRIPTS_DIR  = os.path.dirname(os.path.abspath(__file__))

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

# ── Load .env ─────────────────────────────────────────────────────────────────
_env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(_env_path):
    with open(_env_path, 'r', encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                if _k.strip() and not os.environ.get(_k.strip()):
                    os.environ[_k.strip()] = _v.strip()

_running = True

def _sigint_handler(signum, frame):
    global _running
    _running = False
    print("\n\n[DAEMON] Ctrl+C received — shutting down gracefully after current run...")

signal.signal(signal.SIGINT, _sigint_handler)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, _sigint_handler)

def _heartbeat(status: str, iteration: int = 0, detail: str = ""):
    atomic_write_json(HEARTBEAT_PATH, {
        "pid": os.getpid(),
        "status": status,
        "iteration": iteration,
        "detail": detail,
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })

def _log(level: str, msg: str, extra: dict = None):
    entry = {
        "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "level": level,
        "component": "va-daemon-runner",
        "msg": msg,
    }
    if extra:
        entry.update(extra)
    line = json.dumps(entry, ensure_ascii=False)
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(line + '\n')
    colour = {"INFO":"\033[0m","WARN":"\033[93m","ERROR":"\033[91m",
              "SUCCESS":"\033[92m","HEADER":"\033[96m"}.get(level, "\033[0m")
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"{colour}[{ts}][DAEMON][{level}] {msg}\033[0m")

def _run_script(script_name: str, args: list = None) -> tuple[int, str]:
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    cmd = [sys.executable, script_path] + (args or [])
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8',
                                 errors='replace', cwd=BASE_DIR)
        return result.returncode, result.stdout + result.stderr
    except Exception as e:
        return 1, str(e)

def _run_command(cmd: list[str]) -> tuple[int, str]:
    """Run a bounded maintenance command without invoking a shell."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8',
                                errors='replace', cwd=BASE_DIR, timeout=600)
        return result.returncode, result.stdout + result.stderr
    except Exception as e:
        return 1, str(e)

def _print_banner(iteration: int, max_iter: int, interval: int):
    max_str = str(max_iter) if max_iter else "∞"
    print(f"\n\033[96m{'='*60}")
    print(f"  VENTURE ATLAS DAEMON  —  Run {iteration}/{max_str}")
    print(f"  {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Next run in: {interval}s")
    print(f"{'='*60}\033[0m")

def _load_state() -> dict:
    if os.path.exists(STATE_PATH):
        try:
            with open(STATE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _print_provider_status():
    state = _load_state()
    providers = state.get("providers", {})
    if not providers:
        return
    print("\n── Provider Status ──────────────────────────────────────")
    for pname, ps in providers.items():
        now = datetime.datetime.now(datetime.timezone.utc)
        cu = ps.get("circuitUntil", "")
        if cu:
            try:
                until = datetime.datetime.fromisoformat(cu)
                circuit = f"🔴 OPEN until {until.strftime('%H:%M:%S')}" if now < until else "🟢 CLOSED"
            except Exception:
                circuit = "🟢 CLOSED"
        else:
            circuit = "🟢 CLOSED"
        total   = ps.get("totalCalls", 0)
        success = ps.get("successCalls", 0)
        rate    = f"{success/total*100:.0f}%" if total else "N/A"
        print(f"  {pname:<20} {circuit:<30} calls={total} success={rate}")
    totals = {
        "totalIdeas":    state.get("totalIdeasGenerated", 0),
        "totalPromoted": state.get("totalIdeasPromoted", 0),
    }
    print(f"\n  Total generated: {totals['totalIdeas']}  |  Total promoted: {totals['totalPromoted']}")
    print("─────────────────────────────────────────────────────────\n")

def main():
    parser = argparse.ArgumentParser(description='Venture Atlas Daemon Runner')
    parser.add_argument('--interval',   type=int, default=int(os.environ.get('DAEMON_INTERVAL_SECONDS', '120')),
                        help='Seconds between runs (default: 120)')
    parser.add_argument('--iterations', type=int, default=int(os.environ.get('DAEMON_MAX_ITERATIONS', '0')),
                        help='Max iterations (0 = infinite)')
    parser.add_argument('--rank',       action='store_true', help='Run ranker after each idea generation')
    parser.add_argument('--validate',   action='store_true', help='Run validator on staged ideas after each run')
    parser.add_argument('--max-concurrency', type=int, default=int(os.environ.get('VA_MAX_CONCURRENCY', '3')),
                        help='Maximum concurrent idea workers')
    parser.add_argument('--max-cost', type=int, default=int(os.environ.get('VA_MAX_COST_CLASS', '1')),
                        help='Maximum provider cost class (0=local only, 1=low, 3=high)')
    parser.add_argument('--integrity-every', type=int, default=int(os.environ.get('VA_INTEGRITY_EVERY', '30')),
                        help='Run repository drift check every N cycles (0 disables)')
    parser.add_argument('--live-proof-every', type=int, default=int(os.environ.get('VA_LIVE_PROOF_EVERY', '180')),
                        help='Attempt live two-provider overlap proof every N cycles (0 disables)')
    parser.add_argument('--test',       action='store_true', help='Test mode: 2 iterations, 5s interval')
    args = parser.parse_args()

    if args.test:
        args.iterations = 2
        args.interval   = 5
        args.rank       = True
        print("🧪 TEST MODE: 2 iterations, 5s interval, ranking enabled")

    max_iter = args.iterations
    interval = args.interval

    _log("HEADER", "=== Venture Atlas Autonomous Daemon Starting ===",
         extra={"interval": interval, "maxIterations": max_iter or "infinite"})

    # 1. Provider health check
    _log("INFO", "Running provider health check...")
    rc, out = _run_script('va_orchestrator.py', ['--test'])
    for line in out.strip().splitlines()[:20]:
        if line.strip():
            print(f"  {line}")
    if rc != 0:
        _heartbeat("failed", 0, f"provider-health rc={rc}")
        _log("ERROR", f"Provider health check failed with code {rc}")
        raise RuntimeError(f"critical stage provider-health failed with rc={rc}")

    iteration = 0
    while _running:
        iteration += 1
        if max_iter and iteration > max_iter:
            _log("INFO", f"Reached max iterations ({max_iter}). Daemon stopping.")
            break

        _print_banner(iteration, max_iter, interval)
        _log("INFO", f"Starting idea discovery run #{iteration}", extra={"iteration": iteration})

        degraded_reasons = []

        # 2. Run idea generator
        _log("INFO", "Running autonomous-idea-generator.py...")
        _heartbeat("running", iteration, "idea-generation")
        rc, out = _run_script('autonomous-idea-generator.py', [
            '--max-concurrency', str(max(1, args.max_concurrency)),
            '--max-cost', str(max(0, min(3, args.max_cost))),
        ])
        for line in out.strip().splitlines():
            if line.strip():
                print(f"  {line}")
        if rc != 0:
            _heartbeat("failed", iteration, f"idea-generation rc={rc}")
            _log("ERROR", f"Idea generator exited with code {rc}; dependent stages skipped")
            raise RuntimeError(f"critical stage idea-generation failed with rc={rc}")
        else:
            _log("SUCCESS", "Idea generator run complete")

        # 3. Optionally validate staged
        if args.validate:
            _log("INFO", "Running validator on staged ideas...")
            rc, out = _run_script('va-validator.py', ['--staged'])
            for line in out.strip().splitlines()[-20:]:
                if line.strip():
                    print(f"  {line}")
            if rc != 0:
                _heartbeat("failed", iteration, f"validation rc={rc}")
                _log("ERROR", f"Validator exited with code {rc}; ranking skipped")
                raise RuntimeError(f"critical stage validation failed with rc={rc}")

        # 4. Optionally re-rank
        if args.rank:
            _log("INFO", "Updating rankings...")
            rc, out = _run_script('va-ranker.py', ['--update', '--top', '10'])
            for line in out.strip().splitlines()[-30:]:
                if line.strip():
                    print(f"  {line}")
            if rc != 0:
                _heartbeat("failed", iteration, f"ranking rc={rc}")
                _log("ERROR", f"Ranker exited with code {rc}")
                raise RuntimeError(f"critical stage ranking failed with rc={rc}")

        # 5. Periodic integrity work. This is read-only and degrades gracefully:
        # discovery may continue even when documentation/revision drift needs repair.
        if args.integrity_every > 0 and iteration % args.integrity_every == 0:
            _log("INFO", "Running periodic repository drift check...")
            rc, out = _run_command(['node', 'scripts/check-repository-drift.js'])
            if rc != 0:
                degraded_reasons.append(f"repository-drift rc={rc}")
                _log("WARN", f"Repository drift check failed with code {rc}; continuing in degraded mode")
            else:
                _log("SUCCESS", "Repository drift check passed")

        # 6. Periodic live proof. Missing keys/providers must be visible, but must not
        # take down the deterministic own-orch fallback or the rest of the loop.
        if args.live_proof_every > 0 and iteration % args.live_proof_every == 0:
            _log("INFO", "Attempting live external provider overlap proof...")
            rc, out = _run_script('live-provider-proof.py', [
                '--minimum-external', '2',
                '--fanout', os.environ.get('VA_PROVIDER_FANOUT', '2'),
                '--max-cost', str(max(0, min(3, args.max_cost))),
            ])
            if rc != 0:
                degraded_reasons.append(f"live-provider-proof rc={rc}")
                _log("WARN", "Live provider overlap is not proven; own-orch/local work remains available")
            else:
                _log("SUCCESS", "Live provider overlap proof passed")

        # 7. Provider status
        _print_provider_status()

        if degraded_reasons:
            _heartbeat("degraded", iteration, "; ".join(degraded_reasons))
            _log("WARN", f"Run #{iteration} complete in degraded mode: {'; '.join(degraded_reasons)}")
        else:
            _heartbeat("sleeping", iteration, f"next cycle in {interval}s")
            _log("SUCCESS", f"Run #{iteration} complete")
        print(f"\n📥 Review staged: python scripts/review-staged-ideas.py")
        print(f"📊 Full ranking:  python scripts/va-ranker.py --top 20")

        if not _running:
            break
        if max_iter and iteration >= max_iter:
            break

        # Sleep with heartbeat
        _log("INFO", f"Sleeping {interval}s before next run...")
        for remaining in range(interval, 0, -10):
            if not _running:
                break
            time.sleep(min(10, remaining))
            if remaining % 30 == 0 and remaining > 10:
                print(f"  ⏳ Next run in {remaining}s...")

    _heartbeat("stopped", iteration, "clean shutdown")
    _log("SUCCESS", "=== Venture Atlas Daemon stopped cleanly ===")
    print("\n\033[92m[DAEMON] Stopped cleanly. Run `python scripts/review-staged-ideas.py` to review ideas.\033[0m")

if __name__ == '__main__':
    try:
        with process_file_lock(LOCK_PATH, timeout_seconds=0, stale_after_seconds=86400 * 7):
            main()
    except TimeoutError:
        print("[DAEMON] Another Venture Atlas autonomy supervisor is already running; exiting.", file=sys.stderr)
        raise SystemExit(23)
