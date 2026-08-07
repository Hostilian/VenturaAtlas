#!/usr/bin/env python3
"""
Generate full dossier Markdown files for Eighth Reset ideas (idea-062 through idea-070).
These ideas currently have shorter dossiers (~28-30KB) vs the standard ~36KB.
This script generates the full dossier format matching ideas 001-060.
"""

import json
import os
import sys

def get_status_label(status):
    STATUS_MAP = {
        'priority': 'priority',
        'shortlisted': 'shortlisted',
        'researched': 'researched',
        'explore': 'explore',
        'archived': 'archived',
    }
    return STATUS_MAP.get(status, status or 'researched')

def fmt_money(val):
    if val is None:
        return 'Unknown'
    if isinstance(val, (int, float)):
        if val >= 1_000_000:
            return f'${val/1_000_000:.1f}M'
        if val >= 1000:
            return f'${val/1000:.0f}k'
        return f'${val:.0f}'
    return str(val)

def fmt_list(items, bullet='- '):
    if not items:
        return bullet + 'Not specified\n'
    if isinstance(items, str):
        return bullet + items + '\n'
    return ''.join(f'{bullet}{i}\n' for i in items)

def safe_get(d, *keys, default=''):
    """Safely navigate nested dicts."""
    cur = d
    for k in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(k, default)
    return cur if cur is not None else default

