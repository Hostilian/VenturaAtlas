#!/usr/bin/env python3
"""Read-only GCP deployment preflight with a machine-readable, secret-free receipt."""

import argparse
import datetime
import json
import os
import re
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


def parse_json_output(output, fallback):
    try:
        return json.loads(output)
    except (TypeError, json.JSONDecodeError):
        return fallback


def inspect_deployment(gcloud, project, region):
    checks = []
    rc, out, err = run([
        gcloud, "run", "jobs", "describe", "venture-atlas-discovery-worker",
        "--project", project, "--region", region, "--format=json",
    ])
    job = parse_json_output(out, {}) if rc == 0 else {}
    job_ok = bool(job.get("name") or job.get("metadata", {}).get("name"))
    checks.append({"id": "cloud-run-job", "passed": job_ok,
                   "detail": "described" if job_ok else (err.splitlines()[0] if err else "not found")})

    task = job.get("template", {}).get("template", {})
    containers = task.get("containers", [])
    container = containers[0] if containers else {}
    image = container.get("image", "")
    immutable_image = bool(re.search(r"@sha256:[0-9a-f]{64}$", image))
    checks.append({"id": "immutable-worker-image", "passed": immutable_image,
                   "detail": image or "deployed image unavailable"})
    service_account = task.get("serviceAccount", "") or task.get("serviceAccountName", "")
    checks.append({"id": "worker-service-account", "passed": bool(service_account),
                   "detail": service_account or "dedicated service account unavailable"})

    env = {
        item.get("name"): item.get("value", "")
        for item in container.get("env", [])
        if isinstance(item, dict) and item.get("name")
    }
    private_config = (
        bool(env.get("VA_PRIVATE_STAGING_BUCKET"))
        and env.get("VA_PUBLICATION_EXPECTED") == "0"
        and bool(re.fullmatch(r"[0-9a-f]{40}", env.get("VA_BASELINE_SHA", "")))
    )
    checks.append({
        "id": "private-discovery-config",
        "passed": private_config,
        "detail": "private bucket + immutable baseline + Git publication disabled"
        if private_config else "required private discovery environment is not deployed",
    })

    rc, out, err = run([
        gcloud, "scheduler", "jobs", "describe", "venture-atlas-2hr-trigger",
        "--project", project, "--location", region, "--format=json",
    ])
    scheduler = parse_json_output(out, {}) if rc == 0 else {}
    scheduler_state = scheduler.get("state", "")
    scheduler_ok = scheduler_state == "ENABLED"
    checks.append({"id": "cloud-scheduler-enabled", "passed": scheduler_ok,
                   "detail": scheduler_state or (err.splitlines()[0] if err else "not found")})

    rc, out, err = run([
        gcloud, "run", "jobs", "executions", "list",
        "--job", "venture-atlas-discovery-worker", "--project", project,
        "--region", region, "--limit=1", "--sort-by=~metadata.creationTimestamp",
        "--format=json",
    ])
    executions = parse_json_output(out, []) if rc == 0 else []
    latest = executions[0] if isinstance(executions, list) and executions else {}
    conditions = latest.get("status", {}).get("conditions", [])
    completed = any(
        condition.get("type") == "Completed"
        and str(condition.get("state") or condition.get("status")).lower() == "true"
        for condition in conditions if isinstance(condition, dict)
    )
    completed = completed or bool(latest.get("status", {}).get("completionTime") and
                                  latest.get("status", {}).get("failedCount", 0) == 0)
    execution_name = latest.get("name") or latest.get("metadata", {}).get("name") or "none"
    checks.append({"id": "latest-successful-execution", "passed": completed,
                   "detail": execution_name if completed else (err.splitlines()[0] if err else execution_name)})
    return checks


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

    if gcloud and project:
        checks.extend(inspect_deployment(gcloud, project, args.region))

    passed = all(item["passed"] for item in checks)
    receipt = {
        "schemaVersion": "1.0.0",
        "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "project": project or None,
        "region": args.region,
        "status": "PASSED" if passed else "BLOCKED",
        "offLaptopExecutionProven": bool(passed),
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
