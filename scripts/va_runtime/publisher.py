"""
Venture Atlas OS — Serialized Canonical Publisher
==================================================
Only component authorized to assign canonical 'idea-XXX' IDs and publish
ideas to data/ideas.json. Holds cross-process file lock to prevent race conditions.
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

def publish_candidate(candidate: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
    """
    Atomically validate, assign canonical idea-XXX ID, append to ideas.json,
    and trigger dossier generation while holding process and thread lock.
    """
    with _THREAD_LOCK:
        with process_file_lock(LOCK_PATH):
            if not os.path.exists(IDEAS_PATH):
                ideas_raw = {"schemaVersion": "2.0.0", "ideas": []}
            else:
                ideas_raw = read_json_safe(IDEAS_PATH, default_if_missing={"schemaVersion": "2.0.0", "ideas": []})
            
            ideas_list = ideas_raw.get("ideas", []) if isinstance(ideas_raw, dict) else ideas_raw
            
            # 1. Check for duplicate slug or name
            cand_name = candidate.get("name", "").strip().lower()
            for existing in ideas_list:
                if existing.get("name", "").strip().lower() == cand_name:
                    return False, f"Duplicate idea name '{cand_name}' already exists in canonical corpus", None
            
            # 2. Allocate next canonical idea-XXX ID
            canonical_id = allocate_next_canonical_id(IDEAS_PATH)
            candidate["id"] = canonical_id
            candidate["publishedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            # 3. Append to canonical ideas list
            ideas_list.append(candidate)
            
            # 4. Atomic write to data/ideas.json
            atomic_write_json(IDEAS_PATH, {"schemaVersion": "2.0.0", "ideas": ideas_list})
            
            # 5. Trigger derived build scripts
            try:
                subprocess.run(["npm", "run", "generate"], cwd=ROOT, check=False, shell=True)
            except Exception:
                pass

            return True, f"Successfully published canonical idea '{canonical_id}'", canonical_id
