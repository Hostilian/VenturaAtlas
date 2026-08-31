# Financial Model — BorderGraph — EU Product Compliance Control Plane

> **Score:** 92 overall opportunity | **Category:** EU Product Compliance & Customs

## Model

- **Revenue Model:** sku_subscription + compliance_check_fee + api_licensing

- **Pricing Model:** Per-SKU or per-shipment compliance subscription for importers and logistics carriers. Per-check fee for on-demand compliance verification against EU market entry rules (CE marking, GPSR, CRA, REACH, EUDR). API licensing for logistics software and ERP integrations.

### Suggested Pricing Tiers
- {"name": "Importer Starter", "priceRange": {"currency": "EUR", "minimum": 99, "midpoint": 299, "maximum": 799}, "scope": "monthly — up to 500 SKUs monitored, basic EU compliance ruleset"}
- {"name": "Carrier / 3PL", "priceRange": {"currency": "EUR", "minimum": 499, "midpoint": 1499, "maximum": 5000}, "scope": "monthly — shipment-level compliance check, CBAM + ICS2 + EUDR coverage"}
- {"name": "Enterprise / ERP API", "priceRange": {"currency": "USD", "minimum": 2000, "midpoint": 8000, "maximum": 30000}, "scope": "monthly — API integration into SAP/Oracle, bulk SKU compliance graph, custom ruleset"}
- {"name": "Per-Check", "priceRange": {"currency": "EUR", "minimum": 0.50, "midpoint": 2.50, "maximum": 10}, "scope": "per shipment or SKU compliance verification on demand"}

### Expected ARPC

- **Currency:** EUR
- **Minimum:** 99 (single importer, starter tier)
- **Midpoint:** 1800 (mid-size carrier or 3PL monthly)
- **Maximum:** 30000 (enterprise ERP API tier, monthly)

### Upsells
- automated duty drawback calculation
- CBAM certificate filing automation
- EUDR due diligence report generation
- ICS2 SourceData pre-filing
- multi-jurisdiction compliance (UK, US, CN)

### Cross Sells
- AidGraph (idea-261 adjacency) — public money graph for EU subsidy alerts
- EU Marketplace Compliance OS (idea-006) — for marketplace sellers

- **Recurring Revenue Potential:** Very high. EU product regulations update continuously (GPSR effective 2024, CRA enforcement 2027, EUDR 2025/2026, CBAM 2026). Every regulatory update creates re-validation demand.

### Gross Margin Potential

- **Currency:** EUR
- **Minimum:** 60 (regulatory parsing and updates are ongoing human cost early stage)
- **Midpoint:** 76 (regulatory ruleset becomes codified; incremental cost is compute only)
- **Maximum:** 87 (fully automated compliance graph; incremental SKU cost near zero)

### Variable Costs
- EU Official Journal and regulatory update ingestion (human parsing + AI extraction)
- per-check compute for compliance evaluation
- human expert review for novel regulatory edge cases
- API infrastructure costs scaling with call volume
- legal review for new regulation integrations

### Fixed Costs
- engineering (compliance graph architecture)
- regulatory affairs staffing (EU law expertise)
- security (confidential importer SKU data)
- sales and partnerships (logistics software ecosystem)

- **AI Inference Costs:** Core value proposition — AI reads and codifies regulatory text. Invest here; this is the moat.
- **Infrastructure Costs:** Low per-check at scale. Graph query is cheap; regulatory update ingestion is the bottleneck.
- **Data Costs:** EU Official Journal is free. Tariff databases (HS codes, TARIC) are public. Some customs data may require licensing.
- **Support Costs:** Low for API tier; moderate for starter importer tier with complex regulatory questions.
- **Compliance Costs:** Product itself must comply with GDPR (importer data). Ironically, the compliance tool must comply.
- **Refund Fraud Exposure:** Low — B2B contracts, deliverable-based pricing.

### CAC

- **Currency:** EUR
- **Minimum:** 50 (content marketing — EU compliance blogs, regulatory alert newsletters)
- **Midpoint:** 800 (direct outreach to importers via trade associations, customs broker partnerships)
- **Maximum:** 8000 (enterprise API deal via logistics software channel partner)

### LTV

- **Currency:** EUR
- **Minimum:** 600 (6-month importer subscription, no renewal)
- **Midpoint:** 18000 (2-year carrier subscription at €1499/mo minus churn)
- **Maximum:** 360000 (3-year enterprise API at €8000/mo + expansion)

- **LTV/CAC Ratio:** Target >10 for importer tier (low CAC, recurring need). Target >15 for carrier tier.
- **Payback Period:** Under 6 months for importer tier. Under 12 months for carrier tier.
- **Break-Even Estimate:** 30–50 paying importer/carrier subscriptions covers initial fixed costs.
- **Time To First Revenue:** 4–10 weeks — first regulatory ruleset live, first importer paying for compliance checks.
- **Time To Profitability:** 12–24 months — once 50+ carriers or importers are paying subscribers.
- **Working Capital:** Low. No inventory, no physical product. First month subscription collected before any ongoing cost.
- **Scalability:** Each new EU regulation added to the graph is incremental engineering cost but multiplies addressable compliance checks.

