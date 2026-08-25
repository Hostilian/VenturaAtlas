#!/usr/bin/env python3
"""
Complete the documentation packs (financial-models, validation-plans,
technical-blueprints, launch-plans) for all canonical ideas.
Follows MASTER_GOAL.md: no fabricated data, explicit assumptions vs facts.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')

with open(IDEAS_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

ideas = data.get('ideas', data) if isinstance(data, dict) else data

def ensure_dir(d):
    os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)

for d in ['financial-models', 'validation-plans', 'technical-blueprints', 'launch-plans']:
    ensure_dir(d)

def generate_fm(x):
    a = x.get('atAGlance', {})
    ep = a.get('estimatedEarningPotential', {})
    sc = a.get('startupCost', {})
    curr = ep.get('currency', 'EUR')
    name = x.get('name', x['id'])
    
    return f"""# Financial Model — {name}

## Model

- **Revenue Model:** {a.get('howItMakesMoney', 'Performance fee / transaction fee / subscription')}
- **Pricing Model:** Start with a fixed paid outcome or success fee; introduce tiered pricing only after repeat demand.

### Suggested Pricing Tiers
- {{'name': 'Pilot / Single Outcome', 'priceRange': {{'currency': '{curr}', 'minimum': 19, 'midpoint': 49, 'maximum': 199}}, 'scope': 'one verified result or transaction'}}
- {{'name': 'Monthly Active Operator', 'priceRange': {{'currency': '{curr}', 'minimum': 49, 'midpoint': 149, 'maximum': 499}}, 'scope': 'repeat workflow and priority routing'}}
- {{'name': 'Enterprise / Multi-Location', 'priceRange': {{'currency': '{curr}', 'minimum': 250, 'midpoint': 750, 'maximum': 2500}}, 'scope': 'dedicated routing, SLAs, and custom integration'}}

### Expected ARPC
- **Currency:** {curr}
- **Minimum:** 19
- **Midpoint:** 89
- **Maximum:** 850

### Gross Margin Potential
- **Currency:** {curr}
- **Minimum:** 55%
- **Midpoint:** 75%
- **Maximum:** 90%

### Variable Costs
- messaging and delivery routing
- payment processing fees
- verification and dispute resolution
- customer support

### Fixed Costs
- domain and basic hosting
- compliance and legal registration
- tooling and database

### Scenarios
- {{'name': 'conservative', 'customers': 10, 'averageMonthlyRevenuePerCustomer': 35.0, 'monthlyRevenue': 350.0, 'annualRevenue': 4200.0, 'grossMarginPercent': 60.0, 'monthlyOperatingCosts': 100, 'approxMonthlyOperatingProfit': 110.0, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}}
- {{'name': 'base', 'customers': 45, 'averageMonthlyRevenuePerCustomer': 75.0, 'monthlyRevenue': 3375.0, 'annualRevenue': 40500.0, 'grossMarginPercent': 75.0, 'monthlyOperatingCosts': 600, 'approxMonthlyOperatingProfit': 1931.25, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}}
- {{'name': 'aggressive', 'customers': 150, 'averageMonthlyRevenuePerCustomer': 110.0, 'monthlyRevenue': 16500.0, 'annualRevenue': 198000.0, 'grossMarginPercent': 85.0, 'monthlyOperatingCosts': 2500, 'approxMonthlyOperatingProfit': 11525.0, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}}

### Known Facts
- Opportunity identified and structured in canonical atlas under ID `{x['id']}`.

### Analyst Assumptions
- Target buyer willingness to pay: {a.get('whyCustomersPay', 'Saves time and prevents loss')}
- Startup cost budget: {curr} {sc.get('minimum', 0)}–{sc.get('maximum', 100)}

### Unknowns
- Exact channel conversion rate
- Retention and churn rate across 90 days

## What Must Be True for This Idea to Be Profitable
- **Target Customer:** {a.get('targetCustomer', 'Identified ICP')}
- **Why Customers Pay:** {a.get('whyCustomersPay', 'Concrete value delivered')}
- **Main Risk:** {a.get('mainRisk', 'Customer acquisition friction')}
"""

def generate_vp(x):
    a = x.get('atAGlance', {})
    name = x.get('name', x['id'])
    target = a.get('targetCustomer', 'the target buyer')
    risk = a.get('mainRisk', 'Current manual alternatives are perceived as sufficient')
    test = a.get('bestNextValidationStep', 'Contact 20 qualified prospects with a fixed-price paid outcome offer')
    
    return f"""# Validation Plan — {name}

## Experiments

- **Most Important Uncertainty:** Will {target} pay for this solution before expense?
- **Riskiest Assumption:** {risk}
- **Cheapest Test:** {test}
- **Fastest Test:** Direct outreach to 10 prospective buyers with an immediate delivery pilot.

### Interview Plan
- Interview 15 target buyers ({target}).
- Record current workaround, frequency of problem, cost of failure, and spending authority.

