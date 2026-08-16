#!/usr/bin/env python3
"""Build the public, lossless catalog of supplied deep-research proposals.

The committed reconciliation tables are the public authority. Private staging data is
intentionally never opened by this script. Similarity families are thematic browsing
groups, not identity or deduplication claims.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "research-proposal-catalog.json"

TABLE_ROUNDS = (
    {
        "id": "full-reset-2026-08-10",
        "title": "Full Reset — 10 August 2026",
        "path": "research/LEGACY_RESEARCH_PROPOSAL_RECONCILIATION.md",
        "section": "Full Reset — 10 August 2026",
        "expected": 60,
        "attachmentSha256": "15EB67AEA7C2AA867C53C84E35DDE968242902E1A2B1BAD219137ECD54F1B1E1",
    },
    {
        "id": "frontier-reset-2026-08-10",
        "title": "Another Full Frontier Reset — 10 August 2026",
        "path": "research/LEGACY_RESEARCH_PROPOSAL_RECONCILIATION.md",
        "section": "Another Full Frontier Reset — 10 August 2026",
        "expected": 60,
        "attachmentSha256": "2F4D0CF7A8750A44003123240F3CA7525335B3C1B5F9BB41075029DFFB03D9CB",
    },
    {
        "id": "full-reset-2026-08-11",
        "title": "Full August 11 Reset",
        "path": "research/LEGACY_RESEARCH_PROPOSAL_RECONCILIATION.md",
        "section": "Full August 11 Reset",
        "expected": 60,
        "attachmentSha256": "D6A5AF0E0AEFCBC22D76124D921D6B18D8465BB8358278445EC3205B230C7579",
    },
    {
        "id": "august-operational-chokepoints",
        "title": "August 2026 Operational Chokepoints",
        "path": "research/deepresearch-august-2026-operational-chokepoints.md",
        "expected": 15,
        "attachmentSha256": None,
    },
    {
        "id": "expansion-round-i",
        "title": "Deep Research Expansion Round I",
        "path": "research/DEEP_RESEARCH_EXPANSION_ROUND_2026-08-12.md",
        "expected": 15,
        "attachmentSha256": "87EC556AEC8FEE797CA8AAC74813011E8BDD5036210964B8E2711D01EF64943F",
    },
    {
        "id": "fresh-opportunity-round",
        "title": "Fresh 2026 Opportunity Round",
        "path": "research/DEEP_RESEARCH_FRESH_OPPORTUNITY_ROUND_2026-08-12.md",
        "expected": 20,
        "attachmentSha256": "4BF521CBFD84C466A6650E95AB3A7B00D99B6635E60198A01C2991B6FB9E2768",
    },
    {
        "id": "expansion-iii",
        "title": "Deep Research Expansion III",
        "path": "research/DEEP_RESEARCH_EXPANSION_III_2026-08-12.md",
        "expected": 24,
        "attachmentSha256": "08E647ECB9DC1921A0FD74F378B50F6F31C8FA2A81BB90A70183CCC5E086197C",
    },
    {
        "id": "expansion-iv",
        "title": "Deep Research Expansion IV",
        "path": "research/DEEP_RESEARCH_EXPANSION_IV_2026-08-12.md",
        "expected": 20,
        "attachmentSha256": "0A82BCDB36678B858C26ABBE19101DC4312FE4692B45EF20C4D11EFEAE0C4E1F",
    },
    {
        "id": "expansion-v",
        "title": "Deep Research Expansion V",
        "path": "research/DEEP_RESEARCH_EXPANSION_V_2026-08-12.md",
        "expected": 25,
        "attachmentSha256": "8CC8B085708503C382BB8D0F822EA21E0351735B6F871E7EB2678DC5DFB1E2C7",
    },
    {
        "id": "expansion-vi",
        "title": "Deep Research Expansion VI",
        "path": "research/DEEP_RESEARCH_EXPANSION_VI_2026-08-12.md",
        "expected": 20,
        "attachmentSha256": "B2B0F57F817EE550A8492E72A68697AE4BE3A1443B39C26750E289623895F951",
    },
)

JSON_ROUNDS = (
    {
        "id": "omega-ix-primary-ledger",
        "title": "OMEGA IX Primary Idea Ledger",
        "path": "research/audits/OMEGA-IX-20260810T131507Z/IDEA_LEDGER.json",
        "expected": 14,
        "attachmentSha256": None,
        "nameField": "thesis",
    },
    {
        "id": "omega-ix-continuation-ledger",
        "title": "OMEGA IX Continuation Idea Ledger",
        "path": "research/audits/OMEGA-IX-CONT-20260810T160000Z/IDEA_LEDGER.json",
        "expected": 20,
        "attachmentSha256": "DCF798E7564E0E32BB98A7462A7C3007F8FBF4F12F4B6AC5132776840AD156D5",
        "nameField": "name",
        "nameOverrides": {
            13: "OnceOnly Replay — EU Once-Only Evidence Interop Tester",
        },
    },
)

PROPOSAL_HEADERS = {"candidate", "supplied concept", "supplied proposal", "proposal"}
DECISION_HEADERS = {"repository decision", "decision", "resolution"}
RELATIONS = {
    "DISTINCT_PROPOSAL": "Distinct proposal",
    "SAME_OR_DUPLICATE": "Same or duplicate",
    "MODULE_OR_FEATURE": "Module, feature, or wedge",
    "RELATED_EXISTING_FAMILY": "Related existing family",
    "WATCH_SIGNAL": "Watch signal",
    "RAW_HYPOTHESIS": "Raw hypothesis",
    "REJECTED_OR_KILLED": "Rejected or killed",
}

FAMILIES = (
    ("ai-agents-oversight", "AI, agents, transparency & human oversight", r"\b(ai|agent|worker decision|provenance|prompt|mandate)\b"),
    ("cyber-software-assurance", "Cybersecurity, software assurance & cryptography", r"\b(cyber|cra |pqc|quantum|software liability|assurance|security|vulnerability)\b"),
    ("identity-credentials-workforce", "Identity, credentials & workforce mobility", r"\b(eudi|credential|talent|worker|skills|hire-to-arrival|posted worker)\b"),
    ("product-passports-claims-repair", "Product passports, claims, repair & circularity", r"\b(dpp|passport|claim|repair|packag|unsold|refurbished|product release|marksurvive)\b"),
    ("customs-trade-freight-invoicing", "Customs, trade, freight & invoicing", r"\b(customs|cargo|efti|freight|invoice|cbam|shipment|border|eudr|import|export)\b"),
    ("energy-grids-flexibility", "Energy, grids & flexibility", r"\b(grid|energy|compute|data-centre|powerplot|flexibility|spectrum)\b"),
    ("carbon-climate-environment", "Carbon, climate & environmental markets", r"\b(carbon|co2|methane|biochar|crcf|nature restoration|ocean|soil|pfas|wastewater|water|refrigerant|f-gas)\b"),
    ("industrial-materials-supply", "Industrial materials, qualification & supply chains", r"\b(material|chemical|battery|machine|robot|semiconductor|chip|factory|industrial|stockpile|critical medicine|api stockpile)\b"),
    ("health-medicines-biotech", "Health, medicines & biotechnology", r"\b(health|medicine|medical|biotech|biomanufact|pharma|soho|eudamed|ehds|ehr)\b"),
    ("research-ip-commercialisation", "Research infrastructure, IP & commercialisation", r"\b(research|lab |laboratory|university|spinout|academic ip|ip collateral|royalty)\b"),
    ("construction-housing-built", "Construction, housing & the built environment", r"\b(construction|housing|building|renovation|brownfield|permit)\b"),
    ("transport-rail-ports-maritime", "Transport, rail, ports & maritime", r"\b(rail|port|maritime|airport|saf |esaf|fleet|freight)\b"),
    ("compute-cloud-sovereignty", "Compute, cloud & sovereignty", r"\b(cloud|compute|sovereign|data switch|refactor|exitops)\b"),
    ("procurement-crisis-resilience", "Procurement, crisis capacity & strategic resilience", r"\b(procurement|crisis|emergency|readiness|resilience|shortage|capacity|offtake|bankability|treasury)\b"),
    ("agriculture-food-contracts", "Agriculture & food contracts", r"\b(agri|food|farm|crop)\b"),
    ("space-spectrum-communications", "Space, spectrum & communications", r"\b(space|satellite|spectrum|telecom|duct)\b"),
)

# Cross-round aliases take precedence over contextual keywords. They keep repeated
# parent/module concepts together even when one round supplies much richer context.
FAMILY_OVERRIDES = (
    ("energy-grids-flexibility", r"\bchargetruth\b|\bdata ?centertruth\b|\bflexload ledger\b"),
    ("transport-rail-ports-maritime", r"\bvinstate\b|\bportcall\b|\bcarrierdecision\b|\bupliftmirror\b|\bsaf claimmirror\b"),
    ("carbon-climate-environment", r"\bmicrofee\b|\breclaimright\b|\bgasbank planner\b|\bpfas\b"),
    ("procurement-crisis-resilience", r"\bbidproof\b|\bsupplier ?swap counterfactual\b|\bdelivery ?capability ledger\b"),
    ("ai-agents-oversight", r"\bmarksurvive\b|\bprovenance transform matrix\b|\bdisclosuredrift\b"),
    ("customs-trade-freight-invoicing", r"\binvoice ?route ?truth\b|\bdirectorydrift watch\b|\binvoice ?failover drill\b|\besap (relay|preview)\b|\boam receipt chain\b"),
    ("identity-credentials-workforce", r"\bwalletmatrix\b|\bcrossdevice replay\b|\btrustlist drift\b"),
    ("health-medicines-biotech", r"\bshortagegraph\b|\bnotifycascade\b|\bprocedureexposure\b|\bsubstituteready\b|\bshortagecase replay\b|\behds shadowtest\b"),
    ("agriculture-food-contracts", r"\bsprayreality\b|\bspray record\b|\bpesticide\b|\bagronomist\b"),
)


def split_markdown_row(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [cell.strip() for cell in re.split(r"(?<!\\)\|", line)]


def plain_text(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    value = value.replace("`", "").replace("**", "").replace("__", "")
    return re.sub(r"\s+", " ", value).strip()


def sanitize_public_text(value: str) -> str:
    value = plain_text(value)
    value = re.sub(r"candidate-[0-9a-f-]{8,}", "private staged record", value, flags=re.I)
    return value


def extract_tables(markdown: str) -> list[tuple[list[str], list[list[str]]]]:
    lines = markdown.splitlines()
    tables: list[tuple[list[str], list[list[str]]]] = []
    i = 0
    while i + 1 < len(lines):
        if not lines[i].lstrip().startswith("|") or not lines[i + 1].lstrip().startswith("|"):
            i += 1
            continue
        header = split_markdown_row(lines[i])
        separator = split_markdown_row(lines[i + 1])
        if len(header) != len(separator) or not all(re.fullmatch(r":?-{3,}:?", cell) for cell in separator):
            i += 1
            continue
        rows: list[list[str]] = []
        i += 2
        while i < len(lines) and lines[i].lstrip().startswith("|"):
            row = split_markdown_row(lines[i])
            if len(row) == len(header):
                rows.append(row)
            i += 1
        tables.append((header, rows))
    return tables


def relation_for(decision: str) -> str:
    text = decision.casefold()
    if "reject" in text or "too_generic" in text or "too generic" in text or "absorbed" in text:
        return "REJECTED_OR_KILLED"
    if "raw_hypothesis" in text or "raw hypothesis" in text:
        return "RAW_HYPOTHESIS"
    if "watch" in text and not text.startswith("stage distinct"):
        return "WATCH_SIGNAL"
    if "exact" in text or "duplicate" in text:
        return "SAME_OR_DUPLICATE"
    if any(term in text for term in ("module", "feature", "wedge", "primitive", "expansion")):
        return "MODULE_OR_FEATURE"
    if any(term in text for term in ("enrich", "existing", "merge", "current corpus match", "cross-cutting", "overlap", "prior", "platform_capture", "platform capture")):
        return "RELATED_EXISTING_FAMILY"
    if any(term in text for term in ("stage", "promote", "validate", "validation", "research_more", "research more", "high-priority", "staged hypothesis", "service_niche", "expert_heavy", "beachhead", "core_asset", "acquisition_data_moat", "interesting_feature", "distribution_feature", "niche")):
        return "DISTINCT_PROPOSAL"
    raise ValueError(f"unclassified decision: {decision!r}")


def family_for(name: str, decision: str, adjacency: str) -> tuple[str, str]:
    haystack = f"{name} {decision} {adjacency}".casefold()
    for family_id, pattern in FAMILY_OVERRIDES:
        if re.search(pattern, haystack, flags=re.I):
            label = next(label for candidate_id, label, _ in FAMILIES if candidate_id == family_id)
            return family_id, label
    for family_id, label, pattern in FAMILIES:
        if re.search(pattern, haystack, flags=re.I):
            return family_id, label
    return "cross-sector-execution", "Other cross-sector execution"


def referenced_ideas(text: str) -> list[str]:
    return sorted(set(re.findall(r"\bidea-\d{3}\b", text, flags=re.I)))


def round_records(config: dict) -> list[dict]:
    source_path = ROOT / config["path"]
    markdown = source_path.read_text(encoding="utf-8")
    section = config.get("section")
    if section:
        marker = f"## {section}"
        if marker not in markdown:
            raise ValueError(f"{config['id']}: missing section {marker!r}")
        markdown = markdown.split(marker, 1)[1]
        markdown = markdown.split("\n## ", 1)[0]
    source_digest = hashlib.sha256(source_path.read_bytes()).hexdigest().upper()
    records: list[dict] = []
    ordinal = 0
    for headers, rows in extract_tables(markdown):
        normalized = [plain_text(h).casefold() for h in headers]
        proposal_idx = next((i for i, h in enumerate(normalized) if h in PROPOSAL_HEADERS), None)
        decision_idx = next((i for i, h in enumerate(normalized) if h in DECISION_HEADERS), None)
        if proposal_idx is None or decision_idx is None:
            continue
        rank_idx = normalized.index("rank") if "rank" in normalized else None
        score_idx = normalized.index("provisional analyst score") if "provisional analyst score" in normalized else None
        context_indices = [i for i in range(len(headers)) if i not in {proposal_idx, decision_idx, rank_idx, score_idx}]
        for row in rows:
            ordinal += 1
            name = sanitize_public_text(row[proposal_idx])
            decision = sanitize_public_text(row[decision_idx])
            context_parts = [sanitize_public_text(row[i]) for i in context_indices if sanitize_public_text(row[i])]
            adjacency = " · ".join(context_parts)
            relation = relation_for(decision)
            family_id, family_label = family_for(name, decision, adjacency)
            rank = plain_text(row[rank_idx]) if rank_idx is not None else None
            score = plain_text(row[score_idx]) if score_idx is not None else None
            records.append({
                "id": f"research-proposal-{config['id']}-{ordinal:02d}",
                "roundId": config["id"],
                "roundTitle": config["title"],
                "sourceDocument": config["path"],
                "sourceDocumentSha256": source_digest,
                "sourceOrdinal": ordinal,
                "suppliedRank": int(rank) if rank and rank.isdigit() else None,
                "name": name,
                "decision": decision,
                "adjacency": adjacency or None,
                "relation": relation,
                "relationLabel": RELATIONS[relation],
                "familyId": family_id,
                "familyLabel": family_label,
                "canonicalIdeaRefs": referenced_ideas(f"{decision} {adjacency}"),
                "provisionalAnalystScore": score or None,
                "rankingEligible": False,
                "identityClaim": False,
            })
    if len(records) != config["expected"]:
        raise ValueError(f"{config['id']}: expected {config['expected']} proposal rows, found {len(records)}")
    return records


def json_round_records(config: dict) -> list[dict]:
    source_path = ROOT / config["path"]
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    rows = payload.get("ideas")
    if not isinstance(rows, list) or len(rows) != config["expected"]:
        raise ValueError(f"{config['id']}: expected {config['expected']} ledger ideas")
    source_digest = hashlib.sha256(source_path.read_bytes()).hexdigest().upper()
    records = []
    for ordinal, row in enumerate(rows, 1):
        source_name = sanitize_public_text(str(row.get(config["nameField"], "")))
        name = config.get("nameOverrides", {}).get(ordinal, source_name)
        disposition = sanitize_public_text(str(row.get("repositoryDisposition") or row.get("disposition") or ""))
        decision = sanitize_public_text(str(row.get("decision") or ""))
        combined_decision = " · ".join(part for part in (decision, disposition) if part)
        adjacency_parts = [row.get("target"), row.get("nearest"), row.get("object"), row.get("negative"), row.get("killer"), row.get("killTest")]
        adjacency = " · ".join(sanitize_public_text(str(part)) for part in adjacency_parts if part)
        relation = relation_for(combined_decision)
        family_id, family_label = family_for(name, combined_decision, adjacency)
        records.append({
            "id": f"research-proposal-{config['id']}-{ordinal:02d}",
            "roundId": config["id"],
            "roundTitle": config["title"],
            "sourceDocument": config["path"],
            "sourceDocumentSha256": source_digest,
            "sourceOrdinal": ordinal,
            "suppliedRank": row.get("rank") if isinstance(row.get("rank"), int) else None,
            "name": name,
            "sourceRecordedName": source_name if source_name != name else None,
            "decision": combined_decision,
            "adjacency": adjacency or None,
            "relation": relation,
            "relationLabel": RELATIONS[relation],
            "familyId": family_id,
            "familyLabel": family_label,
            "canonicalIdeaRefs": referenced_ideas(adjacency),
            "provisionalAnalystScore": None,
            "rankingEligible": False,
            "identityClaim": False,
        })
    return records


def build_catalog() -> dict:
    proposals: list[dict] = []
    round_summaries: list[dict] = []
    configurations = [(config, json_round_records) for config in JSON_ROUNDS] + [(config, round_records) for config in TABLE_ROUNDS]
    for config, loader in configurations:
        records = loader(config)
        proposals.extend(records)
        round_summaries.append({
            "id": config["id"],
            "title": config["title"],
            "proposalCount": len(records),
            "sourceDocument": config["path"],
            "attachmentSha256": config["attachmentSha256"],
        })
    ids = [proposal["id"] for proposal in proposals]
    if len(ids) != len(set(ids)):
        raise ValueError("proposal IDs are not unique")
    if len(proposals) != 353:
        raise ValueError(f"expected 353 proposals across all recoverable rounds, found {len(proposals)}")
    relation_counts = Counter(proposal["relation"] for proposal in proposals)
    family_counts = Counter(proposal["familyId"] for proposal in proposals)
    return {
        "schemaVersion": "1.0.0",
        "catalogKind": "LOSSLESS_RESEARCH_PROPOSAL_RECONCILIATION",
        "groupingContract": "thematic-proximity-not-identity",
        "completionClaim": False,
        "disclosure": (
            "Every supplied proposal row is retained, including duplicates, modules, features, "
            "watch signals, weak hypotheses, and distinct candidates. Similarity families are "
            "navigation aids only and do not merge identities or establish market validation."
        ),
        "scoreDisclosure": "Supplied scores are provisional analyst metadata and are not ranking eligible.",
        "sourceBoundary": "Generated only from committed reconciliation tables and idea ledgers; private staging data is not read or published.",
        "proposalCount": len(proposals),
        "roundCount": len(configurations),
        "rounds": round_summaries,
        "relationCounts": dict(sorted(relation_counts.items())),
        "familyCounts": dict(sorted(family_counts.items())),
        "proposals": proposals,
    }


def rendered(catalog: dict) -> str:
    return json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write the deterministic catalog")
    args = parser.parse_args()
    try:
        content = rendered(build_catalog())
    except (OSError, ValueError) as exc:
        print(f"research proposal catalog: FAIL: {exc}", file=sys.stderr)
        return 1
    if args.write:
        OUTPUT.write_text(content, encoding="utf-8")
        print(f"research proposal catalog: wrote {OUTPUT.relative_to(ROOT)}")
        return 0
    if not OUTPUT.exists():
        print(f"research proposal catalog: FAIL: missing {OUTPUT.relative_to(ROOT)}", file=sys.stderr)
        return 1
    if OUTPUT.read_text(encoding="utf-8") != content:
        print("research proposal catalog: FAIL: generated artifact is stale", file=sys.stderr)
        return 1
    print("research proposal catalog: OK (353 proposals across 12 recoverable rounds)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
