import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
queue_file = os.path.join(ROOT, "data", "idea-staging-queue.json")

with open(queue_file, 'r', encoding='utf-8') as f:
    queue = json.load(f)

is_dict = isinstance(queue, dict)
items = queue.get('ideas', queue.get('queue', [])) if is_dict else queue

migrated_count = 0
for item in items:
    if not item.get('evidenceStatus'):
        item['evidenceStatus'] = 'unverified'
        item['promotionEligible'] = False
        item['requiresExternalEvidence'] = True
        migrated_count += 1

with open(queue_file, 'w', encoding='utf-8') as qf:
    json.dump(queue, qf, indent=2, ensure_ascii=False)
    qf.write('\n')

print(f"[OK] Migrated {migrated_count} unverified staged candidate records in data/idea-staging-queue.json (set evidenceStatus: 'unverified', promotionEligible: False, requiresExternalEvidence: True).")
