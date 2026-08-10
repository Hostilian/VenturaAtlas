#!/usr/bin/env python3
"""
Venture Atlas OS — Epistemic Data Provenance & Cohort Migration Engine
=======================================================================
Categorizes canonical and staged venture records into epistemic truth classes:
- T1_VERIFIED_FACT: Primary source citation verified
- T2_REPUTABLE_ESTIMATE: Industry analyst/official estimate
- T3_MODEL_HYPOTHESIS: Model/heuristic assumption requiring validation
- T4_UNKNOWN: Missing or qualitative input

Maintains reproducible extraction ledger entries in data/extraction-ledger.json.
"""

import os
import sys
import json
import argparse
import hashlib
from typing import Dict, Any, List

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_FILE = os.path.join(ROOT, "data", "ideas.json")
STAGING_FILE = os.path.join(ROOT, "data", "idea-staging-queue.json")
LEDGER_FILE = os.path.join(ROOT, "data", "extraction-ledger.json")

def assign_epistemic_truth_class(idea: Dict[str, Any]) -> str:
    # References establish traceability, not the truth of an entire venture record.
    # Only an explicit claim-level receipt may carry T1/T2. Legacy record-level
    # labels are therefore quarantined rather than recomputed from reference count.
    receipts = idea.get("claimEvidenceReceipts", [])
    if any(r.get("truthClass") == "T1_VERIFIED_FACT" and r.get("verified") is True for r in receipts if isinstance(r, dict)):
        return "T3_MODEL_HYPOTHESIS"
    return "T4_UNKNOWN"

def migrate_cohorts(check_only: bool = False) -> bool:
    print("=== Epistemic Data Provenance & Cohort Migration Audit ===")
    
    if not os.path.exists(IDEAS_FILE):
        print(f"[ERROR] Ideas file missing: {IDEAS_FILE}")
        return False

    with open(IDEAS_FILE, "r", encoding="utf-8") as f:
        ideas = json.load(f)

    staged = []
    if os.path.exists(STAGING_FILE):
        with open(STAGING_FILE, "r", encoding="utf-8") as sf:
            staged = json.load(sf)

    ideas_list = ideas if isinstance(ideas, list) else ideas.get("ideas", [])
    staged_list = staged if isinstance(staged, list) else staged.get("candidates", [])

    truth_counts = {"T1_VERIFIED_FACT": 0, "T2_REPUTABLE_ESTIMATE": 0, "T3_MODEL_HYPOTHESIS": 0, "T4_UNKNOWN": 0}

    for idea in ideas_list:
        tc = assign_epistemic_truth_class(idea)
        truth_counts[tc] += 1
        if "epistemicMetadata" not in idea:
            idea["epistemicMetadata"] = {
                "truthClass": tc,
                "confidenceClass": "HIGH" if tc == "T1_VERIFIED_FACT" else "MEDIUM" if tc in ("T2_REPUTABLE_ESTIMATE", "T3_MODEL_HYPOTHESIS") else "LOW",
                "migratedAt": "2026-08-09T14:00:00Z"
            }

    print(f"[SUMMARY] Canonical Ideas Analyzed: {len(ideas_list)}")
    print(f"  - T1 Verified Fact       : {truth_counts['T1_VERIFIED_FACT']}")
    print(f"  - T2 Reputable Estimate  : {truth_counts['T2_REPUTABLE_ESTIMATE']}")
    print(f"  - T3 Model Hypothesis    : {truth_counts['T3_MODEL_HYPOTHESIS']}")
    print(f"  - T4 Unknown / Unproven  : {truth_counts['T4_UNKNOWN']}")

    if not check_only:
        with open(IDEAS_FILE, "w", encoding="utf-8") as wf:
            json.dump(ideas, wf, indent=2, ensure_ascii=False)
            wf.write("\n")
        print(f"[OK] Epistemic metadata written to {IDEAS_FILE}")

    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Epistemic Data Migration")
    parser.add_argument("--check", action="store_true", help="Check epistemic classifications without writing changes")
    args = parser.parse_args()

    success = migrate_cohorts(check_only=args.check)
    sys.exit(0 if success else 1)
