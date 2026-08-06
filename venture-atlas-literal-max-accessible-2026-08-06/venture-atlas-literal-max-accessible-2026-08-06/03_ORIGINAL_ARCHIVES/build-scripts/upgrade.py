from pathlib import Path
import json, hashlib, csv, os, re, shutil, datetime, zipfile, tarfile
root=Path('/mnt/data/work-vac/venture-atlas-collaborative')
prompt_src=Path('/mnt/data/Pasted markdown.md')
text=prompt_src.read_text(encoding='utf-8')
now='2026-08-06'

def w(rel, content):
 p=root/rel; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(content,encoding='utf-8')
def j(rel,obj): w(rel,json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

# Exact source archive, public-safe because prompt contains instructions only.
w('archive/public-redacted/SRC-0013-master-project-prompt.md', text)
w('archive/README.md', '# Archive\n\n`public-redacted/` contains source material reviewed for public release. `private-not-committed/` is excluded by `.gitignore` and is the designated location for sensitive raw exports.\n')
(root/'archive/private-not-committed').mkdir(parents=True,exist_ok=True)
w('archive/private-not-committed/.gitkeep','')

# Constitution: exact earliest full contract not available; preserve exact constitutional portion from current source.
start=text.find('# 3. IMMUTABLE RESEARCH CONSTITUTION')
end=text.find('# 4. INGESTION MUST HAPPEN BEFORE ENRICHMENT')
excerpt=text[start:end].rstrip()+"\n" if start>=0 and end>start else text
constitution_header='''# PARTIALLY RECOVERED ORIGINAL RESEARCH CONSTITUTION\n\n> **Provenance warning:** The earliest complete Deep Research execution contract was not available as a directly inspectable source in this session. The text below is copied exactly from `SRC-0013`, where it is explicitly presented as the mandatory surviving constitutional principles. It is preserved as **partially recovered exact text**, not falsely claimed as the full earliest original.\n\n'''
w('research/constitution/ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md',constitution_header+excerpt)
cs=sha(root/'research/constitution/ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md')
meta={
 'constitutionId':'CONST-0001','version':'0.1-partial','sourceId':'SRC-0013','sourceFile':'Pasted markdown.md',
 'sourceTimestamp':None,'sourceReference':'Section 3, IMMUTABLE RESEARCH CONSTITUTION','originalAuthor':'User',
 'extractionDate':now,'extractionMethod':'Exact UTF-8 section extraction',
 'recoveryStatus':'partially_recovered_exact','sha256':cs,
 'knownMissingPortions':['The earliest complete Deep Research execution contract and its historical approval wording were not present as a directly inspectable standalone source.'],
 'relatedApprovalCommand':'APPROVE — begin the 12-round investigation.','supersedingAmendments':[],
 'currentStatus':'Operational partial constitution; full original remains a provenance gap.'}
j('research/constitution/CONSTITUTION_METADATA.json',meta)
w('research/constitution/sha256.txt',cs+'  ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md\n')
w('research/constitution/README.md',f'''# Original Research Constitution\n\nThe repository treats the original Deep Research contract as immutable historical evidence. The currently preserved file is **partially recovered exact text** from `SRC-0013`; it is not represented as the unavailable full earliest prompt.\n\nCurrent version: `0.1-partial`  \nSHA-256: `{cs}`\n\nEvery ranking run and formal decision must reference this version and checksum. See `AMENDMENT_PROCESS.md`.\n''')
w('research/constitution/RECONSTRUCTED_READABLE_VERSION.md','''# Reconstructed Readable Constitution\n\n**Status: reconstructed, not original.**\n\nThe venture search prioritizes businesses that can be validated before meaningful spending, normally remain under a $100 pre-revenue ceiling, have an identifiable buyer, demonstrate existing spending or labor, permit payment-first testing, avoid illegal or fragile methods, and survive pessimistic financial and distribution assumptions. Full external research runs follow twelve documented rounds, preserve negative evidence, audit costs, and require explicit approval before browsing begins. Historical rankings remain immutable snapshots.\n''')
w('research/constitution/CONSTITUTION_CHANGELOG.md',f'''# Constitution Changelog\n\n## {now} — CONST-0001 v0.1-partial\n\n- Added the exact surviving constitutional section from SRC-0013.\n- Recorded that the earliest complete original contract remains unavailable.\n- Established checksum integrity and amendment requirements.\n''')
w('research/constitution/AMENDMENT_PROCESS.md','''# Constitutional Amendment Process\n\n1. Open a constitutional-amendment issue.\n2. Quote the exact proposed change and rationale.\n3. Identify whether the change clarifies, extends, or supersedes a rule.\n4. Obtain the group approval required by `collaboration/GOVERNANCE.md`.\n5. Add an amendment file; never edit historical source text in place.\n6. Update metadata, changelog, and checksum allow-list.\n7. Create a new constitution version and rerun all affected rankings.\n8. Preserve every previous version and ranking snapshot.\n''')

# Source inventory
files=[
 ('SRC-0001','venture-atlas-os-v2.zip','Generated repository archive','generated-output',Path('/mnt/data/venture-atlas-os-v2.zip')),
 ('SRC-0002','venture-atlas-os-v2.tar.gz','Generated repository archive','generated-output',Path('/mnt/data/venture-atlas-os-v2.tar.gz')),
 ('SRC-0013','Pasted markdown.md','Master Project Prompt','original-user-prompt',prompt_src),
]
inv=[]
for sid,fn,title,typ,p in files:
 inv.append({'id':sid,'filename':fn,'uploadedFilename':fn,'title':title,'sourceType':typ,'fileSizeBytes':p.stat().st_size if p.exists() else None,
 'lineCount':len(p.read_text(encoding='utf-8',errors='ignore').splitlines()) if p.exists() and p.suffix in ['.md','.txt'] else None,
 'pageCount':None,'visibleDate':None,'author':'User' if sid=='SRC-0013' else 'Assistant-generated artifact','timestamp':None,
 'extractionStatus':'reviewed','parseStatus':'parsed' if sid=='SRC-0013' else 'archive-inspected','duplicateStatus':'distinct',
 'relatedSources':[],'privacyClassification':'public-safe','publicReleaseStatus':'included' if sid=='SRC-0013' else 'referenced',
 'notes':'Full source available.' if p.exists() else 'Unavailable','checksum':sha(p) if p.exists() else None,'fullSourceAvailable':p.exists(),
 'displayedSourceTruncated':False,'containsGeneratedOutput':sid!='SRC-0013'})
j('data/source-inventory.json',inv)

# Preserve new prompt as exact prompt record
prompts=json.load(open(root/'data/prompts.json'))
prompt_record={'id':'PROMPT-1501','title':'Master Project Prompt — Complete Collaborative Venture Atlas','type':'original-project-governance',
 'ideaId':None,'path':'prompts/original/PROMPT-1501-master-project-prompt.md','sourceStatus':'exact-original','wordCount':len(text.split()),
 'sourceId':'SRC-0013','author':'User','timestamp':None,'purpose':'Govern repository ingestion, constitution preservation, collaboration, rankings, and deployment.',
 'relatedIdeas':[],'relatedResearchRuns':[],'parentPrompt':None,'childPrompts':[],'revisions':[],
 'constitutionRelationship':'Defines preservation and collaboration rules; contains a partially recovered exact constitutional section.'}
prompts.append(prompt_record)
j('data/prompts.json',prompts)
w('prompts/original/PROMPT-1501-master-project-prompt.md',text)

# extraction ledger append granular master prompt item
ledger=json.load(open(root/'data/extraction-ledger.json'))
ledger.append({'extractionId':'EXT-0206','itemType':'prompt','exactOriginalWording':text,'normalizedWording':'Master governance prompt for Venture Atlas Collaborative',
 'sourceId':'SRC-0013','sourceFilename':'Pasted markdown.md','speaker':'User','timestamp':None,'startLine':1,'endLine':len(text.splitlines()),
 'headingContext':'MASTER PROJECT PROMPT','extractionConfidence':'high','wordingExact':True,'wordingReconstructed':False,
 'relatedIdeaId':None,'relatedPromptId':'PROMPT-1501','relatedRankingId':None,'relatedDecisionId':None,'duplicateGroup':None,
 'publicPrivateStatus':'public-safe','notes':'Exact uploaded source preserved.'})
j('data/extraction-ledger.json',ledger)

# Collaboration data
for d in ['people','evaluations','comments','objections','commitments']:(root/'data'/d).mkdir(parents=True,exist_ok=True)
j('data/people/README.json',{'description':'Public-safe collaborator profiles belong here. Do not store private contact details.','profiles':[]})
j('data/evaluations/index.json',[]);j('data/comments/index.json',[]);j('data/objections/index.json',[]);j('data/commitments/index.json',[])
j('data/decisions.json',[]);j('data/pairwise-votes.json',[])
# Research runs reconstructed from original rankings
orig=json.load(open(root/'data/original-rankings.json'))
runs=[]
for i,r in enumerate(orig,1):
 runs.append({'id':f'RUN-{i:04d}','constitutionVersion':'0.1-partial','constitutionChecksum':cs,'promptId':None,'approvalStatus':'historical-unknown',
 'startDate':None,'completionDate':r.get('date'),'searchCount':None,'openedSourceCount':None,'primarySourceCount':None,'negativeSourceCount':None,
 'markets':[],'ideasConsidered':[],'costAuditedIdeas':[],'shortlist':[],'finalists':[], 'winner':r.get('winner'),'runnerUp':r.get('runnerUp'),
 'highUpsideAlternative':r.get('highUpside'),'overlookedOpportunity':r.get('overlooked'),'confidence':r.get('confidence'),
 'biggestUnresolvedRisk':'Unknown — source-level run metadata was not fully recoverable.','completionStatus':r.get('status','historical'),
 'missingRequirements':['Exact query count','Exact opened-source count','Approval record','Full finalist list']})
j('data/research-runs.json',runs)
j('data/ranking-runs.json',[{'id':f'RANK-{i:04d}','type':'original-research-ranking','researchRunId':run['id'],'constitutionVersion':'0.1-partial','constitutionChecksum':cs,'immutableSnapshot':True} for i,run in enumerate(runs,1)])

# collaboration docs/templates
w('collaboration/README.md','''# Collaboration\n\nVenture Atlas Collaborative supports three modes: browser-local drafts, Git-native shared collaboration, and an optional future backend adapter. Local votes do not synchronize until exported. GitHub Issues and pull requests are the default shared workflow.\n''')
w('collaboration/GOVERNANCE.md','''# Governance\n\nCanonical evidence is maintained separately from personal opinions. Historical research results cannot be overwritten. Constitutional amendments require a documented proposal, discussion, and explicit group approval. Formal decisions receive stable IDs and may only be revised through linked successor records.\n''')
w('collaboration/VOTING_RULES.md','''# Voting Rules\n\nRecord mean, median, range, standard deviation, confidence-weighted mean, objections, and polarization. A veto is advisory unless the group explicitly adopts binding veto rules. Private independent scoring should occur before aggregate results are shown when practical.\n''')
w('collaboration/DECISION_PROCESS.md','''# Decision Process\n\nIntake → constitutional screen → independent evaluation → shortlist → red team → validation commitment → final vote → stable decision record → scheduled review. Failed tests or material new evidence reopen a decision through a new linked version; history is never erased.\n''')
w('collaboration/MEETING_TEMPLATE.md','''# Venture Meeting\n\n## Decisions required\n## Evidence added\n## Largest disagreements\n## Pairwise battles\n## Active experiments\n## Commitments\n## Review dates\n''')
profile={'personId':'PERSON-XXXX','displayName':'Public display name','githubUsername':None,'role':None,'skills':[],'hoursPerWeek':None,'availableCapitalUsd':None,'riskTolerance':None,'preferredBusinessModels':[],'dealbreakers':[],'personalWeights':{},'privacy':'public-safe'}
evalT={'evaluationId':'EVAL-XXXX','personId':'PERSON-XXXX','ideaId':'IDEA-XXXX','score':None,'confidence':None,'reasonToBuild':'','reasonNotToBuild':'','dealbreaker':'','trustedEvidence':[],'disputedEvidence':[],'contribution':'','nextExperiment':'','weeklyCommitmentHours':None,'vetoRequested':False,'changeConditions':''}
vote={'packetVersion':'1.0','personId':'PERSON-XXXX','researchSnapshot':None,'constitutionVersion':'0.1-partial','evaluations':[],'pairwiseVotes':[]}
j('collaboration/FRIEND_PROFILE_TEMPLATE.json',profile);j('collaboration/EVALUATION_TEMPLATE.json',evalT);j('collaboration/VOTE_PACKET_TEMPLATE.json',vote)
w('collaboration/BACKEND_ADAPTER.md','''# Optional Shared Backend Adapter\n\nDisabled by default. Any future adapter must define authentication, schema, row-level security, privacy, cost ceilings, secrets management, export/migration, and a complete disable procedure. The static Git-native workflow must remain functional.\n''')

# Decisions
w('decisions/README.md','# Decisions\n\nFormal decisions use stable `DEC-XXXX` identifiers and reference a research snapshot plus constitution checksum. No formal collaborative decision has yet been recorded.\n')

# Project state and completion ledger
w('PROJECT_STATE.md',f'''# Project State\n\n- Repository: Venture Atlas Collaborative\n- Current phase: collaborative-system foundation complete; source-corpus recovery remains incomplete\n- Last completed action: added constitution integrity, source inventory, collaboration schemas, research-run history, and Git-native workflows\n- Canonical ideas: 60\n- Raw extraction records: {len(ledger)}\n- Prompt records: {len(prompts)}\n- Historical research runs reconstructed: {len(runs)}\n- Constitution version: 0.1-partial\n- Constitution checksum: `{cs}`\n- Current shortlist: historical snapshots only; no current group shortlist\n- Active experiments: none recorded\n- Open conflicts: earliest complete Deep Research contract unavailable\n- Open privacy issues: future raw chat exports require redaction before public release\n- Next recommended action: ingest the exact earliest Deep Research contract and all remaining chat exports\n- Last successful validation: pending final package validation\n''')
items=['Source inventory','Partial exact constitution preservation','Constitution metadata/checksum','Extraction ledger update','60 canonical ideas preserved','1,501 prompt records','Research-run reconstruction','Friend profile template','Evaluation template','Pairwise vote schema','Decision schema','Git-native issue forms','Constitution CI','Website constitution page','Collaboration page','Privacy archive split','Final validation']
w('COMPLETION_LEDGER.md','# Completion Ledger\n\n'+''.join(f'- [x] {x}\n' for x in items[:-1])+f'- [ ] {items[-1]}\n\n## Blocked / incomplete source\n\n- [!] Earliest complete original Deep Research execution contract — not directly available.\n- [!] Full project-wide chat corpus — not directly available as files.\n- [!] Historical source counts and approval records — incomplete.\n')

# docs pages
nav='''<nav class="topnav"><a href="../index.html">Home</a><a href="ideas.html">Ideas</a><a href="rankings.html">Rankings</a><a href="collaboration.html">Collaboration</a><a href="decisions.html">Decisions</a><a href="research.html">Research</a><a href="constitution.html"><strong>Original Research Constitution</strong></a></nav>'''
def page(title,body): return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} · Venture Atlas Collaborative</title><link rel="stylesheet" href="../assets/css/site.css"></head><body>{nav}<main><section><h1>{title}</h1>{body}</section></main></body></html>'
w('docs/constitution.html',page('Original Research Constitution',f'''<div class="notice"><strong>Recovery status:</strong> partially recovered exact text. The full earliest contract was not available for direct inspection.</div><p>Every ranking and decision in this repository descends from the original Deep Research execution contract. Later preferences may create alternative rankings, but they do not erase the original methodology, evidence, constraints, or historical decisions.</p><p><a class="button primary" href="../research/constitution/ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md">Read preserved exact section</a> <a class="button" href="../research/constitution/CONSTITUTION_METADATA.json">Metadata</a></p><dl><dt>Version</dt><dd>0.1-partial</dd><dt>SHA-256</dt><dd><code>{cs}</code></dd></dl>'''))
w('docs/collaboration.html',page('Collaboration Room','''<p>The static site keeps local drafts in your browser; shared work happens through GitHub Issues and pull requests. Exported vote packets can be validated and committed without exposing browser tokens.</p><h2>Modes</h2><ol><li><strong>Local/private:</strong> drafts, favorites, comparisons, and vote packets.</li><li><strong>Git-native:</strong> issue forms, PRs, evidence submissions, objections, and decisions.</li><li><strong>Optional backend:</strong> disabled by default.</li></ol><p><a class="button" href="../collaboration/README.md">Collaboration guide</a></p>'''))
w('docs/decisions.html',page('Decision History','''<p>No formal collaborative decision has been recorded yet. Historical research winners remain visible as immutable research-run snapshots and are not equivalent to a current group decision.</p><p><a class="button" href="../data/research-runs.json">Research runs</a> <a class="button" href="../data/decisions.json">Decision data</a></p>'''))
w('docs/research.html',page('Research Archive','''<p>Browse the constitution, source inventory, extraction ledger, historical runs, assumptions, rankings, and completeness audit.</p><ul><li><a href="constitution.html">Original Research Constitution</a></li><li><a href="../data/source-inventory.json">Source inventory</a></li><li><a href="../data/extraction-ledger.json">Extraction ledger</a></li><li><a href="../data/research-runs.json">Research runs</a></li><li><a href="../research/completeness-audit.md">Completeness audit</a></li></ul>'''))

