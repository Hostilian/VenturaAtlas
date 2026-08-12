#!/usr/bin/env python3
"""Fail-closed Cloud Run job entrypoint for Venture Atlas.

The container image intentionally excludes `.git`; this runner therefore creates
an immutable clean checkout, runs bounded work, checkpoints unreviewed staging in
private object storage, and validates the exact repository diff. Git publication
is available only when a separately authorized deployment explicitly enables it.
"""

from __future__ import annotations

import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile


IMAGE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = IMAGE_ROOT
COMMAND_TIMEOUT_SECONDS = int(os.environ.get("VA_CLOUD_COMMAND_TIMEOUT_SECONDS", "900"))
PRIVATE_STAGING_OBJECT = "idea-staging-queue.json"
MAX_STAGING_BYTES = 20 * 1024 * 1024

SECRET_IDS = {
    "OPENROUTER_API_KEYS": "va-openrouter-01",
    "ANTHROPIC_API_KEYS": "va-anthropic-01",
    "ACTIVE_API_KEYS": "va-active-01",
    "DEEPSEEK_API_KEYS": "va-deepseek-01",
    "NVIDIA_NIM_API_KEYS": "va-nvidia-nim-01",
    "COHERE_API_KEYS": "va-cohere-01",
}


def log_event(level: str, message: str, extra: dict | None = None) -> None:
    payload = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "severity": level,
        "service": "venture-atlas-cloud-runner",
        "message": message,
    }
    if extra:
        payload.update(extra)
    print(json.dumps(payload), flush=True)


def fetch_gcp_secret(secret_name: str, default: str = "") -> str:
    env_value = os.environ.get(secret_name, "")
    if env_value:
        return env_value
    try:
        from google.cloud import secretmanager
        client = secretmanager.SecretManagerServiceClient()
        project_id = os.environ.get("GCP_PROJECT_ID", "venture-atlas-os")
        secret_id = SECRET_IDS.get(secret_name, secret_name)
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8").strip()
    except Exception:
        return default


def redact_secrets(text: str) -> str:
    if not text:
        return ""
    result = re.sub(r"x-access-token:[^@]+@", "x-access-token:[REDACTED]@", text)
    result = re.sub(r"ghp_[a-zA-Z0-9]{20,}", "ghp_[REDACTED]", result)
    result = re.sub(r"github_pat_[a-zA-Z0-9_]{20,}", "github_pat_[REDACTED]", result)
    result = re.sub(r"gh[oasu]_[a-zA-Z0-9]{20,}", "gh*_[REDACTED]", result)
    result = re.sub(r"Authorization:\s*(Basic|Bearer)\s+[^\s]+", r"Authorization: \1 [REDACTED]", result, flags=re.I)
    result = re.sub(r"sk-[a-zA-Z0-9]{20,}", "sk-[REDACTED]", result)
    return result


def run_checked(command: list[str], *, cwd: str, env: dict | None = None,
                timeout: int = COMMAND_TIMEOUT_SECONDS) -> subprocess.CompletedProcess:
    return subprocess.run(
        command, cwd=cwd, env=env, capture_output=True, text=True,
        check=True, timeout=timeout
    )


def git_environment(github_token: str = "") -> dict:
    environment = os.environ.copy()
    environment["GIT_TERMINAL_PROMPT"] = "0"
    if github_token:
        environment["VA_GITHUB_TOKEN"] = github_token
        environment["GIT_ASKPASS"] = os.path.join(IMAGE_ROOT, "cloud-control-plane", "git_askpass.py")
    return environment


def configure_environment() -> None:
    for pool_name in SECRET_IDS:
        legacy_name = pool_name.removesuffix("S")
        value = fetch_gcp_secret(pool_name, os.environ.get(legacy_name, ""))
        if value:
            os.environ[pool_name] = value


