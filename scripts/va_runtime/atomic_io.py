"""
Venture Atlas OS — Atomic I/O Primitives
=========================================
Guarantees atomic file replacements and safe JSON reads to prevent file corruption
during concurrent worker activity or sudden process terminations.
"""

import os
import json
import tempfile
from typing import Any

class JSONCorruptionError(RuntimeError):
    """Raised when an essential JSON file is corrupted or unparseable."""
    pass

def atomic_write_json(filepath: str, data: Any, indent: int = 2) -> None:
    """Atomically write data as JSON to filepath using a temporary file in the same directory."""
    directory = os.path.dirname(os.path.abspath(filepath))
    os.makedirs(directory, exist_ok=True)
    
    # 1. Validate payload serializability before creating temporary file
    serialized_text = json.dumps(data, ensure_ascii=False, indent=indent)
    
    # 2. Write to temporary file in target directory
    temp_fd, temp_path = tempfile.mkstemp(dir=directory, prefix=".tmp_va_", suffix=".json")
    try:
        with os.fdopen(temp_fd, 'w', encoding='utf-8') as f:
            f.write(serialized_text)
            f.flush()
            os.fsync(f.fileno())
        
        # 3. Verify written JSON readability
        with open(temp_path, 'r', encoding='utf-8') as check_f:
            json.load(check_f)
            
        # 4. Atomic replacement
        os.replace(temp_path, filepath)

        # 5. Directory fsync where supported
        try:
            dir_fd = os.open(directory, os.O_RDONLY)
            try:
                os.fsync(dir_fd)
            finally:
                os.close(dir_fd)
        except Exception:
            pass
    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
        raise IOError(f"Atomic JSON write failed for '{filepath}': {e}") from e

def read_json_safe(filepath: str, default_if_missing: Any = None) -> Any:
    """Safely read JSON file with explicit corruption error reporting."""
    if not os.path.exists(filepath):
        if default_if_missing is not None:
            return default_if_missing
        raise FileNotFoundError(f"JSON file not found: '{filepath}'")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise JSONCorruptionError(f"Corrupt JSON file detected at '{filepath}': {e}") from e
    except Exception as e:
        raise IOError(f"Error reading JSON file '{filepath}': {e}") from e
