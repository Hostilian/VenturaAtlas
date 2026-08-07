from pathlib import Path
import hashlib,json,sys
r=Path(__file__).resolve().parents[1]
m=json.loads((r/'research/constitution/CONSTITUTION_METADATA.json').read_text())
p=r/'research/constitution/ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md'
h=hashlib.sha256(p.read_bytes()).hexdigest()
assert h==m['sha256'], f"Constitution checksum changed: {h} != {m['sha256']}"
for fn in ['data/ranking-runs.json','data/decisions.json']:
 d=json.loads((r/fn).read_text())
 for x in d:
  assert x.get('constitutionVersion') and x.get('constitutionChecksum'), f"Missing constitution reference in {fn}"
print('Constitution integrity OK',h)
