import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ideas_file = os.path.join(ROOT, "data", "ideas.json")
sources_file = os.path.join(ROOT, "data", "sources.json")
rankings_file = os.path.join(ROOT, "data", "rankings.json")
meta_file = os.path.join(ROOT, "data", "repository-meta.json")

with open(ideas_file, 'r', encoding='utf-8') as f:
    ideas_data = json.load(f)

with open(sources_file, 'r', encoding='utf-8') as f:
    sources_data = json.load(f)

with open(rankings_file, 'r', encoding='utf-8') as f:
    rankings_data = json.load(f)

with open(meta_file, 'r', encoding='utf-8') as f:
    meta_data = json.load(f)

# 1. New Sources
new_sources = [
    {
        "id": "s63",
        "title": "ESHRE Position Paper: Limits on the number of offspring per gamete donor",
        "type": "position_paper",
        "publisher": "European Society of Human Reproduction and Embryology (ESHRE)",
        "date": "2026-06",
        "url": "https://www.eshre.eu/-/media/sitecore-files/Advocacy/ESHRE_PositionPaper_Limits-2506.pdf",
        "accessDate": "2026-08-09",
        "supports": ["cross-border donor limits", "EU-wide donor registry", "50 family limit reduction"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-385", "idea-391"]
    },
    {
        "id": "s64",
        "title": "Council of Europe Recommendation on Protection of Third-Party Gamete Donors",
        "type": "regulatory_recommendation",
        "publisher": "EDQM / Council of Europe",
        "date": "2026-06",
        "url": "https://www.edqm.eu/en/-/new-recommendation-provides-guidance-on-protection-of-third-party-gamete-donors",
        "accessDate": "2026-08-09",
        "supports": ["donor registries", "cross-border traceability", "adverse reaction reporting"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-385", "idea-391"]
    },
    {
        "id": "s65",
        "title": "EU Substances of Human Origin (SoHO) Regulation (EU) 2024/1938",
        "type": "eu_regulation",
        "publisher": "European Parliament and Council",
        "date": "2024-05",
        "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1938",
        "accessDate": "2026-08-09",
        "supports": ["SoHO entity registration", "serious adverse reaction reporting", "traceability mandates"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-385", "idea-391"]
    },
    {
        "id": "s66",
        "title": "Austrian BASG Post-Donation Safety Notice on Offspring Genetic Signals",
        "type": "safety_alert",
        "publisher": "Bundesamt für Sicherheit im Gesundheitswesen (BASG)",
        "date": "2026-06-30",
        "url": "https://www.basg.gv.at/en/consumers/safety-information/safety-information-medical-devices",
        "accessDate": "2026-08-09",
        "supports": ["post-donation safety signals", "genetic adverse reactions", "cryobank recalls"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-385", "idea-391"]
    },
    {
        "id": "s67",
        "title": "EU AI Act Article 50 Implementation Guidelines & Code of Practice",
        "type": "guideline",
        "publisher": "European AI Office / European Commission",
        "date": "2026-08-02",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
        "accessDate": "2026-08-09",
        "supports": ["machine-readable marking", "C2PA compliance", "transparency obligations"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-386"]
    },
    {
        "id": "s68",
        "title": "G7 Principles for AI Software Bill of Materials (AI-BOM)",
        "type": "g7_guideline",
        "publisher": "G7 Digital & Tech Ministers / Agenzia delle Entrate",
        "date": "2026-05",
        "url": "https://www.g7italy.it/en/news/g7-tech-ministers-statement/",
        "accessDate": "2026-08-09",
        "supports": ["AI-BOM standards", "model provenance", "dependency tracking"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-387"]
    },
    {
        "id": "s69",
        "title": "EU Carbon Removal Certification Framework (CRCF) Methodology Standard",
        "type": "eu_regulation",
        "publisher": "European Commission DG Climate Action",
        "date": "2026-02",
        "url": "https://climate.ec.europa.eu/eu-action/carbon-removals_en",
        "accessDate": "2026-08-09",
        "supports": ["permanent removals certification", "reversal liability", "buffer accounts"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-388"]
    },
    {
        "id": "s70",
        "title": "EU Forced Labour Regulation (EU) 2024/1390 Implementation Portal",
        "type": "eu_portal",
        "publisher": "European Commission DG GROW",
        "date": "2026-06-26",
        "url": "https://single-market-economy.ec.europa.eu/single-market/goods/forced-labour-product-ban_en",
        "accessDate": "2026-08-09",
        "supports": ["forced labour prohibitions", "investigation portals", "supply chain evidence"],
        "confidenceLabel": "high",
        "sourceType": "primary",
        "researchRound": "10",
        "ideaIds": ["idea-390"]
    }
]

existing_source_ids = set(s.get('id') for s in sources_data)
for ns in new_sources:
    if ns['id'] not in existing_source_ids:
        sources_data.append(ns)

# 2. New Ideas
new_ideas = [
    {
        "schemaVersion": "2.0.0",
        "id": "idea-385",
        "slug": "kinledger-donorrecall-network",
        "name": "KinLedger / DonorRecall — Privacy-Preserving Gamete Donor Coordination Ledger",
        "oneSentenceConcept": "Privacy-preserving cross-institution coordination network and family-limit ledger preventing donor over-donation and accelerating genetic safety signal recalls under EU SoHO rules.",
        "elevatorPitch": "European gamete donation is inherently cross-border, yet no individual cryobank or clinic can track global family limits or reach affected recipients when a genetic mutation is discovered. KinLedger provides a pseudonymous coordination protocol where institutions verify real-time family slot capacity and route genetic safety notifications without centralizing recipient or donor identities.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 9.76 / 10). Under the EU Substances of Human Origin (SoHO) Regulation 2024/1938 and ESHRE 2026 recommendations, cross-border family caps and serious adverse reaction tracing require cross-institutional coordination. KinLedger provides cryptographic identity resolution, FamilySlot reservation transactions, and GeneticRecall notification graphs between sperm banks, IVF clinics, and health authorities.",
        "category": "Healthcare & SoHO Compliance",
        "subcategory": "Reproductive Technology & Biosecurity",
        "tags": ["reproductive-health", "privacy", "soho", "donor-conception", "vigilance", "network-protocol"],
        "alternativeNames": ["KinLedger", "DonorRecall Network", "GameteSlot Ledger"],
        "relatedIdeaIds": ["idea-391", "idea-375", "idea-001"],
        "status": "priority",
        "sourceReferences": ["s63", "s64", "s65", "s66"],
        "provenance": {
            "sourceType": "Deep Research Round #10",
            "originalWordingAvailable": "full_thesis",
            "notes": "Top entrant of Round #10 (9.76 score)"
        },
        "atAGlance": {
            "targetCustomer": "International sperm banks, multi-country IVF clinic networks, and SoHO competent authorities",
            "problemSolved": "Donors exceeding domestic/international family caps across multiple banks under different aliases, and delayed, incomplete tracing during serious genetic safety recalls.",
            "whatToBuild": "Pseudonymous identity resolution service, real-time FamilySlot reservation API (reserve, consume, release), and automated GeneticRecall notice routing.",
            "howItMakesMoney": "Bank/clinic network subscriptions (€5k-€25k/yr) + €X per active donor token + €Y per FamilySlot transaction + enterprise recall SLA tier.",
            "whyCustomersPay": "Cryobanks and clinics must comply with SoHO 2027 mandates, satisfy insurance underwriters, and protect against massive multi-jurisdictional liability from undetected genetic disease transmission.",
            "estimatedEarningPotential": {
                "currency": "EUR",
                "annualRunRate": "€1.5M - €6.0M within 3 years",
                "marginEstimate": "82%"
            },
            "startupCost": {
                "minimum": 0,
                "maximum": 500,
                "midpoint": 250,
                "currency": "EUR"
            },
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 97.6,
            "mainAdvantage": "Neutral, privacy-preserving state layer solving cross-institution coordination that no single clinic or bank can solve independently.",
            "mainRisk": "Consortium cold start and initial adoption friction among competing cryobanks.",
            "bestNextValidationStep": "Conduct diligence with 3 international sperm banks to audit cross-border family-cap reservation workflows."
        },
        "compositeScores": {
            "overallAttractiveness": 97.6,
            "highestProfitPotential": 94,
            "lowestCostLaunch": 92,
            "fastestPathToRevenue": 88,
            "bestForSoloFounder": 82,
            "bestForTechnicalFounder": 96,
            "bestForNontechnicalFounder": 68,
            "aiAgentPotential": 85,
            "bestRequiringLittleCapital": 94,
            "compositeHeadline": 97.6
        },
        "scores": {
            "overallConfidence": {"value": 9, "rationale": "Supported by ESHRE 2026 position paper and EU SoHO Regulation 2024/1938."}
        },
        "frontierTier": True,
        "validationStatus": "frontier_opportunity"
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-386",
        "slug": "provenancechaos-markci",
        "name": "ProvenanceChaos / MarkCI — AI-Content Provenance Whole-Pipeline Chaos Harness",
        "oneSentenceConcept": "Whole-pipeline automated chaos testing and QA harness verifying whether C2PA Content Credentials and invisible AI watermarks survive complex media transformation pipelines.",
        "elevatorPitch": "While individual tools comply with C2PA standards, real enterprise publishing pipelines (DAM → Photoshop → CMS → CDN → Mobile Transcoder → Social) frequently strip or corrupt provenance metadata. MarkCI injects synthetic AI assets into CI/CD pipelines to test every media transformation hop and detect provenance loss before publishing.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 9.43 / 10). EU AI Act Article 50 transparency obligations require machine-readable marking of generated media. MarkCI acts as chaos engineering for AI provenance, continuously testing image and video processing steps across C2PA, SynthID, and visible watermark preservation.",
        "category": "Developer tools & infrastructure",
        "subcategory": "AI Governance & QA Automation",
        "tags": ["c2pa", "ai-act", "provenance", "chaos-engineering", "ci-cd", "watermarking"],
        "alternativeNames": ["ProvenanceChaos", "MarkCI", "C2PA Chaos Test Suite"],
        "relatedIdeaIds": ["idea-001", "idea-049", "idea-374"],
        "status": "priority",
        "sourceReferences": ["s67"],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis", "notes": "Round #10 #2 entrant (9.43 score)"},
        "atAGlance": {
            "targetCustomer": "Media publishers, AI image/video SaaS platforms, broadcasters, and digital asset management (DAM) vendors",
            "problemSolved": "Provenance metadata silently stripped during image optimization, WebP/AVIF conversions, and mobile export steps, causing EU AI Act Article 50 non-compliance.",
            "whatToBuild": "CI/CD integration, synthetic provenance asset generator, multi-stage media transformation pipeline runner, and provenance regression reporter.",
            "howItMakesMoney": "Developer SaaS plans ($99-$499/mo) + enterprise pipeline monitoring tier ($2,500/mo).",
            "whyCustomersPay": "Avoid compliance fines under EU AI Act Article 50 and prevent brand damage from un-marked AI deepfakes.",
            "estimatedEarningPotential": {"currency": "USD", "annualRunRate": "$1.2M - $4.5M", "marginEstimate": "86%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "USD"},
            "timeToMvp": "7 days",
            "timeToFirstRevenue": "7-14 days",
            "overallScore": 94.3,
            "mainAdvantage": "Focuses on end-to-end pipeline survival rather than isolated component compliance.",
            "mainRisk": "Evolving C2PA and watermarking specifications across diverse codecs.",
            "bestNextValidationStep": "Run automated C2PA survival tests across top 10 commercial CDNs and image optimization services."
        },
        "compositeScores": {"overallAttractiveness": 94.3, "compositeHeadline": 94.3},
        "scores": {"overallConfidence": {"value": 9, "rationale": "EU AI Act Art. 50 effective August 2, 2026."}},
        "frontierTier": True,
        "validationStatus": "frontier_opportunity"
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-387",
        "slug": "licensemeter-modelrights-compiler",
        "name": "LicenseMeter / ModelRights Compiler — Dynamic AI Model License Telemetry Compiler",
        "oneSentenceConcept": "Dynamic SCA compiler mapping open AI model licenses to real-time business telemetry (revenue, MAU, external SaaS deployment) to enforce active commercial thresholds.",
        "elevatorPitch": "Open AI model licenses (Qwen, Kimi, Llama 3) increasingly embed dynamic commercial triggers—such as revenue caps ($20M/yr), MAU thresholds, or mandatory revenue-sharing agreements. Static open-source scanners can identify model licenses but fail to monitor runtime business metrics. LicenseMeter binds model license terms to live telemetry to alert legal teams before thresholds are breached.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 9.21 / 10). Combines G7 AI-BOM standards with executable rights contracts, auditing dataset → base model → fine-tune → LoRA → application lineage against live sales and active user telemetry.",
        "category": "Developer tools & infrastructure",
        "subcategory": "AI License Compliance & Telemetry",
        "tags": ["ai-license", "open-models", "telemetry", "ai-bom", "compliance-compiler", "sca"],
        "alternativeNames": ["LicenseMeter", "ModelRights Compiler", "AI License Gatekeeper"],
        "relatedIdeaIds": ["idea-001", "idea-010", "idea-374"],
        "status": "priority",
        "sourceReferences": ["s68"],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis", "notes": "Round #10 #3 entrant (9.21 score)"},
        "atAGlance": {
            "targetCustomer": "AI product leads, enterprise CTOs, and legal/IP counsel at fast-growing AI startups",
            "problemSolved": "Unexpected license non-compliance and retro-active billing when open model usage crosses un-tracked commercial revenue or MAU thresholds.",
            "whatToBuild": "AI-BOM parser, executable license DSL compiler, business metric telemetry SDK, and CI/CD release gatekeeper.",
            "howItMakesMoney": "SaaS tiers ($199-$999/mo) + enterprise AI legal gate tier ($3,500/mo).",
            "whyCustomersPay": "Avoid breach-of-contract lawsuits and unexpected licensing fees from major open-model AI providers.",
            "estimatedEarningPotential": {"currency": "USD", "annualRunRate": "$1.0M - $3.8M", "marginEstimate": "85%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "USD"},
            "timeToMvp": "10 days",
            "timeToFirstRevenue": "10-20 days",
            "overallScore": 92.1,
            "mainAdvantage": "Connects static model licenses to dynamic runtime business telemetry.",
            "mainRisk": "Encroachment by traditional SCA vendors like Black Duck or Mend.",
            "bestNextValidationStep": "Compile top 20 open AI model licenses into machine-readable JSON rules."
        },
        "compositeScores": {"overallAttractiveness": 92.1, "compositeHeadline": 92.1},
        "scores": {"overallConfidence": {"value": 8, "rationale": "High relevance due to 2026 open-model commercial licensing shifts."}},
        "frontierTier": True,
        "validationStatus": "frontier_opportunity"
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-388",
        "slug": "permanencedesk-carbon-liability-ledger",
        "name": "PermanenceDesk — Certified Carbon Removal Asset-Liability Management Ledger",
        "oneSentenceConcept": "Asset-liability management and reversal risk tracking ledger for certified permanent carbon removals under the EU Carbon Removal Certification Framework (CRCF).",
        "elevatorPitch": "Under the EU CRCF (adopted Feb 2026), permanent carbon removals (DACCS, BioCCS, biochar) carry multi-decade monitoring, buffer pool, and reversal replacement liabilities. PermanenceDesk tracks issued removal units against physical storage conditions, buffer contributions, and insurance policies to audit carbon liability balance sheets.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 8.96 / 10). Replaces simplistic carbon registries with bank-grade asset-liability management, tracking credit issuance, physical storage degradation, buffer pool coverage, and contract transfer obligations.",
        "category": "Climate Resilience & Insurance Tech",
        "subcategory": "Carbon Removals & Asset-Liability Management",
        "tags": ["carbon-removals", "crcf", "permanence", "liability-ledger", "reversal-risk", "mrv"],
        "alternativeNames": ["PermanenceDesk", "Carbon Reversal Ledger"],
        "relatedIdeaIds": ["idea-380", "idea-378"],
        "status": "researched",
        "sourceReferences": ["s69"],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "Carbon removal project developers, corporate carbon buyers, carbon insurers, and climate funds",
            "problemSolved": "Unquantified reversal liabilities and uncoordinated buffer pool contributions over 10-to-100 year carbon storage horizons.",
            "whatToBuild": "Physical storage link module, buffer account ledger, monitoring schedule manager, and reversal liability scenario generator.",
            "howItMakesMoney": "Platform license (€1,500-€5,000/mo) + fee per tracked tCO2.",
            "whyCustomersPay": "Comply with EU CRCF 2026 audit requirements and maintain defensible net-zero balance sheets.",
            "estimatedEarningPotential": {"currency": "EUR", "annualRunRate": "€800k - €3.0M", "marginEstimate": "80%"},
            "startupCost": {"minimum": 0, "maximum": 200, "midpoint": 100, "currency": "EUR"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 89.6
        },
        "compositeScores": {"overallAttractiveness": 89.6, "compositeHeadline": 89.6},
        "scores": {"overallConfidence": {"value": 8, "rationale": "Backed by EU CRCF 2026 methodology adoption."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-389",
        "slug": "datacentre-labeltwin",
        "name": "DataCentre LabelTwin — EU Sustainability Rating Simulator & Optimization Engine",
        "oneSentenceConcept": "Pre-observation rating simulator predicting EU data centre sustainability grades (A-G) and evaluating ROI on efficiency retrofits before official reporting windows close.",
        "elevatorPitch": "The European Commission is introducing mandatory electronic sustainability labels for data centres covering energy efficiency, water use, clean energy, waste-heat reuse, and grid flexibility. DataCentre LabelTwin allows operators to simulate retrofit scenarios (chillers, heat export, solar PPAs) and optimize their projected rating before official rating periods close.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 8.73 / 10). Converts complex EU rating formulas into an interactive digital twin that models operational adjustments and capex investments against target energy grades.",
        "category": "Cloud & B2B SaaS",
        "subcategory": "Data Centre Sustainability & Benchmarking",
        "tags": ["data-centre", "sustainability-label", "energy-efficiency", "benchmarking", "simulation"],
        "alternativeNames": ["DataCentre LabelTwin", "DC Rating Simulator"],
        "relatedIdeaIds": ["idea-380", "idea-378"],
        "status": "researched",
        "sourceReferences": [],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "Colocation data centre operators, hyperscalers, and infrastructure real estate funds",
            "problemSolved": "Uncertainty over future EU sustainability rating grades and sub-optimal capex allocation on data centre retrofits.",
            "whatToBuild": "Telemetry ingestion pipeline, EU label formula engine, retrofit scenario builder, and regional benchmark map.",
            "howItMakesMoney": "Facility subscription (€2,000-€8,000/mo per data centre campus).",
            "whyCustomersPay": "Win enterprise tenant contracts that require Grade-A/B sustainable data hosting.",
            "estimatedEarningPotential": {"currency": "EUR", "annualRunRate": "€900k - €3.2M", "marginEstimate": "84%"},
            "startupCost": {"minimum": 0, "maximum": 200, "midpoint": 100, "currency": "EUR"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 87.3
        },
        "compositeScores": {"overallAttractiveness": 87.3, "compositeHeadline": 87.3},
        "scores": {"overallConfidence": {"value": 8, "rationale": "Aligned with EU 2026 data centre sustainability label roadmap."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-390",
        "slug": "forcedlabor-casegraph",
        "name": "ForcedLabor CaseGraph — Supply Chain Allegation Blast-Radius & Response Engine",
        "oneSentenceConcept": "Allegation incident response platform reconstructing multi-tier supply chain blast-radius and freezing historical evidence when forced labor claims emerge.",
        "elevatorPitch": "When EU authorities investigate a product under the EU Forced Labour Regulation (EU 2024/1390), companies must immediately identify every SKU, factory, and transit shipment sharing the alleged subcomponent. ForcedLabor CaseGraph acts as incident response for supply chains, rapidly tracing blast-radius and assembling immutable evidence packages for regulatory defense.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 8.58 / 10). Replaces static annual ESG questionnaires with dynamic temporal graph reconstruction, pinpointing affected SKUs and inventory within hours of a regulatory notice.",
        "category": "Audit & Financial Forensics",
        "subcategory": "Supply Chain Incident Response",
        "tags": ["forced-labour", "supply-chain", "incident-response", "sku-blast-radius", "evidence-freezing"],
        "alternativeNames": ["ForcedLabor CaseGraph", "Supply Chain BlastRadius"],
        "relatedIdeaIds": ["idea-376", "idea-381"],
        "status": "researched",
        "sourceReferences": ["s70"],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "Enterprise supply chain leads, importers, trade counsel, and compliance directors",
            "problemSolved": "Slow, manual supply chain mapping during urgent regulatory forced labor investigations, risking import bans and inventory seizures.",
            "whatToBuild": "Temporal BOM graph engine, SKU blast-radius calculator, evidence snapshot recorder, and customs response portal.",
            "howItMakesMoney": "Annual enterprise license ($15,000-$50,000/yr) + incident response burst pricing.",
            "whyCustomersPay": "Protect multi-million-dollar shipments from EU customs bans and market exclusion.",
            "estimatedEarningPotential": {"currency": "USD", "annualRunRate": "$1.1M - $4.0M", "marginEstimate": "83%"},
            "startupCost": {"minimum": 0, "maximum": 200, "midpoint": 100, "currency": "USD"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 85.8
        },
        "compositeScores": {"overallAttractiveness": 85.8, "compositeHeadline": 85.8},
        "scores": {"overallConfidence": {"value": 8, "rationale": "EU Forced Labour Regulation implementation portal launched June 2026."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-391",
        "slug": "donor-variantwatch",
        "name": "Donor VariantWatch — Post-Donation Genomic Surveillance Engine",
        "oneSentenceConcept": "Post-donation genomic surveillance engine tracking shifting variant interpretations and alerting cryobanks to re-evaluate historical donor screening panels.",
        "elevatorPitch": "Genomic screening panel interpretations evolve over time; a donor variant classified as benign or VUS during donation may later be reclassified as pathogenic. VariantWatch acts as automated genomic surveillance for gamete banks, continuous matching historical donor test panels against authoritative variant databases to trigger qualified clinical review.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 8.51 / 10). Designed as an enterprise module for KinLedger or standalone cryobanks, ensuring continuous vigilance under EU SoHO adverse reaction rules.",
        "category": "Healthcare & SoHO Compliance",
        "subcategory": "Genomic Surveillance & Vigilance",
        "tags": ["genomic-surveillance", "variant-interpretation", "donor-screening", "cryobank", "vigilance"],
        "alternativeNames": ["Donor VariantWatch", "CryoGenomic Watch"],
        "relatedIdeaIds": ["idea-385"],
        "status": "researched",
        "sourceReferences": ["s63", "s65", "s66"],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "Cryobank medical directors, clinical geneticists, and reproductive health labs",
            "problemSolved": "Undetected genetic risk when donor screening interpretations change years after gamete distribution.",
            "whatToBuild": "Historical variant panel repository, ClinVar/GTR delta watcher, donor impact matcher, and clinical review workflow.",
            "howItMakesMoney": "Subscription per donor panel monitored (€2-€5/donor/yr).",
            "whyCustomersPay": "Fulfill mandatory SoHO biovigilance obligations and prevent inherited disease transmission.",
            "estimatedEarningPotential": {"currency": "EUR", "annualRunRate": "€600k - €2.2M", "marginEstimate": "88%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "EUR"},
            "timeToMvp": "10 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 85.1
        },
        "compositeScores": {"overallAttractiveness": 85.1, "compositeHeadline": 85.1},
        "scores": {"overallConfidence": {"value": 8, "rationale": "High biovigilance relevance under SoHO Regulation."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-392",
        "slug": "energyshare-auditor",
        "name": "EnergyShare Auditor — Peer-to-Peer Energy Allocation & Billing Audit Engine",
        "oneSentenceConcept": "Independent allocation and billing auditor verifying peer-to-peer renewable energy sharing calculations under EU electricity market reform rules.",
        "elevatorPitch": "EU electricity market reforms grant consumers the legal right to share self-generated renewable energy across grid nodes. EnergyShare Auditor acts as an independent billing auditor for energy communities and utilities, reconciling 15-minute smart meter intervals to verify that shared solar/wind energy is accurately deducted from consumer utility bills.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 7.96 / 10). Audits grid operator tariffs, community sharing keys, and supplier netting algorithms to eliminate billing discrepancies in distributed energy sharing.",
        "category": "Audit & Financial Forensics",
        "subcategory": "Peer-to-Peer Energy & Billing",
        "tags": ["energy-sharing", "billing-audit", "p2p-energy", "electricity-market", "grid-allocation"],
        "alternativeNames": ["EnergyShare Auditor", "P2P Energy Ledger"],
        "relatedIdeaIds": ["idea-378"],
        "status": "explore",
        "sourceReferences": [],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "Energy community managers, municipal utilities, housing associations, and regulatory auditors",
            "problemSolved": "Billing errors, disputed grid fees, and unverified energy allocation ratios in consumer energy sharing schemes.",
            "whatToBuild": "Smart meter telemetry parser, 15-min netting engine, tariff rule validator, and community billing export.",
            "howItMakesMoney": "Monthly audit fee per connected meter (€1-€3/meter/mo).",
            "whyCustomersPay": "Guarantee transparent energy sharing credits and resolve billing disputes.",
            "estimatedEarningPotential": {"currency": "EUR", "annualRunRate": "€500k - €1.8M", "marginEstimate": "80%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "EUR"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 79.6
        },
        "compositeScores": {"overallAttractiveness": 79.6, "compositeHeadline": 79.6},
        "scores": {"overallConfidence": {"value": 7, "rationale": "Emerging P2P energy market under EU directive."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-393",
        "slug": "bioscreen-bench",
        "name": "BioScreen Bench — DNA Synthesis Provider Biosecurity Benchmark",
        "oneSentenceConcept": "Biosecurity screening benchmark and customer verification engine evaluating gene synthesis providers against Global Guidance for Synthetic Nucleic Acid Providers (GDM 2026).",
        "elevatorPitch": "Gene synthesis providers must screen dual-use pathogen sequences and verify customer legitimacy before manufacturing custom DNA. BioScreen Bench provides automated biosecurity benchmark suites, evaluating provider screening accuracy and streamlining customer verification workflows.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 7.82 / 10). Audits sequence screening algorithms and customer identity checks against international biosecurity standards.",
        "category": "Developer tools & infrastructure",
        "subcategory": "Biosecurity & DNA Synthesis",
        "tags": ["biosecurity", "dna-synthesis", "customer-screening", "benchmarking", "gene-synthesis"],
        "alternativeNames": ["BioScreen Bench", "GeneSynthesis Biosecurity Audit"],
        "relatedIdeaIds": ["idea-385"],
        "status": "explore",
        "sourceReferences": [],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "DNA synthesis companies, biosecurity compliance officers, and synthetic biology labs",
            "problemSolved": "Screening false positives/negatives and regulatory audit risk in custom gene synthesis orders.",
            "whatToBuild": "Benchmark sequence suite, customer KYC verifier, and biosecurity audit log generator.",
            "howItMakesMoney": "Annual biosecurity audit license ($10,000-$30,000/yr).",
            "whyCustomersPay": "Satisfy federal biosecurity procurement requirements and prevent dangerous pathogen synthesis.",
            "estimatedEarningPotential": {"currency": "USD", "annualRunRate": "$400k - $1.5M", "marginEstimate": "85%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "USD"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 78.2
        },
        "compositeScores": {"overallAttractiveness": 78.2, "compositeHeadline": 78.2},
        "scores": {"overallConfidence": {"value": 7, "rationale": "Aligned with GDM 2026 nucleic acid biosecurity guidance."}}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-394",
        "slug": "as-built-carbon-drift",
        "name": "As-Built Carbon Drift — Building Passport Embodied Carbon Audit Engine",
        "oneSentenceConcept": "As-built vs as-designed embodied carbon divergence audit engine evaluating material substitutions during construction for EU EPBD Digital Building Passports.",
        "elevatorPitch": "While architectural designs specify low-carbon materials, real-world construction substitutions (concrete mixes, insulation brands, steel origins) create major 'carbon drift'. As-Built Carbon Drift audits site delivery dockets and material passports against design EPDs to certify actual as-built embodied carbon for EU EPBD compliance.",
        "detailedDescription": "Discovered in Deep Research Round #10 (Score 7.66 / 10). Reconciles design BIM models with physical delivery dockets to identify embodied carbon variances prior to building sign-off.",
        "category": "Audit & Financial Forensics",
        "subcategory": "Building Passports & Construction",
        "tags": ["embodied-carbon", "epbd", "building-passports", "as-built-drift", "construction-audit"],
        "alternativeNames": ["As-Built Carbon Drift", "Building Passport Auditor"],
        "relatedIdeaIds": ["idea-380", "idea-388"],
        "status": "explore",
        "sourceReferences": [],
        "provenance": {"sourceType": "Deep Research Round #10", "originalWordingAvailable": "full_thesis"},
        "atAGlance": {
            "targetCustomer": "General contractors, real estate developers, sustainability consultants, and building certifiers",
            "problemSolved": "Unnoticed embodied carbon increases caused by contractor material substitutions breaching EPBD building passport targets.",
            "whatToBuild": "BIM vs delivery docket parser, EPD matching engine, carbon variance log, and EPBD passport exporter.",
            "howItMakesMoney": "Project audit fee (€1,000-€4,000 per construction project).",
            "whyCustomersPay": "Avoid greenwashing liability and secure green building certification bonuses.",
            "estimatedEarningPotential": {"currency": "EUR", "annualRunRate": "€500k - €1.7M", "marginEstimate": "78%"},
            "startupCost": {"minimum": 0, "maximum": 100, "midpoint": 50, "currency": "EUR"},
            "timeToMvp": "14 days",
            "timeToFirstRevenue": "14-30 days",
            "overallScore": 76.6
        },
        "compositeScores": {"overallAttractiveness": 76.6, "compositeHeadline": 76.6},
        "scores": {"overallConfidence": {"value": 7, "rationale": "Relevant under EU Energy Performance of Buildings Directive (EPBD)."}}
    }
]

existing_idea_ids = set(i.get('id') for i in ideas_data['ideas'])
for ni in new_ideas:
    if ni['id'] not in existing_idea_ids:
        ideas_data['ideas'].append(ni)

# Save updated files
with open(ideas_file, 'w', encoding='utf-8') as f:
    json.dump(ideas_data, f, indent=2, ensure_ascii=False)

with open(sources_file, 'w', encoding='utf-8') as f:
    json.dump(sources_data, f, indent=2, ensure_ascii=False)

# Update metadata counts
meta_data['counts']['canonicalIdeas'] = len(ideas_data['ideas'])
meta_data['counts']['sources'] = len(sources_data)
meta_data['counts']['prompts'] = len(ideas_data['ideas']) * 25
meta_data['counts']['totalIdeas'] = meta_data['counts']['canonicalIdeas'] + meta_data['counts'].get('stagedIdeas', 174)

with open(meta_file, 'w', encoding='utf-8') as f:
    json.dump(meta_data, f, indent=2, ensure_ascii=False)

print(f"Successfully ingested Round 10: Total canonical ideas = {len(ideas_data['ideas'])}, Total sources = {len(sources_data)}")
