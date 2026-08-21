import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUN_ID = "run-res-017-20260817-expansion-vii-transition-failure-detectors"


def test_expansion_vii_is_private_staging_only():
    catalog = json.loads((ROOT / "data" / "research-proposal-catalog.json").read_text(encoding="utf-8"))
    records = [item for item in catalog["proposals"] if item.get("sourceRunId") == RUN_ID]
    included = [item for item in records if item.get("relation") == "RAW_HYPOTHESIS"]
    assert len(included) == 2
    assert all(item["rankingEligible"] is False for item in included)
    assert all("not canonical promotion" in item["decision"].lower() for item in included)


def test_expansion_vii_run_records_unvalidated_gates():
    runs = json.loads((ROOT / "data" / "research-runs.json").read_text(encoding="utf-8"))
    run = next(item for item in runs if item["runId"] == RUN_ID)
    assert run["reviewStatus"] == "approved_for_private_staging_and_validation_not_canonical_promotion"
    assert len(run["inclusions"]) == 2
    assert len(run["immediateExperiments"]) == 2
