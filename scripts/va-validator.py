#!/usr/bin/env python3
"""
Venture Atlas OS — Standalone Idea Validator
=============================================
Validates any idea (by ID or from staging queue) against:
  - 8-point strict checklist
  - 25-dimension Venture Atlas scoring
  - 8 Kill Criteria conditions
  - LLM-powered deep critique (if provider available)

Usage:
  python scripts/va-validator.py                     # validate all in staging queue
  python scripts/va-validator.py --id idea-071       # validate specific canonical idea
  python scripts/va-validator.py --all               # validate all canonical ideas
  python scripts/va-validator.py --staged            # validate all staged ideas
  python scripts/va-validator.py --report report.md  # output full markdown report
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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from va_orchestrator import call_llm, extract_json, log_info, log_warn, log_error, log_success

BASE_DIR        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')
QUEUE_JSON_PATH = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')

# ── Load .env ─────────────────────────────────────────────────────────────────
_env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(_env_path):
    with open(_env_path, 'r', encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                if _k.strip() and not os.environ.get(_k.strip()):
                    os.environ[_k.strip()] = _v.strip()

CHECKLIST_CRITERIA = [
    "Startup cost $0-$100 maximum",
    "Payment received before vendor expenses incurred",
    "No inventory, pre-funded worker pool, or upfront capital required",
    "Solo-founder buildable within 7-14 days MVP",
    "Gross margin potential > 65%",
    "High problem severity and willingness to pay (≥ 6.5)",
    "Independent of consulting or manual hourly billing",
    "Data or workflow asset compounds over time",
]

KILL_CONDITIONS = [
    ("Problem severity < 6.5",             lambda s: s.get("problemSeverity", 70) < 65),
    ("Market size score < 50",             lambda s: s.get("marketSize", 70) < 50),
    ("Willingness to pay < 6.5",           lambda s: s.get("willingnessToPay", 70) < 65),
    ("Switching cost too high (moat < 50)", lambda s: s.get("competitiveMoat", 70) < 50),
    ("MVP timeframe > 14 days",            lambda s: False),  # checked via checklist
    ("No reachable distribution",          lambda s: s.get("distributionScore", 70) < 40),
    ("Dominant incumbent (diff < 30)",     lambda s: s.get("differentiation", 70) < 30),
    ("Solo impossible (solo score < 50)",  lambda s: s.get("soloFounderPotential", 70) < 50),
]

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

def get_score(idea: dict, dim: str, default=None):
    """Get score value from idea scores dict, handling both old and new schema."""
    scores = idea.get('scores', {})
    cs = idea.get('compositeScores', {})
    # Try compositeScores first (new schema)
    if dim in cs:
        v = cs[dim]
        return float(v) if isinstance(v, (int, float)) else default
    # Try scores (old schema — each is a dict with 'value')
    if dim in scores:
        v = scores[dim]
        if isinstance(v, dict):
            return float(v.get('value', default))
        return float(v)
    return default

def validate_idea(idea: dict, use_llm: bool = False) -> dict:
    """Full validation of a single idea. Returns validation report dict."""
    iid  = idea.get('id', '?')
    name = idea.get('name', '?')
    # This command is an assessment, not behavioral validation. Missing evidence
    # stays unknown and model-authored copy cannot satisfy a checklist or create a
    # validation timestamp.
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return {
        "id": iid,
        "name": name,
        "headlineScore": None,
        "assessmentStatus": "INSUFFICIENT_EVIDENCE",
        "checklist": {
            "passed": False,
            "passedCount": 0,
            "failedCount": 0,
            "unknownCount": len(CHECKLIST_CRITERIA),
            "scorePercentage": None,
            "details": {criterion: "unknown" for criterion in CHECKLIST_CRITERIA},
        },
        "killCriteria": {
            "killFlagged": False,
            "killCount": 0,
            "unknownCount": len(KILL_CONDITIONS),
            "killFlags": [],
            "details": {label: "unknown" for label, _ in KILL_CONDITIONS},
        },
        "topScores": {
            dim: get_score(idea, dim)
            for dim in ["overallOpportunity", "bootstrappedPotential", "soloFounderPotential",
                        "fastestPathToRevenue", "differentiation", "profitPotential"]
        },
        "verdict": "BLOCKED",
        "llmCritique": None,
        "assessedAt": now,
        "assessmentNote": "No behavioral validation receipts were evaluated.",
    }

    # Legacy heuristic assessment retained below only for migration archaeology.
    composite = idea.get('compositeScores', {})
    headline  = composite.get('compositeHeadline', idea.get('atAGlance', {}).get('overallScore', 0))

    # ── 8-point checklist re-check ──────────────────────────────────────────
    text = json.dumps(idea).lower()
    checklist = {
        CHECKLIST_CRITERIA[0]: idea.get('atAGlance', {}).get('startupCost', {}).get('maximum', 100) <= 100,
        CHECKLIST_CRITERIA[1]: any(kw in text for kw in ['preorder','prepaid','paid pilot','bounty','prepaid deliverable','fixed-scope']),
        CHECKLIST_CRITERIA[2]: 'no inventory' in text or 'inventory' not in text,
        CHECKLIST_CRITERIA[3]: True,  # assume true if in repo
        CHECKLIST_CRITERIA[4]: True,  # gross margin assumed from category
        CHECKLIST_CRITERIA[5]: (get_score(idea, 'problemSeverity') >= 65 and
                                  get_score(idea, 'willingnessToPay') >= 65),
        CHECKLIST_CRITERIA[6]: 'consulting' not in text or 'no consulting' in text,
        CHECKLIST_CRITERIA[7]: get_score(idea, 'compoundingAsset') >= 60,
    }
    passed = sum(1 for v in checklist.values() if v)
    checklist_score = round((passed / len(CHECKLIST_CRITERIA)) * 100, 1)

    # ── Kill criteria ────────────────────────────────────────────────────────
    kill_results = {}
    for label, fn in KILL_CONDITIONS:
        kill_results[label] = fn(composite)
    kill_flags = [k for k, v in kill_results.items() if v]

    # ── LLM deep critique ───────────────────────────────────────────────────
    llm_critique = None
    if use_llm:
        prompt = (
            f"You are a startup analyst. Critically evaluate this business idea:\n\n"
            f"Name: {name}\n"
            f"Concept: {idea.get('oneSentenceConcept', '')}\n"
            f"Pitch: {idea.get('elevatorPitch', '')}\n"
            f"Category: {idea.get('category', '')}\n"
            f"Revenue: {idea.get('atAGlance', {}).get('howItMakesMoney', '')}\n\n"
            f"Provide:\n"
            f"1. Top 3 strengths\n"
            f"2. Top 3 risks\n"
            f"3. Most important 48-hour validation test\n"
            f"4. Revised composite score (0-100)\n"
            f"Keep response under 200 words. Be honest and critical."
        )
        try:
            resp, provider = call_llm(prompt)
            llm_critique = {"text": resp, "provider": provider}
        except Exception as e:
            llm_critique = {"error": str(e)}

    return {
        "id": iid,
        "name": name,
        "headlineScore": float(headline),
        "checklist": {
            "passed": passed >= 6,
            "passedCount": passed,
            "scorePercentage": checklist_score,
            "details": checklist,
        },
        "killCriteria": {
            "killFlagged": len(kill_flags) > 0,
            "killCount": len(kill_flags),
            "killFlags": kill_flags,
            "details": kill_results,
        },
        "topScores": {
            dim: get_score(idea, dim)
            for dim in ["overallOpportunity","bootstrappedPotential","soloFounderPotential",
                        "fastestPathToRevenue","differentiation","profitPotential"]
        },
        "verdict": (
            "STRONG" if (headline >= 80 and passed >= 7 and not kill_flags) else
            "GOOD"   if (headline >= 70 and passed >= 6 and len(kill_flags) <= 1) else
            "WEAK"   if (headline >= 60) else
            "REJECT"
        ),
        "llmCritique": llm_critique,
        "validatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

def print_report(results: list):
    """Print a formatted validation report to stdout."""
    print(f"\n{'='*72}")
    print(f"  VENTURE ATLAS — IDEA VALIDATION REPORT")
    print(f"  Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*72}")
    print(f"{'ID':<12} {'Score':<8} {'Checklist':<12} {'Kill':<6} {'Verdict':<10} Name")
    print(f"{'-'*72}")
    for r in sorted(results, key=lambda x: x.get('headlineScore') if x.get('headlineScore') is not None else -1, reverse=True):
        verdict_icons = {"STRONG":"🟢","GOOD":"🟡","WEAK":"🟠","REJECT":"🔴"}
        icon = verdict_icons.get(r['verdict'], '⚪')
        score_text = f"{r['headlineScore']:.1f}" if r.get('headlineScore') is not None else "UNKNOWN"
        checklist_text = f"{r['checklist']['scorePercentage']:.1f}" if r['checklist'].get('scorePercentage') is not None else "UNKNOWN"
        print(f"{r['id']:<12} {score_text:<8} {checklist_text:<12}"
              f"{r['killCriteria']['killCount']:<6} {icon}{r['verdict']:<9} {r['name'][:40]}")
    print(f"\nSummary:")
    verdicts = [r['verdict'] for r in results]
    for v in ["STRONG","GOOD","WEAK","REJECT"]:
        count = verdicts.count(v)
        if count:
            print(f"  {v}: {count}")
    print(f"{'='*72}\n")

def save_report(results: list, path: str):
    lines = [
        "# Venture Atlas — Idea Validation Report",
        f"> Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "| ID | Score | Checklist% | Kill | Verdict | Name |",
        "|----|-------|-----------|------|---------|------|",
    ]
    for r in sorted(results, key=lambda x: x.get('headlineScore') if x.get('headlineScore') is not None else -1, reverse=True):
        score_text = f"{r['headlineScore']:.1f}" if r.get('headlineScore') is not None else "UNKNOWN"
        checklist_text = f"{r['checklist']['scorePercentage']:.1f}%" if r['checklist'].get('scorePercentage') is not None else "UNKNOWN"
        lines.append(
            f"| {r['id']} | {score_text} | {checklist_text} | "
            f"{r['killCriteria']['killCount']} | **{r['verdict']}** | {r['name']} |"
        )
    if any(r.get('llmCritique') for r in results):
        lines += ["", "## LLM Critiques", ""]
        for r in results:
            if r.get('llmCritique') and 'text' in r['llmCritique']:
                lines += [f"### {r['id']} — {r['name']}", r['llmCritique']['text'], ""]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"Report saved to: {path}")

def main():
    parser = argparse.ArgumentParser(description='Venture Atlas Idea Validator')
    parser.add_argument('--id', help='Validate a specific idea by ID')
    parser.add_argument('--all', action='store_true', help='Validate all canonical ideas')
    parser.add_argument('--staged', action='store_true', help='Validate all staged ideas (default)')
    parser.add_argument('--llm', action='store_true', help='Include LLM deep critique (uses API)')
    parser.add_argument('--report', help='Save markdown report to this path')
    args = parser.parse_args()

    ideas   = load_ideas()
    queue   = load_queue()
    targets = []

    if args.id:
        match = next((i for i in ideas + queue if i.get('id') == args.id), None)
        if not match:
            print(f"❌ Idea ID '{args.id}' not found.")
            sys.exit(1)
        targets = [match]
    elif args.all:
        targets = ideas
        log_info(f"Validating all {len(targets)} canonical ideas...")
    else:
        targets = queue
        if not targets:
            print("📭 Staging queue is empty. Run: python scripts/autonomous-idea-generator.py")
            return
        log_info(f"Validating {len(targets)} staged ideas...")

    results = []
    for idea in targets:
        log_info(f"Validating {idea.get('id','?')}: {idea.get('name','?')}")
        r = validate_idea(idea, use_llm=args.llm)
        results.append(r)
        v_icon = {"STRONG":"✅","GOOD":"👍","WEAK":"⚠️","REJECT":"❌"}.get(r['verdict'],'❓')
        score_text = f"{r['headlineScore']:.1f}" if r.get('headlineScore') is not None else "UNKNOWN"
        checklist_text = r['checklist'].get('scorePercentage')
        print(f"  {v_icon} {r['id']}: {r['verdict']} (score={score_text}, "
              f"checklist={checklist_text if checklist_text is not None else 'UNKNOWN'}, kill={r['killCriteria']['killCount']})")

    print_report(results)
    if args.report:
        save_report(results, args.report)

if __name__ == '__main__':
    main()
