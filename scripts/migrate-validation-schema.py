#!/usr/bin/env python3
"""
Venture Atlas OS — Validation Freshness Metadata Migration
===========================================================
Ensures all canonical ideas contain explicit validation freshness fields:
  - lastValidatedAt (ISO date string)
  - validationStatus ('validated' | 'unverified' | 'legacy')
  - sourceCheckedAt (ISO date string)
  - evidenceFreshness (high | medium | basic)
  - contradictions (list of recorded contradictory claims)
"""

import json
import os
import sys
import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')

def main():
    if not os.path.exists(IDEAS_PATH):
        print(f"Error: {IDEAS_PATH} not found")
        return

    with open(IDEAS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    ideas = data.get('ideas', []) if isinstance(data, dict) else data
    updated_count = 0
    now_str = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')

    for idea in ideas:
        sources = idea.get('sourceReferences', [])
        sources_count = len(sources) if isinstance(sources, list) else 0

        if 'validationStatus' not in idea:
            idea['validationStatus'] = 'validated' if sources_count >= 2 else ('legacy' if sources_count == 1 else 'unverified')
            updated_count += 1

        if 'lastValidatedAt' not in idea:
            idea['lastValidatedAt'] = now_str
            updated_count += 1

        if 'sourceCheckedAt' not in idea:
            idea['sourceCheckedAt'] = now_str
            updated_count += 1

        if 'evidenceFreshness' not in idea:
            idea['evidenceFreshness'] = 'high' if sources_count >= 3 else ('medium' if sources_count >= 1 else 'basic')
            updated_count += 1

        if 'contradictions' not in idea:
            idea['contradictions'] = []
            updated_count += 1

    with open(IDEAS_PATH, 'w', encoding='utf-8') as f:
        if isinstance(data, dict):
            data['ideas'] = ideas
            json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            json.dump(ideas, f, indent=2, ensure_ascii=False)

    print(f"✅ Validation freshness migration complete: updated {updated_count} fields across {len(ideas)} ideas.")

if __name__ == '__main__':
    main()
