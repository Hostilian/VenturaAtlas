"""
VentureAtlas OS -- OMEGA XVII: Public Money Graph Ingestion Script
=================================================================
Research date: 17 August 2026

Ingests 5 canonical finalist business opportunities:
  idea-407  AidGraph -- Public Money Graph Platform            (priority, parent)
  idea-408  AidHeadroom -- De Minimis Group Headroom Audit     (priority)
  idea-409  SubsidySignal -- Public Aid Buying-Signal Intel    (priority)
  idea-410  RiceGuard -- Preferential-Tariff Safeguard PO Risk (researched)
  idea-411  WorkerChainReceipt -- UK Contractor RTW Evidence   (researched)

Archived/excluded (with reason):
  - MarkSurvive: existing archive entry; new AI-marking evidence updates that thesis
  - APIChangeImpact: category already populated (ApiNotes, Changes.watch)
  - MedicineShortage Signal: high-stakes buyer, enterprise integration, EMA platform
  - PFAS Utility Graph: utilities difficult first customers; established analytics
  - TribunalEvidenceClock: feature-tier, e-discovery overlap, scored 5.1/10

New VentureAtlas metrics: TSV, ASR, PDE, OTS
New heuristic: Government Exhaust Companies
"""

import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
RESEARCH_RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
PROMPTS_DIR = os.path.join(ROOT, "prompts", "idea-specific")
DOSSIERS_DIR = os.path.join(ROOT, "ideas")

