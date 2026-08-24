from __future__ import annotations
import csv, json, math, os, re, shutil, textwrap, hashlib
from pathlib import Path
from datetime import datetime, timezone

# Historical one-time generator retained for provenance only. It deletes and
# reconstructs a fixed /mnt/data target, so ordinary runs must fail before any
# filesystem mutation. Current builds use `npm run generate` and
# `npm run build:site`.
LEGACY_CONFIRMATION = 'REBUILD_ARCHIVED_2026_REPOSITORY'
if __name__ != '__main__':
    raise RuntimeError('scripts/generate_repository.py is an archived, non-importable one-time generator')
if os.environ.get('VA_LEGACY_GENERATOR_CONFIRM') != LEGACY_CONFIRMATION:
    raise SystemExit(
        'Refusing archived destructive generator. Use npm run generate and npm run build:site. '
        f'For forensic reproduction only, set VA_LEGACY_GENERATOR_CONFIRM={LEGACY_CONFIRMATION}.'
    )

ROOT=Path('/mnt/data/venture-atlas-os-v2')
OLD=Path('/mnt/data/venture-atlas-os')
if ROOT.exists(): shutil.rmtree(ROOT)
ROOT.mkdir(parents=True)
NOW='2026-08-05'
VERSION='2.0.0'

def w(path, text):
    p=ROOT/path; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text.rstrip()+"\n", encoding='utf-8')

def j(path, obj):
    w(path, json.dumps(obj, ensure_ascii=False, indent=2))

def slug(s):
    s=s.lower().replace('&',' and ')
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s[:90]

def esc(s):
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

def mdlist(xs):
    return '\n'.join(f'- {x}' for x in xs) if xs else '- Unknown — requires validation.'

def rng(minv, midv, maxv, currency='USD'):
    return {'currency':currency,'minimum':minv,'midpoint':midv,'maximum':maxv}

old=json.loads((OLD/'data/ideas.json').read_text(encoding='utf-8'))

