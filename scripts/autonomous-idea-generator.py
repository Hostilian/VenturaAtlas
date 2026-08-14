#!/usr/bin/env python3
"""
Venture Atlas OS — Autonomous Idea Discovery & Validation Engine (v2)
======================================================================

Upgrades over v1:
- Calls real LLMs via va-orchestrator.py (Hermes, OmniRoute, FCC Claude, Own Orch)
- 15 search domain templates across diverse verticals
- Deduplication against all existing ideas.json names (fuzzy)
- Full 25-dimension Venture Atlas scoring
- 8-point strict checklist with real logic
- Kill Criteria analysis (8 conditions)
- Ideas-per-run configurable via env IDEAS_PER_ITERATION
- Saves structured provider metadata with each idea
"""

import json
import os
import sys
import time
import random
import datetime
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Import orchestrator
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from va_orchestrator import (
    call_llm, build_idea_prompt, extract_json,
    log_info, log_warn, log_error, log_success, log_debug,
    _load_state, _save_state
)
from va_runtime.novelty_throttle import (
    consume_cooldown, gate_receipt, is_throttled, normalize_control, record_result,
)

# ── Load .env ─────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(_env_path):
    with open(_env_path, 'r', encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                if _k.strip() and not os.environ.get(_k.strip()):
                    os.environ[_k.strip()] = _v.strip()

IDEAS_JSON_PATH  = os.path.join(BASE_DIR, 'data', 'ideas.json')
QUEUE_JSON_PATH  = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')
IDEAS_PER_RUN    = int(os.environ.get('IDEAS_PER_ITERATION', '3'))
AUTO_PROMOTE_THR = float(os.environ.get('AUTO_PROMOTE_THRESHOLD', '85'))
NOVELTY_WINDOW_RUNS = int(os.environ.get('NOVELTY_WINDOW_RUNS', '3'))
NOVELTY_MIN_YIELD = float(os.environ.get('NOVELTY_MIN_YIELD', '0.20'))
NOVELTY_COOLDOWN_RUNS = int(os.environ.get('NOVELTY_COOLDOWN_RUNS', '2'))

# ── 15 Search Domains ─────────────────────────────────────────────────────────
SEARCH_DOMAINS = [
    {"category": "SaaS shutdown & data portability", "subcategory": "export & migration tools",
     "trigger": "Cloud service retirements, export format friction, and data loss risk",
     "example": "Single-app local viewers for shut-down CRM, project management, or workflow tools",
     "tags": ["saas", "data-portability", "export"]},
    {"category": "Product verification & evidence", "subcategory": "agentic commerce data",
     "trigger": "Incomplete e-commerce specs and fake reviews causing high return rates",
     "example": "Buyer-funded physical dimension, clearance, or device compatibility proof",
     "tags": ["ecommerce", "verification", "proof"]},
    {"category": "AI evaluation & launch gates", "subcategory": "agent testing",
     "trigger": "Unvalidated AI agents causing production failures and hallucination risks",
     "example": "Domain-specific regression packs and citation verification suites",
     "tags": ["ai", "testing", "evaluation"]},
    {"category": "Developer tools & infrastructure", "subcategory": "repository automation",
     "trigger": "Repetitive maintenance, security remediation, and compliance boilerplate",
     "example": "Automated code remediation gates and multi-agent merge coordinators",
     "tags": ["devtools", "automation", "infrastructure"]},
    {"category": "EU Marketplace & Compliance", "subcategory": "regulatory automation",
     "trigger": "EU Digital Product Passport, DAC7 tax reporting, and DSA notice-and-action rules",
     "example": "Self-serve compliance verification for SME merchants and platforms",
     "tags": ["eu", "compliance", "regulation"]},
    {"category": "Local-first software", "subcategory": "offline-capable tools",
     "trigger": "Privacy, latency, and cost concerns driving local-run SaaS replacements",
     "example": "Offline-first invoice management with cloud sync for freelancers",
     "tags": ["local-first", "privacy", "offline"]},
    {"category": "Micro-SaaS niche tooling", "subcategory": "vertical-specific automation",
     "trigger": "Generic tools missing critical niche-specific workflows",
     "example": "Domain-specific report generators for architects, surveyors, or legal professionals",
     "tags": ["micro-saas", "niche", "vertical"]},
    {"category": "No-code / low-code automation", "subcategory": "workflow builders",
     "trigger": "Non-technical users needing custom integrations without developers",
     "example": "Drag-and-drop webhook pipeline builders for Shopify+Notion+Stripe",
     "tags": ["nocode", "automation", "integration"]},
    {"category": "Research & knowledge tools", "subcategory": "evidence management",
     "trigger": "Manual citation management and fact-checking overhead in research workflows",
     "example": "LLM-powered citation validator and source credibility scorer",
     "tags": ["research", "knowledge", "evidence"]},
    {"category": "Physical-digital bridge", "subcategory": "IoT & asset tracking",
     "trigger": "Physical-world events that need digital tracking without custom hardware",
     "example": "QR+NFC label systems for asset tracking in small warehouses",
     "tags": ["iot", "physical", "digital"]},
    {"category": "B2B niche marketplaces", "subcategory": "matching & discovery",
     "trigger": "Fragmented supplier discovery and poor matching in niche industries",
     "example": "Verified supplier discovery for specialty food ingredients or biomaterials",
     "tags": ["marketplace", "b2b", "matching"]},
    {"category": "API wrapper & integration", "subcategory": "data connector",
     "trigger": "Enterprise data locked in proprietary systems with no modern APIs",
     "example": "Read-only API layer over legacy ERP exports for dashboard consumption",
     "tags": ["api", "integration", "data"]},
    {"category": "Solo founder productivity", "subcategory": "cognitive load reduction",
     "trigger": "Cognitive overload from tool-switching and manual status tracking",
     "example": "Single-command morning briefings pulling from GitHub, email, and calendar",
     "tags": ["productivity", "solo-founder", "automation"]},
    {"category": "Agentic commerce infrastructure", "subcategory": "shopping agent data",
     "trigger": "AI shopping agents needing structured product data beyond raw web pages",
     "example": "Vendor-certified product spec APIs for agent-driven purchasing decisions",
     "tags": ["agentic", "commerce", "ai"]},
    {"category": "Creator economy tooling", "subcategory": "monetisation & analytics",
     "trigger": "Creators lacking structured revenue data across fragmented platforms",
     "example": "Unified revenue and audience analytics dashboard for multi-platform creators",
     "tags": ["creator", "monetisation", "analytics"]},
    {"category": "Event Operations & Marketplaces", "subcategory": "local replacement network",
     "trigger": "Last-minute vendor, referee, or staff cancellations leaving empty slots and forfeited fees",
     "example": "Short-notice performance-fee standby network with instant WhatsApp/SMS dispatch",
     "tags": ["event-operations", "standby-network", "performance-fee"]},
    {"category": "Audit & Financial Forensics", "subcategory": "productized audit service",
     "trigger": "High spending on lead sources, ad channels, or software subscriptions without ROI visibility",
     "example": "Productized CSV/export log audit calculating true qualified lead CAC and conversion rates",
     "tags": ["audit", "financial-forensics", "lead-roi"]},
    {"category": "Appointment & Scheduling Services", "subcategory": "performance revenue recovery",
     "trigger": "Unfilled late cancellations creating empty appointment slots and lost income",
     "example": "Zero-risk performance-fee waitlist activation service for appointment businesses",
     "tags": ["appointment-recovery", "waitlist", "revenue-share"]},
    {"category": "Consumer Advocacy & Transparency", "subcategory": "quote normalization concierge",
     "trigger": "Opaque, uncomparable estimates and legal dispute hurdles during high-stress transactions",
     "example": "Standardized itemised quote comparison tables and EU dispute evidence dossiers",
     "tags": ["consumer-advocacy", "quote-normalizer", "transparency"]}
]

# ── Strict 8-Point Checklist ──────────────────────────────────────────────────
CHECKLIST_CRITERIA = [
    "Startup cost $0-$100 maximum",
    "Payment received before vendor expenses incurred",
    "No inventory, pre-funded worker pool, or upfront capital required",
    "Solo-founder buildable within 7-14 days MVP",
    "Gross margin potential > 65%",
    "High problem severity and clear willingness to pay (≥ 6.5)",
    "Independent of consulting or manual hourly billing",
    "Data or workflow asset compounds over time",
]

# ── 25-Dimension Scoring Dimensions ──────────────────────────────────────────
SCORE_DIMS = [
    "problemSeverity", "frequencyOfNeed", "willingnessToPay", "marketDemand",
    "speedToFirstRevenue", "lowStartupCost", "easeOfMvp", "aiAutomationPotential",
    "regulatoryTailwind", "compoundingAsset",
    # These 15 are computed from the above + checklist
    "overallOpportunity", "bootstrappedPotential", "soloFounderPotential",
    "fastestPathToRevenue", "lowestCostLaunch", "differentiation",
    "technicalFeasibility", "marketSize", "profitPotential", "confidence",
    "distributionScore", "competitiveMoat", "ltvcacScore", "cacScore",
    "evidenceQuality",
]

import uuid
from va_runtime.atomic_io import atomic_write_json, read_json_safe

def load_existing_ideas() -> list:
    if not os.path.exists(IDEAS_JSON_PATH):
        return []
    data = read_json_safe(IDEAS_JSON_PATH, default_if_missing=[])
    return data.get('ideas', []) if isinstance(data, dict) else data

def load_staging_queue() -> list:
    if not os.path.exists(QUEUE_JSON_PATH):
        return []
    return read_json_safe(QUEUE_JSON_PATH, default_if_missing=[])

def save_staging_queue(queue: list):
    atomic_write_json(QUEUE_JSON_PATH, queue)

def generate_candidate_id() -> str:
    """Generate a candidate ID for parallel discovery workers (never a permanent idea-XXX)."""
    return f"candidate-{uuid.uuid4()}"

def get_all_existing_names(existing: list, queue: list) -> list[str]:
    names = []
    for idea in list(existing) + list(queue):
        n = idea.get('name', '')
        if n:
            names.append(n.lower())
    return names

# ── Fuzzy Deduplication ───────────────────────────────────────────────────────
def _simple_similarity(a: str, b: str) -> float:
    """Simple trigram similarity."""
    a, b = a.lower().strip(), b.lower().strip()
    if a == b:
        return 1.0
    def trigrams(s):
        return set(s[i:i+3] for i in range(len(s) - 2)) if len(s) >= 3 else set(s)
    ta, tb = trigrams(a), trigrams(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)

def is_duplicate(name: str, existing_names: list[str], threshold: float = 0.6) -> bool:
    for en in existing_names:
        if _simple_similarity(name, en) >= threshold:
            log_debug(f"Duplicate detected: '{name}' ~ '{en}'")
            return True
    return False

# ── 8-Point Checklist Evaluator ───────────────────────────────────────────────
def run_checklist(llm_idea: dict) -> dict:
    # Discovery text is a set of model-authored hypotheses, not behavioral
    # evidence. It cannot pass its own validation gate.
    return {
        "gateStatus": "needs_external_validation",
        "passed": False,
        "passedCount": 0,
        "failedCount": 0,
        "unknownCount": len(CHECKLIST_CRITERIA),
        "totalCriteria": len(CHECKLIST_CRITERIA),
        "scorePercentage": None,
        "assessmentBasis": "unverified_model_hypotheses",
        "details": {criterion: "unknown" for criterion in CHECKLIST_CRITERIA},
    }

    # Legacy heuristic retained below only for migration archaeology; unreachable.
    scores = llm_idea.get('scores', {})
    results = {}

    # 1. Startup cost ≤ $100
    sc = llm_idea.get('startupCostMax')
    results[CHECKLIST_CRITERIA[0]] = "pass" if sc is not None and sc <= 100 else ("fail" if sc is not None else "unknown")

    # 2. Payment before expense
    text = json.dumps(llm_idea).lower()
    c2 = any(kw in text for kw in ["preorder", "prepaid", "paid pilot", "bounty", "upfront payment", "payment before"])
    if not c2:
        how = llm_idea.get('howItMakesMoney', '').lower()
        c2 = any(kw in how for kw in ["prepaid", "fixed-scope", "fixed scope", "upfront", "preorder"])
    results[CHECKLIST_CRITERIA[1]] = "pass" if c2 else "unknown"

    # 3. No inventory
    c3 = 'inventory' not in text or 'no inventory' in text
    results[CHECKLIST_CRITERIA[2]] = "pass" if c3 else "unknown"

    # 4. Solo-founder buildable (mvp ≤ 14 days)
    mvp = llm_idea.get('timeToMvp')
    if mvp:
        try:
            days = int(re.search(r'(\d+)', str(mvp)).group(1))
            c4 = "pass" if days <= 14 else "fail"
        except Exception:
            c4 = "unknown"
    else:
        c4 = "unknown"
    results[CHECKLIST_CRITERIA[3]] = c4

    # 5. Gross margin > 65%
    gm = llm_idea.get('grossMarginEstimate')
    results[CHECKLIST_CRITERIA[4]] = "pass" if gm is not None and gm >= 65 else ("fail" if gm is not None else "unknown")

    # 6. Problem severity ≥ 6.5 AND willingness to pay ≥ 6.5
    sev = scores.get('problemSeverity')
    wtp = scores.get('willingnessToPay')
    if sev is not None and wtp is not None:
        c6 = "pass" if float(sev) >= 6.5 and float(wtp) >= 6.5 else "fail"
    else:
        c6 = "unknown"
    results[CHECKLIST_CRITERIA[5]] = c6

    # 7. Not consulting
    c7 = 'consulting' not in text.replace('no consulting', '') or 'no consulting' in text
    results[CHECKLIST_CRITERIA[6]] = "pass" if c7 else "unknown"

    # 8. Compounding asset
    compound_score = scores.get('compoundingAsset')
    results[CHECKLIST_CRITERIA[7]] = "pass" if compound_score is not None and float(compound_score) >= 6.0 else ("fail" if compound_score is not None else "unknown")

    passed_count = sum(1 for v in results.values() if v == "pass")
    failed_count = sum(1 for v in results.values() if v == "fail")
    unknown_count = sum(1 for v in results.values() if v == "unknown")

    return {
        "gateStatus": "needs_validation",
        "passed": False,  # Discovery stage candidates require validation
        "passedCount": passed_count,
        "failedCount": failed_count,
        "unknownCount": unknown_count,
        "totalCriteria": len(CHECKLIST_CRITERIA),
        "scorePercentage": round((passed_count / len(CHECKLIST_CRITERIA)) * 100, 1),
        "details": results,
    }

# ── 25-Dimension Composite Score ──────────────────────────────────────────────
def compute_composite_score(llm_idea: dict, checklist: dict) -> dict:
    # Never convert an LLM's self-estimates into decision scores. Scores remain
    # unknown until external receipts are attached and an evidence-aware assessor
    # evaluates them.
    dimensions = {dimension: None for dimension in SCORE_DIMS}
    dimensions.update({
        "compositeHeadline": None,
        "scoreStatus": "insufficient_evidence",
        "scoreBasis": "model_hypotheses_quarantined_until_external_validation",
        "confidence": None,
    })
    return dimensions

    # Legacy heuristic retained below only for migration archaeology; unreachable.
    scores = llm_idea.get('scores', {})
    def get_num(k) -> float:
        val = scores.get(k)
        if val is None:
            return None
        if isinstance(val, dict):
            val = val.get("value")
        return float(val) if val is not None else None

    # Core 10
    problem_sev  = get_num('problemSeverity')
    freq_need    = get_num('frequencyOfNeed')
    wtp          = get_num('willingnessToPay')
    mkt_demand   = get_num('marketDemand')
    speed_rev    = get_num('speedToFirstRevenue')
    low_cost     = get_num('lowStartupCost')
    ease_mvp     = get_num('easeOfMvp')
    ai_auto      = get_num('aiAutomationPotential')
    reg_tail     = get_num('regulatoryTailwind')
    compound     = get_num('compoundingAsset')

    def safe_calc(expr_fn, required_keys):
        if any(k is None for k in required_keys):
            return None
        return round(float(expr_fn()), 1)

    overall_opp = safe_calc(
        lambda: (problem_sev*0.2 + wtp*0.15 + mkt_demand*0.15 + speed_rev*0.1 + low_cost*0.1 + ease_mvp*0.1 + compound*0.1 + ai_auto*0.1) * 10,
        [problem_sev, wtp, mkt_demand, speed_rev, low_cost, ease_mvp, compound, ai_auto]
    )
    bootstrap = safe_calc(lambda: min(100, (low_cost + ease_mvp + speed_rev) / 3 * 10 + 5), [low_cost, ease_mvp, speed_rev])
    solo_founder = safe_calc(lambda: min(100, (ease_mvp + speed_rev + low_cost) / 3 * 10 + 3), [ease_mvp, speed_rev, low_cost])
    fastest_rev = safe_calc(lambda: min(100, speed_rev * 10 + 2), [speed_rev])
    lowest_cost = safe_calc(lambda: min(100, low_cost * 10 + 2), [low_cost])
    differentiation = safe_calc(lambda: min(100, ai_auto * 7 + (reg_tail or 5) * 3), [ai_auto])
    tech_feasibility = safe_calc(lambda: min(100, ease_mvp * 9 + 5), [ease_mvp])
    market_size = safe_calc(lambda: min(100, mkt_demand * 9 + 5), [mkt_demand])
    profit_potential = safe_calc(lambda: min(100, (wtp + compound) / 2 * 9 + 5), [wtp, compound])
    confidence = None if checklist.get("unknownCount", 0) > 4 else round((checklist['scorePercentage'] * 0.6 + 40), 1)

    all_dim_vals = [v for v in [overall_opp, bootstrap, solo_founder, fastest_rev, lowest_cost, differentiation, tech_feasibility, market_size, profit_potential, confidence] if v is not None]
    composite_headline = round(sum(all_dim_vals) / len(all_dim_vals), 1) if all_dim_vals else None

    return {
        "compositeHeadline": composite_headline,
        "scoreStatus": "complete" if len(all_dim_vals) == 10 else ("partial" if len(all_dim_vals) > 0 else "insufficient_evidence"),
        "overallOpportunity": overall_opp,
        "bootstrappedPotential": bootstrap,
        "soloFounderPotential": solo_founder,
        "fastestPathToRevenue": fastest_rev,
        "lowestCostLaunch": lowest_cost,
        "differentiation": differentiation,
        "technicalFeasibility": tech_feasibility,
        "marketSize": market_size,
        "profitPotential": profit_potential,
        "confidence": confidence,
        "distributionScore": None,
        "competitiveMoat": None,
        "ltvcacScore": None,
        "cacScore": None,
        "evidenceQuality": None,
    }

# ── Kill Criteria Analysis ────────────────────────────────────────────────────
def run_kill_criteria(llm_idea: dict, scores: dict) -> dict:
    """P21: Kill criteria evaluate evidence. Unknown scores are not treated as safe."""
    conditions = {}
    def sv(k):
        val = scores.get(k)
        if isinstance(val, dict):
            val = val.get("value")
        return val

    conditions["Problem severity < 6.5"] = sv("problemSeverity") is not None and sv("problemSeverity") < 6.5
    conditions["Market size score < 50"] = sv("marketSize") is not None and sv("marketSize") < 50
    conditions["Willingness to pay < 6.5"] = sv("willingnessToPay") is not None and sv("willingnessToPay") < 6.5
    conditions["Switching cost too high (competitive moat < 50)"] = sv("competitiveMoat") is not None and sv("competitiveMoat") < 50
    # P21: MVP impossible must be evidence-based — never hardcoded False
    mvp_raw = llm_idea.get("timeToMvp") if llm_idea else None
    if mvp_raw:
        try:
            mvp_days = int(re.search(r'(\d+)', str(mvp_raw)).group(1))
            conditions["MVP impossible in 14 days"] = mvp_days > 90
        except Exception:
            conditions["MVP impossible in 14 days"] = False  # unparseable → not triggered
    else:
        conditions["MVP impossible in 14 days"] = False  # unknown → not triggered (not enough info)
    conditions["No reachable distribution channel"] = sv("distributionScore") is not None and sv("distributionScore") < 40
    conditions["Dominant incumbent with deep moat"] = sv("differentiation") is not None and sv("differentiation") < 30
    conditions["Founder fit missing (solo impossible)"] = sv("soloFounderPotential") is not None and sv("soloFounderPotential") < 50

    kill_flags = [k for k, v in conditions.items() if v]
    return {
        "killFlagged": len(kill_flags) > 0,
        "killCount": len(kill_flags),
        "killConditions": conditions,
        "killFlags": kill_flags,
    }

# ── Full Candidate Assembly ───────────────────────────────────────────────────
def assemble_candidate(llm_idea: dict, candidate_id: str, domain: dict, provider: str) -> dict:
    checklist = run_checklist(llm_idea)
    scores_25  = compute_composite_score(llm_idea, checklist)
    kill       = run_kill_criteria(llm_idea, scores_25)
    headline   = scores_25.get("compositeHeadline")

    slug_base = re.sub(r'[^a-z0-9]+', '-', llm_idea.get('name', 'candidate').lower()).strip('-')

    is_own_orch = (provider == "own-orch")

    return {
        "schemaVersion": "2.0.0",
        "id": candidate_id,
        "candidateId": candidate_id,
        "candidateSlug": slug_base,
        "name": llm_idea.get("name", "Discovered Candidate"),
        "oneSentenceConcept": llm_idea.get("oneSentenceConcept", ""),
        "elevatorPitch": llm_idea.get("elevatorPitch", ""),
        "detailedDescription": (
            f"Discovered via Autonomous Idea Engine v2 using provider '{provider}'. "
            f"Domain: {domain['category']} / {domain['subcategory']}."
        ),
        "category": llm_idea.get("category", domain["category"]),
        "subcategory": llm_idea.get("subcategory", domain["subcategory"]),
        "tags": list(set(llm_idea.get("tags", []) + domain.get("tags", []) + ["autonomous-discovered", "v2", provider])),
        "status": "staged",
        "generationMode": "deterministic-fallback" if is_own_orch else "llm-generated",
        "evidenceStatus": "unverified",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "provenance": {
            "sourceType": "Autonomous Idea Discovery Engine v2",
            "provider": provider,
            "researchRound": "auto",
            "notes": f"Generated by va-orchestrator → {provider}",
        },
        "atAGlance": {
            "targetCustomer": llm_idea.get("targetCustomer") or None,
            "problemSolved": llm_idea.get("problemSolved") or domain["trigger"],
            "whatToBuild": llm_idea.get("whatToBuild") or None,
            "howItMakesMoney": llm_idea.get("howItMakesMoney") or None,
            "whyCustomersPay": llm_idea.get("whyCustomersPay") or None,
            "estimatedEarningPotential": None,
            "startupCost": None if is_own_orch else (
                {"currency": "EUR", "minimum": 0, "maximum": llm_idea.get("startupCostMax")}
                if llm_idea.get("startupCostMax") is not None else None
            ),
        },
        "hypotheses": {
            "claimType": "model_inference",
            "mainAdvantage": llm_idea.get("mainAdvantage") or None,
            "mainRisk": llm_idea.get("mainRisk") or None,
            "bestNextValidationStep": llm_idea.get("bestNextValidationStep") or None,
        },
        "scores": {
            dim: {
                "value": scores_25.get(dim),   # P13: None when missing, never 70.0
                "confidence": "unverified",    # P14: LLM hypothesis only, no evidence
                "evidenceRefs": []
            }
            for dim in SCORE_DIMS
        },
        "compositeScores": scores_25,
        "validationChecklist": checklist,
        "killCriteria": kill,
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

# ── Auto-Promote ──────────────────────────────────────────────────────────────
HIGH_PRIORITY_SCORE_THRESHOLD = float(os.environ.get('HIGH_PRIORITY_SCORE_THRESHOLD', os.environ.get('AUTO_PROMOTE_THRESHOLD', '85')))
AUTO_PROMOTE_THR = HIGH_PRIORITY_SCORE_THRESHOLD  # Deprecated backward-compat alias

def mark_candidate_ready_for_validation(idea: dict) -> bool:
    """Mark high-scoring candidate as prioritized for validation (does NOT mutate canonical data)."""
    idea["prioritizedForValidation"] = False
    idea["reviewPriority"] = "unassessed"
    return False

    # Legacy score-priority heuristic retained below only for migration archaeology.
    score = idea.get("compositeScores", {}).get("compositeHeadline", 0)
    if score >= HIGH_PRIORITY_SCORE_THRESHOLD and not idea.get("killCriteria", {}).get("killFlagged"):
        idea["prioritizedForValidation"] = True
        idea["reviewPriority"] = "high"
        idea["priority"] = 100
        log_info(
            f"HIGH-PRIORITY CANDIDATE {idea['id']} '{idea['name']}' "
            f"(score={score}) queued for validation & serialized publication",
            id=idea['id'], score=score
        )
        return True
    return False

# ── Main ──────────────────────────────────────────────────────────────────────
def process_single_domain(run_idx: int, existing_snapshot: list, queue_snapshot: list,
                          existing_names_snapshot: list, max_cost_class: int):
    domain = random.choice(SEARCH_DOMAINS)
    candidate_id = generate_candidate_id()
    log_info(f"[{run_idx+1}/{IDEAS_PER_RUN}] Parallel Domain worker active: '{domain['category']}' → candidate ID: {candidate_id}")

    prompt = build_idea_prompt(domain, existing_names_snapshot)
    try:
        raw_resp, provider = call_llm(
            prompt,
            domain,
            required_capabilities=[],
            match_mode="all",
            requires_external_evidence=False,
            max_cost_class=max_cost_class,
        )
    except Exception as e:
        log_error(f"Orchestrator error: {e}")
        return ("failed", None)

    llm_idea = extract_json(raw_resp)
    if not llm_idea:
        log_warn("Could not parse JSON from LLM response, retrying with own-orch")
        from va_orchestrator import _call_own_orchestrator
        raw_resp = _call_own_orchestrator(prompt, domain)
        llm_idea = extract_json(raw_resp)
        provider = "own-orch"
        if not llm_idea:
            log_error("Own-orch also failed JSON parse, skipping this iteration")
            return ("failed", None)

    idea_name = llm_idea.get('name', '')

    if is_duplicate(idea_name, existing_names_snapshot):
        log_warn(f"Duplicate idea '{idea_name}' — skipping", name=idea_name)
        return ("rejected", None)

    idea = assemble_candidate(llm_idea, candidate_id, domain, provider)
    checklist = idea["validationChecklist"]
    kill = idea["killCriteria"]
    headline = idea["compositeScores"].get("compositeHeadline")

    log_info(
        f"Generated {idea['id']}: '{idea['name']}' "
        f"score={headline} checklist={checklist['scorePercentage']}% "
        f"provider={provider}",
        id=idea['id'], score=headline, provider=provider
    )

    if kill["killFlagged"]:
        log_warn(
            f"KILL-FLAGGED: {idea['id']} has {kill['killCount']} kill conditions: "
            f"{', '.join(kill['killFlags'])}",
            id=idea['id']
        )
        return ("rejected", None)

    return ("valid", idea)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Venture Atlas Autonomous Generator')
    parser.add_argument('--once', action='store_true', help='Execute single bounded pass (default)')
    parser.add_argument('--max-concurrency', type=int, default=5, help='Maximum parallel workers')
    parser.add_argument('--max-cost', type=int, default=3, help='Maximum cost class (0=free, 3=high)')
    parser.add_argument('--worktrees', action='store_true', help='Enable Git worktree isolation for workers')
    parser.add_argument('--no-promote', action='store_true', help='Disable automatic candidate promotion')
    parser.add_argument('--force-discovery', action='store_true', help='Explicitly bypass the persisted novelty cooldown for this run')
    args, _ = parser.parse_known_args()

    log_info(f"=== Venture Atlas Autonomous Parallel Idea Engine v2.5 Started (bounded={not args.worktrees}) ===")
    existing = load_existing_ideas()
    queue    = load_staging_queue()
    existing_names = get_all_existing_names(existing, queue)
    log_info(f"Loaded {len(existing)} canonical ideas, {len(queue)} staged, "
             f"{len(existing_names)} known names for dedup")

    state = _load_state()
    novelty_settings = {
        "window_runs": NOVELTY_WINDOW_RUNS,
        "minimum_yield": NOVELTY_MIN_YIELD,
        "cooldown_runs": NOVELTY_COOLDOWN_RUNS,
    }
    novelty_control = normalize_control(state.get("noveltyControl"), **novelty_settings)
    if is_throttled(novelty_control, **novelty_settings) and not args.force_discovery:
        receipt = gate_receipt(novelty_control, **novelty_settings)
        state["noveltyControl"] = consume_cooldown(novelty_control, **novelty_settings)
        _save_state(state)
        log_warn(
            "NOVELTY_THROTTLED: recent evaluated discovery runs remained below "
            f"yield {receipt['minimumYield']:.2f}; provider calls skipped "
            f"(cooldown before this skip={receipt['cooldownRemaining']})"
        )
        print(json.dumps({"noveltyGate": receipt, "generated": 0, "staged": 0}, sort_keys=True))
        return 0
    if args.force_discovery and is_throttled(novelty_control, **novelty_settings):
        log_warn("Novelty cooldown explicitly bypassed by --force-discovery")

    generated = 0
    staged    = 0
    prioritized = 0
    rejected  = 0
    failed = 0

    from concurrent.futures import ThreadPoolExecutor, as_completed
    max_workers = min(IDEAS_PER_RUN, args.max_concurrency)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(process_single_domain, idx, existing, queue, existing_names, args.max_cost)
            for idx in range(IDEAS_PER_RUN)
        ]

        for future in as_completed(futures):
            try:
                res = future.result()
            except Exception as exc:
                log_error(f"Worker crashed: {exc}")
                failed += 1
                continue
            if not res:
                continue
            status, idea = res
            if status == "rejected":
                rejected += 1
            elif status == "failed":
                failed += 1
            elif status == "valid" and idea:
                # Secondary within-run dedup check in main thread
                if is_duplicate(idea['name'], existing_names):
                    log_warn(f"Within-run duplicate detected for '{idea['name']}' — skipping", name=idea['name'])
                    rejected += 1
                    continue

                generated += 1
                if mark_candidate_ready_for_validation(idea):
                    prioritized += 1
                queue.append(idea)
                save_staging_queue(queue)
                existing_names.append(idea['name'].lower())
                staged += 1
                headline = idea["compositeScores"].get("compositeHeadline")
                log_success(
                    f"STAGED CANDIDATE: {idea['id']} '{idea['name']}' (score={headline}) "
                    f"Queue size: {len(queue)}",
                    id=idea['id'], score=headline
                )

    # Update state totals
    state["totalIdeasGenerated"] = state.get("totalIdeasGenerated", 0) + generated
    state["totalCandidatesStaged"] = state.get("totalCandidatesStaged", 0) + staged
    state["noveltyControl"] = record_result(
        novelty_control, accepted=staged, rejected=rejected, failed=failed, **novelty_settings
    )
    _save_state(state)

    log_info(
        f"=== Run complete: generated={generated} staged={staged} "
        f"prioritized={prioritized} rejected={rejected} failed={failed} ==="
    )
    print(f"\n{'='*60}")
    print(f"  Generated   : {generated}")
    print(f"  Staged      : {staged}")
    print(f"  Prioritized : {prioritized}")
    print(f"  Rejected    : {rejected}")
    print(f"  Failed      : {failed}")
    print(f"  Novelty gate: {json.dumps(gate_receipt(state['noveltyControl'], **novelty_settings), sort_keys=True)}")
    print(f"{'='*60}")
    print(f"  Review staged: python scripts/review-staged-ideas.py")
    print(f"  Run ranker:    python scripts/va-ranker.py")
    if failed == IDEAS_PER_RUN:
        log_error("FAILED: every discovery worker failed; zero-new is not a successful run")
        return 2
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
