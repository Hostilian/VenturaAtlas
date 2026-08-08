"""
VenturaAtlas OS — Fifteenth Reset Ingestion Script
==================================================
Ingests 11 new adversarial workflow opportunities into data/ideas.json (idea-308 to idea-318),
generates 25 structured prompt files per opportunity in prompts/idea-specific/,
and generates missing Markdown dossiers in ideas/ via generate-all-missing-dossiers.py.
"""

import os
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON = os.path.join(ROOT, "data", "ideas.json")
PROMPTS_DIR = os.path.join(ROOT, "prompts", "idea-specific")

NEW_IDEAS = [
    {
        "id": "idea-308",
        "name": "PA RealityGrid — Synthetic-Patient Failure Laboratory for Prior Authorization",
        "slug": "pa-realitygrid-synthetic-patient-prior-authorization",
        "oneSentenceConcept": "Synthetic-patient state and workflow regression test suite for healthcare prior authorization APIs, EHR integrations, and payer decision engines.",
        "elevatorPitch": "While government test kits evaluate FHIR syntax, real-world prior authorization fails due to state degradation, lost information loops, and EHR-payer synchronization gaps. PA RealityGrid injects synthetic patient journeys across 50+ failure scenarios (expiry drift, duplicate requests, urgency degradation, denial reason truncation) to verify workflow truth ahead of CMS 2027 mandates.",
        "category": "Healthcare Interoperability & Payer Ops",
        "subcategory": "prior authorization testing",
        "tags": ["prior-authorization", "FHIR", "CMS-2027", "synthetic-patients", "healthtech", "interoperability"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.74,
            "soloFounderPotential": 8.6,
            "evidenceConfidence": 9.2,
            "highestProfitPotential": 8.9,
            "fastestPathToRevenue": 8.5,
            "lowestCapitalRequirement": 9.4
        },
        "atAGlance": {
            "targetCustomer": "Healthtech integration vendors, EHR providers, clearinghouses, and health system interoperability teams",
            "problemSolved": "Silent administrative failures and state mismatches in prior-authorization API workflows delaying patient care",
            "whatToBuild": "Synthetic-patient scenario engine and automated PAS state reconciliation test harness",
            "howItMakesMoney": "$499 prior-authorization stress test audit plus monthly continuous testing SaaS ($1,500-5,000/mo)",
            "whyCustomersPay": "Comply with CMS 2027 API rules, prevent claim rejections, and protect patient care timelines",
            "overallScore": 87,
            "confidenceScore": 9.2,
            "startupCost": {"currency": "USD", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2-3 weeks",
            "timeToFirstRevenue": "3-6 weeks",
            "mainAdvantage": "Tests workflow state integrity and semantic correctness beyond basic FHIR schema validation",
            "mainRisk": "Gaining access to staging environments of complex EHR/clearinghouse partners",
            "bestNextValidationStep": "Offer $499 PA workflow stress test to 20 healthtech integration providers"
        }
    },
    {
        "id": "idea-309",
        "name": "AgeGate Chaos Lab — Adversarial Age Assurance Fail-Safe & Integration Red Team",
        "slug": "agegate-chaos-lab-age-assurance-red-team",
        "oneSentenceConcept": "Controlled adversarial testing harness that exercises age-verification integrations against vendor timeouts, state mutations, and session leaks.",
        "elevatorPitch": "UK Ofcom enforcement (fining platforms £1.35M+ for age-check failures) explicitly states that using third-party vendors does not remove platform liability. AgeGate Chaos Lab injects synthetic edge-case journeys (device switching, vendor timeouts, fallback routes, multi-account linking) to verify fail-closed behavior and privacy compliance.",
        "category": "Online Safety & Identity",
        "subcategory": "age assurance testing",
        "tags": ["age-assurance", "Ofcom", "online-safety", "red-teaming", "privacy", "identity"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.46,
            "soloFounderPotential": 8.8,
            "evidenceConfidence": 9.0,
            "highestProfitPotential": 8.2,
            "fastestPathToRevenue": 9.1,
            "lowestCapitalRequirement": 9.5
        },
        "atAGlance": {
            "targetCustomer": "Regulated online platforms, social services, gaming networks, and age-restricted content providers",
            "problemSolved": "Undetected integration bypasses and fail-open vulnerabilities in third-party age-verification workflows",
            "whatToBuild": "Automated age-gate integration fuzzer and session state-machine red team",
            "howItMakesMoney": "£499 integration audit plus recurring compliance monitoring subscription (£750/mo)",
            "whyCustomersPay": "Avoid massive regulatory fines (£1M+ precedent) and satisfy Ofcom due-diligence expectations",
            "overallScore": 85,
            "confidenceScore": 9.0,
            "startupCost": {"currency": "GBP", "minimum": 0, "midpoint": 50, "maximum": 150},
            "timeToMvp": "1-2 weeks",
            "timeToFirstRevenue": "2-4 weeks",
            "mainAdvantage": "Focuses on integration and session failure modes rather than model-accuracy commoditization",
            "mainRisk": "High customer concentration among regulated platform operators",
            "bestNextValidationStep": "Run £499 age-gate integration stress tests for 10 UK online services"
        }
    },
    {
        "id": "idea-310",
        "name": "RxTrace Chaos Lab — DSCSA Exception Drill & Physical/Data Reconciliation Engine",
        "slug": "rxtrace-chaos-lab-dscsa-exception-drill",
        "oneSentenceConcept": "Synthetic package and barcode exception testing harness for independent pharmacies preparing for the FDA DSCSA November 2026 small-dispenser deadline.",
        "elevatorPitch": "With the FDA's DSCSA small-dispenser exemption expiring 27 November 2026, pharmacies face operational chaos from EPCIS data mismatches, unreadable barcodes, and physical-versus-electronic discrepancies. RxTrace Chaos Lab injects controlled synthetic test cases to verify scanner workflows, quarantine isolation, and exception evidence logging.",
        "category": "Pharmaceutical Supply Chain",
        "subcategory": "DSCSA compliance testing",
        "tags": ["DSCSA", "FDA", "pharmacy", "supply-chain", "EPCIS", "serialization"],
        "status": "priority",
        "compositeScores": {
            "overallOpportunity": 8.31,
            "soloFounderPotential": 8.4,
            "evidenceConfidence": 8.9,
            "highestProfitPotential": 8.1,
            "fastestPathToRevenue": 8.8,
            "lowestCapitalRequirement": 9.2
        },
        "atAGlance": {
            "targetCustomer": "Pharmacy management software vendors, PSAOs, wholesaler networks, and independent pharmacies",
            "problemSolved": "Physical inventory arriving without matching electronic EPCIS data causing pharmacy quarantine bottlenecks",
            "whatToBuild": "Synthetic DSCSA barcode/EPCIS mismatch injector and quarantine workflow drill engine",
            "howItMakesMoney": "$249 pharmacy failure drill or $1,500-5,000 vendor test pack",
            "whyCustomersPay": "Comply with mandatory FDA DSCSA Nov 2026 rules and prevent drug receiving halts",
            "overallScore": 83,
            "confidenceScore": 8.9,
            "startupCost": {"currency": "USD", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "3-5 weeks",
            "mainAdvantage": "Tests human + scanner + packaging + software operational reality rather than pure database storage",
            "mainRisk": "Independent pharmacy buyers having low individual price tolerance",
            "bestNextValidationStep": "Offer $1,500 white-label test packs to 5 pharmacy management software vendors"
        }
    },
    {
        "id": "idea-311",
        "name": "Finance Control Red Team — Synthetic Transaction Fraud & ERP Separation Tester",
        "slug": "finance-control-red-team-erp-fraud-testing",
        "oneSentenceConcept": "Synthetic business event injection platform that tests corporate ERP financial controls against supplier bank changes, split invoices, and override bypasses.",
        "elevatorPitch": "Under corporate failure-to-prevent-fraud legislation, companies must prove reasonable prevention procedures. Finance Control Red Team acts as chaos engineering for corporate finance—injecting authorized synthetic transactions (bank account changes, split invoices, weekend overrides) into SAP/NetSuite staging to verify controls actually block prohibited outcomes.",
        "category": "Corporate Financial Governance",
        "subcategory": "ERP control testing",
        "tags": ["fintech", "ERP", "fraud-prevention", "chaos-engineering", "SAP", "NetSuite"],
        "status": "researched",
        "compositeScores": {
            "overallOpportunity": 8.18,
            "soloFounderPotential": 7.9,
            "evidenceConfidence": 8.7,
            "highestProfitPotential": 8.8,
            "fastestPathToRevenue": 7.8,
            "lowestCapitalRequirement": 8.6
        },
        "atAGlance": {
            "targetCustomer": "Chief Financial Officers, corporate controllers, internal audit leads, and enterprise ERP teams",
            "problemSolved": "Unverified financial controls allowing fraudulent vendor bank updates and split-invoice policy bypasses",
            "whatToBuild": "Synthetic financial event injector and automated segregation-of-duties verification engine",
            "howItMakesMoney": "£750-2,500 per business process audit plus continuous control monitoring SaaS",
            "whyCustomersPay": "Prevent multi-hundred-thousand-pound invoice fraud losses and fulfill statutory prevention duties",
            "overallScore": 82,
            "confidenceScore": 8.7,
            "startupCost": {"currency": "GBP", "minimum": 0, "midpoint": 100, "maximum": 500},
            "timeToMvp": "3 weeks",
            "timeToFirstRevenue": "4-8 weeks",
            "mainAdvantage": "Proves whether controls actually stop bad outcomes in execution rather than storing static GRC policy docs",
            "mainRisk": "Complex enterprise ERP integration requirements (SAP/Oracle/NetSuite)",
            "bestNextValidationStep": "Run synthetic vendor-bank-change audits for 5 mid-market UK corporate finance teams"
        }
    },
    {
        "id": "idea-312",
        "name": "Telco Identity Recovery Grid — SIM-Swap & Account Migration Recovery Tester",
        "slug": "telco-identity-recovery-grid-sim-swap-recovery",
        "oneSentenceConcept": "Adversarial customer-care workflow test grid for telecommunication carriers to verify SIM replacement, eSIM migration, and account recovery security.",
        "elevatorPitch": "While carriers deploy real-time SIM-swap APIs, customer recovery workflows remain vulnerable to social engineering and session retention bugs. Telco Identity Recovery Grid executes authorized synthetic takeover and recovery journeys (PIN resets, eSIM transfers, port freezes) to ensure compromised lines are reliably secured.",
        "category": "Telecom & Security Ops",
        "subcategory": "telecom identity testing",
        "tags": ["telecom", "SIM-swap", "eSIM", "identity-recovery", "security-ops"],
        "status": "researched",
        "compositeScores": {
            "overallOpportunity": 7.91,
            "soloFounderPotential": 7.2,
            "evidenceConfidence": 8.6,
            "highestProfitPotential": 8.5,
            "fastestPathToRevenue": 6.8,
            "lowestCapitalRequirement": 8.1
        },
        "atAGlance": {
            "targetCustomer": "Telecom carrier security teams, MVNO operations leads, and identity verification partners",
            "problemSolved": "Account recovery process failures allowing attackers to retain access after SIM-swap discovery",
            "whatToBuild": "Synthetic telco customer-journey red-team harness and recovery clock analyzer",
            "howItMakesMoney": "Enterprise security audit engagement ($15,000-50,000) plus continuous carrier testing SaaS",
            "whyCustomersPay": "Stop catastrophic account takeover losses and protect high-value mobile subscriber identities",
            "overallScore": 79,
            "confidenceScore": 8.6,
            "startupCost": {"currency": "USD", "minimum": 0, "midpoint": 200, "maximum": 1000},
            "timeToMvp": "3-4 weeks",
            "timeToFirstRevenue": "8-12 weeks",
            "mainAdvantage": "Evaluates full customer-care and technical recovery state rather than raw API detection signals",
            "mainRisk": "Long enterprise sales cycles and strict procurement barriers with major telecom carriers",
            "bestNextValidationStep": "Pitch synthetic recovery red-teaming to 3 regional MVNO operations directors"
        }
    },
    {
        "id": "idea-313",
        "name": "PA Denial Semantics Observatory — Payer Authorization Metrics & Transparency Index",
        "slug": "pa-denial-semantics-observatory-payer-metrics",
        "oneSentenceConcept": "Aggregated analytics observatory that tracks public CMS prior-authorization metrics, approval rates, overturn percentages, and denial reason semantics.",
        "elevatorPitch": "Following mandatory 31 March 2026 CMS reporting rules, payers publish annual prior-authorization metrics. PA Denial Semantics Observatory aggregates these raw disclosures, mapping denial reasons, turnaround times, and appeal overturns across procedure codes and geographic regions to provide clear market intelligence for providers.",
        "category": "Health Analytics & Payer Ops",
        "subcategory": "health data analytics",
        "tags": ["health-analytics", "prior-authorization", "CMS-disclosures", "payer-transparency", "healthtech"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.84,
            "soloFounderPotential": 8.7,
            "evidenceConfidence": 8.4,
            "highestProfitPotential": 7.5,
            "fastestPathToRevenue": 8.2,
            "lowestCapitalRequirement": 9.6
        },
        "atAGlance": {
            "targetCustomer": "Health system revenue cycle directors, medical specialty societies, and health policy researchers",
            "problemSolved": "Fragmented, opaque payer prior-authorization metrics preventing data-driven payer negotiations",
            "whatToBuild": "Automated CMS metric scraper, denial-semantic parser, and payer benchmarking dashboard",
            "howItMakesMoney": "Annual health system subscription ($499-1,999/mo) and custom analytics reports",
            "whyCustomersPay": "Benchmark payer turnaround times and identify high-overturn procedure categories for appeals",
            "overallScore": 78,
            "confidenceScore": 8.4,
            "startupCost": {"currency": "USD", "minimum": 0, "midpoint": 50, "maximum": 150},
            "timeToMvp": "1-2 weeks",
            "timeToFirstRevenue": "2-4 weeks",
            "mainAdvantage": "Leverages newly public 2026 CMS regulatory disclosures to create immediate market transparency",
            "mainRisk": "Information data aggregators commoditizing basic metric scrapers",
            "bestNextValidationStep": "Publish a free 2026 Payer Prior Authorization Benchmark Report to 50 health system RCM leads"
        }
    },
    {
        "id": "idea-314",
        "name": "APP Reimbursement Replay — Synthetic Scam Claim & Multi-Bank Clock Simulator",
        "slug": "app-reimbursement-replay-scam-claim-simulator",
        "oneSentenceConcept": "Multi-bank synthetic claim simulator that tests Authorised Push Payment (APP) scam reimbursement workflows against 5-day resolution clocks and allocation rules.",
        "elevatorPitch": "With mandatory UK PSR APP-scam reimbursement rules operating in 2026, payment service providers (PSPs) must resolve claims within 5 business days. APP Reimbursement Replay injects complex synthetic fraud scenarios (multi-stage transfers, partial recovery, vulnerable customers) to verify classification accuracy and inter-bank cost allocation.",
        "category": "Fintech & Fraud Operations",
        "subcategory": "scam reimbursement testing",
        "tags": ["APP-scam", "PSR", "fintech", "payments", "fraud-ops", "reimbursement"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.63,
            "soloFounderPotential": 7.8,
            "evidenceConfidence": 8.5,
            "highestProfitPotential": 7.6,
            "fastestPathToRevenue": 7.4,
            "lowestCapitalRequirement": 8.8
        },
        "atAGlance": {
            "targetCustomer": "UK payment service providers, challenger banks, electronic money institutions (EMIs), and fraud ops teams",
            "problemSolved": "Administrative errors and missed 5-day clocks in complex multi-bank APP scam reimbursement claims",
            "whatToBuild": "Synthetic APP-scam scenario generator and regulatory clock tracking simulator",
            "howItMakesMoney": "PSP test suite subscription (£750/mo) plus audit compliance reports",
            "whyCustomersPay": "Avoid PSR regulatory penalties and optimize sending/receiving bank reimbursement allocations",
            "overallScore": 76,
            "confidenceScore": 8.5,
            "startupCost": {"currency": "GBP", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2 weeks",
            "timeToFirstRevenue": "4-6 weeks",
            "mainAdvantage": "Tests complex edge-case claim journeys (appeals, partial recoveries) beyond basic fraud detection",
            "mainRisk": "High industry baseline reimbursement performance reducing urgency for smaller PSPs",
            "bestNextValidationStep": "Simulate 20 synthetic APP claim scenarios for 5 UK challenger EMIs"
        }
    },
    {
        "id": "idea-315",
        "name": "EmergencyComms Regression Cloud — NG112 & eCall Interoperability Test Suite",
        "slug": "emergencycomms-regression-cloud-ng112-ecall",
        "oneSentenceConcept": "Cloud-based synthetic test environment that executes automated NG112, real-time text, and eCall vehicle-to-PSAP emergency communication regression tests.",
        "elevatorPitch": "As European emergency services migrate to Next Generation 112 (NG112) IP networks, life-critical interoperability failures occur across location routing, real-time text, and eCall vehicle telemetry. EmergencyComms Regression Cloud provides automated scenario injection to verify PSAP software and vehicle telematics under degraded network conditions.",
        "category": "Public Safety & Telecom",
        "subcategory": "emergency communications testing",
        "tags": ["NG112", "eCall", "PSAP", "public-safety", "telecom", "interoperability"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 7.30,
            "soloFounderPotential": 6.9,
            "evidenceConfidence": 8.2,
            "highestProfitPotential": 7.8,
            "fastestPathToRevenue": 6.2,
            "lowestCapitalRequirement": 7.4
        },
        "atAGlance": {
            "targetCustomer": "Public Safety Answering Point (PSAP) software vendors, automotive eCall suppliers, and emergency telecom providers",
            "problemSolved": "Silent data loss and location-routing failures during IP emergency call transitions",
            "whatToBuild": "NG112 SIP/SIPREC protocol fuzzer and synthetic eCall MSD telemetry simulator",
            "howItMakesMoney": "Annual platform subscription (€2,500/mo) and specialized testing engagements",
            "whyCustomersPay": "Ensure life-critical emergency call delivery and meet ETSI NG112 standards",
            "overallScore": 73,
            "confidenceScore": 8.2,
            "startupCost": {"currency": "EUR", "minimum": 200, "midpoint": 1000, "maximum": 3000},
            "timeToMvp": "4 weeks",
            "timeToFirstRevenue": "8-12 weeks",
            "mainAdvantage": "Provides continuous automated testing replacing slow periodic Plugtests events",
            "mainRisk": "Complex public-sector procurement cycles and specialized hardware dependencies",
            "bestNextValidationStep": "Demonstrate synthetic NG112 location-routing regression tests to 3 PSAP software vendors"
        }
    },
    {
        "id": "idea-316",
        "name": "CMMC Enclave Escape Test — Controlled CUI Boundary & Drift Testing Engine",
        "slug": "cmmc-enclave-escape-test-cui-boundary-testing",
        "oneSentenceConcept": "Automated boundary testing tool that injects controlled synthetic data to detect unauthorized CUI data flow and scope drift outside secure enclave perimeters.",
        "elevatorPitch": "Defense contractors building CMMC enclaves frequently suffer scope expansion when Controlled Unclassified Information (CUI) leaks into unmonitored subnets or cloud storage. CMMC Enclave Escape Test deploys benign canary payloads to continuously verify enclave boundaries and prevent unexpected compliance scope creep.",
        "category": "Defense & Cybersecurity",
        "subcategory": "CMMC compliance testing",
        "tags": ["CMMC", "defense", "CUI", "cybersecurity", "enclave-testing", "compliance"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 6.92,
            "soloFounderPotential": 7.5,
            "evidenceConfidence": 7.8,
            "highestProfitPotential": 7.2,
            "fastestPathToRevenue": 6.0,
            "lowestCapitalRequirement": 8.2
        },
        "atAGlance": {
            "targetCustomer": "U.S. defense industrial base contractors, CMMC third-party assessment organizations (C3PAOs), and MSPs",
            "problemSolved": "Unintended CUI data drift expanding CMMC assessment boundaries and inflating audit costs",
            "whatToBuild": "Canary CUI payload generator and network egress boundary analyzer",
            "howItMakesMoney": "Enclave assessment license ($1,200/mo per enclave environment)",
            "whyCustomersPay": "Maintain tight enclave scope boundaries and pass CMMC audits without costly surprises",
            "overallScore": 69,
            "confidenceScore": 7.8,
            "startupCost": {"currency": "USD", "minimum": 0, "midpoint": 100, "maximum": 400},
            "timeToMvp": "3 weeks",
            "timeToFirstRevenue": "6-10 weeks",
            "mainAdvantage": "Provides empirical boundary verification rather than static paper policy questionnaires",
            "mainRisk": "Regulatory timeline uncertainty following CMMC program adjustments",
            "bestNextValidationStep": "Test synthetic CUI canary egress for 3 defense contractor MSP environments"
        }
    },
    {
        "id": "idea-317",
        "name": "EES Carrier Journey Monitor — EU Entry/Exit System Synthetic API & Fallback Tester",
        "slug": "ees-carrier-journey-monitor-border-control-testing",
        "oneSentenceConcept": "Synthetic passenger journey generator that evaluates carrier web, mobile, and S2S interfaces against EU Entry/Exit System (EES) verification APIs.",
        "elevatorPitch": "As the EU Entry/Exit System (EES) mandates carrier pre-boarding verification, airlines, ferries, and coach operators face boarding delays when verification APIs experience outages or data formatting mismatches. EES Carrier Journey Monitor continuously probes carrier-to-EES integration paths to test fallback procedures.",
        "category": "Travel Tech & Border Control",
        "subcategory": "carrier border compliance",
        "tags": ["EES", "eu-LISA", "border-control", "traveltech", "carrier-compliance"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 6.71,
            "soloFounderPotential": 7.0,
            "evidenceConfidence": 8.0,
            "highestProfitPotential": 7.0,
            "fastestPathToRevenue": 5.8,
            "lowestCapitalRequirement": 8.5
        },
        "atAGlance": {
            "targetCustomer": "International airlines, cross-channel ferry operators, international rail/coach carriers, and travel IT providers",
            "problemSolved": "Pre-boarding verification API failures causing port congestion and passenger boarding halts",
            "whatToBuild": "Synthetic passenger verification probe and API fallback parity analyzer",
            "howItMakesMoney": "Carrier testing SaaS (€1,500/mo per transport operator)",
            "whyCustomersPay": "Avoid carrier fines for transporting non-compliant passengers and prevent port delays",
            "overallScore": 67,
            "confidenceScore": 8.0,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 100, "maximum": 300},
            "timeToMvp": "3 weeks",
            "timeToFirstRevenue": "6-10 weeks",
            "mainAdvantage": "Tests real-world carrier operational fallbacks when official eu-LISA systems experience degradation",
            "mainRisk": "Official eu-LISA portal tools and dominant travel tech incumbents (Amadeus/SITA) occupying market",
            "bestNextValidationStep": "Probe pre-boarding verification fallback flows for 3 UK-EU ferry operators"
        }
    },
    {
        "id": "idea-318",
        "name": "ETIAS Carrier Preflight — Travel Authorization Pre-Boarding Exception Checker",
        "slug": "etias-carrier-preflight-travel-authorization",
        "oneSentenceConcept": "Automated preflight checker for commercial passenger carriers to verify ETIAS travel authorization status, visa-exempt rules, and exception handling.",
        "elevatorPitch": "With the upcoming launch of the European Travel Information and Authorisation System (ETIAS), visa-exempt travelers must possess valid authorization before boarding. ETIAS Carrier Preflight provides transport operators with instant pre-boarding validation, exception logging, and passenger notification workflows.",
        "category": "Travel Tech & Border Control",
        "subcategory": "travel authorization",
        "tags": ["ETIAS", "EU", "traveltech", "preflight", "border-control"],
        "status": "explore",
        "compositeScores": {
            "overallOpportunity": 6.24,
            "soloFounderPotential": 7.1,
            "evidenceConfidence": 7.6,
            "highestProfitPotential": 6.5,
            "fastestPathToRevenue": 5.2,
            "lowestCapitalRequirement": 8.9
        },
        "atAGlance": {
            "targetCustomer": "Regional airlines, charter flight operators, cruise lines, and maritime passenger carriers",
            "problemSolved": "Uncertainty and manual processing delays surrounding passenger ETIAS verification at gate/check-in",
            "whatToBuild": "Lightweight ETIAS status preflight API and carrier exception dashboard",
            "howItMakesMoney": "Per-passenger check fee (€0.10) or carrier subscription (€499/mo)",
            "whyCustomersPay": "Ensure smooth boarding procedures and eliminate statutory carrier fines for unauthorized passengers",
            "overallScore": 62,
            "confidenceScore": 7.6,
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 200},
            "timeToMvp": "2-3 weeks",
            "timeToFirstRevenue": "8-12 weeks",
            "mainAdvantage": "Lightweight API integration tailored for smaller regional carriers lacking enterprise DCS infrastructure",
            "mainRisk": "Shifting EU implementation timelines undermining buyer urgency",
            "bestNextValidationStep": "Interview 5 regional charter airline operations managers on ETIAS pre-boarding readiness"
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
    print("=== Ingesting Fifteenth Reset Opportunities (idea-308 to idea-318) ===")

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
                    "sourceType": "Fifteenth Reset Deep Research Investigation #9",
                    "originalWordingAvailable": "full",
                    "notes": "Workflow truth, synthetic transactions & adversarial operations research"
                },
                "compositeScores": new_idea["compositeScores"],
                "atAGlance": new_idea["atAGlance"]
            }
            existing_ideas.append(full_entry)
            added_count += 1

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