NEW_IDEAS = [
    {
        "schemaVersion": "2.0.0",
        "id": "idea-407",
        "legacyId": "aidgraph",
        "slug": "aidgraph-public-money-graph-platform",
        "name": "AidGraph -- Public Money Graph Platform",
        "oneSentenceConcept": "A shared entity-resolution and public-award-history graph powering both pre-application de minimis headroom audits (AidHeadroom) and post-award B2B buying-signal intelligence (SubsidySignal) from newly mandatory 2026 EU State Aid registers.",
        "elevatorPitch": "For grant advisers, subsidy analysts and B2B sales teams, AidGraph resolves corporate group structures against the 2026 EU de minimis transparency registers, producing a normalised company-group-funding graph that supports both compliance headroom calculations and commercial buying-signal alerts from the same underlying data asset.",
        "detailedDescription": "Since 1 January 2026, general de minimis aid must be recorded in central national or EU registers (Regulation 2023/2831). The resulting data stream creates two addressable markets: (A) grant applicants need group headroom before applying; (B) B2B suppliers can use the same newly public funding events as early commercial intent signals. AidGraph is the shared data platform beneath both AidHeadroom and SubsidySignal.",
        "category": "Public Sector & Regulatory Data",
        "subcategory": "State Aid & Corporate Group Intelligence",
        "tags": ["EU State Aid", "de minimis", "corporate group resolution", "public data", "buying signals", "grant compliance", "OMEGA XVII", "2026"],
        "alternativeNames": ["AidGraph", "Public Money Graph"],
        "relatedIdeaIds": ["idea-408", "idea-409"],
        "status": "priority",
        "omegaRound": "OMEGA XVII",
        "researchDate": "2026-08-17",
        "sourceReferences": [],
        "provenance": {
            "sourceType": "primary research -- OMEGA XVII Public Money Graph reset",
            "originalWordingAvailable": "full",
            "notes": "Parent platform concept. AidHeadroom (idea-408) and SubsidySignal (idea-409) are its two product lines. Validated by EU Council feedback, Czechia Aug 2026 register modernisation, and Commission guidance."
        },
        "atAGlance": {
            "targetCustomer": "Grant consultants, subsidy advisers, and B2B sales intelligence teams",
            "problemSolved": "EU de minimis aid registers create a new stream of observable company funding events, but the underlying corporate group graph is fragmented across jurisdictions.",
            "whatToBuild": "Shared entity-resolution graph: legal entities + control relationships + Member State + de minimis awards + scheme purpose + rolling 3-year window. Consumed by AidHeadroom and SubsidySignal product lines.",
            "howItMakesMoney": "Platform infrastructure: AidHeadroom per-audit fees + SubsidySignal subscriptions + eventual API licensing.",
            "whyCustomersPay": "Group-resolution step confirmed painful by EU Council feedback and Czechia August 2026 bulk-upload register feature.",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 5000, "midpoint": 150000, "maximum": 2000000, "basis": "OMEGA XVII analyst scenario: platform underpinning two product lines"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 100},
            "timeToMvp": "1 day (spreadsheet) to 8 weeks (software)",
            "timeToFirstRevenue": "1-5 days via AidHeadroom EUR99 concierge audit",
            "profitabilityCondition": "3 prepaid AidHeadroom audits before meaningful build. SubsidySignal requires 3 recurring vertical purchasers.",
            "overallScore": 87.0,
            "confidenceScore": 8.6,
            "mainAdvantage": "Service-to-dataset-to-software path; same graph serves compliance and intelligence buyers; first-mover on newly mandatory 2026 EU transparency layer",
            "mainRisk": "Governments intend to automate group-resolution by 2029. Pure calculator has known half-life. Must grow toward durable intelligence layer.",
            "bestNextValidationStep": "Sell 3 prepaid AidHeadroom EUR99 audits to grant consultants before writing any code."
        },
        "omegaMetrics": {
            "transparencyShockValue": "HIGH -- general de minimis awards newly public from 1 Jan 2026; previously excluded from State Aid Scoreboard",
            "administrativeSunsetRisk": "HIGH for AidHeadroom calculator wedge; LOW for SubsidySignal intelligence layer",
            "publicDataExhaust": "HIGH -- entity resolution, group edges, award records, scheme classifications all reusable for intelligence product",
            "officialToolShadow": "2-3 (official system exposes records; leaves orchestration, group-resolution, cross-authority reconciliation to users)"
        },
        "validationChecklist": {"deskResearchCompleted": True, "adversarialPassCompleted": True, "paymentTestDefined": True, "killConditionsDefined": True, "scorePercentage": 100},
        "compositeScores": {"overallOpportunity": 87.0, "compositeHeadline": 87.0, "bootstrappedPotential": 92.0, "soloFounderPotential": 90.0, "fastestPathToRevenue": 88.0, "differentiation": 78.0, "profitPotential": 82.0}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-408",
        "legacyId": "aidheadroom",
        "slug": "aidheadroom-de-minimis-group-headroom-audit",
        "name": "AidHeadroom -- De Minimis Group Headroom Audit",
        "oneSentenceConcept": "For EU grant advisers and multi-company applicants, AidHeadroom resolves the corporate group counting as one undertaking, assembles de minimis awards from public registers plus legacy declarations, calculates remaining three-year headroom by Member State, and produces a source-linked review pack before the next aid application.",
        "elevatorPitch": "A grant applicant facing a EUR300,000 EU de minimis ceiling may need to map linked entities, aggregate historical awards across Member States, reconcile pre-2026 certificates with new register entries, and produce a defensible evidence trail. AidHeadroom delivers a source-linked Headroom Memo at EUR99 per applicant group, aimed initially at EU grant consultants managing multiple corporate clients.",
        "detailedDescription": "Under Regulation 2023/2831 the ceiling is EUR300,000 over a rolling three-year period for a single undertaking. Single undertaking includes all connected companies sharing majority voting, management appointment rights, dominant influence, or agreed control. Awards must enter central registers from 1 January 2026, but the historical gap persists until 31 December 2028. EU Council Member State feedback confirms substantial administrative burden. Czechia's August 2026 register modernisation added bulk XLSX/CSV upload of linked enterprises specifically for group-resolution complexity. MVP: concierge service producing aid-headroom-report.pdf + evidence.csv. No database required before first sale.",
        "category": "Regulatory Compliance & Grant Advisory",
        "subcategory": "EU State Aid / De Minimis Compliance",
        "tags": ["EU de minimis", "Regulation 2023/2831", "single undertaking", "corporate group", "grant compliance", "State Aid", "OMEGA XVII", "grant consultants", "2026"],
        "alternativeNames": ["AidHeadroom", "De Minimis Headroom Audit"],
        "relatedIdeaIds": ["idea-407", "idea-409"],
        "status": "priority",
        "omegaRound": "OMEGA XVII",
        "researchDate": "2026-08-17",
        "sourceReferences": [],
        "provenance": {
            "sourceType": "primary research -- OMEGA XVII Public Money Graph reset",
            "originalWordingAvailable": "full",
            "notes": "Primary product of AidGraph platform. Validated by EU Council single-undertaking burden feedback, Czechia Aug 2026 bulk-upload feature, Enterprise Ireland group-declaration requirements, AWEX 2026-2028 hybrid transition documentation."
        },
        "atAGlance": {
            "targetCustomer": "Independent EU grant consultants managing applications for corporate clients",
            "problemSolved": "The de minimis ceiling applies to the entire corporate group as one undertaking. Assembling the group perimeter, historical awards, and new 2026 register entries into a defensible evidence trail is genuinely painful.",
            "whatToBuild": "Concierge PDF report: applicant + candidate single undertaking + included prior awards + remaining headroom + proposed award + evidence links + unresolved issues + AMBER/GREEN/RED conclusion. No autonomous legal conclusions about group control.",
            "howItMakesMoney": "EUR99 per applicant audit (validation). EUR149/month adviser workspace (concierge). Usage-based complex group reviews.",
            "whyCustomersPay": "A EUR100k-EUR250k grant application makes a EUR99 evidence audit negligible. Omission risks aid repayment or ineligibility.",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 495, "midpoint": 35000, "maximum": 180000, "basis": "5 audits x EUR99 validation to 100 advisers growth"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 0, "maximum": 20},
            "timeToMvp": "1 day (spreadsheet + PDF template)",
            "timeToFirstRevenue": "1-5 days",
            "profitabilityCondition": "Median case time under 60 min at EUR99 gives roughly EUR99/hr gross. If cases regularly exceed 3h, economics weaken materially.",
            "overallScore": 87.0,
            "confidenceScore": 8.7,
            "mainAdvantage": "Effectively EUR0 startup cost; existing professional workflow; 2026 data transition creates temporary irresolvable gap; confirmed government-side friction",
            "mainRisk": "Official registers close gap by 2029; consultants may use Excel for simple clients; corporate-group data may become expensive",
            "bestNextValidationStep": "Send cold message to 30-40 EU grant consultants offering De Minimis Group Headroom Audit EUR99. Require 3 prepaid audits as PASS."
        },
        "paymentTest": {
            "offer": "De Minimis Group Headroom Audit EUR99. One applicant, linked-company list, historical certificates, proposed support amount -> source-linked three-year aid ledger + provisional remaining allowance + unresolved issues.",
            "firstBuyer": "Independent EU grant consultant managing corporate clients",
            "distribution": "Direct outreach to 30-40 consultants advertising EU grants, subsidy advisory, innovation funding, energy-efficiency grants, digitalisation support",
            "pass": "3 prepaid EUR99 audits",
            "strongPass": "Adviser sends a second client without being asked",
            "exceptionalPass": "Adviser asks for continuous monitoring of all clients",
            "fail": "Zero paid audits after 50 properly targeted advisers and real conversations",
            "maxBudget": "EUR20 (preferably EUR0)",
            "maxBuildBeforeSale": "One working spreadsheet + one sample report"
        },
        "killConditions": [
            "Fewer than 3 of 50 qualified advisers pay",
            "Median manual case takes less than 10 minutes using current official tools",
            "Advisers expect it free as part of other grant software",
            "Official systems consistently produce sufficient group-level results",
            "Corporate data costs force pre-revenue spend above EUR100",
            "Most applications concern simple one-entity firms",
            "Liability requires regulated legal work beyond a review-support product"
        ],
        "advocateCase": "A single EUR100k-EUR250k support application makes a EUR99-EUR300 evidence audit negligible. EUR300k ceiling applies collectively. Public data improving dramatically. 2026-2028 transition means public data coexist with old private certificates. Government feedback independently confirms linked-company data is difficult. Entity/award graph also feeds SubsidySignal.",
        "skepticCase": "Government is automating it. Czechia already has advanced implementation. EU register becomes more useful every month. Group legal perimeter requires professional judgement. Corporate ownership data may be expensive. Consultants may maintain Excel. Compliance wedge has known half-life (2029).",
        "geographicWedge": {
            "recommended": ["Ireland (Enterprise Ireland documents group-wide declarations explicitly)", "Belgium/Wallonia (AWEX documents 2026-2028 hybrid state precisely)"],
            "study": "Czechia (most advanced register, best for product study, but strongest official-competition threat)"
        },
        "omegaMetrics": {
            "transparencyShockValue": "HIGH",
            "administrativeSunsetRisk": "HIGH -- calculator wedge intentionally automated by 2029",
            "publicDataExhaust": "HIGH -- produces entity graph reused by SubsidySignal",
            "officialToolShadow": "2-3 depending on country"
        },
        "validationChecklist": {"deskResearchCompleted": True, "adversarialPassCompleted": True, "paymentTestDefined": True, "killConditionsDefined": True, "geographicWedgeDefined": True, "scorePercentage": 100},
        "compositeScores": {"overallOpportunity": 87.0, "compositeHeadline": 87.0, "bootstrappedPotential": 95.0, "soloFounderPotential": 93.0, "fastestPathToRevenue": 92.0, "differentiation": 76.0, "profitPotential": 80.0}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-409",
        "legacyId": "subsidysignal",
        "slug": "subsidysignal-public-aid-buying-signal-intelligence",
        "name": "SubsidySignal -- Public Aid Buying-Signal Intelligence",
        "oneSentenceConcept": "Weekly curated alerts translating newly public EU de minimis aid events into commercially relevant buying signals for B2B suppliers -- one country, one vertical, specific declared funding purpose.",
        "elevatorPitch": "The Commission's 2026 State Aid transparency regime explicitly reduces information asymmetry by letting companies see aid granted to competitors. SubsidySignal turns that register into a sales intelligence layer: a manufacturing company receiving automation funding is a near-term buyer of robotics, ERP, and industrial software before they issue an RFP. EUR49 weekly brief, one vertical, one territory.",
        "detailedDescription": "EU State Aid transparency already covered larger awards; the 2026 de minimis change creates a new layer of previously invisible company funding events. These events reveal a business is digitalising, buying equipment, expanding internationally, training staff, or making environmental investments. The product is not a government database clone. It is a normalised, entity-resolved, purpose-classified weekly brief sold to B2B suppliers. US precedent: Starbridge and GovWin treat grant awards as early buying signals. The moat is outcome history: if funding event type A for companies of type B reliably precedes purchase event C, that correlation becomes proprietary.",
        "category": "B2B Sales Intelligence & Market Data",
        "subcategory": "Public Data-Derived Buying Signals",
        "tags": ["B2B intelligence", "buying signals", "EU State Aid", "de minimis", "sales enablement", "public data", "OMEGA XVII", "2026"],
        "alternativeNames": ["SubsidySignal", "Public Money Intelligence"],
        "relatedIdeaIds": ["idea-407", "idea-408"],
        "status": "priority",
        "omegaRound": "OMEGA XVII",
        "researchDate": "2026-08-17",
        "sourceReferences": [],
        "provenance": {
            "sourceType": "primary research -- OMEGA XVII Public Money Graph reset",
            "originalWordingAvailable": "full",
            "notes": "Secondary product of AidGraph platform. Commission transparency goal is structural. Moat from outcome-history correlation, not from public data itself."
        },
        "atAGlance": {
            "targetCustomer": "B2B industrial automation integrators, ERP vendors, industrial software suppliers targeting manufacturing or capital-intensive verticals",
            "problemSolved": "B2B suppliers lack early signals of company investment intent before procurement events become publicly visible.",
            "whatToBuild": "Weekly curated brief: company name, aid event, published purpose, amount, scheme, commercial relevance note, confidence. Sell by territory + vertical. No fabricated contact intent.",
            "howItMakesMoney": "EUR49 founding brief (10-25 companies). EUR79-149/month recurring vertical subscription. Eventual outcome-tracking API.",
            "whyCustomersPay": "Funding event under automation/digitalisation scheme = near-term buyer window before RFP. Competitors also in register = competitive intelligence value.",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 3000, "midpoint": 50000, "maximum": 360000, "basis": "3 founding briefs validation to 200 vertical vendors growth"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 0, "maximum": 20},
            "timeToMvp": "1 week (manual curation, one country, one vertical)",
            "timeToFirstRevenue": "3-7 days",
            "overallScore": 81.0,
            "confidenceScore": 8.0,
            "mainAdvantage": "Durable half of AidGraph as compliance wedge fades; outcome history becomes proprietary moat; Commission transparency goal is structural",
            "mainRisk": "Aid event to buyer-intent correlation may be weak; records appear too late; scheme purposes too vague; established sales-intel vendors may add feed immediately",
            "bestNextValidationStep": "Sell EUR49 founding brief to 3 industrial automation integrators covering Czech manufacturing. If 3 buyers pay and one asks for weekly recurring alerts, proceed."
        },
        "paymentTest": {
            "offer": "EUR49 Founding Subsidy-Signal Brief -- 10-25 newly aided companies in your territory with beneficiary, amount, programme, declared purpose, source, commercial relevance note, and confidence level.",
            "firstBuyer": "Industrial automation integrator or specialist B2B supplier",
            "distribution": "Direct outreach to vertical sales directors at robotics, ERP, industrial software targeting one defined geography",
            "pass": "3 buyers purchase the same recurring vertical report",
            "strongPass": "One buyer asks for weekly alerts",
            "fail": "Buyers say signal is consistently too late, too vague, or irrelevant to actual purchasing"
        },
        "killConditions": [
            "Aid event to buyer-intent correlation is weak across pilot briefs",
            "Published records appear too late for commercial relevance",
            "Scheme purposes consistently too vague to classify",
            "Entity resolution costs more than customers pay",
            "Established sales-intelligence vendors add the feed immediately",
            "Fewer than 3 vendors pay for repeated weekly alerts"
        ],
        "omegaMetrics": {
            "transparencyShockValue": "HIGH -- Commission explicitly frames register as reducing market information asymmetry",
            "administrativeSunsetRisk": "LOW -- government not trying to be a B2B sales intelligence platform",
            "publicDataExhaust": "VERY HIGH -- every brief produces normalised entity-award-purpose records feeding outcome correlation",
            "officialToolShadow": "4 -- official system exposes data but leaves commercial signal extraction entirely to market"
        },
        "validationChecklist": {"deskResearchCompleted": True, "adversarialPassCompleted": True, "paymentTestDefined": True, "killConditionsDefined": True, "scorePercentage": 100},
        "compositeScores": {"overallOpportunity": 81.0, "compositeHeadline": 81.0, "bootstrappedPotential": 88.0, "soloFounderPotential": 85.0, "fastestPathToRevenue": 84.0, "differentiation": 74.0, "profitPotential": 82.0}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-410",
        "legacyId": "riceguard",
        "slug": "riceguard-preferential-tariff-safeguard-po-risk",
        "name": "RiceGuard -- Preferential-Tariff Safeguard PO Risk",
        "oneSentenceConcept": "Purchase-order risk monitor mapping EU GSP rice import volumes against the new automatic safeguard trigger under the reformed GSP regulation, alerting importers when preference suspension is likely before the shipment arrives.",
        "elevatorPitch": "The reformed EU GSP (applying 1 January 2027) introduces an automatic rice safeguard: when import volumes hit thresholds, preferential treatment is suspended and MFN tariffs apply. A PO placed at GSP tariff rates may face substantial unexpected duty at clearance. RiceGuard monitors trigger proximity and flags risk before the order is committed.",
        "detailedDescription": "OMEGA XVII primary-source checking weakened the broad GSP cutover thesis -- the Commission confirms beneficiary-country lists do not reset wholesale. The narrow automatic rice safeguard mechanism survives. Scored 6.9/10. Expert commodity traders already understand tariff mechanics; official/customs systems may absorb this; data timeliness is critical.",
        "category": "Trade Compliance & Import Operations",
        "subcategory": "GSP Preferential Tariff Risk",
        "tags": ["EU GSP", "rice safeguard", "tariff risk", "preferential trade", "import PO risk", "OMEGA XVII", "2027"],
        "alternativeNames": ["RiceGuard", "GSP Safeguard Alert"],
        "relatedIdeaIds": [],
        "status": "researched",
        "omegaRound": "OMEGA XVII",
        "researchDate": "2026-08-17",
        "sourceReferences": [],
        "provenance": {"sourceType": "primary research -- OMEGA XVII Public Money Graph reset", "notes": "Scored 6.9/10. Initially rated higher; primary-source check of Commission GSP documentation weakened broad cutover thesis. Narrow safeguard mechanism survives."},
        "atAGlance": {
            "targetCustomer": "Rice importers and commodity traders sourcing from GSP beneficiary countries",
            "problemSolved": "PO placed at GSP preferential rates may face MFN tariff at clearance if the automatic rice safeguard triggers during transit.",
            "whatToBuild": "PO-level tariff scenario: PO + country + rice category + current EU import volume vs threshold + safeguard state + ETA + tariff scenario delta.",
            "howItMakesMoney": "Per-PO risk alert; subscription for traders with repeat volume",
            "whyCustomersPay": "A tariff surprise on a large rice shipment can represent tens of thousands of EUR in unexpected duty.",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 2000, "midpoint": 25000, "maximum": 200000, "basis": "OMEGA XVII score 6.9/10; narrow commodity scope limits ceiling"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 50, "maximum": 100},
            "timeToMvp": "1-2 weeks",
            "timeToFirstRevenue": "1-2 weeks",
            "overallScore": 69.0,
            "confidenceScore": 6.5,
            "mainAdvantage": "Concrete monetary risk; existing spending on tariff data; narrow defensible niche",
            "mainRisk": "Expert traders already understand tariffs; official customs systems may absorb; data timeliness critical; very narrow commodity scope",
            "bestNextValidationStep": "Interview 10 EU rice importers about actual GSP tariff-surprise history and willingness to pay for pre-shipment risk alerts."
        },
        "killConditions": ["Expert traders confirm they already track safeguard volumes via official EU Trade portal", "Safeguard volumes rarely near threshold in practice", "Data timeliness from official sources is sufficient", "Fewer than 3 importers pay for a test alert"],
        "omegaMetrics": {"transparencyShockValue": "LOW", "administrativeSunsetRisk": "MEDIUM", "publicDataExhaust": "LOW", "officialToolShadow": "2"},
        "validationChecklist": {"deskResearchCompleted": True, "adversarialPassCompleted": True, "paymentTestDefined": False, "killConditionsDefined": True, "scorePercentage": 75},
        "compositeScores": {"overallOpportunity": 69.0, "compositeHeadline": 69.0, "bootstrappedPotential": 75.0, "soloFounderPotential": 70.0, "fastestPathToRevenue": 72.0, "differentiation": 55.0, "profitPotential": 65.0}
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-411",
        "legacyId": "workerchainreceipt",
        "slug": "workerchainreceipt-uk-contractor-rtw-evidence-chain",
        "name": "WorkerChainReceipt -- UK Contractor RTW Evidence Chain",
        "oneSentenceConcept": "Shared right-to-work evidence graph for multi-tier UK contractor chains where checks performed at one tier need to flow to engagers across the chain under expanded October 2026 obligations.",
        "elevatorPitch": "From 1 October 2026, UK right-to-work responsibilities expand across certain non-traditional working arrangements. Long subcontracting chains face the problem that a check performed at tier 3 cannot easily be evidenced by tier 1. WorkerChainReceipt explores whether established RTW providers actually fail this specific multi-tier evidence-sharing step.",
        "detailedDescription": "OMEGA XVII explicit verdict: DO NOT BUILD generic RTW software. Scored 6.6/10. TrustID already markets RTW across supply chains including construction use cases. Status set to researched. Only revisit on strong interview evidence of specific multi-tier evidence-sharing failure that established providers refuse to solve.",
        "category": "Employment Compliance & HR Technology",
        "subcategory": "Right-to-Work & Labour Chain Compliance",
        "tags": ["right-to-work", "UK compliance", "contractor chain", "subcontracting", "October 2026", "OMEGA XVII", "employment"],
        "alternativeNames": ["WorkerChainReceipt", "RTW Chain Evidence"],
        "relatedIdeaIds": [],
        "status": "researched",
        "omegaRound": "OMEGA XVII",
        "researchDate": "2026-08-17",
        "sourceReferences": [],
        "provenance": {"sourceType": "primary research -- OMEGA XVII Public Money Graph reset", "notes": "OMEGA XVII explicit verdict: DO NOT BUILD generic RTW software. Scored 6.6/10. TrustID already covers supply chains. Only revisit if interviews reveal specific multi-tier failure."},
        "atAGlance": {
            "targetCustomer": "Engagers managing long UK subcontracting chains in construction, logistics, or gig platforms",
            "problemSolved": "RTW check evidence performed at a lower subcontracting tier cannot easily be evidenced by the engager at tier 1 under expanded October 2026 obligations.",
            "whatToBuild": "Shared evidence chain: worker + check + document + expiry + chain-visible receipt per tier.",
            "howItMakesMoney": "Per-worker evidence receipt; site access integration",
            "whyCustomersPay": "Engager liability under expanded RTW obligations",
            "estimatedEarningPotential": {"currency": "GBP", "minimum": 1000, "midpoint": 20000, "maximum": 150000, "basis": "OMEGA XVII score 6.6/10; high incumbent competition limits ceiling"},
            "startupCost": {"currency": "GBP", "minimum": 0, "midpoint": 50, "maximum": 100},
            "timeToMvp": "2-4 weeks",
            "timeToFirstRevenue": "2-4 weeks",
            "overallScore": 66.0,
            "confidenceScore": 5.5,
            "mainAdvantage": "Expanding regulatory obligation creates new workflow need",
            "mainRisk": "TrustID and established providers already cover supply chains; defensibility 3/10 in OMEGA XVII scorecard",
            "bestNextValidationStep": "Interview 10 UK construction or logistics engagers: does TrustID solve the multi-tier evidence-sharing problem, or is there a genuine gap?"
        },
        "killConditions": ["TrustID and equivalents already solve multi-tier evidence sharing", "Engagers confirm check responsibility stops at their direct contractor", "October 2026 guidance makes evidence-sharing optional", "Fewer than 3 engagers pay for a cross-tier receipt product"],
        "omegaMetrics": {"transparencyShockValue": "LOW", "administrativeSunsetRisk": "LOW", "publicDataExhaust": "LOW", "officialToolShadow": "1-2"},
        "validationChecklist": {"deskResearchCompleted": True, "adversarialPassCompleted": True, "paymentTestDefined": False, "killConditionsDefined": True, "scorePercentage": 75},
        "compositeScores": {"overallOpportunity": 66.0, "compositeHeadline": 66.0, "bootstrappedPotential": 65.0, "soloFounderPotential": 62.0, "fastestPathToRevenue": 68.0, "differentiation": 38.0, "profitPotential": 55.0}
    }
]

