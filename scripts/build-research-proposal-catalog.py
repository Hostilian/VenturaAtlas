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
    {
        "id": "everyday-problem-hypotheses-2026-08-21",
        "title": "Everyday Problem Hypotheses — 21 August 2026",
        "path": "research/EVERYDAY_PROBLEM_HYPOTHESES_2026-08-21.md",
        "expected": 48,
        "attachmentSha256": None,
    },
)

JSON_ROUNDS = (
    {
        "id": "omega-xv-august-regulatory-wave",
        "title": "OMEGA XV — August 2026 Regulatory Research Wave",
        "path": "research/audits/OMEGA-XV-EVIDENCE-OS-20260817T230000Z/AUGUST_REGULATORY_WAVE.json",
        "expected": 8,
        "attachmentSha256": None,
        "nameField": "name",
    },
    {
        "id": "omega-xv-proofops-reality-engine",
        "title": "OMEGA XV — ProofOps / Reality Engine",
        "path": "data/proofops-research.json",
        "expected": 11,
        "attachmentSha256": None,
        "nameField": "name",
    },
    {
        "id": "omega-xvi-machine-rights-regulatory-ci",
        "title": "OMEGA XVI — Machine Rights / Product Identity / Regulatory CI",
        "path": "data/omega-xvi-machine-rights-research.json",
        "expected": 12,
        "attachmentSha256": None,
        "nameField": "name",
    },
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

RUN_ROUNDS = (
    {"id": "omega-xiii-science-procurement", "title": "OMEGA XIII — Science & Procurement", "runId": "run-res-009-20260813-science-procurement", "expected": 5},
    {"id": "omega-xiii-public-primitive-countertrend", "title": "OMEGA XIII — Public Primitive Countertrend", "runId": "run-res-010-20260813-public-primitive-countertrend", "expected": 5},
    {"id": "omega-xiii-physical-regulatory", "title": "OMEGA XIII — Physical & Regulatory", "runId": "run-res-011-20260813-physical-regulatory", "expected": 5},
    {"id": "omega-xiii-qualification-evidence", "title": "OMEGA XIII — Qualification Evidence", "runId": "run-res-012-20260813-qualification-evidence", "expected": 5},
    {"id": "omega-xiii-cross-system-authority", "title": "OMEGA XIII — Cross-System Authority", "runId": "run-res-013-20260813-cross-system-authority", "expected": 5},
    {"id": "omega-xiii-operational-authority", "title": "OMEGA XIII — Operational Authority", "runId": "run-res-014-20260813-operational-authority", "expected": 5},
    {"id": "omega-xiii-industrial-lifecycle", "title": "OMEGA XIII — Industrial Lifecycle", "runId": "run-res-015-20260814-industrial-lifecycle", "expected": 5},
    {"id": "omega-xiii-final-coverage", "title": "OMEGA XIII — Final Coverage", "runId": "run-res-016-20260814-final-coverage", "expected": 25},
    {"id": "expansion-vii", "title": "Deep Research Expansion VII", "runId": "run-res-017-20260817-expansion-vii-transition-failure-detectors", "expected": 10},
    {"id": "omega-xiv-capital-clock", "title": "OMEGA XIV — Capital Clock", "runId": "run-res-018-20260817-omega-xiv-capital-clock", "expected": 9},
    {"id": "omega-xv-cutover-inventory", "title": "OMEGA XV — Cutover Inventory Clock", "runId": "run-res-019-20260817-omega-xv-cutover-inventory-clock", "expected": 8},
    {"id": "omega-xv-absorption-frontier", "title": "OMEGA XV — Absorption Frontier", "runId": "run-res-020-20260817-omega-xv-absorption-frontier", "expected": 10},
    {"id": "omega-xvii-public-money-graph", "title": "OMEGA XVII — Public Money Graph", "runId": "run-res-omega-xvii-20260817-public-money-graph", "expected": 10},
    {"id": "omega-xviii-route-shock", "title": "OMEGA XVIII — Route Shock / Physical-State Proof", "runId": "run-res-omega-xviii-20260818-route-shock", "expected": 16},
)

RUN_REFERENCE_NAMES = {
    "candidate-a51225f5-a56e-5528-98b8-14200a96a89d": "PIDRelay — Supplier PID Recovery & EU Customs Catalog Preflight",
    "candidate-f276144f-160c-5546-89fc-99e2ce04df55": "PermitEcho — Industrial Permit Evidence Reconciler",
    "candidate-515b03fb-650a-5ed4-8232-941c589dc1fb": "NZIA BidProof — Non-Price Tender Evidence Capsule",
    "candidate-19048401-c4da-583c-adb5-58d33698daaf": "SAFE OriginTrace — Component-Cost & Design-Control Evidence Graph",
    "candidate-bdf94d85-7bd8-5d25-9d5a-8f9af3eb1510": "Milestone-to-Cash — Funding Completion Evidence Graph",
    "candidate-d237f9db-4dc5-506d-9a4a-95f1c579a6bc": "AttestReady — AMR Export Inventory-to-Certificate Preflight",
    "candidate-d8fd661f-715d-5e90-ad33-db841a2d94c3": "SteelLandedRisk — Steel Quota/Tariff-Cliff Transaction Preflight",
    "candidate-5b5c2c8d-5075-5bf3-8ac1-0553e17cb9d2": "MicroIFUD Gate — Synthetic-Polymer Product/IFU Consistency Audit",
}

EXPECTED_PROPOSAL_COUNT = 555

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
    ("cyber-identity-trust", "Cybersecurity, Identity & Trust", r"\b(cyber|security|vulnerability|identity|credential|eudi|pqc|quantum|fraud|trustlist|right-to-work)\b"),
    ("finance-audit-governance", "Finance, Audit & Governance", r"\b(finance|payment|invoice|billing|audit|insurance|underwrit|treasury|tax|grant|funding|royalty|estate|probate|expense)\b"),
    ("health-life-sciences", "Healthcare & Life Sciences", r"\b(health|caregiver|clinic|patient|medicine|medical|medication|biotech|biomanufact|pharma|soho|eudamed|ehds|ehr|hospital|veterinar)\b"),
    ("food-agriculture", "Food & Agriculture", r"\b(agri|food|farm|crop|allergen|pesticide|spray record|restaurant|menu)\b"),
    ("climate-energy-environment", "Climate, Energy & Environment", r"\b(carbon|climate|co2|methane|biochar|crcf|nature restoration|ocean|soil|pfas|wastewater|water|refrigerant|f-gas|grid|energy|heat ?pump|solar|flexibility)\b"),
    ("construction-property-repair", "Construction, Property & Repair", r"\b(construction|housing|building|property|renovation|brownfield|repair|renter|landlord|permit|homeadapt)\b"),
    ("industrial-supply-logistics", "Industrial, Supply Chain & Logistics", r"\b(customs|cargo|efti|freight|cbam|shipment|border|eudr|import|export|material|chemical|battery|machine|robot|semiconductor|factory|industrial|stockpile|supplier|supply chain)\b"),
    ("travel-mobility-events", "Travel, Mobility & Events", r"\b(travel|rail|port|maritime|airport|fleet|mobility|vehicle|carrier|trip|journey|hotel|event access)\b"),
    ("research-education-knowledge", "Research, Education & Knowledge", r"\b(research|lab |laboratory|university|spinout|academic|education|course|student|school|training|skills evidence|mentor|apprentice)\b"),
    ("media-creator-games", "Media, Creator Economy & Games", r"\b(creator|media|content|game|sponsor|wedding|music|video|podcast|publishing)\b"),
    ("public-regulatory-procurement", "Public Sector, Regulation & Procurement", r"\b(procurement|public sector|government|regulatory|regulation|authority|tender|crisis|emergency|resilience|shortage|capacity|offtake|aidheadroom|benefit evidence)\b"),
    ("commerce-marketplaces-consumer", "Commerce, Marketplaces & Consumer", r"\b(marketplace|commerce|consumer|seller|shopping|subscription|pet|household|tool library|retail|product passport|dpp|packag|unsold|refurbished)\b"),
    ("software-ai-developer", "Software, AI & Developer Systems", r"\b(ai|agent|software|api|cloud|compute|data switch|refactor|exitops|prompt|saas|developer|code|digital)\b"),
    ("business-operations-services", "Business Operations & Services", r"\b(business|workforce|worker|contractor|workflow|operations|service|appointment|quote|freelancer|enterprise)\b"),
)

