import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sources_file = os.path.join(ROOT, "data", "sources.json")
public_sources_file = os.path.join(ROOT, "data", "public-sources.json")

with open(sources_file, 'r', encoding='utf-8') as f:
    sources = json.load(f)

if isinstance(sources, dict):
    sources_list = sources.get('sources', [])
else:
    sources_list = sources

# Filter to external market evidence sources (s01..s70), excluding internal provenance artifacts (src-001..src-012)
public_sources = [s for s in sources_list if not str(s.get('id', '')).startswith('src-')]

with open(public_sources_file, 'w', encoding='utf-8') as pf:
    json.dump(public_sources, pf, indent=2, ensure_ascii=False)
    pf.write('\n')

print(f"[OK] Generated data/public-sources.json ({len(public_sources)} public external evidence sources extracted from {len(sources_list)} total sources).")