def prepare_checkout() -> str:
    global BASE_DIR
    baseline_sha = os.environ.get("VA_BASELINE_SHA", "").strip()
    if not re.fullmatch(r"[a-f0-9]{40}", baseline_sha):
        raise RuntimeError("VA_BASELINE_SHA must be an explicit 40-character commit SHA")
    token = fetch_gcp_secret("GITHUB_TOKEN", os.environ.get("GITHUB_TOKEN", ""))
    if os.path.isdir(os.path.join(IMAGE_ROOT, ".git")):
        checkout = IMAGE_ROOT
    else:
        repository_url = os.environ.get("VA_REPOSITORY_URL", "").strip()
        if not repository_url:
            raise RuntimeError("Container has no Git checkout; VA_REPOSITORY_URL is required")
        checkout = tempfile.mkdtemp(prefix="venture-atlas-cloud-checkout-")
        run_checked(["git", "clone", "--no-checkout", repository_url, checkout], cwd=os.path.dirname(checkout), env=git_environment(token))
    run_checked(["git", "fetch", "--prune", "origin"], cwd=checkout, env=git_environment(token))
    run_checked(["git", "checkout", "--detach", baseline_sha], cwd=checkout)
    head = run_checked(["git", "rev-parse", "HEAD"], cwd=checkout).stdout.strip()
    if head != baseline_sha:
        raise RuntimeError(f"checkout mismatch: expected {baseline_sha}, got {head}")
    if run_checked(["git", "status", "--porcelain"], cwd=checkout).stdout.strip():
        raise RuntimeError("baseline checkout is not clean before autonomous execution")
    BASE_DIR = checkout
    return checkout


def private_staging_blob():
    bucket_name = os.environ.get("VA_PRIVATE_STAGING_BUCKET", "").strip()
    if not bucket_name:
        raise RuntimeError("VA_PRIVATE_STAGING_BUCKET is required for private discovery state")
    try:
        from google.cloud import storage
    except ImportError as exc:
        raise RuntimeError("google-cloud-storage is required for private discovery state") from exc
    client = storage.Client(project=os.environ.get("GCP_PROJECT_ID") or None)
    return client.bucket(bucket_name).blob(PRIVATE_STAGING_OBJECT)


