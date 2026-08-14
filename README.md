# Venture Atlas OS

A static, dependency-light GitHub Pages repository that turns fragmented research into a transparent opportunity database, startup research library, product-building playbook, and AI venture studio operating system.

## Current inventory

<!-- BEGIN GENERATED CURRENT INVENTORY -->
- **294 canonical ideas** (0 staged, 294 total)
- **122 categories**
- **301 source inventory records**
- **4,425 idea-specific prompts** plus master prompts
- **382 dossier files** (includes orphan/legacy records; not a one-to-one completeness claim)
- **60/294 financial models**, **60/294 validation plans**, **60/294 technical blueprints**, and **60/294 launch plans**
- **4,425 idea-specific prompt files**; per-idea pack completeness is not asserted
<!-- END GENERATED CURRENT INVENTORY -->

## What the site supports

Search, category/status filters, sorting, card/table/compact views, favorites, recently viewed records, comparison, ranking views, relationship map, shareable query parameters, JSON/CSV downloads, dark/light mode, print layouts, keyboard navigation, and a no-JavaScript path to Markdown/CSV.

## Evidence and limitations

The repository distinguishes source facts, user claims, analyst interpretations, assumptions, projections, and unknowns. It **does not claim a perfect chat-history extraction**: the earlier artifact had only seven files, a complete verbatim transcript was unavailable, and several File Library reports were accessible only through truncated rendered views. See [`research/completeness-audit.md`](research/completeness-audit.md).

Scores are decision-support tools, not guarantees. Revenue ranges are scenarios, not promises. Market conditions change. Users must perform independent financial, legal, technical, tax, security, privacy, and market due diligence.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

Validation:

```bash
npm test
npm run validate
npm run check-js
npm run check-links
```

## Deploy to GitHub Pages

1. Create a repository and copy this directory to its root.
2. Commit and push to `main`.
3. Open **Settings → Pages** and choose **GitHub Actions**.
4. Run **Validate and deploy Pages** or push to `main`.
5. Edit `sitemap.xml` to replace `USERNAME/REPOSITORY`.

The workflow validates data, JavaScript, links, and smoke tests before deployment. No paid hosting or server is required.

## Update data

- Canonical records: [`data/ideas.json`](data/ideas.json)
- JSON Schema: [`data/ideas.schema.json`](data/ideas.schema.json)
- Extraction ledger: [`data/extraction-ledger.json`](data/extraction-ledger.json)
- Sources: [`data/sources.json`](data/sources.json)
- Scores: [`research/scoring-methodology.md`](research/scoring-methodology.md)
- Add an idea: [`docs/ADDING_AN_IDEA.md`](docs/ADDING_AN_IDEA.md)

## Structure

```text
assets/                 CSS and JavaScript
data/                   canonical JSON, CSV, schema, rankings, sources, prompts, relationships
ideas/                  one full dossier per canonical idea
categories/             category indexes
rankings/               30 reproducible ranking views
prompts/                master and 25-per-idea prompt library
research/               methodology, source log, assumptions, completeness audit, archive gaps
financial-models/       compact financial model per idea
validation-plans/       validation plan per idea
technical-blueprints/   future-AI implementation blueprint per idea
launch-plans/           GTM and action plan per idea
docs/                   visitor-facing static pages and maintenance documentation
scripts/                generator, validation, search, ranking and link scripts
tests/                  smoke tests
.github/workflows/       pull-request validation and Pages deployment
```

## Contributing and licence

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and the MIT [`LICENSE`](LICENSE). Report factual errors or missing variants through an issue with source/provenance details.


<!-- BEGIN GENERATED REPOSITORY STATS -->
- Repository Version: 2.3.0
- Canonical Ideas: 294
- Staged Ideas: 0
- Total Ideas: 294
- Categories: 122
- Source References: 301
- Generated Prompts: 4425
- Last Updated: 2026-08-14
<!-- END GENERATED REPOSITORY STATS -->
