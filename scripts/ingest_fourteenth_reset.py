"""
VenturaAtlas OS — Fourteenth Reset Ingestion Script
===================================================
Ingests 10 new adversarial compliance & market-access opportunities into data/ideas.json (idea-298 to idea-307)
and generates 25 structured prompt files per opportunity in prompts/idea-specific/.
Also generates missing Markdown dossiers in ideas/ via generate-all-missing-dossiers.py.
"""

import os
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON = os.path.join(ROOT, "data", "ideas.json")
PROMPTS_DIR = os.path.join(ROOT, "prompts", "idea-specific")

NEW_IDEAS = [
    {
        "id": "idea-298",
        "name": "SKU Resurrection Lab — Marketplace Product Safety & Anti-Reappearance QA",
        "slug": "sku-resurrection-lab-marketplace-product-safety-qa",
        "oneSentenceConcept": "Automated adversarial attack suite for e-commerce marketplaces to prevent banned, recalled, or unsafe products from reappearing via title, image, or GTIN mutations.",
        "elevatorPitch": "Under the EU General Product Safety Regulation (GPSR) and Digital Services Act (DSA), online marketplaces face strict anti-reappearance duties and multi-million euro fines. SKU Resurrection Lab provides a synthetic red-team suite that attempts text mutations, category laundering, image manipulation, and identifier tweaks to verify that recalled items cannot re-enter catalog feeds or search indexes.",
        "category": "Marketplace & E-Commerce Compliance",
        "subcategory": "product safety",
        "tags": ["marketplace", "GPSR", "DSA", "product-safety", "red-teaming", "adversarial-qa"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.58,
            "soloFounderPotential": 8.8,
            "evidenceConfidence": 9.0,
            "highestProfitPotential": 8.6,
            "fastestPathToRevenue": 9.1,
            "lowestCapitalRequirement": 9.5
        },
        "atAGlance": {
            "targetCustomer": "E-commerce marketplaces, multi-vendor platforms, and refurbished device sites",
            "problemSolved": "Recalled or banned unsafe products sneaking back onto marketplace platforms through listing mutations",
            "whatToBuild": "Synthetic product-safety red-teaming API and regression testing harness",
            "howItMakesMoney": "Recurring testing subscription (€399/mo per marketplace) plus audit reports",
            "whyCustomersPay": "Avoid massive GPSR and DSA regulatory fines (€550M+ precedent) and protect consumer safety",
            "overallScore": 86,
            "confidenceScore": 9.0,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "1-2 weeks",
            "timeToFirstRevenue": "2-4 weeks",
            "mainAdvantage": "Manufactures synthetic safety failures safely in staging before real regulatory discovery",
            "mainRisk": "Marketplaces delaying setup until direct regulatory warning occurs",
            "bestNextValidationStep": "Offer €399 synthetic product-safety red-team audit to 30 medium-sized European marketplaces"
        }
    },
    {
        "id": "idea-299",
        "name": "Machine Safety State Drift Gate — Machinery Regulation 2027 Revalidation Engine",
        "slug": "machine-safety-state-drift-gate-machinery-regulation",
        "oneSentenceConcept": "Cross-vendor industrial software and firmware fingerprinting engine that detects silent safety-state drift across PLC, drive, and robot configurations.",
        "elevatorPitch": "The EU Machinery Regulation (applying Jan 2027) brings software updates, AI safety functions, and cybersecurity under formal machinery safety rules. Machine Safety State Drift Gate captures verified baseline fingerprints of PLCs, drives, and sensors, triggering automated revalidation workflows whenever firmware or safety parameter updates alter the validated safety case.",
        "category": "Industrial IoT & Safety Engineering",
        "subcategory": "machinery regulation",
        "tags": ["machinery-regulation", "PLC", "industrial-safety", "firmware", "drift-detection"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.44,
            "soloFounderPotential": 8.2,
            "evidenceConfidence": 8.9,
            "highestProfitPotential": 8.8,
            "fastestPathToRevenue": 8.0,
            "lowestCapitalRequirement": 8.5
        },
        "atAGlance": {
            "targetCustomer": "Machinery OEMs, industrial system integrators, and automated factory operators",
            "problemSolved": "Software and firmware updates silently altering validated safety parameters on industrial machinery",
            "whatToBuild": "Multi-vendor safety state fingerprinting and change-impact analysis engine",
            "howItMakesMoney": "Per-machine baseline fee (€750) plus annual monitoring SaaS (€149-299/machine/yr)",
            "whyCustomersPay": "Comply with mandatory EU Machinery Regulation 2027 safety-software version tracing and liability rules",
            "overallScore": 84,
            "confidenceScore": 8.9,
            "startupCost": {"currency": "EUR", "minimum": 100, "midpoint": 500, "maximum": 2000},
            "timeToMvp": "2-4 weeks",
            "timeToFirstRevenue": "4-8 weeks",
            "mainAdvantage": "Provides cross-vendor lifecycle tracking across Siemens, ABB, Keyence, and KUKA components",
            "mainRisk": "Requires industrial protocol knowledge and access to machine configuration files",
            "bestNextValidationStep": "Audit 5 industrial machinery integrators preparing for the Jan 2027 Machinery Regulation deadline"
        }
    },
    {
        "id": "idea-300",
        "name": "Live Claim Provenance Gate — Commercial Environmental Claim Lineage & Expiry",
        "slug": "live-claim-provenance-gate-greenwashing-compliance",
        "oneSentenceConcept": "Commercial claim lineage graph that maps environmental, durability, and origin claims to underlying evidence and flags expired or scope-drifted statements across channels.",
        "elevatorPitch": "Applying from 27 September 2026, EU Directive 2024/825 strictly prohibits unverified green claims ('eco-friendly', 'climate neutral', offset claims). Live Claim Provenance Gate builds a living evidence graph connecting supplier certificates to SKUs and marketing channels, ensuring claims automatically flag when supplier materials change or certificates expire.",
        "category": "Commercial Governance & ESG",
        "subcategory": "greenwashing compliance",
        "tags": ["greenwashing", "Directive-2024-825", "claim-lineage", "ESG", "provenance"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.22,
            "soloFounderPotential": 9.0,
            "evidenceConfidence": 8.8,
            "highestProfitPotential": 8.1,
            "fastestPathToRevenue": 9.4,
            "lowestCapitalRequirement": 9.6
        },
        "atAGlance": {
            "targetCustomer": "Consumer brand marketing teams, e-commerce stores, and compliance counsel",
            "problemSolved": "Commercial environmental claims remaining live online after supplier materials or certificates expire",
            "whatToBuild": "Claim-to-evidence graph scanner with automated expiry and drift alerts",
            "howItMakesMoney": "Initial €199 environmental claim sweep plus recurring brand monitoring SaaS",
            "whyCustomersPay": "Avoid regulatory enforcement and brand damage under EU Directive 2024/825 (Sep 2026 deadline)",
            "overallScore": 82,
            "confidenceScore": 8.8,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 150},
            "timeToMvp": "1 week",
            "timeToFirstRevenue": "1-2 weeks",
            "mainAdvantage": "Tracks full claim lineage from supplier input to 10+ live commercial channels",
            "mainRisk": "Generic green-claim AI scanners commoditizing simple text checks",
            "bestNextValidationStep": "Offer €199 Live Environmental Claim Sweeps to 20 D2C brands prior to 27 Sep 2026"
        }
    },
    {
        "id": "idea-301",
        "name": "FCC Robot Market-Access Graph — Foreign Mobile Robotics Authorization",
        "slug": "fcc-robot-market-access-graph-robotics-authorization",
        "oneSentenceConcept": "Regulatory origin and equipment authorization tracker for mobile robotics manufacturers navigating July 2026 FCC Covered List restrictions.",
        "elevatorPitch": "Effective July 28, 2026, the FCC added foreign-produced advanced robotic devices to its Covered List, requiring conditional approvals for U.S. market access. FCC Robot Market-Access Graph tracks robot hardware revisions, manufacturing locations, radio modules, and conditional approval status to ensure continuous compliance for warehouse and service robots.",
        "category": "Robotics & Hardware Access",
        "subcategory": "FCC market access",
        "tags": ["robotics", "FCC", "market-access", "supply-chain", "hardware-compliance"],
        "status": "researched",
        "compositeScores": {
            "overallOpportunity": 8.06,
            "soloFounderPotential": 7.8,
            "evidenceConfidence": 8.5,
            "highestProfitPotential": 8.4,
            "fastestPathToRevenue": 8.2,
            "lowestCapitalRequirement": 8.8
        },
        "atAGlance": {
            "targetCustomer": "Mobile robot OEMs, importers, distributors, and telecommunications certification bodies",
            "problemSolved": "Uncertainty surrounding FCC Covered List restrictions on foreign-produced mobile robots",
            "whatToBuild": "Robot model-variant equipment authorization status matrix and conditional approval builder",
            "howItMakesMoney": "Market-access assessment fee (€1,500) and enterprise authorization tracking",
            "whyCustomersPay": "Avoid customs holds and import bans on non-authorized mobile robotics inventory",
            "overallScore": 80,
            "confidenceScore": 8.5,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 100, "maximum": 500},
            "timeToMvp": "1-2 weeks",
            "timeToFirstRevenue": "2-4 weeks",
            "mainAdvantage": "Exploits immediate information asymmetry following July 28, 2026 FCC policy shift",
            "mainRisk": "Rapidly evolving geopolitical exemptions and TCB regulatory guidance",
            "bestNextValidationStep": "Map FCC authorization records for 15 commercial AMR/AGV robot manufacturers"
        }
    },
    {
        "id": "idea-302",
        "name": "ControlRight — Contract-to-Land-Registry Preflight & Event Clock",
        "slug": "controlright-land-registry-preflight-uk-property",
        "oneSentenceConcept": "Automated data extraction and 60-day event tracking engine for UK contractual land-control arrangements under HM Land Registry digital rules.",
        "elevatorPitch": "Mandatory from April 2027 (with 60-day filing rules applying to rights created from June 2026), UK property law requires conveyancers to submit structured data on options, pre-emptions, and promotion agreements to HM Land Registry. ControlRight extracts mandatory contractual fields, calculates title boundaries, and tracks exercise windows to prevent submission rejections.",
        "category": "Real Estate & Legal Tech",
        "subcategory": "land registry compliance",
        "tags": ["proptech", "HMLR", "land-registry", "legal-tech", "UK-property"],
        "status": "researched",
        "compositeScores": {
            "overallOpportunity": 7.92,
            "soloFounderPotential": 8.1,
            "evidenceConfidence": 8.7,
            "highestProfitPotential": 7.9,
            "fastestPathToRevenue": 8.0,
            "lowestCapitalRequirement": 9.0
        },
        "atAGlance": {
            "targetCustomer": "UK conveyancing law firms, property developers, and land agents",
            "problemSolved": "Manual data extraction errors and missed 60-day filing deadlines for HMLR land-control filings",
            "whatToBuild": "Option agreement NLP extractor, filing preflight validator, and 60-day event clock",
            "howItMakesMoney": "Per-filing preflight fee (£49) or firm-wide subscription (£299/mo)",
            "whyCustomersPay": "Avoid Land Registry notice rejections and statutory false-filing liabilities",
            "overallScore": 79,
            "confidenceScore": 8.7,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "3-6 weeks",
            "mainAdvantage": "Bridges complex 60-page legal contracts directly into HMLR structured digital schemas",
            "mainRisk": "Geographically limited to England & Wales property jurisdiction",
            "bestNextValidationStep": "Preflight 10 real UK option agreements for regional property law firms"
        }
    },
    {
        "id": "idea-303",
        "name": "Publisher Rights Probe — AI Search Publisher Conduct & Attribution Monitor",
        "slug": "publisher-rights-probe-ai-search-attribution",
        "oneSentenceConcept": "Independent measurement network that deploys canary content to monitor AI search engines for content usage, attribution accuracy, and opt-out compliance.",
        "elevatorPitch": "Following the UK CMA's June 2026 publisher conduct requirements on Google Search and AI features, publishers require objective evidence of how search engines consume and attribute their content. Publisher Rights Probe deploys canary content and query suites to independently measure AI snippet usage, click attribution, and publisher opt-out adherence.",
        "category": "Media Tech & Publisher Rights",
        "subcategory": "AI search monitoring",
        "tags": ["CMA", "publisher-rights", "AI-search", "attribution", "canary-testing"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.75,
            "soloFounderPotential": 8.0,
            "evidenceConfidence": 8.3,
            "highestProfitPotential": 7.8,
            "fastestPathToRevenue": 7.9,
            "lowestCapitalRequirement": 9.2
        },
        "atAGlance": {
            "targetCustomer": "Digital news publishers, media trade groups, and digital content owners",
            "problemSolved": "Inability for publishers to verify whether AI search engines respect opt-out rules and attribution requirements",
            "whatToBuild": "Canary content deployment system and automated AI search query probe",
            "howItMakesMoney": "Publisher audit subscription (£499/mo per publication group)",
            "whyCustomersPay": "Enforce regulatory publisher rights established under UK CMA June 2026 conduct rules",
            "overallScore": 77,
            "confidenceScore": 8.3,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 250},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "4 weeks",
            "mainAdvantage": "Provides objective, third-party canary evidence independent of platform self-reporting",
            "mainRisk": "Probabilistic nature of AI search outputs making single-query proof difficult",
            "bestNextValidationStep": "Run canary attribution probes for 3 digital UK news publishers"
        }
    },
    {
        "id": "idea-304",
        "name": "Instant-Payment Reality Grid — VoP & Non-Euro EU Instant Payment Simulator",
        "slug": "instant-payment-reality-grid-vop-simulation",
        "oneSentenceConcept": "Multi-bank synthetic test network evaluating Verification of Payee (VoP) accuracy, character diacritics, and latency across non-euro EU payment providers.",
        "elevatorPitch": "As EU non-euro Member States prepare for 2027 Instant Payments Regulation deadlines (including mandatory Verification of Payee by July 2027), payment service providers (PSPs) need real-world network testing beyond internal sandboxes. Instant-Payment Reality Grid provides synthetic multi-bank transaction testing across corporate aliases, diacritics, and edge-case account names.",
        "category": "Fintech & Payment Infrastructure",
        "subcategory": "instant payments",
        "tags": ["instant-payments", "VoP", "ECB", "fintech", "payment-testing"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.71,
            "soloFounderPotential": 7.4,
            "evidenceConfidence": 8.6,
            "highestProfitPotential": 8.2,
            "fastestPathToRevenue": 7.2,
            "lowestCapitalRequirement": 8.0
        },
        "atAGlance": {
            "targetCustomer": "Non-euro European PSPs, challenger banks, and payment gateways in Czechia, Poland, Hungary, Romania",
            "problemSolved": "Verification of Payee (VoP) failures caused by accented names, corporate aliases, and bank mismatch rules",
            "whatToBuild": "Synthetic multi-bank account testing grid and VoP mismatch analyzer",
            "howItMakesMoney": "PSP test suite license (€1,200/mo) plus integration audit reports",
            "whyCustomersPay": "Meet mandatory ECB and EU Instant Payments Regulation 2027 VoP compliance milestones",
            "overallScore": 77,
            "confidenceScore": 8.6,
            "startupCost": {"currency": "EUR", "minimum": 100, "midpoint": 500, "maximum": 2500},
            "timeToMvp": "3-4 weeks",
            "timeToFirstRevenue": "6-8 weeks",
            "mainAdvantage": "Tests production-like cross-border edge cases across non-euro banking rails",
            "mainRisk": "Requires PSP testing partnerships and multi-jurisdiction account maintenance",
            "bestNextValidationStep": "Interview payment engineering leads at 10 Central European regional banks"
        }
    },
    {
        "id": "idea-305",
        "name": "CLP Render-to-Shelf Drift Gate — Chemical Label & SDS Output Alignment",
        "slug": "clp-render-to-shelf-drift-gate-chemical-labels",
        "oneSentenceConcept": "Automated regression testing engine that compares updated chemical Safety Data Sheets (SDS) against actual print artwork files and e-commerce listings.",
        "elevatorPitch": "With revised EU Classification, Labelling and Packaging (CLP) provisions applying from July 2026 and January 2027, chemical manufacturers face liability if printed labels or online storefronts lag behind updated SDS hazard classifications. CLP Render-to-Shelf Drift Gate automatically diffs upstream SDS revisions against downstream print files and web offers.",
        "category": "Chemical & Material Compliance",
        "subcategory": "CLP chemical labelling",
        "tags": ["CLP", "ECHA", "chemical-safety", "SDS", "label-alignment"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.64,
            "soloFounderPotential": 7.9,
            "evidenceConfidence": 8.4,
            "highestProfitPotential": 7.6,
            "fastestPathToRevenue": 7.8,
            "lowestCapitalRequirement": 8.9
        },
        "atAGlance": {
            "targetCustomer": "SME chemical formulators, lubricant blenders, detergent manufacturers, and distributors",
            "problemSolved": "Printed container labels and e-commerce listings displaying outdated hazard symbols after SDS updates",
            "whatToBuild": "SDS PDF parser to label artwork vector diffing engine",
            "howItMakesMoney": "Per-SKU label audit fee (€49) or annual monitoring SaaS (€299/mo)",
            "whyCustomersPay": "Prevent market withdrawals and enforcement actions under revised EU CLP rules",
            "overallScore": 76,
            "confidenceScore": 8.4,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "3-4 weeks",
            "mainAdvantage": "Provides lightweight independent QA without expensive enterprise SDS authoring software",
            "mainRisk": "Dominant incumbents (Lisam, Sphera) occupying enterprise SDS authoring workflows",
            "bestNextValidationStep": "Run label-vs-SDS diffs for 15 mid-sized chemical blenders"
        }
    },
    {
        "id": "idea-306",
        "name": "Subscription Rights Chaos Lab — Recurring Payment State-Machine QA",
        "slug": "subscription-rights-chaos-lab-recurring-payment-qa",
        "oneSentenceConcept": "Automated lifecycle test suite for subscription platforms to verify renewal notices, 14-day cooling-off refunds, and one-click cancellation flows.",
        "elevatorPitch": "Ahead of the UK's Spring 2027 subscription contract reforms (mandating clear pre-contract terms, mandatory renewal reminders, cooling-off rights, and easy online cancellation), Subscription Rights Chaos Lab executes end-to-end synthetic subscriber lifecycles to detect billing state-machine bugs and notice delivery failures.",
        "category": "Consumer Protection & Billing Tech",
        "subcategory": "subscription compliance",
        "tags": ["subscription", "billing", "consumer-rights", "state-machine", "cancellation-QA"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.51,
            "soloFounderPotential": 8.1,
            "evidenceConfidence": 8.2,
            "highestProfitPotential": 7.3,
            "fastestPathToRevenue": 7.7,
            "lowestCapitalRequirement": 9.1
        },
        "atAGlance": {
            "targetCustomer": "SaaS platforms, media subscription businesses, and e-commerce box services",
            "problemSolved": "Silent failures in subscription renewal reminder emails and online cancellation state transitions",
            "whatToBuild": "Synthetic subscriber lifecycle harness and email notice verification probe",
            "howItMakesMoney": "Subscription testing SaaS (£199/mo per billing app)",
            "whyCustomersPay": "Comply with UK Spring 2027 subscription law and reduce customer support chargebacks",
            "overallScore": 75,
            "confidenceScore": 8.2,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "3-5 weeks",
            "mainAdvantage": "Tests full 365-day subscriber journey programmatically in staging",
            "mainRisk": "Major subscription billing platforms (Stripe Billing, Chargebee) absorbing basic reminders natively",
            "bestNextValidationStep": "Test cancellation and notice flows for 10 UK subscription SaaS platforms"
        }
    },
    {
        "id": "idea-307",
        "name": "Connected-Vehicle Origin Graph — MY2027 Vehicle Software Origin Compliance",
        "slug": "connected-vehicle-origin-graph-automotive-compliance",
        "oneSentenceConcept": "Supply-chain software origin and ECU dependency graph for automotive OEMs preparing for U.S. Model Year 2027 connected-vehicle restrictions.",
        "elevatorPitch": "U.S. Department of Commerce Bureau of Industry and Security (BIS) regulations starting Model Year 2027 restrict foreign software and hardware components in connected vehicles. Connected-Vehicle Origin Graph maps ECU firmware, developer jurisdictions, and telematics modules to generate 60-day pre-import Declarations of Conformity.",
        "category": "Automotive & Supply Chain",
        "subcategory": "connected vehicle compliance",
        "tags": ["automotive", "BIS", "connected-vehicles", "supply-chain", "software-origin"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.37,
            "soloFounderPotential": 6.8,
            "evidenceConfidence": 8.4,
            "highestProfitPotential": 8.7,
            "fastestPathToRevenue": 6.5,
            "lowestCapitalRequirement": 8.1
        },
        "atAGlance": {
            "targetCustomer": "Tier-1 automotive suppliers, EV manufacturers, and automotive compliance counsel",
            "problemSolved": "Inability to verify foreign software component origin across complex ECU software BOMs",
            "whatToBuild": "ECU firmware jurisdiction mapper and BIS Declaration of Conformity builder",
            "howItMakesMoney": "Enterprise platform license (€5,000/mo) per vehicle model program",
            "whyCustomersPay": "Avoid U.S. import bans and vehicle sales freezes under MY2027 BIS rules",
            "overallScore": 73,
            "confidenceScore": 8.4,
            "startupCost": {"currency": "EUR", "minimum": 200, "midpoint": 1000, "maximum": 5000},
            "timeToMvp": "4 weeks",
            "timeToFirstRevenue": "8-12 weeks",
            "mainAdvantage": "Directly addresses mandatory 60-day BIS Declaration of Conformity requirements",
            "mainRisk": "Long enterprise sales cycles with Tier-1 automotive procurement departments",
            "bestNextValidationStep": "Interview 5 automotive supply chain directors on MY2027 software origin readiness"
        }
    }
]

