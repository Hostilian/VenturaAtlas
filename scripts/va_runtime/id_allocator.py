"""
Venture Atlas OS — Canonical ID Allocator
===========================================
Serializes canonical idea ID allocation ('idea-XXX') using thread locking
and file inspection to prevent ID collision across parallel workers.
"""

import os
import re
import threading
from typing import Optional
from .atomic_io import read_json_safe

_ALLOCATOR_LOCK = threading.Lock()
DEFAULT_IDEAS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'ideas.json')

def allocate_next_canonical_id(ideas_path: Optional[str] = None) -> str:
    """Safely allocate the next canonical idea-XXX ID under thread lock."""
    target_path = ideas_path or DEFAULT_IDEAS_PATH
    with _ALLOCATOR_LOCK:
        if os.path.exists(target_path):
            raw = read_json_safe(target_path, default_if_missing=[])
            ideas_list = raw if isinstance(raw, list) else raw.get("ideas", [])
        else:
            ideas_list = []

        max_num = 0
        for idea in ideas_list:
            idea_id = idea.get("id", "")
            match = re.match(r"^idea-(\d+)$", idea_id)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num

        next_num = max_num + 1
        return f"idea-{next_num:03d}"
