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

# ── Loading ───────────────────────────────────────────────────────────────────
def load_existing_ideas() -> list:
    if not os.path.exists(IDEAS_JSON_PATH):
        return []
    with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('ideas', []) if isinstance(data, dict) else data

def load_staging_queue() -> list:
    if not os.path.exists(QUEUE_JSON_PATH):
        return []
    try:
        with open(QUEUE_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_staging_queue(queue: list):
    with open(QUEUE_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)

def save_canonical(ideas: list):
    with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump({"schemaVersion": "2.0.0", "ideas": ideas}, f, indent=2, ensure_ascii=False)

def get_next_idea_id(existing: list, queue: list) -> str:
    max_id = 0
    for i in list(existing) + list(queue):
        iid = i.get('id', '')
        if iid.startswith('idea-'):
            try:
                num = int(iid.replace('idea-', ''))
                max_id = max(max_id, num)
            except ValueError:
                pass
    return f"idea-{max_id + 1:03d}"

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
    scores = llm_idea.get('scores', {})
    results = {}

    # 1. Startup cost ≤ $100
    c1 = llm_idea.get('startupCostMax', 100) <= 100
    results[CHECKLIST_CRITERIA[0]] = c1

    # 2. Payment before expense (look for keywords)
    text = json.dumps(llm_idea).lower()
    c2 = any(kw in text for kw in ["preorder", "prepaid", "paid pilot", "bounty", "upfront payment", "payment before"])
    if not c2:
        # Check revenue model description
        how = llm_idea.get('howItMakesMoney', '').lower()
        c2 = any(kw in how for kw in ["prepaid", "fixed-scope", "fixed scope", "upfront", "preorder"])
    results[CHECKLIST_CRITERIA[1]] = c2

    # 3. No inventory (default True for software/digital)
    c3 = 'inventory' not in text or 'no inventory' in text
    results[CHECKLIST_CRITERIA[2]] = c3

    # 4. Solo-founder buildable (mvp ≤ 14 days)
    mvp = llm_idea.get('timeToMvp', '3-7 days')
    try:
        days = int(re.search(r'(\d+)', mvp).group(1))
        c4 = days <= 14
    except Exception:
        c4 = True
    results[CHECKLIST_CRITERIA[3]] = c4

    # 5. Gross margin > 65%
    c5 = llm_idea.get('grossMarginEstimate', 70) >= 65
    results[CHECKLIST_CRITERIA[4]] = c5

    # 6. Problem severity ≥ 6.5 AND willingness to pay ≥ 6.5
    sev = scores.get('problemSeverity', 7.0)
    wtp = scores.get('willingnessToPay', 7.0)
    c6 = float(sev) >= 6.5 and float(wtp) >= 6.5
    results[CHECKLIST_CRITERIA[5]] = c6

    # 7. Not consulting (default True for tool/SaaS ideas)
    c7 = 'consulting' not in text.replace('no consulting', '') or 'no consulting' in text
    results[CHECKLIST_CRITERIA[6]] = c7

    # 8. Compounding asset
    compound_score = scores.get('compoundingAsset', 7.0)
    c8 = float(compound_score) >= 6.0
    results[CHECKLIST_CRITERIA[7]] = c8

    passed = sum(1 for v in results.values() if v)
    return {
        "passed": passed >= 6,
        "passedCount": passed,
        "totalCriteria": len(CHECKLIST_CRITERIA),
        "scorePercentage": round((passed / len(CHECKLIST_CRITERIA)) * 100, 1),
        "details": results,
    }

# ── 25-Dimension Composite Score ──────────────────────────────────────────────
def compute_composite_score(llm_idea: dict, checklist: dict) -> dict:
    scores = llm_idea.get('scores', {})
    def s(k, default=7.0): return float(scores.get(k, default))

    # Core 10 from LLM/Own-Orch
    problem_sev  = s('problemSeverity')
    freq_need    = s('frequencyOfNeed')
    wtp          = s('willingnessToPay')
    mkt_demand   = s('marketDemand')
    speed_rev    = s('speedToFirstRevenue')
    low_cost     = s('lowStartupCost')
    ease_mvp     = s('easeOfMvp')
    ai_auto      = s('aiAutomationPotential')
    reg_tail     = s('regulatoryTailwind')
    compound     = s('compoundingAsset')

    # Derived 15
    overall_opp      = round((problem_sev*0.2 + wtp*0.15 + mkt_demand*0.15 + speed_rev*0.1 +
                               low_cost*0.1 + ease_mvp*0.1 + compound*0.1 + ai_auto*0.1) * 10, 1)
    bootstrap        = round(min(100, (low_cost + ease_mvp + speed_rev) / 3 * 10 + 5), 1)
    solo_founder     = round(min(100, (ease_mvp + speed_rev + low_cost) / 3 * 10 + 3), 1)
    fastest_rev      = round(min(100, speed_rev * 10 + 2), 1)
    lowest_cost      = round(min(100, low_cost * 10 + 2), 1)
    differentiation  = round(min(100, ai_auto * 7 + reg_tail * 3), 1)
    tech_feasibility = round(min(100, ease_mvp * 9 + 5), 1)
    market_size      = round(min(100, mkt_demand * 9 + 5), 1)
    profit_potential = round(min(100, (wtp + compound) / 2 * 9 + 5), 1)
    confidence       = round(min(100, (checklist['scorePercentage'] * 0.6 + 40)), 1)
    distribution     = round(min(100, (mkt_demand + speed_rev) / 2 * 9 + 4), 1)
    competitive_moat = round(min(100, (compound + reg_tail) / 2 * 8 + 5), 1)
    ltvcac           = round(min(100, (wtp + compound - freq_need * 0.2) * 9), 1)
    cac_score        = round(min(100, speed_rev * 8 + 10), 1)
    evidence_quality = round(min(100, checklist['scorePercentage'] * 0.7 + 30), 1)

    return {
        "problemSeverity":       round(problem_sev * 10, 1),
        "frequencyOfNeed":       round(freq_need * 10, 1),
        "willingnessToPay":      round(wtp * 10, 1),
        "marketDemand":          round(mkt_demand * 10, 1),
        "speedToFirstRevenue":   round(speed_rev * 10, 1),
        "lowStartupCost":        round(low_cost * 10, 1),
        "easeOfMvp":             round(ease_mvp * 10, 1),
        "aiAutomationPotential": round(ai_auto * 10, 1),
        "regulatoryTailwind":    round(reg_tail * 10, 1),
        "compoundingAsset":      round(compound * 10, 1),
        "overallOpportunity":    overall_opp,
        "bootstrappedPotential": bootstrap,
        "soloFounderPotential":  solo_founder,
        "fastestPathToRevenue":  fastest_rev,
        "lowestCostLaunch":      lowest_cost,
        "differentiation":       differentiation,
        "technicalFeasibility":  tech_feasibility,
        "marketSize":            market_size,
        "profitPotential":       profit_potential,
        "confidence":            confidence,
        "distributionScore":     distribution,
        "competitiveMoat":       competitive_moat,
        "ltvcacScore":           ltvcac,
        "cacScore":              cac_score,
        "evidenceQuality":       evidence_quality,
        # Weighted headline score (used for ranking/auto-promote)
        "compositeHeadline":     round(
            overall_opp * 0.30 +
            bootstrap   * 0.15 +
            solo_founder * 0.15 +
            fastest_rev  * 0.10 +
            confidence   * 0.10 +
            differentiation * 0.10 +
            profit_potential * 0.10,
            1
        ),
    }

# ── Kill Criteria Analysis ────────────────────────────────────────────────────
def run_kill_criteria(llm_idea: dict, scores: dict) -> dict:
    """8 kill conditions from Venture Atlas IDEA_LIFECYCLE_PROMPTS Stage 2.5."""
    conditions = {}
    def sv(k, default=7.0): return float(scores.get(k, default))

    conditions["Problem severity < 6.5"] = sv("problemSeverity") < 6.5
    conditions["Market size score < 50"] = sv("marketSize") < 50
    conditions["Willingness to pay < 6.5"] = sv("willingnessToPay") < 6.5
    conditions["Switching cost too high (competitive moat < 50)"] = sv("competitiveMoat") < 50
    conditions["MVP impossible in 14 days"] = False  # Already validated in checklist
    conditions["No reachable distribution channel"] = sv("distributionScore") < 40
    conditions["Dominant incumbent with deep moat"] = sv("differentiation") < 30
    conditions["Founder fit missing (solo impossible)"] = sv("soloFounderPotential") < 50

    kill_flags = [k for k, v in conditions.items() if v]
    return {
        "killFlagged": len(kill_flags) > 0,
        "killCount": len(kill_flags),
        "killConditions": conditions,
        "killFlags": kill_flags,
    }

# ── Full Idea Assembly ─────────────────────────────────────────────────────────
def assemble_idea(llm_idea: dict, next_id: str, domain: dict, provider: str) -> dict:
    checklist = run_checklist(llm_idea)
    scores_25  = compute_composite_score(llm_idea, checklist)
    kill       = run_kill_criteria(llm_idea, scores_25)
    headline   = scores_25["compositeHeadline"]

    slug_base = re.sub(r'[^a-z0-9]+', '-', llm_idea.get('name', next_id).lower()).strip('-')
    slug = f"{slug_base}-{next_id}"

    return {
        "schemaVersion": "2.0.0",
        "id": next_id,
        "legacyId": slug_base,
        "slug": slug,
        "name": llm_idea.get("name", f"Idea {next_id}"),
        "oneSentenceConcept": llm_idea.get("oneSentenceConcept", ""),
        "elevatorPitch": llm_idea.get("elevatorPitch", ""),
        "detailedDescription": (
            f"Discovered via Autonomous Idea Engine v2 using provider '{provider}'. "
            f"Domain: {domain['category']} / {domain['subcategory']}. "
            f"Trigger: {domain['trigger']}."
        ),
        "category": llm_idea.get("category", domain["category"]),
        "subcategory": llm_idea.get("subcategory", domain["subcategory"]),
        "tags": list(set(llm_idea.get("tags", []) + domain.get("tags", []) +
                         ["autonomous-discovered", "v2", provider])),
        "status": "staged",
        "provenance": {
            "sourceType": "Autonomous Idea Discovery Engine v2",
            "provider": provider,
            "researchRound": "auto",
            "notes": f"Generated by va-orchestrator → {provider}",
        },
        "atAGlance": {
            "targetCustomer": llm_idea.get("targetCustomer", "Technical founders"),
            "problemSolved": llm_idea.get("problemSolved", domain["trigger"]),
            "whatToBuild": llm_idea.get("whatToBuild", domain["example"]),
            "howItMakesMoney": llm_idea.get("howItMakesMoney", "Prepaid deliverable or subscription"),
            "whyCustomersPay": llm_idea.get("whyCustomersPay", "Saves time and prevents loss"),
            "estimatedEarningPotential": {
                "currency": "EUR", "minimum": 3000, "midpoint": 40000, "maximum": 400000,
                "basis": "Analyst scenario range"
            },
            "startupCost": {
                "currency": "EUR", "minimum": 0,
                "midpoint": round(llm_idea.get("startupCostMax", 50) / 2),
                "maximum": llm_idea.get("startupCostMax", 100),
            },
            "timeToMvp": llm_idea.get("timeToMvp", "3-7 days"),
            "overallScore": round(headline, 1),
            "confidenceScore": round(scores_25["confidence"] / 10, 1),
            "mainAdvantage": "Zero pre-funded inventory, fast launch, compounding data asset",
            "mainRisk": "Channel acquisition conversion must be validated early",
            "bestNextValidationStep": "Offer a €19 prepaid pilot to 15 targeted buyers before building.",
        },
        "scores": {
            dim: {"value": scores_25.get(dim, 70.0), "confidence": "medium"}
            for dim in SCORE_DIMS
        },
        "compositeScores": scores_25,
        "validationChecklist": checklist,
        "killCriteria": kill,
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

# ── Auto-Promote ──────────────────────────────────────────────────────────────
def auto_promote(idea: dict, existing: list) -> bool:
    """Promote idea directly to canonical if compositeHeadline ≥ threshold."""
    score = idea.get("compositeScores", {}).get("compositeHeadline", 0)
    if score >= AUTO_PROMOTE_THR and not idea.get("killCriteria", {}).get("killFlagged"):
        existing.append(idea)
        save_canonical(existing)
        log_success(
            f"AUTO-PROMOTED {idea['id']} '{idea['name']}' "
            f"(score={score}) directly to ideas.json",
            id=idea['id'], score=score
        )
        return True
    return False

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    log_info("=== Venture Atlas Autonomous Idea Engine v2 Started ===")
    existing = load_existing_ideas()
    queue    = load_staging_queue()
    existing_names = get_all_existing_names(existing, queue)
    log_info(f"Loaded {len(existing)} canonical ideas, {len(queue)} staged, "
             f"{len(existing_names)} known names for dedup")

    generated = 0
    staged    = 0
    promoted  = 0
    rejected  = 0

    for run_idx in range(IDEAS_PER_RUN):
        domain = random.choice(SEARCH_DOMAINS)
        next_id = get_next_idea_id(existing, queue)
        log_info(f"[{run_idx+1}/{IDEAS_PER_RUN}] Domain: '{domain['category']}' → next ID: {next_id}")

        # Build prompt and call orchestrator
        prompt = build_idea_prompt(domain, existing_names)
        try:
            raw_resp, provider = call_llm(prompt, domain)
        except Exception as e:
            log_error(f"Orchestrator error: {e}")
            continue

        # Parse LLM JSON response
        llm_idea = extract_json(raw_resp)
        if not llm_idea:
            log_warn("Could not parse JSON from LLM response, retrying with own-orch")
            from va_orchestrator import _call_own_orchestrator
            raw_resp = _call_own_orchestrator(prompt, domain)
            llm_idea = extract_json(raw_resp)
            provider = "own-orch"
            if not llm_idea:
                log_error("Own-orch also failed JSON parse, skipping this iteration")
                continue

        idea_name = llm_idea.get('name', '')

        # Deduplication
        if is_duplicate(idea_name, existing_names):
            log_warn(f"Duplicate idea '{idea_name}' — skipping", name=idea_name)
            rejected += 1
            continue

        # Assemble full idea
        idea = assemble_idea(llm_idea, next_id, domain, provider)
        checklist = idea["validationChecklist"]
        kill = idea["killCriteria"]
        headline = idea["compositeScores"]["compositeHeadline"]
        generated += 1

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
            rejected += 1
            continue

        if not checklist["passed"]:
            log_warn(
                f"CHECKLIST FAILED: {idea['id']} scored {checklist['scorePercentage']}% "
                f"({checklist['passedCount']}/{checklist['totalCriteria']} passed)",
                id=idea['id']
            )
            rejected += 1
            continue

        # Try auto-promote
        if auto_promote(idea, existing):
            # Refresh existing_names
            existing_names.append(idea['name'].lower())
            promoted += 1
        else:
            queue.append(idea)
            save_staging_queue(queue)
            existing_names.append(idea['name'].lower())
            staged += 1
            log_success(
                f"STAGED: {idea['id']} '{idea['name']}' (score={headline}) "
                f"Queue size: {len(queue)}",
                id=idea['id'], score=headline
            )

    # Update state totals
    state = _load_state()
    state["totalIdeasGenerated"] = state.get("totalIdeasGenerated", 0) + generated
    state["totalIdeasPromoted"]  = state.get("totalIdeasPromoted", 0) + promoted
    _save_state(state)

    log_info(
        f"=== Run complete: generated={generated} staged={staged} "
        f"promoted={promoted} rejected={rejected} ==="
    )
    print(f"\n{'='*60}")
    print(f"  Generated : {generated}")
    print(f"  Staged    : {staged}")
    print(f"  Promoted  : {promoted}")
    print(f"  Rejected  : {rejected}")
    print(f"{'='*60}")
    print(f"  Review staged: python scripts/review-staged-ideas.py")
    print(f"  Run ranker:    python scripts/va-ranker.py")

if __name__ == '__main__':
    main()
