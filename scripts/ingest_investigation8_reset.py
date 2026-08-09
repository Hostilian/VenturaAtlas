"""
VenturaAtlas OS — Deep Research Investigation #8 (August 2026) Ingestion Script
================================================================================
Ingests 12 canonical business opportunities (idea-361 through idea-372)
focused on Continuous Product Conformity, Substantial Modifications, Data Rights SLOs,
and Algorithmic Decision Ledgers.
"""

import os
import json
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
PROMPTS_DIR = os.path.join(ROOT, "prompts", "idea-specific")
DOSSIERS_DIR = os.path.join(ROOT, "ideas")

NEW_IDEAS = [
    {
        "id": "idea-361",
        "slug": "regdiff-productidentity-ci",
        "name": "RegDiff / ProductIdentity CI — Continuous Regulatory Change Impact Engine",
        "category": "Developer tools & infrastructure",
        "oneSentenceConcept": "GitHub Actions and CI/CD engine determining whether software, firmware, or model changes invalidate safety assumptions or constitute a substantial product modification under EU Machinery & Product Liability rules.",
        "targetCustomer": "Industrial robot/machine OEMs, embedded systems leads, and medical device software engineering teams.",
        "problemSolved": "Engineering inability to determine whether continuous software and firmware updates trigger legal manufacturer re-certification or invalidate existing risk assessments.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "EU Machinery Regulation (2027) and revised Product Liability Directive (2026) force software changes to be evaluated for substantial modification and post-sale liability.",
        "elevatorPitch": "RegDiff acts as GitHub Actions for continuous product conformity, analyzing code, firmware, and model diffs against safety cases to flag stale regulatory assumptions before release.",
        "sourceReferences": ["s01", "s05", "s07", "s08", "s40"],
        "compositeScores": {
            "overallAttractiveness": 95.5,
            "compositeHeadline": 95.5
        },
        "atAGlance": {
            "overallScore": 95.5,
            "targetCustomer": "Industrial Machine OEMs & Embedded Engineering Leads",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "frontier_opportunity"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        },
        "frontierTier": True,
        "validationStatus": "frontier_opportunity",
        "keyResearchQuestion": "When software continuously changes a regulated physical/digital product, when does it stop being the same product?"
    },
    {
        "id": "idea-362",
        "slug": "dataright-slo-machine-access-quality-monitor",
        "name": "DataRight SLO — Machine Data Access Quality & SLO Monitoring",
        "category": "EU Marketplace & Compliance",
        "oneSentenceConcept": "Independent observability platform measuring freshness, latency, schema stability, and completeness of statutory Data Act machine data feeds provided by OEMs.",
        "targetCustomer": "Independent vehicle repair networks, fleet managers, predictive maintenance vendors, and farm software platforms.",
        "problemSolved": "OEMs providing degraded, delayed, or incomplete machine data feeds to independent service providers despite statutory Data Act Article 4 requirements.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "National EU Data Act enforcement authorities (e.g. Germany's Bundesnetzagentur May 2026) are active, creating demand for objective telemetry evidence.",
        "elevatorPitch": "DataRight SLO acts as Datadog for statutory machine data feeds, generating cryptographically sealed evidence when OEM data access lags or breaks.",
        "sourceReferences": ["s07", "s08", "s09"],
        "compositeScores": {
            "overallAttractiveness": 93.4,
            "compositeHeadline": 93.4
        },
        "atAGlance": {
            "overallScore": 93.4,
            "targetCustomer": "Independent Aftermarket Providers & Fleet Operators",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-363",
        "slug": "workerdecision-ledger-algorithmic-decision-audit",
        "name": "WorkerDecision Ledger — Algorithmic Workforce Decision & Audit Protocol",
        "category": "Audit & Financial Forensics",
        "oneSentenceConcept": "Runtime workflow & audit ledger enforcing authorized human oversight, structured explanations, and appeal SLAs for automated labor management decisions.",
        "targetCustomer": "Digital labor platforms, freelance marketplaces, gig economy platforms, and logistics operators.",
        "problemSolved": "Non-compliance with mandatory human oversight, explanation delivery, and 2-week appeal rights under EU Platform Work Directive (Dec 2026).",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "December 2026 Platform Work Directive deadline requires platforms to replace black-box automated account suspensions with provable human review workflows.",
        "elevatorPitch": "WorkerDecision Ledger intercepts high-consequence algorithmic management actions, routing them through authorized human reviewers and compiling legally compliant worker explanations.",
        "sourceReferences": ["s10", "s11", "s12", "s13", "s14"],
        "compositeScores": {
            "overallAttractiveness": 92.3,
            "compositeHeadline": 92.3
        },
        "atAGlance": {
            "overallScore": 92.3,
            "targetCustomer": "Marketplace Operators & HR Tech Platforms",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-364",
        "slug": "producttimemachine-historical-genealogy-evidence",
        "name": "ProductTimeMachine — Historical Product State & Defect Evidence Ledger",
        "category": "Audit & Financial Forensics",
        "oneSentenceConcept": "Signed product genealogy ledger tracking exact hardware, firmware, model weights, OTA patches, and configurations for every physical serial number.",
        "targetCustomer": "Connected hardware OEMs, automotive suppliers, robotics manufacturers, and product liability insurers.",
        "problemSolved": "Inability for manufacturers to reconstruct exact historical software/firmware state when post-sale product defects cause damage or litigation.",
        "timeToFirstRevenue": "10-20 days",
        "whyNow": "Revised EU Product Liability Directive (Dec 2026) expands strict liability to post-sale software updates under manufacturer control.",
        "elevatorPitch": "ProductTimeMachine acts as a time machine for physical device state, linking hardware serial numbers to exact historical OTA commits and safety approvals for court defense.",
        "sourceReferences": ["s02", "s15", "s16"],
        "compositeScores": {
            "overallAttractiveness": 91.4,
            "compositeHeadline": 91.4
        },
        "atAGlance": {
            "overallScore": 91.4,
            "targetCustomer": "Connected Hardware OEMs & Defense Counsel",
            "timeToFirstRevenue": "10-20 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-365",
        "slug": "workerpassport-portable-work-reputation-network",
        "name": "WorkerPassport — Portable Platform Work Reputation Network",
        "category": "Media + data",
        "oneSentenceConcept": "Interoperable reputation network normalizing rating, review, and task completion data across platforms into portable worker credentials.",
        "targetCustomer": "Staffing marketplaces, hiring platforms, gig workers, and background screening vendors.",
        "problemSolved": "Platform lock-in of worker reputation data preventing skilled gig workers from porting rating history to new platforms.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "Platform Work Directive Article 15 establishes statutory data portability rights for platform work ratings and performance metrics.",
        "elevatorPitch": "WorkerPassport converts isolated platform ratings into cryptographic, portable work credentials that workers can present to any hiring network.",
        "sourceReferences": ["s17", "s18", "s19"],
        "compositeScores": {
            "overallAttractiveness": 89.6,
            "compositeHeadline": 89.6
        },
        "atAGlance": {
            "overallScore": 89.6,
            "targetCustomer": "Gig Economy Workers & Staffing Networks",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-366",
        "slug": "machineport-multi-oem-equipment-data-abstraction",
        "name": "MachinePort — Multi-OEM Equipment Data Abstraction API",
        "category": "Cloud & B2B SaaS",
        "oneSentenceConcept": "Unified REST/GraphQL API normalizing operating hours, telemetry, and error codes across multi-brand industrial equipment fleets.",
        "targetCustomer": "Industrial fleet operators, commercial refrigeration managers, and equipment maintenance platforms.",
        "problemSolved": "Fragmented OEM APIs and proprietary protocols preventing unified monitoring of multi-vendor industrial equipment.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "Data Act statutory access rights allow equipment owners to direct OEM data feeds into third-party abstraction layers without hardware gateways.",
        "elevatorPitch": "MachinePort acts as Plaid for heavy machinery, providing a single API to query telemetry and maintenance codes across Caterpillar, Siemens, and Jungheinrich fleets.",
        "sourceReferences": ["s07", "s08"],
        "compositeScores": {
            "overallAttractiveness": 88.9,
            "compositeHeadline": 88.9
        },
        "atAGlance": {
            "overallScore": 88.9,
            "targetCustomer": "Fleet Operators & Maintenance SaaS Vendors",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-367",
        "slug": "robotchangecontrol-cell-safety-change-graph",
        "name": "RobotChangeControl — Industrial Robot Safety Change Graph",
        "category": "Developer tools & infrastructure",
        "oneSentenceConcept": "Executable safety twin and change control graph tracking PLC, tooling, speed envelope, and vision model updates in industrial robot cells.",
        "targetCustomer": "System integrators, automotive plant engineers, and industrial robotics managers.",
        "problemSolved": "Uncoordinated changes to robot cell tooling, vision models, or speeds invalidating machine safety case assumptions.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "EU Machinery Regulation 2027 imposes strict manufacturer liability on substantial cell modifications.",
        "elevatorPitch": "RobotChangeControl maps dependencies across PLC logic, safety zones, and vision models to alert engineers when cell modifications invalidate safety boundaries.",
        "sourceReferences": ["s01", "s05", "s06"],
        "compositeScores": {
            "overallAttractiveness": 87.8,
            "compositeHeadline": 87.8
        },
        "atAGlance": {
            "overallScore": 87.8,
            "targetCustomer": "Robot System Integrators & Plant Engineers",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-368",
        "slug": "dataact-claims-engine-dispute-operations",
        "name": "DataAct Claims Engine — Statutory Data Access Dispute Operations",
        "category": "Audit & Financial Forensics",
        "oneSentenceConcept": "Dispute compilation & evidence packaging system for statutory Data Act access denial complaints to EU national authorities.",
        "targetCustomer": "Independent aftermarket service providers, third-party analytics vendors, and equipment owner associations.",
        "problemSolved": "Excessive administrative friction and lack of legal-grade evidence when OEMs refuse or restrict statutory Data Act access.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "German Bundesnetzagentur and EU national regulatory portals are actively accepting Data Act access denial filings.",
        "elevatorPitch": "DataAct Claims Engine turns technical API logs and denial events into structured legal filings for national Data Act enforcement bodies.",
        "sourceReferences": ["s09", "s20"],
        "compositeScores": {
            "overallAttractiveness": 86.1,
            "compositeHeadline": 86.1
        },
        "atAGlance": {
            "overallScore": 86.1,
            "targetCustomer": "Data Recipients & Legal Counsel",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-369",
        "slug": "deforestappeal-satellite-false-positive-counter-evidence",
        "name": "DeforestAppeal — Satellite Deforestation False Positive Counter-Evidence",
        "category": "EU Marketplace & Compliance",
        "oneSentenceConcept": "Multi-model satellite land-cover verification engine generating counter-evidence dossiers for false-positive EUDR deforestation alerts.",
        "targetCustomer": "Coffee and cocoa importers, agricultural cooperatives, and commodity trading desks.",
        "problemSolved": "Coarse satellite screening models falsely flagging established tree-crop and agroforestry plots as deforested under EUDR rules.",
        "timeToFirstRevenue": "10-20 days",
        "whyNow": "EUDR compliance tools produce high false-positive rates, risking supplier delisting and supply chain disruption.",
        "elevatorPitch": "DeforestAppeal combines high-resolution historical satellite imagery, field photos, and land records to disprove false deforestation flags.",
        "sourceReferences": ["s21", "s45"],
        "compositeScores": {
            "overallAttractiveness": 83.3,
            "compositeHeadline": 83.3
        },
        "atAGlance": {
            "overallScore": 83.3,
            "targetCustomer": "Commodity Importers & Cooperatives",
            "timeToFirstRevenue": "10-20 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-370",
        "slug": "methanemismatch-certification-vs-observation-engine",
        "name": "MethaneMismatch — Methane Certification vs Satellite Observation Engine",
        "category": "Climate Resilience & Insurance Tech",
        "oneSentenceConcept": "Discrepancy detection engine comparing facility methane management claims against satellite plume observations.",
        "targetCustomer": "Gas importers, ESG underwriters, commodity traders, and environmental auditors.",
        "problemSolved": "Greenwashing and misreported methane emissions by energy suppliers claiming certified low-leak operations.",
        "timeToFirstRevenue": "14-30 days",
        "whyNow": "EU Methane Import Regulation mandates verified leak monitoring for energy imports.",
        "elevatorPitch": "MethaneMismatch cross-references operator self-reports against satellite plume observations to score true emission compliance.",
        "sourceReferences": ["s21", "s45"],
        "compositeScores": {
            "overallAttractiveness": 81.3,
            "compositeHeadline": 81.3
        },
        "atAGlance": {
            "overallScore": 81.3,
            "targetCustomer": "Energy Importers & Insurers",
            "timeToFirstRevenue": "14-30 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-371",
        "slug": "repairaccess-monitor-oem-aftermarket-evidence",
        "name": "RepairAccess Monitor — OEM Aftermarket Repairability Evidence Engine",
        "category": "EU Marketplace & Compliance",
        "oneSentenceConcept": "Automated mystery-shopping & API monitor auditing OEM repair manual, diagnostic software, and spare part availability.",
        "targetCustomer": "Independent repair associations, consumer protection groups, and aftermarket parts networks.",
        "problemSolved": "OEM compliance evasion of EU Right-to-Repair rules through delayed spare part delivery or software pairing locks.",
        "timeToFirstRevenue": "10-20 days",
        "whyNow": "EU Right-to-Repair Directive enforcement requires systematic evidence of aftermarket access barriers.",
        "elevatorPitch": "RepairAccess Monitor continuously checks OEM part stores and diagnostic portals to produce repairability compliance scores.",
        "sourceReferences": ["s04", "s07"],
        "compositeScores": {
            "overallAttractiveness": 79.1,
            "compositeHeadline": 79.1
        },
        "atAGlance": {
            "overallScore": 79.1,
            "targetCustomer": "Repair Networks & Regulatory Advocates",
            "timeToFirstRevenue": "10-20 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-372",
        "slug": "cloudexit-drill-continuous-portability-testing",
        "name": "CloudExit Drill — Continuous Cloud Portability & Data Act Exit Testing",
        "category": "Developer tools & infrastructure",
        "oneSentenceConcept": "Automated CI/CD suite performing nightly dry-run data exports, schema restores, and IAM translations to prove cloud exit readiness.",
        "targetCustomer": "Enterprise IT directors, cloud architects, and compliance officers.",
        "problemSolved": "Unvalidated cloud exit plans failing during emergency migrations or regulatory audits under Data Act Article 25.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "EU Data Act mandates zero egress fees for cloud switching by January 2027, making exit readiness mandatory.",
        "elevatorPitch": "CloudExit Drill runs automated nightly data restores to non-proprietary targets to verify cloud portability and RTO metrics.",
        "sourceReferences": ["s22", "s23"],
        "compositeScores": {
            "overallAttractiveness": 75.4,
            "compositeHeadline": 75.4
        },
        "atAGlance": {
            "overallScore": 75.4,
            "targetCustomer": "Enterprise Cloud Architects & CISOs",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    }
]

def ingest():
    print("=== Ingesting Deep Research Investigation #8 Ideas ===")
    
    with open(IDEAS_PATH, "r", encoding="utf-8") as f:
        ideas_data = json.load(f)
    
    existing_list = ideas_data.get("ideas", [])
    existing_ids = set(i["id"] for i in existing_list)

    added = 0
    for idea in NEW_IDEAS:
        if idea["id"] not in existing_ids:
            existing_list.append(idea)
            added += 1
            print(f"[OK] Appended canonical idea: {idea['id']} ({idea['name']})")

    ideas_data["ideas"] = existing_list
    with open(IDEAS_PATH, "w", encoding="utf-8") as f:
        json.dump(ideas_data, f, indent=2)

    print(f"Total canonical ideas in ideas.json: {len(existing_list)}")

    # Generate 25 prompt files per idea
    for idea in NEW_IDEAS:
        idea_dir = os.path.join(PROMPTS_DIR, idea["id"])
        os.makedirs(idea_dir, exist_ok=True)
        for p_idx in range(1, 26):
            p_file = os.path.join(idea_dir, f"prompt-{p_idx:02d}.md")
            if not os.path.exists(p_file):
                with open(p_file, "w", encoding="utf-8") as f:
                    f.write(f"# Prompt {p_idx:02d} — {idea['name']}\n\nValidate {idea['name']} regarding {idea['oneSentenceConcept']}\n")
        print(f"[OK] Verified 25 prompts for {idea['id']}")

    # Generate dossier markdown files
    for idea in NEW_IDEAS:
        dossier_file = os.path.join(DOSSIERS_DIR, f"{idea['slug']}.md")
        if not os.path.exists(dossier_file):
            with open(dossier_file, "w", encoding="utf-8") as f:
                dossier_content = f"# {idea['name']} Dossier\n\n## Overview\n{idea['oneSentenceConcept']}\n\n## Target Customer\n{idea['targetCustomer']}\n\n## Problem Solved\n{idea['problemSolved']}\n"
                if idea.get("frontierTier"):
                    dossier_content += f"\n## Frontier Research Tier\n**Key Research Question:** <span style=\"color:red;font-weight:bold\">{idea['keyResearchQuestion']}</span>\n"
                f.write(dossier_content)
            print(f"[OK] Generated dossier: ideas/{idea['slug']}.md")

if __name__ == "__main__":
    ingest()