# Cross-round aliases take precedence over contextual keywords. They keep repeated
# parent/module concepts together even when one round supplies much richer context.
FAMILY_OVERRIDES = (
    ("travel-mobility-events", r"\besaf\b|\bsaf airport\b|\bsaf claimmirror\b"),
    ("climate-energy-environment", r"\bchargetruth\b|\bdata ?centertruth\b|\bflexload ledger\b|\bmicrofee\b|\breclaimright\b|\bgasbank planner\b|\bpfas\b"),
    ("travel-mobility-events", r"\bvinstate\b|\bportcall\b|\bcarrierdecision\b|\bupliftmirror\b"),
    ("public-regulatory-procurement", r"\bbidproof\b|\bsupplier ?swap counterfactual\b|\bdelivery ?capability ledger\b"),
    ("software-ai-developer", r"\bmarksurvive\b|\bprovenance transform matrix\b|\bdisclosuredrift\b"),
    ("finance-audit-governance", r"\binvoice ?route ?truth\b|\bdirectorydrift watch\b|\binvoice ?failover drill\b|\besap (relay|preview)\b|\boam receipt chain\b"),
    ("cyber-identity-trust", r"\bwalletmatrix\b|\bcrossdevice replay\b|\btrustlist drift\b"),
    ("health-life-sciences", r"\bshortagegraph\b|\bnotifycascade\b|\bprocedureexposure\b|\bsubstituteready\b|\bshortagecase replay\b|\behds shadowtest\b"),
    ("food-agriculture", r"\bsprayreality\b|\bspray record\b|\bpesticide\b|\bagronomist\b"),
)

