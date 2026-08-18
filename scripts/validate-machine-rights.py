#!/usr/bin/env python3
"""Validate OMEGA XVI research-only machine-interface records."""
from __future__ import annotations
import json
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]

def main() -> int:
    wave = json.loads((ROOT / "data/omega-xvi-machine-rights-research.json").read_text(encoding="utf-8"))
    radar = json.loads((ROOT / "data/mandatory-interface-radar.json").read_text(encoding="utf-8"))
    errors = []
    ideas = wave.get("ideas", [])
    interfaces = radar.get("interfaces", [])
    if wave.get("promotionEligible") is not False: errors.append("OMEGA XVI wave must remain non-promotable")
    if len(ideas) != 12: errors.append(f"expected 12 OMEGA XVI rows, found {len(ideas)}")
    if len(interfaces) < 8: errors.append("mandatory interface radar is incomplete")
    ids = [i.get("name") for i in ideas]
    if len(ids) != len(set(ids)): errors.append("duplicate OMEGA XVI candidate name")
    for idea in ideas:
        if not idea.get("whatWouldKill"): errors.append(f"{idea.get('name')}: missing kill condition")
        if idea.get("decision") not in {"DISTINCT_PROPOSAL_STAGE", "MODULE_OR_FEATURE", "WATCH_SIGNAL", "REJECTED_OR_KILLED"}: errors.append(f"{idea.get('name')}: invalid decision")
        for source in idea.get("sources", []):
            if not source.startswith(("https://", "http://")): errors.append(f"{idea.get('name')}: invalid source")
    for item in interfaces:
        if item.get("date") is not None:
            try: date.fromisoformat(item["date"])
            except ValueError: errors.append(f"{item.get('interfaceId')}: invalid date")
        if item.get("dateKind") not in {"CONFIRMED", "EXPECTED_OR_POLICY_TARGET", "ONGOING"}: errors.append(f"{item.get('interfaceId')}: date kind missing")
        if not item.get("sourceRefs"): errors.append(f"{item.get('interfaceId')}: missing source")
    if errors:
        print("Machine-rights validation failed:")
        print("\n".join(f"- {e}" for e in errors))
        return 1
    print(f"Machine-rights validation passed: {len(ideas)} candidates, {len(interfaces)} radar interfaces")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
