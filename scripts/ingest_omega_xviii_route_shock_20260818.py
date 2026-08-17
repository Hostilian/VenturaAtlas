#!/usr/bin/env python3
"""
OMEGA XVIII — Route Shock / Physical-State Proof
18 August 2026

Canonical ideas: idea-412 (ScrapRoute), idea-413 (BatteryFlightGate), idea-414 (CarrierReality)
Archive-update receipts: AI Model License Drift, Publisher Rights Probe, Machine-Payment cluster
Graveyard batch: 10 explicitly rejected ideas

New metrics: RSE, PPD, ODB, DCM, Contract Memory Score
New heuristic: Commercial Commitments Crossing External State Boundaries
"""

import json, os, pathlib, textwrap

ROOT = pathlib.Path(__file__).parent.parent
DATA_IDEAS   = ROOT / "data" / "ideas.json"
DATA_RUNS    = ROOT / "data" / "research-runs.json"
IDEAS_DIR    = ROOT / "ideas"
PROMPTS_DIR  = ROOT / "prompts" / "idea-specific"

# ── 1. New canonical ideas ────────────────────────────────────────────────────

NEW_IDEAS = [
    {
        "id": "idea-412",
        "name": "ScrapRoute — Critical-Mineral Contract & Inventory Route-Shock Monitor",
        "slug": "scraproute-critical-mineral-route-shock-monitor",
        "omegaRound": "XVIII",
        "researchDate": "2026-08-18",
        "status": "priority",
        "tags": ["critical-minerals","route-shock","trade-controls","black-mass","tungsten","inventory","contracts","compliance"],
        "atAGlance": {
            "overallScore": 86,
            "urgency": "extreme",
            "durability": "medium",
            "verdict": "VALIDATE NOW — 27 August 2026 cutover",
            "forcingFunction": "US DPA temporary final rule effective 27 Aug 2026: 100% domestic allocation requirement for covered black-mass and tungsten scrap",
            "paymentGate": "2 × $199 concierge audits from 25 targeted contacts",
            "capitalRequired": "$0-$20",
            "primaryBuyer": "US black-mass / tungsten scrap sellers, recyclers, and brokers with open foreign-buyer contracts",
            "firstArtifact": "27-August Contract Transition Exposure Ledger",
            "primaryRisk": "temporary 1-year rule + tiny specialist market + legal substitute (trade counsel) + confidential contracts"
        },
        "metrics": {
            "rse": 9.2,
            "contractMemoryScore": 9.5,
            "dcm": 8.8,
            "odb": 7.0,
            "ppd": 3.0,
            "tsv": 8.5,
            "asr": 8.0,
            "ots": 8
        },
        "productDefinition": {
            "v1": "27-August Contract Exposure Audit — $199-$499 concierge service",
            "inputs": [
                "current inventory (lots, material characterization, Wh/kg)",
                "open sales contracts",
                "buyer country/location",
                "intended shipment dates",
                "basic transaction value",
                "existing supporting documentation"
            ],
            "outputs": [
                "Cutover exposure ledger: transactions before/after 27 Aug",
                "Covered-material candidates",
                "Domestic/foreign buyer state per lot",
                "Contractual commitments at risk",
                "Unresolved classification questions",
                "Adjustment/exception-review candidates",
                "Alternative-route assumptions",
                "Estimated commercial exposure",
                "Source-linked evidence"
            ],
            "notIncluded": "Legal interpretation — stays with qualified trade counsel/BIS",
            "deliveryMethod": "manual concierge → structured PDF report",
            "longerTermProduct": "RouteShock engine — detects when existing contracts, inventory and shipments cross a newly changed trade/routing state"
        },
        "competitorRedTeam": [
            "Law firms — already interpreting BIS rule",
            "Trade-compliance platforms (SAP GTS, Amber Road) — could add rule monitoring",
            "Battery marketplaces (Metalshub, Circunomics) — know recyclers, material, pricing",
            "Commodity intelligence (Benchmark Mineral Intelligence) — sells supply-chain intelligence",
            "Customs brokers — already serving affected segment"
        ],
        "killConditions": [
            "Zero payments: firms consistently say counsel/ERP/broker has already produced cutover ledger",
            "Contracts are too confidential to share with a founder",
            "Only a handful of firms meaningfully affected (market too tiny)",
            "Rule reversed or scope dramatically narrowed before Sept 2026",
            "Trade-compliance vendors bundle feature within 30 days"
        ],
        "sevenDayTest": {
            "day1": "Create synthetic example: 12 lots, 8 open contracts, 4 foreign buyers, 3 domestic buyers, mixed shipment dates — produce one exposure report",
            "day2": "Create short landing page",
            "day3": "Find 20-30 actual affected businesses (black-mass recyclers, tungsten scrap dealers/processors)",
            "days3to5": "Offer Founding 27-August Contract Exposure Audit at $199",
            "days5to7": "Deliver manually",
            "strongPass": "2 prepaid audits from first 25 highly qualified contacts",
            "exceptionalPass": "Customer says: can you monitor every contract against future material-route changes?",
            "fail": "Zero payments + firms consistently say their trade counsel/ERP/broker already handled it"
        },
        "longerTermThesis": "RouteShock — detects when already-existing contracts, inventory and shipments cross a newly changed trade or routing state, quantifies which commercial objects are exposed, identifies the evidence/decision owner, and shows alternative scenarios. Applicable to: critical-mineral scrap, quotas, trade safeguards, export controls, hazardous-waste routes, source-country restrictions, sanctions, preferential tariffs.",
        "internationalExpansion": "EU restricting certain black-mass exports to non-OECD destinations — creates parallel EU route rule exposure graph",
        "omegaXviiCrossRef": "Reinforces TransitionLot concept; Contract Memory Score upgrades that thesis",
        "sources": [
            "US Federal Register: DPA temporary final rule, effective 27 Aug 2026",
            "Argus: tungsten-market concern, domestic oversupply risk",
            "Reuters: recyclers welcome rule but warn US infrastructure insufficient",
            "Benchmark Mineral Intelligence: black-mass supply-chain reports",
            "Battery-industry legal analysis: US black-mass processing capacity constraints"
        ]
    },
    {
        "id": "idea-413",
        "name": "BatteryFlightGate — Physical State-of-Charge Evidence Gate for Air Cargo",
        "slug": "batteryflightgate-air-cargo-soc-evidence-gate",
        "omegaRound": "XVIII",
        "researchDate": "2026-08-18",
        "status": "priority",
        "tags": ["battery","air-cargo","dangerous-goods","state-of-charge","iata","physical-proof","warehouse","evidence"],
        "atAGlance": {
            "overallScore": 80,
            "urgency": "current",
            "durability": "medium-long",
            "verdict": "VALIDATE NARROWLY — payment first, no software before 3 paying customers",
            "forcingFunction": "IATA 2026 edition: ≤30% SoC requirement for Li-ion batteries packed with equipment for air transport",
            "paymentGate": "3 × $99 workflow audits from 25 targeted battery/equipment shippers",
            "capitalRequired": "$0",
            "primaryBuyer": "Small electronics manufacturers, battery-pack assemblers, e-bike/equipment exporters, specialist forwarders, warehouses preparing UN3481 shipments",
            "firstArtifact": "Serial/batch-linked SoC release ledger (CSV + mobile capture + PDF evidence report)",
            "primaryRisk": "WMS/forwarder already records this; BMS exports already exist; IATA DG Digital absorbs declaration layer; operative since January so 8 months of adaptation"
        },
        "metrics": {
            "rse": 4.0,
            "ppd": 9.5,
            "odb": 9.0,
            "contractMemoryScore": 2.0,
            "tsv": 6.5,
            "asr": 6.0,
            "ots": 7
        },
        "productDefinition": {
            "v1": "Battery Air-Shipment Release Pack — $99-$199 per first workflow setup/audit",
            "workflow": [
                "Product → Battery → Serial/batch",
                "Battery chemistry + Wh rating",
                "Packing configuration",
                "Measured / device-reported SoC",
                "Measurement method + operator + timestamp",
                "Shipment linkage",
                "DG declaration linkage",
                "Release decision"
            ],
            "exampleOutput": "Shipment B-778: 42 battery packs — 42/42 SoC records present. 41 under threshold. 1 reading: 38%. Status: HOLD",
            "notClaimed": "Does NOT certify battery safety — records authorized measurement, source, threshold, shipment linkage, and completeness only",
            "deliveryMethod": "CSV + mobile browser capture + PDF evidence report — no AI required for v1",
            "longerTermModel": "WMS / warehouse integration (stronger than standalone SaaS)"
        },
        "officialDigitisationBoundary": {
            "iataOfficialTool": "IATA DG Digital (March 2026) — digitizes DG declaration and acceptance automation",
            "officialToolGap": "DG Digital handles declaration; does NOT physically verify SoC at warehouse. DHL guidance requires physical measurement with battery tester before shipment.",
            "productSits": "One layer before DG Digital — physical measurement evidence → declaration bridge"
        },
        "competitorRedTeam": [
            "IATA DG Digital — March 2026 launch covers declaration/acceptance (NOT physical measurement)",
            "WMS vendors — could add numeric SoC field + threshold rule",
            "BMS exports — some batteries report SoC natively",
            "Forwarder acceptance procedures — may already capture readings",
            "DG software (Riege, Champ, CargoWise) — could absorb feature"
        ],
        "killConditions": [
            "Warehouse already captures BMS readings in auditable form",
            "Forwarder handles acceptance and creates its own record",
            "Products have no accessible SoC measurement point",
            "Customer won't let new system influence DG release process",
            "WMS vendors add a numeric field + rules within 60 days",
            "Liability exposure exceeds subscription economics"
        ],
        "paymentTest": {
            "offer": "I will convert your existing battery-air-shipment SoC process into one serial/batch-linked release record and show exactly where evidence can fall out before your DG declaration",
            "target": "25 specialist shippers/manufacturers",
            "pass": "3 payments of approximately $99",
            "strongerSignal": "Customer says: every shipment needs this",
            "kill": "Consistent answer: our WMS/BMS/forwarder already records this in auditable form"
        },
        "omegaConceptContribution": "Physical Proof Distance (PPD) — how far is the digital declaration from the physical fact it claims?",
        "sources": [
            "IATA Dangerous Goods Regulations 2026 edition — ≤30% SoC packing instruction",
            "IATA DG Digital launch announcement March 2026",
            "DHL dangerous goods preparation guidance — verify SoC with battery tester before shipment",
            "UN3481 packing instruction documentation"
        ]
    },
    {
        "id": "idea-414",
        "name": "CarrierReality — Open Gateway Production Reality Grid",
        "slug": "carrierreality-open-gateway-production-reality-grid",
        "omegaRound": "XVIII",
        "researchDate": "2026-08-18",
        "status": "researched",
        "tags": ["telecom","camara","open-gateway","gsma","api-monitoring","network-api","carrier","production-testing"],
        "atAGlance": {
            "overallScore": 69,
            "urgency": "emerging",
            "durability": "long",
            "verdict": "WATCH / DESIGN PARTNER — commercially premature for $100 constraint",
            "forcingFunction": "CAMARA/GSMA Open Gateway scaling toward production by March 2026; operators live on fraud and QoD APIs",
            "paymentGate": "undefined — needs commercial operator access before meaningful test",
            "capitalRequired": "$100+ (aggregator access, real phone numbers, multi-carrier accounts)",
            "primaryBuyer": "Enterprise developers and aggregators building production CAMARA API products",
            "firstArtifact": "Cross-operator/country API behavioral drift report",
            "primaryRisk": "Requires commercial API access + real SIMs + consent — terrible for $100 constraint. CAMARA explicitly improving portability/interoperability."
        },
        "metrics": {
            "odb": 6.0,
            "tsv": 5.0,
            "contractMemoryScore": 3.0,
            "asr": 4.0
        },
        "productConcept": "Synthetic monitoring for telco/CAMARA APIs — tests whether specific APIs through specific aggregators/operators/countries behave reliably in production. Checks: carrier, country, API version, aggregator, latency, availability, error semantics, supported features, real behavior.",
        "differenceFromCertification": "Certification asks: is this implementation conformant? CarrierReality asks: does this specific API through this aggregator/country reliably behave in production at scale?",
        "blockers": [
            "Needs commercial operator/API access",
            "Requires real phone numbers + multiple carriers + multiple countries",
            "Paid aggregator accounts needed",
            "Consent/data handling complexity",
            "CAMARA itself improving portability — reduces long-term moat"
        ],
        "watchCondition": "Revisit when a design partner (aggregator or enterprise developer) offers co-development access to production CAMARA API environment",
        "sources": [
            "GSMA Open Gateway scaling toward production March 2026",
            "CAMARA open-source reference implementations",
            "GSMA certification framework for standardized deployments"
        ]
    }
]