PATTERNS = (
    ("compliance-gate", "Compliance Gate & Preflight", r"\b(compliance|preflight|readiness|gate|eligibility|conform|regulatory|duty map)\b"),
    ("evidence-verification", "Evidence, Verification & Reconciliation", r"\b(evidence|verify|verification|reconcil|proof|ledger|receipt|passport|timeline|binder|record checker|diff)\b"),
    ("monitoring-intelligence", "Monitoring & Decision Intelligence", r"\b(monitor|observatory|radar|watch|alert|intelligence|rehearsal|reality map)\b"),
    ("marketplace-network", "Marketplace, Exchange & Network", r"\b(marketplace|exchange|network|pool|slot|matchmaking|router)\b"),
    ("routing-optimization", "Routing, Allocation & Optimization", r"\b(route|routing|allocation|optim|schedule|queue)\b"),
    ("infrastructure-api", "Infrastructure, API & Integration", r"\b(api|infrastructure|gateway|interoper|integration|switchboard|graph platform|relay)\b"),
    ("financial-risk", "Financial, Risk & Underwriting", r"\b(financial|risk|underwrit|insurance|credit|capital|price|cost|quote)\b"),
    ("advisory-service", "Advisory, Audit & Productized Service", r"\b(advisory|audit|concierge|service pack|coach|late-payment packet)\b"),
    ("physical-repair-service", "Physical Service, Repair & Fabrication", r"\b(physical|repair service|fabricat|remediation|installation|maintenance)\b"),
    ("consumer-utility", "Consumer Utility & Discovery", r"\b(consumer|discovery|comparator|assistant|planner|guide|translator|checklist)\b"),
    ("content-creator-tool", "Content, Creator & Media Tool", r"\b(content|creator|media|video|publishing|portfolio|meeting pack)\b"),
    ("workflow-automation", "Workflow Automation & Operations", r"\b(workflow|automation|operations|handoff|control list|action loop|closeout|response packet|offboarding)\b"),
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
    return "business-operations-services", "Business Operations & Services"


def explicit_taxon(value: str, options: tuple[tuple[str, str, str], ...]) -> tuple[str, str] | None:
    normalized = plain_text(value).casefold()
    for taxon_id, label, _ in options:
        if normalized in {taxon_id.casefold(), label.casefold()}:
            return taxon_id, label
    return None


def pattern_for(name: str, decision: str, adjacency: str) -> tuple[str, str]:
    haystack = f"{name} {decision} {adjacency}".casefold()
    for pattern_id, label, pattern in PATTERNS:
        if re.search(pattern, haystack, flags=re.I):
            return pattern_id, label
    return "workflow-automation", "Workflow Automation & Operations"


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
        family_idx = normalized.index("market family") if "market family" in normalized else None
        pattern_idx = normalized.index("venture pattern") if "venture pattern" in normalized else None
        context_indices = [i for i in range(len(headers)) if i not in {proposal_idx, decision_idx, rank_idx, score_idx, family_idx, pattern_idx}]
        for row in rows:
            ordinal += 1
            name = sanitize_public_text(row[proposal_idx])
            decision = sanitize_public_text(row[decision_idx])
            context_parts = [sanitize_public_text(row[i]) for i in context_indices if sanitize_public_text(row[i])]
            adjacency = " · ".join(context_parts)
            relation = relation_for(decision)
            explicit_family = explicit_taxon(row[family_idx], FAMILIES) if family_idx is not None else None
            explicit_pattern = explicit_taxon(row[pattern_idx], PATTERNS) if pattern_idx is not None else None
            family_id, family_label = explicit_family or family_for(name, decision, adjacency)
            pattern_id, pattern_label = explicit_pattern or pattern_for(name, decision, adjacency)
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
                "patternId": pattern_id,
                "patternLabel": pattern_label,
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
    rows = payload.get("ideas") or payload.get("candidates")
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
        pattern_id, pattern_label = pattern_for(name, combined_decision, adjacency)
        records.append({
            "id": f"research-proposal-{config['id']}-{ordinal:02d}",
            "roundId": config["id"],
            "roundTitle": config["title"],
            "sourceDocument": config.get("path", "data/research-runs.json"),
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
            "patternId": pattern_id,
            "patternLabel": pattern_label,
            "canonicalIdeaRefs": referenced_ideas(adjacency),
            "provisionalAnalystScore": None,
            "rankingEligible": False,
            "identityClaim": False,
        })
    return records


def run_round_records(config: dict) -> list[dict]:
    source_path = ROOT / "data" / "research-runs.json"
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    runs = payload if isinstance(payload, list) else payload.get("runs", [])
    run = next((item for item in runs if item.get("runId") == config["runId"]), None)
    if run is None:
        raise ValueError(f"{config['id']}: missing research run {config['runId']}")

    ideas_payload = json.loads((ROOT / "data" / "ideas.json").read_text(encoding="utf-8"))
    ideas = ideas_payload if isinstance(ideas_payload, list) else ideas_payload.get("ideas", [])
    idea_names = {item.get("id"): item.get("name") for item in ideas}
    source_digest = hashlib.sha256(source_path.read_bytes()).hexdigest().upper()
    queue = run.get("validationPriorityQueue") or []

    def name_for(value: object, ordinal: int) -> tuple[str, list[str]]:
        if isinstance(value, dict):
            raw_name = value.get("name") or value.get("slug") or value.get("proposal") or f"Recorded proposal {ordinal}"
            return sanitize_public_text(str(raw_name)), []
        raw = str(value)
        if raw in idea_names and idea_names[raw]:
            return sanitize_public_text(str(idea_names[raw])), [raw]
        if raw in RUN_REFERENCE_NAMES:
            return RUN_REFERENCE_NAMES[raw], []
        if raw.startswith("candidate-"):
            for item in queue:
                if raw in (item.get("targetRefs") or []):
                    return sanitize_public_text(str(item.get("proposal"))), []
            return f"Private staged hypothesis {ordinal}", []
        return sanitize_public_text(raw), []

    entries: list[tuple[str, object, str | None]] = []
    if config["id"] == "omega-xviii-route-shock":
        entries.extend(("added", item, None) for item in run.get("ideasAdded", []))
        entries.extend(("archive", item, None) for item in run.get("archiveReceipts", []))
        entries.extend(("graveyard", item, None) for item in run.get("graveyardBatch", []))
    else:
        entries.extend(("included", item, None) for item in run.get("inclusions", []))
        for item in run.get("exclusions", []):
            reason = str(item.get("reason")) if isinstance(item, dict) and item.get("reason") else None
            entries.append(("excluded", item, reason))

    records = []
    for ordinal, (entry_kind, value, reason) in enumerate(entries, 1):
        name, canonical_refs = name_for(value, ordinal)
        if entry_kind == "added":
            relation = "DISTINCT_PROPOSAL"
            decision = "ADDED TO CANONICAL CORPUS BY RESEARCH RUN; lifecycle verification remains separate"
        elif entry_kind in {"archive"}:
            relation = "RELATED_EXISTING_FAMILY"
            decision = "ARCHIVE RECEIPT; existing thesis retained without creating a duplicate"
        elif entry_kind == "graveyard":
            relation = "RELATED_EXISTING_FAMILY" if "merge into" in name.casefold() else "REJECTED_OR_KILLED"
            decision = "MERGED INTO EXISTING FAMILY" if relation == "RELATED_EXISTING_FAMILY" else "GRAVEYARD / REJECTED"
        elif entry_kind == "excluded":
            combined = f"{name} {reason or ''}".casefold()
            related = any(term in combined for term in ("existing", "merge", "overlap", "already populated", "archive entry"))
            relation = "RELATED_EXISTING_FAMILY" if related else "REJECTED_OR_KILLED"
            decision = "EXCLUDED AS EXISTING OR RELATED" if related else "EXCLUDED OR REJECTED"
        elif canonical_refs or not str(value).startswith("candidate-"):
            relation = "RELATED_EXISTING_FAMILY"
            decision = "INCLUDED FOR RESEARCH OR RE-UNDERWRITING; not a new identity claim"
        else:
            relation = "RAW_HYPOTHESIS"
            decision = "INCLUDED AS PROVISIONAL RESEARCH HYPOTHESIS; not canonical promotion"

        adjacency = sanitize_public_text(reason or str(run.get("reviewStatus") or run.get("researcherNote") or "research run receipt"))
        family_id, family_label = family_for(name, decision, adjacency)
        pattern_id, pattern_label = pattern_for(name, decision, adjacency)
        records.append({
            "id": f"research-proposal-{config['id']}-{ordinal:02d}",
            "roundId": config["id"],
            "roundTitle": config["title"],
            "sourceDocument": "data/research-runs.json",
            "sourceDocumentSha256": source_digest,
            "sourceRunId": config["runId"],
            "sourceOrdinal": ordinal,
            "suppliedRank": None,
            "name": name,
            "decision": decision,
            "adjacency": adjacency or None,
            "relation": relation,
            "relationLabel": RELATIONS[relation],
            "familyId": family_id,
            "familyLabel": family_label,
            "patternId": pattern_id,
            "patternLabel": pattern_label,
            "canonicalIdeaRefs": canonical_refs,
            "provisionalAnalystScore": None,
            "rankingEligible": False,
            "identityClaim": False,
        })

    if len(records) != config["expected"]:
        raise ValueError(f"{config['id']}: expected {config['expected']} research-run rows, found {len(records)}")
    return records


def build_catalog() -> dict:
    proposals: list[dict] = []
    round_summaries: list[dict] = []
    configurations = (
        [(config, json_round_records) for config in JSON_ROUNDS]
        + [(config, round_records) for config in TABLE_ROUNDS]
        + [(config, run_round_records) for config in RUN_ROUNDS]
    )
    for config, loader in configurations:
        records = loader(config)
        proposals.extend(records)
        round_summaries.append({
            "id": config["id"],
            "title": config["title"],
            "proposalCount": len(records),
            "sourceDocument": config.get("path", "data/research-runs.json"),
            "attachmentSha256": config.get("attachmentSha256"),
        })
    ids = [proposal["id"] for proposal in proposals]
    if len(ids) != len(set(ids)):
        raise ValueError("proposal IDs are not unique")
    if len(proposals) != EXPECTED_PROPOSAL_COUNT:
        raise ValueError(f"expected {EXPECTED_PROPOSAL_COUNT} proposals across all recoverable rounds, found {len(proposals)}")
    relation_counts = Counter(proposal["relation"] for proposal in proposals)
    family_counts = Counter(proposal["familyId"] for proposal in proposals)
    pattern_counts = Counter(proposal["patternId"] for proposal in proposals)
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
        "sourceBoundary": "Generated only from committed reconciliation tables, idea ledgers, and research-run receipts; private staging data is not read or published.",
        "proposalCount": len(proposals),
        "roundCount": len(configurations),
        "rounds": round_summaries,
        "relationCounts": dict(sorted(relation_counts.items())),
        "familyCounts": dict(sorted(family_counts.items())),
        "patternCounts": dict(sorted(pattern_counts.items())),
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
    print(f"research proposal catalog: OK ({EXPECTED_PROPOSAL_COUNT} proposals across {len(JSON_ROUNDS) + len(TABLE_ROUNDS) + len(RUN_ROUNDS)} recoverable rounds)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
