import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUN_ID = "run-res-017-20260817-expansion-vii-transition-failure-detectors"
SLUGS = {"pidrelay-eu-customs-catalog-preflight", "permitecho-industrial-permit-evidence-reconciler"}


def test_expansion_vii_is_private_staging_only():
    queue = json.loads((ROOT / "data" / "idea-staging-queue.json").read_text(encoding="utf-8"))
    staged = [item for item in queue if item.get("candidateSlug") in SLUGS]
    assert {item["candidateSlug"] for item in staged} == SLUGS
    assert all(item["promotionEligible"] is False for item in staged)
    assert all(item["atAGlance"]["overallScore"] is None for item in staged)
    assert all(item["provenance"]["researchRunId"] == RUN_ID for item in staged)


def test_expansion_vii_run_records_unvalidated_gates():
    runs = json.loads((ROOT / "data" / "research-runs.json").read_text(encoding="utf-8"))
    run = next(item for item in runs if item["runId"] == RUN_ID)
    assert run["reviewStatus"] == "approved_for_private_staging_and_validation_not_canonical_promotion"
    assert len(run["inclusions"]) == 2
    assert len(run["immediateExperiments"]) == 2