PROMPT_CATEGORIES = [
    ("01-problem-validation.md", "Problem Validation & Customer Pain Research"),
    ("02-target-customer-icp.md", "Target Customer & Ideal Customer Profile (ICP) Analysis"),
    ("03-solution-architecture.md", "Solution Architecture & Core Feature Specification"),
    ("04-competitor-matrix.md", "Competitive Landscape & Market Whitespace Mapping"),
    ("05-pricing-economics.md", "Pricing Model & Unit Economics Blueprint"),
    ("06-acquisition-channels.md", "Go-To-Market & Initial Customer Acquisition"),
    ("07-7day-validation-sprint.md", "7-Day Zero-Capital Validation Experiment"),
    ("08-technical-stack.md", "Technical Stack & Infrastructure Blueprint"),
    ("09-mvp-feature-scope.md", "MVP Scope & Feature Prioritization Matrix"),
    ("10-risk-and-fail-modes.md", "Risk Analysis & Kill-Criteria Identification"),
    ("11-regulatory-compliance.md", "Regulatory Compliance & Legal Framework Blueprint"),
    ("12-cold-outreach-scripts.md", "Cold Outreach & B2B Pitch Scripts"),
    ("13-landing-page-copy.md", "High-Converting Landing Page Copy & Messaging"),
    ("14-customer-interview-script.md", "Customer Discovery Interview Guide & Questions"),
    ("15-onboarding-workflow.md", "User Onboarding & Product Activation Workflow"),
    ("16-retention-engagement.md", "Customer Retention & Usage Expansion Playbook"),
    ("17-financial-scenario-model.md", "Financial Model & 3-Year Projection Scenarios"),
    ("18-api-contract-spec.md", "REST/GraphQL API Contract & Data Schema Specification"),
    ("19-security-threat-model.md", "Security & Data Privacy Threat Model"),
    ("20-marketing-content-plan.md", "Thought Leadership & Inbound Content Strategy"),
    ("21-investor-pitch-deck.md", "10-Slide Investor Pitch Deck Blueprint"),
    ("22-partner-channel-strategy.md", "Partnership & Channel Reseller Strategy"),
    ("23-customer-support-playbook.md", "Customer Support & Incident Escalation SLA"),
    ("24-churn-prevention.md", "Churn Risk Detection & Customer Win-Back Playbook"),
    ("25-scaling-roadmap.md", "Scale-Up Roadmap & International Expansion Strategy")
]

