# FactBounty — Buyer-Funded Product Proof Exchange

> Shoppers post a small bounty for one specific, objective piece of product evidence; a seller, verified owner, or local verifier provides guided visual proof and gets paid only when the checklist is complete.

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `idea-061` |
| Target customer | Online shoppers blocked by one specific, objective, unanswered product question |
| Problem | Product catalogs and reviews do not reliably answer precise physical questions: exact measurements, accessory fit, revision status, real-world installed behavior, or current local stock. |
| What to build | A browser-native, payment-gated evidence-request marketplace. Buyer posts question + bounty → responder records guided visual evidence using browser capture with random challenge code → human reviewer checks checklist → buyer pays only for complete evidence → reusable facts enter product-evidence graph. |
| How it makes money | Platform fee (20–35%) on each bounty payment. Unlock fee (€0.20–€1) for reusable fact access by future buyers. API subscription for shopping agents and retailers. Merchant-funded unanswered-question bounties. No inventory, no ads, no pre-funded worker pool. |
| Why customers pay | The customer pays because the product produces a faster, safer, more verifiable outcome than existing manual alternatives. |
| Earning potential | USD 0–0 annual scenario range; not a forecast |
| Startup cost | USD 0–100 scenario range |
| Time to MVP | 7–14 days (manual pilot) |
| Time to first revenue | 1–7 days (first paid request) |
| Profitability condition | Contribution margin per request/customer must exceed acquisition, infrastructure, and support costs. |
| Overall opportunity score | 91.2/100 |
| Confidence | 6.8/10 |
| Main advantage | Buyer pays before responder works; zero pre-funded inventory; reusable fact graph creates compounding value; perfectly timed for the agentic-commerce trust gap |
| Main risk | Marketplace may be trapped between questions too cheap to support moderation and questions valuable enough to carry liability. Biggest unresolved assumption: whether shoppers will pay €5 for one answer often enough to fund operations. |
| Best next validation | Find 10 buyers who have had a product question go unanswered in the past 30 days. Ask each to pay €5 for a one-question evidence request before any product is built. Count payments received, not interest expressed. |

## Identity and Provenance

- **Canonical ID:** `idea-061`
- **Legacy ID:** `factbounty-buyer-funded-product-proof-exchange`
- **Slug:** `factbounty-buyer-funded-product-proof-exchange`
- **Category:** Product verification & evidence
- **Status:** priority
- **Tags:** product evidence, buyer-funded, bounty, marketplace, verified facts, shopping agents, agentic commerce, consumer, EU, micro-payment, Eighth Reset, finalist, winner
- **Source references:** s08, s09, s11, s12, s13, s14, s15, s16, s17, s19, s21, s23, s25, s34, s35, s39, s40, s41, s42, s43, s45, s46, s47, s50
- **Provenance status:** undefined

Shoppers post a small bounty for one specific, objective piece of product evidence; a seller, verified owner, or local verifier provides guided visual proof and gets paid only when the checklist is complete. A browser-native, payment-gated evidence-request marketplace. Buyer posts question + bounty → responder records guided visual evidence using browser capture with random challenge code → human reviewer checks checklist → buyer pays only for complete evidence → reusable facts enter product-evidence graph.

## Customer Perspective

- **Primary Customer:** Online shoppers who need one specific, verifiable fact before a purchase decision
- **Economic Buyer:** The buyer who posts the bounty; secondarily merchants who fund unanswered questions
- **Daily User:** Buyer (posts request), responder (provides evidence), reviewer (human checker)
- **Customer Type:** B2B, B2C, or marketplace participant depending on segment
- **Current Situation:** Customers currently rely on search engines, unverified reviews, manual research, or internal scripts.
- **Specific Problem:** Exact physical facts (dimensions, fit, revision status, connector presence, package contents) are absent from or wrong in product listings, and reviews do not reliably fill the gap.
- **Frequency:** High — purchase decisions for electronics, furniture, accessories, and used goods regularly hit unanswered-question blockers. Estimated several times per month per active online shopper.
- **Pain And Cost:** Wrong purchases lead to returns, wasted shipping, and time loss. High-value purchases (camera gear, PC components, furniture) can involve €50–€500 at stake per question. Government research shows substantial consumer harm from bad product information [s11, s13].

### Current Alternatives
- Retailer Q&A (slow, often no response, sellers may not know)
- Forum searches (often outdated or not for exact revision)
- Seller direct messages (off-platform risk, no evidence)
- YouTube review videos (rarely test the exact configuration asked)
- Returning the item after purchase

## Product Definition

- **Core Proposition:** Shoppers post a small bounty for one specific, objective piece of product evidence; a seller, verified owner, or local verifier provides guided visual proof and gets paid only when the checklist is complete.
- **MVP Scope:** A static web form where a buyer submits: (1) product/listing URL, (2) one question, (3) required evidence template, (4) €5 payment via Stripe. The founder manually matches the request to a seller or known owner. The responder records browser-native video with a random code displayed. The founder reviews and releases payment. No mobile app, no automated matching, no API.
- **Key Features:** Bounty posting form (URL, question, evidence template, payment); Random-challenge code generation at capture start; Browser-native screen/camera capture (no file upload); Human review queue (founder initially); Evidence card display for buyer; Stripe Connect split payment (buyer → platform → responder); Refund flow for incomplete evidence; Reusable fact unlock (second buyer pays €0.20–€1 to access existing evidence)
- **Tech Stack:** Pre-screening evidence submissions for checklist completeness; Extracting structured fact data from visual evidence; Matching new questions to existing verified facts; Detecting staging patterns or inconsistencies

## Financial & Profitability Analysis

