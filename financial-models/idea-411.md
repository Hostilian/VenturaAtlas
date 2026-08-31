# Financial Model — WorkerChainReceipt -- UK Contractor RTW Evidence Chain

## Model

- **Revenue Model:** Per-worker evidence receipt; site access integration
- **Pricing Model:** Start with a fixed paid outcome or success fee; introduce tiered pricing only after repeat demand.

### Suggested Pricing Tiers
- {"name": "Pilot / Single Outcome", "priceRange": {"currency": "GBP", "minimum": 19, "midpoint": 49, "maximum": 199}, "scope": "one verified result or transaction"}
- {"name": "Monthly Active Operator", "priceRange": {"currency": "GBP", "minimum": 49, "midpoint": 149, "maximum": 499}, "scope": "repeat workflow and priority routing"}
- {"name": "Enterprise / Multi-Location", "priceRange": {"currency": "GBP", "minimum": 250, "midpoint": 750, "maximum": 2500}, "scope": "dedicated routing, SLAs, and custom integration"}

### Expected ARPC
- **Currency:** GBP
- **Minimum:** 19
- **Midpoint:** 89
- **Maximum:** 850

### Gross Margin Potential
- **Currency:** GBP
- **Minimum:** 55%
- **Midpoint:** 75%
- **Maximum:** 90%

### Variable Costs
- messaging and delivery routing
- payment processing fees
- verification and dispute resolution
- customer support

### Fixed Costs
- domain and basic hosting
- compliance and legal registration
- tooling and database

### Scenarios
- {"name": "conservative", "customers": 10, "averageMonthlyRevenuePerCustomer": 35.0, "monthlyRevenue": 350.0, "annualRevenue": 4200.0, "grossMarginPercent": 60.0, "monthlyOperatingCosts": 100, "approxMonthlyOperatingProfit": 110.0, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment"]}
- {"name": "base", "customers": 45, "averageMonthlyRevenuePerCustomer": 75.0, "monthlyRevenue": 3375.0, "annualRevenue": 40500.0, "grossMarginPercent": 75.0, "monthlyOperatingCosts": 600, "approxMonthlyOperatingProfit": 1931.25, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment"]}
- {"name": "aggressive", "customers": 150, "averageMonthlyRevenuePerCustomer": 110.0, "monthlyRevenue": 16500.0, "annualRevenue": 198000.0, "grossMarginPercent": 85.0, "monthlyOperatingCosts": 2500, "approxMonthlyOperatingProfit": 11525.0, "assumptions": ["customer count is hypothetical", "price must be tested with prepayment"]}

### Known Facts
- Opportunity identified and structured in canonical atlas under ID `idea-411`.

### Analyst Assumptions
- Target buyer willingness to pay: Engager liability under expanded RTW obligations
- Startup cost budget: GBP 0–100

### Unknowns
- Exact channel conversion rate
- Retention and churn rate across 90 days

## What Must Be True for This Idea to Be Profitable
- **Target Customer:** Engagers managing long UK subcontracting chains in construction, logistics, or gig platforms
- **Why Customers Pay:** Engager liability under expanded RTW obligations
- **Main Risk:** TrustID and established providers already cover supply chains; defensibility 3/10 in OMEGA XVII scorecard
