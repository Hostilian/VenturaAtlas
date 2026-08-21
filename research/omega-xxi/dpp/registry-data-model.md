# DPP registry data model

Status: **conceptual extraction; official production API/schema not asserted**

Minimum conceptual entities implied by ESPR include product identifier, economic-operator identifier, facility identifier, data-carrier reference, DPP service-provider reference, and backup-provider reference where applicable. Exact fields, cardinalities, validation rules, and public API contracts must come from current Commission registry specifications.

```text
ProductIdentifier
  -> EconomicOperatorIdentifier
  -> FacilityIdentifier[]
  -> DataCarrierReference
  -> PassportEndpoint
  -> PrimaryServiceProvider?
  -> BackupServiceProviderReference?
  -> ProductGroupDelegatedAct
```

Unknowns: production endpoint, authentication, write authority, update semantics, deletion, version history, bulk limits, availability SLA, and registry/passport consistency rules.

Sources:

- https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/dpp-registry_en
- https://eur-lex.europa.eu/eli/reg/2024/1781/oj