# ── 2. Research run record ─────────────────────────────────────────────────────

RESEARCH_RUN = {
    "runId": "run-res-omega-xviii-20260818-route-shock",
    "omegaRound": "XVIII",
    "title": "OMEGA XVIII — Route Shock / Physical-State Proof",
    "date": "2026-08-18",
    "researcherNote": "MAJOR DEEP RESET — not a stopwatch session but a genuine multi-domain investigation with source diversity, competitor audit, kill conditions, and payment tests. Treated as equivalent to Fifth Full Reset standard.",
    "ideasAdded": ["idea-412","idea-413","idea-414"],
    "ideasUpdated": [],
    "archiveReceipts": [
        "AI Model License Drift Monitor — fresh Feb 2026 evidence (124,278 chain audit) strengthens thesis; NO new idea added",
        "Publisher Rights Probe — 2026 crawler/pay-per-crawl evidence strengthens thesis; NO new idea added",
        "Machine-payment cluster — July 2026 x402 protocol violation study; update existing ideas, NO duplicate"
    ],
    "graveyardBatch": [
        "Generic UCP readiness checker — free validators / protocol-native tools / commerce platforms",
        "Generic agentic chargeback tool — active specialist category",
        "Generic x402 explorer — already analytics/explorer category",
        "Generic AI licence scanner — existing AIBOM/SCA tools + archive overlap",
        "NoticeSurvive — MERGE INTO AI Model License Drift / Commercial-Use Evidence",
        "AI crawler compliance checker — MERGE INTO Publisher Rights Probe",
        "Defence tender copilot — generic / consultancy / official support",
        "Transformer sourcing AI — funded specialist entrants",
        "Tariff refund app — broker/recovery competition",
        "Dangerous-goods declaration SaaS — IATA DG Digital"
    ],
    "newMetrics": {
        "RSE": "Route Shock Exposure — open_contract_value × route_dependency × probability_crossing_cutover × lack_of_substitutes × switching_delay",
        "PPD": "Physical Proof Distance — how far is the digital declaration from the physical fact it claims?",
        "ODB": "Official Digitisation Boundary — exactly where does the official tool stop? Build one layer before or after it.",
        "DCM": "Domestic Capacity Mismatch — policy_forced_domestic_volume ÷ near_term_domestic_processing_capacity. High mismatch creates oversupply, price collapse, contract disputes.",
        "ContractMemoryScore": "Does the product remember commitments made under the old state? High = ScrapRoute, PermitEcho. Low = BatteryFlightGate."
    },
    "newHeuristic": "Commercial Commitments Crossing External State Boundaries: something_physically_exists OR someone_already_signed_a_contract → external_state_changes → old_route/assumption_breaks → buyer_must_decide_BEFORE_ERP/lawyer/portal_catches_up → small_source_linked_decision_artifact → payment",
    "crossRoundHierarchy": {
        "mostUrgentNewOpportunity": "ScrapRoute (idea-412)",
        "strongestPhysicalStateProof": "BatteryFlightGate (idea-413)",
        "durableEnterpriseWorkflow": "PermitEcho",
        "independentTechnicalVerification": "GatewayReceipt",
        "publicDataCompoundingAsset": "AidGraph (idea-407)",
        "shipmentExceptionSystem": "SeaClear",
        "ecommerceTransition": "PIDRelay"
    },
    "omegaConceptualContribution": "OMEGA XVIII adds to the research formula: EXISTING_COMMITMENT × FUTURE_STATE_CHANGE × ROUTE_DEPENDENCY × PHYSICAL_CAPACITY. The startup question: what have companies already promised or physically produced that becomes difficult to route when the external world changes?"
}