RESEARCH_RUN = {
    "runId": "run-res-omega-xvii-20260817-public-money-graph",
    "baselineCommit": "post-omega-xv",
    "questions": [
        "Which new public data created in 2026 was previously invisible or fragmented?",
        "What entity-resolution problem prevents that data from being commercially useful?",
        "What event does the new public data reveal, and who can profit by knowing it first?",
        "Which families from previous OMEGA rounds are genuine semantic duplicates?"
    ],
    "queries": [
        "EU de minimis aid central register 2026 single undertaking",
        "Regulation 2023/2831 reporting obligation 1 January 2026",
        "State Aid de minimis single undertaking administrative burden EU Council",
        "Czech de minimis register linked enterprises bulk upload August 2026",
        "Enterprise Ireland de minimis group declaration guidance",
        "AWEX de minimis EU register 2026 transition",
        "EU GSP rice safeguard automatic trigger 2027",
        "UK right-to-work contractor chain October 2026",
        "TrustID supply chain right-to-work",
        "grant award buying signal sales intelligence B2B Starbridge",
        "ApiNotes API change monitoring OpenAPI diff",
        "Changes.watch SaaS changelog deprecation"
    ],
    "sourceCandidates": [
        "EU Competition Policy de minimis transparency 2026",
        "Data Consilium single undertaking administrative burden",
        "MZe Czech de minimis register August 2026",
        "Enterprise Ireland de minimis group declaration",
        "AWEX Export de minimis EU register transition",
        "Commission SGEI de minimis 2028 guidance",
        "EU Trade GSP reformed regulation 2027",
        "GOV.UK right-to-work October 2026 expansion",
        "TrustID supply chain RTW",
        "Starbridge grant buying signals"
    ],
    "inclusions": ["idea-407", "idea-408", "idea-409", "idea-410", "idea-411"],
    "exclusions": [
        {"slug": "marksurvive", "reason": "Existing archive entry; AI-marking August 2026 developments update that thesis, not a new startup"},
        {"slug": "apichangeimpact", "reason": "Category already populated: ApiNotes (OpenAPI diff), Changes.watch (SaaS changelog)"},
        {"slug": "medicineshortage-signal", "reason": "High-stakes buyer, medical risk, enterprise integration, existing EMA platform"},
        {"slug": "pfas-utility-graph", "reason": "Utilities difficult first customers; established analytics; fails EUR100 experiment"},
        {"slug": "tribunalevidenceclock", "reason": "Feature-tier; overlaps e-discovery incumbents; scored 5.1/10"}
    ],
    "newMetrics": [
        {"id": "TSV", "name": "Transparency Shock Value", "description": "new_record_volume x commercial_relevance x entity_resolvability x update_freshness x previous_information_scarcity"},
        {"id": "ASR", "name": "Administrative Sunset Risk", "description": "probability_official_automation_removes_task x speed x percentage_product_value_tied_to_task"},
        {"id": "PDE", "name": "Public Data Exhaust", "description": "Does servicing the immediate problem create a normalised asset saleable for a different job later?"},
        {"id": "OTS", "name": "Official Tool Shadow", "description": "0=fully solved by official tool, 5=official system creates the problem with no downstream tooling"}
    ],
    "newHeuristics": [
        {"id": "government-exhaust-companies", "name": "Government Exhaust Companies", "description": "NEW PUBLIC DATA -> who previously paid to discover this? -> what entity-resolution work is still missing? -> what other private data makes it useful? -> what event does it reveal? -> who can make money knowing it first? -> can we sell the decision before building the database?"}
    ],
    "claimsChanged": [
        "AidGraph family identified as genuinely new -- not a duplicate of any previous OMEGA idea",
        "GSP broad-cutover thesis weakened by primary-source check; narrow rice safeguard mechanism survives",
        "RTW software rejected for generic build; multi-tier evidence gap flagged as interview test only",
        "MarkSurvive confirmed as deduplication success -- new AI-marking evidence updates existing thesis"
    ],
    "agent": "research-intelligence-agent",
    "methodVersion": "epistemic-v2",
    "startedAt": "2026-08-17T00:00:00+00:00",
    "endedAt": "2026-08-17T23:59:59+00:00",
    "reviewStatus": "approved",
    "omegaRound": "OMEGA XVII",
    "omegaTitle": "Public Money Graph -- Hidden Subsidy State, Corporate-Group Resolution & Newly Observable Buying Signals"
}

