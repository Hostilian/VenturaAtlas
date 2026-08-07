# Deep Research — Eighth Full Reset

**Research session date:** 2026-08-02  
**Research methodology:** 12-round tournament with elimination scoring  
**Starting pool:** 60 candidate product-proof business ideas  
**Final winner:** FactBounty — Buyer-Funded Product Proof Exchange (`idea-061`)  
**Source citations:** 50 (S01–S50)  

---

## Research Context

This research session was conducted under a strict "Zero-Dollar Startup" constraint:

- **Capital budget:** $0–$100 (founder must be operational before spending)
- **Founder location:** Czech Republic (EU)
- **Timeline:** Must reach first revenue within 1–12 months
- **Exclusions:** No physical products requiring inventory, no businesses requiring regulatory approval before first revenue, no models requiring significant pre-funding of the worker supply side

The research mandate was to find one business that:
1. Is "different" — not derivative or incremental
2. Is "better" — has a structural advantage over current alternatives
3. Has verifiable demand signals (not just interest)
4. Has an identifiable path to first payment within days of launch

---

## Research Methodology

The session ran 12 sequential rounds:

| Round | Activity |
|---|---|
| 1 | Market context: agentic commerce protocol landscape (x402, UCP, AP2, OpenAI shopping, Visa, Gartner) |
| 2 | Consumer trust and verification landscape |
| 3 | Evidence of the problem: fake reviews, product Q&A gaps, government consumer harm data |
| 4 | Initial candidate pool generation (60 ideas) |
| 5 | Unit economics and pricing precedent research |
| 6 | Legal and compliance research (DSA, Czech law, Stripe) |
| 7 | Competitor deep-dive for top 10 candidates |
| 8 | Counter-arguments and failure modes |
| 9 | Scoring pass 1: weighted scoring matrix |
| 10 | Scoring pass 2: CEO-level scrutiny with adjustments |
| 11 | Financial modeling for 3 scenarios per top candidate |
| 12 | Final risk audit and winner selection |

---

## Key Research Findings

### The Core Market Opportunity

AI shopping agents and consumers face the same problem: product catalog data and reviews do not reliably answer precise, objective, physical questions. This gap creates a market for **buyer-funded product fact verification.**

Supporting evidence:
- 41% of consumers use AI for product research; 33% use it for reviews [S09]
- Only 11% would delegate purchase decisions to AI [S08]
- 67% of shoppers have asked a product question; 57% expect an answer within 24h [S47]
- Fake reviews estimated at 11–15% in studied categories [S13]
- UK government study found substantial consumer harm from bad product information [S13]
- EU Commission data confirms widespread fake reviews and online shopping scams [S11]

### The Agentic Commerce Timing Signal

All major tech/payments companies announced agentic commerce infrastructure in 2026:
- **Google**: Universal Commerce Protocol (UCP) [S02], Google Shopping Cart [S06]
- **Google Pay**: Agent Payments Protocol (AP2), donated to FIDO Alliance [S04]
- **OpenAI**: Product discovery in ChatGPT [S05]
- **Stripe**: x402 HTTP payment standard [S01]
- **Visa**: Agentic Payments report [S07], Earning Trust consumer survey [S10]

This convergence creates a narrow window where a verified product-fact infrastructure can establish a position before the market consolidates.

### Financial Model Summary (FactBounty Winner)

| Scenario | Monthly requests | Avg bounty | Platform revenue | Gross profit |
|---|---|---|---|---|
| Survival | 50 | €5 | €75 | €57 |
| Strong | 500 | €8 | €1,200 | €1,020 |
| Exceptional | 5,000 | €11 | €15,400 | ~€13,600 |

**Break-even:** ~8 paid requests/month to cover hosting. ~34 requests/month to cover 1 hour founder time.

### The 10 Finalist Candidates

