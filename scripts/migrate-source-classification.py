"""One-way migration to explicit source visibility and epistemic classes."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "data" / "sources.json"
CLASSIFIER_VERSION = "source-visibility-v1"

INTERNAL_TYPES = {
    "conversation_export",
    "conversation_summary",
    "original_prompt",
    "prompt_file",
    "repository_file",
    "scripts_and_logs",
    "user_prompt",
}
CONTEXTUAL_TYPES = {"research_report"}
OFFICIAL_TYPES = {
    "developer_documentation",
    "eu_directive",
    "eu_portal",
    "eu_recommendation",
    "eu_regulation",
    "executive_order",
    "federal_order",
    "federal_policy",
    "g7_guideline",
    "government_alert",
    "government_research",
    "government_service",
    "grid_guidance",
    "guideline",
    "open_standard",
    "position_paper",
    "protocol_documentation",
    "regulatory_guidance",
    "regulatory_recommendation",
    "reliability_alert",
    "rto_initiative",
    "safety_alert",
    "technical_documentation",
}
RESEARCH_TYPES = {"academic_paper", "preprint", "research_report", "security_research"}
COMMUNITY_TYPES = {"forum_discussion"}
COMPANY_TYPES = {
    "company_announcement",
    "developer_blog",
    "industry_report",
    "industry_research",
    "market_announcement",
    "press_release",
    "pricing_page",
    "product_announcement",
    "product_page",
    "product_website",
    "startup_website",
    "thought_leadership",
    "trade_press",
    "vc_portfolio_page",
}


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def atomic_json_write(path: pathlib.Path, value: object) -> None:
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, delete=False, newline="\n"
    ) as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
        temporary = pathlib.Path(handle.name)
    os.replace(temporary, path)


def classify(source: dict[str, object]) -> tuple[str, str, bool, bool]:
    source_type = source.get("type")
    has_public_url = isinstance(source.get("url"), str) and str(source["url"]).startswith(
        ("https://", "http://")
    )
    if source_type in INTERNAL_TYPES or (source_type in CONTEXTUAL_TYPES and not has_public_url):
        if "url" in source:
            raise ValueError(f"{source.get('id')}: internal type unexpectedly has a URL")
        return "INTERNAL", "INTERNAL_PROVENANCE_ARTIFACT", False, True
    if not has_public_url:
        raise ValueError(f"{source.get('id')}: external source requires HTTP(S) URL")
    if source_type in OFFICIAL_TYPES:
        source_class = "PRIMARY_OR_OFFICIAL"
    elif source_type in RESEARCH_TYPES:
        source_class = "RESEARCH_PUBLICATION"
    elif source_type in COMMUNITY_TYPES:
        source_class = "COMMUNITY"
    elif source_type in COMPANY_TYPES:
        source_class = "COMPANY_OR_INDUSTRY"
    else:
        raise ValueError(f"{source.get('id')}: unclassified source type {source_type!r}")
    return "PUBLIC", source_class, True, True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="atomically replace sources.json")
    parser.add_argument("--receipt", type=pathlib.Path)
    args = parser.parse_args()

    before_hash = sha256(SOURCE_PATH)
    raw = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    sources = raw if isinstance(raw, list) else raw.get("sources", [])
    if not isinstance(sources, list):
        raise ValueError("data/sources.json must contain a list")

    migrated: list[dict[str, object]] = []
    counts = {"PUBLIC": 0, "INTERNAL": 0, "PRIVATE": 0}
    for original in sources:
        source = dict(original)
        visibility, source_class, evidence_eligible, provenance_eligible = classify(source)
        source["visibility"] = visibility
        source["sourceClass"] = source_class
        source["evidenceEligible"] = evidence_eligible
        source["provenanceEligible"] = provenance_eligible
        counts[visibility] += 1
        migrated.append(source)

    print(json.dumps({"classifierVersion": CLASSIFIER_VERSION, "counts": counts}, sort_keys=True))
    if not args.apply:
        print("[CHECK] No files changed; pass --apply to write the migration.")
        return 0

    atomic_json_write(SOURCE_PATH, migrated)
    after_hash = sha256(SOURCE_PATH)
    if args.receipt:
        receipt_path = args.receipt if args.receipt.is_absolute() else ROOT / args.receipt
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        atomic_json_write(
            receipt_path,
            {
                "classifierVersion": CLASSIFIER_VERSION,
                "appliedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
                "inputSha256": before_hash,
                "outputSha256": after_hash,
                "recordCount": len(migrated),
                "counts": counts,
            },
        )
    print(f"[OK] Migrated {len(migrated)} source records atomically: {before_hash[:12]} -> {after_hash[:12]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