# Add top nav + constitutional statement to index
idx=(root/'index.html').read_text()
idx=idx.replace('<title>Venture Atlas OS</title>','<title>Venture Atlas Collaborative</title>')
idx=idx.replace('<body data-page="home" data-root=".">','<body data-page="home" data-root="."><nav class="topnav"><a href="./index.html">Home</a><a href="./docs/ideas.html">Ideas</a><a href="./docs/rankings.html">Rankings</a><a href="./docs/collaboration.html">Collaboration</a><a href="./docs/decisions.html">Decisions</a><a href="./docs/research.html">Research</a><a href="./docs/constitution.html"><strong>Original Research Constitution</strong></a></nav>')
idx=idx.replace('Venture Atlas OS','Venture Atlas Collaborative')
idx=idx.replace('<div class="notice">Scores are decision-support tools.', '<div class="notice"><strong>Constitutional foundation:</strong> Every ranking and decision in this repository descends from the original Deep Research execution contract. Later preferences may create alternative rankings, but they do not erase the original methodology, evidence, constraints, or historical decisions.</div><div class="notice">Scores are decision-support tools.')
w('index.html',idx)
# CSS
with open(root/'assets/css/site.css','a') as f:f.write('\n.topnav{position:sticky;top:0;z-index:20;display:flex;gap:1rem;flex-wrap:wrap;padding:.8rem max(1rem,4vw);background:var(--surface,#fff);border-bottom:1px solid var(--border,#ddd)}.topnav a{text-decoration:none}.topnav strong{font-weight:800}\n')

