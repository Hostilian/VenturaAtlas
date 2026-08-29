# Venture Atlas OS

A static, dependency-light GitHub Pages repository that turns fragmented research into a transparent opportunity database, startup research library, product-building playbook, and AI venture studio operating system.

## Current inventory

<!-- BEGIN GENERATED CURRENT INVENTORY -->
- **324 canonical ideas** (0 staged, 324 total)
- **144 categories**
- **344 source inventory records**
- **555 research proposal rows** across **30 recoverable rounds**; weak, rejected, duplicate, and related rows remain visible
- **4,625 idea-specific prompts** plus master prompts
- **432 dossier files** (includes orphan/legacy records; not a one-to-one completeness claim)
- **324/324 financial models**, **326/324 validation plans**, **324/324 technical blueprints**, and **324/324 launch plans**
- **4,625 idea-specific prompt files**; per-idea pack completeness is not asserted
<!-- END GENERATED CURRENT INVENTORY -->

## What the site supports

Search across normalized market families, venture patterns, buyers, and original categories; filter and sort by similarity or distinctiveness; inspect potential duplicates; compare positioning side by side; and explore five integrated venture operating labs:
- **TERRAIN (Problem Atlas — `docs/terrain.html`):** Map real-world customer workflows, jobs-to-be-done, operational frictions, and current workarounds before evaluating solution ideas.
- **CENSUS (Market Measurement Lab — `docs/census-lab.html`):** Construct defensible denominators, statistical units, population funnels (Universe → Eligible → Exposed → Affected), and anti-TAM-theater uncertainty bounds.
- **ORBIT (Portfolio Lab — `docs/portfolio-lab.html`):** Compose bounded venture portfolios, evaluate Pareto frontiers, calibrate Brier score forecasting accuracy, and model multi-lens founder resource envelopes.
- **MERCURY (GTM / Commercial Lab — `docs/mercury.html`):** Test buyer triggers, pricing hypotheses, evidence ladder maturity, objection taxonomies, and cryptographic commercial receipts.
- **RELAY (Ops Lab — `docs/ops-lab.html`):** Model fulfillment workflows across 5 archetypes, detect capacity bottlenecks, calculate cost-to-serve, and manage quality/CAPA lifecycles.
- **CONSTELLATION (Org Lab — `docs/org-lab.html`):** Map 10 capability domains, define non-overlapping decision rights, resolve founder bottlenecks, and validate hiring case ROI.
- **CAPITAL (Capital Lab — `docs/capital-lab.html`):** Model cap table dilution (SAFE vs. priced equity), manage investor pipeline stages, evaluate data room readiness, and track macro EU regulatory capital clocks.

The site also provides card/table/compact views, favorites, rankings, relationship maps, shareable queries, JSON/CSV downloads, dark mode, print layouts, keyboard navigation, a live background-progress dashboard, and a no-JavaScript Markdown/CSV path.

## Evidence and limitations

The repository distinguishes source facts, user claims, analyst interpretations, assumptions, projections, and unknowns. It **does not claim a perfect chat-history extraction**: the earlier artifact had only seven files, a complete verbatim transcript was unavailable, and several File Library reports were accessible only through truncated rendered views. See [`research/completeness-audit.md`](research/completeness-audit.md).

Scores are decision-support tools, not guarantees. Revenue ranges are scenarios, not promises. Market conditions change. Users must perform independent financial, legal, technical, tax, security, privacy, and market due diligence.

## Run locally

```bash
npm ci
python -m pip install --disable-pip-version-check -r services/ventureatlas-worker/requirements.txt
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

The Python requirements are needed for the complete `npm run quality:source`
chain, including worker contract tests. `npm ci` alone only installs the
Node.js dependencies.

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
ideas/                  legacy and supporting Markdown dossiers; coverage is not one-to-one
categories/             category indexes
rankings/               30 reproducible ranking views
prompts/                master prompts and partially covered idea-specific prompt packs
research/               methodology, source log, assumptions, completeness audit, archive gaps
financial-models/       compact financial models for a subset of ideas
validation-plans/       validation plans for a subset of ideas
technical-blueprints/   implementation blueprints for a subset of ideas
launch-plans/           GTM and action plans for a subset of ideas
docs/                   visitor-facing static pages and maintenance documentation
scripts/                generator, validation, search, ranking and link scripts
tests/                  smoke tests
.github/workflows/       pull-request validation and Pages deployment
```

## Contributing and licence

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and the MIT [`LICENSE`](LICENSE). Report factual errors or missing variants through an issue with source/provenance details.


<!-- BEGIN GENERATED REPOSITORY STATS -->
- Repository Version: 2.7.1
- Canonical Ideas: 324
- Staged Ideas: 0
- Total Ideas: 324
- Categories: 144
- Source References: 344
- Generated Prompts: 4625
- Last Updated: 2026-08-27
<!-- END GENERATED REPOSITORY STATS -->
