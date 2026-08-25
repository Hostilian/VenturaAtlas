# Financial Model — RiceGuard -- Preferential-Tariff Safeguard PO Risk

## Model

- **Revenue Model:** Per-PO risk alert; subscription for traders with repeat volume
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
- Opportunity identified and structured in canonical atlas under ID `idea-410`.

### Analyst Assumptions
- Target buyer willingness to pay: A tariff surprise on a large rice shipment can represent tens of thousands of EUR in unexpected duty.
- Startup cost budget: EUR 0–100

### Unknowns
- Exact channel conversion rate
- Retention and churn rate across 90 days

## What Must Be True for This Idea to Be Profitable
- **Target Customer:** Rice importers and commodity traders sourcing from GSP beneficiary countries
- **Why Customers Pay:** A tariff surprise on a large rice shipment can represent tens of thousands of EUR in unexpected duty.
- **Main Risk:** Expert traders already understand tariffs; official customs systems may absorb; data timeliness critical; very narrow commodity scope
