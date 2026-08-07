import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
votes=json.loads((r/'data/pairwise-votes.json').read_text())
score={}
for v in votes:
 for i in [v.get('ideaA'),v.get('ideaB')]: score.setdefault(i,{'wins':0,'losses':0,'ties':0})
 if v.get('choice')=='A': score[v['ideaA']]['wins']+=1; score[v['ideaB']]['losses']+=1
 elif v.get('choice')=='B': score[v['ideaB']]['wins']+=1; score[v['ideaA']]['losses']+=1
 elif v.get('choice')=='tie': score[v['ideaA']]['ties']+=1; score[v['ideaB']]['ties']+=1
print(json.dumps(score,indent=2))
