# Public frontend instructions

- Missing data remains missing; do not infer validation, confidence, dates, source class, or scores from defaults or citation counts.
- Render network failure separately from a valid empty state.
- Do not label browser-local persistence as shared or real-time collaboration.
- A public action must persist a real state change, produce a useful export/navigation, or be labeled unavailable.
- Source and claim views must expose support, contradiction, freshness, provenance, and limitations without leaking internal data.
- Fix generators/source contracts rather than generated `_site/` files, then test the exact built artifact.
