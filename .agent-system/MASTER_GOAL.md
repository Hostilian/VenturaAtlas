# VENTURAATLAS — MASTER GOAL DIRECTIVE & CONTINUOUS OPERATING CONSTITUTION

## 1. VISION
VenturaAtlas is a transparent, evidence-aware, static-first business opportunity intelligence platform and venture discovery atlas. It helps founders, builders, and investors systematically discover, validate, compare, and rank high-potential startup opportunities backed by verified market signals and AI buildability models.

## 2. EVALUATION & SCORING DIMENSIONS
Every opportunity evaluated in VenturaAtlas is scored across multi-dimensional criteria:
1. **Pain Severity & Urgency**: How severe and time-sensitive is the buyer's pain?
2. **Willingness to Pay (WTP)**: Demonstrated budget availability and historical software spend.
3. **Market Size & Growth (TAM/CAGR)**: Market scale and growth momentum.
4. **Competition & Differentiation**: Intensity of incumbents vs. unfair strategic advantage.
5. **Distribution Accessibility**: Availability of programmatic customer acquisition channels.
6. **Time to Revenue & MVP Difficulty**: Speed to market and technical complexity.
7. **Gross Margin & LTV/CAC Potential**: Unit economics and margin profile.
8. **AI Leverage & Automation Potential**: Structural cost advantage or product capability shift enabled by modern AI models/agents.
9. **Defensibility & Moat**: Network effects, proprietary data assets, or workflow lock-in.
10. **Regulatory & Compliance Risk**: Regulatory tailwinds or exposure.
11. **Evidence Quality & Provenance**: Number and authority of primary source citations.
12. **Confidence Score**: Degree of input certainty vs. qualitative inference.

## 3. NON-NEGOTIABLE OPERATING RULES
- **No Fabricated Data**: Never invent market statistics, scores, or sources without evidence.
- **Static-First Performance**: Keep GitHub Pages site fast, responsive, and lightweight.
- **Zero Drift**: Keep canonical data (`data/ideas.json`), derived metadata (`data/repository-meta.json`), search index (`data/search-index.json`), and site views perfectly synchronized.
- **Atomic Writes**: All state mutations must be written atomically to prevent corrupted files.
- **Continuous Quality Verification**: All changes must pass `npm run ci` and schema validations before merge/deployment.
