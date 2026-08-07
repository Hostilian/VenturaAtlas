import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
raw = json.loads((root / 'data/ideas.json').read_text(encoding='utf-8'))
ideas = raw if isinstance(raw, list) else raw.get('ideas', [])
errs = []
for x in ideas:
    if not re.fullmatch(r'idea-\d{3}', x.get('id', '')):
        errs.append('bad id ' + str(x.get('id', '?')))

print(json.dumps({'ideas': len(ideas), 'errors': errs}, indent=2))
sys.exit(bool(errs))