# ── 3. Dossier content ─────────────────────────────────────────────────────────

DOSSIERS = {
    "idea-412": textwrap.dedent("""\
        # ScrapRoute — Critical-Mineral Contract & Inventory Route-Shock Monitor
        **ID:** idea-412 | **OMEGA:** XVIII | **Date:** 2026-08-18
        **Status:** priority | **Score:** 86/100

        ## The Shock

        On **6 August 2026**, the U.S. published a temporary final rule under the Defense Production Act.
        Beginning **27 August 2026**, U.S. persons selling covered **black mass** and **tungsten waste/scrap**
        must allocate 100% of monthly sales to U.S. persons unless an adjustment or exception applies.
        Rule runs **~1 year**.

        Research date is 18 August 2026. Cutover is **9 days away**.

        ## The Product

        Not: AI trade lawyer. Not: critical minerals news dashboard. Not: black-mass marketplace.

        The object is a **transition exposure ledger** per lot/contract:

        | Lot | Planned route | Cutover exposure | Alternative | Commercial effect | Action |
        |-----|---------------|-----------------|-------------|-------------------|--------|
        | BM-041 | US → Korea | 🔴 | domestic buyer required | material | counsel/re-route |
        | BM-052 | domestic | 🟢 | — | low | verify |
        | W-881 | US → Germany | 🔴 | domestic disposition | severe | review contract |
        | BM-063 | undecided | 🟠 | evaluate domestic bids | unknown | obtain bids |

        Output says **POTENTIAL EXPOSURE / REVIEW REQUIRED** — not LEGAL / ILLEGAL.

        ## First Product: 27-August Contract Exposure Audit

        Price: **$199–$499**
        Inputs: current inventory, material descriptions, open contracts, buyer country, shipment dates, transaction value.
        Delivery: manual → structured PDF/CSV report.
        No software required for first test.

        ## Payment Test (7-day)

        Day 1: Build one synthetic exposure report (12 lots, 8 contracts, 4 foreign buyers).
        Days 2–3: Landing page + find 20–30 affected businesses.
        Days 3–5: Offer $199 Founding Audit.
        Days 5–7: Deliver manually.

        **PASS:** 2 prepaid audits from 25 qualified contacts.
        **EXCEPTIONAL:** "Can you monitor every contract against future route changes?" → that's the real company.
        **FAIL:** Zero payments; counsel/ERP already solved it.

        ## Longer-Term Thesis: RouteShock Engine

        Detects when existing contracts, inventory and shipments cross a newly changed trade/routing state.
        Applicable to: critical-mineral scrap, quotas, trade safeguards, export controls, hazardous-waste routes, sanctions, preferential tariffs.

        ## Key Metrics

        | Metric | Score |
        |--------|-------|
        | RSE (Route Shock Exposure) | 9.2 |
        | Contract Memory Score | 9.5 |
        | DCM (Domestic Capacity Mismatch) | 8.8 |
        | ODB (Official Digitisation Boundary) | 7.0 |
        | ASR (Administrative Sunset Risk) | 8.0 |

        ## Kill Conditions

        - Zero payments from 25 contacts
        - Contracts too confidential to share
        - Market too small (<30 meaningfully affected firms)
        - Rule reversed/narrowed before Sept 2026
        - Trade-compliance vendors bundle feature within 30 days

        ## Sources

        - US Federal Register: DPA temporary final rule, effective 27 Aug 2026
        - Argus: tungsten-market domestic oversupply concern
        - Reuters: recyclers welcome rule but US infrastructure insufficient
        - Battery-industry legal analysis: US black-mass processing capacity constraints
    """),

    "idea-413": textwrap.dedent("""\
        # BatteryFlightGate — Physical State-of-Charge Evidence Gate for Air Cargo
        **ID:** idea-413 | **OMEGA:** XVIII | **Date:** 2026-08-18
        **Status:** priority | **Score:** 80/100

        ## The Regulatory Gap

        From **1 January 2026**, IATA requires Li-ion batteries packed with equipment offered for air transport
        at ≤30% of rated state of charge (SoC) unless appropriate approval applies.

        **IATA DG Digital** (launched March 2026) digitizes DG declarations — but does NOT physically verify
        the SoC in the warehouse. DHL's own guidance tells shippers to verify SoC with a battery tester
        before shipment. That gap is the product.

        ## Official Digitisation Boundary

        ```
        Official: DG declaration / acceptance automation (IATA DG Digital)
        ─────────────────────────────────────────────────────────────────
        GAP:      physical SoC measurement at warehouse
        ─────────────────────────────────────────────────────────────────
        Product:  serial/batch-linked measurement → evidence → declaration bridge
        ```

        ## The Product

        Not: AI predicts compliance. Not: DG declaration software.

        **Deterministic warehouse release gate:**

        ```
        Shipment B-778 | 42 battery packs
        42/42 SoC records present
        41 under threshold | 1 reading: 38%
        Status: HOLD
        ```

        First version: CSV + mobile browser capture + PDF evidence report. No AI required.

        ## Product Boundary (Critical)

        Does NOT certify battery safety.
        Records: authorized measurement, source, threshold, shipment linkage, completeness.
        Customer's trained DG staff remain responsible.

        ## First Product: Battery Air-Shipment Release Pack

        Price: **$99–$199** per first workflow setup/audit.
        Target: small electronics manufacturers, battery-pack assemblers, e-bike exporters, specialist forwarders.

        ## Payment Test

        Offer: "I will convert your existing SoC process into one serial/batch-linked release record and
        show where evidence can fall out before your DG declaration."
        Target: 25 specialist shippers.

        **PASS:** 3 payments of ~$99.
        **STRONGER:** "Every shipment needs this."
        **KILL:** "Our WMS/BMS/forwarder already records this in auditable form."

        ## Key Metrics

        | Metric | Score |
        |--------|-------|
        | PPD (Physical Proof Distance) | 9.5 |
        | ODB (Official Digitisation Boundary) | 9.0 |
        | RSE | 4.0 |
        | Contract Memory Score | 2.0 |

        ## Why Not #1

        Operative since January — 8 months of adaptation time already elapsed.
        WMS/forwarder/BMS may already cover this for many customers.

        ## Kill Conditions

        - Warehouse already captures BMS readings in auditable form
        - Forwarder handles acceptance + creates its own record
        - WMS vendors add a numeric field + rules within 60 days
        - Liability exposure exceeds subscription economics

        ## Sources

        - IATA Dangerous Goods Regulations 2026 edition (≤30% SoC packing instruction)
        - IATA DG Digital launch announcement March 2026
        - DHL dangerous goods preparation guidance
        - UN3481 packing instruction documentation
    """),

    "idea-414": textwrap.dedent("""\
        # CarrierReality — Open Gateway Production Reality Grid
        **ID:** idea-414 | **OMEGA:** XVIII | **Date:** 2026-08-18
        **Status:** researched | **Score:** 69/100

        ## Concept

        The CAMARA/GSMA Open Gateway ecosystem standardises network APIs (fraud, QoD, device status).
        By March 2026 GSMA described production scaling with live operator deployments.

        CAMARA certification asks: **is this implementation conformant?**

        CarrierReality asks: **does this specific API through this aggregator/operator/country
        reliably behave in production?**

        Think synthetic monitoring for telco APIs — checking carrier, country, API version,
        aggregator, latency, availability, error semantics, supported features, real behavior.

        ## Why Watchlist (Not Priority)

        Requires commercial API access, real SIMs, multiple carriers/countries, paid aggregator accounts.
        Exceeds $100 constraint significantly.

        CAMARA itself is explicitly improving portability/interoperability — reduces long-term moat.

        ## Watch Condition

        Revisit when a design partner (aggregator or enterprise developer) offers co-development
        access to a production CAMARA API environment.

        ## ODB Score: 6.0

        GSMA certification covers conformance. Production behavioral reality is the gap —
        but commercial access barriers make this premature.

        ## Sources

        - GSMA Open Gateway production scaling March 2026
        - CAMARA open-source reference implementations and conformance framework
        - GSMA certification documentation
    """),
}

