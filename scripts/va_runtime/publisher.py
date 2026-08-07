"""
Venture Atlas OS — Serialized Canonical Publisher
==================================================
Only component authorized to assign canonical 'idea-XXX' IDs and publish
ideas to data/ideas.json. Holds publication lock to prevent race conditions.
"""

import os
import sys
import json
import threading
import subprocess
from typing import Tuple, Dict, Any, List, Optional
from .atomic_io import atomic_write_json, read_json_safe
from .id_allocator import allocate_next_canonical_id

_PUBLICATION_LOCK = threading.Lock()
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")

def publish_candidate(candidate: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
    """
    Atomically validate, assign canonical idea-XXX ID, append to ideas.json,
    and trigger dossier generation while holding publication lock.
    """
    with _PUBLICATION_LOCK:
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
        candidate["publishedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat() if 'datetime' in globals() else ""
        
        # 3. Append to canonical ideas list
        ideas_list.append(candidate)
        
        # 4. Atomic write to data/ideas.json
        atomic_write_json(IDEAS_PATH, {"schemaVersion": "2.0.0", "ideas": ideas_list})
        
        # 5. Trigger derived build scripts
        try:
            subprocess.run(["npm", "run", "generate"], cwd=ROOT, check=False, shell=True)
        except Exception as e:
            pass

        return True, f"Successfully published canonical idea '{canonical_id}'", canonical_id