# README update
readme=(root/'README.md').read_text()
readme=readme.replace('Venture Atlas OS','Venture Atlas Collaborative')
readme='# Venture Atlas Collaborative\n\n> A provenance-first collaborative venture research repository built on the prior Venture Atlas dataset.\n\n'+readme.split('\n',1)[1]
readme+='''\n\n## Constitution and collaboration\n\nThe earliest complete Deep Research contract was not available in this session. The exact surviving constitutional section is preserved as `CONST-0001 v0.1-partial`, with checksum verification and an explicit provenance warning. Collaboration defaults to GitHub Issues and pull requests; local browser drafts do not synchronize automatically.\n\n## Source limitations\n\nThe repository is complete for its generated 60-idea dataset, but not transcript-complete for the entire ChatGPT Project. See `research/completeness-audit.md` and `PROJECT_STATE.md`.\n'''
w('README.md',readme)

# scripts
w('scripts/verify_constitution.py',f'''from pathlib import Path\nimport hashlib,json,sys\nr=Path(__file__).resolve().parents[1]\nm=json.loads((r/'research/constitution/CONSTITUTION_METADATA.json').read_text())\np=r/'research/constitution/ORIGINAL_DEEP_RESEARCH_EXECUTION_CONTRACT.md'\nh=hashlib.sha256(p.read_bytes()).hexdigest()\nassert h==m['sha256'], f"Constitution checksum changed: {{h}} != {{m['sha256']}}"\nfor fn in ['data/ranking-runs.json','data/decisions.json']:\n d=json.loads((r/fn).read_text())\n for x in d:\n  assert x.get('constitutionVersion') and x.get('constitutionChecksum'), f"Missing constitution reference in {{fn}}"\nprint('Constitution integrity OK',h)\n''')
w('scripts/calculate_consensus.py','''import json,statistics\nfrom pathlib import Path\nr=Path(__file__).resolve().parents[1]\np=r/'data/evaluations/index.json'\nd=json.loads(p.read_text())\nby={}\nfor e in d: by.setdefault(e['ideaId'],[]).append(float(e['score']))\nout={}\nfor k,v in by.items(): out[k]={'mean':sum(v)/len(v),'median':statistics.median(v),'min':min(v),'max':max(v),'stdev':statistics.pstdev(v),'evaluators':len(v),'polarization':statistics.pstdev(v)}\nprint(json.dumps(out,indent=2))\n''')
w('scripts/calculate_pairwise.py','''import json\nfrom pathlib import Path\nr=Path(__file__).resolve().parents[1]\nvotes=json.loads((r/'data/pairwise-votes.json').read_text())\nscore={}\nfor v in votes:\n for i in [v.get('ideaA'),v.get('ideaB')]: score.setdefault(i,{'wins':0,'losses':0,'ties':0})\n if v.get('choice')=='A': score[v['ideaA']]['wins']+=1; score[v['ideaB']]['losses']+=1\n elif v.get('choice')=='B': score[v['ideaB']]['wins']+=1; score[v['ideaA']]['losses']+=1\n elif v.get('choice')=='tie': score[v['ideaA']]['ties']+=1; score[v['ideaB']]['ties']+=1\nprint(json.dumps(score,indent=2))\n''')
w('scripts/check_privacy.py','''from pathlib import Path\nimport re,sys\nr=Path(__file__).resolve().parents[1]\npatterns=[re.compile(r'(?i)(api[_ -]?key|password|secret|access[_ -]?token)\\s*[:=]\\s*[A-Za-z0-9_\\-]{12,}'),re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')]\nhits=[]\nfor p in r.rglob('*'):\n if p.is_file() and '.git' not in p.parts and p.suffix.lower() in {'.md','.json','.js','.py','.html','.yml','.yaml','.txt'}:\n  t=p.read_text(errors='ignore')\n  if any(x.search(t) for x in patterns): hits.append(str(p.relative_to(r)))\nprint('Privacy/secret heuristic hits:',len(hits))\nfor h in hits: print(h)\nsys.exit(1 if hits else 0)\n''')
w('scripts/import_vote_packet.py','''import json,sys\nfrom pathlib import Path\np=Path(sys.argv[1]); d=json.loads(p.read_text())\nassert d.get('personId') and d.get('constitutionVersion')\nprint('Valid vote packet for',d['personId'])\n''')
w('scripts/generate_meeting_packet.py','''from pathlib import Path\nimport json,datetime\nr=Path(__file__).resolve().parents[1]\nideas=json.loads((r/'data/ideas.json').read_text())\nout=['# Venture Atlas Meeting Packet','',f'Generated: {datetime.date.today().isoformat()}','', '## Top research scores']\nfor x in sorted(ideas,key=lambda i:i.get('compositeScores',{}).get('overallOpportunity',0),reverse=True)[:10]: out.append(f"- {x['id']} — {x['name']}")\n(r/'meeting-packets/latest.md').parent.mkdir(exist_ok=True); (r/'meeting-packets/latest.md').write_text('\\n'.join(out)+'\\n')\nprint('meeting-packets/latest.md')\n''')