### Margin Improvements
- automated Official Journal change detection (zero human latency for regulatory updates)
- shared compliance graph — one update benefits all subscribers
- self-service importer portal for low-complexity SKUs
- partner program with customs brokers reduces direct sales CAC

### Scenarios
- {"name": "conservative", "customers": 25, "averageMonthlyRevenuePerCustomer": 350, "monthlyRevenue": 8750, "annualRevenue": 105000, "grossMarginPercent": 62, "monthlyOperatingCosts": 12000, "approxMonthlyOperatingProfit": -6575, "assumptions": ["25 importer subscribers, no carrier or API tier yet", "heavy regulatory update cost", "pre-partnership with customs brokers"]}
- {"name": "base", "customers": 120, "averageMonthlyRevenuePerCustomer": 620, "monthlyRevenue": 74400, "annualRevenue": 892800, "grossMarginPercent": 74, "monthlyOperatingCosts": 42000, "approxMonthlyOperatingProfit": 13056, "assumptions": ["90 importers + 25 carriers + 5 API subscribers", "two regulatory update cycles automated", "customs broker partner channel active"]}
- {"name": "aggressive", "customers": 500, "averageMonthlyRevenuePerCustomer": 980, "monthlyRevenue": 490000, "annualRevenue": 5880000, "grossMarginPercent": 84, "monthlyOperatingCosts": 200000, "approxMonthlyOperatingProfit": 211600, "assumptions": ["large importer base + carrier API integrations + 3 ERP partnerships", "full EU regulatory coverage including CBAM, EUDR, CRA, GPSR, ICS2", "custom ruleset revenue from enterprise accounts"]}

### Known Facts
- EU GPSR (General Product Safety Regulation) effective December 2024 — immediate compliance demand
- EU Cyber Resilience Act (CRA) enforcement begins 2027 — timed forcing function
- EUDR (deforestation regulation) enforcement triggered 2025/2026
- CBAM (Carbon Border Adjustment Mechanism) Phase 2 reporting 2026
- ICS2 customs pre-filing requirement already live for air cargo
- 1 source reference only — evidence base is thin; research investment needed

### Research Supported Estimates
- Regulatory forcing function density: Very high — 4 major regulations in active enforcement window (2024–2027)
- Importer pain: Documented via EU customs compliance complexity research
- Market proof: 0 — no external validation experiments run

### Analyst Assumptions
- importer count in EU SME segment willing to pay for automated compliance
- carrier appetite for per-shipment compliance check fees
- ERP integration sales cycle with SAP/Oracle channel

### Unknowns
- actual importer WTP vs. using a customs broker manually
- competitive response from established customs compliance software (Descartes, e2open)
- rate of EU regulation introduction (headwind or tailwind depending on political cycle)
- cross-border SKU complexity vs. simple single-country imports

- **Unit Economics Formula:** Subscribers × monthly fee = recurring base. Per-check volume × per-check fee = usage upside. Total revenue − regulatory update cost − AI compute − sales = gross profit.

### Must Be True

- **Required Customer Volume:** 50–100 paying subscribers (importer + carrier mix) to reach monthly break-even.
- **Minimum Viable Price:** €299/month minimum for importer tier to cover regulatory update overhead per account.
- **Maximum CAC:** No more than €1,500 for importer tier. €5,000 for carrier tier.
- **Retention Or Frequency:** Annual subscriptions. Regulatory complexity ensures stickiness — customers who integrate compliance checks into their ERP workflow almost never churn.
- **Required Gross Margin:** >70% at steady state. Regulatory update cost is the ceiling risk.
- **Maximum Service Cost:** Human expert review must be <5% of total revenue at scale; route to AI except for novel edge cases.
- **Conversion Rate:** 5–15% of importers who sign up for regulatory alert newsletter → paid subscriber.
- **Automation Level:** Automate Official Journal parsing, HS code mapping, and TARIC lookup. Human review only for contested novel interpretations.
- **Sales Cycle:** 2–6 weeks for importer tier. 2–4 months for carrier tier. 6–12 months for ERP API tier.
- **Critical Partnerships:** Customs broker referral network and/or logistics software ISV partnerships for distribution.
- **Regulatory Dependencies:** EU regulatory calendar drives demand. GPSR/CRA/EUDR/CBAM are the current forcing functions.
- **Technical Dependencies:** EU Official Journal change-detection feed; TARIC database; HS code taxonomy; customs declaration API.
- **Market Timing:** Active enforcement of GPSR (2024) and approaching CRA (2027) creates acute demand window. NOW is the time.
- **Team Capabilities:** EU regulatory law expertise, product engineering, logistics/supply-chain domain knowledge, enterprise sales.
- **Unprofitable Conditions:** ['importers prefer manual customs broker route despite higher cost', 'EU regulatory enforcement weaker than expected — urgency dissipates', 'large customs software incumbents copy feature set within 18 months', 'ERP integration sales cycle exceeds 18 months burning runway', 'regulation scope changes invalidate existing compliance graph — rebuild cost too high']