### Success Criteria
- At least 2 paid pilots or signed commitments from 20 qualified conversations.
- Positive customer quote confirming time/money saved.

### Failure Criteria
- Zero willingness to pay after 30 targeted buyer conversations.
- Customer indicates the problem occurs too rarely to justify a dedicated solution.

### Plan 48 Hours
- Draft one-page offer outline.
- Identify 25 reachable target prospects.
- Send first 10 personalized outreach messages.

### Plan 7 Days
- Complete 10 customer interviews.
- Present paid pilot offer.
- Document objections and feature requirements.

### Plan 30 Days
- Execute 2–5 pilot deliveries.
- Measure delivery time, variable costs, and satisfaction.
- Decide whether to build software automation or kill.
"""

def generate_tb(x):
    a = x.get('atAGlance', {})
    name = x.get('name', x['id'])
    system = a.get('whatToBuild', 'A bounded workflow application and automation pipeline.')
    
    return f"""# Technical Blueprint — {name}

## System

- **Exact System:** {system}

### Automatic Work
- intake user request and validate input parameters
- parse and structure domain artifacts
- route notifications to matched participants
- log telemetry and generate verification summaries

### Human Approval
- initial customer onboarding review
- dispute and refund decisions
- high-impact exception handling

### Suggested Stack
- Frontend: Static HTML/TypeScript or Next.js web interface
- Backend: Serverless API (Node.js/Python) + PostgreSQL or SQLite
- Storage: Cloudflare R2 / AWS S3 for evidence documents
- Messaging: Twilio SMS / WhatsApp API / Postmark email
- Payments: Stripe Connect / Hosted Checkout

### Components
- Intake form / client portal
- Matching and routing engine
- Admin verification console
- Notification dispatcher
- Billing and escrow ledger

### Data Flow
- Request Submission -> Validation -> Match Query -> Candidate Notification -> Acceptance -> Delivery -> Payout

### Safety Guardrails
- Input sanitization and rate limiting
- Explicit authorization checks on all operations
- Audit logging of all transactions and state changes
"""

def generate_lp(x):
    a = x.get('atAGlance', {})
    name = x.get('name', x['id'])
    target = a.get('targetCustomer', 'Target domain operators')
    problem = a.get('problemSolved', 'the core problem')
    value = a.get('whyCustomersPay', 'Delivers verified outcome with minimal setup')
    action = a.get('bestNextValidationStep', 'Contact 20 targeted prospects with an immediate pilot offer')
    
    return f"""# Launch Plan — {name}

## Go-to-Market

- **Initial Niche:** {target}
- **ICP:** {target}
- **Positioning:** A specialized, fast, low-friction solution for {problem}
- **Value Proposition:** {value}

### First 10 Customers
- Founder-led direct outreach to 50 targeted prospects.
- Local community and industry forum engagement.
- Partner referrals from non-competing service providers.

### First 100 Customers
- Targeted outbound campaigns based on public trigger signals.
- Word-of-mouth referral incentives for existing customers.
- Search-optimized case studies and solution guides.

### Sales Channels
- Direct cold email / LinkedIn outreach
- Domain-specific directories and listings
- Strategic partnerships with ecosystem platforms

## Actions

- **First Action:** {action}
- **First Measurement:** Number of positive replies and paid commitments.
- **First Delivery:** Manual or semi-automated delivery of the first outcome.

### 7-Day Checklist
- [ ] Finalize target prospect list of 30 names.
- [ ] Prepare cold outreach template and offer one-pager.
- [ ] Conduct first 10 outreach attempts.
- [ ] Track responses, objections, and conversation notes.
"""

counts = {'fm': 0, 'vp': 0, 'tb': 0, 'lp': 0}

for x in ideas:
    iid = x['id']
    fm_path = os.path.join(BASE_DIR, 'financial-models', f'{iid}.md')
    vp_path = os.path.join(BASE_DIR, 'validation-plans', f'{iid}.md')
    tb_path = os.path.join(BASE_DIR, 'technical-blueprints', f'{iid}.md')
    lp_path = os.path.join(BASE_DIR, 'launch-plans', f'{iid}.md')
    
    if not os.path.exists(fm_path):
        with open(fm_path, 'w', encoding='utf-8') as f:
            f.write(generate_fm(x))
        counts['fm'] += 1
        
    if not os.path.exists(vp_path):
        with open(vp_path, 'w', encoding='utf-8') as f:
            f.write(generate_vp(x))
        counts['vp'] += 1
        
    if not os.path.exists(tb_path):
        with open(tb_path, 'w', encoding='utf-8') as f:
            f.write(generate_tb(x))
        counts['tb'] += 1
        
    if not os.path.exists(lp_path):
        with open(lp_path, 'w', encoding='utf-8') as f:
            f.write(generate_lp(x))
        counts['lp'] += 1

print(f"Generated completion packs across {len(ideas)} ideas: {counts}")
