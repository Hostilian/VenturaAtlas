#!/usr/bin/env python3
"""Render the authoritative autonomy backlog JSON as a reviewable Markdown table."""

import json
import os
import sys


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.atomic_io import atomic_write_bytes


SOURCE = os.path.join(ROOT, ".agent-system", "backlog.json")
TARGET = os.path.join(ROOT, ".agent-system", "BACKLOG.md")


def main() -> int:
    with open(SOURCE, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    tasks = payload.get("tasks", [])
    lines = [
        "# VENTURAATLAS — AUTHORITATIVE AUTONOMY BACKLOG",
        "",
        "Generated from `.agent-system/backlog.json`; edit the JSON authority and rerender.",
        "",
        "| ID | Title | Priority | Domain | Status | Recurrence | Worker |",
        "|---|---|---:|---|---|---|---|",
    ]
    for task in tasks:
        cells = [
            task.get("id", ""),
            task.get("title", ""),
            task.get("priorityScore", ""),
            task.get("domain", ""),
            task.get("status", ""),
            task.get("recurrence", "one-shot"),
            task.get("assignedAgent", ""),
        ]
        escaped = [str(value).replace("|", "\\|").replace("\n", " ") for value in cells]
        lines.append("| " + " | ".join(escaped) + " |")
    lines.extend(["", f"Total authoritative tasks: **{len(tasks)}**", ""])
    atomic_write_bytes(TARGET, "\n".join(lines).encode("utf-8"))
    print(f"[OK] Rendered {len(tasks)} tasks to {TARGET}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