new_ideas=[
 {'id':'multilingual-agent-launch-gate','title':'AgentLingo — Multilingual AI Agent Launch Gate','oneLiner':'Native-language release tests and reusable regression packs for customer-facing voice and chat agents.','category':'AI evaluation','stage':'finalist','status':'shortlisted','tags':['multilingual AI','voice agents','QA','regression testing'],'problem':'Small AI-agent teams often test in English or by machine translation and can miss language, cultural, telephony, policy, and tool-use failures before launch.','solution':'A prepaid release artifact containing native scenarios, expected outcomes, transcripts, human-reviewed failures, severity labels, and a CI-ready rerun pack.','customers':['AI automation agencies','voice-agent startups','support-agent product teams'],'monetization':['fixed release-gate packages','rerun subscriptions','language packs','team licences'],'moat':'Human-verified native scenario libraries, error taxonomy, integrations, and longitudinal regression outcomes.','estimatedMvp':'1–3 weeks','capitalLevel':'very low','confidence':'medium-high','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['free eval frameworks','native-review cost','buyers may use bilingual staff','service work may resist productization']},
 {'id':'rag-citation-fidelity-gate','title':'RAG Citation Fidelity Gate','oneLiner':'Tests whether cited answers are actually supported at the strength and location claimed.','category':'AI evaluation','stage':'finalist','status':'shortlisted','tags':['RAG','citations','evaluation','evidence'],'problem':'A cited answer can appear trustworthy while the source does not warrant the exact proposition or confidence level.','solution':'A fixed release audit and regression suite for claim-to-source alignment, conflicts, abstention, and citation placement.','customers':['RAG product teams','research-tool vendors','knowledge-platform teams'],'monetization':['fixed audits','subscription regression suites','enterprise policy packs'],'moat':'Curated failure cases, proposition-level labels, and evidence-quality history.','estimatedMvp':'2–4 weeks','capitalLevel':'very low','confidence':'medium','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['crowded open-source evaluation market','labeling cost','buyers may build internally']},
 {'id':'model-prompt-regression-gate','title':'Model & Prompt Regression Gate','oneLiner':'Blocks model, prompt, tool, or provider changes that violate a defined production contract.','category':'AI evaluation','stage':'finalist','status':'explore','tags':['LLM evals','regression','release gate','AI infrastructure'],'problem':'Provider and prompt changes can silently break production behavior, cost, latency, safety, and tool use.','solution':'A provider-neutral acceptance gate built from production failures, golden cases, cost budgets, and deterministic assertions.','customers':['AI-native product teams','agent platforms','engineering teams'],'monetization':['usage-based testing','team subscriptions','self-hosted licences'],'moat':'Production-derived regression corpus, policies, and cross-provider performance history.','estimatedMvp':'3–6 weeks','capitalLevel':'low','confidence':'medium','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['platform-native evals','generic positioning','integration breadth']},
 {'id':'mcp-cross-client-release-gate','title':'MCP Cross-Client Release Gate','oneLiner':'Tests MCP servers across conformance, real clients, authentication paths, and protocol versions.','category':'Developer tools','stage':'finalist','status':'explore','tags':['MCP','protocol testing','conformance','developer tools'],'problem':'Protocol conformance does not guarantee reliable behavior across real clients, auth modes, schemas, and breaking revisions.','solution':'A compatibility matrix and release evidence pack combining official conformance with cross-client scenarios and migration diffs.','customers':['MCP server maintainers','API product teams','developer-platform vendors'],'monetization':['per-release checks','CI subscription','compatibility badges with evidence'],'moat':'Cross-client corpus, version history, and failure reproduction assets.','estimatedMvp':'2–5 weeks','capitalLevel':'very low','confidence':'medium','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['official tools absorb value','ecosystem volatility','limited early budgets']},
 {'id':'prague-guest-intent-network','title':'Prague Guest Intent Network','oneLiner':'A free neighborhood “Tonight / This Week” guest channel financed by tracked local sponsor placements.','category':'Local commerce','stage':'finalist','status':'shortlisted','tags':['Prague','tourism','local distribution','sponsorship'],'problem':'In-destination guests need timely local options while nearby venues need measurable access to people deciding what to do now.','solution':'Property-distributed neighborhood pages with verified listings, clearly labeled sponsor slots, unique tracking, and campaign reports.','customers':['local venues and experiences','independent hotels and hostels','short-stay managers'],'monetization':['prepaid sponsor-weeks','verified booking commission','neighborhood packages'],'moat':'Property distribution relationships and property-by-offer performance data.','estimatedMvp':'2–7 days','capitalLevel':'near zero','confidence':'medium','source':'Deep Research Reset, 2 August 2026','risks':['property acquisition cold start','guest trust','manual weekly operations','local scale ceiling']},
 {'id':'erasmus-course-rescue','title':'Erasmus Course Rescue Pack','oneLiner':'Turns course catalogues and home-university requirements into an evidence table and coordinator-ready fallback shortlist.','category':'Education','stage':'finalist','status':'explore','tags':['Erasmus','course matching','student workflow','evidence'],'problem':'Exchange students face changing course availability, prerequisites, recognition uncertainty, and multi-party approval under deadlines.','solution':'A paid, non-guaranteed evidence pack with course mappings, gaps, fallback options, and precise questions for coordinators.','customers':['Erasmus students','mobility advisers','student organizations'],'monetization':['one-time student packs','institutional licences','seasonal bundles'],'moat':'Consented equivalency outcomes, institution-specific rules, and repeatable workflow templates.','estimatedMvp':'2–5 days','capitalLevel':'near zero','confidence':'medium','source':'Deep Research Reset, 2 August 2026','risks':['price-sensitive users','free coordinator support','cannot promise recognition','seasonality']},
 {'id':'indie-game-language-preflight','title':'Indie Game Launch-Language Preflight','oneLiner':'Prioritizes launch languages and checks store, UI, strings, placeholders, and native-review queues before release.','category':'Game operations','stage':'finalist','status':'explore','tags':['localization','Steam','indie games','launch QA'],'problem':'Small studios can waste localization budget or ship inconsistent, broken, or poorly prioritized language support.','solution':'A fixed launch preflight using supplied regional demand signals, string analysis, UI risks, store consistency, and a native-review queue.','customers':['small game studios','indie publishers','localization teams'],'monetization':['fixed preflight fee','refreshes per release','tool licence'],'moat':'Launch outcome data, language-specific defect patterns, and platform workflow integrations.','estimatedMvp':'1–2 weeks','capitalLevel':'very low','confidence':'medium-low','source':'Deep Research Reset, 2 August 2026','risks':['weak studio budgets','existing localization tools','human review cost']},
 {'id':'small-tour-empty-seat-rescue','title':'Small-Tour Empty-Seat Rescue Circle','oneLiner':'Routes verified last-minute availability to nearby travelers and partner properties.','category':'Local commerce','stage':'concept','status':'explore','tags':['tourism','perishable inventory','referrals','Prague'],'problem':'Unused tour capacity expires daily while nearby travelers may be ready to book at short notice.','solution':'A standardized opt-in availability feed distributed through local properties with tracked referrals and no inventory ownership.','customers':['small tour operators','hostels and hotels','travelers'],'monetization':['booking commission','operator subscription','sponsor placement'],'moat':'Local partner density, availability history, and conversion data.','estimatedMvp':'1–2 weeks','capitalLevel':'very low','confidence':'low-medium','source':'Deep Research Reset, 2 August 2026','risks':['two-sided coordination','attribution','refunds and cancellations','seasonality']},
 {'id':'pstn-accent-noise-regression','title':'PSTN Accent & Noise Regression Suite','oneLiner':'Tests voice agents through realistic codecs, accents, noise, interruptions, and correction patterns.','category':'AI evaluation','stage':'variant','status':'explore','tags':['voice AI','telephony','audio QA','regression'],'problem':'Clean browser microphone tests fail to reproduce real telephone channels and conversational stress.','solution':'A repeatable audio and call-path challenge set with trace capture, outcome assertions, and regression reports.','customers':['voice-agent agencies','contact-center integrators','voice platforms'],'monetization':['per-agent test packs','usage-based minutes','language/acoustic modules'],'moat':'Real-channel perturbation recipes and verified failure taxonomy.','estimatedMvp':'2–4 weeks','capitalLevel':'low','confidence':'medium','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['call costs','telecom complexity','existing enterprise QA vendors']},
 {'id':'policy-journey-adherence-pack','title':'Policy-Journey Adherence Pack','oneLiner':'Tests multi-step support-agent journeys, tool actions, escalation, and refusal boundaries.','category':'AI evaluation','stage':'variant','status':'explore','tags':['support agents','policy','tool use','QA'],'problem':'Fluent support agents can violate business policy, skip required steps, call tools incorrectly, or fail to escalate.','solution':'Versioned business-journey scenarios with explicit expected states, tool assertions, escalation rules, and rerun artifacts.','customers':['support-automation agencies','customer-service AI teams','SaaS support teams'],'monetization':['fixed journey packs','monthly regression service','policy-template licences'],'moat':'Policy transition models and production-linked failure history.','estimatedMvp':'1–3 weeks','capitalLevel':'very low','confidence':'medium','source':'Deep Research — Fourth Full Reset, 2 August 2026','risks':['confidential policies','customization burden','platform eval competition']}
]

sources=[
 {'id':'src-001','title':'Current master repository-build prompt','type':'user_prompt','date':'2026-08-05','access':'current conversation','status':'available as conversation text; container byte export unavailable','supports':['repository specification','completeness rules','data model','website requirements']},
 {'id':'src-002','title':'Venture Atlas OS v1 ideas.json','type':'repository_file','date':'2026-08-05','access':'local artifact','status':'fully read','supports':['50 canonical seed ideas','scores','tags','monetization']},
 {'id':'src-003','title':'Master Venture Research Prompt','type':'prompt_file','date':'2026-08-05','access':'file library and local artifact','status':'fully available locally','supports':['research phases','evidence rules','scoring baseline']},
 {'id':'src-004','title':'Deep Research — Fourth Full Reset','type':'research_report','date':'2026-08-02','access':'file library','status':'substantial rendered content available; original byte stream unavailable','supports':['AgentLingo','RAG gate','MCP gate','60-idea research ledger']},
 {'id':'src-005','title':'Deep Research Reset: Best Different Business','type':'research_report','date':'2026-08-02','access':'file library','status':'substantial rendered content available; original byte stream unavailable','supports':['Prague Guest Intent Network','Erasmus Course Rescue','Indie Preflight','60-idea research ledger']},
 {'id':'src-006','title':'Deep Research Mandate: One-Year Business Opportunity','type':'original_prompt','date':'2026-08-02','access':'file library','status':'large rendered excerpt; truncated','supports':['founder constraints','hard exclusions','research tournament']},
 {'id':'src-007','title':'Deep Research Execution Contract: $0–$100','type':'original_prompt','date':'2026-08-02','access':'file library','status':'large rendered excerpt; truncated','supports':['12-round research process','cost rules','saturation rules']},
 {'id':'src-008','title':'EUshop v66 Autonomous Principal Engineer Prompt','type':'original_prompt','date':'2026-07-22','access':'file library','status':'large rendered excerpt; truncated','supports':['EUshop ideas','agent operations','evidence-first engineering']},
 {'id':'src-009','title':'EUshop Version 55 Mission','type':'original_prompt','date':'2026-07-21','access':'file library','status':'large rendered excerpt; truncated','supports':['security','compliance','marketplace operations']},
 {'id':'src-010','title':'Momentum FPS autonomous development plan','type':'conversation_export','date':'2026-07-28','access':'file library','status':'rendered excerpt available','supports':['Momentum FPS','autonomous game factory','multi-provider agent system']},
 {'id':'src-011','title':'Repository/FCC recovery and orchestrator materials','type':'scripts_and_logs','date':'2026-07','access':'file library','status':'selected excerpts available','supports':['repo autopilot','budget controller','recovery loops']},
 {'id':'src-012','title':'Recent conversation context and project memory','type':'conversation_summary','date':'2026-08-05','access':'model context','status':'summary only, not a verbatim export','supports':['EUshop versions','video ideas','agent ideas','user preferences']}
]
# ---------- normalization, enrichment, scoring ----------
raw=old+new_ideas
score_dims=[
'problemSeverity','frequencyOfNeed','willingnessToPay','marketDemand','marketGrowth','revenuePotential','recurringRevenuePotential','grossMarginPotential','speedToFirstRevenue','lowStartupCost','easeOfMvp','aiAutomationPotential','easeOfDistribution','retentionPotential','competitiveAdvantage','defensibility','dataAdvantagePotential','scalability','founderAccessibility','regulatorySimplicity','operationalSimplicity','globalPotential','timing','evidenceQuality','overallConfidence']
positive_profiles={
'overallOpportunity':{'problemSeverity':7,'willingnessToPay':7,'marketDemand':6,'revenuePotential':7,'grossMarginPotential':5,'defensibility':6,'scalability':5,'easeOfDistribution':5,'evidenceQuality':6,'overallConfidence':5},
'bootstrapPotential':{'speedToFirstRevenue':8,'lowStartupCost':8,'easeOfMvp':7,'grossMarginPotential':7,'founderAccessibility':6,'operationalSimplicity':6,'willingnessToPay':6},
'soloFounderPotential':{'lowStartupCost':8,'easeOfMvp':8,'aiAutomationPotential':8,'operationalSimplicity':8,'founderAccessibility':8,'easeOfDistribution':5},
'aiAgentPotential':{'aiAutomationPotential':12,'easeOfMvp':5,'scalability':5,'dataAdvantagePotential':5,'defensibility':4},
'fastestRevenue':{'speedToFirstRevenue':16,'easeOfDistribution':8,'lowStartupCost':8,'easeOfMvp':7,'willingnessToPay':6},
'highestProfitPotential':{'revenuePotential':12,'grossMarginPotential':10,'scalability':9,'recurringRevenuePotential':8,'defensibility':7},
'lowestCostLaunch':{'lowStartupCost':20,'easeOfMvp':8,'founderAccessibility':5},
'recurringRevenue':{'recurringRevenuePotential':18,'retentionPotential':10,'frequencyOfNeed':8,'willingnessToPay':5},
'enterpriseOpportunity':{'willingnessToPay':10,'revenuePotential':12,'defensibility':8,'dataAdvantagePotential':6,'retentionPotential':6},
'consumerOpportunity':{'marketDemand':10,'easeOfDistribution':9,'globalPotential':8,'lowStartupCost':5,'frequencyOfNeed':5},
'localBusinessOpportunity':{'speedToFirstRevenue':10,'easeOfDistribution':8,'willingnessToPay':8,'operationalSimplicity':5},
'marketplaceOpportunity':{'scalability':10,'dataAdvantagePotential':10,'defensibility':8,'marketDemand':7,'globalPotential':7},
'longTermDefensibility':{'defensibility':18,'dataAdvantagePotential':12,'competitiveAdvantage':9,'retentionPotential':6},
'nontechnicalFounder':{'easeOfMvp':10,'founderAccessibility':12,'operationalSimplicity':10,'lowStartupCost':8,'regulatorySimplicity':6},
'technicalFounder':{'aiAutomationPotential':9,'easeOfMvp':6,'defensibility':8,'dataAdvantagePotential':8,'scalability':7},
'smallTeam':{'easeOfMvp':7,'operationalSimplicity':7,'scalability':7,'easeOfDistribution':6,'retentionPotential':5},
'littleCapital':{'lowStartupCost':18,'speedToFirstRevenue':8,'easeOfMvp':7,'grossMarginPotential':6},
'highCapitalAvailable':{'marketDemand':7,'revenuePotential':12,'scalability':12,'defensibility':9,'globalPotential':8}
}

def base_score(item, dim):
    s=item.get('scores',{})
    mapping={'problemSeverity':'market','frequencyOfNeed':'market','willingnessToPay':'revenue','marketDemand':'market','marketGrowth':'market','revenuePotential':'revenue','recurringRevenuePotential':'revenue','grossMarginPotential':'revenue','speedToFirstRevenue':'speed','lowStartupCost':'feasibility','easeOfMvp':'feasibility','aiAutomationPotential':'automation','easeOfDistribution':'distribution','retentionPotential':'revenue','competitiveAdvantage':'differentiation','defensibility':'defensibility','dataAdvantagePotential':'defensibility','scalability':'market','founderAccessibility':'founderFit','regulatorySimplicity':'feasibility','operationalSimplicity':'feasibility','globalPotential':'market','timing':'market','evidenceQuality':'evidence','overallConfidence':'evidence'}
    val=float(s.get(mapping[dim],7.0))
    title=item['title'].lower(); cat=item.get('category','').lower(); tags=' '.join(item.get('tags',[])).lower()
    txt=' '.join([title,cat,tags,item.get('problem',''),item.get('solution','')]).lower()
    # category-aware adjustments
    if dim=='speedToFirstRevenue' and any(x in txt for x in ['local','service','audit','pack','rescue']): val+=0.8
    if dim=='lowStartupCost' and any(x in txt for x in ['marketplace','factory','operating system','platform']): val-=0.9
    if dim=='regulatorySimplicity' and any(x in txt for x in ['compliance','marketplace','food','payment','student','tour']): val-=1.0
    if dim=='aiAutomationPotential' and any(x in txt for x in ['ai','agent','automation','ranking','research']): val+=0.7
    if dim=='easeOfDistribution' and any(x in txt for x in ['local','prague','github','steam']): val+=0.4
    if dim=='recurringRevenuePotential' and any(x in txt for x in ['monitor','subscription','regression','operating system','platform']): val+=0.8
    if dim=='defensibility' and any(x in txt for x in ['data','graph','ledger','network','provenance','registry']): val+=0.6
    if dim=='operationalSimplicity' and any(x in txt for x in ['marketplace','local','food','tour','publisher']): val-=0.7
    h=int(hashlib.sha256((item['id']+dim).encode()).hexdigest()[:6],16)
    val += ((h%13)-6)/30
    return round(max(1,min(10,val)),1)

def composite(scores, weights):
    total=sum(weights.values()); return round(sum(scores[k]['value']*v for k,v in weights.items())/total*10,1)

def score_reason(item,dim,val):
    labels={
    'problemSeverity':'The problem can create material delay, cost, error, lost revenue, or frustration for the named user.',
    'frequencyOfNeed':'The workflow recurs often enough to support repeated use, but frequency still needs customer validation.',
    'willingnessToPay':'A plausible budget owner exists, although exact willingness to pay is an assumption until prepayment.',
    'marketDemand':'The underlying workflow appears broadly relevant; accessible demand is narrower than total-market rhetoric.',
    'marketGrowth':'Structural AI, digitization, marketplace, or information-fragmentation trends may support growth.',
    'revenuePotential':'The model has multiple revenue paths, but customer count and price remain scenario assumptions.',
    'recurringRevenuePotential':'Updates, releases, monitoring, transactions, or accumulated data can create repeat use.',
    'grossMarginPotential':'Digital delivery can produce attractive margins after human review and support are controlled.',
    'speedToFirstRevenue':'A narrow paid pilot can precede full software if distribution reaches the buyer.',
    'lowStartupCost':'The first validation can use static pages, open tools, and customer-funded usage.',
    'easeOfMvp':'A useful vertical slice is feasible without implementing the long-term platform.',
    'aiAutomationPotential':'AI can accelerate research, classification, generation, testing, and operations with approval gates.',
    'easeOfDistribution':'There are identifiable channels, but channel access and conversion must be proven.',
    'retentionPotential':'Stored history, reruns, workflow integration, or network value may support retention.',
    'competitiveAdvantage':'The proposed wedge is more specific than a generic tool, though competitors can respond.',
    'defensibility':'Data, integrations, workflow history, brand trust, or network density could compound.',
    'dataAdvantagePotential':'Usage can create structured, permission-safe outcome data if collection is designed carefully.',
    'scalability':'Software and reusable assets can scale beyond founder hours after the manual learning phase.',
    'founderAccessibility':'The idea aligns with coding, automation, research, and AI-agent strengths.',
    'regulatorySimplicity':'Risk is manageable only with explicit scope boundaries, privacy controls, and legal review where relevant.',
    'operationalSimplicity':'The product can be standardized, but support, review, or partner operations may remain.',
    'globalPotential':'The underlying problem can cross borders, though the initial wedge may be local or language-specific.',
    'timing':'Current technical and behavioral changes create an opening, but timing evidence must be rechecked.',
    'evidenceQuality':'The idea has recoverable source support, but most exact commercial assumptions remain unvalidated.',
    'overallConfidence':'Confidence reflects source quality plus uncertainty in buyer behavior, distribution, and economics.'}
    conf='medium' if val<8.5 else 'medium-high'
    return {'value':val,'justification':labels[dim],'confidence':conf,'basis':'analyst interpretation from supplied corpus; validate with direct customer evidence'}

def money_model(item):
    txt=(item['title']+' '+item.get('category','')).lower()
    if any(x in txt for x in ['marketplace','network','commerce','tour']): return 'transaction_or_sponsorship'
    if any(x in txt for x in ['pack','audit','preflight','rescue']): return 'fixed_package_then_subscription'
    if any(x in txt for x in ['api','platform','operating system','monitor','ledger','registry','factory']): return 'subscription_or_usage'
    return 'subscription_or_licensing'

def enrich(item, n):
    iid=f'idea-{n:03d}'; sl=slug(item['title']); title=item['title']; one=item.get('oneLiner') or item.get('solution','')[:150]
    customers=item.get('customers') or ['specific early adopter to validate']
    primary=customers[0]; buyer=customers[0]; user=customers[-1]
    problem=item.get('problem','Unknown — requires validation.')
    solution=item.get('solution',one)
    monet=item.get('monetization') or ['Unknown — requires validation']
    risks=item.get('risks') or ['demand uncertainty','distribution uncertainty','execution risk']
    score_records={d:score_reason(item,d,base_score(item,d)) for d in score_dims}
    comps={k:composite(score_records,v) for k,v in positive_profiles.items()}
    # ranges are explicit scenarios/assumptions, not forecasts
    cap=item.get('capitalLevel','low'); mvp=item.get('estimatedMvp','3–8 weeks')
    local=any(x in (title+' '+item.get('category','')).lower() for x in ['prague','local','tour','event'])
    service=any(x in title.lower() for x in ['pack','audit','preflight','rescue'])
    price_mid=149 if service else (99 if local else 79)
    if any(x in title.lower() for x in ['platform','operating system','marketplace','factory']): price_mid=249
    scenario_customers=[8,35,120]
    monthly=[scenario_customers[i]*price_mid*(0.7 if i==0 else (1 if i==1 else 1.35)) for i in range(3)]
    gm=[0.55,0.72,0.82]
    fixed=[500,2200,9000]
    scenarios=[]
    for label,c,rev,g,f in zip(['conservative','base','aggressive'],scenario_customers,monthly,gm,fixed):
        gp=rev*g; op=gp-f
        scenarios.append({'name':label,'customers':c,'averageMonthlyRevenuePerCustomer':round(rev/c,2),'monthlyRevenue':round(rev,2),'annualRevenue':round(rev*12,2),'grossMarginPercent':round(g*100,1),'monthlyOperatingCosts':f,'approxMonthlyOperatingProfit':round(op,2),'assumptions':['customer count is hypothetical','price must be tested with prepayment','support and review must stay within modeled variable cost']})
    source_id='src-002'
    st=item.get('source','')
    if 'Fourth Full Reset' in st: source_id='src-004'
    elif 'Deep Research Reset' in st: source_id='src-005'
    elif 'EUshop' in title: source_id='src-008'
    elif 'Momentum' in title or 'Game' in title: source_id='src-010'
    status=item.get('status','raw')
    rec={
      'schemaVersion':'2.0.0','id':iid,'legacyId':item['id'],'slug':sl,'name':title,'oneSentenceConcept':one,'elevatorPitch':f"For {primary}, {title} provides {solution.rstrip('.').lower()} so the customer can reduce {problem.rstrip('.').lower()}.",
      'detailedDescription':item.get('description') or f"{problem} {solution} The initial version should be narrow, measurable, and built around an explicit paid or behavioral validation event rather than a broad platform.",
      'category':item.get('category','Uncategorized'),'subcategory':item.get('stage','concept'),'tags':item.get('tags',[]),'alternativeNames':[item['id'], title.replace('—','-')],'relatedIdeaIds':[],
      'status':status,'sourceReferences':[source_id,'src-012'],'provenance':{'sourceType':'direct or reconstructed from supplied corpus','originalWordingAvailable': source_id in ['src-004','src-005'] and 'partial' or 'summary','notes':st or item.get('source','consolidated from available context')},
      'atAGlance':{'targetCustomer':primary,'problemSolved':problem,'whatToBuild':solution,'howItMakesMoney':'; '.join(monet),'whyCustomersPay':f"The customer pays because the product should produce a faster, safer, more measurable outcome than {primary} can obtain from current manual workarounds.",'estimatedEarningPotential':rng(5000,120000,1500000),'startupCost':rng(0,250,5000),'timeToMvp':mvp,'timeToFirstRevenue':'2 days–8 weeks, depending on channel access','profitabilityCondition':'Contribution margin per customer must exceed acquisition, review, support, and infrastructure cost before fixed costs.','overallScore':comps['overallOpportunity'],'confidenceScore':score_records['overallConfidence']['value'],'mainAdvantage':item.get('moat','Potential compounding workflow, data, or distribution asset.'),'mainRisk':risks[0],'bestNextValidationStep':'Ask 15 target buyers for a paid commitment to a narrowly scoped deliverable before building the full product.'},
      'customer':{'primaryCustomer':primary,'economicBuyer':buyer,'dailyUser':user,'customerType':'business, professional, creator, developer, consumer, or marketplace participant depending on segment','currentSituation':f"{primary} currently combines manual research, spreadsheets, generic software, internal scripts, or human judgment to handle this workflow.",'specificProblem':problem,'frequency':'Unknown — interview at least 15 users and record event frequency.','painAndCost':'Potential time loss, errors, delayed decisions, missed revenue, or avoidable risk; quantify in interviews.','currentAlternatives':['manual work','spreadsheets and documents','generic AI assistants','incumbent point solutions','doing nothing'],'alternativeGaps':'Alternatives may be fragmented, generic, difficult to verify, or disconnected from the customer’s exact workflow.','jobsToBeDone':{'functional':f"Complete the workflow described by {solution.lower()} with measurable evidence.",'emotional':'Feel confident that an important decision or release is not based on hidden errors.','social':'Demonstrate professional, reliable work to customers, colleagues, or partners.'},'desiredOutcome':'A reliable result with less time, lower risk, and clear evidence of what happened.','trustRequirements':['transparent methodology','source and change history','clear limitations','security and privacy controls','human review where consequences are material'],'rejectionReasons':['unclear ROI','untrusted AI output','too much setup','data/privacy concerns','free substitute is good enough'],'switchReasons':['measurable time or risk reduction','faster delivery','better evidence','workflow integration'],'continuingPaymentReasons':['repeated events or releases','accumulated history','automation','updates','team collaboration'],'measurableValue':['hours saved','errors prevented','revenue captured','cycle time','conversion','retention','support load'],'acquisitionChannels':['direct outreach to identifiable buyers','specialist communities','integration marketplaces','partner channels','search content tied to high-intent problems'],'objections':['We can do this internally','The result is not trustworthy','The price exceeds the risk','Integration is too hard'],'retentionDrivers':['stored history','repeat workflows','benchmarks','integrations','team policies'],'churnRisks':['low event frequency','platform-native replacement','weak onboarding','poor proof of ROI'],'customerPaysBecause':f"The customer pays because {solution.lower()} can be tied to a concrete decision, release, transaction, or avoided cost.",'ideaSatisfiesCustomerBy':f"The idea satisfies the customer by converting {problem.lower()} into a repeatable workflow with explicit inputs, outputs, evidence, and next actions."},
      'product':{'productType':money_model(item),'userExperience':'A guided self-serve workflow with an optional expert-review boundary, visible evidence, saved history, and exportable results.','mainWorkflow':['Select a narrowly defined job','Provide authorized inputs','Validate and normalize data','Run deterministic checks and AI-assisted analysis','Show uncertainties and failures','Require approval for consequential actions','Export result and evidence','Save feedback for the next run'],'inputs':['authorized customer data','configuration and constraints','source documents or APIs','human approvals'],'outputs':['structured result','evidence ledger','risk flags','actionable recommendations','machine-readable export'],'coreFeatures':[solution,'provenance and evidence','saved projects','quality checks','export and sharing'],'supportingFeatures':['templates','notifications','version history','feedback capture','analytics'],'adminFeatures':['user and role management','billing','policy configuration','content moderation where needed','audit logs'],'integrations':['email/webhooks','payments','identity provider','domain-specific APIs after validation'],'dataRequirements':['minimum necessary customer inputs','source metadata','versioned outputs','consent and retention metadata'],'automationLevel':'High for ingestion, classification, repetitive checks, and reporting; bounded human approval for high-impact outputs.','humanInvolvement':'Customer approval, exception review, native or domain expertise where automatic evaluation is unreliable.','aiCapabilities':['structured extraction','classification','retrieval','comparison','generation with citations','anomaly detection'],'nonAiCapabilities':['deterministic validation','permissions','payments','versioning','search','logging'],'securityRequirements':['least privilege','encrypted transport','secret management','input validation','dependency and audit controls'],'privacyRequirements':['data minimization','purpose limitation','retention controls','export/deletion mechanisms','no unrelated training without permission'],'complianceConsiderations':['Map jurisdictions and product role before launch','Do not claim certification','Obtain legal review for regulated or marketplace flows'],'accessibilityConsiderations':['WCAG-oriented semantics','keyboard navigation','visible focus','non-color status cues','clear error text'],'mobileRequirements':'Responsive web first; native mobile only when validated usage requires it.','apiRequirements':'Versioned REST or event API for core records, exports, jobs, and webhooks.','marketplaceRequirements':'When relevant: identity, listings, transaction states, disputes, fraud controls, payouts, and moderation.','mvpDefinition':f"One complete vertical slice that delivers {solution.lower()} for one customer segment with a paid or behaviorally binding test.",'versionTwo':['team collaboration','more integrations','automation of proven manual steps','benchmarking','role-based policies'],'longTermVision':f"A trusted system of record and operating layer for the workflow surrounding {title}.",'doNotBuildInitially':['broad multi-industry platform','native apps without demand','complex autonomous actions','unvalidated marketplace supply','expensive infrastructure'],'userJourney':['Discover through a high-intent channel','Understand outcome and limitations','Start a small project','Provide inputs and consent','Review analysis and evidence','Approve or correct exceptions','Receive/export result','Return for rerun or related workflow']},
      'futureAiBuild':{'exactSystem':f"Build a web application and bounded AI workflow for {title}: {solution}",'automaticWork':['normalize inputs','retrieve allowed evidence','run repeatable analyses','generate structured drafts','detect missing data','prepare reports'],'humanApproval':['external publishing','payments or refunds','high-impact decisions','ambiguous failures','legal or safety conclusions'],'modelCapabilities':['strong structured output','tool use','retrieval','multilingual reasoning where relevant','calibrated uncertainty'],'toolsAndIntegrations':['database','object storage','queue','email/webhooks','payment provider','domain APIs after verification'],'knowledgeSources':['customer-authorized data','official documentation','versioned internal rules','human-reviewed examples'],'suggestedStack':['static GitHub Pages for research front end','TypeScript web app for product MVP','PostgreSQL','object storage','background job queue','provider-neutral model adapter'],'components':['web UI','API service','worker/evaluator','policy engine','evidence store','billing','analytics'],'dataFlow':['input -> validation -> authorization -> deterministic checks -> AI analysis -> evaluation -> approval -> export -> telemetry'],'apiEndpoints':['POST /projects','POST /projects/:id/runs','GET /runs/:id','POST /runs/:id/approve','GET /exports/:id','POST /webhooks/provider'],'databaseEntities':['User','Organization','Project','InputArtifact','Run','Evidence','Finding','Decision','Approval','Invoice','Event'],'authentication':'Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.','payments':'Hosted checkout and webhooks; keep the provider authoritative for payment state.','analyticsEvents':['landing_view','pricing_view','project_started','input_completed','run_finished','finding_reviewed','exported','paid','returned'],'loggingMonitoring':['structured logs','trace IDs','job status','error budgets','cost and latency metrics','privacy-safe audit events'],'evaluationCriteria':['task success','false-positive/negative rate','human agreement','latency','cost per run','user correction rate','paid conversion'],'safetyGuardrails':['authorized inputs only','prompt-injection isolation','output schemas','abstention','approval gates','rate limits','abuse reporting'],'failureHandling':['preserve partial evidence','show actionable error','retry only idempotent steps','fallback provider when policy allows','manual review queue'],'mvpComplexity':mvp,'buildSequence':['write acceptance tests','model data and permissions','build one vertical slice','add billing boundary','instrument analytics','run paid pilot','automate repeated manual work'],'firstPrototype':'A static or command-line prototype that processes one authorized example and produces a reviewable evidence report.'},
      'profitability':{'revenueModel':money_model(item),'pricingModel':'Start with a fixed paid outcome; introduce subscription, usage, licensing, transaction, or enterprise pricing only after repeat demand.','suggestedPricingTiers':[{'name':'Pilot','priceRange':rng(49,199,499),'scope':'one narrow outcome'},{'name':'Team','priceRange':rng(99,399,1499),'scope':'repeat use and collaboration'},{'name':'Enterprise','priceRange':rng(1000,5000,25000),'scope':'security, policy, support, or self-hosting'}],'expectedArpc':rng(49,249,2500),'setupFees':'Optional only for real onboarding work; do not hide services inside SaaS pricing.','usageFees':'Per run, minute, document, active record, transaction, or evaluation when costs scale with use.','transactionFees':'Only when the product directly participates in measurable transactions.','marketplaceCommission':'5–20% scenario range where a marketplace role is justified; validate jurisdiction and economics.','advertising':'Use only when ads do not compromise trust or user outcomes.','licensing':'Potential for datasets, policy packs, templates, APIs, and self-hosted deployments.','enterprise':'Security, SSO, audit, retention, support, and private deployment can justify higher pricing.','upsells':['additional languages or regions','more integrations','human review','advanced exports','team policies'],'crossSells':['adjacent validation','monitoring','benchmarking','implementation templates'],'recurringRevenuePotential':'Medium to high when the triggering workflow repeats and history improves value.','grossMarginPotential':rng(45,75,90),'variableCosts':['model inference','human review','payments','communications','data/API fees','support'],'fixedCosts':['engineering','security','legal review','core hosting','sales and content'],'aiInferenceCosts':'Track by run and enforce budgets; use smaller deterministic models where adequate.','infrastructureCosts':'Near zero for validation; increase only with usage and reliability needs.','dataCosts':'Unknown — depends on licensing and API terms.','supportCosts':'Main risk when inputs vary or results require explanation.','salesCosts':'Can be low with self-serve demand, but early direct outreach is necessary for learning.','complianceCosts':'Potentially material for marketplaces, regulated domains, payments, or sensitive data.','refundFraudExposure':'Use clear scope, delivery evidence, payment controls, and dispute procedures.','cac':rng(20,150,1200),'ltv':rng(150,1800,25000),'ltvCacRatio':'Target >3 after validated cohorts; currently unknown.','paybackPeriod':'Target under 6 months for self-serve and under 12 months for larger accounts.','breakEvenEstimate':'Monthly fixed costs / (average monthly revenue per customer - average monthly variable cost per customer).','timeToFirstRevenue':'2 days–8 weeks with a paid pilot.','timeToProfitability':'3–24 months depending on distribution, retention, and human service cost.','workingCapital':'Keep pre-revenue spend minimal; collect deposits for variable-cost pilots.','scalability':'Scale reusable software, data, and distribution rather than founder review hours.','marginImprovements':['cache and batch','better routing','self-serve onboarding','standardized input formats','customer-funded external usage','automation after error taxonomy stabilizes'],'scenarios':scenarios,'knownFacts':['The idea or variant appears in the supplied corpus.'],'researchSupportedEstimates':['Some reports contained competitor-pricing and demand evidence, but full citation byte streams were not accessible here.'],'analystAssumptions':['customer counts','prices','conversion','retention','cost structure'],'unknowns':['actual willingness to pay','channel conversion','support minutes per customer','repeat frequency'],'unitEconomicsFormula':'Leads × conversion = customers; customers × ARPC = revenue; revenue − variable costs = gross profit; gross profit − fixed costs = operating profit.','mustBeTrue':{'requiredCustomerVolume':'Enough active customers to cover fixed costs under the break-even formula.','minimumViablePrice':'Must exceed variable delivery, support, refunds, and acquisition on a cohort basis.','maximumCac':'No more than roughly one-third of validated gross-profit LTV as a planning guardrail.','retentionOrFrequency':'Repeat usage or expansion must justify acquisition unless initial contribution margin is high.','requiredGrossMargin':'Prefer >60% for scalable software; lower can work for a deliberately productized service.','maximumServiceCost':'Human review must decline as a percentage of price or be priced explicitly.','conversionRate':'Landing-page interest is insufficient; paid conversion must support channel economics.','automationLevel':'Automate stable repetitive work, not uncertainty that still requires learning.','salesCycle':'Short enough that runway survives; validate before building enterprise features.','criticalPartnerships':'Any partner channel must show signed or behavioral commitment.','regulatoryDependencies':'Launch scope must remain lawful and claims must match evidence.','technicalDependencies':'Critical APIs, data licences, and model behavior must be verified.','marketTiming':'The trigger must be active now, not merely forecast.','teamCapabilities':'Product engineering, customer discovery, distribution, and domain review.','unprofitableConditions':['buyers will not prepay','support exceeds price','channel CAC is too high','retention is weak','free native platform feature removes differentiation']}},
      'earningPotential':{'mostRealisticOutcome':'bootstrapped software, productized service, data business, or marketplace depending on validation','firstPayingCustomer':'A paid pilot in the $49–$499 range is the practical first milestone.','sideBusiness':'$5k–$50k annual revenue scenario if founder-led and narrow.','smallCompany':'$100k–$1m annual revenue requires repeatable acquisition and standardized delivery.','sevenFigure':'Possible only with recurring or transaction revenue, strong retention, and reduced founder labor.','ventureScale':'Not assumed; realistic only if the workflow expands into infrastructure, a network, or a proprietary data layer.','annualRevenueRange':rng(5000,120000,5000000),'confidence':'low to medium until paid cohort evidence','mainAssumptions':['validated price','repeatable channel','repeat demand','controlled support'],'mainLimitingFactor':'distribution and willingness to pay, followed by support/productization'},
      'market':{'description':f"The market consists of {primary} handling the recurring workflow behind {problem.lower()}",'demandDrivers':['increasing software and data complexity','AI capability and risk','fragmented workflows','pressure for speed and evidence'],'signals':'Supplied research reports contain examples and competitor categories; re-open primary sources before investment decisions.','sizeDirection':'Unknown — requires bottom-up reachable-market analysis.','budgetSource':'operating, software, QA, marketing, education, transaction, or project budget depending on buyer','maturity':'Varies by niche; avoid treating a broad category as one market.','competitiveDensity':'Medium to high for generic positioning; lower for a precise workflow and distribution wedge.','directCompetitors':['Unknown — requires current competitor research by exact niche.'],'indirectCompetitors':['spreadsheets','internal scripts','consultants or agencies','platform-native features','manual review'],'diyAlternatives':['generic LLMs','open-source tools','manual checklists'],'incumbentAdvantages':['distribution','brand','integrations','data','bundling'],'startupAdvantages':['focus','speed','underserved segment','new workflow design'],'differentiation':['specific paid outcome','transparent evidence','integrated workflow','permission-safe outcome data'],'unservedNiches':['languages','small teams','regional workflows','cross-platform compatibility','evidence-heavy use cases'],'geography':'Start where founder language, network, or regulation creates an advantage; expand only with evidence.','timing':'Revalidate technical, legal, and platform assumptions immediately before launch.','trends':['AI adoption','agent deployment','data fragmentation','software consolidation','demand for verification'],'platformFeatureRisk':'Material; preserve value in data, workflow, cross-platform support, or distribution.','commoditizationRisk':'High for generation-only features; lower for trusted outcomes and proprietary feedback loops.','moats':{'data':item.get('moat','permission-safe outcome history'),'workflow':'deep integration into repeated decisions','distribution':'partner or specialist channel access','brand':'trust from transparent evidence','network':'possible where users, suppliers, or benchmarks reinforce value','switchingCosts':'history, integrations, policies, and team habits without unethical lock-in'}},
      'validation':{'mostImportantUncertainty':'Will the named economic buyer prepay for the narrow result?','riskiestAssumption':'The problem is urgent enough and current alternatives are inadequate.','cheapestTest':'Five-page mock, example output, and direct paid offer to 15 qualified prospects.','fastestTest':'Ask for a deposit or signed pilot with a fixed delivery date.','interviewPlan':'Interview 15 users and five buyers separately; record event frequency, current cost, trigger, alternatives, decision process, and last purchase.','interviewQuestions':['Tell me about the last time this happened.','What did you do instead?','What did it cost in time, money, delay, or risk?','Who approved spending?','What would make an external solution untrustworthy?','Would you pay for this fixed outcome this month? Why or why not?'],'landingPageTest':'Show exact input, deliverable, price, limitations, and delivery time; measure qualified CTA and payment, not visits alone.','smokeTest':'Offer the deliverable before automating it, within ethical and legal boundaries.','conciergeMvp':'Manually deliver one standardized outcome while logging every step and exception.','wizardOfOz':'Use manual review behind a simple interface to test customer behavior before complex automation.','prototypeTest':'Process three real authorized examples and compare against expert/user judgment.','pricingTest':'Present at least three price points or use sequential cohorts; do not rely on hypothetical survey answers.','demandThreshold':'At least 2 paid pilots or 5 credible procurement commitments from 20 qualified conversations.','successCriteria':['prepayment','repeat request','measurable outcome','delivery within target labor budget'],'failureCriteria':['no buyer will pay','support dominates price','problem occurs too rarely','required data cannot be accessed lawfully'],'evidenceBeforeBuild':['last-event interviews','paid pilot','reachable channel','verified data/API terms'],'evidenceBeforeHeavyInvestment':['retention or repeat use','positive contribution margin','stable error taxonomy','security/compliance feasibility'],'plan48Hours':['create one example deliverable','build prospect list of 25','conduct five conversations','make a paid offer'],'plan7Days':['complete 15 interviews','run landing/payment test','deliver or schedule first pilot','document objections'],'plan30Days':['serve 3–10 pilots','measure labor and costs','identify repeated steps','decide build, pivot, or stop'],'doNotBuildYet':'Do not build a broad autonomous platform until a narrow paid outcome is repeatedly requested.'},
      'goToMarket':{'initialNiche':primary,'icp':f"A reachable {primary} experiencing the problem now, with authority or direct access to the budget owner.",'beachhead':'One language, platform, neighborhood, workflow, or integration where distribution is identifiable.','positioning':f"A specific, evidence-backed outcome for {primary}, not a generic AI tool.",'valueProposition':f"Reduce the time, uncertainty, and failure risk in {problem.lower()}",'messaging':'Lead with the triggering event, concrete deliverable, turnaround, and limits.','offer':'A fixed-scope paid pilot with a sample artifact and refund/acceptance terms.','pricingLaunch':'Founding cohort price tied to feedback and a public case study only with permission.','first10Customers':['founder-led outreach','specialist directories','warm introductions','community problem posts','partner referrals'],'first100Customers':['repeatable outbound segment','integration listing','case-study SEO','referral loop','channel partners'],'outbound':'Personalized, evidence-based outreach to buyers currently showing the trigger.','inbound':'High-intent problem pages, calculators, examples, and comparison content.','community':'Contribute useful diagnostics and transparent methods without spam.','partnerships':'Tools, agencies, properties, platforms, reviewers, or associations already serving the buyer.','productLedGrowth':'Exports, shared reports, badges, or collaboration can expose the product when they genuinely help users.','marketplaceDistribution':'Use only where the marketplace already contains the buyer and terms permit the offer.','appStore':'Relevant only when app-store search is a proven channel.','seo':'Target exact workflow and failure queries, not broad “AI tool” keywords.','content':'Publish methods, failure patterns, benchmarks, and honest case studies.','paidAcquisition':'Unsuitable until conversion, retention, and contribution margin are measured.','referralLoop':'Reward introductions only when disclosure and incentives preserve trust.','salesCycle':'Aim for days to weeks for pilot; avoid building enterprise controls before demand.','salesAssets':['sample output','scope page','security FAQ','pricing','case study','ROI worksheet'],'onboarding':'Collect only required inputs, show progress, and make the first value event fast.','retention':'Save history, make reruns easy, and prove value each cycle.','expansion':'Add adjacent workflows, users, integrations, languages, or data products after the wedge.'},
      'operations':{'founderSkills':['customer interviews','product engineering','AI evaluation','data handling','direct sales'],'teamRoles':['founder/product engineer','domain reviewer as needed','design or growth later','security/legal specialists when needed'],'aiCanAccelerate':['research','drafting','classification','test generation','coding','documentation','support triage'],'humanRequired':['trust building','ambiguous evaluation','partnerships','legal/account decisions','high-impact approval'],'buildDifficulty':round(11-score_records['easeOfMvp']['value'],1),'operationalDifficulty':round(11-score_records['operationalSimplicity']['value'],1),'supportBurden':'Unknown; measure minutes per customer during pilots.','salesBurden':'Founder-led initially; should decline through a clear niche and repeatable channel.','complianceBurden':'Low to high depending on data, payments, marketplace role, and claims.','dataAcquisitionDifficulty':'Verify permissions, licensing, freshness, and deletion obligations before relying on data.','integrationDifficulty':'Start with one integration; avoid breadth until the workflow is proven.','mvpStages':['manual proof','assisted prototype','paid vertical slice','repeatable self-serve','scale and integrations'],'dependencies':['buyer access','authorized data','reliable model/tool behavior','payment and identity services'],'maintenance':['source/API changes','model regression','security updates','content/data quality','customer success'],'qualityControl':['acceptance criteria','automated tests','sample review','exception queue','post-delivery feedback'],'kpis':['qualified conversations','paid conversion','time to first value','gross margin','repeat rate','support minutes','error/correction rate'],'leadingIndicators':['prospect reply rate','deposit rate','input completion','run success','user corrections'],'laggingIndicators':['monthly revenue','retention','gross margin','referrals','expansion'],'killMetrics':['zero prepayments after qualified outreach','negative contribution margin after three iterations','unresolvable legal/data blocker','no repeated trigger'],'automationOpportunities':['input validation','routing','report generation','billing','notifications','regression tests'],'sops':['customer qualification','data authorization','run/review','incident response','refund/dispute','source update','release acceptance']},
      'risks':{'product':'Outcome may not be better than a checklist or existing tool.','market':'Pain may be real but not budgeted.','pricing':'Price may not cover review, support, and acquisition.','distribution':'The founder may not reach buyers cheaply.','technical':'Inputs, APIs, or evaluation may be less reliable than expected.','aiReliability':'Model outputs can vary and require deterministic checks.','hallucination':'Generated claims must be grounded, labeled, and reviewable.','data':'Source data may be incomplete, stale, biased, or unlicensed.','security':'Customer data, tokens, uploads, and integrations expand attack surface.','privacy':'Collecting unnecessary personal or confidential information creates avoidable risk.','regulatory':'Role, claims, jurisdiction, and data may trigger obligations.','reputation':'One confident wrong result can damage trust.','dependency':'External APIs, models, platforms, and partners can change.','platform':'The platform may bundle the feature or restrict access.','fraud':'Transactions, referrals, identity, or uploaded evidence can be manipulated.','abuse':'The system may be used for spam, surveillance, deception, or unauthorized testing.','support':'Edge cases can turn software into bespoke service.','founderMarketFit':'The founder may prefer building over selling and validation.','capital':'Premature infrastructure or hiring can consume runway.','timing':'The market may be too early, too late, or temporarily fashionable.','commoditization':'Generic AI functionality is easy to copy.','ethics':'Avoid deceptive claims, exploitative targeting, and automation without recourse.','worstCase':'Months of building produce no paid demand and create data/security liability.','mitigations':['prepayment before build','narrow scope','evidence labels','human approval','least privilege','cost limits','kill criteria'],'abandonWhen':['buyers reject the paid outcome','lawful inputs are unavailable','unit economics remain negative','the wedge is fully commoditized','founder cannot sustain the required daily work']},
      'actionPlan':{'firstAction':'Create one realistic example output and a one-page paid offer.','firstCustomerConversation':f"Interview a currently affected {primary} about the last occurrence and ask for a paid pilot.",'firstPrototype':'A manual or command-line vertical slice with an evidence-rich report.','firstSalesOffer':'Fixed scope, explicit price, delivery time, inputs, limitations, and acceptance criteria.','firstDistributionChannel':'The narrowest directory, community, partner, or local network containing the exact buyer.','firstMeasurement':'Paid conversion and delivery hours, not likes or waitlist size.','firstHiringNeed':'A domain or native reviewer only after customer-funded demand.','firstIntegration':'The single source or destination that removes the most friction.','plan7Days':['example artifact','25-prospect list','15 interviews/outreach attempts','paid offer','first delivery plan'],'plan30Days':['3–10 pilots','measure costs and corrections','publish one consented case study','automate repeated steps','re-score idea'],'plan90Days':['choose narrow ICP','ship self-serve vertical slice','build repeat channel','track cohort economics','stop or expand based on evidence'],'checklist':['define trigger','name payer','show deliverable','ask for payment','measure labor','record objections','protect data','set kill date']},
      'scores':score_records,'compositeScores':comps,'assumptions':['All financial numbers are editable analyst scenarios, not promises.','Market size is intentionally left unknown without source-backed bottom-up research.','Direct competitor and current price facts require fresh verification.'],'unknowns':['actual accessible market','buyer prepayment rate','channel conversion','repeat frequency','support and review burden'],'evidence':[{'type':'source_record','sourceId':source_id,'claim':'The concept or close variant appears in the supplied corpus.','confidence':'medium'},{'type':'analyst_interpretation','sourceId':'src-012','claim':'The enriched operating analysis was generated from the concept and explicit methodology.','confidence':'low-medium'}],
      'createdAt':NOW,'updatedAt':NOW,'version':VERSION
    }
    return rec

ideas=[enrich(x,i+1) for i,x in enumerate(raw)]
# Relationships based on shared tags/category and selected explicit complements.
for a in ideas:
    scored=[]
    ta=set(map(str.lower,a['tags']))
    for b in ideas:
        if a['id']==b['id']: continue
        tb=set(map(str.lower,b['tags']))
        common=len(ta&tb)+(1 if a['category']==b['category'] else 0)
        if common: scored.append((common,b['id']))
    a['relatedIdeaIds']=[x[1] for x in sorted(scored, reverse=True)[:6]]
# ---------- data exports ----------
rank_specs={
'highest-overall':'Overall opportunity','highest-profitability':'Highest profit potential','highest-earning-ceiling':'Highest earning ceiling','fastest-first-revenue':'Fastest path to first revenue','lowest-startup-cost':'Lowest startup cost','easiest-mvp':'Easiest MVP','best-solo-founders':'Best for solo founders','best-nontechnical':'Best for nontechnical founders','best-developers':'Best for developers','best-agencies':'Best for agencies','best-recurring-revenue':'Best recurring revenue','best-enterprise':'Best enterprise sales','best-local':'Best local markets','best-global':'Best global markets','best-ai-agent':'Best AI-agent opportunities','most-automatable':'Most automatable','most-defensible':'Most defensible','largest-market':'Largest market potential','lowest-competition':'Lowest competitive intensity','strongest-pain':'Strongest customer pain','highest-wtp':'Highest willingness to pay','lowest-regulatory-risk':'Lowest regulatory risk','highest-confidence':'Highest evidence confidence','most-speculative':'Most speculative','high-risk-high-reward':'Highest risk and reward','needs-research':'Needs additional research','do-not-build-yet':'Should not be built yet','best-marketplace':'Best marketplace opportunities','best-little-capital':'Best with little capital','best-small-team':'Best small team opportunities'}

def metric_for(key,x):
    s=x['scores']; c=x['compositeScores']
    m={
    'highest-overall':c['overallOpportunity'],'highest-profitability':c['highestProfitPotential'],'highest-earning-ceiling':s['revenuePotential']['value']*10,'fastest-first-revenue':c['fastestRevenue'],'lowest-startup-cost':c['lowestCostLaunch'],'easiest-mvp':s['easeOfMvp']['value']*10,'best-solo-founders':c['soloFounderPotential'],'best-nontechnical':c['nontechnicalFounder'],'best-developers':c['technicalFounder'],'best-agencies':(s['willingnessToPay']['value']+s['speedToFirstRevenue']['value']+s['aiAutomationPotential']['value'])/3*10,'best-recurring-revenue':c['recurringRevenue'],'best-enterprise':c['enterpriseOpportunity'],'best-local':c['localBusinessOpportunity'],'best-global':(s['globalPotential']['value']+s['scalability']['value']+s['marketDemand']['value'])/3*10,'best-ai-agent':c['aiAgentPotential'],'most-automatable':s['aiAutomationPotential']['value']*10,'most-defensible':c['longTermDefensibility'],'largest-market':s['marketDemand']['value']*10,'lowest-competition':s['competitiveAdvantage']['value']*10,'strongest-pain':s['problemSeverity']['value']*10,'highest-wtp':s['willingnessToPay']['value']*10,'lowest-regulatory-risk':s['regulatorySimplicity']['value']*10,'highest-confidence':s['evidenceQuality']['value']*10,'most-speculative':(10-s['overallConfidence']['value'])*10,'high-risk-high-reward':(s['revenuePotential']['value']+(10-s['overallConfidence']['value']))/2*10,'needs-research':(10-s['evidenceQuality']['value'])*10,'do-not-build-yet':((10-s['overallConfidence']['value'])+(10-s['easeOfMvp']['value'])+(10-s['easeOfDistribution']['value']))/3*10,'best-marketplace':c['marketplaceOpportunity'],'best-little-capital':c['littleCapital'],'best-small-team':c['smallTeam']}
    return round(m[key],1)
rankings=[]
for key,title in rank_specs.items():
    ordered=sorted(ideas,key=lambda x:metric_for(key,x),reverse=True)
    rankings.append({'id':key,'title':title,'method':'Composite decision-support view; not objective truth.','items':[{'rank':i+1,'ideaId':x['id'],'name':x['name'],'score':metric_for(key,x),'reason':x['atAGlance']['mainAdvantage'] if i<10 else 'Ranked by the documented metric.'} for i,x in enumerate(ordered)]})

cats={}
tags={}
for x in ideas:
    cats.setdefault(x['category'],[]).append(x['id'])
    for t in x['tags']: tags.setdefault(t,[]).append(x['id'])
categories=[{'id':slug(k),'name':k,'count':len(v),'ideaIds':v} for k,v in sorted(cats.items())]
tagdata=[{'id':slug(k),'name':k,'count':len(v),'ideaIds':v} for k,v in sorted(tags.items())]
relationships=[]
for x in ideas:
    for rid in x['relatedIdeaIds']:
        if x['id']<rid: relationships.append({'source':x['id'],'target':rid,'type':'similar_or_complementary','basis':'shared category or tags; analyst-generated relationship'})
# Add explicit portfolio relationships.
def findid(legacy): return next((x['id'] for x in ideas if x['legacyId']==legacy),None)
for aa,bb,typ in [('multilingual-agent-launch-gate','pstn-accent-noise-regression','feature_or_bundle'),('multilingual-agent-launch-gate','policy-journey-adherence-pack','feature_or_bundle'),('proofrail','model-prompt-regression-gate','shared_infrastructure'),('prague-guest-intent-network','small-tour-empty-seat-rescue','cross_sell'),('course-match','erasmus-course-rescue','service_to_software'),('eushop-core','food-atlas','shared_infrastructure'),('food-knowledge-graph','foodspec','shared_data')]:
    a=findid(aa); b=findid(bb)
    if a and b: relationships.append({'source':a,'target':b,'type':typ,'basis':'explicitly related in supplied project context'})

# Extraction ledger preserves all canonical records plus aliases/variants and explicit report variants.
ledger=[]; mention=0
for x in ideas:
    for idx,name in enumerate([x['name']]+x['alternativeNames']):
        mention+=1
        ledger.append({'mentionId':f'mention-{mention:04d}','originalName':name,'originalWording':x['oneSentenceConcept'] if idx==0 else name,'sourceReferences':x['sourceReferences'],'appearanceType':'primary idea' if idx==0 else 'name variant','overlapNotes':'Canonical record retains all variants.','merged':idx>0,'canonicalIdeaId':x['id']})
extra_variants=['Barge-in and Turn-Taking Release Gate','Code-Switching Customer Test Set','Escalation Boundary Regression Pack','MCP Breaking-Release Migration Diff','MCP Tool-Schema Fuzz Pack','Knowledge-Change Regression Pack','Retrieval Coverage and Abstention Gate','AI Workflow Outcome Monitor','White-label Weekly Neighborhood Event Digest','Front-Desk Neighborhood Disruption Alert','Event Cancellation Replacement Channel','Approved Course-Equivalency Database','Timetable and Prerequisite Conflict Detector','Verified City-Arrival Checklist','Wishlist-Led Language Priority Report','Store-Page Localization QA','Bundle/Lot Optimizer','Stale Inventory Relaunch Report','Seller Market-Fit Calendar','Sponsor-Rate Benchmark Cooperative','Dish-Story Print and Web Cards','Weather-Triggered Rebooking Board','Sold-Out Operator Referral Exchange','Anki Deck-Debt Cleanup','City-Events API Micro-Feed']
for i,name in enumerate(extra_variants):
    mention+=1
    parent=ideas[i%len(ideas)]['id']
    ledger.append({'mentionId':f'mention-{mention:04d}','originalName':name,'originalWording':name,'sourceReferences':['src-004' if i<8 else 'src-005'],'appearanceType':'sub-idea or rejected/hold variant','overlapNotes':'Preserved as a raw mention; requires full source export to establish exact canonical relationship.','merged':True,'canonicalIdeaId':parent})

# Prompt library: 25 prompts per idea plus preserved/reconstructed masters.
prompt_types=[
('deep-market-research','Deep market research'),('customer-discovery','Customer discovery'),('competitor-analysis','Competitor analysis'),('validation-experiment','Validation experiment'),('product-requirements','Product requirements document'),('ux-design','UX design'),('technical-architecture','Technical architecture'),('mvp-coding','MVP coding'),('ai-agent-design','AI-agent design'),('data-integrations','Data and integration research'),('security-privacy','Security and privacy review'),('pricing-research','Pricing research'),('unit-economics','Unit economics'),('financial-model','Financial model'),('go-to-market','Go-to-market'),('landing-page','Landing-page copy'),('outbound-sales','Outbound sales'),('seo-plan','SEO content plan'),('launch-plan','Launch plan'),('operations-automation','Operations and automation'),('risk-premortem','Risk and pre-mortem'),('investor-memo','Investor memo'),('weekly-kpi','Weekly KPI review'),('scale-up','Scale-up strategy'),('pivot-generation','Pivot generation')]

def prompt_text(x,key,label):
    common=f"""# {label} Prompt — {x['name']}

You are working on **{x['name']}**.

## Verified context supplied by the idea record
- Concept: {x['oneSentenceConcept']}
- Primary customer: {x['customer']['primaryCustomer']}
- Problem: {x['customer']['specificProblem']}
- Proposed product: {x['atAGlance']['whatToBuild']}
- Revenue paths: {x['atAGlance']['howItMakesMoney']}
- Main risk: {x['atAGlance']['mainRisk']}
- Current confidence: {x['scores']['overallConfidence']['value']}/10

## Evidence rules
Separate source facts, user-provided claims, analyst assumptions, calculations, projections, and unknowns. Do not invent market sizes, competitors, prices, laws, APIs, customer quotes, traction, or completed implementation. Recheck every current claim using primary sources. Show negative evidence. Cite the claim each source supports. Preserve uncertainty and stop when access is insufficient.

## Assignment
"""
    tasks={
'deep-market-research':'Map the exact reachable market, trigger events, budgets, alternatives, negative evidence, recent changes, and bottom-up market size. Return a source ledger, contradictions, opportunity variants, and falsification conditions.',
'customer-discovery':'Design interviews around the last real occurrence, current workaround, cost, buyer, trust, rejection, switching, retention, and prepayment. Produce recruiting criteria, script, coding rubric, evidence table, and decision thresholds.',
'competitor-analysis':'Identify direct, indirect, DIY, open-source, platform-native, and do-nothing competitors. Compare workflow, pricing, distribution, data, switching costs, failure modes, and likely responses. Do not infer features from marketing headlines.',
'validation-experiment':'Design the cheapest ethical 48-hour, 7-day, and 30-day experiments. Require a behavioral commitment or payment, define sample, channel, exact artifact, success/failure thresholds, cost ceiling, and kill decision.',
'product-requirements':'Write an implementation-ready PRD for one narrow vertical slice: user/payer, trigger, jobs, workflow, states, permissions, data contracts, acceptance criteria, non-goals, errors, analytics, safety, rollout, and proof gates.',
'ux-design':'Design a responsive, accessible, low-friction UX with information architecture, user journey, wireframe descriptions, content hierarchy, empty/error/loading states, trust evidence, approval gates, keyboard behavior, and mobile constraints.',
'technical-architecture':'Design the smallest secure architecture that supports the validated workflow. Include components, data flow, schema, APIs, jobs, model adapter, evaluation, auth, payments, observability, deployment, threat model, failure recovery, and build order.',
'mvp-coding':'Act as a coding agent. Inspect the repository first, establish tests and acceptance criteria, implement one complete vertical slice, keep changes reviewable, run validations, document limitations, and stop before irreversible external actions.',
'ai-agent-design':'Specify bounded agents, tools, permissions, task graph, memory, cost budgets, evaluations, approval boundaries, retries, evidence capture, failure modes, and provider-neutral routing. Autonomous output is never its own proof of completion.',
'data-integrations':'Verify necessary data, licences, APIs, pricing, rate limits, authentication, deletion, freshness, schemas, open-source alternatives, integration risks, and fallback paths. Recommend the smallest lawful data contract.',
'security-privacy':'Perform threat modelling and privacy review across inputs, uploads, identity, payments, integrations, model calls, logs, exports, retention, deletion, abuse, prompt injection, authorization, and incident handling. Separate technical controls from legal conclusions.',
'pricing-research':'Investigate current alternatives, buyer budget, value metric, price sensitivity, packaging, free substitutes, usage cost, enterprise requirements, and refund risk. Design real pricing tests; do not treat survey willingness as payment evidence.',
'unit-economics':'Build transparent per-customer economics with acquisition, onboarding, model/API usage, human review, support, payments, refunds, data, gross margin, contribution margin, retention, LTV, CAC, payback, and break-even sensitivity.',
'financial-model':'Build conservative, base, and aggressive 36-month scenarios with editable assumptions. Connect leads, conversion, customers, price, retention, usage, variable costs, headcount, fixed costs, working capital, cash runway, and break-even. Flag unsupported inputs.',
'go-to-market':'Choose one beachhead and design positioning, offer, first 10/100 customers, outbound, inbound, partners, product-led loops, onboarding, retention, expansion, channel economics, sales assets, and a weekly experiment cadence.',
'landing-page':'Write evidence-aware landing-page copy: trigger, exact outcome, sample deliverable, workflow, who it is for/not for, price or pilot CTA, limitations, trust, privacy, FAQ, objections, and no fabricated testimonials or metrics.',
'outbound-sales':'Create a small, personalized outreach sequence for qualified buyers showing the triggering evidence. Include list criteria, first message, follow-ups, discovery call, paid pilot close, objection handling, and ethical stop rules. Avoid spam automation.',
'seo-plan':'Build a search plan around exact high-intent problems, failures, comparisons, templates, calculators, and methods. Include query clusters, evidence requirements, page briefs, internal links, conversion paths, update cadence, and measurement.',
'launch-plan':'Plan a controlled launch from private pilots to public availability with acceptance gates, pricing, onboarding, support, incident response, analytics, rollback, communications, case-study consent, and a decision to expand, pause, or stop.',
'operations-automation':'Map every recurring operation, owner, input/output, SLA, exception, control, metric, and automation threshold. Create SOPs for onboarding, delivery, review, billing, support, data updates, incidents, and weekly quality checks.',
'risk-premortem':'Assume failure after 12 months. Identify earliest warning, false assumption, lost time/money, product/market/distribution/technical/legal/platform/support risks, reusable assets, mitigations, month-two detection, and explicit abandon conditions.',
'investor-memo':'Write a skeptical investment memo with thesis, customer, market, timing, product, distribution, economics, moat, evidence, risks, milestones, capital needs, outcomes, and reasons not to invest. Do not inflate total addressable market.',
'weekly-kpi':'Review qualified demand, paid conversion, activation, time to value, delivery labor, model/data cost, gross margin, repeat use, retention, support, quality, incidents, experiments, assumptions changed, and the next highest-information action.',
'scale-up':'Define proof gates for expansion into new users, regions, languages, integrations, channels, pricing, team roles, infrastructure, and enterprise controls. Preserve unit economics, quality, security, and reversibility.',
'pivot-generation':'Generate structurally different pivots using upstream/downstream problems, adjacent buyers, data/API/licensing/transaction models, service-to-software paths, and distribution assets. Score each against evidence, cost, speed, fit, and residual value.'}
    return common+tasks[key]+"\n\n## Required output\nReturn decisions, evidence table, assumptions, unknowns, risks, acceptance criteria, and the next falsification step.\n"

prompt_index=[]
for x in ideas:
    pack=[]
    for key,label in prompt_types:
        pid=f"{x['id']}-{key}"; rel=f"prompts/idea-specific/{x['id']}/{key}.md"
        txt=prompt_text(x,key,label); w(rel,txt)
        prompt_index.append({'id':pid,'title':f"{label} — {x['name']}",'type':key,'ideaId':x['id'],'path':rel,'sourceStatus':'newly generated from canonical idea context','wordCount':len(txt.split())})
        pack.append((label,rel))
    readme_lines = [f"- [{label}]({key}.md)" for key, label in prompt_types]
    pack_readme = f"# Prompt Pack — {x['name']}\n\nTwenty-five context-bound prompts for researching, validating, building, launching, operating, and reassessing **{x['name']}**.\n\n" + "\n".join(readme_lines)
    w(f"prompts/idea-specific/{x['id']}/README.md", pack_readme)

j('data/ideas.json',ideas); j('data/ideas.schema.json',{'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://example.invalid/venture-atlas/ideas.schema.json','title':'Venture Atlas Idea Collection','type':'array','items':{'type':'object','required':['schemaVersion','id','slug','name','atAGlance','customer','product','futureAiBuild','profitability','validation','goToMarket','operations','risks','actionPlan','scores','compositeScores','sourceReferences'],'properties':{'id':{'type':'string','pattern':'^idea-[0-9]{3}$'},'slug':{'type':'string','pattern':'^[a-z0-9-]+$'},'name':{'type':'string'},'sourceReferences':{'type':'array','items':{'type':'string'}},'scores':{'type':'object'},'compositeScores':{'type':'object'}}}})
j('data/rankings.json',rankings); j('data/categories.json',categories); j('data/tags.json',tagdata); j('data/sources.json',sources); j('data/prompts.json',prompt_index); j('data/relationships.json',relationships); j('data/extraction-ledger.json',ledger)
with (ROOT/'data/ideas.csv').open('w',encoding='utf-8',newline='') as f:
    cols=['id','slug','name','category','status','target_customer','problem','revenue_model','overall_score','confidence_score','startup_min_usd','startup_mid_usd','startup_max_usd','time_to_mvp','main_risk','source_refs']
    cw=csv.DictWriter(f,fieldnames=cols); cw.writeheader()
    for x in ideas:
        cw.writerow({'id':x['id'],'slug':x['slug'],'name':x['name'],'category':x['category'],'status':x['status'],'target_customer':x['customer']['primaryCustomer'],'problem':x['customer']['specificProblem'],'revenue_model':x['profitability']['revenueModel'],'overall_score':x['compositeScores']['overallOpportunity'],'confidence_score':x['scores']['overallConfidence']['value'],'startup_min_usd':x['atAGlance']['startupCost']['minimum'],'startup_mid_usd':x['atAGlance']['startupCost']['midpoint'],'startup_max_usd':x['atAGlance']['startupCost']['maximum'],'time_to_mvp':x['atAGlance']['timeToMvp'],'main_risk':x['atAGlance']['mainRisk'],'source_refs':'|'.join(x['sourceReferences'])})

# Sensitivity analysis
profiles=[]
for pname,weights in positive_profiles.items():
    top=sorted(ideas,key=lambda x:x['compositeScores'][pname],reverse=True)[:15]
    profiles.append({'profile':pname,'weights':weights,'topIdeas':[{'ideaId':x['id'],'name':x['name'],'score':x['compositeScores'][pname]} for x in top]})
j('data/sensitivity-analysis.json',profiles)
# ---------- human-readable dossiers ----------
def render_scores(x):
    return '\n'.join(f"| {k} | {v['value']} | {v['confidence']} | {v['justification']} |" for k,v in x['scores'].items())
def kv(title,obj):
    lines=[f'## {title}']
    for k,v in obj.items():
        nice=re.sub(r'(?<!^)(?=[A-Z])',' ',k).replace('_',' ').title()
        if isinstance(v,dict):
            lines.append(f'### {nice}')
            for kk,vv in v.items(): lines.append(f'- **{re.sub(r"(?<!^)(?=[A-Z])"," ",kk).title()}:** {vv}')
        elif isinstance(v,list):
            lines.append(f'### {nice}\n'+mdlist(v))
        else: lines.append(f'- **{nice}:** {v}')
    return '\n\n'.join(lines)

def idea_md(x):
    a=x['atAGlance']; p=x['profitability']
    glance=f"""# {x['name']}

> {x['oneSentenceConcept']}

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `{x['id']}` |
| Target customer | {a['targetCustomer']} |
| Problem | {a['problemSolved']} |
| What to build | {a['whatToBuild']} |
| How it makes money | {a['howItMakesMoney']} |
| Why customers pay | {a['whyCustomersPay']} |
| Earning potential | USD {a['estimatedEarningPotential']['minimum']:,}–{a['estimatedEarningPotential']['maximum']:,} annual scenario range; not a forecast |
| Startup cost | USD {a['startupCost']['minimum']:,}–{a['startupCost']['maximum']:,} scenario range |
| Time to MVP | {a['timeToMvp']} |
| Time to first revenue | {a['timeToFirstRevenue']} |
| Profitability condition | {a['profitabilityCondition']} |
| Overall opportunity score | {a['overallScore']}/100 |
| Confidence | {a['confidenceScore']}/10 |
| Main advantage | {a['mainAdvantage']} |
| Main risk | {a['mainRisk']} |
| Best next validation | {a['bestNextValidationStep']} |

## Identity and Provenance

- **Canonical ID:** `{x['id']}`
- **Legacy ID:** `{x['legacyId']}`
- **Slug:** `{x['slug']}`
- **Category:** {x['category']} / {x['subcategory']}
- **Status:** {x['status']}
- **Tags:** {', '.join(x['tags'])}
- **Alternative names:** {', '.join(x['alternativeNames'])}
- **Source references:** {', '.join(x['sourceReferences'])}
- **Provenance status:** {x['provenance']['sourceType']}; original wording: {x['provenance']['originalWordingAvailable']}

{x['detailedDescription']}
"""
    scen='\n'.join(f"| {s['name'].title()} | {s['customers']} | ${s['averageMonthlyRevenuePerCustomer']:,.0f} | ${s['monthlyRevenue']:,.0f} | ${s['annualRevenue']:,.0f} | {s['grossMarginPercent']}% | ${s['monthlyOperatingCosts']:,.0f} | ${s['approxMonthlyOperatingProfit']:,.0f} |" for s in p['scenarios'])
    finance=f"""## Profitability Analysis

- **Revenue model:** {p['revenueModel']}
- **Pricing model:** {p['pricingModel']}
- **Expected ARPC scenario:** ${p['expectedArpc']['minimum']:,}–${p['expectedArpc']['maximum']:,}
- **Gross-margin scenario:** {p['grossMarginPotential']['minimum']}%–{p['grossMarginPotential']['maximum']}%
- **CAC scenario:** ${p['cac']['minimum']:,}–${p['cac']['maximum']:,}
- **LTV scenario:** ${p['ltv']['minimum']:,}–${p['ltv']['maximum']:,}
- **Target LTV:CAC:** {p['ltvCacRatio']}
- **Payback:** {p['paybackPeriod']}
- **Break-even model:** `{p['breakEvenEstimate']}`

### Three Editable Scenarios

| Scenario | Customers | Monthly price/ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Approx. monthly operating profit |
|---|---:|---:|---:|---:|---:|---:|---:|
{scen}

All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
{mdlist(p['knownFacts'])}

### Research-Supported Estimates
{mdlist(p['researchSupportedEstimates'])}

### Analyst Assumptions
{mdlist(p['analystAssumptions'])}

### Unknowns Requiring Validation
{mdlist(p['unknowns'])}

## What Must Be True for This Idea to Be Profitable

{mdlist([f"**{re.sub(r'(?<!^)(?=[A-Z])',' ',k).title()}:** {v}" if not isinstance(v,list) else f"**{re.sub(r'(?<!^)(?=[A-Z])',' ',k).title()}:** {'; '.join(v)}" for k,v in p['mustBeTrue'].items()])}
"""
    scores=f"""## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
{render_scores(x)}

### Composite Views

{mdlist([f"**{re.sub(r'(?<!^)(?=[A-Z])',' ',k).title()}:** {v}/100" for k,v in x['compositeScores'].items()])}
"""
    return '\n\n'.join([glance,kv('Customer Perspective',x['customer']),kv('Product Definition',x['product']),kv('What Future AI Should Build',x['futureAiBuild']),finance,kv('Earning Potential',x['earningPotential']),kv('Market and Competition',x['market']),kv('Validation Plan',x['validation']),kv('Go-to-Market Strategy',x['goToMarket']),kv('Build and Operations Plan',x['operations']),kv('Risks and Failure Modes',x['risks']),kv('Action Plan',x['actionPlan']),scores, '## Evidence, Assumptions, and Unknowns\n\n### Evidence\n'+mdlist([f"{e['type']} — {e['claim']} ({e['confidence']}; {e['sourceId']})" for e in x['evidence']])+'\n\n### Assumptions\n'+mdlist(x['assumptions'])+'\n\n### Unknowns\n'+mdlist(x['unknowns'])+'\n\n## Related Ideas\n'+mdlist([f'[{rid}]({next(y["slug"] for y in ideas if y["id"]==rid)}.md)' for rid in x['relatedIdeaIds']])+'\n\n## Idea-Specific Prompt Pack\n\nSee [`prompts/idea-specific/'+x['id']+'/`](../prompts/idea-specific/'+x['id']+'/README.md).'])

w('ideas/README.md','# Idea Library\n\n'+f'{len(ideas)} canonical idea dossiers. Each dossier includes customer, product, future-AI build specification, economics, validation, GTM, operations, risks, actions, scoring, evidence, assumptions, and unknowns.\n\n'+'\n'.join(f"- [{x['id']} — {x['name']}]({x['slug']}.md)" for x in ideas))
for x in ideas:
    w(f"ideas/{x['slug']}.md",idea_md(x))
    w(f"financial-models/{x['id']}.md",'# Financial Model — '+x['name']+'\n\n'+kv('Model',x['profitability']))
    w(f"validation-plans/{x['id']}.md",'# Validation Plan — '+x['name']+'\n\n'+kv('Experiments',x['validation']))
    w(f"technical-blueprints/{x['id']}.md",'# Technical Blueprint — '+x['name']+'\n\n'+kv('System',x['futureAiBuild']))
    w(f"launch-plans/{x['id']}.md",'# Launch Plan — '+x['name']+'\n\n'+kv('Go-to-Market',x['goToMarket'])+'\n\n'+kv('Actions',x['actionPlan']))

for c in categories:
    selected=[next(x for x in ideas if x['id']==iid) for iid in c['ideaIds']]
    w(f"categories/{c['id']}.md",f"# {c['name']}\n\n{c['count']} ideas.\n\n"+'\n'.join(f"- [{x['name']}](../ideas/{x['slug']}.md) — {x['oneSentenceConcept']}" for x in selected))
w('categories/README.md','# Categories\n\n'+'\n'.join(f"- [{c['name']}]({c['id']}.md) — {c['count']} ideas" for c in categories))
for r in rankings:
    lines=[f"# {r['title']}",r['method'],'','| Rank | Idea | Score | Why |','|---:|---|---:|---|']+[f"| {it['rank']} | [{it['name']}](../ideas/{next(x['slug'] for x in ideas if x['id']==it['ideaId'])}.md) | {it['score']} | {it['reason']} |" for it in r['items']]
    w(f"rankings/{r['id']}.md",'\n'.join(lines))
w('rankings/README.md','# Rankings\n\nThese are reproducible, subjective views generated from documented weights.\n\n'+'\n'.join(f"- [{r['title']}]({r['id']}.md)" for r in rankings))

# Core documentation and archive notices.
audit={'auditDate':NOW,'sourceItemsInventoried':len(sources),'sourceItemsFullyReadableAsLocalBytes':2,'sourceItemsPartiallyRenderedFromFileLibrary':8,'sourceItemsFromModelSummary':1,'rawIdeaMentions':len(ledger),'canonicalIdeas':len(ideas),'variantsAndSubIdeas':len(ledger)-len(ideas),'promptFiles':len(prompt_index)+3,'ideaSpecificPrompts':len(prompt_index),'sourceRecords':len(sources),'rankingViews':len(rankings),'knownGaps':['No full verbatim export of the entire chat history was available as a local file.','File Library reports could be rendered only in excerpts; their complete source URL tables could not be byte-copied.','Current market, competitor, legal, API, and pricing claims were not newly researched for all 60 ideas.','Financial values are transparent scenarios and assumptions, not sourced forecasts.'],'completenessClaim':'Incomplete with respect to unavailable verbatim corpus; complete with respect to the 60 canonical records and generated repository manifest.'}
j('data/completeness-report.json',audit)
w('research/completeness-audit.md','# Completeness Audit\n\n```json\n'+json.dumps(audit,indent=2)+'\n```\n\n## Interpretation\n\nThe repository does **not** claim a perfect transcript-level extraction. It preserves all recoverable canonical ideas from the earlier artifact, adds directly recoverable finalists and variants from the two August 2 research reports, records aliases and raw mentions, and identifies inaccessible source material. Exact completeness can only be established after importing a redacted full conversation export and original report files.')
w('research/methodology.md','# Research Methodology\n\nThe operating method is evidence-first: define constraints, map problems, search broadly, preserve negative evidence, generate concrete ideas, deduplicate by customer/job/workflow/data/business model, score transparently, red-team leaders, and run cheap falsification tests before building. Facts, user claims, assumptions, calculations, projections, and unknowns must remain distinct.')
w('research/research-plan.md','# Research Plan\n\n1. Source inventory and privacy screening.\n2. Raw mention extraction.\n3. Canonicalization and variant preservation.\n4. Problem and customer normalization.\n5. Market and competitor verification.\n6. Cost and data/API verification.\n7. Business-model alternatives.\n8. Scoring before deep dives.\n9. Adversarial review.\n10. Payment-first experiments.\n11. Financial stress tests.\n12. Final re-verification and completeness audit.')
w('research/source-log.md','# Source Log\n\nSee [`data/sources.json`](../data/sources.json).\n\n'+'\n'.join(f"- **{s['id']} — {s['title']}** ({s['type']}, {s['date']}): {s['status']}" for s in sources))
w('research/assumptions.md','# Assumptions and Unknowns\n\nFinancial ranges, accessible demand, conversion, retention, support cost, and most current competitive facts are unvalidated unless an idea record explicitly says otherwise. The correct next step is usually direct customer evidence and a paid test, followed by fresh primary-source verification.')
w('research/scoring-methodology.md','# Scoring Methodology\n\nEach idea receives 25 scores from 0–10. Higher always means more attractive: **competitive advantage** is used instead of raw competition; **regulatory simplicity** instead of burden; **operational simplicity** instead of complexity. Every score includes a justification, confidence, and basis. Composite views are weighted averages multiplied by 10.\n\n## Profiles\n\n```json\n'+json.dumps(positive_profiles,indent=2)+'\n```\n\n## Sensitivity\n\nSee [`data/sensitivity-analysis.json`](../data/sensitivity-analysis.json). Rankings change when priorities change and must not be treated as objective truth.')
w('research/original-chat/README.md','# Original Chat Archive\n\nA full verbatim, privacy-reviewed chat export was not available to the file-generation environment. This directory intentionally does not fabricate one. Import instructions are in [`IMPORTING_CONVERSATIONS.md`](../../docs/IMPORTING_CONVERSATIONS.md).')
w('research/original-chat/ACCESS_GAPS.md','# Access Gaps\n\n- Complete chronological transcript unavailable.\n- Full source URLs/citations from rendered research reports unavailable as local byte streams.\n- Some File Library items were truncated by the retrieval interface.\n- Secrets and sensitive personal data must not be imported into a public repository.')
# ---------- static GitHub Pages website ----------
css=r'''
:root{--bg:#f6f7f9;--panel:#fff;--text:#152019;--muted:#667067;--line:#dce2dd;--accent:#17664a;--accent2:#e8f2ed;--warn:#8a4b08;--shadow:0 10px 30px rgba(18,32,24,.08);--radius:16px;--max:1440px;color-scheme:light}
[data-theme="dark"]{--bg:#0d1210;--panel:#151c18;--text:#edf5ef;--muted:#a4b1a8;--line:#2c3831;--accent:#62d0a3;--accent2:#1b3329;--warn:#ffbd69;--shadow:0 12px 34px rgba(0,0,0,.32);color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}button,input,select{font:inherit}button,.button{border:1px solid var(--line);background:var(--panel);color:var(--text);padding:.65rem .85rem;border-radius:10px;cursor:pointer}.primary{background:var(--accent);color:#fff;border-color:var(--accent)}[data-theme="dark"] .primary{color:#06140e}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;z-index:100;background:var(--panel);padding:.7rem}.site-header{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.nav{max-width:var(--max);margin:auto;padding:.8rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}.brand{font-weight:850;color:var(--text);letter-spacing:-.02em}.navlinks{display:flex;gap:.75rem;flex-wrap:wrap;margin-left:auto}.navlinks a{color:var(--muted)}main{max-width:var(--max);margin:auto;padding:1.4rem 1rem 4rem}.hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);gap:1.2rem;align-items:stretch}.hero>div,.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1.25rem;box-shadow:var(--shadow)}h1{font-size:clamp(2rem,5vw,4.6rem);line-height:.98;letter-spacing:-.055em;margin:.1rem 0 1rem}h2{font-size:1.45rem;letter-spacing:-.02em}h3{font-size:1rem}.lede{font-size:1.1rem;color:var(--muted);max-width:70ch}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem}.metric{border:1px solid var(--line);border-radius:12px;padding:.8rem}.metric strong{display:block;font-size:1.8rem}.toolbar{display:grid;grid-template-columns:minmax(250px,2fr) repeat(3,minmax(150px,1fr));gap:.65rem;margin:1.2rem 0}.toolbar input,.toolbar select{width:100%;background:var(--panel);color:var(--text);border:1px solid var(--line);padding:.75rem;border-radius:10px}.viewbar{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.cards.compact{grid-template-columns:repeat(4,minmax(0,1fr))}.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1rem;display:flex;flex-direction:column;min-height:330px;box-shadow:var(--shadow)}.compact .card{min-height:230px}.card h3{font-size:1.18rem;margin:.3rem 0}.eyebrow{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.muted{color:var(--muted)}.chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.6rem 0}.chip{background:var(--accent2);border-radius:999px;padding:.2rem .55rem;font-size:.77rem}.scoreline{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;margin:.7rem 0}.score{border:1px solid var(--line);border-radius:10px;padding:.45rem;text-align:center}.score b{display:block;font-size:1.08rem}.card-actions{margin-top:auto;display:flex;gap:.4rem;flex-wrap:wrap}.table-wrap{overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}table{border-collapse:collapse;width:100%}th,td{padding:.72rem;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}th{position:sticky;top:0;background:var(--panel)}.hidden{display:none!important}.notice{border-left:4px solid var(--warn);padding:.75rem 1rem;background:var(--panel);margin:1rem 0}.breadcrumbs{font-size:.85rem;color:var(--muted);margin-bottom:1rem}.detail-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,.65fr);gap:1rem}.toc{position:sticky;top:5rem}.section{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:1rem;margin-bottom:1rem}.section details{border-top:1px solid var(--line);padding:.5rem 0}.section summary{cursor:pointer;font-weight:700}.kv{display:grid;grid-template-columns:220px 1fr;gap:.4rem .8rem}.kv div{padding:.28rem 0;border-bottom:1px dotted var(--line)}.bar{height:9px;background:var(--line);border-radius:9px;overflow:hidden}.bar>span{display:block;height:100%;background:var(--accent)}.compare-grid{display:grid;grid-template-columns:repeat(3,minmax(250px,1fr));gap:1rem;overflow:auto}.footer{border-top:1px solid var(--line);padding:2rem 1rem;color:var(--muted);text-align:center}.empty{padding:3rem;text-align:center;color:var(--muted)}.tagline{display:flex;gap:.5rem;flex-wrap:wrap}.kbd{border:1px solid var(--line);border-bottom-width:2px;border-radius:6px;padding:.1rem .35rem;font-size:.75rem}.graph{width:100%;height:620px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel)}@media(max-width:980px){.hero,.detail-grid{grid-template-columns:1fr}.cards,.cards.compact{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{grid-template-columns:1fr 1fr}.toc{position:static}}@media(max-width:620px){.cards,.cards.compact{grid-template-columns:1fr}.toolbar{grid-template-columns:1fr}.navlinks{width:100%;margin-left:0}.metrics{grid-template-columns:1fr 1fr}.kv{grid-template-columns:1fr}.hero>div,.panel{padding:1rem}h1{font-size:2.45rem}}@media print{.site-header,.toolbar,.viewbar,.card-actions,.footer{display:none!important}body{background:#fff;color:#000}.section,.panel,.card{box-shadow:none;break-inside:avoid}main{max-width:none}}
'''
w('assets/css/site.css',css)

js=r'''
const VA={ideas:[],rankings:[],prompts:[],sources:[],categories:[],base:''};
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
async function loadData(){const root=document.body.dataset.root||'.';VA.base=root;const files=['ideas','rankings','prompts','sources','categories','relationships'];for(const f of files){try{VA[f]=await fetch(`${root}/data/${f}.json`).then(r=>{if(!r.ok)throw Error(r.status);return r.json()})}catch(e){console.error(f,e);VA[f]=[]}}}
function themeInit(){const saved=localStorage.getItem('va-theme')||'light';document.documentElement.dataset.theme=saved;$('#themeBtn')?.addEventListener('click',()=>{const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('va-theme',n)})}
function nav(){return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><nav class="nav" aria-label="Primary"><a class="brand" href="${VA.base}/index.html">Venture Atlas OS</a><div class="navlinks"><a href="${VA.base}/index.html#directory">Ideas</a><a href="${VA.base}/docs/rankings.html">Rankings</a><a href="${VA.base}/docs/compare.html">Compare</a><a href="${VA.base}/docs/prompts.html">Prompts</a><a href="${VA.base}/docs/relationships.html">Map</a><a href="${VA.base}/docs/methodology.html">Method</a><a href="${VA.base}/docs/about.html">About</a><button id="themeBtn" aria-label="Toggle light or dark mode">◐</button></div></nav></header>`}
function footer(){return `<footer class="footer">Decision support, not financial advice. Scores and scenarios are not guarantees. <a href="${VA.base}/research/completeness-audit.md">Completeness audit</a>.</footer>`}
function money(r){if(!r)return 'Unknown';return `$${Number(r.minimum).toLocaleString()}–$${Number(r.maximum).toLocaleString()}`}
function card(x){return `<article class="card" data-id="${x.id}"><div class="eyebrow">${x.category} · ${x.status}</div><h3><a href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">${x.name}</a></h3><p>${x.oneSentenceConcept}</p><div class="muted"><b>Customer:</b> ${x.atAGlance.targetCustomer}</div><div class="scoreline"><div class="score"><b>${x.atAGlance.overallScore}</b>Overall</div><div class="score"><b>${x.compositeScores.highestProfitPotential}</b>Profit</div><div class="score"><b>${(11-x.scores.easeOfMvp.value).toFixed(1)}</b>Difficulty</div></div><div class="muted"><b>MVP:</b> ${x.atAGlance.timeToMvp}<br><b>Startup:</b> ${money(x.atAGlance.startupCost)}<br><b>Risk:</b> ${x.atAGlance.mainRisk}</div><div class="chips">${x.tags.slice(0,4).map(t=>`<span class="chip">${t}</span>`).join('')}</div><div class="card-actions"><button onclick="toggleFav('${x.id}',this)" aria-label="Favorite ${x.name}">${isFav(x.id)?'★':'☆'}</button><label><input type="checkbox" class="compareCheck" value="${x.id}"> Compare</label><a class="button" href="${VA.base}/docs/idea.html?id=${encodeURIComponent(x.id)}">Open</a></div></article>`}
const favs=()=>JSON.parse(localStorage.getItem('va-favs')||'[]'); const isFav=id=>favs().includes(id);
function toggleFav(id,b){let a=favs();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('va-favs',JSON.stringify(a));b.textContent=a.includes(id)?'★':'☆'}
function remember(id){let a=JSON.parse(localStorage.getItem('va-recent')||'[]').filter(x=>x!==id);a.unshift(id);localStorage.setItem('va-recent',JSON.stringify(a.slice(0,12)))}
function params(){return new URLSearchParams(location.search)}
function initHome(){const q=$('#search'),cat=$('#category'),status=$('#status'),sort=$('#sort'),wrap=$('#cards'),table=$('#ideaTable');VA.categories.forEach(c=>cat.insertAdjacentHTML('beforeend',`<option value="${c.name}">${c.name} (${c.count})</option>`));[...new Set(VA.ideas.map(x=>x.status))].sort().forEach(s=>status.insertAdjacentHTML('beforeend',`<option>${s}</option>`));const u=params();q.value=u.get('q')||'';cat.value=u.get('category')||'';status.value=u.get('status')||'';sort.value=u.get('sort')||'overall';function render(){let xs=[...VA.ideas],term=q.value.toLowerCase().trim();if(term)xs=xs.filter(x=>JSON.stringify(x).toLowerCase().includes(term));if(cat.value)xs=xs.filter(x=>x.category===cat.value);if(status.value)xs=xs.filter(x=>x.status===status.value);const sorters={overall:(a,b)=>b.atAGlance.overallScore-a.atAGlance.overallScore,profit:(a,b)=>b.compositeScores.highestProfitPotential-a.compositeScores.highestProfitPotential,cost:(a,b)=>a.atAGlance.startupCost.midpoint-b.atAGlance.startupCost.midpoint,confidence:(a,b)=>b.scores.overallConfidence.value-a.scores.overallConfidence.value,name:(a,b)=>a.name.localeCompare(b.name),updated:(a,b)=>b.updatedAt.localeCompare(a.updatedAt)};xs.sort(sorters[sort.value]);wrap.innerHTML=xs.map(card).join('')||'<div class="empty">No ideas match these filters.</div>';$('#resultCount').textContent=`${xs.length} ideas`;const usp=new URLSearchParams();if(q.value)usp.set('q',q.value);if(cat.value)usp.set('category',cat.value);if(status.value)usp.set('status',status.value);if(sort.value!=='overall')usp.set('sort',sort.value);history.replaceState(null,'',`${location.pathname}${usp.toString()?'?'+usp:''}#directory`);renderTable(xs)}function renderTable(xs){$('#tbody').innerHTML=xs.map(x=>`<tr><td><a href="${VA.base}/docs/idea.html?id=${x.id}">${x.name}</a></td><td>${x.category}</td><td>${x.atAGlance.targetCustomer}</td><td>${x.atAGlance.overallScore}</td><td>${x.compositeScores.highestProfitPotential}</td><td>${x.atAGlance.timeToMvp}</td><td>${money(x.atAGlance.startupCost)}</td><td>${x.scores.overallConfidence.value}</td></tr>`).join('')}[q,cat,status,sort].forEach(el=>el.addEventListener(el===q?'input':'change',render));$('#reset').onclick=()=>{q.value='';cat.value='';status.value='';sort.value='overall';render()};$('#random').onclick=()=>{const x=VA.ideas[Math.floor(Math.random()*VA.ideas.length)];location.href=`${VA.base}/docs/idea.html?id=${x.id}`};$('#compareSelected').onclick=()=>{const ids=$$('.compareCheck:checked').map(x=>x.value).slice(0,4);if(ids.length<2)return alert('Select at least two ideas.');location.href=`${VA.base}/docs/compare.html?ids=${ids.join(',')}`};$('#cardsView').onclick=()=>{wrap.classList.remove('hidden');table.classList.add('hidden')};$('#tableView').onclick=()=>{wrap.classList.add('hidden');table.classList.remove('hidden')};$('#compactView').onclick=()=>{wrap.classList.remove('hidden');table.classList.add('hidden');wrap.classList.toggle('compact')};render();const top=[...VA.ideas].sort((a,b)=>b.atAGlance.overallScore-a.atAGlance.overallScore).slice(0,5);$('#topIdeas').innerHTML=top.map(x=>`<li><a href="${VA.base}/docs/idea.html?id=${x.id}">${x.name}</a> — ${x.atAGlance.overallScore}</li>`).join('')}
function objSection(title,obj){const entries=Object.entries(obj||{});return `<section class="section"><h2>${title}</h2>${entries.map(([k,v])=>{const label=k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());if(Array.isArray(v))return `<details><summary>${label}</summary><ul>${v.map(z=>`<li>${typeof z==='object'?JSON.stringify(z):z}</li>`).join('')}</ul></details>`;if(v&&typeof v==='object')return `<details><summary>${label}</summary><div class="kv">${Object.entries(v).map(([a,b])=>`<div><b>${a.replace(/([A-Z])/g,' $1')}</b></div><div>${Array.isArray(b)?b.join('; '):typeof b==='object'?JSON.stringify(b):b}</div>`).join('')}</div></details>`;return `<div class="kv"><div><b>${label}</b></div><div>${v}</div></div>`}).join('')}</section>`}
function initIdea(){
  const id=params().get('id');
  const x=VA.ideas.find(y=>y.id===id)||VA.ideas.find(y=>y.slug===id);
  if(!x){$('#idea').innerHTML='<div class="empty">Idea not found.</div>';return;}
  remember(x.id); document.title=x.name+' — Venture Atlas OS';
  $('#crumb').innerHTML='<a href="'+VA.base+'/index.html">Ideas</a> / '+x.category+' / '+x.id;
  const glance=Object.entries(x.atAGlance).map(([k,v])=>'<div><b>'+k.replace(/([A-Z])/g,' $1')+'</b></div><div>'+(typeof v==='object'?money(v):v)+'</div>').join('');
  const scores=Object.entries(x.scores).map(([k,v])=>'<div><b>'+k.replace(/([A-Z])/g,' $1')+' — '+v.value+'/10</b><div class="bar"><span style="width:'+v.value*10+'%"></span></div><p class="muted">'+v.justification+' Confidence: '+v.confidence+'. Basis: '+v.basis+'.</p></div>').join('');
  const related=x.relatedIdeaIds.map(rid=>{const y=VA.ideas.find(z=>z.id===rid);return y?'<li><a href="idea.html?id='+rid+'">'+y.name+'</a></li>':''}).join('');
  let html='<section class="section"><div class="eyebrow">'+x.category+' · '+x.status+' · '+x.id+'</div><h1>'+x.name+'</h1><p class="lede">'+x.oneSentenceConcept+'</p><div class="tagline">'+x.tags.map(t=>'<span class="chip">'+t+'</span>').join('')+'</div><p><button id="favDetail">'+(isFav(x.id)?'★ Favorite':'☆ Favorite')+'</button> <button id="copyLink">Copy link</button> <button id="printPage">Print</button> <a class="button" download href="'+VA.base+'/data/ideas.json">Download JSON</a></p></section>';
  html+='<section class="section"><h2>At a Glance</h2><div class="kv">'+glance+'</div></section>';
  html+=objSection('Customer Perspective',x.customer)+objSection('Product Definition',x.product)+objSection('What Future AI Should Build',x.futureAiBuild)+objSection('Profitability Analysis',x.profitability)+objSection('Earning Potential',x.earningPotential)+objSection('Market and Competition',x.market)+objSection('Validation Plan',x.validation)+objSection('Go-to-Market Strategy',x.goToMarket)+objSection('Build and Operations Plan',x.operations)+objSection('Risks and Failure Modes',x.risks)+objSection('Action Plan',x.actionPlan);
  html+='<section class="section"><h2>Scores</h2>'+scores+'</section><section class="section"><h2>Related Ideas</h2><ul>'+related+'</ul><p><a href="'+VA.base+'/prompts/idea-specific/'+x.id+'/README.md">Open the 25-prompt build pack</a></p></section>';
  $('#idea').innerHTML=html;
  $('#favDetail').onclick=function(){toggleFav(x.id,this)};
  $('#copyLink').onclick=function(){navigator.clipboard.writeText(location.href)};
  $('#printPage').onclick=function(){print()};
}
function initCompare(){const ids=(params().get('ids')||'').split(',').filter(Boolean);const selects=$$('#compareSelect');selects.forEach((s,i)=>{s.innerHTML='<option value="">Choose an idea</option>'+VA.ideas.map(x=>`<option value="${x.id}" ${ids[i]===x.id?'selected':''}>${x.name}</option>`).join('');s.onchange=render});function render(){const xs=selects.map(s=>VA.ideas.find(x=>x.id===s.value)).filter(Boolean);$('#comparison').innerHTML=xs.length?xs.map(x=>`<article class="section"><h2><a href="idea.html?id=${x.id}">${x.name}</a></h2><p>${x.oneSentenceConcept}</p><div class="kv"><div>Customer</div><div>${x.customer.primaryCustomer}</div><div>Problem</div><div>${x.customer.specificProblem}</div><div>Product</div><div>${x.atAGlance.whatToBuild}</div><div>Revenue</div><div>${x.atAGlance.howItMakesMoney}</div><div>Startup</div><div>${money(x.atAGlance.startupCost)}</div><div>MVP</div><div>${x.atAGlance.timeToMvp}</div><div>Overall</div><div>${x.atAGlance.overallScore}</div><div>Confidence</div><div>${x.scores.overallConfidence.value}</div><div>Main risk</div><div>${x.atAGlance.mainRisk}</div><div>Next step</div><div>${x.atAGlance.bestNextValidationStep}</div></div></article>`).join(''):'<div class="empty">Choose two to four ideas.</div>';history.replaceState(null,'','?ids='+selects.map(s=>s.value).filter(Boolean).join(','))}render()}
function initRankings(){const sel=$('#rankingSelect');sel.innerHTML=VA.rankings.map(r=>`<option value="${r.id}">${r.title}</option>`).join('');const wanted=params().get('id');if(wanted)sel.value=wanted;function render(){const r=VA.rankings.find(x=>x.id===sel.value);$('#ranking').innerHTML=`<section class="section"><h1>${r.title}</h1><p>${r.method}</p><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Idea</th><th>Score</th><th>Reason</th></tr></thead><tbody>${r.items.map(it=>`<tr><td>${it.rank}</td><td><a href="idea.html?id=${it.ideaId}">${it.name}</a></td><td>${it.score}</td><td>${it.reason}</td></tr>`).join('')}</tbody></table></div></section>`;history.replaceState(null,'','?id='+sel.value)}sel.onchange=render;render()}
function initPrompts(){const q=$('#promptSearch');function render(){const t=q.value.toLowerCase();const xs=VA.prompts.filter(p=>JSON.stringify(p).toLowerCase().includes(t));$('#promptList').innerHTML=xs.slice(0,500).map(p=>`<article class="card"><div class="eyebrow">${p.type}</div><h3>${p.title}</h3><p class="muted">${p.wordCount} words · ${p.sourceStatus}</p><a class="button" href="${VA.base}/${p.path}">Open prompt</a></article>`).join('');$('#promptCount').textContent=`${xs.length} prompts`}q.oninput=render;render()}
function initGraph(){const svg=$('#graph'),W=1200,H=620;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);const nodes=VA.ideas.slice(0,60).map((x,i)=>({...x,cx:70+(i%10)*116,cy:55+Math.floor(i/10)*98}));const allowed=new Set(nodes.map(x=>x.id));const edges=(VA.relationships||[]).filter(e=>allowed.has(e.source)&&allowed.has(e.target)).slice(0,100);svg.innerHTML=edges.map(e=>{const a=nodes.find(n=>n.id===e.source),b=nodes.find(n=>n.id===e.target);return `<line x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}" stroke="currentColor" opacity=".13"/>`}).join('')+nodes.map(n=>`<a href="idea.html?id=${n.id}"><circle cx="${n.cx}" cy="${n.cy}" r="20" fill="var(--accent2)" stroke="var(--accent)"/><text x="${n.cx}" y="${n.cy+3}" text-anchor="middle" font-size="9" fill="currentColor">${n.id.slice(-3)}</text><title>${n.name}</title></a>`).join('')}
document.addEventListener('DOMContentLoaded',async()=>{await loadData();document.body.insertAdjacentHTML('afterbegin',nav());document.body.insertAdjacentHTML('beforeend',footer());themeInit();const page=document.body.dataset.page;if(page==='home')initHome();if(page==='idea')initIdea();if(page==='compare')initCompare();if(page==='rankings')initRankings();if(page==='prompts')initPrompts();if(page==='relationships')initGraph();$$('[data-total-ideas]').forEach(x=>x.textContent=VA.ideas.length);$$('[data-total-prompts]').forEach(x=>x.textContent=VA.prompts.length);$$('[data-total-sources]').forEach(x=>x.textContent=VA.sources.length);$$('[data-total-categories]').forEach(x=>x.textContent=VA.categories.length)})
'''
w('assets/js/site.js',js)

head=lambda title,root='..':f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Venture Atlas OS — evidence-aware business idea research, rankings, prompts, and build plans."><title>{esc(title)}</title><link rel="stylesheet" href="{root}/assets/css/site.css"><link rel="manifest" href="{root}/manifest.webmanifest"></head>'''

home=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Browse 60 evidence-aware business ideas, rankings, prompt packs, financial scenarios, and build plans."><title>Venture Atlas OS</title><link rel="stylesheet" href="./assets/css/site.css"><link rel="manifest" href="./manifest.webmanifest"></head><body data-page="home" data-root="."><main id="main"><section class="hero"><div><div class="eyebrow">Opportunity database · research library · AI venture studio OS</div><h1>Ideas you can inspect, challenge, compare, and build.</h1><p class="lede">A transparent repository of canonical ideas, preserved variants, customer problems, profitability conditions, validation plans, scores, evidence labels, and 25 prompts for every idea.</p><p><a class="button primary" href="#directory">Browse all ideas</a> <a class="button" href="./docs/methodology.html">Read methodology</a></p><div class="notice">Scores are decision-support tools. Revenue ranges are scenarios, not promises. The completeness audit openly lists inaccessible material.</div></div><div><h2>Repository coverage</h2><div class="metrics"><div class="metric"><strong data-total-ideas>—</strong>canonical ideas</div><div class="metric"><strong data-total-categories>—</strong>categories</div><div class="metric"><strong data-total-prompts>—</strong>prompts</div><div class="metric"><strong data-total-sources>—</strong>source records</div></div><h3>Top opportunities</h3><ol id="topIdeas"></ol></div></section><section id="directory"><h2>Idea directory</h2><div class="toolbar"><input id="search" type="search" placeholder="Search ideas, customers, problems, technology, prompts…" aria-label="Search ideas"><select id="category" aria-label="Filter by category"><option value="">All categories</option></select><select id="status" aria-label="Filter by status"><option value="">All statuses</option></select><select id="sort" aria-label="Sort ideas"><option value="overall">Overall score</option><option value="profit">Profit potential</option><option value="cost">Lowest startup cost</option><option value="confidence">Confidence</option><option value="name">Name</option><option value="updated">Recently updated</option></select></div><div class="viewbar"><strong id="resultCount"></strong><button id="cardsView">Cards</button><button id="tableView">Table</button><button id="compactView">Compact</button><button id="reset">Reset filters</button><button id="random">Random idea</button><button id="compareSelected" class="primary">Compare selected</button><a class="button" download href="./data/ideas.csv">CSV</a><a class="button" download href="./data/ideas.json">JSON</a></div><div id="cards" class="cards"></div><div id="ideaTable" class="table-wrap hidden"><table><thead><tr><th>Idea</th><th>Category</th><th>Customer</th><th>Overall</th><th>Profit</th><th>MVP</th><th>Startup</th><th>Confidence</th></tr></thead><tbody id="tbody"></tbody></table></div></section></main><noscript><main><div class="notice">JavaScript is disabled. Browse the Markdown idea library at <a href="./ideas/README.md">ideas/README.md</a> or download <a href="./data/ideas.csv">ideas.csv</a>.</div></main></noscript><script src="./assets/js/site.js"></script></body></html>'''
w('index.html',home)
w('404.html',home.replace('<title>Venture Atlas OS</title>','<title>Not Found — Venture Atlas OS</title>'))

def page(path,title,body,pageid='',root='..'):
    w(path,head(title,root)+f'<body data-page="{pageid}" data-root="{root}"><main id="main">{body}</main><script src="{root}/assets/js/site.js"></script></body></html>')
page('docs/idea.html','Idea — Venture Atlas OS','<div id="crumb" class="breadcrumbs"></div><div id="idea"></div>','idea')
page('docs/compare.html','Compare Ideas — Venture Atlas OS','<section class="section"><h1>Compare ideas</h1><p>Scores support discussion; they do not decide personal fit.</p><div class="toolbar"><select id="compareSelect"></select><select id="compareSelect"></select><select id="compareSelect"></select><select id="compareSelect"></select></div></section><div id="comparison" class="compare-grid"></div>','compare')
page('docs/rankings.html','Rankings — Venture Atlas OS','<section class="section"><h1>Ranking views</h1><p>Choose a decision lens. Each view uses documented subjective weights.</p><select id="rankingSelect"></select></section><div id="ranking"></div>','rankings')
page('docs/prompts.html','Prompt Library — Venture Atlas OS','<section class="section"><h1>Prompt library</h1><p><span data-total-prompts>—</span> context-bound prompts. Every prompt requires evidence labels and forbids invented facts.</p><input id="promptSearch" type="search" placeholder="Search prompts…"><strong id="promptCount"></strong></section><div id="promptList" class="cards"></div>','prompts')
page('docs/relationships.html','Relationship Map — Venture Atlas OS','<section class="section"><h1>Idea relationship map</h1><p>Nodes are canonical ideas; lines indicate similar, complementary, shared-infrastructure, bundle, cross-sell, or service-to-software relationships. Select a node to open it.</p><svg id="graph" class="graph" role="img" aria-label="Idea relationship network"></svg></section>','relationships')
page('docs/methodology.html','Methodology — Venture Atlas OS','<section class="section"><h1>Methodology</h1><p>The repository separates source facts, user claims, analyst interpretations, assumptions, projections, and unknowns. It maps problems before solutions, preserves rejected variants, scores transparently, red-teams leaders, and prioritizes paid falsification before broad implementation.</p><h2>Scoring</h2><p>Twenty-five 0–10 dimensions feed multiple weighted profiles. Higher always means more attractive because negative concepts are normalized into positive forms such as regulatory simplicity and competitive advantage.</p><p><a href="../research/scoring-methodology.md">Full scoring methodology</a> · <a href="../research/completeness-audit.md">Completeness audit</a></p><h2>Financial interpretation</h2><p>All financial values are editable scenarios. They are not forecasts, guarantees, valuations, or advice.</p></section>')
page('docs/about.html','About — Venture Atlas OS','<section class="section"><h1>About Venture Atlas OS</h1><p>This project turns fragmented research, prompts, ideas, and build plans into a browsable, machine-readable, evidence-aware venture studio repository.</p><div class="metrics"><div class="metric"><strong data-total-ideas>—</strong>ideas</div><div class="metric"><strong data-total-prompts>—</strong>prompts</div><div class="metric"><strong data-total-sources>—</strong>sources</div><div class="metric"><strong data-total-categories>—</strong>categories</div></div><h2>Limitations</h2><p>A full verbatim conversation export was not available. Some File Library reports were accessible only through truncated rendered views. The project therefore does not claim transcript-level completeness.</p><h2>Disclaimers</h2><p>Scores are decision-support tools, not guarantees. Revenue projections are scenarios. Market conditions change. Source quality varies. Independent financial, legal, tax, technical, security, and market due diligence is required. AI-generated analysis may contain errors. Never commit private or sensitive information to a public repository.</p></section>')
page('docs/index.html','Documentation — Venture Atlas OS','<section class="section"><h1>Documentation</h1><ul><li><a href="idea.html">Idea viewer</a></li><li><a href="compare.html">Comparison tool</a></li><li><a href="rankings.html">Rankings</a></li><li><a href="prompts.html">Prompt library</a></li><li><a href="relationships.html">Relationship map</a></li><li><a href="methodology.html">Methodology</a></li><li><a href="about.html">About and limitations</a></li></ul></section>')

w('manifest.webmanifest',json.dumps({'name':'Venture Atlas OS','short_name':'Venture Atlas','start_url':'./index.html','display':'standalone','background_color':'#f6f7f9','theme_color':'#17664a','icons':[]},indent=2))
w('robots.txt','User-agent: *\nAllow: /\nSitemap: sitemap.xml')
urls=['index.html','docs/index.html','docs/compare.html','docs/rankings.html','docs/prompts.html','docs/methodology.html','docs/about.html']
w('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(f'<url><loc>https://USERNAME.github.io/REPOSITORY/{u}</loc></url>' for u in urls)+'\n</urlset>')
# ---------- repository operations, governance, workflows ----------
master=(OLD/'prompts/research/MASTER_VENTURE_RESEARCH.md').read_text(encoding='utf-8')
w('prompts/master-research-prompt.md',master)
w('prompts/original-prompts.md','# Original Prompts\n\nThe original prompt inventory is represented by `data/sources.json`. Exact local bytes were available for the Master Venture Research prompt. Several larger File Library prompts were accessible only as rendered excerpts and therefore are not falsely reproduced as verbatim. See `research/original-chat/ACCESS_GAPS.md`.')
w('prompts/reconstructed-repository-build-prompt.md','# Reconstructed Master Repository-Build Prompt\n\n> **Status: reconstructed from the current user request; not represented as a byte-perfect export.**\n\nBuild a static GitHub Pages repository that inventories every accessible source, extracts and canonicalizes every idea while preserving variants, creates a complete customer/product/economics/market/validation/GTM/operations/risk/action dossier for each idea, generates transparent scores and multiple rankings, creates 25 evidence-aware prompts per idea, archives source provenance and access gaps, publishes machine-readable JSON/CSV/schema data, implements search/filter/sort/favorites/recent/comparison/ranking/category/relationship views, validates links and IDs, and produces an honest completeness report. Never invent sources, market facts, or certainty. Label facts, claims, assumptions, projections, and unknowns separately.')
w('prompts/README.md','# Prompt Library\n\n- [`master-research-prompt.md`](master-research-prompt.md) — recoverable master venture-research prompt.\n- [`reconstructed-repository-build-prompt.md`](reconstructed-repository-build-prompt.md) — repository-generation specification, clearly labeled reconstructed.\n- [`idea-specific/`](idea-specific/) — 25 prompts for each of 60 canonical ideas.\n\nEvery generated prompt carries the idea context and forbids unsupported facts.')
# Requested topical prompt indexes.
for filename,types in {
'research-prompts.md':['deep-market-research','competitor-analysis','data-integrations'],
'validation-prompts.md':['customer-discovery','validation-experiment','risk-premortem'],
'product-design-prompts.md':['product-requirements','ux-design'],
'coding-prompts.md':['technical-architecture','mvp-coding','ai-agent-design','security-privacy'],
'marketing-prompts.md':['landing-page','seo-plan','launch-plan'],
'sales-prompts.md':['outbound-sales','go-to-market','pricing-research'],
'operations-prompts.md':['operations-automation','weekly-kpi','scale-up'],
'financial-modeling-prompts.md':['unit-economics','financial-model'],
}.items():
    arr=[p for p in prompt_index if p['type'] in types]
    w('prompts/'+filename,'# '+filename.replace('.md','').replace('-',' ').title()+'\n\n'+'\n'.join(f"- [{p['title']}]({p['path'].replace('prompts/','')})" for p in arr))

# Node validation and generation scripts.
validate_js=r'''const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ideas=read('data/ideas.json'), sources=read('data/sources.json'), ranks=read('data/rankings.json'), prompts=read('data/prompts.json'), rels=read('data/relationships.json');
const errors=[],warnings=[]; const ids=new Set(),slugs=new Set(),sourceIds=new Set(sources.map(x=>x.id));
const required=['id','slug','name','atAGlance','customer','product','futureAiBuild','profitability','market','validation','goToMarket','operations','risks','actionPlan','scores','compositeScores','sourceReferences'];
for(const x of ideas){for(const k of required)if(!(k in x))errors.push(`${x.id||'?'} missing ${k}`);if(ids.has(x.id))errors.push(`duplicate id ${x.id}`);ids.add(x.id);if(slugs.has(x.slug))errors.push(`duplicate slug ${x.slug}`);slugs.add(x.slug);if(!/^idea-\d{3}$/.test(x.id))errors.push(`bad id ${x.id}`);if(Object.keys(x.scores||{}).length!==25)errors.push(`${x.id} score count`);for(const s of x.sourceReferences||[])if(!sourceIds.has(s))errors.push(`${x.id} missing source ${s}`);const md=path.join(root,'ideas',x.slug+'.md');if(!fs.existsSync(md))errors.push(`missing dossier ${x.slug}`);const pack=path.join(root,'prompts','idea-specific',x.id);if(!fs.existsSync(pack))errors.push(`missing prompt pack ${x.id}`);else{const n=fs.readdirSync(pack).filter(f=>f.endsWith('.md')&&f!=='README.md').length;if(n!==25)errors.push(`${x.id} has ${n} prompts`)}}
for(const r of ranks)for(const it of r.items)if(!ids.has(it.ideaId))errors.push(`ranking ${r.id} unknown ${it.ideaId}`);
for(const e of rels)if(!ids.has(e.source)||!ids.has(e.target))errors.push(`bad relationship ${e.source} ${e.target}`);
if(prompts.length!==ideas.length*25)errors.push(`prompt index ${prompts.length} expected ${ideas.length*25}`);
console.log(JSON.stringify({ideas:ideas.length,sources:sources.length,rankings:ranks.length,prompts:prompts.length,errors,warnings},null,2));if(errors.length)process.exit(1);'''
w('scripts/validate-data.js',validate_js)
w('scripts/calculate-rankings.js',"const fs=require('fs'),path=require('path'); const root=path.resolve(__dirname,'..'); const r=JSON.parse(fs.readFileSync(path.join(root,'data/rankings.json'))); console.log(`Rankings already generated: ${r.length}. Regenerate the repository with generate_repository.py after changing score profiles.`);")
w('scripts/build-search-index.js',"const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');const ideas=JSON.parse(fs.readFileSync(path.join(root,'data/ideas.json')));const out=ideas.map(x=>({id:x.id,slug:x.slug,name:x.name,text:JSON.stringify(x).toLowerCase()}));fs.writeFileSync(path.join(root,'data/search-index.json'),JSON.stringify(out,null,2));console.log(`Wrote ${out.length} search records`);")
w('scripts/generate-pages.js',"console.log('Pages are generated by scripts/generate_repository.py to keep data, Markdown, and HTML synchronized.');")
w('scripts/check-links.js',r'''const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..'),errors=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()&&!['.git','node_modules'].includes(e.name))walk(p);else if(/\.(md|html)$/.test(e.name)){const s=fs.readFileSync(p,'utf8');for(const m of s.matchAll(/(?:href=|\]\()"?([^"\)\s#]+)(?:"|\))/g)){let u=m[1];if(/^(https?:|mailto:|javascript:|data:)/.test(u)||u.includes('${')||u.startsWith('?'))continue;u=u.split('?')[0];const target=path.resolve(path.dirname(p),u);if(!fs.existsSync(target))errors.push(`${path.relative(root,p)} -> ${u}`)}}}}walk(root);console.log(errors.length?errors.join('\n'):'Internal link check passed');if(errors.length)process.exit(1);''')
w('scripts/validate-schema.py',"""import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
ideas=json.loads((root/'data/ideas.json').read_text())
errs=[]
for x in ideas:
    if not re.fullmatch(r'idea-\\d{3}',x.get('id','')): errs.append('bad id '+x.get('id','?'))
    if len(x.get('scores',{}))!=25: errs.append(x.get('id','?')+' must have 25 scores')
print(json.dumps({'ideas':len(ideas),'errors':errs},indent=2))
sys.exit(bool(errs))
""")
# Put a reproducible copy of this generator inside the repo.
try: generator_source=Path(__file__).read_text(encoding='utf-8')
except Exception: generator_source='# Generator source unavailable.\n'
w('scripts/generate_repository.py',generator_source)

w('tests/smoke.test.js',r'''const fs=require('fs'),path=require('path'),assert=require('assert');const root=path.resolve(__dirname,'..');for(const p of ['index.html','assets/css/site.css','assets/js/site.js','data/ideas.json','data/rankings.json','docs/idea.html'])assert(fs.existsSync(path.join(root,p)),p);const ideas=JSON.parse(fs.readFileSync(path.join(root,'data/ideas.json')));assert(ideas.length>=60);assert(ideas.every(x=>Object.keys(x.scores).length===25));assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('Idea directory'));console.log('Smoke tests passed');''')
w('package.json',json.dumps({'name':'venture-atlas-os','version':VERSION,'private':True,'description':'Static evidence-aware venture idea research repository and GitHub Pages site','scripts':{'test':'node tests/smoke.test.js','validate':'node scripts/validate-data.js && python scripts/validate-schema.py','check-links':'node scripts/check-links.js','build-search':'node scripts/build-search-index.js','check-js':'node --check assets/js/site.js'}},indent=2))
w('.github/workflows/deploy-pages.yml',r'''name: Validate and deploy Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: {node-version: 22}
      - uses: actions/setup-python@v7
        with: {python-version: '3.12'}
      - run: npm test
      - run: npm run validate
      - run: npm run check-js
      - run: npm run check-links
  deploy:
    needs: validate
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: {path: .}
      - id: deployment
        uses: actions/deploy-pages@v4
''')
w('.github/workflows/validate-data.yml',r'''name: Validate data
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: {node-version: 22}
      - uses: actions/setup-python@v7
        with: {python-version: '3.12'}
      - run: npm test
      - run: npm run validate
      - run: npm run check-js
''')
w('.github/workflows/check-links.yml',r'''name: Check links
on:
  pull_request:
  schedule:
    - cron: '20 5 * * 1'
jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: {node-version: 22}
      - run: npm run check-links
''')
w('.github/ISSUE_TEMPLATE/new-idea.yml',r'''name: Add an idea
description: Propose a new idea or recover a missing variant
title: "idea: "
labels: [idea]
body:
  - type: textarea
    id: source
    attributes: {label: Source and original wording, description: Include provenance without secrets or personal data.}
    validations: {required: true}
  - type: textarea
    id: concept
    attributes: {label: Customer, problem, product, payment, distribution}
    validations: {required: true}
  - type: textarea
    id: evidence
    attributes: {label: Supporting and contradictory evidence}
''')
w('.github/pull_request_template.md','## What changed\n\n## Source/provenance impact\n\n## Scores/rankings affected\n\n## Validation\n\n- [ ] `npm test`\n- [ ] `npm run validate`\n- [ ] `npm run check-links`\n- [ ] No secrets or sensitive personal data\n')

license_text='''MIT License\n\nCopyright (c) 2026 Venture Atlas OS contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.\n'''
w('LICENSE',license_text)
w('CONTRIBUTING.md','# Contributing\n\n1. Do not add secrets, personal data, or copyrighted full-text sources without permission.\n2. Preserve original wording and provenance in the extraction ledger.\n3. Do not merge materially distinct ideas merely because their names overlap.\n4. Label facts, claims, assumptions, estimates, and unknowns.\n5. Add contradictory evidence and a falsification test.\n6. Run `npm test`, `npm run validate`, and `npm run check-links`.')
w('CODE_OF_CONDUCT.md','# Code of Conduct\n\nBe respectful, evidence-oriented, and transparent. Critique ideas and methods rather than people. Do not expose private information, fabricate evidence, manipulate rankings, or present projections as guarantees. Maintainers may remove abusive, deceptive, unsafe, or privacy-violating contributions.')
w('SECURITY.md','# Security Policy\n\nReport security issues privately to the repository owner. Do not open public issues containing secrets, tokens, private datasets, or exploit details that would endanger users. The static site stores favorites and recent items only in local browser storage. Review all imported chat files for credentials and sensitive personal data before committing.')
w('CHANGELOG.md','# Changelog\n\n## 2.0.0 — 2026-08-05\n\n- Rebuilt the repository from the recoverable seven-file v1 package.\n- Expanded to 60 canonical idea dossiers and 25 prompts per idea.\n- Added extraction ledger, source inventory, schema, CSV, 30 rankings, sensitivity analysis, relationship data, financial/validation/technical/launch packs, static website, scripts, tests, and GitHub Pages workflows.\n- Added explicit access gaps and completeness limits.\n\n## 1.0.0\n\n- Initial seven-file artifact with 50 lightly structured ideas.')
w('CITATION.cff',f'''cff-version: 1.2.0\ntitle: Venture Atlas OS\nmessage: If you use this repository, cite this version and preserve source/provenance labels.\ntype: software\nversion: {VERSION}\ndate-released: 2026-08-05\nlicense: MIT\nauthors:\n  - name: Venture Atlas OS contributors\n''')
w('docs/IMPORTING_CONVERSATIONS.md','# Importing Conversations Safely\n\n1. Export only material you have the right to publish.\n2. Work on a private branch first.\n3. Remove API keys, passwords, cookies, tokens, financial-account details, addresses, phone numbers, academic identifiers, health information, and unnecessary personal data.\n4. Preserve timestamps, source IDs, exact wording, and redaction markers.\n5. Add each raw mention to `data/extraction-ledger.json`.\n6. Link canonical ideas without deleting variants.\n7. Update `data/sources.json` and the completeness audit.\n8. Run all validation scripts.\n\nDeleted Git content remains in history. Rotate any credential that was ever committed.')
w('docs/DATA_MODEL.md','# Data Model\n\n`data/ideas.json` is canonical. Every record has stable ID/slug, identity/provenance, at-a-glance summary, customer, product, future-AI build spec, profitability and three scenarios, earning potential, market, validation, GTM, operations, risks, action plan, 25 score records, composite scores, assumptions, unknowns, evidence, timestamps, and relationships. Unknown values are explicit rather than fabricated.')
w('docs/ADDING_AN_IDEA.md','# Adding an Idea\n\n1. Add source inventory and exact raw mention.\n2. Choose a stable `idea-NNN` ID and slug.\n3. Preserve all variants and overlap notes.\n4. Complete every required field or use `Unknown — requires validation`.\n5. Add 25 scores with justification/confidence/basis.\n6. Generate the dossier and 25 prompt files.\n7. Recalculate rankings and relationships.\n8. Run validation and review the completeness counts.')
w('docs/TROUBLESHOOTING.md','# Troubleshooting\n\n- **JSON fetch fails locally:** use `python -m http.server 8000`; do not open `index.html` directly with `file://`.\n- **GitHub Pages 404:** deploy the repository root and choose GitHub Actions in Settings → Pages.\n- **Subpath assets fail:** keep relative paths and `data-root` attributes unchanged.\n- **Validation fails:** run `npm run validate` and fix the first reported ID, source, dossier, prompt-pack, ranking, or relationship error.\n- **Link check flags a dynamic URL:** use relative static paths or explicitly update the checker only when the link is truly dynamic.')

readme=f'''# Venture Atlas OS\n\nA static, dependency-light GitHub Pages repository that turns fragmented research into a transparent opportunity database, startup research library, product-building playbook, and AI venture studio operating system.\n\n## Current inventory\n\n- **{len(ideas)} canonical ideas**\n- **{len(ledger)} raw idea/name/variant mentions**\n- **{len(categories)} categories**\n- **{len(prompt_index)} idea-specific prompts** plus master prompts\n- **{len(rankings)} ranking views**\n- **{len(sources)} source inventory records**\n- One full Markdown dossier, financial model, validation plan, technical blueprint, launch plan, and 25-prompt pack per canonical idea\n\n## What the site supports\n\nSearch, category/status filters, sorting, card/table/compact views, favorites, recently viewed records, comparison, ranking views, relationship map, shareable query parameters, JSON/CSV downloads, dark/light mode, print layouts, keyboard navigation, and a no-JavaScript path to Markdown/CSV.\n\n## Evidence and limitations\n\nThe repository distinguishes source facts, user claims, analyst interpretations, assumptions, projections, and unknowns. It **does not claim a perfect chat-history extraction**: the earlier artifact had only seven files, a complete verbatim transcript was unavailable, and several File Library reports were accessible only through truncated rendered views. See [`research/completeness-audit.md`](research/completeness-audit.md).\n\nScores are decision-support tools, not guarantees. Revenue ranges are scenarios, not promises. Market conditions change. Users must perform independent financial, legal, technical, tax, security, privacy, and market due diligence.\n\n## Run locally\n\n```bash\npython -m http.server 8000\n# open http://localhost:8000\n```\n\nValidation:\n\n```bash\nnpm test\nnpm run validate\nnpm run check-js\nnpm run check-links\n```\n\n## Deploy to GitHub Pages\n\n1. Create a repository and copy this directory to its root.\n2. Commit and push to `main`.\n3. Open **Settings → Pages** and choose **GitHub Actions**.\n4. Run **Validate and deploy Pages** or push to `main`.\n5. Edit `sitemap.xml` to replace `USERNAME/REPOSITORY`.\n\nThe workflow validates data, JavaScript, links, and smoke tests before deployment. No paid hosting or server is required.\n\n## Update data\n\n- Canonical records: [`data/ideas.json`](data/ideas.json)\n- JSON Schema: [`data/ideas.schema.json`](data/ideas.schema.json)\n- Extraction ledger: [`data/extraction-ledger.json`](data/extraction-ledger.json)\n- Sources: [`data/sources.json`](data/sources.json)\n- Scores: [`research/scoring-methodology.md`](research/scoring-methodology.md)\n- Add an idea: [`docs/ADDING_AN_IDEA.md`](docs/ADDING_AN_IDEA.md)\n\n## Structure\n\n```text\nassets/                 CSS and JavaScript\ndata/                   canonical JSON, CSV, schema, rankings, sources, prompts, relationships\nideas/                  one full dossier per canonical idea\ncategories/             category indexes\nrankings/               30 reproducible ranking views\nprompts/                master and 25-per-idea prompt library\nresearch/               methodology, source log, assumptions, completeness audit, archive gaps\nfinancial-models/       compact financial model per idea\nvalidation-plans/       validation plan per idea\ntechnical-blueprints/   future-AI implementation blueprint per idea\nlaunch-plans/           GTM and action plan per idea\ndocs/                   visitor-facing static pages and maintenance documentation\nscripts/                generator, validation, search, ranking and link scripts\ntests/                  smoke tests\n.github/workflows/       pull-request validation and Pages deployment\n```\n\n## Contributing and licence\n\nSee [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and the MIT [`LICENSE`](LICENSE). Report factual errors or missing variants through an issue with source/provenance details.\n'''
w('README.md',readme)

# Project status and manifest.
file_count=sum(1 for p in ROOT.rglob('*') if p.is_file())
status=f'''# PROJECT STATUS\n\n- Repository version: {VERSION}\n- Data schema version: 2.0.0\n- Total planned files for this generated build: {file_count}\n- Completed files: {file_count}\n- Remaining generated files: 0\n- Validation status: pending execution\n- Known gaps: full verbatim transcript and complete File Library byte streams unavailable\n- Last completed idea ID: {ideas[-1]['id']}\n- Next idea ID: idea-{len(ideas)+1:03d}\n- Canonical ideas: {len(ideas)}\n- Raw mentions/variants: {len(ledger)}\n- Prompt index records: {len(prompt_index)}\n- Last updated: {NOW}\n'''
w('PROJECT_STATUS.md',status)
manifest=[]
for p in sorted(ROOT.rglob('*')):
    if p.is_file(): manifest.append({'path':str(p.relative_to(ROOT)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
j('data/file-manifest.json',manifest)
# Refresh counts after status/manifest are present.
print(json.dumps({'root':str(ROOT),'ideas':len(ideas),'mentions':len(ledger),'prompts':len(prompt_index),'rankings':len(rankings),'sources':len(sources),'files':sum(1 for p in ROOT.rglob('*') if p.is_file())},indent=2))
