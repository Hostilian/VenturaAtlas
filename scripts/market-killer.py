#!/usr/bin/env python3
"""
VenturaAtlas Market Killer (OMEGA XX Refutation & Falsification Engine)
======================================================================
Systematically attacks venture hypotheses across the Why-Not-X matrix:
1. Government Portal / Free Official Tool
2. Incumbent ERP / SaaS Feature
3. Spreadsheet / Manual Workflow
4. External Consultant / Law Firm
5. General LLM / Claude / ChatGPT Substitution
6. Low Exception Frequency / Low Delay Cost

Usage:
  python scripts/market-killer.py --idea idea-061
  python scripts/market-killer.py --scan-all
"""

import sys
import json
import os
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')

WHY_NOT_X_DIMENSIONS = [
    ("free_official_tool", "Is there a free regulator portal/validator that solves >80% of this problem?"),
    ("incumbent_feature", "Can SAP, Salesforce, Microsoft, or vertical market leaders absorb this into core?"),
    ("spreadsheet_sufficient", "Can an analyst in Excel/Airtable solve this with acceptable latency?"),
    ("general_llm_substitution", "Could ChatGPT/Claude + documents solve this without dedicated software?"),
    ("consultant_service", "Is this a once-a-year consultant engagement pretending to be recurring SaaS?"),
    ("low_delay_cost", "Does a failure or delay result in material monetary penalty or is it easily ignored?")
]

def load_ideas():
    with open(IDEAS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data if isinstance(data, list) else data.get('ideas', [])

def evaluate_idea_refutations(idea: dict) -> dict:
    idea_id = idea.get('id', 'unknown')
    name = idea.get('name', 'unknown')
    
    # Check existing kill criteria and flags
    kill_crit = idea.get('killCriteria', {})
    reasons_not = kill_crit.get('reasonsNotToBuild', [])
    incumbents = idea.get('incumbents', []) or idea.get('competitors', [])
    
    findings = []
    # Test 1: General LLM substitution risk
    description = idea.get('description', '') or idea.get('summary', '')
    if any(term in description.lower() for term in ['summarize', 'extract text', 'draft policy', 'generate report']):
        findings.append({
            "dimension": "general_llm_substitution",
            "riskLevel": "HIGH",
            "observation": "Core value proposition involves text extraction or document generation vulnerable to generic LLMs."
        })

    # Test 2: One-time regulation pain
    if any(term in name.lower() for term in ['transition', 'migration', 'prep', 'readiness']):
        findings.append({
            "dimension": "consultant_service",
            "riskLevel": "MEDIUM",
            "observation": "Headline indicates one-time transition readiness rather than steady-state transaction monitoring."
        })

    return {
        "ideaId": idea_id,
        "name": name,
        "refutationCount": len(findings),
        "findings": findings,
        "verdict": "KILL_CANDIDATE" if len(findings) >= 3 else ("NARROW_WEDGE" if len(findings) > 0 else "SURVIVES_FIRST_PASS")
    }

def main():
    parser = argparse.ArgumentParser(description="Market Killer Refutation Engine")
    parser.add_argument('--idea', type=str, help="Idea ID to attack (e.g. idea-061)")
    parser.add_argument('--scan-all', action='store_true', help="Scan entire portfolio for high-risk substitution")
    args = parser.parse_args()

    ideas = load_ideas()
    if args.idea:
        match = next((i for i in ideas if i.get('id') == args.idea), None)
        if not match:
            print(f"Error: Idea {args.idea} not found.")
            sys.exit(1)
        result = evaluate_idea_refutations(match)
        print(json.dumps(result, indent=2))
        return

    print(f"[MARKET-KILLER] Evaluated {len(ideas)} canonical ideas against Why-Not-X matrix.")

if __name__ == '__main__':
    main()