def generate_prompt_content(idea: dict, filename: str, title: str) -> str:
    return f"""# {idea['name']} — {title}

> **Idea ID**: `{idea['id']}` | **Category**: {idea['category']} | **Target Score**: {idea['atAGlance']['overallScore']}/100

## Objective
Act as a world-class startup strategist, domain expert, and technical architect. Analyze **{idea['name']}** through the lens of **{title}**.

## Context & Baseline
- **One-Sentence Concept**: {idea['oneSentenceConcept']}
- **Elevator Pitch**: {idea['elevatorPitch']}
- **Target Customer**: {idea['atAGlance']['targetCustomer']}
- **Problem Solved**: {idea['atAGlance']['problemSolved']}
- **Business Model**: {idea['atAGlance']['howItMakesMoney']}

## Execution Directive
Provide a rigorous, actionable, and evidence-backed breakdown for **{title}**. Ensure all assumptions include concrete validation metrics, kill criteria, and risk mitigation strategies.
"""

def ingest():
    print("=== Ingesting Fourteenth Reset Opportunities (idea-298 to idea-307) ===")

    with open(IDEAS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_ideas = data.get("ideas", [])
    existing_ids = set(x["id"] for x in existing_ideas)

    added_count = 0
    for new_idea in NEW_IDEAS:
        if new_idea["id"] not in existing_ids:
            full_entry = {
                "schemaVersion": "2.0.0",
                "id": new_idea["id"],
                "slug": new_idea["slug"],
                "name": new_idea["name"],
                "oneSentenceConcept": new_idea["oneSentenceConcept"],
                "elevatorPitch": new_idea["elevatorPitch"],
                "detailedDescription": new_idea["elevatorPitch"],
                "category": new_idea["category"],
                "subcategory": new_idea["subcategory"],
                "tags": new_idea["tags"],
                "status": new_idea["status"],
                "sourceReferences": ["s01", "s02"],
                "provenance": {
                    "sourceType": "Fourteenth Reset Deep Research Investigation #8",
                    "originalWordingAvailable": "full",
                    "notes": "Adversarial compliance QA & market-access gate research"
                },
                "compositeScores": new_idea["compositeScores"],
                "atAGlance": new_idea["atAGlance"]
            }
            existing_ideas.append(full_entry)
            added_count += 1
        else:
            # Update sourceReferences if needed
            for ex in existing_ideas:
                if ex["id"] == new_idea["id"]:
                    ex["sourceReferences"] = ["s01", "s02"]

    data["ideas"] = existing_ideas

    with open(IDEAS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"[OK] Ingested {added_count} new canonical ideas into data/ideas.json (Total: {len(existing_ideas)})")

    # Generate prompt packs
    prompts_created = 0
    for new_idea in NEW_IDEAS:
        idea_dir = os.path.join(PROMPTS_DIR, new_idea["id"])
        os.makedirs(idea_dir, exist_ok=True)
        for fname, title in PROMPT_CATEGORIES:
            fpath = os.path.join(idea_dir, fname)
            content = generate_prompt_content(new_idea, fname, title)
            with open(fpath, "w", encoding="utf-8") as pf:
                pf.write(content)
            prompts_created += 1

    print(f"[OK] Created {prompts_created} prompt files in prompts/idea-specific/")

    # Generate missing dossiers
    print("=== Generating Markdown Dossiers in ideas/ ===")
    dossier_script = os.path.join(ROOT, "scripts", "generate-all-missing-dossiers.py")
    subprocess.run(["python", dossier_script], check=True)

if __name__ == "__main__":
    ingest()
