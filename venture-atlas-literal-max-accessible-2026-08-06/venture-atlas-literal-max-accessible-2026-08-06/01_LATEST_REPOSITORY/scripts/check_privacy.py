from pathlib import Path
import re,sys
r=Path(__file__).resolve().parents[1]
patterns=[re.compile(r'(?i)(api[_ -]?key|password|secret|access[_ -]?token)\s*[:=]\s*[A-Za-z0-9_\-]{12,}'),re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')]
hits=[]
for p in r.rglob('*'):
 if p.is_file() and '.git' not in p.parts and p.suffix.lower() in {'.md','.json','.js','.py','.html','.yml','.yaml','.txt'}:
  t=p.read_text(errors='ignore')
  if any(x.search(t) for x in patterns): hits.append(str(p.relative_to(r)))
print('Privacy/secret heuristic hits:',len(hits))
for h in hits: print(h)
sys.exit(1 if hits else 0)