# ── 4. Prompt stubs ────────────────────────────────────────────────────────────

PROMPT_TEMPLATES = {
    "idea-412": [
        "Draft a 27-August exposure audit report for a US tungsten scrap dealer with 3 open foreign contracts",
        "Write a landing page for ScrapRoute targeting US black-mass recyclers (pre-27 Aug)",
        "Draft outreach email to a US tungsten scrap processor about the DPA temporary rule exposure",
        "Identify 20 US businesses most likely to have covered black-mass or tungsten scrap foreign contracts",
        "Write the ScrapRoute exposure ledger methodology: how to classify covered vs non-covered material",
        "Draft the disclaimer language for a contract exposure audit: POTENTIAL EXPOSURE / REVIEW REQUIRED",
        "Write a competitive analysis: why ScrapRoute differs from SAP GTS, Amber Road, and customs brokers",
        "Create a synthetic 12-lot test portfolio for ScrapRoute validation with mixed exposure levels",
        "Draft the adjustment/exception pathway checklist for DPA critical mineral temporary rule",
        "Write a RouteShock pitch: the durable company behind the ScrapRoute wedge",
        "Identify which black-mass material characteristics determine 'covered' classification under the rule",
        "Draft 5 customer interview questions for tungsten scrap dealers about current contract management",
        "Write a ScrapRoute pre-mortem: 8 most likely failure modes",
        "Draft pricing rationale for $199-$499 ScrapRoute audit vs typical trade-counsel fees",
        "Identify domestic US black-mass processors who could serve as alternative buyers post-27 Aug",
        "Write a DCM (Domestic Capacity Mismatch) analysis for US black-mass processing as of Aug 2026",
        "Draft the RouteShock platform thesis: beyond ScrapRoute to all commercial-commitment route shocks",
        "Create a ScrapRoute FAQ: what the product does vs what qualified trade counsel does",
        "Draft a 60-day roadmap: ScrapRoute concierge → RouteShock monitoring product",
        "Write a ScrapRoute investor memo: urgency, economics, half-life risk, and broader platform thesis",
        "Identify EU black-mass export restrictions that could expand ScrapRoute internationally",
        "Draft a ScrapRoute contract input template: fields needed from a customer to produce the exposure ledger",
        "Write the Route Shock Exposure (RSE) metric definition for VenturaAtlas schema",
        "Draft the Contract Memory Score metric definition for VenturaAtlas schema",
        "Write the DCM (Domestic Capacity Mismatch) metric definition for VenturaAtlas schema",
    ],
    "idea-413": [
        "Draft a BatteryFlightGate SoC release record template for UN3481 air shipments",
        "Write a BatteryFlightGate landing page for small electronics exporters",
        "Draft outreach email to a battery-pack assembler about SoC evidence before air cargo",
        "Identify 25 specialist battery/equipment air shippers to target for BatteryFlightGate payment test",
        "Write the BatteryFlightGate product boundary disclaimer: what it records vs what it certifies",
        "Map the Official Digitisation Boundary: exactly where IATA DG Digital stops and BatteryFlightGate starts",
        "Draft a BatteryFlightGate competitive analysis vs WMS vendors, BMS exports, and forwarder tools",
        "Create a BatteryFlightGate synthetic shipment report: 42 battery packs, 1 hold event",
        "Write 5 customer interview questions for electronics exporters about current SoC verification process",
        "Draft a BatteryFlightGate pre-mortem: 7 most likely failure modes",
        "Write the Physical Proof Distance (PPD) metric definition for VenturaAtlas schema",
        "Write the Official Digitisation Boundary (ODB) metric definition for VenturaAtlas schema",
        "Draft a BatteryFlightGate mobile capture UX: minimum fields for warehouse SoC recording",
        "Identify which battery chemistries and packing instructions are most affected by the ≤30% SoC rule",
        "Draft pricing rationale: $99 workflow audit vs WMS integration vs standalone SaaS",
        "Write a BatteryFlightGate→WMS integration pitch for a warehouse system provider",
        "Create a BatteryFlightGate measurement method taxonomy: BMS read, meter, manufacturer certificate",
        "Draft the BatteryFlightGate evidence chain: tester → serial record → shipment → DG declaration",
        "Write a comparison: BatteryFlightGate PPD score vs SeaClear vs GatewayReceipt vs ScrapRoute",
        "Identify the IATA DG Digital integration pathway: can BatteryFlightGate feed declaration data upstream?",
        "Draft a BatteryFlightGate customer onboarding flow: from first audit to recurring workflow",
        "Write a BatteryFlightGate investor memo: regulatory durability, WMS absorption risk, PPD thesis",
        "Identify specialist dangerous-goods forwarders who could be BatteryFlightGate distribution partners",
        "Draft a BatteryFlightGate batch report format: per-serial SoC + pass/hold aggregate",
        "Write a OMEGA XVIII physical-state proof thesis: how BatteryFlightGate exemplifies PPD",
    ],
    "idea-414": [
        "Draft a CarrierReality design partner outreach email to a CAMARA aggregator",
        "Write a CarrierReality product concept: synthetic monitoring for telco APIs in production",
        "Identify 5 CAMARA API types most likely to show behavioral drift across operators",
        "Draft a CarrierReality competitive analysis vs GSMA certification and CAMARA conformance testing",
        "Write the commercial access requirements for a CarrierReality minimum viable test",
        "Draft a CarrierReality watchlist brief: conditions required before promoting to priority",
        "Identify the largest CAMARA API aggregators who could be design partners for CarrierReality",
        "Write a CarrierReality product spec: what data fields comprise the production reality grid",
        "Draft 5 enterprise developer interview questions about CAMARA API production reliability pain",
        "Write the OMEGA XVIII watchlist entry for CarrierReality with promotion conditions",
        "Create a CarrierReality measurement taxonomy: latency, availability, error semantics, feature coverage",
        "Draft a CarrierReality vs existing API monitoring tools competitive comparison",
        "Write a CarrierReality revenue model: per-operator, per-API, or subscription",
        "Identify which CAMARA API type (fraud, QoD, device status) has the highest behavioral drift risk",
        "Draft a CarrierReality synthetic test methodology for one CAMARA API across two operators",
        "Write a CarrierReality pre-mortem: why this fails if CAMARA portability succeeds",
        "Identify telecom API aggregators with production CAMARA deployments as of Aug 2026",
        "Draft the ODB (Official Digitisation Boundary) analysis for GSMA Open Gateway",
        "Write a CarrierReality pilot proposal for a design partner enterprise developer",
        "Draft a CarrierReality 90-day watchlist checklist with specific promotion criteria",
        "Identify which countries have the most operator diversity in CAMARA API deployments",
        "Write a CarrierReality integration pathway with existing API monitoring platforms",
        "Draft a CarrierReality market sizing: how many enterprises use CAMARA APIs in production?",
        "Write a CarrierReality exit thesis: acqui-hire by aggregator vs independent growth",
        "Draft a CarrierReality technical architecture: synthetic test runner + behavioral database",
    ],
}

