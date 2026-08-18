#!/usr/bin/env python3
"""Fail-closed validation for the ProofOps research and experiment registries."""
from __future__ import annotations
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

def main() -> int:
    research = json.loads((ROOT / "data/proofops-research.json").read_text(encoding="utf-8"))
    experiments = json.loads((ROOT / "data/proofops-experiments.json").read_text(encoding="utf-8"))
    candidates = research.get("candidates", [])
    exps = experiments.get("experiments", [])
    errors: list[str] = []
    if research.get("promotionEligible") is not False:
        errors.append("research registry must remain non-promotable")
    if len(candidates) != 11:
        errors.append(f"expected 11 ProofOps candidates, found {len(candidates)}")
    if len(exps) != len(candidates):
        errors.append("every ProofOps candidate must have one prospective experiment")
    ids = [c.get("candidateId") for c in candidates]
    if len(ids) != len(set(ids)):
        errors.append("duplicate candidateId")
    exp_ids = [e.get("experimentId") for e in exps]
    if len(exp_ids) != len(set(exp_ids)):
        errors.append("duplicate experimentId")
    for c in candidates:
        for key in ("whatWouldKill", "changedSinceLastResearch", "negativeEvidence"):
            if not c.get(key): errors.append(f"{c.get('candidateId')}: missing {key}")
        if c.get("realityStage") != "DESK_RESEARCH":
            errors.append(f"{c.get('candidateId')}: unearned reality stage")
        for ref in c.get("sourceRefs", []):
            if urlparse(ref).scheme not in {"http", "https"}:
                errors.append(f"{c.get('candidateId')}: invalid source URI")
    for e in exps:
        if e.get("result") is not None or e.get("decision") is not None:
            errors.append(f"{e.get('experimentId')}: prospective experiment has a claimed result")
    if errors:
        print("ProofOps validation failed:")
        print("\n".join(f"- {e}" for e in errors))
        return 1
    print(f"ProofOps validation passed: {len(candidates)} candidates, {len(exps)} unrun experiments, promotionEligible=false")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
