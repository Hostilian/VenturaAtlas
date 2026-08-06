# Product Evidence API for Shopping Agents

> AI shopping agents pay per evidence-backed, human-verified product fact rather than relying on unverified merchant specs — a B2B API layer built on top of the FactBounty evidence corpus.

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `idea-068` |
| Target customer | AI shopping assistants, comparison engines, retailer Q&A systems, and AR fit applications needing machine-readable verified product facts |
| Problem | Shopping agents have catalog data (prices, specs) but lack physically verified facts (actual dimensions, compatibility proofs, revision status) — the exact data layer needed for confident autonomous purchase recommendations. |
| What to build | A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus. |
| How it makes money | Per-call pricing (€0.01–€0.10 per fact retrieval). Monthly subscription tiers (€99–€499/month + usage overage). Custom data partnerships with major shopping platforms. |
| Why customers pay | The customer pays because the product produces a faster, safer, more verifiable outcome than existing manual alternatives. |
| Earning potential | USD 0–0 annual scenario range; not a forecast |
| Startup cost | USD 0–200 scenario range |
| Time to MVP | 4–8 weeks (requires existing FactBounty corpus) |
| Time to first revenue | 30–90 days (after corpus threshold) |
| Profitability condition | Contribution margin per request/customer must exceed acquisition, infrastructure, and support costs. |
| Overall opportunity score | 85.7/100 |
| Confidence | 6/10 |
| Main advantage | Best software margins in the category; perfectly timed for agentic commerce protocol standardization; compounding value as corpus grows |
| Main risk | Empty API without corpus is worthless; protocol changes could shift the integration surface; major shopping platforms may build their own |
| Best next validation | undefined |

## Identity and Provenance

- **Canonical ID:** `idea-068`
- **Legacy ID:** `product-evidence-api-shopping-agents`
- **Slug:** `product-evidence-api-shopping-agents`
- **Category:** Product verification & evidence
- **Status:** researched
- **Tags:** API, shopping agents, B2B, agentic commerce, product data, infrastructure, Eighth Reset, high upside
- **Source references:** s01, s02, s03, s04, s05, s06, s07, s08, s09, s31, s32, s43
- **Provenance status:** undefined

AI shopping agents pay per evidence-backed, human-verified product fact rather than relying on unverified merchant specs — a B2B API layer built on top of the FactBounty evidence corpus. A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus.

## Customer Perspective

- **Primary Customer:** Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits
- **Economic Buyer:** Engineering or product teams integrating fact verification into shopping agents
- **Daily User:** Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits
- **Customer Type:** B2B, B2C, or marketplace participant depending on segment
- **Current Situation:** Customers currently rely on search engines, unverified reviews, manual research, or internal scripts.
- **Specific Problem:** No reliable, machine-readable, evidence-backed product fact API exists; agents must rely on unverified merchant-supplied data.
- **Frequency:** High-consideration purchase events
- **Pain And Cost:** Product return costs, wrong purchases, lost research time

### Current Alternatives
- Search engines
- Reddit / forum posts
- Retailer Q&A

## Product Definition

- **Core Proposition:** AI shopping agents pay per evidence-backed, human-verified product fact rather than relying on unverified merchant specs — a B2B API layer built on top of the FactBounty evidence corpus.
- **MVP Scope:** A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus.
- **Key Features:** Escrow payment; Challenge-code verification; Evidence repository
- **Tech Stack:** Vision AI pre-screening; OCR label extraction; Product graph matching

## Financial & Profitability Analysis

- **Revenue Streams:** Per-call pricing (€0.01–€0.10 per fact retrieval). Monthly subscription tiers (€99–€499/month + usage overage). Custom data partnerships with major shopping platforms.
- **Pricing Strategy:** Take rate on bounty escrow (15-20%) + Unlock fee (€1-€2)
- **Gross Margin:** 60–80% after scale
- **Break-even Point:** 8-34 paid requests per month

## Validation & Action Plan

- **Validation Method:** undefined
- **Metric Gate:** 5 paid requests out of 20 direct outreaches.
- **First Action:** Interview 15 target buyers who recently asked unanswered product questions.
- **Seven Day Plan:** None specified
- **Thirty Day Plan:** None specified

## Source References

- **s01**: x402 — Open HTTP Payment Standard (x402.org, 2026) - https://docs.x402.org/introduction
- **s02**: Under the Hood: Universal Commerce Protocol (UCP) (Google Developers Blog, 2026) - https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/
- **s03**: AP2 — Agent Payments Protocol Specification (AP2 Protocol, 2026) - https://ap2-protocol.org/ap2/specification/
- **s04**: AP2 donated to FIDO Alliance (Google Blog, 2026) - https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/
- **s05**: Powering Product Discovery in ChatGPT — Agentic Commerce (OpenAI, 2026) - https://openai.com/index/powering-product-discovery-in-chatgpt/
- **s06**: Google Shopping Cart — Universal Cart and Agentic Shopping (Google, 2026) - https://blog.google/products-and-platforms/products/shopping/google-shopping-cart/
- **s07**: Agentic Payments: From the Ground Up (Visa, 2026) - https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up
- **s08**: Gartner: Consumers Want AI Shopping Help But Not AI Purchase Decisions (Gartner, 2026-05-27) - https://www.gartner.com/en/newsroom/press-releases/2026-05-27-gartner-survey-finds-consumers-want-ai-shopping-help-but-not-ai-purchase-decisions
- **s09**: Own the Agentic Commerce Experience — NRF/IBM Consumer Study (NRF / IBM, 2026) - https://nrf.com/research/own-the-agentic-commerce-experience
- **s31**: Commercial Curated Data Products Can Command Meaningful Prices (arXiv, 2021) - https://arxiv.org/abs/2111.04427
- **s32**: eBay Developer Program — Marketplace APIs (eBay Developers, 2026) - https://developer.ebay.com/
- **s43**: Paying to Know: Microtransaction Markets for Verified Product Facts in Agentic Commerce (arXiv, 2026-06) - https://arxiv.org/abs/2606.24783

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-02).*