- **Revenue Streams:** Two-sided marketplace with platform fee on each transaction. Secondary: unlock fee for reusable facts, API subscription, merchant-funded questions.
- **Pricing Strategy:** Variable bounty set by buyer (€3–€20); platform takes 25–35%. Unlock fee: €0.20–€1 per access. API: pay-per-call or monthly subscription (added when corpus is large enough).
- **Gross Margin:** 60–80% at scale (marginal cost per fact decreases as graph grows; API delivery is near-zero marginal cost)
- **Break-even Point:** 8-34 paid requests per month

## Validation & Action Plan

- **Validation Method:** Find 10 buyers who have had a product question go unanswered in the past 30 days. Ask each to pay €5 for a one-question evidence request before any product is built. Count payments received, not interest expressed.
- **Metric Gate:** 30+ paid requests in 30 days, <20% refund rate, at least 3 buyers who would pay again
- **First Action:** Find 5 unanswered "Will it fit?" questions posted in the last 7 days on Reddit (/r/PCMasterRace, /r/ultralight, /r/MechanicalKeyboards) and contact the askers.
- **Seven Day Plan:** None specified
- **Thirty Day Plan:** None specified

## Source References

- **s08**: Gartner: Consumers Want AI Shopping Help But Not AI Purchase Decisions (Gartner, 2026-05-27) - https://www.gartner.com/en/newsroom/press-releases/2026-05-27-gartner-survey-finds-consumers-want-ai-shopping-help-but-not-ai-purchase-decisions
- **s09**: Own the Agentic Commerce Experience — NRF/IBM Consumer Study (NRF / IBM, 2026) - https://nrf.com/research/own-the-agentic-commerce-experience
- **s11**: Key Consumer Data — Online Shopping Problems (European Commission, 2026) - https://commission.europa.eu/strategy-and-policy/policies/consumers/consumer-protection-policy/key-consumer-data_en
- **s12**: Humans and LLMs Near Chance Detecting Fake Reviews (arXiv, 2025) - https://arxiv.org/abs/2506.13313
- **s13**: Fake Online Reviews Research — Executive Summary (UK Government, 2026) - https://www.gov.uk/government/publications/investigating-the-prevalence-and-impact-of-fake-reviews/fake-online-reviews-research-executive-summary
- **s14**: How Q&A Boosts Shoppers' Confidence — Verified Buyer Answer Sources (PowerReviews, 2026) - https://www.powerreviews.com/research/how-qa-boosts-shoppers-confidence-and-conversion-rates/consumers-assumptions-and-perceptions-about-different-qa-answer-sources/
- **s15**: Seller Messages Show Existing Product Data Often Doesn't Answer Purchase-Critical Questions (arXiv, 2024) - https://arxiv.org/abs/2401.09785
- **s16**: StockX — Item Verification Pricing ($12.50) (StockX, 2026) - https://stockx.com/help/articles/can-i-get-my-listings-purchase-verified-by-stockx
- **s17**: Vinted Czechia — Electronics Verification Service (Vinted, 2026) - https://www.vinted.cz/help/3/1361-vendre-avec-le-service-de-verification-du-materiel-electronique
- **s19**: SnapProof — Capture-Time Hashing and Timestamps (SnapProof, 2026) - https://getsnapproof.com/
- **s21**: CheckMEND — Consumer Pays €2.50 for Device History Reports (CheckMEND, 2026) - https://www.checkmend.com/eu/consumer/checking
- **s23**: RentAHuman — YC-Backed AI-to-Human Task Marketplace (Y Combinator, 2026) - https://www.ycombinator.com/companies/rentahuman
- **s25**: Human-Task Marketplaces: Fraud, Identity, and Abuse Classes (arXiv, 2026) - https://arxiv.org/abs/2602.19514
- **s34**: Votiq — Crowdfunded Feature Requests (Votiq, 2026) - https://votiq.io/
- **s35**: Reddit: Buyer-First Marketplaces Fail When Buyers Can Go Elsewhere (Reddit r/SaaS, 2026) - https://www.reddit.com/r/SaaS/comments/1udr3ki/what_if_a_marketplace_started_with_demand_instead/
- **s39**: Stripe Connect — Czech Standard European Card Pricing (1.5% + CZK 6.50) (Stripe, 2026) - https://stripe.com/en-cz/connect/pricing
- **s40**: Czech CTU — DSA Applies to Online Platforms, Small Firms Exempt from Many Duties (Czech Telecommunication Office (CTU), 2026) - https://ctu.gov.cz/en/european-digital-services-act-dsa
- **s41**: Czech CTU — DSA Illegal-Content Notice and Liability Rules (Czech Telecommunication Office (CTU), 2026) - https://ctu.gov.cz/en/what-dsa
- **s42**: European Commission — DSA FAQs: Online Intermediaries and Platforms (European Commission, 2026) - https://digital-strategy.ec.europa.eu/en/faqs/digital-services-act-questions-and-answers
- **s43**: Paying to Know: Microtransaction Markets for Verified Product Facts in Agentic Commerce (arXiv, 2026-06) - https://arxiv.org/abs/2606.24783
- **s45**: Czech Public Administration Portal — Electronic Trade Registration (CZK 800) (Czech Public Administration Portal, 2026) - https://portal.gov.cz/en/sluzby-vs/establishing-a-trade-licence-S757
- **s46**: Swappa — Random-Code Verification Photos and Device Checks (Swappa, 2026) - https://swappa.com/about/verification
- **s47**: How Consumers Ask and Answer Product Questions — PowerReviews Survey (PowerReviews, 2026) - https://www.powerreviews.com/research/how-qa-boosts-shoppers-confidence-and-conversion-rates/how-consumers-ask-and-answer-questions-qa/
- **s50**: Reliability and Subjectivity in Product Q&A — Survey (arXiv, 2023) - https://arxiv.org/abs/2302.08092

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-02).*