# ── 5. Main ────────────────────────────────────────────────────────────────────

def main():
    raise SystemExit(
        "Direct OMEGA XVIII canonical ingestion is disabled. Preserve these records as "
        "research candidates and use the authorized semantic-review and canonical-publisher "
        "lifecycle for any future promotion."
    )

    print("=== Ingesting OMEGA XVIII -- Route Shock / Physical-State Proof (18 August 2026) ===")

    # 1. Update ideas.json
    print("\n[1/4] Updating data/ideas.json ...")
    with open(DATA_IDEAS, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    existing_ids = {i["id"] for i in corpus["ideas"]}
    added = 0
    for idea in NEW_IDEAS:
        if idea["id"] in existing_ids:
            print(f"  [SKIP] {idea['id']} already exists")
        else:
            corpus["ideas"].append(idea)
            added += 1
            print(f"  [OK] {idea['id']} -- {idea['name']}")

    with open(DATA_IDEAS, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)
    print(f"  Total: {len(corpus['ideas'])} ideas (+{added} new)")

    # 2. Update research-runs.json
    print("\n[2/4] Updating data/research-runs.json ...")
    with open(DATA_RUNS, "r", encoding="utf-8") as f:
        runs = json.load(f)
    if isinstance(runs, dict):
        runs = [runs]
    if not any(r.get("runId") == RESEARCH_RUN["runId"] for r in runs):
        runs.append(RESEARCH_RUN)
        with open(DATA_RUNS, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2, ensure_ascii=False)
        print(f"  [OK] Appended: {RESEARCH_RUN['runId']}")
    else:
        print(f"  [SKIP] Run already present")

    # 3. Generate dossier files
    print("\n[3/4] Generating dossier files ...")
    IDEAS_DIR.mkdir(exist_ok=True)
    for idea in NEW_IDEAS:
        slug = idea["slug"]
        path = IDEAS_DIR / f"{slug}.md"
        content = DOSSIERS.get(idea["id"], f"# {idea['name']}\n\nDossier pending.\n")
        path.write_text(content, encoding="utf-8")
        print(f"  [OK] ideas/{slug}.md")

    # 4. Generate prompt stubs
    print("\n[4/4] Generating prompt stubs (25 per idea) ...")
    for idea in NEW_IDEAS:
        idea_dir = PROMPTS_DIR / idea["id"]
        idea_dir.mkdir(parents=True, exist_ok=True)
        stubs = PROMPT_TEMPLATES.get(idea["id"], [])
        for i, prompt in enumerate(stubs[:25], 1):
            stub_path = idea_dir / f"{i:02d}-{prompt[:50].lower().replace(' ','-').replace('/','-').replace(':','').replace(',','')}.md"
            stub_path.write_text(f"# Prompt {i:02d}\n\n{prompt}\n", encoding="utf-8")
        print(f"  [OK] 25 prompts for {idea['id']}")

    print(f"""
=== OMEGA XVIII Ingest Complete ===
  Added: {added}/3 ideas
  Research run: {RESEARCH_RUN['runId']}

Next steps:
  1. node scripts/validate-data.js
  2. Update rankings/highest-overall.md, fastest-first-revenue.md, needs-research.md
  3. Copy OMEGA XVIII document to research/OMEGA_XVIII_ROUTE_SHOCK_2026-08-18.md
  4. Run payment test A (ScrapRoute): 25 US black-mass/tungsten businesses, $199 audit
  5. Run payment test B (BatteryFlightGate): 25 battery shippers, $99 workflow audit
  6. Update archive receipts: AI Model License Drift, Publisher Rights Probe, machine-payment cluster
""")

if __name__ == "__main__":
    main()
