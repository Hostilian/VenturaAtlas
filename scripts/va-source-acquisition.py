#!/usr/bin/env python3
"""Acquire secret-free HTTP receipts and queue stale legal/source claims.

This lane verifies only URLs already present in repository records. It never
converts model output into evidence and never mutates scores or canonical ideas.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request
from typing import Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.atomic_io import atomic_write_json, read_json_safe

SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
RECEIPT_PATH = os.path.join(ROOT, ".agent-state", "source-acquisition", "latest.json")
REVALIDATION_PATH = os.path.join(ROOT, ".agent-state", "source-acquisition", "revalidation-queue.json")
URL_RE = re.compile(r"https?://[^\s<>\"']+")
LEGAL_TERMS = ("regulation", "directive", "legal", "law", "deadline", "applicable", "compliance", "penalt")


def _urls(value: Any) -> list[str]:
    found = []
    if isinstance(value, dict):
        for child in value.values():
            found.extend(_urls(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(_urls(child))
    elif isinstance(value, str):
        found.extend(URL_RE.findall(value))
    return sorted(set(url.rstrip(".,);]") for url in found))


def _probe(url: str, timeout: float) -> dict[str, Any]:
    headers = {"User-Agent": "VentureAtlas-source-verifier/1.0", "Accept": "text/html,application/json,*/*"}
    started = dt.datetime.now(dt.timezone.utc)
    request = urllib.request.Request(url, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = int(getattr(response, "status", response.getcode()))
            final_url = response.geturl()
            content_type = response.headers.get("Content-Type", "")[:160]
    except urllib.error.HTTPError as exc:
        status, final_url, content_type = exc.code, exc.geturl(), exc.headers.get("Content-Type", "")[:160]
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"url": url, "reachable": False, "errorClass": type(exc).__name__}
    return {
        "url": url, "finalUrl": final_url, "httpStatus": status,
        "reachable": 200 <= status < 400, "contentType": content_type,
        "checkedAt": started.isoformat(),
    }


def build_revalidation_queue(sources: list[dict], now: dt.datetime, legal_days: int = 30,
                             general_days: int = 90) -> list[dict]:
    queued = []
    for source in sources:
        # Internal prompts/repository files are provenance, not web evidence, and
        # must not pollute the live-source refresh queue.
        if source.get("visibility") == "INTERNAL" or source.get("evidenceEligible") is False:
            continue
        source_url = source.get("url")
        if not source_url and isinstance(source.get("access"), str):
            matches = _urls(source["access"])
            source_url = matches[0] if matches else None
        text = " ".join(str(source.get(key, "")) for key in ("title", "type", "supports")).casefold()
        legal = any(term in text for term in LEGAL_TERMS)
        max_age = legal_days if legal else general_days
        try:
            accessed = dt.datetime.fromisoformat(str(source.get("accessDate", ""))).replace(tzinfo=dt.timezone.utc)
            age_days = (now - accessed).days
        except ValueError:
            age_days = max_age + 1
        if age_days > max_age:
            queued.append({
                "sourceId": source.get("id"), "url": source_url, "legalOrDeadlineSensitive": legal,
                "ageDays": age_days, "maxAgeDays": max_age, "status": "REVALIDATION_REQUIRED",
            })
    return sorted(queued, key=lambda item: (-int(item["legalOrDeadlineSensitive"]), -item["ageDays"], str(item["sourceId"])))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate-limit", type=int, default=2)
    parser.add_argument("--source-limit", type=int, default=12)
    parser.add_argument("--timeout-seconds", type=float, default=8.0)
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--receipt", default=RECEIPT_PATH)
    args = parser.parse_args()

    now = dt.datetime.now(dt.timezone.utc)
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    candidates = read_json_safe(QUEUE_PATH, default_if_missing=[])
    sources = sources if isinstance(sources, list) else []
    candidates = candidates if isinstance(candidates, list) else []
    selected_candidates = candidates[-max(0, args.candidate_limit):]
    candidate_records = []
    candidate_urls = []
    for candidate in selected_candidates:
        urls = _urls({"source": candidate.get("source"), "provenance": candidate.get("provenance")})
        candidate_urls.extend(urls)
        candidate_records.append({
            "candidateId": candidate.get("id"), "urls": urls,
            "status": "PENDING_HTTP_CHECK" if urls else "MISSING_PRIMARY_SOURCE",
            "evidenceEligible": False,
        })

    revalidation = build_revalidation_queue(sources, now)
    source_urls = [item.get("url") for item in revalidation[:max(0, args.source_limit)] if item.get("url")]
    urls_to_probe = sorted(set(candidate_urls + source_urls))
    probes = []
    if not args.offline and urls_to_probe:
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(8, len(urls_to_probe))) as executor:
            probes = list(executor.map(lambda url: _probe(url, args.timeout_seconds), urls_to_probe))
    probe_by_url = {item["url"]: item for item in probes}
    for record in candidate_records:
        record["sourceReceipts"] = [probe_by_url[url] for url in record["urls"] if url in probe_by_url]
        if record["urls"]:
            record["status"] = "REACHABLE_UNVERIFIED_CLAIMS" if all(
                probe_by_url.get(url, {}).get("reachable") for url in record["urls"]
            ) else "SOURCE_UNREACHABLE"

    receipt = {
        "schemaVersion": "1.0.0", "checkedAt": now.isoformat(),
        "networkMode": "OFFLINE" if args.offline else "REAL_HTTP",
        "candidateSources": candidate_records, "probes": probes,
        "revalidationQueueSize": len(revalidation),
        "evidencePolicy": "URL reachability does not verify a claim; claim-level mapping and human/canonical review remain required.",
    }
    atomic_write_json(args.receipt, receipt)
    atomic_write_json(REVALIDATION_PATH, {
        "schemaVersion": "1.0.0", "generatedAt": now.isoformat(), "items": revalidation,
    })
    print(json.dumps({"status": "COMPLETED", "networkMode": receipt["networkMode"],
                      "candidates": len(candidate_records), "urlsProbed": len(probes),
                      "revalidationQueued": len(revalidation)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
