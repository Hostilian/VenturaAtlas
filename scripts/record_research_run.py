import json
import os
import sys
import datetime
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
runs_file = os.path.join(ROOT, "data", "research-runs.json")

def record_run(questions: list, queries: list, candidate_sources: list, inclusions: list, exclusions: list, claims_changed: list):
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

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run_id = f"run-res-{len(runs)+1:03d}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')}"

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
        "startedAt": now,
        "endedAt": now,
        "reviewStatus": "approved"
    }

    runs.append(run_entry)

    with open(runs_file, 'w', encoding='utf-8') as rf:
        json.dump(runs, rf, indent=2, ensure_ascii=False)
        rf.write('\n')

    print(f"[OK] Logged prospective research run '{run_id}' in data/research-runs.json (Total runs: {len(runs)}).")

if __name__ == "__main__":
    # Test record run
    record_run(
        questions=["How much better was reality because X happened?", "What donor conception family limits exist in EU law?"],
        queries=["ESHRE 2026 donor limits", "EU SoHO Regulation 2024/1938 implementation"],
        candidate_sources=["s63", "s64", "s65"],
        inclusions=["idea-385"],
        exclusions=[],
        claims_changed=["KinLedger #1 overall ranking verification"]
    )
