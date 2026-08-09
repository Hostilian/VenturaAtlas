"""Codex hook guardrails for Venture Atlas.

The hook consumes one JSON object from stdin, writes a bounded receipt containing
only non-sensitive metadata, and denies a deliberately small set of destructive
or source-of-truth-bypassing operations. It is defense in depth, not a complete
security boundary.
"""

from __future__ import annotations

import datetime as dt
import json
import pathlib
import re
import subprocess
import sys
from typing import Any


MAX_RECEIPTS = 200


def repository_root() -> pathlib.Path:
    completed = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        check=True,
        capture_output=True,
        text=True,
    )
    return pathlib.Path(completed.stdout.strip()).resolve()


def load_event() -> dict[str, Any]:
    try:
        value = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError) as exc:
        raise ValueError(f"invalid hook input: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError("hook input must be a JSON object")
    return value


def command_text(event: dict[str, Any]) -> str:
    tool_input = event.get("tool_input")
    if not isinstance(tool_input, dict):
        return ""
    command = tool_input.get("command")
    return command if isinstance(command, str) else ""


def denied_reason(event: dict[str, Any]) -> str | None:
    event_name = event.get("hook_event_name")
    if event_name != "PreToolUse":
        return None

    tool_name = str(event.get("tool_name", ""))
    command = command_text(event)
    normalized = re.sub(r"\s+", " ", command.lower()).strip()

    if tool_name == "Bash":
        if re.search(r"(^|[;&|]\s*)git\s+reset\s+--hard(?:\s|$)", normalized):
            return "git reset --hard is forbidden; preserve user work and use a scoped recovery path"
        if re.search(r"(^|[;&|]\s*)git\s+clean\s+-[^\s]*f", normalized):
            return "git clean with force is forbidden; resolve and preserve exact untracked paths"
        if re.search(r"git\s+remote\s+set-url[^\r\n]*https?://[^\s/@]+:[^\s/@]+@", command, re.I):
            return "credentials in Git remote URLs are forbidden; use a credential helper or auth header"

    if tool_name == "apply_patch":
        for match in re.finditer(
            r"^\*\*\* (?:Add|Update|Delete) File: (.+)$", command, re.M
        ):
            path = pathlib.PurePosixPath(match.group(1).strip().replace("\\", "/"))
            if "_site" in path.parts:
                return "direct _site edits are forbidden; change the source or generator"
            if len(path.parts) >= 2 and path.parts[-2:] == ("data", "ideas.json"):
                return "direct canonical idea edits are forbidden; use the authorized publisher lifecycle"

    return None


def append_receipt(root: pathlib.Path, event: dict[str, Any], decision: str) -> None:
    runtime_dir = root / ".codex" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    receipt_path = runtime_dir / "hook-receipts.jsonl"
    record = {
        "at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "event": str(event.get("hook_event_name", "unknown")),
        "tool": str(event.get("tool_name", "")) or None,
        "decision": decision,
    }
    existing: list[str] = []
    if receipt_path.exists():
        existing = receipt_path.read_text(encoding="utf-8").splitlines()[-(MAX_RECEIPTS - 1) :]
    existing.append(json.dumps(record, sort_keys=True, separators=(",", ":")))
    temporary = receipt_path.with_suffix(".tmp")
    temporary.write_text("\n".join(existing) + "\n", encoding="utf-8")
    temporary.replace(receipt_path)


def main() -> int:
    try:
        event = load_event()
        root = repository_root()
        reason = denied_reason(event)
        append_receipt(root, event, "deny" if reason else "allow")
    except Exception as exc:  # Fail closed for a configured enforcement hook.
        print(f"Venture Atlas hook failed: {exc}", file=sys.stderr)
        return 2

    if reason:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
        print(json.dumps(output, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
