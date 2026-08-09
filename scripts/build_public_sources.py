import json
import os
import hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sources_file = os.path.join(ROOT, "data", "sources.json")
public_sources_file = os.path.join(ROOT, "data", "public-sources.json")

with open(sources_file, 'rb') as f:
    raw_content = f.read()

source_hash = hashlib.sha256(raw_content).hexdigest()
sources = json.loads(raw_content.decode('utf-8'))

if isinstance(sources, dict):
    sources_list = sources.get('sources', [])
else:
    sources_list = sources

# Filter to external market evidence sources (s01..s70), excluding internal provenance artifacts (src-*)
# Also check explicit metadata flags visibility != 'INTERNAL' and visibility != 'PRIVATE'
public_sources = []
for s in sources_list:
    sid = str(s.get('id', ''))
    visibility = str(s.get('visibility', 'PUBLIC')).upper()
    if sid.startswith('src-') or visibility in ('INTERNAL', 'PRIVATE'):
        continue
    public_sources.append(s)

output_payload = {
    "schemaVersion": "2.0.0",
    "sourceRevision": source_hash[:16],
    "count": len(public_sources),
    "sources": public_sources
}

serialized = json.dumps(public_sources, indent=2, ensure_ascii=False) + '\n'

with open(public_sources_file, 'w', encoding='utf-8') as pf:
    pf.write(serialized)

print(f"[OK] Generated data/public-sources.json ({len(public_sources)} public external evidence sources extracted from {len(sources_list)} total sources, SHA256: {source_hash[:12]}).")
