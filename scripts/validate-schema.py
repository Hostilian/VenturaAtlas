"""Validate the canonical collection against its one authoritative schema."""

from __future__ import annotations

import json
import sys
from pathlib import Path


root = Path(__file__).resolve().parents[1]
ideas_file = root / "data" / "ideas.json"
schema_file = root / "data" / "ideas.schema.json"

raw = json.loads(ideas_file.read_text(encoding="utf-8"))
schema = json.loads(schema_file.read_text(encoding="utf-8"))
ideas = raw.get("ideas", []) if isinstance(raw, dict) else []
errors: list[str] = []

try:
    import jsonschema

    validator = jsonschema.Draft7Validator(schema)
    for error in validator.iter_errors(raw):
        location = "/".join(str(part) for part in error.absolute_path) or "<root>"
        errors.append(f"{location}: {error.message}")
except ImportError:
    # Minimal fallback still enforces the wrapper and required record keys.
    if not isinstance(raw, dict) or not isinstance(raw.get("ideas"), list):
        errors.append("<root>: expected object with ideas array")
    required = schema["$defs"]["idea"]["required"]
    for index, idea in enumerate(ideas):
        for field in required:
            if not idea.get(field):
                errors.append(f"ideas/{index}: missing required field {field}")

print(json.dumps({"schema": "data/ideas.schema.json", "ideas": len(ideas), "errors": errors}, indent=2))
sys.exit(bool(errors))
