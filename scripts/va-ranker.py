#!/usr/bin/env python3
"""
Venture Atlas OS — Ranking Engine
===================================
Recomputes composite scores for all ideas and outputs sorted rankings.

Usage:
  python scripts/va-ranker.py               # rank all canonical ideas
  python scripts/va-ranker.py --top 20      # show top 20
  python scripts/va-ranker.py --category "AI evaluation & launch gates"
  python scripts/va-ranker.py --update      # update data/rankings.json
  python scripts/va-ranker.py --compare idea-001 idea-021 idea-047
"""

import json
import os
import sys
import argparse
import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR         = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON_PATH  = os.path.join(BASE_DIR, 'data', 'ideas.json')
RANKINGS_PATH    = os.path.join(BASE_DIR, 'data', 'rankings.json')
QUEUE_JSON_PATH  = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')

SCORE_WEIGHTS = {
    "overallOpportunity":    0.25,
    "bootstrappedPotential": 0.15,
    "soloFounderPotential":  0.15,
    "fastestPathToRevenue":  0.10,
    "confidence":            0.10,
    "differentiation":       0.10,
    "profitPotential":       0.10,
    "distributionScore":     0.05,
}

def load_ideas() -> list:
    if not os.path.exists(IDEAS_JSON_PATH):
        return []
    with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('ideas', []) if isinstance(data, dict) else data

