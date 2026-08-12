"""
Venture Atlas OS — Serialized Canonical Publisher
==================================================
Only component authorized to assign canonical 'idea-XXX' IDs and publish
ideas to data/ideas.json. Holds cross-process file lock to prevent race conditions.
Implements structured promotion review gate (promotionReview) and transactional rollback.
"""

import os
import sys
import json
import datetime
import threading
import subprocess
import contextlib
import copy
from typing import Tuple, Dict, Any, List, Optional
from .atomic_io import atomic_write_bytes, atomic_write_json, read_json_safe
from .id_allocator import allocate_next_canonical_id
from .lifecycle import (
    RECEIPTS_PATH,
    canonical_projection,
    current_git_commit,
    sha256_json,
    validate_canonicalization_receipt,
)

_THREAD_LOCK = threading.Lock()
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "canonical-publisher.lock")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
SCHEMA_PATH = os.path.join(ROOT, "data", "ideas.schema.json")
TRANSACTION_PATHS = [
    IDEAS_PATH,
    RECEIPTS_PATH,
    os.path.join(ROOT, "data", "search-index.json"),
    os.path.join(ROOT, "data", "repository-meta.json"),
    os.path.join(ROOT, "data", "validation-summary.json"),
    os.path.join(ROOT, "data", "build-manifest.json"),
    os.path.join(ROOT, "README.md"),
    os.path.join(ROOT, "PROJECT_STATE.md"),
    os.path.join(ROOT, "PROJECT_STATUS.md"),
]

@contextlib.contextmanager
def process_file_lock(lock_path: str):
    os.makedirs(os.path.dirname(lock_path), exist_ok=True)
    f = open(lock_path, "w")
    try:
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
        else:
            import fcntl
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        yield
    finally:
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception:
            pass
        f.close()

def _validate_schema(document: Dict[str, Any]) -> List[str]:
    try:
        import jsonschema
        schema = read_json_safe(SCHEMA_PATH)
        errors = sorted(jsonschema.Draft7Validator(schema).iter_errors(document), key=lambda item: list(item.path))
        return [f"schema {'/'.join(map(str, error.path)) or '<root>'}: {error.message}" for error in errors]
    except ImportError:
        notes = []
        for idea in document.get("ideas", []):
            for field in ["id", "slug", "name", "category", "oneSentenceConcept"]:
                if not idea.get(field):
                    notes.append(f"schema {idea.get('id', '?')}: missing {field}")
        return notes


def _snapshot(paths: List[str]) -> Dict[str, Optional[bytes]]:
    return {path: open(path, "rb").read() if os.path.exists(path) else None for path in paths}


def _restore(snapshot: Dict[str, Optional[bytes]]) -> None:
    for path, payload in snapshot.items():
        if payload is None:
            if os.path.exists(path):
                os.remove(path)
        else:
            atomic_write_bytes(path, payload)


