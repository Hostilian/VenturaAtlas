# Data Model

`data/ideas.json` is canonical. Every record has stable ID/slug, identity/provenance, at-a-glance summary, customer, product, future-AI build spec, profitability and three scenarios, earning potential, market, validation, GTM, operations, risks, action plan, 25 score records, composite scores, assumptions, unknowns, evidence, timestamps, and relationships. Unknown values are explicit rather than fabricated.

`data/idea-taxonomy.json` is a deterministic browsing projection over the canonical records. It assigns every idea one normalized market family, one primary venture pattern, a buyer segment, a positioning summary, and five nearest portfolio neighbors. Original `category` and `subcategory` values remain unchanged for provenance. Taxonomy similarity is not identity, deduplication, market validation, or ranking authority; exact normalized-name matches are surfaced as potential duplicates for review.