def load_queue() -> list:
    if not os.path.exists(QUEUE_JSON_PATH):
        return []
    try:
        with open(QUEUE_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def get_val(idea: dict, dim: str, default=None) -> float:
    """Extract a score dimension value from either schema version. Returns None if missing."""
    cs = idea.get('compositeScores', {})
    if dim in cs and cs[dim] is not None:
        v = cs[dim]
        return float(v) if isinstance(v, (int, float)) else default
    sc = idea.get('scores', {})
    if dim in sc and sc[dim] is not None:
        v = sc[dim]
        if isinstance(v, dict):
            val = v.get('value')
            return float(val) if val is not None else default
        return float(v)
    # Try atAGlance for backward compat
    if dim == 'overallOpportunity':
        val = idea.get('atAGlance', {}).get('overallScore')
        return float(val) if val is not None else default
    return default

def compute_headline(idea: dict) -> tuple[float, float]:
    """Compute weighted composite headline score and coverage (0-100, 0.0-1.0)."""
    ch = idea.get('compositeScores', {}).get('compositeHeadline')
    if ch is not None and float(ch) > 0:
        return float(ch), 1.0
    total = 0.0
    weight_sum = 0.0
    total_possible_weights = sum(SCORE_WEIGHTS.values())

    for dim, w in SCORE_WEIGHTS.items():
        v = get_val(idea, dim, default=None)
        if v is not None:
            total += v * w
            weight_sum += w

    coverage = round(weight_sum / total_possible_weights, 2) if total_possible_weights > 0 else 0.0
    score = round(total / weight_sum, 1) if weight_sum > 0 else 0.0
    return score, coverage

def compute_attractiveness(idea: dict) -> float:
    """Compute Opportunity Attractiveness score (0-100). Returns 0.0 if no dimensions present."""
    weights = {"problemSeverity": 0.2, "willingnessToPay": 0.2, "marketDemand": 0.15, "revenuePotential": 0.15, "grossMarginPotential": 0.1, "defensibility": 0.1, "scalability": 0.1}
    total, weight_sum = 0.0, 0.0
    for dim, w in weights.items():
        v = get_val(idea, dim, default=None)
        if v is not None:
            total += v * w
            weight_sum += w
    if weight_sum == 0.0:
        return 0.0
    raw_avg = total / weight_sum
    return round(raw_avg * 10.0 if raw_avg <= 10 else raw_avg, 1)

def compute_founder_fit(idea: dict) -> float:
    """Compute baseline Founder Fit score (0-100). Returns 0.0 if no dimensions present."""
    weights = {"speedToFirstRevenue": 0.25, "lowStartupCost": 0.25, "easeOfMvp": 0.2, "operationalSimplicity": 0.15, "founderAccessibility": 0.15}
    total, weight_sum = 0.0, 0.0
    for dim, w in weights.items():
        v = get_val(idea, dim, default=None)
        if v is not None:
            total += v * w
            weight_sum += w
    if weight_sum == 0.0:
        return 0.0
    raw_avg = total / weight_sum
    return round(raw_avg * 10.0 if raw_avg <= 10 else raw_avg, 1)

def compute_evidence_confidence(idea: dict) -> float:
    """
    Compute Evidence Confidence score (0-100).
    Zero sources produces 0.0 (or 10.0 if initial desk research exists).
    Does NOT start at 50.0 without evidence.
    """
    sources = idea.get("sourceReferences", [])
    has_disconfirming = idea.get("validationChecklist", {}).get("adversarialPassCompleted", False)
    
    if not sources or len(sources) == 0:
        base = 10.0 if idea.get("dossierPath") or idea.get("oneSentenceConcept") else 0.0
    elif len(sources) >= 5:
        base = 75.0
    elif len(sources) >= 3:
        base = 55.0
    elif len(sources) >= 2:
        base = 40.0
    else:
        base = 25.0

    if has_disconfirming:
        base += 20.0

    return min(100.0, round(base, 1))

def rank_ideas(ideas: list) -> list:
    ranked = []
    # Sort by headline score, breaking ties by evidence confidence
    sorted_list = sorted(
        ideas,
        key=lambda x: (compute_headline(x)[0], compute_evidence_confidence(x)),
        reverse=True
    )

    for rank_pos, idea in enumerate(sorted_list, start=1):
        score, coverage = compute_headline(idea)
        attractiveness = compute_attractiveness(idea)
        founder_fit = compute_founder_fit(idea)
        evidence_conf = compute_evidence_confidence(idea)

        confidence_label = "high" if evidence_conf >= 70 else ("medium" if evidence_conf >= 40 else ("low" if evidence_conf > 0 else "unverified"))
        
        ranked.append({
            "rank": rank_pos,
            "id": idea.get("id", "?"),
            "name": idea.get("name", "?"),
            "category": idea.get("category", "?"),
            "score": score,
            "opportunityAttractiveness": attractiveness,
            "founderFit": founder_fit,
            "evidenceConfidence": evidence_conf,
            "checklist": idea.get("validationChecklist", {}).get("scorePercentage", 0),
            "killFlagged": idea.get("killCriteria", {}).get("killFlagged", False),
            "provider": idea.get("provenance", {}).get("provider", "legacy"),
            "status": idea.get("status", "canonical"),
            "topDimensions": {
                dim: get_val(idea, dim)
                for dim in ["overallOpportunity","bootstrappedPotential",
                            "soloFounderPotential","differentiation","profitPotential"]
            },
        })
    return ranked

def print_leaderboard(ranked: list, top_n: int = 20, category_filter: str = None):
    filtered = ranked
    if category_filter:
        filtered = [r for r in ranked if category_filter.lower() in r['category'].lower()]

    print(f"\n{'='*80}")
    print(f"  VENTURE ATLAS — IDEA LEADERBOARD")
    print(f"  Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if category_filter:
        print(f"  Filter: {category_filter}")
    print(f"  Showing: Top {min(top_n, len(filtered))} of {len(filtered)} ideas")
    print(f"{'='*80}")
    print(f"{'Rank':<5} {'Score':<7} {'Check%':<8} {'K':<3} {'ID':<10} Name")
    print(f"{'-'*80}")
    for r in filtered[:top_n]:
        kill_flag = "⚠" if r['killFlagged'] else " "
        print(f"{r['rank']:<5} {r['score']:<7.1f} {r['checklist']:<8.1f} "
              f"{kill_flag:<3} {r['id']:<10} {r['name'][:40]}")
    print(f"{'='*80}")

    # Category breakdown
    cats = {}
    for r in ranked:
        cats[r['category']] = cats.get(r['category'], [])
        cats[r['category']].append(r['score'])
    print("\n── Category Averages ──")
    for cat, scores in sorted(cats.items(), key=lambda x: -sum(x[1])/len(x[1])):
        avg = sum(scores) / len(scores)
        print(f"  {avg:<7.1f}  {cat[:50]} ({len(scores)} ideas)")
    print()

def compare_ideas(ranked: list, ids: list):
    print(f"\n{'='*72}")
    print(f"  COMPARISON: {' vs '.join(ids)}")
    print(f"{'='*72}")
    for target_id in ids:
        match = next((r for r in ranked if r['id'] == target_id), None)
        if not match:
            print(f"\n❌ {target_id}: Not found")
            continue
        print(f"\n#{match['rank']} — {match['id']}: {match['name']}")
        print(f"   Composite Score:  {match['score']:.1f}")
        print(f"   Checklist Score:  {match['checklist']:.1f}%")
        print(f"   Kill Flagged:     {'⚠️ YES' if match['killFlagged'] else '✅ NO'}")
        print(f"   Category:         {match['category']}")
        print(f"   Provider:         {match['provider']}")
        for dim, val in match['topDimensions'].items():
            bar = '█' * int(val / 10) + '░' * (10 - int(val / 10))
            print(f"   {dim:<25} {val:>5.1f}  {bar}")
    print(f"{'='*72}\n")

def update_rankings_json(ranked: list, ideas: list = None):
    existing = {}
    if os.path.exists(RANKINGS_PATH):
        try:
            with open(RANKINGS_PATH, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
            existing = loaded if isinstance(loaded, dict) else {}
        except Exception:
            pass

    ideas_list = ideas if ideas is not None else load_ideas()
    ideas_map = {i.get("id"): i for i in ideas_list}

    def format_item(r, rank_num):
        return {
            "rank": rank_num,
            "ideaId": r["id"],
            "id": r["id"],
            "name": r["name"],
            "category": r["category"],
            "score": r["score"],
            "checklist": r["checklist"],
            "killFlagged": r["killFlagged"],
            "provider": r["provider"],
            "status": r["status"],
            "topDimensions": r["topDimensions"]
        }

    # 1. Overall Top Opportunities
    overall_items = [format_item(r, i + 1) for i, r in enumerate(ranked)]
    
    # 2. High Opportunity Attractiveness
    attractiveness_sorted = sorted(ranked, key=lambda x: (x.get("opportunityAttractiveness", 0), x["score"]), reverse=True)
    attractiveness_items = [format_item(r, i + 1) for i, r in enumerate(attractiveness_sorted)]

    # 3. Best Solo Founder Fit
    founder_fit_sorted = sorted(ranked, key=lambda x: (x.get("founderFit", 0), x["score"]), reverse=True)
    founder_fit_items = [format_item(r, i + 1) for i, r in enumerate(founder_fit_sorted)]

    # 4. Highest Evidence Confidence
    confidence_sorted = sorted(ranked, key=lambda x: (x.get("evidenceConfidence", 0), x["score"]), reverse=True)
    confidence_items = [format_item(r, i + 1) for i, r in enumerate(confidence_sorted)]

    # 5. Fastest Path to Revenue
    fastest_sorted = sorted(ranked, key=lambda x: (get_val(ideas_map.get(x["id"], {}), "speedToFirstRevenue", 0) or 0, x["score"]), reverse=True)
    fastest_items = [format_item(r, i + 1) for i, r in enumerate(fastest_sorted)]

    # 6. Lowest Startup Capital
    lowest_cost_sorted = sorted(ranked, key=lambda x: (get_val(ideas_map.get(x["id"], {}), "lowStartupCost", 0) or 0, x["score"]), reverse=True)
    lowest_cost_items = [format_item(r, i + 1) for i, r in enumerate(lowest_cost_sorted)]

    # 7. Tournament Finalists & Reset Winners
    finalists_raw = [r for r in ranked if r["status"] == "priority" or r["id"] in ["idea-061", "idea-062", "idea-185", "idea-186", "idea-230", "idea-231", "idea-240", "idea-241"]]
    finalists_sorted = sorted(finalists_raw if finalists_raw else ranked[:25], key=lambda x: x["score"], reverse=True)
    finalists_items = [format_item(r, i + 1) for i, r in enumerate(finalists_sorted)]

    views = [
        {
            "id": "overall-top-opportunities",
            "title": "🏆 Overall Top Opportunities",
            "description": "Rankings sorted by weighted composite headline score across all evidence dimensions",
            "algorithmVersion": "weighted-composite-v2",
            "items": overall_items
        },
        {
            "id": "attractiveness",
            "title": "💡 High Opportunity Attractiveness",
            "description": "Ranked by problem severity, demand, and overall market revenue potential",
            "algorithmVersion": "attractiveness-v1",
            "items": attractiveness_items
        },
        {
            "id": "founder-fit",
            "title": "🎯 Best Solo Founder Fit",
            "description": "Ranked by speed to revenue, low startup cost, and ease of building MVP",
            "algorithmVersion": "founder-fit-v1",
            "items": founder_fit_items
        },
        {
            "id": "highest-confidence",
            "title": "🛡️ Highest Evidence Confidence",
            "description": "Ranked by source quality, citations, and completed disconfirming red-team passes",
            "algorithmVersion": "evidence-confidence-v1",
            "items": confidence_items
        },
        {
            "id": "fastest-first-revenue",
            "title": "⚡ Fastest Path to Revenue",
            "description": "Ranked by minimal time-to-first-dollar and low distribution friction",
            "algorithmVersion": "speed-revenue-v1",
            "items": fastest_items
        },
        {
            "id": "lowest-startup-cost",
            "title": "💸 Lowest Startup Capital",
            "description": "Ranked by minimal initial financial requirement ($0–$100)",
            "algorithmVersion": "low-cost-v1",
            "items": lowest_cost_items
        },
        {
            "id": "reset-finalists",
            "title": "🏁 Reset Tournament Finalists",
            "description": "Highest-scoring winners and finalists across research reset tournaments",
            "algorithmVersion": "tournament-finalists-v1",
            "items": finalists_items
        }
    ]

    out = {
        "schemaVersion": "2.0.0",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "totalIdeas": len(ranked),
        "rankingViewsCount": len(views),
        "algorithm": "weighted-composite-v2",
        "weights": SCORE_WEIGHTS,
        "rankings": views,
        "history": existing.get("history", []),
    }
    
    snapshot = {
        "snapshotAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "top5": [{"id": r["id"], "name": r["name"], "score": r["score"]} for r in ranked[:5]],
    }
    history = existing.get("history", [])
    history.append(snapshot)
    out["history"] = history[-10:]

    with open(RANKINGS_PATH, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(views)} canonical ranking views ({len(ranked)} ideas) to: {RANKINGS_PATH}")

def main():
    parser = argparse.ArgumentParser(description='Venture Atlas Ranking Engine')
    parser.add_argument('--top', type=int, default=20, help='Show top N ideas (default: 20)')
    parser.add_argument('--category', help='Filter by category substring')
    parser.add_argument('--update', action='store_true', help='Save updated rankings.json')
    parser.add_argument('--compare', nargs='+', help='Compare specific idea IDs')
    parser.add_argument('--staged', action='store_true', help='Include staged ideas in ranking')
    args = parser.parse_args()

    ideas = load_ideas()
    if args.staged:
        queue = load_queue()
        ideas = ideas + queue
        print(f"Including {len(queue)} staged ideas in ranking.")

    if not ideas:
        print("No ideas found. Check data/ideas.json")
        return

    print(f"Loading and ranking {len(ideas)} ideas...")
    ranked = rank_ideas(ideas)

    if args.compare:
        compare_ideas(ranked, args.compare)
    else:
        print_leaderboard(ranked, top_n=args.top, category_filter=args.category)

    if args.update:
        update_rankings_json(ranked)
    else:
        print("Tip: Run with --update to save rankings.json")

if __name__ == '__main__':
    main()
