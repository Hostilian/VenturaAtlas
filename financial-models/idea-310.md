# Financial Model — RxTrace Chaos Lab — DSCSA Exception Drill & Physical/Data Reconciliation Engine

## Model

- **Revenue Model:** $249 pharmacy failure drill or $1,500-5,000 vendor test pack
- **Pricing Model:** Start with a fixed paid outcome or success fee; introduce tiered pricing only after repeat demand.

### Suggested Pricing Tiers
- {'name': 'Pilot / Single Outcome', 'priceRange': {'currency': 'EUR', 'minimum': 19, 'midpoint': 49, 'maximum': 199}, 'scope': 'one verified result or transaction'}
- {'name': 'Monthly Active Operator', 'priceRange': {'currency': 'EUR', 'minimum': 49, 'midpoint': 149, 'maximum': 499}, 'scope': 'repeat workflow and priority routing'}
- {'name': 'Enterprise / Multi-Location', 'priceRange': {'currency': 'EUR', 'minimum': 250, 'midpoint': 750, 'maximum': 2500}, 'scope': 'dedicated routing, SLAs, and custom integration'}

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
- {'name': 'conservative', 'customers': 10, 'averageMonthlyRevenuePerCustomer': 35.0, 'monthlyRevenue': 350.0, 'annualRevenue': 4200.0, 'grossMarginPercent': 60.0, 'monthlyOperatingCosts': 100, 'approxMonthlyOperatingProfit': 110.0, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}
- {'name': 'base', 'customers': 45, 'averageMonthlyRevenuePerCustomer': 75.0, 'monthlyRevenue': 3375.0, 'annualRevenue': 40500.0, 'grossMarginPercent': 75.0, 'monthlyOperatingCosts': 600, 'approxMonthlyOperatingProfit': 1931.25, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}
- {'name': 'aggressive', 'customers': 150, 'averageMonthlyRevenuePerCustomer': 110.0, 'monthlyRevenue': 16500.0, 'annualRevenue': 198000.0, 'grossMarginPercent': 85.0, 'monthlyOperatingCosts': 2500, 'approxMonthlyOperatingProfit': 11525.0, 'assumptions': ['customer count is hypothetical', 'price must be tested with prepayment']}

### Known Facts
- Opportunity identified and structured in canonical atlas under ID `idea-310`.

### Analyst Assumptions
- Target buyer willingness to pay: Comply with mandatory FDA DSCSA Nov 2026 rules and prevent drug receiving halts
- Startup cost budget: EUR 0–200

### Unknowns
- Exact channel conversion rate
- Retention and churn rate across 90 days

## What Must Be True for This Idea to Be Profitable
- **Target Customer:** Pharmacy management software vendors, PSAOs, wholesaler networks, and independent pharmacies
- **Why Customers Pay:** Comply with mandatory FDA DSCSA Nov 2026 rules and prevent drug receiving halts
- **Main Risk:** Independent pharmacy buyers having low individual price tolerance
