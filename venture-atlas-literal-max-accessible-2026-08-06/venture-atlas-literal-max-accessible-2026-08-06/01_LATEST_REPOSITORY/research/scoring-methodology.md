# Scoring Methodology

Each idea receives 25 scores from 0–10. Higher always means more attractive: **competitive advantage** is used instead of raw competition; **regulatory simplicity** instead of burden; **operational simplicity** instead of complexity. Every score includes a justification, confidence, and basis. Composite views are weighted averages multiplied by 10.

## Profiles

```json
{
  "overallOpportunity": {
    "problemSeverity": 7,
    "willingnessToPay": 7,
    "marketDemand": 6,
    "revenuePotential": 7,
    "grossMarginPotential": 5,
    "defensibility": 6,
    "scalability": 5,
    "easeOfDistribution": 5,
    "evidenceQuality": 6,
    "overallConfidence": 5
  },
  "bootstrapPotential": {
    "speedToFirstRevenue": 8,
    "lowStartupCost": 8,
    "easeOfMvp": 7,
    "grossMarginPotential": 7,
    "founderAccessibility": 6,
    "operationalSimplicity": 6,
    "willingnessToPay": 6
  },
  "soloFounderPotential": {
    "lowStartupCost": 8,
    "easeOfMvp": 8,
    "aiAutomationPotential": 8,
    "operationalSimplicity": 8,
    "founderAccessibility": 8,
    "easeOfDistribution": 5
  },
  "aiAgentPotential": {
    "aiAutomationPotential": 12,
    "easeOfMvp": 5,
    "scalability": 5,
    "dataAdvantagePotential": 5,
    "defensibility": 4
  },
  "fastestRevenue": {
    "speedToFirstRevenue": 16,
    "easeOfDistribution": 8,
    "lowStartupCost": 8,
    "easeOfMvp": 7,
    "willingnessToPay": 6
  },
  "highestProfitPotential": {
    "revenuePotential": 12,
    "grossMarginPotential": 10,
    "scalability": 9,
    "recurringRevenuePotential": 8,
    "defensibility": 7
  },
  "lowestCostLaunch": {
    "lowStartupCost": 20,
    "easeOfMvp": 8,
    "founderAccessibility": 5
  },
  "recurringRevenue": {
    "recurringRevenuePotential": 18,
    "retentionPotential": 10,
    "frequencyOfNeed": 8,
    "willingnessToPay": 5
  },
  "enterpriseOpportunity": {
    "willingnessToPay": 10,
    "revenuePotential": 12,
    "defensibility": 8,
    "dataAdvantagePotential": 6,
    "retentionPotential": 6
  },
  "consumerOpportunity": {
    "marketDemand": 10,
    "easeOfDistribution": 9,
    "globalPotential": 8,
    "lowStartupCost": 5,
    "frequencyOfNeed": 5
  },
  "localBusinessOpportunity": {
    "speedToFirstRevenue": 10,
    "easeOfDistribution": 8,
    "willingnessToPay": 8,
    "operationalSimplicity": 5
  },
  "marketplaceOpportunity": {
    "scalability": 10,
    "dataAdvantagePotential": 10,
    "defensibility": 8,
    "marketDemand": 7,
    "globalPotential": 7
  },
  "longTermDefensibility": {
    "defensibility": 18,
    "dataAdvantagePotential": 12,
    "competitiveAdvantage": 9,
    "retentionPotential": 6
  },
  "nontechnicalFounder": {
    "easeOfMvp": 10,
    "founderAccessibility": 12,
    "operationalSimplicity": 10,
    "lowStartupCost": 8,
    "regulatorySimplicity": 6
  },
  "technicalFounder": {
    "aiAutomationPotential": 9,
    "easeOfMvp": 6,
    "defensibility": 8,
    "dataAdvantagePotential": 8,
    "scalability": 7
  },
  "smallTeam": {
    "easeOfMvp": 7,
    "operationalSimplicity": 7,
    "scalability": 7,
    "easeOfDistribution": 6,
    "retentionPotential": 5
  },
  "littleCapital": {
    "lowStartupCost": 18,
    "speedToFirstRevenue": 8,
    "easeOfMvp": 7,
    "grossMarginPotential": 6
  },
  "highCapitalAvailable": {
    "marketDemand": 7,
    "revenuePotential": 12,
    "scalability": 12,
    "defensibility": 9,
    "globalPotential": 8
  }
}
```

## Sensitivity

See [`data/sensitivity-analysis.json`](../data/sensitivity-analysis.json). Rankings change when priorities change and must not be treated as objective truth.