def generate_dossier(idea, all_ideas_map):
    """Generate a full dossier Markdown for the given idea dict."""
    id_ = idea.get('id', '')
    slug = idea.get('slug', '')
    name = idea.get('name', 'Unknown Idea')
    one_sentence = idea.get('oneSentenceConcept', '')
    elevator = idea.get('elevatorPitch', '')
    detailed = idea.get('detailedDescription', '')
    category = idea.get('category', '')
    subcategory = idea.get('subcategory', '')
    tags = idea.get('tags', [])
    alt_names = idea.get('alternativeNames', [])
    legacy_id = idea.get('legacyId', '')
    status = idea.get('status', 'researched')
    source_refs = idea.get('sourceReferences', [])
    provenance = idea.get('provenance', {})
    related_ids = idea.get('relatedIdeaIds', [])

    ag = idea.get('atAGlance', {})
    cust = idea.get('customer', {})
    prod = idea.get('product', {})
    fut = idea.get('futureAiBuild', {})
    prof = idea.get('profitability', {})
    earn = idea.get('earningPotential', {})
    market = idea.get('market', {})
    validation = idea.get('validation', {})
    gtm = idea.get('goToMarket', {})
    ops = idea.get('operations', {})
    risks = idea.get('risks', {})
    action = idea.get('actionPlan', {})
    scores = idea.get('scores', {})
    composite = idea.get('compositeScores', {})
    assumptions = idea.get('assumptions', [])
    unknowns = idea.get('unknowns', [])
    evidence_list = idea.get('evidence', [])

    overall_score = ag.get('overallScore') or composite.get('overallOpportunity', '')
    confidence_score = ag.get('confidenceScore', '')
    if isinstance(confidence_score, (int, float)):
        confidence_display = f'{confidence_score}/10'
    else:
        confidence_display = str(confidence_score) if confidence_score else ''

    startup_cost = ag.get('startupCost', {})
    if isinstance(startup_cost, dict):
        cur = startup_cost.get('currency', 'EUR')
        mn = startup_cost.get('minimum', 0)
        mx = startup_cost.get('maximum', '')
        startup_cost_str = f'{cur} {mn}–{mx}' if mx else f'{cur} {mn}+'
    else:
        startup_cost_str = str(startup_cost)

    earn_pot = ag.get('estimatedEarningPotential', {})
    if isinstance(earn_pot, dict):
        cur = earn_pot.get('currency', 'USD')
        mn = earn_pot.get('minimum', '')
        mx = earn_pot.get('maximum', '')
        md = earn_pot.get('midpoint', '')
        earn_str = f'{cur} {mn}–{mx} annual scenario range; not a forecast' if mn and mx else f'{cur} scenario range; not a forecast'
    else:
        earn_str = str(earn_pot) if earn_pot else 'USD scenario range; not a forecast'

    prov_status = provenance.get('sourceType', 'Deep Research Eighth Full Reset')
    source_refs_str = ', '.join(source_refs) if source_refs else ''

    # Related ideas lookup — we'll just use ids for now
    def related_links(ids, all_ideas_map):
        links = []
        for rid in ids:
            ridea = all_ideas_map.get(rid, {})
            rslug = ridea.get('slug', rid)
            rname = ridea.get('name', rid)
            links.append(f'- [{rid} - {rname}]({rslug}.md)')
        return '\n'.join(links)

    # Financial scenarios
    scenarios = prof.get('scenarios', [])
    if scenarios and isinstance(scenarios, list) and len(scenarios) > 0 and isinstance(scenarios[0], dict):
        scenario_rows = ''
        for s in scenarios:
            if isinstance(s, dict):
                scenario_rows += (
                    f"| {s.get('name', chr(8212))} "
                    f"| {s.get('customers', chr(8212))} "
                    f"| {s.get('monthlyArpc') or s.get('monthlyPrice', chr(8212))} "
                    f"| {s.get('monthlyRevenue', chr(8212))} "
                    f"| {s.get('annualRevenue', chr(8212))} "
                    f"| {s.get('grossMargin', chr(8212))} "
                    f"| {s.get('monthlyOperatingCosts', chr(8212))} "
                    f"| {s.get('monthlyProfit', chr(8212))} |\n"
                )
    else:
        # Generate plausible scenarios from profitability data
        arpc = prof.get('expectedArpc', '€20–€50')
        gm = prof.get('grossMarginPotential', '60–75%')
        scenario_rows = f"""| Conservative | 5 | {arpc} | — | — | {gm} | — | — |
| Base | 25 | {arpc} | — | — | {gm} | — | — |
| Aggressive | 100 | {arpc} | — | — | {gm} | — | — |
"""

    # Scores table
    score_rows = ''
    score_dim_labels = {
        'problemSeverity': 'problemSeverity',
        'frequencyOfNeed': 'frequencyOfNeed',
        'willingnessToPay': 'willingnessToPay',
        'marketDemand': 'marketDemand',
        'marketGrowth': 'marketGrowth',
        'revenuePotential': 'revenuePotential',
        'recurringRevenuePotential': 'recurringRevenuePotential',
        'grossMarginPotential': 'grossMarginPotential',
        'speedToFirstRevenue': 'speedToFirstRevenue',
        'lowStartupCost': 'lowStartupCost',
        'easeOfMvp': 'easeOfMvp',
        'aiAutomationPotential': 'aiAutomationPotential',
        'easeOfDistribution': 'easeOfDistribution',
        'retentionPotential': 'retentionPotential',
        'competitiveAdvantage': 'competitiveAdvantage',
        'defensibility': 'defensibility',
        'dataAdvantagePotential': 'dataAdvantagePotential',
        'scalability': 'scalability',
        'founderAccessibility': 'founderAccessibility',
        'regulatorySimplicity': 'regulatorySimplicity',
        'operationalSimplicity': 'operationalSimplicity',
        'globalPotential': 'globalPotential',
        'timing': 'timing',
        'evidenceQuality': 'evidenceQuality',
        'overallConfidence': 'overallConfidence',
    }
    for dim, label in score_dim_labels.items():
        s = scores.get(dim, {})
        if isinstance(s, dict):
            val = s.get('value', '—')
            conf = s.get('confidence', 'medium')
            just = s.get('justification', '—')
        elif isinstance(s, (int, float)):
            val = s
            conf = 'medium'
            just = '—'
        else:
            continue
        score_rows += f'| {label} | {val} | {conf} | {just} |\n'

    # Composite scores
    composite_lines = ''
    composite_label_map = {
        'overallOpportunity': 'Overall Opportunity',
        'bootstrappedPotential': 'Bootstrap Potential',
        'soloFounderPotential': 'Solo Founder Potential',
        'aiAgentPotential': 'Ai Agent Potential',
        'fastestPathToRevenue': 'Fastest Revenue',
        'highestProfitPotential': 'Highest Profit Potential',
        'lowestCostLaunch': 'Lowest Cost Launch',
        'bestRecurringRevenue': 'Recurring Revenue',
        'bestEnterpriseOpportunity': 'Enterprise Opportunity',
        'bestConsumerOpportunity': 'Consumer Opportunity',
        'bestLocalOpportunity': 'Local Business Opportunity',
        'bestMarketplaceOpportunity': 'Marketplace Opportunity',
        'bestLongTermDefensibility': 'Long Term Defensibility',
        'bestForNontechnicalFounder': 'Nontechnical Founder',
        'bestForTechnicalFounder': 'Technical Founder',
        'bestForSmallTeam': 'Small Team',
        'bestRequiringLittleCapital': 'Little Capital',
    }
    for key, label in composite_label_map.items():
        val = composite.get(key)
        if val is not None:
            composite_lines += f'- **{label}:** {val}/100\n'

    # Evidence
    ev_lines = ''
    if evidence_list:
        for e in evidence_list:
            if isinstance(e, dict):
                ev_lines += f"- {e.get('type','source_record')} — {e.get('description','—')} ({e.get('strength','medium')})\n"
            else:
                ev_lines += f'- {e}\n'
    else:
        ev_lines = '- source_record - The concept appears in the Deep Research Eighth Full Reset corpus. (medium)\n'
        ev_lines += '- analyst_interpretation - The enriched analysis was generated from the concept and methodology. (low-medium)\n'

    # Assumptions
    if assumptions and isinstance(assumptions, list):
        assumptions_lines = fmt_list(assumptions)
    else:
        assumptions_lines = (
            '- All financial numbers are editable analyst scenarios, not promises.\n'
            '- Market size is intentionally left unknown without source-backed bottom-up research.\n'
            '- Direct competitor and current price facts require fresh verification.\n'
        )

    # Unknowns
    if unknowns and isinstance(unknowns, list):
        unknowns_lines = fmt_list(unknowns)
    else:
        unknowns_lines = (
            '- Actual accessible market size\n'
            '- Buyer prepayment rate and willingness to pay\n'
            '- Channel conversion rates\n'
            '- Repeat purchase frequency\n'
            '- Support and review burden per transaction\n'
        )

    # Market section
    competitors = market.get('directCompetitors', [])
    if isinstance(competitors, list) and competitors:
        comp_str = fmt_list(competitors)
    else:
        comp_str = '- Unknown — requires current competitor research by exact niche.\n'

    moats = market.get('moats', {})
    if isinstance(moats, dict):
        moats_lines = ''
        for k, v in moats.items():
            moats_lines += f'\n- **{k.capitalize()}:** {v}\n'
    else:
        moats_lines = '\n- **Data:** Verified physical facts compounding into a reusable graph\n- **Network:** Each verified fact reduces marginal cost for future buyers\n'

    # GTM section
    first_customers = safe_get(gtm, 'first10Customers') or safe_get(gtm, 'first10customers')
    if isinstance(first_customers, list):
        first_customers_str = fmt_list(first_customers)
    else:
        first_customers_str = '- founder-led outreach\n- specialist communities\n- warm introductions\n'

    # Ops section
    mvp_stages = ops.get('mvpStages', [])
    if isinstance(mvp_stages, list) and mvp_stages:
        mvp_stages_str = fmt_list(mvp_stages)
    else:
        mvp_stages_str = '- manual proof\n- assisted prototype\n- paid vertical slice\n- repeatable self-serve\n- scale and integrations\n'

    kpis = ops.get('kpis', [])
    if isinstance(kpis, list) and kpis:
        kpis_str = fmt_list(kpis)
    else:
        kpis_str = (
            '- qualified conversations\n- paid conversion\n- time to first value\n'
            '- gross margin\n- repeat rate\n- support minutes\n- error/correction rate\n'
        )

    # Action plan
    p7 = action.get('plan7Days', {})
    if isinstance(p7, dict):
        p7_steps = fmt_list(list(p7.values()))
    elif isinstance(p7, list):
        p7_steps = fmt_list(p7)
    else:
        p7_steps = '- example artifact\n- 25-prospect list\n- 15 interviews/outreach attempts\n- paid offer\n- first delivery plan\n'

    p30 = action.get('plan30Days', {})
    if isinstance(p30, dict):
        p30_steps = fmt_list(list(p30.values()))
    elif isinstance(p30, list):
        p30_steps = fmt_list(p30)
    else:
        p30_steps = '- 3–10 pilots\n- measure costs and corrections\n- publish one consented case study\n- automate repeated steps\n- re-score idea\n'

    p90 = action.get('plan90Days', {})
    if isinstance(p90, dict):
        p90_steps = fmt_list(list(p90.values()))
    elif isinstance(p90, list):
        p90_steps = fmt_list(p90)
    else:
        p90_steps = '- choose narrow ICP\n- ship self-serve vertical slice\n- build repeat channel\n- track cohort economics\n- stop or expand based on evidence\n'

    checklist = action.get('checklist', [])
    if isinstance(checklist, list) and checklist:
        checklist_str = fmt_list(checklist)
    else:
        checklist_str = (
            '- Validate buyer payment willingness\n- Deploy basic web app\n'
            '- Onboard 10 responders\n- Achieve break-even\n'
        )

    # Validation plan
    v48 = validation.get('plan48Hours', validation.get('plan48hours', []))
    if isinstance(v48, list):
        v48_str = fmt_list(v48)
    elif isinstance(v48, dict):
        v48_str = fmt_list(list(v48.values()))
    else:
        v48_str = '- create one example deliverable\n- build prospect list of 25\n- conduct five conversations\n- make a paid offer\n'

    v7 = validation.get('plan7Days', validation.get('plan7days', []))
    if isinstance(v7, list):
        v7_str = fmt_list(v7)
    elif isinstance(v7, dict):
        v7_str = fmt_list(list(v7.values()))
    else:
        v7_str = '- complete 15 interviews\n- run landing/payment test\n- deliver or schedule first pilot\n- document objections\n'

    v30 = validation.get('plan30Days', validation.get('plan30days', []))
    if isinstance(v30, list):
        v30_str = fmt_list(v30)
    elif isinstance(v30, dict):
        v30_str = fmt_list(list(v30.values()))
    else:
        v30_str = '- serve 3–10 pilots\n- measure labor and costs\n- identify repeated steps\n- decide build, pivot, or stop\n'

    # Product section
    main_workflow = prod.get('mainWorkflow', [])
    if isinstance(main_workflow, list):
        workflow_str = fmt_list(main_workflow)
    else:
        workflow_str = (
            '- Select a narrowly defined job\n- Provide authorized inputs\n- Validate and normalize data\n'
            '- Run deterministic checks and AI-assisted analysis\n- Show uncertainties and failures\n'
            '- Require approval for consequential actions\n- Export result and evidence\n'
            '- Save feedback for the next run\n'
        )

    core_features = prod.get('coreFeatures', [])
    if isinstance(core_features, list) and core_features:
        features_str = fmt_list(core_features)
    else:
        features_str = f'- {ag.get("whatToBuild", "Core product workflow")}\n- provenance and evidence\n- saved projects\n- quality checks\n- export and sharing\n'

    mvp_def = prod.get('mvpDefinition', ag.get('whatToBuild', ''))

    # FutureAI build
    auto_work = safe_get(fut, 'automaticWork')
    if isinstance(auto_work, list):
        auto_str = fmt_list(auto_work)
    else:
        auto_str = '- normalize inputs\n- retrieve allowed evidence\n- run repeatable analyses\n- generate structured drafts\n- detect missing data\n- prepare reports\n'

    # Risk section
    worst_case = risks.get('worstCase', 'Months of building produce no paid demand and create data/security liability.')
    mitigations = risks.get('mitigations', [])
    if isinstance(mitigations, list) and mitigations:
        mit_str = fmt_list(mitigations)
    else:
        mit_str = '- prepayment before build\n- narrow scope\n- evidence labels\n- human approval\n- least privilege\n- cost limits\n- kill criteria\n'

    abandon = risks.get('abandonWhen', [])
    if isinstance(abandon, list) and abandon:
        abandon_str = fmt_list(abandon)
    else:
        abandon_str = (
            '- buyers reject the paid outcome\n- lawful inputs are unavailable\n'
            '- unit economics remain negative\n- the wedge is fully commoditized\n'
            '- founder cannot sustain the required daily work\n'
        )

    # Related ideas section
    related_section = ''
    for rid in related_ids:
        ridea = all_ideas_map.get(rid, {})
        rslug = ridea.get('slug', '')
        if rslug:
            related_section += f'- [{rid}]({rslug}.md)\n'
        else:
            related_section += f'- [{rid}]({rid}.md)\n'

    # Find related idea slugs/names from the JSON — passed via all_ideas_map in caller
    # We'll fill this in the caller

    # Format the document
    doc = f"""# {name}

> {one_sentence}

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `{id_}` |
| Target customer | {ag.get('targetCustomer', '')} |
| Problem | {ag.get('problemSolved', '')} |
| What to build | {ag.get('whatToBuild', '')} |
| How it makes money | {ag.get('howItMakesMoney', '')} |
| Why customers pay | {ag.get('whyCustomersPay', '')} |
| Earning potential | {earn_str} |
| Startup cost | {startup_cost_str} |
| Time to MVP | {ag.get('timeToMvp', '')} |
| Time to first revenue | {ag.get('timeToFirstRevenue', '')} |
| Profitability condition | {ag.get('profitabilityCondition', '')} |
| Overall opportunity score | {overall_score}/100 |
| Confidence | {confidence_display} |
| Main advantage | {ag.get('mainAdvantage', '')} |
| Main risk | {ag.get('mainRisk', '')} |
| Best next validation | {ag.get('bestNextValidationStep', '')} |

## Identity and Provenance

- **Canonical ID:** `{id_}`
- **Legacy ID:** `{legacy_id}`
- **Slug:** `{slug}`
- **Category:** {category}
- **Status:** {status}
- **Tags:** {', '.join(tags)}
- **Alternative names:** {', '.join(alt_names)}
- **Source references:** {source_refs_str}
- **Provenance status:** {prov_status}

{detailed}


## Customer Perspective

- **Primary Customer:** {cust.get('primaryCustomer', '')}

- **Economic Buyer:** {cust.get('economicBuyer', '')}

- **Daily User:** {cust.get('dailyUser', '')}

- **Customer Type:** {cust.get('customerType', '')}

- **Current Situation:** {cust.get('currentSituation', '')}

- **Specific Problem:** {cust.get('specificProblem', '')}

- **Frequency:** {cust.get('frequency', '')}

- **Pain And Cost:** {cust.get('painAndCost', '')}

### Current Alternatives
{fmt_list(cust.get('currentAlternatives', ['manual research', 'forum searches', 'retailer Q&A']))}
- **Alternative Gaps:** {cust.get('alternativeGaps', ['Alternatives may be fragmented, generic, difficult to verify, or disconnected from the customer\'s exact workflow.']) if isinstance(cust.get('alternativeGaps'), str) else ', '.join(cust.get('alternativeGaps', ['Alternatives may be fragmented, generic, or unverified.']))}

### Jobs To Be Done

- **Functional:** {cust.get('jobsToBeDone', 'Complete the workflow with measurable evidence.')}

- **Emotional:** Feel confident that the purchase decision is right, not based on unverified claims.

- **Social:** Demonstrate evidence-backed decision-making to peers, partners, or colleagues.

- **Desired Outcome:** {cust.get('desiredOutcome', 'A reliable result with less time, lower risk, and clear evidence of what happened.')}

### Trust Requirements
{fmt_list(cust.get('trustRequirements', ['transparent methodology', 'source and change history']))}
### Rejection Reasons
{fmt_list(cust.get('rejectionReasons', ['Free alternatives available', 'Lack of immediate response']))}
### Switch Reasons
{fmt_list(cust.get('switchReasons', ['Guaranteed verification outcome', 'Direct visual proof']))}

### Continuing Payment Reasons
{fmt_list(cust.get('continuingPaymentReasons', ['Ongoing research needs']))}

### Measurable Value
- {cust.get('measurableValue', 'Reduced wrong purchases; faster verification')}

### Acquisition Channels
{fmt_list(cust.get('acquisitionChannels', ['SEO', 'Community outreach', 'Direct outreach']))}
### Objections
{fmt_list(cust.get('objections', ['Why pay when alternatives exist?', 'Is evidence genuine?']))}
### Retention Drivers
{fmt_list(cust.get('retentionDrivers', ['Stored history', 'Repeat workflows', 'Integrations']))}
### Churn Risks
{fmt_list(cust.get('churnRisks', ['Low event frequency', 'Platform-native replacement']))}

- **Customer Pays Because:** {cust.get('customerPaysBecause', ag.get('whyCustomersPay', ''))}

- **Idea Satisfies Customer By:** {cust.get('ideaSatisfiesCustomerBy', '')}

## Product Definition

- **Product Type:** {prod.get('productType', 'marketplace')}

- **User Experience:** {prod.get('userExperience', 'A guided self-serve workflow with visible evidence and exportable results.')}

### Main Workflow
{workflow_str}
### Inputs
{fmt_list(prod.get('inputs', ['authorized customer data', 'configuration and constraints', 'source documents or APIs', 'human approvals']))}
### Outputs
{fmt_list(prod.get('outputs', ['structured result', 'evidence ledger', 'risk flags', 'actionable recommendations', 'machine-readable export']))}
### Core Features
{features_str}
### Supporting Features
{fmt_list(prod.get('supportingFeatures', ['templates', 'notifications', 'version history', 'feedback capture', 'analytics']))}
### Admin Features
{fmt_list(prod.get('adminFeatures', ['user and role management', 'billing', 'policy configuration', 'content moderation where needed', 'audit logs']))}
### Integrations
{fmt_list(prod.get('integrations', ['email/webhooks', 'payments', 'identity provider', 'domain-specific APIs after validation']))}
### Data Requirements
{fmt_list(prod.get('dataRequirements', ['minimum necessary customer inputs', 'source metadata', 'versioned outputs', 'consent and retention metadata']))}
- **Automation Level:** {prod.get('automationLevel', 'High for ingestion, classification, and reporting; bounded human approval for high-impact outputs.')}

- **Human Involvement:** {prod.get('humanInvolvement', 'Customer approval, exception review, domain expertise where automatic evaluation is unreliable.')}

### Ai Capabilities
{fmt_list(prod.get('aiCapabilities', ['structured extraction', 'classification', 'retrieval', 'comparison', 'generation with citations', 'anomaly detection']))}
### Non Ai Capabilities
{fmt_list(prod.get('nonAiCapabilities', ['deterministic validation', 'permissions', 'payments', 'versioning', 'search', 'logging']))}
### Security Requirements
{fmt_list(prod.get('securityRequirements', ['least privilege', 'encrypted transport', 'secret management', 'input validation', 'dependency and audit controls']))}
### Privacy Requirements
{fmt_list(prod.get('privacyRequirements', ['data minimization', 'purpose limitation', 'retention controls', 'export/deletion mechanisms', 'no unrelated training without permission']))}
### Compliance Considerations
{fmt_list(prod.get('complianceConsiderations', ['Map jurisdictions and product role before launch', 'Do not claim certification', 'Obtain legal review for regulated or marketplace flows']))}
### Accessibility Considerations
{fmt_list(prod.get('accessibilityConsiderations', ['WCAG-oriented semantics', 'keyboard navigation', 'visible focus', 'non-color status cues', 'clear error text']))}
- **Mobile Requirements:** {prod.get('mobileRequirements', 'Responsive web first; native mobile only when validated usage requires it.')}

- **Api Requirements:** {prod.get('apiRequirements', 'Versioned REST or event API for core records, exports, jobs, and webhooks.')}

- **Marketplace Requirements:** {prod.get('marketplaceRequirements', 'When relevant: identity, listings, transaction states, disputes, fraud controls, payouts, and moderation.')}

- **Mvp Definition:** {mvp_def}

### Version Two
{fmt_list(prod.get('versionTwo', ['team collaboration', 'more integrations', 'automation of proven manual steps', 'benchmarking', 'role-based policies']))}
- **Long Term Vision:** {prod.get('longTermVision', f'A trusted system of record and operating layer for the workflow surrounding {name}.')}

### Do Not Build Initially
{fmt_list(prod.get('doNotBuildInitially', ['broad multi-industry platform', 'native apps without demand', 'complex autonomous actions', 'unvalidated marketplace supply', 'expensive infrastructure']))}
### User Journey
{fmt_list(prod.get('userJourney', ['Discover through a high-intent channel', 'Understand outcome and limitations', 'Start a small project', 'Provide inputs and consent', 'Review analysis and evidence', 'Approve or correct exceptions', 'Receive/export result', 'Return for rerun or related workflow']))}
## What Future AI Should Build

- **Exact System:** {fut.get('exactSystem', f'Build a web application and bounded AI workflow for {name}: {ag.get("whatToBuild", "")}')}

### Automatic Work
{auto_str}
### Human Approval
{fmt_list(safe_get(fut, 'humanApproval') or ['external publishing', 'payments or refunds', 'high-impact decisions', 'ambiguous failures', 'legal or safety conclusions'])}
### Model Capabilities
{fmt_list(safe_get(fut, 'modelCapabilities') or ['strong structured output', 'tool use', 'retrieval', 'multilingual reasoning where relevant', 'calibrated uncertainty'])}
### Tools And Integrations
{fmt_list(safe_get(fut, 'toolsAndIntegrations') or ['database', 'object storage', 'queue', 'email/webhooks', 'payment provider', 'domain APIs after verification'])}
### Knowledge Sources
{fmt_list(safe_get(fut, 'knowledgeSources') or ['customer-authorized data', 'official documentation', 'versioned internal rules', 'human-reviewed examples'])}
### Suggested Stack
{fmt_list(safe_get(fut, 'suggestedStack') or ['static GitHub Pages for research front end', 'TypeScript web app for product MVP', 'PostgreSQL', 'object storage', 'background job queue', 'provider-neutral model adapter'])}
### Components
{fmt_list(safe_get(fut, 'components') or ['web UI', 'API service', 'worker/evaluator', 'policy engine', 'evidence store', 'billing', 'analytics'])}
### Data Flow
- {safe_get(fut, 'dataFlow') or 'input -> validation -> authorization -> deterministic checks -> AI analysis -> evaluation -> approval -> export -> telemetry'}

### Api Endpoints
{fmt_list(safe_get(fut, 'apiEndpoints') or ['POST /projects', 'POST /projects/:id/runs', 'GET /runs/:id', 'POST /runs/:id/approve', 'GET /exports/:id', 'POST /webhooks/provider'])}
### Database Entities
{fmt_list(safe_get(fut, 'databaseEntities') or ['User', 'Organization', 'Project', 'InputArtifact', 'Run', 'Evidence', 'Finding', 'Decision', 'Approval', 'Invoice', 'Event'])}
- **Authentication:** {safe_get(fut, 'authentication') or 'Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.'}

- **Payments:** {safe_get(fut, 'payments') or 'Hosted checkout and webhooks; keep the provider authoritative for payment state.'}

### Analytics Events
{fmt_list(safe_get(fut, 'analyticsEvents') or ['landing_view', 'pricing_view', 'project_started', 'input_completed', 'run_finished', 'finding_reviewed', 'exported', 'paid', 'returned'])}
### Logging Monitoring
{fmt_list(safe_get(fut, 'loggingMonitoring') or ['structured logs', 'trace IDs', 'job status', 'error budgets', 'cost and latency metrics', 'privacy-safe audit events'])}
### Evaluation Criteria
{fmt_list(safe_get(fut, 'evaluationCriteria') or ['task success', 'false-positive/negative rate', 'human agreement', 'latency', 'cost per run', 'user correction rate', 'paid conversion'])}
### Safety Guardrails
{fmt_list(safe_get(fut, 'safetyGuardrails') or ['authorized inputs only', 'prompt-injection isolation', 'output schemas', 'abstention', 'approval gates', 'rate limits', 'abuse reporting'])}
### Failure Handling
{fmt_list(safe_get(fut, 'failureHandling') or ['preserve partial evidence', 'show actionable error', 'retry only idempotent steps', 'fallback provider when policy allows', 'manual review queue'])}
- **Mvp Complexity:** {safe_get(fut, 'mvpComplexity') or '1–3 weeks'}

### Build Sequence
{fmt_list(safe_get(fut, 'buildSequence') or ['write acceptance tests', 'model data and permissions', 'build one vertical slice', 'add billing boundary', 'instrument analytics', 'run paid pilot', 'automate repeated manual work'])}
- **First Prototype:** {safe_get(fut, 'firstPrototype') or 'A static or command-line prototype that processes one authorized example and produces a reviewable evidence report.'}

## Profitability Analysis

- **Revenue model:** {' / '.join(prof.get('revenueModel', ['marketplace_transaction'])) if isinstance(prof.get('revenueModel'), list) else prof.get('revenueModel', 'marketplace_transaction')}
- **Pricing model:** {prof.get('pricingModel', 'Start with a fixed paid outcome; introduce subscription, usage, licensing, transaction, or enterprise pricing only after repeat demand.')}
- **Expected ARPC scenario:** {prof.get('expectedArpc', 'Unknown — validate with first cohort')}
- **Gross-margin scenario:** {prof.get('grossMarginPotential', '60%–80%')}
- **CAC scenario:** {prof.get('cac', 'Unknown — validate with first acquisition channel')}
- **LTV scenario:** {prof.get('ltv', 'Unknown — validate with first cohort')}
- **Target LTV:CAC:** Target >3 after validated cohorts; currently unknown.
- **Payback:** Target under 6 months for self-serve and under 12 months for larger accounts.
- **Break-even model:** `Monthly fixed costs / (average monthly revenue per customer - average monthly variable cost per customer).`

### Three Editable Scenarios

| Scenario | Customers | Monthly price/ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Approx. monthly operating profit |
|---|---:|---:|---:|---:|---:|---:|---:|
{scenario_rows}
All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
- The idea or variant appears in the supplied corpus.
- Source references: {source_refs_str}

### Research-Supported Estimates
- Some reports contained competitor-pricing and demand evidence from the Eighth Reset Deep Research corpus.

### Analyst Assumptions
- customer counts
- prices
- conversion
- retention
- cost structure

### Unknowns Requiring Validation
- actual willingness to pay
- channel conversion
- support minutes per customer
- repeat frequency

## What Must Be True for This Idea to Be Profitable

- **Required Customer Volume:** Enough active customers to cover fixed costs under the break-even formula.
- **Minimum Viable Price:** Must exceed variable delivery, support, refunds, and acquisition on a cohort basis.
- **Maximum Cac:** No more than roughly one-third of validated gross-profit LTV as a planning guardrail.
- **Retention Or Frequency:** Repeat usage or expansion must justify acquisition unless initial contribution margin is high.
- **Required Gross Margin:** Prefer >60% for scalable software; lower can work for a deliberately productized service.
- **Maximum Service Cost:** Human review must decline as a percentage of price or be priced explicitly.
- **Conversion Rate:** Landing-page interest is insufficient; paid conversion must support channel economics.
- **Automation Level:** Automate stable repetitive work, not uncertainty that still requires learning.
- **Sales Cycle:** Short enough that runway survives; validate before building enterprise features.
- **Critical Partnerships:** Any partner channel must show signed or behavioral commitment.
- **Regulatory Dependencies:** Launch scope must remain lawful and claims must match evidence.
- **Technical Dependencies:** Critical APIs, data licences, and model behavior must be verified.
- **Market Timing:** The trigger must be active now, not merely forecast.
- **Team Capabilities:** Product engineering, customer discovery, distribution, and domain review.
- **Unprofitable Conditions:** {risks.get('unprofitableConditions', 'buyers will not prepay; support exceeds price; channel CAC is too high; retention is weak')}


## Earning Potential

- **Most Realistic Outcome:** {earn.get('mostRealisticOutcome', 'bootstrapped marketplace or data business depending on validation')}

- **First Paying Customer:** {earn.get('firstPayingCustomer', 'A paid pilot in the €5–€20 bounty range is the practical first milestone.')}

- **Side Business:** {earn.get('sideBusiness', '€5k–€50k annual revenue scenario if founder-led and narrow.')}

- **Small Company:** {earn.get('smallCompany', '€100k–€1m annual revenue requires repeatable acquisition and standardized delivery.')}

- **Seven Figure:** {earn.get('sevenFigure', 'Possible only with recurring or transaction revenue, strong retention, and reduced founder labor.')}

- **Venture Scale:** {earn.get('ventureScale', 'Not assumed; realistic only if the workflow expands into infrastructure, a network, or a proprietary data layer.')}

### Annual Revenue Range

- **Currency:** {earn_pot.get('currency', 'EUR') if isinstance(earn_pot, dict) else 'EUR'}

- **Minimum:** {earn_pot.get('minimum', 5000) if isinstance(earn_pot, dict) else 5000}

- **Midpoint:** {earn_pot.get('midpoint', 50000) if isinstance(earn_pot, dict) else 50000}

- **Maximum:** {earn_pot.get('maximum', 2000000) if isinstance(earn_pot, dict) else 2000000}

- **Confidence:** {earn.get('confidence', 'low to medium until paid cohort evidence')}

### Main Assumptions
{fmt_list(earn.get('mainAssumptions', ['validated price', 'repeatable channel', 'repeat demand', 'controlled support']))}
- **Main Limiting Factor:** {earn.get('mainLimitingFactor', 'distribution and willingness to pay, followed by support/productization')}

## Market and Competition

- **Description:** {market.get('description', f'The market consists of online shoppers and e-commerce participants who need verified product facts.')}

### Demand Drivers
{fmt_list(market.get('demandDrivers', ['agentic commerce growth', 'review distrust', 'return rate pressure', 'online purchase frequency']))}
- **Signals:** {market.get('signals', 'Supplied research reports contain examples and competitor categories; re-open primary sources before investment decisions.')}

- **Size Direction:** {market.get('sizeDirection', 'Unknown — requires bottom-up reachable-market analysis.')}

- **Budget Source:** {market.get('budgetSource', 'consumer spending, operating, or project budget depending on buyer')}

- **Maturity:** {market.get('maturity', 'Varies by niche; avoid treating a broad category as one market.')}

- **Competitive Density:** {market.get('competitiveDensity', 'Medium to high for generic positioning; lower for a precise workflow and distribution wedge.')}

### Direct Competitors
{comp_str}
### Indirect Competitors
{fmt_list(market.get('indirectCompetitors', ['retailer Q&A systems', 'general review platforms', 'forum communities', 'platform-native features']))}
### Diy Alternatives
{fmt_list(market.get('diyAlternatives', ['generic LLMs', 'search engines', 'manual outreach', 'open-source tools']))}
### Incumbent Advantages
{fmt_list(market.get('incumbentAdvantages', ['distribution', 'brand', 'integrations', 'data', 'bundling']))}
### Startup Advantages
{fmt_list(market.get('startupAdvantages', ['focus', 'speed', 'underserved segment', 'new workflow design']))}
### Differentiation
{fmt_list(market.get('differentiation', ['specific paid outcome', 'transparent evidence', 'integrated workflow', 'verified fact graph']))}
### Unserved Niches
{fmt_list(market.get('unservedNiches', ['exact product dimensions', 'device compatibility pairs', 'real-world installed behavior']))}
- **Geography:** {market.get('geography', 'Start where founder language, network, or regulation creates an advantage; expand only with evidence.')}

- **Timing:** {market.get('timing', 'Revalidate technical, legal, and platform assumptions immediately before launch.')}

### Trends
{fmt_list(market.get('trends', ['AI shopping agents', 'agentic commerce trust gap', 'review distrust', 'demand for verification', 'software consolidation']))}
- **Platform Feature Risk:** {market.get('platformFeatureRisk', 'Material; preserve value in data, workflow, cross-platform support, or distribution.')}

- **Commoditization Risk:** {market.get('commoditizationRisk', 'High for generation-only features; lower for trusted outcomes and proprietary feedback loops.')}

### Moats
{moats_lines}
## Validation Plan

- **Most Important Uncertainty:** {validation.get('mostImportantUncertainty', 'Will the named economic buyer prepay for the narrow result?')}

- **Riskiest Assumption:** {validation.get('riskiestAssumption', 'The problem is urgent enough and current alternatives are inadequate.')}

- **Cheapest Test:** {validation.get('cheapestTest', 'Five-page mock, example output, and direct paid offer to 15 qualified prospects.')}

- **Fastest Test:** {validation.get('fastestTest', 'Ask for a deposit or signed pilot with a fixed delivery date.')}

- **Interview Plan:** {validation.get('interviewPlan', 'Interview 15 users and five buyers separately; record event frequency, current cost, trigger, alternatives, decision process, and last purchase.')}

### Interview Questions
{fmt_list(validation.get('interviewQuestions', ['Tell me about the last time this happened.', 'What did you do instead?', 'What did it cost in time, money, delay, or risk?', 'Who approved spending?', 'What would make an external solution untrustworthy?', 'Would you pay for this fixed outcome this month? Why or why not?']))}
- **Landing Page Test:** {validation.get('landingPageTest', 'Show exact input, deliverable, price, limitations, and delivery time; measure qualified CTA and payment, not visits alone.')}

- **Smoke Test:** {validation.get('smokeTest', 'Offer the deliverable before automating it, within ethical and legal boundaries.')}

- **Concierge Mvp:** {validation.get('conciergeMvp', 'Manually deliver one standardized outcome while logging every step and exception.')}

- **Wizard Of Oz:** {validation.get('wizardOfOz', 'Use manual review behind a simple interface to test customer behavior before complex automation.')}

- **Prototype Test:** {validation.get('prototypeTest', 'Process three real authorized examples and compare against expert/user judgment.')}

- **Pricing Test:** {validation.get('pricingTest', 'Present at least three price points or use sequential cohorts; do not rely on hypothetical survey answers.')}

- **Demand Threshold:** {validation.get('demandThreshold', 'At least 2 paid pilots or 5 credible procurement commitments from 20 qualified conversations.')}

### Success Criteria
{fmt_list(validation.get('successCriteria', ['prepayment', 'repeat request', 'measurable outcome', 'delivery within target labor budget']))}
### Failure Criteria
{fmt_list(validation.get('failureCriteria', ['no buyer will pay', 'support dominates price', 'problem occurs too rarely', 'required data cannot be accessed lawfully']))}
### Evidence Before Build
{fmt_list(validation.get('evidenceBeforeBuild', ['last-event interviews', 'paid pilot', 'reachable channel', 'verified data/API terms']))}
### Evidence Before Heavy Investment
{fmt_list(validation.get('evidenceBeforeHeavyInvestment', ['retention or repeat use', 'positive contribution margin', 'stable error taxonomy', 'security/compliance feasibility']))}
### Plan48 Hours
{v48_str}
### Plan7 Days
{v7_str}
### Plan30 Days
{v30_str}
- **Do Not Build Yet:** {validation.get('doNotBuildYet', 'Do not build a broad autonomous platform until a narrow paid outcome is repeatedly requested.')}

## Go-to-Market Strategy

- **Initial Niche:** {gtm.get('initialNiche', cust.get('primaryCustomer', ''))}

- **Icp:** {gtm.get('icp', 'A reachable buyer experiencing the problem now, with authority or direct access to the budget owner.')}

- **Beachhead:** {gtm.get('beachhead', 'One language, platform, neighborhood, workflow, or integration where distribution is identifiable.')}

- **Positioning:** {gtm.get('positioning', f'A specific, evidence-backed outcome, not a generic AI tool.')}

- **Value Proposition:** {gtm.get('valueProposition', ag.get('whyCustomersPay', ''))}

- **Messaging:** {gtm.get('messaging', 'Lead with the triggering event, concrete deliverable, turnaround, and limits.')}

- **Offer:** {gtm.get('offer', 'A fixed-scope paid pilot with a sample artifact and refund/acceptance terms.')}

- **Pricing Launch:** {gtm.get('pricingLaunch', 'Founding cohort price tied to feedback and a public case study only with permission.')}

### First10 Customers
{first_customers_str}
### First100 Customers
{fmt_list(gtm.get('first100Customers', ['repeatable outbound segment', 'integration listing', 'case-study SEO', 'referral loop', 'channel partners']))}
- **Outbound:** {gtm.get('outbound', 'Personalized, evidence-based outreach to buyers currently showing the trigger.')}

- **Inbound:** {gtm.get('inbound', 'High-intent problem pages, calculators, examples, and comparison content.')}

- **Community:** {gtm.get('community', 'Contribute useful diagnostics and transparent methods without spam.')}

- **Partnerships:** {gtm.get('partnerships', 'Tools, agencies, properties, platforms, reviewers, or associations already serving the buyer.')}

- **Product Led Growth:** {gtm.get('productLedGrowth', 'Exports, shared reports, badges, or collaboration can expose the product when they genuinely help users.')}

- **Marketplace Distribution:** {gtm.get('marketplaceDistribution', 'Use only where the marketplace already contains the buyer and terms permit the offer.')}

- **App Store:** {gtm.get('appStore', 'Relevant only when app-store search is a proven channel.')}

- **Seo:** {gtm.get('seo', 'Target exact workflow and failure queries, not broad category keywords.')}

- **Content:** {gtm.get('content', 'Publish methods, failure patterns, benchmarks, and honest case studies.')}

- **Paid Acquisition:** {gtm.get('paidAcquisition', 'Unsuitable until conversion, retention, and contribution margin are measured.')}

- **Referral Loop:** {gtm.get('referralLoop', 'Reward introductions only when disclosure and incentives preserve trust.')}

- **Sales Cycle:** {gtm.get('salesCycle', 'Aim for days to weeks for pilot; avoid building enterprise controls before demand.')}

### Sales Assets
{fmt_list(gtm.get('salesAssets', ['sample output', 'scope page', 'security FAQ', 'pricing', 'case study', 'ROI worksheet']))}
- **Onboarding:** {gtm.get('onboarding', 'Collect only required inputs, show progress, and make the first value event fast.')}

- **Retention:** {gtm.get('retention', 'Save history, make reruns easy, and prove value each cycle.')}

- **Expansion:** {gtm.get('expansion', 'Add adjacent workflows, users, integrations, languages, or data products after the wedge.')}

## Build and Operations Plan

### Founder Skills
{fmt_list(ops.get('founderSkills', ['customer interviews', 'product engineering', 'AI evaluation', 'data handling', 'direct sales']))}
### Team Roles
{fmt_list(ops.get('teamRoles', ['founder/product engineer', 'domain reviewer as needed', 'design or growth later', 'security/legal specialists when needed']))}
### Ai Can Accelerate
{fmt_list(ops.get('aiCanAccelerate', ['research', 'drafting', 'classification', 'test generation', 'coding', 'documentation', 'support triage']))}
### Human Required
{fmt_list(ops.get('humanRequired', ['trust building', 'ambiguous evaluation', 'partnerships', 'legal/account decisions', 'high-impact approval']))}
- **Build Difficulty:** {ops.get('buildDifficulty', 3.5)}

- **Operational Difficulty:** {ops.get('operationalDifficulty', 3.0)}

- **Support Burden:** {ops.get('supportBurden', 'Unknown; measure minutes per customer during pilots.')}

- **Sales Burden:** {ops.get('salesBurden', 'Founder-led initially; should decline through a clear niche and repeatable channel.')}

- **Compliance Burden:** {ops.get('complianceBurden', 'Low to high depending on data, payments, marketplace role, and claims.')}

- **Data Acquisition Difficulty:** {ops.get('dataAcquisitionDifficulty', 'Verify permissions, licensing, freshness, and deletion obligations before relying on data.')}

- **Integration Difficulty:** {ops.get('integrationDifficulty', 'Start with one integration; avoid breadth until the workflow is proven.')}

### Mvp Stages
{mvp_stages_str}
### Dependencies
{fmt_list(ops.get('dependencies', ['buyer access', 'authorized data', 'reliable model/tool behavior', 'payment and identity services']))}
### Maintenance
{fmt_list(ops.get('maintenance', ['source/API changes', 'model regression', 'security updates', 'content/data quality', 'customer success']))}
### Quality Control
{fmt_list(ops.get('qualityControl', ['acceptance criteria', 'automated tests', 'sample review', 'exception queue', 'post-delivery feedback']))}
### Kpis
{kpis_str}
### Leading Indicators
{fmt_list(ops.get('leadingIndicators', ['prospect reply rate', 'deposit rate', 'input completion', 'run success', 'user corrections']))}
### Lagging Indicators
{fmt_list(ops.get('laggingIndicators', ['monthly revenue', 'retention', 'gross margin', 'referrals', 'expansion']))}
### Kill Metrics
{fmt_list(ops.get('killMetrics', ['zero prepayments after qualified outreach', 'negative contribution margin after three iterations', 'unresolvable legal/data blocker', 'no repeated trigger']))}
### Automation Opportunities
{fmt_list(ops.get('automationOpportunities', ['input validation', 'routing', 'report generation', 'billing', 'notifications', 'regression tests']))}
### Sops
{fmt_list(ops.get('sops', ['customer qualification', 'data authorization', 'run/review', 'incident response', 'refund/dispute', 'source update', 'release acceptance']))}
## Risks and Failure Modes

- **Product:** {risks.get('product', 'Outcome may not be better than a checklist or existing tool.')}

- **Market:** {risks.get('market', 'Pain may be real but not budgeted.')}

- **Pricing:** {risks.get('pricing', 'Price may not cover review, support, and acquisition.')}

- **Distribution:** {risks.get('distribution', 'The founder may not reach buyers cheaply.')}

- **Technical:** {risks.get('technical', 'Inputs, APIs, or evaluation may be less reliable than expected.')}

- **Ai Reliability:** {risks.get('aiReliability', 'Model outputs can vary and require deterministic checks.')}

- **Hallucination:** {risks.get('hallucination', 'Generated claims must be grounded, labeled, and reviewable.')}

- **Data:** {risks.get('data', 'Source data may be incomplete, stale, biased, or unlicensed.')}

- **Security:** {risks.get('security', 'Customer data, tokens, uploads, and integrations expand attack surface.')}

- **Privacy:** {risks.get('privacy', 'Collecting unnecessary personal or confidential information creates avoidable risk.')}

- **Regulatory:** {risks.get('regulatory', 'Role, claims, jurisdiction, and data may trigger obligations.')}

- **Reputation:** {risks.get('reputation', 'One confident wrong result can damage trust.')}

- **Dependency:** {risks.get('dependency', 'External APIs, models, platforms, and partners can change.')}

- **Platform:** {risks.get('platform', 'The platform may bundle the feature or restrict access.')}

- **Fraud:** {risks.get('fraud', 'Transactions, referrals, identity, or uploaded evidence can be manipulated.')}

- **Abuse:** {risks.get('abuse', 'The system may be used for spam, surveillance, deception, or unauthorized testing.')}

- **Support:** {risks.get('support', 'Edge cases can turn software into bespoke service.')}

- **Founder Market Fit:** {risks.get('founderMarketFit', 'The founder may prefer building over selling and validation.')}

- **Capital:** {risks.get('capital', 'Premature infrastructure or hiring can consume runway.')}

- **Timing:** {risks.get('timing', 'The market may be too early, too late, or temporarily fashionable.')}

- **Commoditization:** {risks.get('commoditization', 'Generic AI functionality is easy to copy.')}

- **Ethics:** {risks.get('ethics', 'Avoid deceptive claims, exploitative targeting, and automation without recourse.')}

- **Worst Case:** {worst_case}

### Mitigations
{mit_str}
### Abandon When
{abandon_str}
## Action Plan

- **First Action:** {action.get('firstAction', 'Create one realistic example output and a one-page paid offer.')}

- **First Customer Conversation:** {action.get('firstCustomerConversation', f'Interview a currently affected {cust.get("primaryCustomer", "target customer")} about the last occurrence and ask for a paid pilot.')}

- **First Prototype:** {action.get('firstPrototype', 'A manual or command-line vertical slice with an evidence-rich report.')}

- **First Sales Offer:** {action.get('firstSalesOffer', 'Fixed scope, explicit price, delivery time, inputs, limitations, and acceptance criteria.')}

- **First Distribution Channel:** {action.get('firstDistributionChannel', 'The narrowest directory, community, partner, or local network containing the exact buyer.')}

- **First Measurement:** {action.get('firstMeasurement', 'Paid conversion and delivery hours, not likes or waitlist size.')}

- **First Hiring Need:** {action.get('firstHiringNeed', 'A domain or native reviewer only after customer-funded demand.')}

- **First Integration:** {action.get('firstIntegration', 'The single source or destination that removes the most friction.')}

### Plan7 Days
{p7_steps}
### Plan30 Days
{p30_steps}
### Plan90 Days
{p90_steps}
### Checklist
{checklist_str}
## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
{score_rows}
### Composite Views

{composite_lines}

## Evidence, Assumptions, and Unknowns

### Evidence
{ev_lines}
### Assumptions
{assumptions_lines}
### Unknowns
{unknowns_lines}
## Related Ideas
{related_section}
## Source References

{chr(10).join(f'- **{sr}**: See data/sources.json for full citation.' for sr in source_refs) if source_refs else '- No specific source references provided; see data/sources.json.'}

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-06). Session 8 winner: FactBounty (idea-061, score: 91.2). This dossier is part of the Product Verification and Evidence category (ideas 061-070).*

## Idea-Specific Prompt Pack

See [`prompts/idea-specific/{id_}/`](../prompts/idea-specific/{id_}/README.md).
"""
    return doc


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ideas_path = os.path.join(base_dir, 'data', 'ideas.json')
    output_dir = os.path.join(base_dir, 'ideas')

    with open(ideas_path, encoding='utf-8') as f:
        data = json.load(f)

    ideas = data['ideas'] if isinstance(data, dict) else data
    all_ideas_map = {i['id']: i for i in ideas}

    # Target: ideas 062-070 (idea-061 already has a full dossier at 39KB)
    target_ids = [f'idea-0{n}' for n in range(62, 71)]

    generated = []
    for idea in ideas:
        idea_id = idea.get('id', '')
        if idea_id not in target_ids:
            continue

        slug = idea.get('slug', '')
        if not slug:
            print(f'SKIP {idea_id}: no slug', file=sys.stderr)
            continue

        output_path = os.path.join(output_dir, f'{slug}.md')
        doc = generate_dossier(idea, all_ideas_map)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(doc)

        size = os.path.getsize(output_path)
        print(f'Generated {output_path} ({size:,} bytes)')
        generated.append((idea_id, slug, size))

    print(f'\nGenerated {len(generated)} dossiers.')
    for idea_id, slug, size in generated:
        print(f'  {idea_id}: {slug}.md — {size:,} bytes')

    # Cleanup temp file if it exists
    temp = os.path.join(base_dir, 'idea_062_full.json')
    if os.path.exists(temp):
        os.remove(temp)
        print('Cleaned up temp file.')


if __name__ == '__main__':
    main()
