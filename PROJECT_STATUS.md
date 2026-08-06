# PROJECT STATUS

- Repository version: 2.1.0
- Data schema version: 2.0.0
- Completed generated files: 2017
- Remaining generated files: 0
- Validation status: **in progress** — schema and data integration checks in progress after Eighth Reset integration
- Browser rendering smoke: 70 cards expected; 60 cards previously verified in headless browser
- Known gaps: full verbatim transcript and complete File Library byte streams unavailable; Markdown dossier files for ideas 061–070 not yet generated; 25-prompt packs for 061–070 not yet generated
- Last completed idea ID: idea-070
- Next idea ID: idea-071
- Canonical ideas: 70 (+10 from Eighth Reset on 2026-08-06)
- Categories: 29 (new: "Product verification & evidence" with 10 ideas)
- Raw mentions/variants: 215+
- Prompt index records: 1500 (ideas 061–070 prompt packs TODO)
- Generated ranking views: 30 (TODO: add Eighth Reset tournament ranking view)
- Preserved original research decision sets: 3 (+1: Eighth Reset summary at research/original-chat/eighth-reset-summary.md)
- Source records: 62 (+50 Eighth Reset sources S01–S50)
- Validation warnings: 0
- Last updated: 2026-08-06

## Change Log

### 2026-08-06: Eighth Reset Integration (v2.0.0 → v2.1.0)
- Added 10 new canonical ideas (idea-061 through idea-070) from the Deep Research Eighth Full Reset
  - Winner: FactBounty — Buyer-Funded Product Proof Exchange (idea-061, score: 91.2)
  - Runner-up: MeasureGraph — Exact Dimensions Evidence Network (idea-062, score: 85.4)
  - Finalists: Compatibility Bounties (063), Verified Owner Answers (064), Local Shelf Proof (065),
    Revision & Variant Proof Registry (066), Real-World Noise Facts (067),
    Product Evidence API (068), Receipt Data Exchange (069), Seller ProofLink (070)
- Added 50 source records (S01–S50) from the Eighth Reset research
- Added "Product verification & evidence" category to categories.json
- Overhauled CSS from minified one-liner to fully structured premium design system (Inter font, HSL tokens, dark/light modes)
- Rewrote index.html from minified one-liner to semantic, readable HTML with rich hero section
- Rewrote site.js from minified one-liner to structured engine with:
  - Score color coding (green ≥80, yellow 60–79, red <60)
  - Animated count-up for metrics
  - Keyboard shortcuts (/ for search, D for dark mode)
  - Feature strips (fastest revenue, lowest cost)
  - Improved card renderer, compare table, rankings, prompts, sources renderers
- Fixed compare.html duplicate ID bug (four identical id="compareSelect" → data-compare-select attributes)
- Rewrote sources.html to use dynamic rendering (site.js initSources())
- Added .nojekyll file to prevent GitHub Pages Jekyll processing of JSON files
- Created research/original-chat/eighth-reset-summary.md (research archive)
- Created scripts/append-eighth-reset-ideas.js (one-time migration script, idempotent)

