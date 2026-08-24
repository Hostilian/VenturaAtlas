# Financial Model — FactBounty — Buyer-Funded Product Proof Exchange

> **Score:** 91.2 overall opportunity | **Research saturation flag: ACTIVE** (0 live experiments)
> **Kill experiment:** Post 3 real buyer-funded bounties. If <2 funded by real buyers within 30 days → KILL buyer-funded model; pivot to subscription.

## Model

- **Revenue Model:** marketplace_commission + unlock_fee + api_subscription + merchant_bounty

- **Pricing Model:** Buyer pays a small bounty to fund one objective question. Platform takes 20–35% of each bounty. Unlock fee (€0.20–€1) charged to future buyers reusing the same verified fact. API subscription for shopping agents and retailers who access the fact graph at scale. Merchant-funded bounties for unanswered catalogue gaps.

### Suggested Pricing Tiers
- {'name': 'Buyer Bounty', 'priceRange': {'currency': 'EUR', 'minimum': 5, 'midpoint': 15, 'maximum': 49}, 'scope': 'one objective, verifiable product question'}
- {'name': 'Fact Unlock', 'priceRange': {'currency': 'EUR', 'minimum': 0.20, 'midpoint': 0.50, 'maximum': 1.00}, 'scope': 'access to existing verified answer by a later buyer'}
- {'name': 'API Subscription', 'priceRange': {'currency': 'USD', 'minimum': 99, 'midpoint': 499, 'maximum': 2500}, 'scope': 'shopping agent or retailer integration — monthly, per 1000 fact lookups'}
- {'name': 'Merchant Bounty', 'priceRange': {'currency': 'EUR', 'minimum': 10, 'midpoint': 50, 'maximum': 500}, 'scope': 'merchant funds answers for top unanswered questions on their listings'}

### Expected ARPC (Platform Gross)

- **Currency:** EUR / USD
- **Minimum:** 3 (small bounty platform cut, early days)
- **Midpoint:** 120 (mix of bounty fees + unlock fees per active user-month)
- **Maximum:** 2500 (API subscription tier)

- **Platform Commission:** 20–35% on each buyer bounty. Example: €15 bounty → €4.50–€5.25 platform revenue.
- **Unlock Fee:** €0.20–€1 per reuse. Compounding asset — each verified answer earns passively from every future buyer with the same question.
- **API Subscription:** Monthly SaaS fee to shopping agents, price-comparison engines, and retailers for structured fact API access.
- **Merchant Bounties:** Merchants fund answers to their own top unanswered listing questions. Platform keeps commission.

### Upsells
- verified answer badge / merchant integration widget
- bulk bounty packages for retailers
- historical fact revision alerts
- API rate limit increases
- verified reviewer credentials

### Cross Sells
- Revision & Variant Proof Registry (idea-066) — natural adjacency
- Product Evidence API (idea-068) — B2B channel
- Local Shelf Proof (idea-065) — physical availability facts

- **Recurring Revenue Potential:** High. Each verified fact earns unlock fees indefinitely. API subscriptions are monthly. Merchant bounty programs renew.

### Gross Margin Potential

- **Currency:** USD
- **Minimum:** 60 (heavy human verification, early stage)
- **Midpoint:** 78 (AI-augmented verification, partial automation)
- **Maximum:** 90 (mature platform: automated fact routing, cached verification, low marginal cost per unlock)

### Variable Costs
- human verifier payouts (largest early cost — direct pass-through minus platform margin)
- AI inference for claim classification and bounty routing
- fraud detection and dispute resolution
- payment processing (Stripe, ~2.9% + €0.30)
- customer support per bounty

### Fixed Costs
- engineering and platform maintenance
- legal review (consumer protection, evidence standards, GDPR)
- security and privacy infrastructure
- content moderation policy
- sales and marketing

- **AI Inference Costs:** Low per fact — mostly classification and routing. Enforce per-run budgets. Human verification is the dominant cost, not AI.
- **Infrastructure Costs:** Near-zero at low volume; scale with usage and reliability needs.
- **Data Costs:** None for buyer-funded evidence; may need product catalogue data licensing for context.
- **Support Costs:** Main risk — disputed bounties, unclear question scope, verifier disagreements. Invest in clear bounty acceptance criteria.
- **Compliance Costs:** GDPR for EU users. Consumer protection rules for evidence claims. Keep claims strictly objective and verifiable.
- **Refund Fraud Exposure:** Use escrow model — funds held until verified answer delivered. Clear scope rules prevent gaming.

### CAC

- **Currency:** USD
- **Minimum:** 0 (organic / word-of-mouth from one correct answer to a viral product question)
- **Midpoint:** 25 (content SEO targeting product-specific queries, social proof)
- **Maximum:** 120 (paid acquisition for API or merchant tier)

### LTV

- **Currency:** USD
- **Minimum:** 15 (one-time buyer, single bounty, no repeat)
- **Midpoint:** 180 (repeat buyer, 3–5 bounties/year + unlock revenue contribution)
- **Maximum:** 30000 (API subscription customer, 12-month contract)

- **LTV/CAC Ratio:** Target >5 for buyer tier (very low CAC potential). Target >3 for API tier.
- **Payback Period:** Under 7 days for buyer tier (instant transaction). Under 3 months for API tier.
- **Break-Even Estimate:** Monthly fixed costs / (platform commission per bounty × bounties per month).
- **Time To First Revenue:** 1–7 days — first live bounty posted and fulfilled.
- **Time To Profitability:** 6–18 months — once unlock fee flywheel accumulates verified facts and API tier has 5+ subscribers.
- **Working Capital:** Zero pre-revenue capital required. Buyer funds are collected before verifier is paid. Net-positive working capital from day one.
- **Scalability:** Every verified fact reduces future marginal cost to near-zero (cached answer). The fact graph compounds — each answer increases value for all future buyers with the same question.