PROMPT_TOPICS = [
    "Payment test design and outreach message",
    "Target customer profile and discovery",
    "Kill conditions and failure modes",
    "Competitive landscape and incumbent mapping",
    "Pricing strategy and willingness-to-pay evidence",
    "Minimum viable MVP specification",
    "Geographic wedge selection rationale",
    "Entity resolution approach and data sources",
    "Corporate group legal framework (Regulation 2023/2831)",
    "Rolling three-year window calculation logic",
    "Evidence chain design for human review",
    "AMBER GREEN RED status framework",
    "Advocate case strengthening",
    "Skeptic case and counter-evidence",
    "Pre-mortem: most likely failure scenario",
    "SubsidySignal vertical selection for pilot",
    "Outcome correlation tracking design",
    "Administrative Sunset Risk mitigation strategy",
    "AidGraph shared backend architecture",
    "Official Tool Shadow monitoring approach",
    "Regulatory source verification SGEI discrepancy",
    "Customer discovery script for grant consultants",
    "Financial model assumptions and unit economics",
    "Expansion roadmap beyond initial wedge",
    "Data provenance and source-linking requirements"
]


def make_dossier(idea):
    name = idea["name"]
    concept = idea["oneSentenceConcept"]
    customer = idea["atAGlance"]["targetCustomer"]
    problem = idea["atAGlance"]["problemSolved"]
    score = idea["atAGlance"]["overallScore"]
    status = idea["status"]
    omega = idea.get("omegaRound", "OMEGA XVII")
    rdate = idea.get("researchDate", "2026-08-17")
    advantage = idea["atAGlance"].get("mainAdvantage", "")
    risk = idea["atAGlance"].get("mainRisk", "")
    next_step = idea["atAGlance"].get("bestNextValidationStep", "See payment test.")
    kills = "\n".join(f"- {k}" for k in idea.get("killConditions", []))
    metrics = idea.get("omegaMetrics", {})
    metrics_md = "\n".join(f"- **{k}**: {v}" for k, v in metrics.items())
    payment = idea.get("paymentTest", {})
    pt_md = ""
    if payment:
        offer = payment.get("offer", "N/A")
        buyer = payment.get("firstBuyer", "N/A")
        pass_c = payment.get("pass", "N/A")
        fail_c = payment.get("fail", "N/A")
        budget = payment.get("maxBudget", "N/A")
        pt_md = f"""
## Payment Test

| Field | Value |
|-------|-------|
| Offer | {offer} |
| First buyer | {buyer} |
| PASS | {pass_c} |
| FAIL | {fail_c} |
| Max budget | {budget} |
"""
    return f"""# {name}

> **OMEGA Round**: {omega} | **Research date**: {rdate} | **Score**: {score}/100 | **Status**: {status}

## One-sentence concept

{concept}

## Target customer

{customer}

## Problem solved

{problem}

## OMEGA XVII Metrics

{metrics_md}
{pt_md}
## Advocate case

{advantage}

## Main risk

{risk}

## Kill conditions

{kills}

## Next validation step

{next_step}

---

*Dossier generated by OMEGA XVII ingest script (2026-08-17).
Primary sources: data/research-runs.json run-res-omega-xvii-20260817-public-money-graph*
"""


