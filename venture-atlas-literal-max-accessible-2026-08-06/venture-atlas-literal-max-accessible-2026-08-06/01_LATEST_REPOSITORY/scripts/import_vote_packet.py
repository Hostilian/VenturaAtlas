import json,sys
from pathlib import Path
p=Path(sys.argv[1]); d=json.loads(p.read_text())
assert d.get('personId') and d.get('constitutionVersion')
print('Valid vote packet for',d['personId'])