def hydrate_private_staging() -> int | None:
    """Restore the private queue without ever treating a public Git branch as storage."""
    blob = private_staging_blob()
    destination = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
    if not blob.exists():
        with open(destination + ".cloud-hydrate.tmp", "w", encoding="utf-8") as handle:
            json.dump([], handle)
            handle.write("\n")
        os.replace(destination + ".cloud-hydrate.tmp", destination)
        log_event("NOTICE", "Private staging checkpoint does not exist; initialized an empty private queue")
        return None
    blob.reload()
    payload = blob.download_as_bytes(timeout=60)
    if len(payload) > MAX_STAGING_BYTES:
        raise RuntimeError("private staging checkpoint exceeds size limit")
    envelope = json.loads(payload.decode("utf-8"))
    if envelope.get("schemaVersion") != "1.0.0" or not isinstance(envelope.get("queue"), list):
        raise RuntimeError("private staging checkpoint has an invalid envelope")
    expected_digest = hashlib.sha256(json.dumps(envelope["queue"], sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")).hexdigest()
    if envelope.get("queueDigest") != expected_digest:
        raise RuntimeError("private staging checkpoint digest mismatch")
    baseline = os.environ.get("VA_BASELINE_SHA", "")
    if envelope.get("baselineSha") != baseline and envelope.get("baselineSha") != os.environ.get("VA_STAGING_MIGRATION_FROM_SHA", ""):
        raise RuntimeError("private staging checkpoint baseline mismatch; explicit migration is required")
    parsed = envelope["queue"]
    if len(parsed) > 5000 or any(not isinstance(item, dict) or not str(item.get("id", "")).startswith("candidate-") for item in parsed):
        raise RuntimeError("private staging checkpoint contains invalid candidates")
    temporary = destination + ".cloud-hydrate.tmp"
    with open(temporary, "wb") as handle:
        handle.write((json.dumps(parsed, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
    os.replace(temporary, destination)
    return blob.generation


def persist_private_staging(expected_generation: int | None) -> dict:
    """CAS-write the queue to a private bucket before any repository publication step."""
    blob = private_staging_blob()
    source = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
    with open(source, "r", encoding="utf-8") as handle:
        parsed = json.load(handle)
    if not isinstance(parsed, list) or len(parsed) > 5000 or any(not isinstance(item, dict) or not str(item.get("id", "")).startswith("candidate-") for item in parsed):
        raise RuntimeError("generated staging checkpoint is not a JSON queue")
    queue_digest = hashlib.sha256(json.dumps(parsed, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")).hexdigest()
    envelope = {"schemaVersion": "1.0.0", "baselineSha": os.environ.get("VA_BASELINE_SHA"),
                "runId": os.environ.get("VA_CLOUD_RUN_ID", "cloud-run-unassigned"),
                "queueDigest": queue_digest, "queue": parsed}
    payload = (json.dumps(envelope, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")
    if len(payload) > MAX_STAGING_BYTES:
        raise RuntimeError("generated staging checkpoint exceeds size limit")
    precondition = expected_generation if expected_generation is not None else 0
    blob.upload_from_string(
        payload,
        content_type="application/json", timeout=60,
        if_generation_match=precondition,
    )
    blob.reload()
    return {
        "bucket": blob.bucket.name,
        "object": blob.name,
        "generation": blob.generation,
        "records": len(parsed if isinstance(parsed, list) else parsed.get("queue", [])),
    }


def run_command(command: list[str], label: str) -> None:
    result = subprocess.run(
        command, capture_output=True, text=True, cwd=BASE_DIR,
        timeout=COMMAND_TIMEOUT_SECONDS
    )
    if result.returncode != 0:
        raise RuntimeError(f"{label} failed ({result.returncode}): {redact_secrets(result.stderr[-500:])}")
    log_event("INFO", f"{label} completed", {"output_tail": result.stdout[-300:]})


def execute_discovery() -> None:
    run_command([
        sys.executable, os.path.join(BASE_DIR, "scripts", "autonomous-idea-generator.py"),
        "--max-concurrency", os.environ.get("VA_MAX_CONCURRENCY", "3"),
        "--max-cost", os.environ.get("VA_MAX_COST_CLASS", "1"),
    ], "Autonomous discovery")


def rebuild_metadata_and_site() -> None:
    run_command(["npm", "run", "quality"], "Fail-closed quality and build pipeline")


def changed_paths(cwd: str) -> set[str]:
    commands = [
        ["git", "diff", "--name-only"],
        ["git", "diff", "--cached", "--name-only"],
        ["git", "ls-files", "--others", "--exclude-standard"],
    ]
    return {
        item.replace("\\", "/")
        for command in commands
        for item in run_checked(command, cwd=cwd).stdout.splitlines()
        if item.strip()
    }


def load_expected_diff_manifest() -> dict:
    manifest_path = os.environ.get("VA_EXPECTED_DIFF_MANIFEST", "").strip()
    if not manifest_path:
        raise RuntimeError("VA_EXPECTED_DIFF_MANIFEST is required for publication diff closure")
    if not os.path.isabs(manifest_path):
        manifest_path = os.path.join(BASE_DIR, manifest_path)
    with open(manifest_path, "r", encoding="utf-8") as handle:
        manifest = json.load(handle)
    if manifest.get("schemaVersion") != "1.0.0":
        raise RuntimeError("unsupported expected-diff manifest")
    return manifest


def enforce_diff_closure(cwd: str, manifest: dict) -> tuple[set[str], set[str]]:
    actual = changed_paths(cwd)
    allowed = set(manifest.get("allowedPaths", []))
    private = set(manifest.get("privatePaths", []))
    required = set(manifest.get("requiredPaths", []))
    overlap = allowed & private
    if overlap:
        raise RuntimeError(f"diff manifest paths cannot be both public and private: {sorted(overlap)}")
    unexpected = sorted(actual - allowed - private)
    missing = sorted(required - actual)
    if unexpected:
        raise RuntimeError(f"unexpected autonomous diff paths: {unexpected}")
    if missing:
        raise RuntimeError(f"missing expected autonomous diff paths: {missing}")
    if manifest.get("forbidDeletions", True):
        deleted = [
            line.split("\t", 1)[-1]
            for line in run_checked(["git", "diff", "HEAD", "--name-status", "--find-renames"], cwd=cwd).stdout.splitlines()
            if line.startswith(("D\t", "R"))
        ]
        if deleted:
            raise RuntimeError(f"autonomous deletion is forbidden: {deleted}")
    return actual & allowed, actual & private


def push_updates_to_github() -> dict | str:
    if not os.path.isdir(os.path.join(BASE_DIR, ".git")):
        raise RuntimeError("publication requires a real Git checkout")
    publication_expected = os.environ.get("VA_PUBLICATION_EXPECTED", "1").lower() not in {"0", "false", "no"}
    token = fetch_gcp_secret("GITHUB_TOKEN", os.environ.get("GITHUB_TOKEN", ""))
    if publication_expected and not token:
        raise RuntimeError("GITHUB_TOKEN is required when VA_PUBLICATION_EXPECTED is enabled")
    manifest = load_expected_diff_manifest()
    public_actual, private_actual = enforce_diff_closure(BASE_DIR, manifest)
    if publication_expected and private_actual:
        raise RuntimeError(f"private paths cannot be published to Git: {sorted(private_actual)}")
    if not publication_expected:
        return {
            "status": "validated_not_published",
            "publicPaths": sorted(public_actual),
            "privatePaths": sorted(private_actual),
        }
    if not public_actual:
        return "no_changes"

    run_checked(["git", "config", "user.name", "VentureAtlas-Cloud-Bot"], cwd=BASE_DIR)
    run_checked(["git", "config", "user.email", "cloud-bot@ventureatlas.os"], cwd=BASE_DIR)
    branch = f"automation/publish-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')}"
    run_checked(["git", "checkout", "-b", branch], cwd=BASE_DIR)
    run_checked(["git", "add", "--", *sorted(public_actual)], cwd=BASE_DIR)
    staged = set(run_checked(["git", "diff", "--cached", "--name-only"], cwd=BASE_DIR).stdout.splitlines())
    if staged != public_actual:
        raise RuntimeError(f"staged diff closure mismatch: staged={sorted(staged)} actual={sorted(public_actual)}")
    run_checked(["git", "diff", "--cached", "--check"], cwd=BASE_DIR)
    tree_id = run_checked(["git", "write-tree"], cwd=BASE_DIR).stdout.strip()
    message = f"feat(autonomy): validated cloud update [{datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}]"
    run_checked(["git", "commit", "-m", message], cwd=BASE_DIR)
    committed_tree = run_checked(["git", "rev-parse", "HEAD^{tree}"], cwd=BASE_DIR).stdout.strip()
    if committed_tree != tree_id:
        raise RuntimeError("committed tree differs from validated staged tree")
    if publication_expected:
        run_checked(["git", "push", "origin", branch], cwd=BASE_DIR, env=git_environment(token))
    return {"branch": branch, "tree": tree_id, "paths": sorted(public_actual), "pushed": True}


def main() -> int:
    log_event("INFO", "Venture Atlas cloud run started")
    configure_environment()
    checkout = prepare_checkout()
    log_event("INFO", "Prepared immutable checkout", {"checkout": checkout, "baseline": os.environ.get("VA_BASELINE_SHA")})
    checkpoint_generation = hydrate_private_staging()
    execute_discovery()
    rebuild_metadata_and_site()
    publication = push_updates_to_github()
    checkpoint = persist_private_staging(checkpoint_generation)
    log_event("INFO", "Cloud run finished", {"privateCheckpoint": checkpoint, "publication": publication})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        log_event("ERROR", "Cloud run failed", {"error": redact_secrets(str(exc))})
        raise SystemExit(1)
