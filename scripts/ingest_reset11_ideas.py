import json
import os
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')

with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

ideas = data if isinstance(data, list) else data.get('ideas', [])
existing_ids = {x['id'] for x in ideas}

new_ideas = [
    {
        "schemaVersion": "2.0.0",
        "id": "idea-287",
        "legacyId": "ductexchange",
        "slug": "ductexchange-eu-civil-infrastructure-access-network",
        "name": "DuctExchange — EU Civil Infrastructure Access Network",
        "oneSentenceConcept": "Transaction network for rights to access Europe's existing ducts, poles, chambers, and civil infrastructure under the EU Gigabit Infrastructure Act.",
        "elevatorPitch": "DuctExchange turns the EU Gigabit Infrastructure Act (applicable May 2026) from a complex regulatory right into a searchable, price-normalized transaction network where telecom operators can discover, survey, price, contract, and settle rights to existing utility and municipal ducts.",
        "detailedDescription": "Europe possesses massive existing underground duct, pole, and chamber capacity owned by municipalities, power utilities, and transport operators. DuctExchange ingests Single Information Point (SIP) data and private owner inventories into a unified route engine that compares new trenching capex against shared infrastructure routes, shortening the path from candidate route to executed access agreement.",
        "category": "EU Telecom & Civil Infrastructure",
        "subcategory": "infrastructure-rights-exchange",
        "tags": ["telecom", "gigabit-infrastructure-act", "civil-works", "duct-sharing", "utilities"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "EU fibre builders and utility/municipal infrastructure owners",
            "problemSolved": "High cost and complexity of trenching new fibre routes when usable duct infrastructure already exists nearby.",
            "whatToBuild": "Transaction network mapping physical duct, pole, and chamber access rights across utilities and municipalities.",
            "howItMakesMoney": "Completed-access transaction fees + percentage share of verified civil construction cost savings.",
            "whyCustomersPay": "Saves up to 40-60% of civil construction capex and accelerates fibre network deployment times.",
            "overallScore": 88.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-288",
        "legacyId": "agentloss",
        "slug": "agent-loss-exchange-autonomous-agent-claims-data-utility",
        "name": "Agent Loss Exchange — Autonomous Agent Claims & Loss Data Utility",
        "oneSentenceConcept": "Privacy-preserving loss, incident, and exposure data utility for insurers underwriting autonomous AI agents.",
        "elevatorPitch": "Agent Loss Exchange provides cyber, technology E&O, and reinsurance carriers with an anonymized, pooled loss and exposure database to price dynamic autonomous agent risks where historical actuarial data does not exist.",
        "detailedDescription": "As autonomous agents gain transactional authority, insurers face unknown cumulative exposure risks without actuarial history. Participating carriers submit standardized anonymized incident records, agent permission schemas, and loss outcomes to receive pooled risk severity curves, dependency topologies, and benchmark pricing metrics.",
        "category": "AI Insurance & Risk Underwriting",
        "subcategory": "agent-risk-exchange",
        "tags": ["ai-insurance", "autonomous-agents", "actuarial-data", "risk-utility", "reinsurance"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Cyber underwriters, technology E&O insurers, and reinsurers",
            "problemSolved": "Inability to price and underwrite autonomous AI agent risks without historical loss data.",
            "whatToBuild": "Privacy-preserving consortium exchange pooling anonymized claims, permissions, and financial loss telemetry.",
            "howItMakesMoney": "Annual insurer consortium membership fees + usage-based exposure scoring API fees.",
            "whyCustomersPay": "Unlocks profitable affirmative AI agent underwriting and prevents catastrophic unpriced accumulations.",
            "overallScore": 86.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-289",
        "legacyId": "queuesure",
        "slug": "queuesure-data-centre-grid-commitment-surety-underwriting",
        "name": "QueueSure — Data Centre Grid Commitment Surety Underwriting",
        "oneSentenceConcept": "Specialized surety and project-readiness underwriting platform for UK data-centre grid-connection commitment fees under Ofgem rules.",
        "elevatorPitch": "QueueSure helps independent UK data centre developers secure multi-million-pound grid connection commitment security under proposed Ofgem rules without immobilizing total development cash flow.",
        "detailedDescription": "With UK grid connection applications exploding from 41 GW to 125 GW, Ofgem proposed security fees of £237,500–£712,500 per MW. QueueSure aggregates project readiness evidence (planning, land rights, equipment orders, off-taker agreements) to underwrite and broker surety guarantee capacity from institutional insurance panels.",
        "category": "Energy Grid & Infrastructure Finance",
        "subcategory": "grid-surety-underwriting",
        "tags": ["data-centres", "grid-connections", "ofgem", "surety-bonds", "infrastructure-finance"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Independent UK data centre developers (20-150 MW)",
            "problemSolved": "Enormous cash collateral requirements for grid connection queue reservations.",
            "whatToBuild": "Project readiness underwriting engine and surety guarantee brokerage platform.",
            "howItMakesMoney": "Project diligence fees + brokerage commission on surety guarantee premiums.",
            "whyCustomersPay": "Avoids immobilizing tens of millions in cash while maintaining queue priority.",
            "overallScore": 83.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-290",
        "legacyId": "resilienceproof",
        "slug": "resilienceproof-climate-resilience-property-adaptation-verification",
        "name": "ResilienceProof — Climate Resilience & Property Adaptation Verification Rail",
        "oneSentenceConcept": "Verification rail proving flood, wildfire, and climate resilience property retrofits to unlock lower insurance premiums and mortgage rates.",
        "elevatorPitch": "ResilienceProof creates a machine-readable evidence ledger for property resilience upgrades, enabling insurers and lenders to verify Property Flood Resilience (PFR) installations and adjust risk pricing.",
        "detailedDescription": "As the UK Flood Performance Certificate (FPC) framework launches, ResilienceProof captures geotagged installation evidence, product certificates, and maintenance records for property adaptation retrofits. Following climate events, actual loss outcomes are linked back to verified retrofits to validate insurer loss-reduction models.",
        "category": "Climate Resilience & Property Insurance",
        "subcategory": "resilience-verification-rail",
        "tags": ["climate-adaptation", "property-insurance", "flood-resilience", "insurtech", "verification"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Property insurers, mortgage lenders, and retrofitted property owners",
            "problemSolved": "Lack of verified, trustworthy physical adaptation evidence needed for insurance discounts.",
            "whatToBuild": "Geotagged physical verification ledger connecting adaptation retrofits to insurer underwriting APIs.",
            "howItMakesMoney": "Per-property verification fees + insurer portfolio API subscription fees.",
            "whyCustomersPay": "Property owners get lower premiums; insurers reduce claim payouts and close the protection gap.",
            "overallScore": 82.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-291",
        "legacyId": "lowwateroptions",
        "slug": "low-water-capacity-options-rhine-industrial-freight-network",
        "name": "Low-Water Capacity Options — Rhine Industrial Freight Contingency Network",
        "oneSentenceConcept": "Option marketplace selling manufacturers pre-committed alternative rail, truck, and low-draft barge freight capacity triggered by Rhine water levels.",
        "elevatorPitch": "Low-Water Capacity Options allows mid-sized chemical, steel, and bulk manufacturers to purchase pre-committed alternative transport capacity before severe drought events restrict Rhine river navigation.",
        "detailedDescription": "During summer low-water events on the Rhine (e.g. Kaub bottleneck operating at 20-30% load), spot freight prices surge and alternative transport capacity disappears. Shippers purchase option contracts that automatically reserve rail and truck capacity when river gauge thresholds are breached.",
        "category": "Logistics & Contingency Freight",
        "subcategory": "low-water-freight-options",
        "tags": ["logistics", "rhine-freight", "inland-waterways", "contingency-planning", "supply-chain"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Logistics directors at mid-sized Rhine-dependent industrial chemical and manufacturing plants",
            "problemSolved": "Sudden disappearance of alternative freight capacity when river low-water bottlenecks strike.",
            "whatToBuild": "Water-level gauge triggered freight option contract exchange and execution platform.",
            "howItMakesMoney": "Seasonal capacity option premiums + execution fees upon trigger activation.",
            "whyCustomersPay": "Guarantees factory supply chain continuity during predictable river drought restrictions.",
            "overallScore": 81.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-292",
        "legacyId": "uptimemutual",
        "slug": "uptime-mutual-obsolete-controls-spare-pooling-sla-network",
        "name": "Uptime Mutual — Obsolete Controls Spare Pooling & SLA Guarantee Network",
        "oneSentenceConcept": "Guaranteed restoration-time mutual pooling customer-owned spares, remanufactured inventory, and cross-compatible components for aging factory lines.",
        "elevatorPitch": "Uptime Mutual provides European manufacturing plants operating legacy industrial controls (Siemens S5/S7-300, HMIs, drives) with guaranteed SLA restoration times backed by a pooled multi-factory spare inventory network.",
        "detailedDescription": "Instead of selling obsolete MRO parts, Uptime Mutual sells uptime SLAs. By normalizing fragmented spare inventories across participating factories, repair houses, and remanufacturers, the network dispatches compatible replacement components within 12 to 48 hours without forcing plants to hold expensive redundant stock.",
        "category": "Industrial Maintenance & Spare Parts",
        "subcategory": "obsolete-controls-mutual",
        "tags": ["industrial-maintenance", "mro", "plc-spares", "uptime-sla", "manufacturing"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Maintenance directors at Czech and German industrial manufacturing plants",
            "problemSolved": "Production line stranding due to multi-day searches for obsolete industrial control components.",
            "whatToBuild": "Cross-factory inventory matching engine and guaranteed 12/24/48-hour hardware SLA network.",
            "howItMakesMoney": "Annual equipment line SLA coverage contracts + replacement hardware transaction fees.",
            "whyCustomersPay": "Prevents catastrophic plant downtime losses at a fraction of individual reserve inventory costs.",
            "overallScore": 80.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-293",
        "legacyId": "wastewaterepr",
        "slug": "wastewater-epr-settlement-rail-pharma-cosmetics-clearinghouse",
        "name": "Wastewater EPR Settlement Rail — Pharma & Cosmetics Micropollutant Clearing Network",
        "oneSentenceConcept": "Neutral settlement rail calculating, verifying, and reconciling multi-party Extended Producer Responsibility payments from pharma/cosmetics producers to wastewater utilities under EU rules.",
        "elevatorPitch": "Wastewater EPR Settlement Rail provides Producer Responsibility Organisations (PROs) and municipal utilities with an auditable clearinghouse to reconcile the 80%+ quaternary treatment cost obligations mandated by the revised EU Urban Wastewater Treatment Directive.",
        "detailedDescription": "The revised EU UWWTD requires pharmaceutical and cosmetics manufacturers to finance quaternary wastewater treatment by 2028. The settlement rail ingests producer volume data, product assessment bases, and plant treatment invoices to automate multi-party fee allocations, dispute workflows, and financial clearing.",
        "category": "Environmental Compliance & Clearing",
        "subcategory": "wastewater-epr-settlement",
        "tags": ["wastewater", "uwwtd", "epr", "pharma-compliance", "environmental-clearing"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "National Producer Responsibility Organisations (PROs), pharma/cosmetic producers, and wastewater utilities",
            "problemSolved": "Complex multi-party cost allocation and reconciliation for mandatory micropollutant treatment funding.",
            "whatToBuild": "Auditable statutory assessment calculation and financial settlement clearinghouse engine.",
            "howItMakesMoney": "Annual PRO platform licensing fees + percentage clearing fee on settled funds.",
            "whyCustomersPay": "Ensures legal compliance, transparent cost allocation, and dispute-free statutory settlements.",
            "overallScore": 78.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-294",
        "legacyId": "assuredtestslots",
        "slug": "assured-test-slots-regulatory-testing-capacity-market",
        "name": "Assured Test Slots — Regulatory Testing SLA Capacity Market",
        "oneSentenceConcept": "Reservable SLA-backed accredited laboratory testing capacity market for packaging manufacturers facing EU PPWR PFAS deadlines.",
        "elevatorPitch": "Assured Test Slots enables packaging importers and CPG brands to reserve SLA-guaranteed forward testing capacity at accredited laboratories ahead of mandatory EU Packaging and Packaging Waste Regulation (PPWR) deadlines.",
        "detailedDescription": "Synchronized regulatory deadlines create severe testing bottlenecks at accredited laboratories. Assured Test Slots locks in forward lab capacity, manages chain-of-custody tracking, and provides SLA guarantees for sample analysis turnaround times.",
        "category": "Regulatory Compliance & Lab Testing",
        "subcategory": "accredited-testing-capacity",
        "tags": ["ppwr", "pfas-testing", "accredited-labs", "packaging-compliance", "capacity-market"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Packaging compliance directors at CPG brands, food manufacturers, and importers",
            "problemSolved": "Accredited lab capacity bottlenecks delaying product launches ahead of EU PPWR PFAS deadlines.",
            "whatToBuild": "Forward lab testing slot reservation system with chain-of-custody and SLA tracking.",
            "howItMakesMoney": "Slot reservation premiums + lab orchestration transaction fees.",
            "whyCustomersPay": "Guarantees compliant product testing turnarounds without regulatory market exclusion.",
            "overallScore": 75.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-295",
        "legacyId": "oemrepairrail",
        "slug": "oem-repair-fulfilment-rail-right-to-repair-logistics",
        "name": "OEM Repair Fulfilment Rail — Right to Repair After-Sales Logistics Engine",
        "oneSentenceConcept": "End-to-end repair fulfillment and spare parts dispatch rail for smaller appliance and electronics OEMs under EU Right-to-Repair mandates.",
        "elevatorPitch": "OEM Repair Fulfilment Rail gives small and mid-sized electronics hardware brands a turn-key after-sales logistics engine to satisfy EU Right-to-Repair mandates without operating local repair shops.",
        "detailedDescription": "EU Right-to-Repair regulations obligate hardware brands to offer spare parts and repair services at reasonable prices. OEM Repair Fulfilment Rail connects hardware OEMs to a network of independent repair technicians, local parts hubs, and automated customer return logistics.",
        "category": "Circular Economy & After-Sales Logistics",
        "subcategory": "oem-repair-fulfilment",
        "tags": ["right-to-repair", "after-sales", "hardware-oems", "circular-economy", "logistics"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "Operations directors at small and mid-sized European electronics and appliance OEMs",
            "problemSolved": "Mandatory EU repair compliance burden without dense local service network infrastructure.",
            "whatToBuild": "Repair routing, spare parts inventory dispatch, and independent technician network management platform.",
            "howItMakesMoney": "Per-repair case management fees + spare parts fulfillment margin take rates.",
            "whyCustomersPay": "Provides instant compliance with EU repair directives at a fraction of in-house network costs.",
            "overallScore": 72.0
        }
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-296",
        "legacyId": "gridequipmentexchange",
        "slug": "grid-equipment-cancellation-exchange-secondary-transformer-trading",
        "name": "Grid Equipment Cancellation Exchange — Secondary Transformer & Switchgear Allocation",
        "oneSentenceConcept": "Secondary trading and allocation exchange for canceled or delayed high-voltage transformer orders and factory slot rights.",
        "elevatorPitch": "Grid Equipment Cancellation Exchange matches data center, renewable, and utility developers needing long-lead power transformers with canceled project orders and priority manufacturer build slots.",
        "detailedDescription": "Extreme electrical transformer lead times (up to 3-4 years) frequently bottleneck grid connections while delayed or canceled projects leave high-voltage equipment stranded. The exchange creates a verified secondary clearinghouse for electrical equipment specifications and factory slot assignments.",
        "category": "Power Equipment & Energy Supply Chain",
        "subcategory": "secondary-grid-equipment",
        "tags": ["transformers", "grid-equipment", "electrical-hardware", "secondary-market", "energy"],
        "status": "candidate",
        "atAGlance": {
            "targetCustomer": "EPC contractors, data centre developers, and utility project directors",
            "problemSolved": "Multi-year transformer procurement lead times delaying high-value energy projects.",
            "whatToBuild": "Verified secondary marketplace for high-voltage equipment specifications and build slot assignments.",
            "howItMakesMoney": "Transaction fee (2-5%) on matched equipment transfers and slot reassignments.",
            "whyCustomersPay": "Cuts project grid connection delays by 12-24 months by sourcing canceled inventory.",
            "overallScore": 70.0
        }
    }
]

added = 0
for idea in new_ideas:
    if idea['id'] not in existing_ids:
        ideas.append(idea)
        added += 1

if isinstance(data, list):
    data = ideas
else:
    data['ideas'] = ideas

with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {added} new Reset 11 ideas to ideas.json (Total ideas now: {len(ideas)})")

# Run generate-all-missing-dossiers.py
subprocess.run(['python', os.path.join(ROOT, 'scripts', 'generate-all-missing-dossiers.py')], check=True)
