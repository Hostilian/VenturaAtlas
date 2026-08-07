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

def compute_headline(idea: dict) -> float:
    """Compute weighted composite headline score."""
    ch = idea.get('compositeScores', {}).get('compositeHeadline')
    if ch is not None and float(ch) > 0:
        return float(ch)
    total = 0.0
    weight_sum = 0.0
    for dim, w in SCORE_WEIGHTS.items():
        v = get_val(idea, dim)
        if v is not None:
            total += v * w
            weight_sum += w
    return round(total / weight_sum if weight_sum else 50.0, 1)

def rank_ideas(ideas: list) -> list:
    ranked = []
    for rank_pos, idea in enumerate(
        sorted(ideas, key=lambda x: compute_headline(x), reverse=True), start=1
    ):
        score = compute_headline(idea)
        ranked.append({
            "rank": rank_pos,
            "id": idea.get("id", "?"),
            "name": idea.get("name", "?"),
            "category": idea.get("category", "?"),
            "score": score,
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

def update_rankings_json(ranked: list):
    existing = {}
    if os.path.exists(RANKINGS_PATH):
        try:
            with open(RANKINGS_PATH, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
            existing = loaded if isinstance(loaded, dict) else {}
        except Exception:
            pass

    ranking_items = []
    for r in ranked:
        ranking_items.append({
            "rank": r["rank"],
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
        })

    view_obj = {
        "id": "overall-top-opportunities",
        "title": "Overall Top Opportunities",
        "description": "Rankings sorted by weighted composite headline score",
        "items": ranking_items
    }

    out = {
        "schemaVersion": "2.0.0",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "totalIdeas": len(ranked),
        "algorithm": "weighted-composite-v2",
        "weights": SCORE_WEIGHTS,
        "rankings": [view_obj],
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
    print(f"✅ Rankings saved to: {RANKINGS_PATH}")

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