| Rank | Idea | Score | Key factor |
|---|---|---|---|
| 1 | FactBounty — Buyer-Funded Product Proof Exchange | 91.2 | Winner — fastest to revenue, best data moat, zero pre-funding |
| 2 | MeasureGraph — Exact Dimensions Evidence Network | 85.4 | Safest/lowest liability; lower bounty value |
| 3 | Compatibility Bounties | 84.2 | Higher bounty value; safety complexity |
| 4 | Verified Owner Answers — Cross-Retailer Q&A | 82.1 | Strong concept; free alternatives exist |
| 5 | Local Shelf Proof — Real-Time Retail Stock Evidence | 78.3 | Strong shopping-agent demand; cold-start challenge |
| 6 | Revision & Variant Proof Registry | 80.1 | Most resilient data asset; slower monetization |
| 7 | Real-World Noise & Clearance Facts | 72.5 | Best as FactBounty template, not standalone |
| 8 | Product Evidence API for Shopping Agents | 85.7 | Highest upside; requires corpus first |
| 9 | Receipt-Verified Purchase Data Exchange | 68.3 | High privacy risk; low consumer WTP |
| 10 | Seller ProofLink — Guided Listing Verification | 74.2 | Crowded market; best as FactBounty complement |

---

## The Winner: FactBounty

**One sentence:** A buyer posts a small bounty for one specific, objective piece of product evidence; a verified owner records challenge-code visual proof; the buyer pays only when the checklist is complete.

**Why it won:**

1. **Zero pre-funding required** — payment flows from buyer before responder is paid; no inventory, no pre-funded worker pool
2. **First revenue possible in hours** — a static HTML form + Stripe Checkout is the entire MVP
3. **Data moat that compounds** — every verified fact becomes a reusable asset that future buyers can unlock
4. **Perfectly timed** — agentic commerce protocols standardizing in 2026 create immediate API demand
5. **Czech/EU legal path is clear** — DSA small-firm exemptions apply; Czech trade license is €35; Stripe Connect pricing is known

**Most important unvalidated assumption:** Whether shoppers will pay €3–€20 for a single verified fact often enough to sustain a responder network.

**Required validation test:** Contact 10 people who have had a product question go unanswered. Ask them to pay €5 for a one-question evidence request before any product is built. Count payments received, not interest expressed.

---

## Source Quality Assessment

| Level | Count | Examples |
|---|---|---|
| High confidence (primary data) | 18 | Gartner survey, NRF/IBM study, UK government, Czech CTU guidance, Stripe pricing, StockX pricing |
| Medium confidence (secondary/vendor) | 24 | PowerReviews surveys, arXiv preprints, startup websites, adjacent competitor data |
| Low confidence (anecdotal) | 4 | Reddit discussions, forum posts |
| Competitor (no independent traction data) | 4 | VidVerity, Groundtruth, BackingX, Votiq |

**Critical caveat:** The arXiv paper "Paying to Know" (S43) independently proposes a similar concept. This is conceptual validation only — NOT evidence that FactBounty will succeed commercially. It is a preprint, not peer-reviewed research.

---

## Completeness Status

This research session is **fully processed** and integrated into the repository:

- ✅ All 10 finalist ideas added as `idea-061` through `idea-070` in `data/ideas.json`
- ✅ All 50 sources (S01–S50) added to `data/sources.json`
- ✅ `data/categories.json` updated with "Product verification & evidence" category (10 ideas)
- ✅ Research archive created at `research/original-chat/eighth-reset-summary.md` (this file)
- ⚠️ Individual Markdown dossier files for ideas 061–070 not yet created (TODO: generate from JSON)
- ⚠️ 25-prompt packs for ideas 061–070 not yet generated (TODO)
- ⚠️ Rankings JSON not yet updated with Eighth Reset tournament results (TODO)

---

## Key Regulatory Notes

All applicable to FactBounty (idea-061) specifically:

- **DSA**: Czech online intermediaries must implement notice-and-action; micro/small firms exempt from many additional VLOP duties [S40, S41, S42]
- **Czech trade license**: CZK 800 (~€35) for electronic trade registration [S45]
- **Stripe Connect**: 1.5% + CZK 6.50 per Czech-market card transaction [S39]
- **GDPR**: Evidence submissions may contain incidental personal data; clear privacy policy required
- **VAT**: Czech VAT registration threshold applies; obtain legal advice before cross-border EU sales

**This is not legal advice. Consult a Czech legal professional before launching.**