def ingest():
    print("=== Ingesting OMEGA XVII -- Public Money Graph (17 August 2026) ===")

    # 1. ideas.json
    print("[1/4] Updating data/ideas.json ...")
    with open(IDEAS_PATH, "r", encoding="utf-8") as f:
        ideas_data = json.load(f)
    existing = ideas_data.get("ideas", [])
    existing_ids = {i["id"] for i in existing}
    added = 0
    for idea in NEW_IDEAS:
        if idea["id"] not in existing_ids:
            existing.append(idea)
            added += 1
            print(f"  [OK] {idea['id']} -- {idea['name']}")
        else:
            print(f"  [SKIP] {idea['id']} already exists")
    ideas_data["ideas"] = existing
    with open(IDEAS_PATH, "w", encoding="utf-8") as f:
        json.dump(ideas_data, f, indent=2, ensure_ascii=False)
    print(f"  Total: {len(existing)} ideas (+{added} new)")

    # 2. research-runs.json
    print("[2/4] Updating data/research-runs.json ...")
    with open(RESEARCH_RUNS_PATH, "r", encoding="utf-8") as f:
        runs = json.load(f)
    run_ids = {r.get("runId") for r in runs}
    if RESEARCH_RUN["runId"] not in run_ids:
        runs.append(RESEARCH_RUN)
        with open(RESEARCH_RUNS_PATH, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2, ensure_ascii=False)
        print(f"  [OK] Appended: {RESEARCH_RUN['runId']}")
    else:
        print(f"  [SKIP] Run already exists")

    # 3. Dossiers
    print("[3/4] Generating dossier files ...")
    os.makedirs(DOSSIERS_DIR, exist_ok=True)
    for idea in NEW_IDEAS:
        path = os.path.join(DOSSIERS_DIR, f"{idea['slug']}.md")
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write(make_dossier(idea))
            print(f"  [OK] ideas/{idea['slug']}.md")
        else:
            print(f"  [SKIP] Already exists: ideas/{idea['slug']}.md")

    # 4. Prompts
    print("[4/4] Generating prompt stubs (25 per idea) ...")
    for idea in NEW_IDEAS:
        d = os.path.join(PROMPTS_DIR, idea["id"])
        os.makedirs(d, exist_ok=True)
        for idx, topic in enumerate(PROMPT_TOPICS, 1):
            p = os.path.join(d, f"prompt-{idx:02d}.md")
            if not os.path.exists(p):
                with open(p, "w", encoding="utf-8") as f:
                    f.write(
                        f"# Prompt {idx:02d} -- {idea['name']}\n\n"
                        f"**Topic**: {topic}\n\n"
                        f"**Idea**: {idea['oneSentenceConcept']}\n\n"
                        f"---\n\n"
                        f"Research and validate: {topic} for **{idea['name']}**.\n\n"
                        f"Apply the VentureAtlas constitution: primary sources only, "
                        f"explicit kill conditions, payment before meaningful build, "
                        f"maximum EUR100 pre-revenue expenditure.\n"
                    )
        print(f"  [OK] 25 prompts for {idea['id']}")

    print("\n=== OMEGA XVII Ingest Complete ===")
    print(f"  Added: {added}/5 ideas")
    print(f"  Research run: {RESEARCH_RUN['runId']}")
    print("\nNext steps:")
    print("  1. node scripts/validate-data.js")
    print("  2. Copy OMEGA XVII document to research/OMEGA_XVII_PUBLIC_MONEY_GRAPH_2026-08-17.md")
    print("  3. Run payment test: 30-40 EU grant consultant outreach for AidHeadroom EUR99 audit")


if __name__ == "__main__":
    ingest()

