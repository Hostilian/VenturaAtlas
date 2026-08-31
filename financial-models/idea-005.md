# Financial Model — Prompt Registry & Evaluation Lab

## Model

- **Revenue Model:** subscription_or_usage

- **Pricing Model:** Start with a fixed paid outcome; introduce subscription, usage, licensing, transaction, or enterprise pricing only after repeat demand.

### Suggested Pricing Tiers
- {"name": "Pilot", "priceRange": {"currency": "USD", "minimum": 49, "midpoint": 199, "maximum": 499}, "scope": "one narrow outcome"}
- {"name": "Team", "priceRange": {"currency": "USD", "minimum": 99, "midpoint": 399, "maximum": 1499}, "scope": "repeat use and collaboration"}
- {"name": "Enterprise", "priceRange": {"currency": "USD", "minimum": 1000, "midpoint": 5000, "maximum": 25000}, "scope": "security, policy, support, or self-hosting"}

### Expected Arpc

- **Currency:** USD

- **Minimum:** 49

- **Midpoint:** 249

- **Maximum:** 2500

- **Setup Fees:** Optional only for real onboarding work; do not hide services inside SaaS pricing.

- **Usage Fees:** Per run, minute, document, active record, transaction, or evaluation when costs scale with use.

- **Transaction Fees:** Only when the product directly participates in measurable transactions.

- **Marketplace Commission:** 5–20% scenario range where a marketplace role is justified; validate jurisdiction and economics.

- **Advertising:** Use only when ads do not compromise trust or user outcomes.

- **Licensing:** Potential for datasets, policy packs, templates, APIs, and self-hosted deployments.

- **Enterprise:** Security, SSO, audit, retention, support, and private deployment can justify higher pricing.

### Upsells
- additional languages or regions
- more integrations
- human review
- advanced exports
- team policies

### Cross Sells
- adjacent validation
- monitoring
- benchmarking
- implementation templates

- **Recurring Revenue Potential:** Medium to high when the triggering workflow repeats and history improves value.

### Gross Margin Potential

- **Currency:** USD

- **Minimum:** 45

- **Midpoint:** 75

- **Maximum:** 90

### Variable Costs
- model inference
- human review
- payments
- communications
- data/API fees
- support

### Fixed Costs
- engineering
- security
- legal review
- core hosting
- sales and content

- **Ai Inference Costs:** Track by run and enforce budgets; use smaller deterministic models where adequate.

- **Infrastructure Costs:** Near zero for validation; increase only with usage and reliability needs.

- **Data Costs:** Unknown — depends on licensing and API terms.

- **Support Costs:** Main risk when inputs vary or results require explanation.

- **Sales Costs:** Can be low with self-serve demand, but early direct outreach is necessary for learning.

- **Compliance Costs:** Potentially material for marketplaces, regulated domains, payments, or sensitive data.

- **Refund Fraud Exposure:** Use clear scope, delivery evidence, payment controls, and dispute procedures.

### Cac

- **Currency:** USD

- **Minimum:** 20

- **Midpoint:** 150

- **Maximum:** 1200

### Ltv

- **Currency:** USD

- **Minimum:** 150

- **Midpoint:** 1800

- **Maximum:** 25000

- **Ltv Cac Ratio:** Target >3 after validated cohorts; currently unknown.

- **Payback Period:** Target under 6 months for self-serve and under 12 months for larger accounts.

- **Break Even Estimate:** Monthly fixed costs / (average monthly revenue per customer - average monthly variable cost per customer).

- **Time To First Revenue:** 2 days–8 weeks with a paid pilot.

- **Time To Profitability:** 3–24 months depending on distribution, retention, and human service cost.

- **Working Capital:** Keep pre-revenue spend minimal; collect deposits for variable-cost pilots.

- **Scalability:** Scale reusable software, data, and distribution rather than founder review hours.

### Margin Improvements
- cache and batch
- better routing
- self-serve onboarding
- standardized input formats
- customer-funded external usage
- automation after error taxonomy stabilizes

### Scenarios
- {"name": "conservative", "customers": 8, "averageMonthlyRevenuePerCustomer": 55.3, "monthlyRevenue": 442.4, "annualRevenue": 5308.8, "grossMarginPercent": 55.0, "monthlyOperatingCosts": 500, "approxMonthlyOperatingProfit": -256.68, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment", "support and review must stay within modeled variable cost"]}
- {"name": "base", "customers": 35, "averageMonthlyRevenuePerCustomer": 79.0, "monthlyRevenue": 2765, "annualRevenue": 33180, "grossMarginPercent": 72.0, "monthlyOperatingCosts": 2200, "approxMonthlyOperatingProfit": -209.2, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment", "support and review must stay within modeled variable cost"]}
- {"name": "aggressive", "customers": 120, "averageMonthlyRevenuePerCustomer": 106.65, "monthlyRevenue": 12798.0, "annualRevenue": 153576.0, "grossMarginPercent": 82.0, "monthlyOperatingCosts": 9000, "approxMonthlyOperatingProfit": 1494.36, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment", "support and review must stay within modeled variable cost"]}

### Known Facts
- The idea or variant appears in the supplied corpus.

### Research Supported Estimates
- Some reports contained competitor-pricing and demand evidence, but full citation byte streams were not accessible here.

### Analyst Assumptions
- customer counts
- prices
- conversion
- retention
- cost structure

### Unknowns
- actual willingness to pay
- channel conversion
- support minutes per customer
- repeat frequency

- **Unit Economics Formula:** Leads × conversion = customers; customers × ARPC = revenue; revenue − variable costs = gross profit; gross profit − fixed costs = operating profit.

### Must Be True

- **Required Customer Volume:** Enough active customers to cover fixed costs under the break-even formula.

- **Minimum Viable Price:** Must exceed variable delivery, support, refunds, and acquisition on a cohort basis.

- **Maximum Cac:** No more than roughly one-third of validated gross-profit LTV as a planning guardrail.

- **Retention Or Frequency:** Repeat usage or expansion must justify acquisition unless initial contribution margin is high.

- **Required Gross Margin:** Prefer >60% for scalable software; lower can work for a deliberately productized service.

- **Maximum Service Cost:** Human review must decline as a percentage of price or be priced explicitly.

- **Conversion Rate:** Landing-page interest is insufficient; paid conversion must support channel economics.

- **Automation Level:** Automate stable repetitive work, not uncertainty that still requires learning.

- **Sales Cycle:** Short enough that runway survives; validate before building enterprise features.

- **Critical Partnerships:** Any partner channel must show signed or behavioral commitment.

- **Regulatory Dependencies:** Launch scope must remain lawful and claims must match evidence.

- **Technical Dependencies:** Critical APIs, data licences, and model behavior must be verified.

- **Market Timing:** The trigger must be active now, not merely forecast.

- **Team Capabilities:** Product engineering, customer discovery, distribution, and domain review.

- **Unprofitable Conditions:** ['buyers will not prepay', 'support exceeds price', 'channel CAC is too high', 'retention is weak', 'free native platform feature removes differentiation']
