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

# Filter to external market evidence sources (s01..s83), excluding internal provenance artifacts (src-*)
# Checks explicit metadata flags: visibility, sourceClass, evidenceEligible, provenanceEligible
public_sources = []
for s in sources_list:
    sid = str(s.get('id', ''))
    visibility = str(s.get('visibility', 'PUBLIC')).upper()
    source_class = str(s.get('sourceClass', 'EXTERNAL_EVIDENCE')).upper()
    evidence_eligible = s.get('evidenceEligible', True)
    
    if (
        sid.startswith('src-') or 
        visibility in ('INTERNAL', 'PRIVATE') or 
        source_class in ('INTERNAL_PROVENANCE_ARTIFACT', 'PROVENANCE') or
        evidence_eligible is False
    ):
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
