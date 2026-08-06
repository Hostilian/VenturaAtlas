import json,statistics
from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'data/evaluations/index.json'
d=json.loads(p.read_text())
by={}
for e in d: by.setdefault(e['ideaId'],[]).append(float(e['score']))
out={}
for k,v in by.items(): out[k]={'mean':sum(v)/len(v),'median':statistics.median(v),'min':min(v),'max':max(v),'stdev':statistics.pstdev(v),'evaluators':len(v),'polarization':statistics.pstdev(v)}
print(json.dumps(out,indent=2))
