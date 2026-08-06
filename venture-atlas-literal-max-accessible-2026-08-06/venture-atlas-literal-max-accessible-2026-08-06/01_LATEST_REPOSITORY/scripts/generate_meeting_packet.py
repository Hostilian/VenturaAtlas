from pathlib import Path
import json,datetime
r=Path(__file__).resolve().parents[1]
ideas=json.loads((r/'data/ideas.json').read_text())
out=['# Venture Atlas Meeting Packet','',f'Generated: {datetime.date.today().isoformat()}','', '## Top research scores']
for x in sorted(ideas,key=lambda i:i.get('compositeScores',{}).get('overallOpportunity',0),reverse=True)[:10]: out.append(f"- {x['id']} — {x['name']}")
(r/'meeting-packets/latest.md').parent.mkdir(exist_ok=True); (r/'meeting-packets/latest.md').write_text('\n'.join(out)+'\n')
print('meeting-packets/latest.md')
