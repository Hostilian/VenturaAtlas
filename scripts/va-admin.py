#!/usr/bin/env python3
"""
Venture Atlas OS — Administrative CLI Tool
===========================================
Allows operators to inspect dead-letter jobs, replay failed runs, toggle runtime pause switches,
and monitor provider health.

Usage:
  python scripts/va-admin.py runtime status
  python scripts/va-admin.py runtime pause
  python scripts/va-admin.py runtime resume
  python scripts/va-admin.py publishing enable
  python scripts/va-admin.py publishing disable
  python scripts/va-admin.py jobs list-dead
  python scripts/va-admin.py providers status
"""

import sys
import argparse
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))

from va_runtime.atomic_io import atomic_write_json, read_json_safe
from va_orchestrator import _load_state

CONFIG_FILE = os.path.join(BASE_DIR, ".agent-state", "admin-control.json")

def load_admin_config() -> dict:
    return read_json_safe(CONFIG_FILE, default_if_missing={
        "runtimePaused": False,
        "publishingEnabled": True,
        "deadLetterJobs": []
    })

def save_admin_config(cfg: dict):
    atomic_write_json(CONFIG_FILE, cfg)

def handle_runtime(action: str):
    cfg = load_admin_config()
    if action == "pause":
        cfg["runtimePaused"] = True
        save_admin_config(cfg)
        print("[OK] Autonomous Runtime PAUSED.")
    elif action == "resume":
        cfg["runtimePaused"] = False
        save_admin_config(cfg)
        print("[OK] Autonomous Runtime RESUMED.")
    elif action == "status":
        print(f"Runtime Paused    : {cfg.get('runtimePaused', False)}")
        print(f"Publishing Enabled: {cfg.get('publishingEnabled', True)}")

def handle_publishing(action: str):
    cfg = load_admin_config()
    if action == "enable":
        cfg["publishingEnabled"] = True
        save_admin_config(cfg)
        print("[OK] Emergency Publishing Enabled.")
    elif action == "disable":
        cfg["publishingEnabled"] = False
        save_admin_config(cfg)
        print("[WARN] Emergency Publishing DISABLED (Emergency Stop Active).")

def handle_providers():
    state = _load_state()
    print("\n=== Venture Atlas Provider Status ===")
    print(json.dumps(state.get("providers", {}), indent=2))

def main():
    parser = argparse.ArgumentParser(description="Venture Atlas OS Admin Tool")
    subparsers = parser.add_subparsers(dest="command")

    rt_parser = subparsers.add_parser("runtime")
    rt_parser.add_argument("action", choices=["status", "pause", "resume"])

    pub_parser = subparsers.add_parser("publishing")
    pub_parser.add_argument("action", choices=["enable", "disable"])

    prov_parser = subparsers.add_parser("providers")
    prov_parser.add_argument("action", choices=["status"])

    args = parser.parse_args()
    if args.command == "runtime":
        handle_runtime(args.action)
    elif args.command == "publishing":
        handle_publishing(args.action)
    elif args.command == "providers":
        handle_providers()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