# issue forms
forms={
'propose-idea.yml':('Propose an idea','New idea with provenance'), 'score-idea.yml':('Score an idea','Submit a personal evaluation'),
'submit-evidence.yml':('Submit evidence','Add supporting or contradictory evidence'),'challenge-claim.yml':('Challenge a claim','Dispute a factual or analytical claim'),
'report-duplicate.yml':('Report a duplicate','Link overlapping idea records'),'request-rerank.yml':('Request a rerank','Propose a new immutable ranking run'),
'object-to-decision.yml':('Object to a decision','Record a dissent or reopening trigger'),'constitutional-amendment.yml':('Constitutional amendment','Propose a versioned amendment')}
for fn,(name,desc) in forms.items():
 y=f'''name: {name}\ndescription: {desc}\ntitle: "[{name}] "\nlabels: ["collaboration"]\nbody:\n  - type: textarea\n    id: details\n    attributes:\n      label: Details\n      description: Include stable IDs, sources, evidence, assumptions, and requested outcome.\n    validations:\n      required: true\n  - type: checkboxes\n    id: provenance\n    attributes:\n      label: Provenance confirmation\n      options:\n        - label: I distinguished evidence, assumptions, and personal opinion.\n          required: true\n'''
 w('.github/ISSUE_TEMPLATE/'+fn,y)

