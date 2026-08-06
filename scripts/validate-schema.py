import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
ideas = json.loads((root / 'data/ideas.json').read_text(encoding='utf-8'))
errs = []
for x in ideas:
    if not re.fullmatch(r'idea-\d{3}', x.get('id', '')):
        errs.append('bad id ' + x.get('id', '?'))
    if len(x.get('scores', {})) != 25:
        errs.append(x.get('id', '?') + ' must have 25 scores')
print(json.dumps({'ideas': len(ideas), 'errors': errs}, indent=2))
sys.exit(bool(errs))