### Margin Improvements
- cache and batch similar questions across listings
- AI pre-screening to auto-answer from existing fact graph before routing to human
- standardized bounty templates reduce scope ambiguity and support cost
- merchant self-service bounty portal eliminates sales overhead
- fact graph licensing to retailers and platforms

### Scenarios
- {'name': 'conservative', 'customers': 120, 'averageMonthlyRevenuePerCustomer': 4.50, 'monthlyRevenue': 540, 'annualRevenue': 6480, 'grossMarginPercent': 62, 'monthlyOperatingCosts': 800, 'approxMonthlyOperatingProfit': -465, 'assumptions': ['small bounty volume', 'high human verifier cost', 'zero API revenue', 'CAC near zero via organic SEO']}
- {'name': 'base', 'customers': 1500, 'averageMonthlyRevenuePerCustomer': 8.20, 'monthlyRevenue': 12300, 'annualRevenue': 147600, 'grossMarginPercent': 75, 'monthlyOperatingCosts': 8500, 'approxMonthlyOperatingProfit': 712, 'assumptions': ['unlock fee flywheel active', 'AI reduces per-bounty cost', '3 API subscriptions at $499/mo', 'merchant bounty program launched']}
- {'name': 'aggressive', 'customers': 12000, 'averageMonthlyRevenuePerCustomer': 11.50, 'monthlyRevenue': 138000, 'annualRevenue': 1656000, 'grossMarginPercent': 86, 'monthlyOperatingCosts': 65000, 'approxMonthlyOperatingProfit': 53680, 'assumptions': ['fact graph has 500k+ verified answers', '25+ API subscribers', 'merchant bounty program at scale', 'shopping agent integrations driving unlock volume']}

### Known Facts
- 24 source references indexed in canonical record (highest source count in top-20)
- Buyer-funded bounty model is validated conceptually — no live payment experiments recorded
- Product catalogs systematically fail to answer precise physical questions (documented via research)
- Shopping agents and AI assistants create new B2B demand for structured product facts
- Returns from misfitting or misunderstood products represent measurable buyer cost

### Research Supported Estimates
- WTP score: 7.0/10 — buyers demonstrably pay more to avoid wrong purchases
- Problem severity: 8.5/10 — documented via online shopping behavior research
- Defensibility: 6.5/10 — fact graph accumulation is the core moat; early entrant advantage matters

### Analyst Assumptions
- buyer bounty conversion rate (1–3% of listing viewers)
- verifier quality and availability
- unlock fee uptake from subsequent buyers
- API subscriber count and contract length
- merchant bounty program adoption rate

### Unknowns
- actual willingness to fund a bounty vs. just searching elsewhere
- verifier pool depth and quality per product category
- platform take rate that clears both buyer and verifier economics
- time to first repeat purchase per cohort

- **Unit Economics Formula:** Bounties posted × funded rate × platform commission = transaction revenue. Funded answers × unlock rate × unlock fee = passive revenue. API subscribers × ARPC = B2B revenue. Total revenue − verifier payouts − AI − support = gross profit.

### Must Be True

- **Required Customer Volume:** ~1,500 active bounty-posters/month to reach operating profitability in base scenario.
- **Minimum Viable Price:** Buyer bounty ≥ €8 for platform to cover verifier + infrastructure + support after commission. Or unlock fee volume must compensate.
- **Maximum CAC:** No more than €5 for buyer tier (LTV midpoint €180 × 1/3 = €60 ceiling; target €5 for organic-first).
- **Retention Or Frequency:** Repeat buyers OR unlock fee compounding. Either alone is insufficient in early stage; both together create profitability.
- **Required Gross Margin:** >65% sustainable. Early human-heavy stage may be 55–62%; must improve with AI routing and fact caching.
- **Maximum Service Cost:** Human verifier payout must stay below 40% of bounty value (platform retains 20–35%); verifier takes 25–40%; net positive for all.
- **Conversion Rate:** 1–3% of buyers viewing an unanswered listing question must post a bounty. Must be validated with real users before scaling.
- **Automation Level:** Fact routing and classification can be AI-automated. Verification of physical claims (measurements, fit) still requires a human with the actual product. Automate routing, not judgment.
- **Sales Cycle:** API tier sales cycle 2–8 weeks. Merchant bounty tier 1–4 weeks. Buyer tier is self-serve — zero sales cycle.
- **Critical Partnerships:** None required for launch. Shopping agent API integrations are growth accelerators, not prerequisites.
- **Regulatory Dependencies:** EU consumer protection rules apply to evidence quality claims. GDPR applies to buyer data. Keep claims objective and verifiable.
- **Technical Dependencies:** Payment escrow (Stripe), product listing ingestion (no catalogue licensing required for launch), AI routing.
- **Market Timing:** Shopping agent proliferation (2025–2026) creates immediate B2B demand for structured product facts. Timing is active.
- **Team Capabilities:** Product engineering, consumer trust design, marketplace economics, verifier network operations.
- **Unprofitable Conditions:** ['buyers will not post bounties for precise questions — browse/return instead', 'verifier pool too thin or too expensive', 'unlock fee uptake below 5% of subsequent viewers', 'AI summaries close the question gap before marketplace reaches scale', 'platform take rate below 15% makes unit economics unworkable']
