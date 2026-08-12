#!/usr/bin/env python3
"""
Venture Atlas OS — Staged Ideas Review & Promotion Utility

CLI tool to:
1. List all candidate ideas currently sitting in data/idea-staging-queue.json.
2. Promote approved candidates into data/ideas.json and generate their full dossier Markdown file in ideas/.
3. Clear or reject candidates from the staging queue.
"""

import json
import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')
QUEUE_JSON_PATH = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('ideas', []) if isinstance(data, dict) and 'ideas' in data else data

def save_ideas(ideas):
    with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump({"schemaVersion": "2.0.0", "ideas": ideas}, f, indent=2, ensure_ascii=False)

def save_queue(queue):
    with open(QUEUE_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)

def list_queue():
    queue = load_json(QUEUE_JSON_PATH)
    if not queue:
        print("📭 Staging Queue is empty. Run `python scripts/autonomous-idea-generator.py` to discover new ideas.")
        return
    print(f"\n📥 STAGING QUEUE — {len(queue)} candidate ideas awaiting review:\n")
    print(f"{'ID':<10} {'Score':<8} {'Category':<32} {'Name'}")
    print("-" * 80)
    for q in queue:
        iid = q.get('id', '—')
        score = q.get('atAGlance', {}).get('overallScore', '—')
        cat = q.get('category', '—')[:30]
        name = q.get('name', '—')
        print(f"{iid:<10} {score:<8} {cat:<32} {name}")
    print("\nTo promote an idea: python scripts/review-staged-ideas.py promote <idea-id>")
    print("To clear queue:     python scripts/review-staged-ideas.py clear")

def promote_idea(target_id, receipt_path):
    queue = load_json(QUEUE_JSON_PATH)
    
    match = None
    remaining_queue = []
    for item in queue:
        if item.get('id') == target_id or item.get('candidateId') == target_id or item.get('legacyCandidateId') == target_id:
            match = item
        else:
            remaining_queue.append(item)
            
    if not match:
        print(f"❌ Error: Idea/Candidate ID '{target_id}' not found in staging queue.")
        return

    if not receipt_path or not os.path.exists(receipt_path):
        print("❌ Publication requires an explicit reviewed CANONICALIZE receipt JSON file.")
        return
    with open(receipt_path, "r", encoding="utf-8") as receipt_file:
        receipt = json.load(receipt_file)

    from va_runtime.publisher import publish_candidate
    ok, msg, canonical_id = publish_candidate(match, receipt)
    if not ok:
        print(f"❌ Publication failed: {msg}")
        return
        
    save_queue(remaining_queue)
    print(f"✅ Promoted '{match.get('name')}' as canonical idea '{canonical_id}' via Serialized Publisher!")
    print("🔍 Triggered search index and metadata build.")

def clear_queue():
    save_queue([])
    print("🧹 Staging queue cleared.")

def main():
    if len(sys.argv) < 2:
        list_queue()
        return
    cmd = sys.argv[1].lower()
    if cmd == 'list':
        list_queue()
    elif cmd == 'promote' and len(sys.argv) >= 4:
        promote_idea(sys.argv[2], sys.argv[3])
    elif cmd == 'clear':
        clear_queue()
    else:
        print("Usage: python scripts/review-staged-ideas.py [list|promote <id> <canonicalization-receipt.json>|clear]")

if __name__ == '__main__':
    main()
