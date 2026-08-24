# Financial Model — DemandProof / LoadLedger — Electricity Load Project Identity & Readiness Network

> **Score:** 97.2 overall opportunity | **WTP:** 96/100 | **Problem Severity:** 98/100
> **Category:** Energy Grid & Electrical Infrastructure

## Model

- **Revenue Model:** utility_rto_subscription + developer_verification_fee + fast_track_credential

- **Pricing Model:** B2B SaaS subscriptions for utilities and RTOs who need transmission queue de-duplication intelligence. Per-project verification fees for developers who want confidential readiness scoring. Fast-track credentials for projects that pass DemandProof's readiness check — unlocking priority queue processing.

### Suggested Pricing Tiers
- {'name': 'Utility / RTO Planning Subscription', 'priceRange': {'currency': 'USD', 'minimum': 5000, 'midpoint': 25000, 'maximum': 120000}, 'scope': 'annual — queue de-duplication intelligence, phantom project detection, transmission planning support'}
- {'name': 'Developer Confidential Verification', 'priceRange': {'currency': 'USD', 'minimum': 500, 'midpoint': 2500, 'maximum': 15000}, 'scope': 'per project — privacy-preserving readiness score + AlternativeSiteGroup detection'}
- {'name': 'Fast-Track Credential', 'priceRange': {'currency': 'USD', 'minimum': 1000, 'midpoint': 5000, 'maximum': 25000}, 'scope': 'per project — certified readiness proof unlocking queue priority'}

### Expected ARPC

- **Currency:** USD
- **Minimum:** 5000 (single utility subscription, early pilot)
- **Midpoint:** 28000 (1 utility subscription + 4 developer verifications/month)
- **Maximum:** 200000 (enterprise utility + RTO + hyperscaler data center verification at scale)

### Upsells
- multi-region queue intelligence
- historical queue analysis and phantom project forensics
- custom API integration with RTO OASIS systems
- developer portfolio readiness dashboards
- regulatory compliance reporting packages

### Cross Sells
- LoadEnvelope CI (idea-396) — continuous grid contract assurance
- PowerPlot (idea-273) — grid capacity intelligence

- **Recurring Revenue Potential:** Very high. Utilities and RTOs operate continuously; transmission planning is perpetual. Annual subscription renewals expected. Developers return for each new project.

### Gross Margin Potential

- **Currency:** USD
- **Minimum:** 55 (heavy data science and engineering at launch)
- **Midpoint:** 78 (recurring subscriptions with low marginal cost per additional query)
- **Maximum:** 88 (mature SaaS: cached entity resolution, automated probabilistic scoring, low per-query cost)

### Variable Costs
- compute for privacy-preserving entity resolution (homomorphic encryption / secure multiparty computation)
- AI inference for readiness scoring
- data licensing for utility meter data and developer registration records
- compliance and legal review per jurisdiction
- customer success for utility accounts

### Fixed Costs
- engineering (privacy-first distributed architecture is complex)
- security and audit infrastructure
- FERC/NERC regulatory compliance
- data partnership maintenance
- sales (long enterprise cycle for utility accounts)

- **AI Inference Costs:** Material for probabilistic readiness scoring. Enforce per-project budget. Amortize across subscription volume.
- **Infrastructure Costs:** Higher than typical SaaS due to privacy-preserving computation requirements. Target <15% of revenue at scale.
- **Data Costs:** Key risk — utility meter data, interconnection queue access. Must negotiate data partnerships; some may be public FERC filings.
- **Support Costs:** Low per utility once integrated; onboarding is the main investment.
- **Compliance Costs:** High. FERC, NERC, state utility commissions. Plan for 6–18 months regulatory engagement before first utility contract.
- **Refund Fraud Exposure:** Low — B2B contracts with clear deliverable scope.

### CAC

- **Currency:** USD
- **Minimum:** 2000 (warm intro via grid consultant network)
- **Midpoint:** 15000 (direct utility outreach, conference presence, 6-month sales cycle)
- **Maximum:** 80000 (large RTO or hyperscaler — multi-stakeholder procurement)

### LTV

- **Currency:** USD
- **Minimum:** 15000 (1-year utility subscription, no renewal)
- **Midpoint:** 180000 (3-year utility subscription + developer verification revenue)
- **Maximum:** 2000000 (major RTO multi-year + developer verification at scale)

- **LTV/CAC Ratio:** Target >5 for utility tier. CAC is high but LTV is massive.
- **Payback Period:** 6–18 months for utility tier (long sales cycle, then high annual value).
- **Break-Even Estimate:** 4–8 paying utility/RTO subscribers covers fixed costs; developer verification provides variable upside.
- **Time To First Revenue:** 3–9 months — utility procurement cycles are long. Developer tier may be faster (2–4 months) via direct outreach to interconnection queue applicants.
- **Time To Profitability:** 18–36 months. High upfront engineering cost; breaks even after 6–10 utility contracts.
- **Working Capital:** Significant runway required. Plan for 18 months of engineering and sales before break-even. Seek anchor customers willing to co-develop.
- **Scalability:** Entity resolution and probabilistic scoring improve with each new project. Each additional utility data partnership reduces marginal cost of verification.

