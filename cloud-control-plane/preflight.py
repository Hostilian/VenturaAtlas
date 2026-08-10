#!/usr/bin/env python3
"""Read-only GCP deployment preflight with a machine-readable, secret-free receipt."""

import argparse
import datetime
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_RECEIPT = os.path.join(ROOT, ".agent-state", "cloud-preflight.json")


def run(args):
    try:
        result = subprocess.run(args, capture_output=True, text=True, encoding="utf-8",
                                errors="replace", timeout=30)
        return result.returncode, (result.stdout or "").strip(), (result.stderr or "").strip()
    except Exception as exc:
        return 1, "", str(exc)


def main():
    parser = argparse.ArgumentParser(description="Check whether Venture Atlas can be proven off-laptop on GCP")
    parser.add_argument("--project", default=os.environ.get("VA_GCP_PROJECT_ID", ""))
    parser.add_argument("--region", default=os.environ.get("VA_GCP_REGION", "europe-west1"))
    parser.add_argument("--receipt", default=DEFAULT_RECEIPT)
    args = parser.parse_args()

    checks = []
    gcloud = shutil.which("gcloud")
    if not gcloud:
        checks.append({"id": "gcloud", "passed": False, "detail": "gcloud is not installed"})
        project = args.project
    else:
        checks.append({"id": "gcloud", "passed": True, "detail": "installed"})
        project = args.project
        if not project:
            rc, out, _ = run([gcloud, "config", "get-value", "project"])
            project = out if rc == 0 and out != "(unset)" else ""

    checks.append({
        "id": "project",
        "passed": bool(project),
        "detail": project or "VA_GCP_PROJECT_ID is unset and no active project is configured",
    })

    job_ok = scheduler_ok = False
    if gcloud and project:
        rc, out, err = run([gcloud, "run", "jobs", "describe", "venture-atlas-discovery-worker",
                            "--project", project, "--region", args.region, "--format=value(name)"])
        job_ok = rc == 0 and bool(out)
        checks.append({"id": "cloud-run-job", "passed": job_ok,
                       "detail": out if job_ok else (err.splitlines()[0] if err else "not found")})
        rc, out, err = run([gcloud, "scheduler", "jobs", "describe", "venture-atlas-2hr-trigger",
                            "--project", project, "--location", args.region, "--format=value(name,state)"])
        scheduler_ok = rc == 0 and bool(out)
        checks.append({"id": "cloud-scheduler", "passed": scheduler_ok,
                       "detail": out if scheduler_ok else (err.splitlines()[0] if err else "not found")})

    passed = all(item["passed"] for item in checks)
    receipt = {
        "schemaVersion": "1.0.0",
        "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "project": project or None,
        "region": args.region,
        "status": "PASSED" if passed else "BLOCKED",
        "offLaptopExecutionProven": bool(passed and job_ok and scheduler_ok),
        "checks": checks,
        "secretsRecorded": False,
    }
    os.makedirs(os.path.dirname(args.receipt), exist_ok=True)
    temp = args.receipt + ".tmp"
    with open(temp, "w", encoding="utf-8") as handle:
        json.dump(receipt, handle, indent=2)
    os.replace(temp, args.receipt)
    print(json.dumps(receipt, indent=2))
    return 0 if passed else 2


if __name__ == "__main__":
    raise SystemExit(main())