def evaluate_promotion_gates(candidate: Dict[str, Any], existing_ideas: List[Dict[str, Any]],
                             canonicalization_receipt: Optional[Dict[str, Any]] = None,
                             baseline_commit: Optional[str] = None) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Evaluate candidate readiness for canonical promotion across 5 explicit gates:
    - schema: required fields present
    - identity: valid slug and non-empty name
    - duplicate: no exact or normalized duplicate names/slugs
    - evidence: referenced source IDs resolve
    - authority: an upstream digest/baseline-bound canonicalization receipt
    """
    gates = {"schema": "passed", "identity": "passed", "duplicate": "passed", "evidence": "passed", "authority": "passed"}
    notes = []
    failed = False

    # 1. Identity & Schema Check
    required_fields = ["name", "category", "oneSentenceConcept"]
    for field in required_fields:
        if not candidate.get(field):
            gates["schema"] = "failed"
            notes.append(f"Missing required field '{field}'")
            failed = True

    cand_name = candidate.get("name", "").strip()
    if not cand_name:
        gates["identity"] = "failed"
        notes.append("Candidate has empty name")
        failed = True
    cand_slug = str(candidate.get("slug") or candidate.get("candidateSlug") or "").strip().lower()
    if not cand_slug:
        gates["identity"] = "failed"
        notes.append("Candidate has no slug/candidateSlug")
        failed = True

    # 2. Duplicate Gate & Identity Gate
    norm_name = cand_name.lower()
    for existing in existing_ideas:
        ex_name = existing.get("name", "").strip().lower()
        ex_slug = existing.get("slug", "").strip().lower()
        if ex_name == norm_name or (cand_slug and ex_slug == cand_slug):
            gates["duplicate"] = "failed"
            notes.append(f"Duplicate idea name/slug '{cand_name}' already exists in canonical corpus")
            failed = True
            break

    # 3. Evidence Gate
    sources = candidate.get("sourceReferences", [])
    if not isinstance(sources, list):
        gates["evidence"] = "failed"
        notes.append("sourceReferences must be a list")
        failed = True
    else:
        source_document = read_json_safe(SOURCES_PATH, default_if_missing=[])
        source_records = source_document if isinstance(source_document, list) else source_document.get("sources", [])
        known_source_ids = {source.get("id") for source in source_records}
        unknown = sorted({str(source_id) for source_id in sources if source_id not in known_source_ids})
        if unknown:
            gates["evidence"] = "failed"
            notes.append(f"Unknown source IDs: {', '.join(unknown)}")
            failed = True

    # 4. Receipt authority. promotionEligible is intentionally ignored.
    if not isinstance(canonicalization_receipt, dict):
        gates["authority"] = "failed"
        notes.append("A reviewed CANONICALIZE receipt is required")
        failed = True
    else:
        receipt_ok, receipt_errors = validate_canonicalization_receipt(
            candidate, canonicalization_receipt, baseline_commit or current_git_commit()
        )
        if not receipt_ok:
            gates["authority"] = "failed"
            notes.extend(f"Receipt: {error}" for error in receipt_errors)
            failed = True

    if candidate.get("killCriteria", {}).get("killFlagged") is True:
        gates["authority"] = "failed"
        notes.append("Candidate has killCriteria.killFlagged = true")
        failed = True

    review = {
        "status": "rejected" if failed else "approved",
        "reviewedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "reviewer": "canonical-publisher-receipt-enforcer",
        "sourceCandidateId": candidate.get("id", "candidate-unknown"),
        "gates": gates,
        "notes": notes
    }

    return not failed, review, notes

def publish_candidate(candidate: Dict[str, Any], canonicalization_receipt: Optional[Dict[str, Any]] = None) -> Tuple[bool, str, Optional[str]]:
    """
    Atomically validate promotion review gates, assign canonical idea-XXX ID,
    append to ideas.json, and trigger derived build scripts with transactional rollback.
    """
    with _THREAD_LOCK:
        with process_file_lock(LOCK_PATH):
            if not os.path.exists(IDEAS_PATH):
                ideas_raw = {"schemaVersion": "2.0.0", "ideas": []}
            else:
                ideas_raw = read_json_safe(IDEAS_PATH, default_if_missing={"schemaVersion": "2.0.0", "ideas": []})

            ideas_list = ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw
            baseline_commit = current_git_commit()
            transaction_snapshot = _snapshot(TRANSACTION_PATHS)

            # 1. Evaluate Promotion Review Gates
            passed, review, notes = evaluate_promotion_gates(
                candidate, ideas_list, canonicalization_receipt, baseline_commit
            )
            if not passed:
                return False, f"Promotion gate failed: {'; '.join(notes)}", None

            # 2. Allocate next canonical idea-XXX ID
            canonical_id = allocate_next_canonical_id(IDEAS_PATH)
            published_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            projected_candidate = canonical_projection(
                candidate, canonical_id, canonicalization_receipt["receiptId"], published_at
            )
            projected_candidate["promotionReview"] = review

            post_document = {"schemaVersion": "2.0.0", "ideas": [*ideas_list, projected_candidate]}
            schema_errors = _validate_schema(post_document)
            if schema_errors:
                return False, f"Promotion gate failed: {'; '.join(schema_errors[:5])}", None

            # 3. Append to canonical ideas list
            ideas_list.append(projected_candidate)

            receipt_document = read_json_safe(
                RECEIPTS_PATH, default_if_missing={"schemaVersion": "1.0.0", "receipts": []}
            )
            existing_receipt_ids = {item.get("receiptId") for item in receipt_document.get("receipts", [])}
            if canonicalization_receipt["receiptId"] in existing_receipt_ids:
                return False, "Promotion gate failed: lifecycle receiptId already exists", None
            stored_receipt = copy.deepcopy(canonicalization_receipt)
            stored_receipt["canonicalIdeaId"] = canonical_id
            stored_receipt["canonicalDigest"] = sha256_json(projected_candidate)
            receipt_document.setdefault("receipts", []).append(stored_receipt)

            # 4. Atomic write to data/ideas.json
            atomic_write_json(IDEAS_PATH, {"schemaVersion": "2.0.0", "ideas": ideas_list})
            atomic_write_json(RECEIPTS_PATH, receipt_document)

            # 5. Transactional Build Verification
            npm_cmd = ["npm.cmd", "run", "generate"] if os.name == "nt" else ["npm", "run", "generate"]
            try:
                res = subprocess.run(npm_cmd, cwd=ROOT, capture_output=True, text=True, timeout=180)
                if res.returncode != 0:
                    _restore(transaction_snapshot)
                    return False, f"Transactional publication rollback: derived generation failed: {res.stderr.strip()[:200]}", None
                checks = [
                    [sys.executable, "scripts/validate-schema.py"],
                    ["node", "scripts/check-repository-consistency.js"],
                ]
                for command in checks:
                    checked = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=120)
                    if checked.returncode != 0:
                        _restore(transaction_snapshot)
                        message = (checked.stderr or checked.stdout).strip()[:240]
                        return False, f"Transactional publication rollback: post-write validation failed: {message}", None
            except Exception as e:
                _restore(transaction_snapshot)
                return False, f"Transactional publication rollback exception: {str(e)}", None

            return True, f"Successfully published canonical idea '{canonical_id}'", canonical_id
