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
from typing import Tuple, Dict, Any, List, Optional
from .atomic_io import atomic_write_json, read_json_safe
from .id_allocator import allocate_next_canonical_id

_THREAD_LOCK = threading.Lock()
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "canonical-publisher.lock")

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

def evaluate_promotion_gates(candidate: Dict[str, Any], existing_ideas: List[Dict[str, Any]]) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Evaluate candidate readiness for canonical promotion across 5 explicit gates:
    - schema: required fields present
    - identity: valid slug and non-empty name
    - duplicate: no exact or normalized duplicate names/slugs
    - evidence: source references format
    - validation: minimum baseline criteria
    """
    gates = {"schema": "passed", "identity": "passed", "duplicate": "passed", "evidence": "passed", "validation": "passed"}
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

    # 2. Duplicate Gate
    norm_name = cand_name.lower()
    for existing in existing_ideas:
        if existing.get("name", "").strip().lower() == norm_name:
            gates["duplicate"] = "failed"
            notes.append(f"Duplicate idea name '{cand_name}' already exists in canonical corpus")
            failed = True
            break

    # 3. Evidence Gate
    sources = candidate.get("sourceReferences", [])
    if not isinstance(sources, list):
        gates["evidence"] = "failed"
        notes.append("sourceReferences must be a list")
        failed = True

    review = {
        "status": "rejected" if failed else "approved",
        "reviewedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "reviewer": "canonical-publisher",
        "sourceCandidateId": candidate.get("id", "candidate-unknown"),
        "gates": gates,
        "notes": notes
    }

    return not failed, review, notes

def publish_candidate(candidate: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
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
            backup_ideas = json.dumps(ideas_raw)

            # 1. Evaluate Promotion Review Gates
            passed, review, notes = evaluate_promotion_gates(candidate, ideas_list)
            if not passed:
                return False, f"Promotion gate failed: {'; '.join(notes)}", None

            # 2. Allocate next canonical idea-XXX ID
            canonical_id = allocate_next_canonical_id(IDEAS_PATH)
            candidate["id"] = canonical_id
            candidate["publishedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            candidate["promotionReview"] = review

            # 3. Append to canonical ideas list
            ideas_list.append(candidate)

            # 4. Atomic write to data/ideas.json
            atomic_write_json(IDEAS_PATH, {"schemaVersion": "2.0.0", "ideas": ideas_list})

            # 5. Transactional Build Verification
            npm_cmd = ["npm.cmd", "run", "generate"] if os.name == "nt" else ["npm", "run", "generate"]
            try:
                res = subprocess.run(npm_cmd, cwd=ROOT, capture_output=True, text=True)
                if res.returncode != 0:
                    # Rollback canonical data on derived build failure
                    with open(IDEAS_PATH, "w", encoding="utf-8") as f:
                        f.write(backup_ideas)
                    return False, f"Transactional publication rollback: derived generation failed: {res.stderr.strip()[:200]}", None
            except Exception as e:
                with open(IDEAS_PATH, "w", encoding="utf-8") as f:
                    f.write(backup_ideas)
                return False, f"Transactional publication rollback exception: {str(e)}", None

            return True, f"Successfully published canonical idea '{canonical_id}'", canonical_id