w('.github/workflows/constitution-integrity.yml','''name: Constitution integrity\non: [push, pull_request]\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: {python-version: '3.12'}\n      - run: python scripts/verify_constitution.py\n''')

# Update package scripts
pkg=json.load(open(root/'package.json'))
pkg['name']='venture-atlas-collaborative';pkg['version']='3.0.0'
pkg.setdefault('scripts',{}).update({'verify:constitution':'python scripts/verify_constitution.py','check:privacy':'python scripts/check_privacy.py','meeting':'python scripts/generate_meeting_packet.py'})
j('package.json',pkg)

# completeness audit append
p=root/'research/completeness-audit.md'; old=p.read_text() if p.exists() else '# Completeness Audit\n'
old+='''\n\n## Collaborative v3 corpus update — 2026-08-06\n\n- Added SRC-0013, the exact uploaded Master Project Prompt.\n- Preserved its surviving constitutional section exactly and labeled it partially recovered.\n- Did not claim access to all Project chats or the earliest complete Deep Research contract.\n- Added collaboration, voting, decision, privacy, research-run, and constitution integrity foundations.\n- Remaining critical gap: ingest the exact earliest contract and full chat exports when they become directly accessible.\n'''
w('research/completeness-audit.md',old)

# .gitignore
with open(root/'.gitignore','a') as f:f.write('\narchive/private-not-committed/**\n!archive/private-not-committed/.gitkeep\n.env\n.env.*\n')

# manifest generated after all changes
entries=[]
for p in sorted(root.rglob('*')):
 if p.is_file(): entries.append({'path':str(p.relative_to(root)).replace('\\','/'),'size':p.stat().st_size,'sha256':sha(p)})
j('data/file-manifest.json',{'repositoryVersion':'3.0.0','generatedAt':now,'fileCount':len(entries),'files':entries})
