import json
import os
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')

with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

ideas = data if isinstance(data, list) else data.get('ideas', [])
existing_ids = {x['id'] for x in ideas}

round12_ideas = [
    {
        "schemaVersion": "2.0.0",
        "id": "idea-395",
        "legacyId": "demandproof",
        "slug": "demandproof-loadledger",
        "name": "DemandProof / LoadLedger — Electricity Load Project Identity & Readiness Network",
        "oneSentenceConcept": "Neutral identity and readiness network for large electricity-load projects to eliminate phantom demand and duplicate queue reservations.",
        "elevatorPitch": "DemandProof provides utilities, RTOs, and hyperscalers with privacy-preserving project entity resolution and probabilistic readiness scoring, preventing speculative multi-site load requests from distorting multi-billion-dollar grid planning.",
        "detailedDescription": "Before utilities spend billions building infrastructure for requested demand, DemandProof proves whether requested MW represent genuine independent projects or one developer shopping the same project across multiple sites (AlternativeSiteGroup). It uses two layers—Layer 1 (privacy-preserving probabilistic identity matching on load customer, developer, capacity, fiber, equipment, and substation specs) and Layer 2 (structured readiness graph scoring land control, interconnection deposits, equipment orders, and energization probability). Developers gain fast-track queue treatment and verified credit status while maintaining site confidentiality.",
        "category": "Energy Grid & Electrical Infrastructure",
        "subcategory": "load-identity-network",
        "tags": ["grid-demand", "load-forecasting", "data-centers", "privacy-preserving-matching", "utilities", "rto"],
        "status": "priority",
        "atAGlance": {
            "targetCustomer": "Electric utilities, RTO/ISO transmission planners, and data center developers",
            "problemSolved": "Phantom and duplicate grid capacity requests distorting transmission planning and delaying real projects.",
            "whatToBuild": "Privacy-preserving project entity resolution engine and probabilistic readiness scoring network.",
            "howItMakesMoney": "Utility/RTO planning subscriptions + developer confidential verification & fast-track credentials.",
            "whyCustomersPay": "Prevents billions in stranded transmission capex and accelerates queue clearance for real projects.",
            "overallScore": 97.2
        },
        "scores": {
            "overallOpportunity": {"value": 97.2, "confidence": "high"},
            "problemSeverity": {"value": 98.0, "confidence": "high"},
            "marketDemand": {"value": 97.0, "confidence": "high"},
            "willingnessToPay": {"value": 96.0, "confidence": "high"},
            "defensibility": {"value": 98.0, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 97.2,
            "attractiveness": 97.2,
            "compositeHeadline": 97.2
        },
        "sourceReferences": ["s71", "s72", "s73"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-396",
        "legacyId": "loadenvelope",
        "slug": "loadenvelope-ci-gridenvelope",
        "name": "LoadEnvelope CI / GridEnvelope — Continuous Electrical Behavior & Grid Contract Assurance",
        "oneSentenceConcept": "Continuous behavioral verification platform testing built AI data center load dynamics against utility interconnection promises.",
        "elevatorPitch": "LoadEnvelope CI acts as GitHub Actions for grid promises, continuously validating data center scheduler, UPS, and BESS firmware updates against electrical ride-through and ramp-rate constraints.",
        "detailedDescription": "While utilities approve connections based on static engineering models, real-world data center compute schedulers, GPU generations (Hopper to Rubin), and UPS firmware evolve continuously. LoadEnvelope CI converts interconnection agreements into machine-readable GridEnvelopes and performs pre-deployment software/HIL regression testing to ensure compute workload shifts (such as checkpoint syncs) do not trigger sudden multi-hundred-MW grid dropouts or frequency violations.",
        "category": "Energy Grid & Electrical Infrastructure",
        "subcategory": "grid-behavioral-assurance",
        "tags": ["data-center-load", "grid-conformance", "load-envelope", "hil-testing", "nerc-compliance"],
        "status": "priority",
        "atAGlance": {
            "targetCustomer": "Hyperscale data center operators, grid reliability coordinators, and utility engineers",
            "problemSolved": "Discrepancy between static interconnection models and dynamic AI compute electrical behavior.",
            "whatToBuild": "Machine-readable GridEnvelope specification runner and continuous CI/HIL regression testing harness.",
            "howItMakesMoney": "Annual hyperscaler site verification contracts + utility continuous compliance monitoring fees.",
            "whyCustomersPay": "Prevents grid-triggered compute outages, utility curtailment penalties, and connection delays.",
            "overallScore": 95.9
        },
        "scores": {
            "overallOpportunity": {"value": 95.9, "confidence": "high"},
            "problemSeverity": {"value": 96.0, "confidence": "high"},
            "marketDemand": {"value": 95.0, "confidence": "high"},
            "willingnessToPay": {"value": 95.0, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 95.9,
            "attractiveness": 95.9,
            "compositeHeadline": 95.9
        },
        "sourceReferences": ["s72", "s74", "s75"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-397",
        "legacyId": "bioscreenci",
        "slug": "bioscreen-ci",
        "name": "BioScreen CI — Continuous Independent Assurance for Nucleic-Acid Synthesis Screening",
        "oneSentenceConcept": "Continuous operational security testing and assurance suite for DNA synthesis provider biosecurity screening systems.",
        "elevatorPitch": "BioScreen CI provides SOC 2-style penetration testing and continuous assurance for gene synthesis providers, verifying sequence classification, customer identity, and order-routing safeguards against evolving biological threat vectors.",
        "detailedDescription": "Following U.S. federal mandates requiring synthesis screening for funded research, BioScreen CI maintains a secure, air-gapped challenge suite to stress-test synthesis provider screening pipelines. It tests end-to-end operational workflows (including default-open failure modes, stale databases, API outages, customer verification bypasses, and multi-facility policy drifts) without exposing sensitive sequence challenge catalogs to customer administrators or adversary evasion.",
        "category": "Biosecurity & Synthetic Biology Safeguards",
        "subcategory": "synthesis-screening-assurance",
        "tags": ["biosecurity", "dna-synthesis", "screening-assurance", "penetration-testing", "compliance"],
        "status": "priority",
        "atAGlance": {
            "targetCustomer": "Gene synthesis providers, biosecurity regulators, research funders, and biopharma buyers",
            "problemSolved": "Operational degradation, workflow bypasses, and stale threat databases in biosecurity sequence screening.",
            "whatToBuild": "Air-gapped continuous challenge suite and independent screening verification service.",
            "howItMakesMoney": "Annual provider audit & continuous assurance subscriptions + verification badges for funders.",
            "whyCustomersPay": "Mandatory federal funding compliance, risk mitigation, and independent biosecurity assurance.",
            "overallScore": 94.4
        },
        "scores": {
            "overallOpportunity": {"value": 94.4, "confidence": "high"},
            "problemSeverity": {"value": 95.0, "confidence": "high"},
            "marketDemand": {"value": 93.0, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 94.4,
            "attractiveness": 94.4,
            "compositeHeadline": 94.4
        },
        "sourceReferences": ["s76", "s77", "s78"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-398",
        "legacyId": "filterlife",
        "slug": "filterlife-slo-mediatruth",
        "name": "FilterLife SLO / MediaTruth — PFAS Filter Life & Vendor-Neutral Performance Intelligence",
        "oneSentenceConcept": "Vendor-neutral performance intelligence network predicting actual remaining useful life of activated carbon and ion-exchange PFAS drinking water filters.",
        "elevatorPitch": "FilterLife SLO combines real-world water chemistry telemetry across municipal utilities to forecast GAC/IX bed breakthrough, outperforming manufacturer lab brochures.",
        "detailedDescription": "With EU and EPA PFAS drinking water limits taking effect in 2026, utilities must manage activated carbon and ion-exchange filter replacement cycles. Dissolved organic matter (DOM) changes and water chemistry fluctuations cause unexpected breakthrough and desorption. FilterLife SLO benchmarks filter media across operating conditions, flow rates, and influent chemistry, providing predictive remaining-life estimates and cost-per-cubic-meter performance comparisons.",
        "category": "Water Treatment & Environmental Intelligence",
        "subcategory": "pfas-media-intelligence",
        "tags": ["pfas", "water-treatment", "filter-life", "gac-media", "utility-intelligence"],
        "status": "canonical",
        "atAGlance": {
            "targetCustomer": "Water utilities, environmental engineering firms, and municipal water authorities",
            "problemSolved": "Unpredictable PFAS filter breakthrough and premature media replacement costs.",
            "whatToBuild": "Cross-utility media performance network and predictive breakthrough intelligence platform.",
            "howItMakesMoney": "Utility monitoring software subscriptions + media benchmarking reports.",
            "whyCustomersPay": "Saves hundreds of thousands in premature media replacement and prevents regulatory compliance breaches.",
            "overallScore": 89.6
        },
        "scores": {
            "overallOpportunity": {"value": 89.6, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 89.6,
            "compositeHeadline": 89.6
        },
        "sourceReferences": ["s79"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-399",
        "legacyId": "methanetrueup",
        "slug": "methanetrueup-contractoracle",
        "name": "MethaneTrueUp / ContractOracle — Environmental Observation & Methane Contract Reconciliation Engine",
        "oneSentenceConcept": "Discrepancy reconciliation engine mapping independent satellite/sensor methane observations directly to LNG contract liability and certificate exposures.",
        "elevatorPitch": "MethaneTrueUp reconciles independent environmental emissions observations against LNG purchase agreements and MiQ certificates, identifying economic and contractual exposure for gas importers.",
        "detailedDescription": "Under the EU methane import regulation (effective July 2026), gas importers face strict contractual clauses and penalties. When satellite observations detect high-emissions plume events at production facilities declaring low intensity, MethaneTrueUp performs multi-layer evidence reconciliation, tracing satellite observations to specific cargo vintages, certificate holdings, and affected contract clauses to route actionable notice windows.",
        "category": "Climate & Energy Commodity Contracts",
        "subcategory": "methane-contract-reconciliation",
        "tags": ["methane-emissions", "lng-contracts", "satellite-mrv", "eu-methane-regulation", "contract-oracle"],
        "status": "canonical",
        "atAGlance": {
            "targetCustomer": "LNG importers, gas traders, and corporate energy buyers",
            "problemSolved": "Unidentified contractual and regulatory liability when satellite observations contradict declared methane intensity.",
            "whatToBuild": "Evidence-to-contract mapping engine and automated notice window alert routing.",
            "howItMakesMoney": "Annual platform subscription + transaction fees on reconciled cargo volumes.",
            "whyCustomersPay": "Avoids severe EU regulatory penalties and enforces contractual methane performance clauses.",
            "overallScore": 88.2
        },
        "scores": {
            "overallOpportunity": {"value": 88.2, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 88.2,
            "compositeHeadline": 88.2
        },
        "sourceReferences": ["s80", "s81"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-400",
        "legacyId": "reclaimproof",
        "slug": "reclaimproof",
        "name": "ReclaimProof — Physical & Mass-Balance Provenance Assurance for Reclaimed Refrigerants",
        "oneSentenceConcept": "Mass-balance and physical purity verification platform detecting fraudulent virgin F-gas relabeled as reclaimed refrigerant.",
        "elevatorPitch": "ReclaimProof combines recovery source telemetry, physical lab composition fingerprints, and mass-balance checks to audit European reclaimed refrigerant claims under EU F-gas quotas.",
        "detailedDescription": "Escalating EU HFC phase-down quotas make genuinely reclaimed F-gases highly valuable, creating incentives for virgin gas relabeling and invoice fraud. ReclaimProof audits reclaimer batch lineage, process yield maximums, recovery inputs, and physical chemical fingerprints to detect impossible mass balances and protect buyers from fraudulent quota violations.",
        "category": "Circular Economy & F-Gas Compliance",
        "subcategory": "refrigerant-provenance-assurance",
        "tags": ["f-gas", "refrigerants", "circular-economy", "mass-balance", "fraud-prevention"],
        "status": "canonical",
        "atAGlance": {
            "targetCustomer": "Refrigerant distributors, HVAC equipment manufacturers, and EU compliance auditors",
            "problemSolved": "Illegitimate virgin HFC gas fraudulently sold as reclaimed refrigerant to bypass EU quotas.",
            "whatToBuild": "Mass-balance lineage tracker and physical lab fingerprint verification engine.",
            "howItMakesMoney": "Batch verification certification fees + annual distributor compliance software licensing.",
            "whyCustomersPay": "Protects against severe EU F-gas quota breach fines and protects brand reputation.",
            "overallScore": 85.4
        },
        "scores": {
            "overallOpportunity": {"value": 85.4, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 85.4,
            "compositeHeadline": 85.4
        },
        "sourceReferences": ["s82"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_A"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-401",
        "legacyId": "crareachledger",
        "slug": "cra-reachledger",
        "name": "CRA ReachLedger — Firmware Vulnerability Exposure & Patch Deployment Reachability Graph",
        "oneSentenceConcept": "Last-mile device reachability and vulnerability exposure graph for hardware manufacturers under the Cyber Resilience Act.",
        "elevatorPitch": "CRA ReachLedger tracks which deployed serial numbers, reseller inventories, and active customer devices remain vulnerable to reported flaws under CRA September 2026 reporting deadlines.",
        "detailedDescription": "Under EU Cyber Resilience Act (CRA) mandates starting September 2026, manufacturers must report actively exploited vulnerabilities and trace patch reachability across deployed fleets. CRA ReachLedger connects firmware SBOMs, distributor inventories, secondary sales records, and active device telemetry to quantify real customer exposure and verify patch delivery compliance.",
        "category": "Cybersecurity & Cyber Resilience Act Compliance",
        "subcategory": "device-vulnerability-reachability",
        "tags": ["cra-compliance", "cybersecurity", "firmware-sbom", "vulnerability-tracing", "iot-security"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "IoT hardware manufacturers, industrial device OEMs, and cybersecurity compliance officers",
            "problemSolved": "Inability to determine exact deployed serial number exposure and patch reachability under CRA deadlines.",
            "whatToBuild": "Serial-number-level vulnerability exposure graph and patch delivery audit ledger.",
            "howItMakesMoney": "Per-device annual subscription + CRA incident reporting module fees.",
            "whyCustomersPay": "Fulfills statutory EU Cyber Resilience Act reporting mandates and prevents non-compliance penalties.",
            "overallScore": 81.0
        },
        "scores": {
            "overallOpportunity": {"value": 81.0, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 81.0,
            "compositeHeadline": 81.0
        },
        "sourceReferences": ["s83"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_B"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-402",
        "legacyId": "medicaremfp",
        "slug": "medicare-mfp-reconcile",
        "name": "Medicare MFP Reconcile — Negotiated-Price Claim & Refund Reconciliation Engine",
        "oneSentenceConcept": "Automated claims and refund reconciliation platform for pharmaceutical manufacturers and pharmacies under Medicare Maximum Fair Price (MFP) rules.",
        "elevatorPitch": "Medicare MFP Reconcile automates remittance matching, claim verification, and manufacturer refund settlement via the CMS Medicare Transaction Facilitator framework.",
        "detailedDescription": "As Medicare negotiated prices take effect, drug manufacturers and dispensers must process complex refund mechanisms across Part D plans, 340B covered entities, and wholesalers. Medicare MFP Reconcile ingests claim transaction feeds, identifies duplicate discount claims, and streamlines manufacturer refund payments to prevent cash flow friction and compliance penalties.",
        "category": "Healthcare Financial Operations",
        "subcategory": "medicare-mfp-reconciliation",
        "tags": ["medicare-mfp", "pharma-reconciliation", "claims-adjudication", "340b", "healthcare-finance"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Pharma manufacturers, Medicare Part D plan sponsors, and specialty pharmacy networks",
            "problemSolved": "Complex multi-party claims reconciliation and duplicate discount risks under Medicare MFP.",
            "whatToBuild": "Automated claim-to-remittance reconciliation clearinghouse integrated with CMS MTF APIs.",
            "howItMakesMoney": "Transaction processing fees per reconciled prescription claim.",
            "whyCustomersPay": "Eliminates duplicate discount overpayments and ensures timely MFP refund compliance.",
            "overallScore": 77.2
        },
        "scores": {
            "overallOpportunity": {"value": 77.2, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 77.2,
            "compositeHeadline": 77.2
        },
        "sourceReferences": ["s83"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_B"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-403",
        "legacyId": "watercontact",
        "slug": "watercontact-compiler",
        "name": "WaterContact Compiler — Drinking Water Contact Material Formulation Compliance Engine",
        "oneSentenceConcept": "Formulation compliance compiler auditing materials contacting drinking water against the EU Positive List framework.",
        "elevatorPitch": "WaterContact Compiler evaluates plumbing, valve, and pipe material formulations against European Drinking Water Directive requirements and testing lab criteria.",
        "detailedDescription": "EU harmonized drinking water material rules restrict chemical migration from metallic, organic, and cementitious materials. WaterContact Compiler ingests raw chemical CAS numbers, supplier declaration sheets, and migration test reports to produce automated preflight compliance certificates for plumbing manufacturers.",
        "category": "Environmental & Product Compliance",
        "subcategory": "drinking-water-material-compliance",
        "tags": ["drinking-water-directive", "material-compliance", "positive-lists", "plumbing-certification"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Plumbing component manufacturers, valve makers, and water material suppliers",
            "problemSolved": "High cost and delay of testing material formulations against complex EU positive lists.",
            "whatToBuild": "Automated material formulation preflight audit engine and testing lab integration portal.",
            "howItMakesMoney": "Formulation evaluation audit fees + annual compliance management SaaS.",
            "whyCustomersPay": "Accelerates product time-to-market and reduces expensive lab testing cycles.",
            "overallScore": 70.5
        },
        "scores": {
            "overallOpportunity": {"value": 70.5, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 70.5,
            "compositeHeadline": 70.5
        },
        "sourceReferences": ["s79"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": False
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_B"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-404",
        "legacyId": "transformerprocurement",
        "slug": "transformer-procurement-marketplace",
        "name": "Transformer Procurement Marketplace — AI Transformer Sourcing & Lead-Time Marketplace [KILLED]",
        "oneSentenceConcept": "AI marketplace streamlining specification, sourcing, and purchasing of high-voltage transformers [KILLED - Entrant Fluxco scaling].",
        "elevatorPitch": "[KILLED CANDIDATE] Attempted AI marketplace for high-voltage transformer procurement. Disconfirmed after competitor research revealed Fluxco raised $26M and reached scale handling 1,000+ transformers across active projects.",
        "detailedDescription": "Initial research identified severe 3-4 year transformer lead times as a venture opportunity. Competitor-kill validation revealed Fluxco has already secured significant venture capital and market footprint in transformer specification and sourcing. Retained in Venture Atlas as a documented disconfirmed thesis to prevent redundant exploration.",
        "category": "Power Equipment & Grid Logistics",
        "subcategory": "transformer-sourcing-killed",
        "tags": ["transformers", "procurement", "killed-candidate", "disconfirmed-thesis", "fluxco"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Utilities and EPC contractors [KILLED]",
            "problemSolved": "Transformer procurement lead-time friction [SOLVED BY EXISTING ENTRANT].",
            "whatToBuild": "Marketplace for transformer sourcing [DISCONFIRMED].",
            "howItMakesMoney": "Transaction take rates [N/A].",
            "whyCustomersPay": "N/A — Existing venture-funded market entrant Fluxco scaling rapidly.",
            "overallScore": 67.0
        },
        "scores": {
            "overallOpportunity": {"value": 67.0, "confidence": "low"}
        },
        "compositeScores": {
            "overallOpportunity": 67.0,
            "compositeHeadline": 67.0
        },
        "sourceReferences": ["s72"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": True,
            "reason": "Market entrant Fluxco raised ~$26M and already handles 1,000+ transformers across projects."
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_C"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-405",
        "legacyId": "fueleupooling",
        "slug": "fueleu-pooling-marketplace",
        "name": "FuelEU Pooling Marketplace — Maritime FuelEU Compliance Pool Exchange [KILLED]",
        "oneSentenceConcept": "Marketplace matching shipowners for compliance pooling under the FuelEU Maritime regulation [KILLED - Entrants OceanScore & BetterSea scaling].",
        "elevatorPitch": "[KILLED CANDIDATE] Matching network for vessel GHG intensity pooling under FuelEU Maritime rules. Disconfirmed as OceanScore and BetterSea already operate established marketplaces with thousands of vessels.",
        "detailedDescription": "FuelEU Maritime allows vessel operators to pool over-compliant and under-compliant ships to optimize penalty balances. Competitor analysis confirmed existing entrants OceanScore and BetterSea already possess dominant network effects and established vessel integrations. Retained as a disconfirmed thesis.",
        "category": "Maritime & EU Compliance",
        "subcategory": "fueleu-pooling-killed",
        "tags": ["fueleu-maritime", "shipping-compliance", "killed-candidate", "disconfirmed-thesis", "oceanscore"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Commercial vessel operators [KILLED]",
            "problemSolved": "FuelEU Maritime pooling matching [SOLVED BY EXISTING ENTRANTS].",
            "whatToBuild": "FuelEU vessel pool exchange [DISCONFIRMED].",
            "howItMakesMoney": "Pool clearing fees [N/A].",
            "whyCustomersPay": "N/A — OceanScore and BetterSea already hold network dominance.",
            "overallScore": 64.5
        },
        "scores": {
            "overallOpportunity": {"value": 64.5, "confidence": "low"}
        },
        "compositeScores": {
            "overallOpportunity": 64.5,
            "compositeHeadline": 64.5
        },
        "sourceReferences": ["s80"],
        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": True,
            "reason": "Existing incumbents OceanScore and BetterSea actively operate scaling FuelEU marketplaces."
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_C"
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-406",
        "legacyId": "genericmethanemrv",
        "slug": "generic-methane-certification-mrv",
        "name": "Generic Methane Certification/MRV — Commodity Gas Methane MRV & Registry Platform [KILLED]",
        "oneSentenceConcept": "Upstream gas methane emissions monitoring, reporting, and certificate registry [KILLED - MiQ & Xpansiv dominant].",
        "elevatorPitch": "[KILLED CANDIDATE] Standard methane certification and MRV registry for natural gas production. Disconfirmed due to strong incumbents MiQ (certifications) and Xpansiv (settlement/registry).",
        "detailedDescription": "Broad upstream methane MRV and certificate issuance is already well-covered by MiQ standards and Xpansiv environmental trading infrastructure. Venture Atlas narrowed the methane opportunity strictly to downstream contract reconciliation (MethaneTrueUp / ContractOracle) while marking generic MRV disconfirmed.",
        "category": "Environmental Certification",
        "subcategory": "methane-mrv-killed",
        "tags": ["methane-mrv", "emissions-registry", "killed-candidate", "disconfirmed-thesis", "miq"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Upstream gas producers [KILLED]",
            "problemSolved": "Methane certification and MRV [DOMINATED BY INCUMBENTS].",
            "whatToBuild": "Generic methane MRV registry [DISCONFIRMED].",
            "howItMakesMoney": "Certificate issuance fees [N/A].",
            "whyCustomersPay": "N/A — MiQ and Xpansiv dominate market infrastructure.",
            "overallScore": 62.5
        },
        "scores": {
            "overallOpportunity": {"value": 62.5, "confidence": "low"}
        },
        "compositeScores": {
            "overallOpportunity": 62.5,
            "compositeHeadline": 62.5
        },
        "sourceReferences": ["s81"],

        "validationChecklist": {
            "scorePercentage": 100,
            "adversarialPassCompleted": True
        },
        "killCriteria": {
            "killFlagged": True,
            "reason": "MiQ and Xpansiv already dominate upstream gas methane certification and market infrastructure."
        },
        "provenance": {
            "provider": "Venture Atlas OMEGA VI",
            "sourceTier": "TIER_C"
        }
    }
]

added = 0
for idea in round12_ideas:
    if idea['id'] not in existing_ids:
        ideas.append(idea)
        added += 1

if isinstance(data, list):
    data = ideas
else:
    data['ideas'] = ideas

with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"[OK] Successfully ingested {added} new EEP Research Round #12 ideas into ideas.json (Total canonical ideas: {len(ideas)})")

# Run generate-all-missing-dossiers.py
subprocess.run(['python', os.path.join(ROOT, 'scripts', 'generate-all-missing-dossiers.py')], check=True)