### Margin Improvements
- automate FERC filing ingestion for queue data
- cache entity resolution results per developer project cluster
- self-service developer portal reduces sales overhead for smaller verification requests
- data partnership co-investment with anchor utilities reduces data costs

### Scenarios
- {'name': 'conservative', 'customers': 2, 'averageMonthlyRevenuePerCustomer': 2100, 'monthlyRevenue': 4200, 'annualRevenue': 50400, 'grossMarginPercent': 55, 'monthlyOperatingCosts': 18000, 'approxMonthlyOperatingProfit': -15690, 'assumptions': ['2 utility pilot subscribers', 'high engineering burn', 'no developer verification revenue yet', 'pre-product-market-fit']}
- {'name': 'base', 'customers': 8, 'averageMonthlyRevenuePerCustomer': 2300, 'monthlyRevenue': 18400, 'annualRevenue': 220800, 'grossMarginPercent': 74, 'monthlyOperatingCosts': 12000, 'approxMonthlyOperatingProfit': 1616, 'assumptions': ['6 utility subscriptions + developer verification volume', 'engineering team of 3', 'first RTO pilot active']}
- {'name': 'aggressive', 'customers': 35, 'averageMonthlyRevenuePerCustomer': 3800, 'monthlyRevenue': 133000, 'annualRevenue': 1596000, 'grossMarginPercent': 84, 'monthlyOperatingCosts': 85000, 'approxMonthlyOperatingProfit': 26920, 'assumptions': ['12 utilities + 2 RTOs + 5 hyperscaler data center developers', 'developer verification at volume', 'fast-track credential program live']}

### Known Facts
- FERC Order 2023 has forced transmission queue reform — creating an urgent market for de-duplication tools
- Major RTOs (PJM, MISO, CAISO) have publicly documented queue congestion from phantom/duplicate projects
- Stranded transmission capex from phantom demand is a documented, billion-dollar problem
- 3 source references in canonical record — relatively thin; needs more evidence investment
- WTP score 96/100 — extraordinarily high; utilities and RTOs will pay to avoid billion-dollar capex mistakes

### Research Supported Estimates
- WTP 96/100 — strongest WTP score in the top 15 ideas by score
- Problem severity 98/100 — highest problem severity in the dataset
- Market proof: 0 — no external validation experiments run

### Analyst Assumptions
- utility procurement cycle length
- FERC data availability and licensing terms
- probability of hyperscaler adoption (Microsoft, Google, Amazon data center programs)
- developer willingness to pay for confidential pre-submission readiness scoring

### Unknowns
- actual utility willingness to share queue data for entity resolution
- regulatory approval path for cross-utility data sharing
- competitive response from incumbent grid software vendors (ABB, Siemens, Oracle Utilities)
- timing of FERC Order 2023 enforcement creating acute demand spike

- **Unit Economics Formula:** Utility subscribers × annual subscription fee = recurring base. Developer project verifications × per-project fee = variable upside. Total revenue − compute/data/legal − engineering − sales = operating profit.

### Must Be True

- **Required Customer Volume:** 6–8 paying utility or RTO subscribers to reach operating break-even.
- **Minimum Viable Price:** Utility annual subscription ≥ $50,000 to justify enterprise sales cost. Developer verification ≥ $1,000 per project.
- **Maximum CAC:** No more than $30,000 for utility tier (LTV midpoint $180,000 ÷ 3 = $60,000 ceiling; target $15,000 via warm channel).
- **Retention Or Frequency:** Annual subscription renewal is mandatory. Churn kills the model. Lock-in through data partnership integrations.
- **Required Gross Margin:** >70% at steady state. Privacy computation cost is the main variable risk; amortize across subscription base.
- **Maximum Service Cost:** Customer success for utility accounts must be <10% of annual contract value.
- **Conversion Rate:** Utility pipeline conversion rate 15–25% (long cycle; high-quality leads from grid consultant referrals).
- **Automation Level:** Automate FERC filing ingestion and probabilistic scoring. Keep human expert review for contested cases.
- **Sales Cycle:** 6–18 months for utilities and RTOs. 1–3 months for developer verification tier.
- **Critical Partnerships:** At least one anchor utility or RTO willing to co-develop is required before public launch.
- **Regulatory Dependencies:** FERC, NERC, state PUC. Budget 12+ months for regulatory engagement. FERC Order 2023 creates tailwind, not guaranteed access.
- **Technical Dependencies:** Privacy-preserving computation library; FERC public data feeds; utility meter AMI data (licensed or partnership).
- **Market Timing:** FERC Order 2023 enforcement creates acute urgency NOW (2026). Window is 2–4 years before legacy software adapts.
- **Team Capabilities:** Distributed systems (privacy-preserving computation), grid/energy domain expertise, enterprise sales, regulatory navigation.
- **Unprofitable Conditions:** ['utilities refuse to share queue data even under privacy-preserving protocol', 'FERC queue reform stalls and urgency dissipates', 'enterprise sales cycle extends beyond 24 months burning runway', 'incumbent grid software vendors copy feature within 18 months', 'hyperscaler developers bypass verification — go direct to RTO without DemandProof']
