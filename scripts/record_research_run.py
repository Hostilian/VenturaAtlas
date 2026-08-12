import json
import os
import sys
import datetime
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
runs_file = os.path.join(ROOT, "data", "research-runs.json")

def record_run(questions: list, queries: list, candidate_sources: list, inclusions: list,
               exclusions: list, claims_changed: list, *, started_at: str,
               ended_at: str, receipt_maturity: str = "R0_DECLARED",
               tool_receipts: list | None = None, decision_delta: str = ""):
    runs = []
    if os.path.exists(runs_file):
        try:
            with open(runs_file, 'r', encoding='utf-8') as f:
                runs = json.load(f)
        except Exception:
            runs = []

    commit = "local-dev"
    try:
        commit = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, text=True).strip()
    except Exception:
        pass

    run_id = f"run-res-{len(runs)+1:03d}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')}"

    start = datetime.datetime.fromisoformat(started_at.replace("Z", "+00:00"))
    end = datetime.datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
    if end < start:
        raise ValueError("ended_at precedes started_at")
    if receipt_maturity not in {
        "R0_DECLARED", "R1_IMPORTED", "R2_EXECUTED", "R3_SCREENED",
        "R4_CLAIM_MAPPED", "R5_ADVERSARIAL", "R6_REVIEWED", "R7_DECISION_INTEGRATED"
    }:
        raise ValueError("unknown research receipt maturity")
    if receipt_maturity not in {"R0_DECLARED", "R1_IMPORTED"} and end <= start:
        raise ValueError("executed research cannot have zero duration")
    if receipt_maturity in {"R2_EXECUTED", "R3_SCREENED", "R4_CLAIM_MAPPED", "R5_ADVERSARIAL", "R6_REVIEWED", "R7_DECISION_INTEGRATED"} and not tool_receipts:
        raise ValueError("executed research requires tool execution receipts")
    if receipt_maturity == "R7_DECISION_INTEGRATED" and not decision_delta.strip():
        raise ValueError("R7 requires an explicit decision delta")

    run_entry = {
        "runId": run_id,
        "baselineCommit": commit,
        "questions": questions,
        "queries": queries,
        "sourceCandidates": candidate_sources,
        "inclusions": inclusions,
        "exclusions": exclusions,
        "claimsChanged": claims_changed,
        "agent": "research-intelligence-agent",
        "methodVersion": "epistemic-v2",
        "startedAt": start.astimezone(datetime.timezone.utc).isoformat(),
        "endedAt": end.astimezone(datetime.timezone.utc).isoformat(),
        "receiptMaturity": receipt_maturity,
        "toolReceipts": tool_receipts or [],
        "decisionDelta": decision_delta,
        "reviewStatus": "unreviewed"
    }

    runs.append(run_entry)

    with open(runs_file, 'w', encoding='utf-8') as rf:
        json.dump(runs, rf, indent=2, ensure_ascii=False)
        rf.write('\n')

    print(f"[OK] Logged prospective research run '{run_id}' in data/research-runs.json (Total runs: {len(runs)}).")

if __name__ == "__main__":
    raise SystemExit(
        "This module no longer manufactures example research runs. Import record_run and provide "
        "prospective timestamps, tool receipts, and truthful maturity."
    )
