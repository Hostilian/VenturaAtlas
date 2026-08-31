# Financial Model — DataAct Claims Engine — Statutory Data Access Dispute Operations

## Model

- **Revenue Model:** Performance fee / transaction fee / subscription
- **Pricing Model:** Start with a fixed paid outcome or success fee; introduce tiered pricing only after repeat demand.

### Suggested Pricing Tiers
- {"name": "Pilot / Single Outcome", "priceRange": {"currency": "EUR", "minimum": 19, "midpoint": 49, "maximum": 199}, "scope": "one verified result or transaction"}
- {"name": "Monthly Active Operator", "priceRange": {"currency": "EUR", "minimum": 49, "midpoint": 149, "maximum": 499}, "scope": "repeat workflow and priority routing"}
- {"name": "Enterprise / Multi-Location", "priceRange": {"currency": "EUR", "minimum": 250, "midpoint": 750, "maximum": 2500}, "scope": "dedicated routing, SLAs, and custom integration"}

### Expected ARPC
- **Currency:** EUR
- **Minimum:** 19
- **Midpoint:** 89
- **Maximum:** 850

### Gross Margin Potential
- **Currency:** EUR
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
- Opportunity identified and structured in canonical atlas under ID `idea-368`.

### Analyst Assumptions
- Target buyer willingness to pay: Saves time and prevents loss
- Startup cost budget: EUR 0–100

### Unknowns
- Exact channel conversion rate
- Retention and churn rate across 90 days

## What Must Be True for This Idea to Be Profitable
- **Target Customer:** Data Recipients & Legal Counsel
- **Why Customers Pay:** Concrete value delivered
- **Main Risk:** Customer acquisition friction
