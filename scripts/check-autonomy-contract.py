#!/usr/bin/env python3
"""Fail-closed checks for autonomy authority, cloud recurrence, and provider scope."""

from __future__ import annotations

import datetime
import json
import os
import re
import sys


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_json(relative: str):
    with open(os.path.join(ROOT, relative), "r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    backlog = load_json(".agent-system/backlog.json")
    state = load_json(".agent-system/state.json")
    meta = load_json("data/repository-meta.json")
    providers = load_json("config/providers.json").get("providers", {})
    health = load_json(".agent-system/provider-registry.json")
    cloud_provider_proof = load_json(".agent-system/cloud-provider-proof.json")
    ci_proof = load_json(".agent-system/ci-proof.json")
    graph = load_json("data/agent-task-graph.json")

    tasks = backlog.get("tasks", [])
    task_ids = [str(task.get("id", "")) for task in tasks]
    if not task_ids or any(not task_id for task_id in task_ids):
        errors.append("authoritative backlog contains a missing task ID")
    if len(task_ids) != len(set(task_ids)):
        errors.append("authoritative backlog contains duplicate task IDs")
    known = set(task_ids)
    for task in tasks:
        for dependency in task.get("dependencies", []):
            if dependency not in known:
                errors.append(f"{task.get('id')} has unknown dependency {dependency}")

    active = set(state.get("activeTasks", []))
    completed = set(state.get("completedTasks", []))
    if active & completed:
        errors.append(f"tasks are both active and completed: {sorted(active & completed)}")
    for task_id in sorted((active | completed) - known):
        errors.append(f"runtime state references unknown authoritative task {task_id}")
    task_statuses = {str(task.get("id", "")): str(task.get("status", "")) for task in tasks}
    completion_statuses = {"COMPLETE", "LANDED"}
    for task_id in sorted(completed):
        if task_statuses.get(task_id) not in completion_statuses:
            errors.append(
                f"runtime state marks {task_id} completed but backlog status is "
                f"{task_statuses.get(task_id)!r}"
            )
    for task_id, status in sorted(task_statuses.items()):
        if status in completion_statuses and task_id not in completed:
            errors.append(f"backlog marks {task_id} {status} but runtime state does not mark it completed")
        if status in {"LANDED_PENDING_EXTERNAL_PROOF", "VERIFY_EXTERNAL", "VERIFY_ON_NEXT_PUSH"} and task_id not in active:
            errors.append(f"backlog leaves {task_id} active at {status} but runtime state does not track it as active")

    markdown = open(os.path.join(ROOT, ".agent-system", "BACKLOG.md"), "r", encoding="utf-8").read()
    markdown_ids = set(re.findall(r"^\|\s+([A-Z]+-[0-9A-Z]+)\s+\|", markdown, re.M))
    if markdown_ids != known:
        errors.append(
            "BACKLOG.md is not a lossless projection of backlog.json: "
            f"missing={sorted(known - markdown_ids)} extra={sorted(markdown_ids - known)}"
        )

    counts = meta.get("counts", {})
    expected_metrics = {
        "canonicalIdeas": counts.get("canonicalIdeas"),
        "stagedIdeas": counts.get("stagedIdeas"),
        "totalIdeas": counts.get("totalIdeas"),
        "categories": counts.get("categories"),
        "sources": counts.get("sources"),
        "prompts": counts.get("prompts"),
    }
    for key, expected in expected_metrics.items():
        actual = state.get("metrics", {}).get(key)
        if actual != expected:
            errors.append(f"state metric {key}={actual!r} differs from repository truth {expected!r}")

    health_timestamps = {
        "local provider registry": health.get("lastHealthCheck"),
        "cloud provider proof": cloud_provider_proof.get("checkedAt"),
    }
    parsed_health_timestamps = []
    for label, raw_timestamp in health_timestamps.items():
        try:
            parsed_health_timestamps.append((
                label,
                datetime.datetime.fromisoformat(str(raw_timestamp).replace("Z", "+00:00")),
            ))
        except (TypeError, ValueError):
            errors.append(f"{label} timestamp is missing or invalid")
    if parsed_health_timestamps:
        freshest_label, freshest_check = max(parsed_health_timestamps, key=lambda item: item[1])
        age_hours = (datetime.datetime.now(datetime.timezone.utc) - freshest_check).total_seconds() / 3600
        if age_hours > 24:
            warnings.append(f"freshest provider health receipt ({freshest_label}) is stale ({age_hours:.1f}h old)")
    if cloud_provider_proof.get("executionScope") != "cloud":
        errors.append("cloud provider proof is not explicitly scoped to cloud execution")
    if cloud_provider_proof.get("reviewPanel", {}).get("modelLanes") != 3:
        errors.append("cloud provider proof does not record exactly three model-review lanes")
    if cloud_provider_proof.get("reviewPanel", {}).get("infrastructureGroups", 0) < 2:
        errors.append("cloud provider proof does not record at least two infrastructure groups")

    workflow_directory = os.path.join(ROOT, ".github", "workflows")
    workflow_names = set()
    for filename in os.listdir(workflow_directory):
        if not filename.endswith((".yml", ".yaml")):
            continue
        source = open(os.path.join(workflow_directory, filename), "r", encoding="utf-8").read()
        match = re.search(r"^name:\s*(.+)$", source, re.M)
        if match:
            workflow_names.add(match.group(1).strip())
    ci_workflows = ci_proof.get("workflows", [])
    proven_workflow_names = {str(item.get("name", "")) for item in ci_workflows}
    if proven_workflow_names != workflow_names:
        errors.append(
            "CI proof does not cover the exact active workflow set: "
            f"missing={sorted(workflow_names - proven_workflow_names)} "
            f"extra={sorted(proven_workflow_names - workflow_names)}"
        )
    if any(item.get("conclusion") != "success" for item in ci_workflows):
        errors.append("CI proof includes a non-success workflow outside the explicit alert drill")
    alert_drill = ci_proof.get("alertDrill", {})
    if alert_drill.get("openIssueCountAfterSecondStaleRun") != 1:
        errors.append("CI proof does not demonstrate exactly one deduplicated stale-run issue")
    if alert_drill.get("issue", {}).get("finalState") != "CLOSED":
        errors.append("CI proof does not demonstrate alert recovery closure")

    hermes_scopes = set(providers.get("hermes-ollama", {}).get("executionScopes", []))
    if "cloud" in hermes_scopes:
        router_source = open(
            os.path.join(ROOT, "scripts", "va_runtime", "provider_router.py"),
            "r", encoding="utf-8",
        ).read()
        hermes_cloud_guards = [
            'parsed.scheme != "https"',
            'parsed.hostname in {"localhost", "127.0.0.1", "::1"}',
            'os.environ.get("OLLAMA_AUTH_TOKEN")',
        ]
        for marker in hermes_cloud_guards:
            if marker not in router_source:
                errors.append(f"cloud Hermes routing is missing safety guard: {marker}")
    for provider_id, config in providers.items():
        if provider_id in {"hermes-ollama", "own-orch"}:
            continue
        if config.get("requiresApiKey") and "cloud" not in config.get("executionScopes", []):
            errors.append(f"API provider {provider_id} is missing cloud execution scope")

    if graph.get("authoritative") is not False or graph.get("authority") != ".agent-system/backlog.json":
        errors.append("data/agent-task-graph.json is not explicitly marked as a non-authoritative capability plan")
    if any(not str(task.get("id", "")).startswith("CAP-") for task in graph.get("tasks", [])):
        errors.append("capability-plan task IDs must use CAP- namespace and cannot collide with live backlog IDs")

    workflow = open(os.path.join(ROOT, ".github", "workflows", "research-cycle.yml"), "r", encoding="utf-8").read()
    required_workflow_markers = [
        "va-massive-orchestrator.py",
        "--strict-panel",
        "actions/cache/restore@v4",
        "actions/cache/save@v4",
        "VA_EXECUTION_SCOPE: cloud",
    ]
    for marker in required_workflow_markers:
        if marker not in workflow:
            errors.append(f"cloud research workflow is missing required marker: {marker}")
    if re.search(r"VA_CREDIT_SAFE_MODE:\s*['\"]?1", workflow):
        errors.append("cloud research workflow silently disables external reviewers through credit-safe mode")

    clean_checkout_tests = [
        "tests/absorption-frontier.test.js",
        "tests/cutover-inventory-clock.test.js",
        "tests/test_deepresearch_expansion_vii.py",
    ]
    for relative in clean_checkout_tests:
        source = open(os.path.join(ROOT, relative), "r", encoding="utf-8").read()
        if "idea-staging-queue" in source:
            errors.append(f"cloud-critical test depends on ignored private queue state: {relative}")

    print(json.dumps({
        "status": "FAILED" if errors else "PASSED_WITH_WARNINGS" if warnings else "PASSED",
        "authoritativeTasks": len(tasks),
        "errors": errors,
        "warnings": warnings,
    }, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
