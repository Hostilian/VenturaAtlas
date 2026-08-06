# Completeness Audit

```json
{
  "auditDate": "2026-08-05",
  "sourceItemsInventoried": 12,
  "sourceItemsFullyReadableAsLocalBytes": 2,
  "sourceItemsPartiallyRenderedFromFileLibrary": 8,
  "sourceItemsFromModelSummary": 1,
  "rawIdeaMentions": 205,
  "canonicalIdeas": 60,
  "variantsAndSubIdeas": 145,
  "promptFiles": 1503,
  "ideaSpecificPrompts": 1500,
  "sourceRecords": 12,
  "rankingViews": 30,
  "knownGaps": [
    "No full verbatim export of the entire chat history was available as a local file.",
    "File Library reports could be rendered only in excerpts; their complete source URL tables could not be byte-copied.",
    "Current market, competitor, legal, API, and pricing claims were not newly researched for all 60 ideas.",
    "Financial values are transparent scenarios and assumptions, not sourced forecasts."
  ],
  "completenessClaim": "Incomplete with respect to unavailable verbatim corpus; complete with respect to the 60 canonical records and generated repository manifest."
}
```

## Interpretation

The repository does **not** claim a perfect transcript-level extraction. It preserves all recoverable canonical ideas from the earlier artifact, adds directly recoverable finalists and variants from the two August 2 research reports, records aliases and raw mentions, and identifies inaccessible source material. Exact completeness can only be established after importing a redacted full conversation export and original report files.
