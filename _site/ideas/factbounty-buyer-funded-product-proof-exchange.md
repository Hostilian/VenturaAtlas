# FactBounty — Buyer-Funded Product Proof Exchange

> Shoppers post a small bounty for one specific, objective piece of product evidence; a seller, verified owner, or local verifier provides guided visual proof and gets paid only when the checklist is complete.

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `idea-061` |
| Target customer | Online shoppers blocked by one specific, objective, unanswered product question |
| Problem | Exact physical facts (dimensions, fit, revision status, connector presence, package contents) are absent from or wrong in product listings, and reviews do not reliably fill the gap. |
| What to build | A browser-native, payment-gated evidence-request marketplace. Buyer posts question + bounty → responder records guided visual evidence using browser capture with random challenge code → human reviewer checks checklist → buyer pays only for complete evidence → reusable facts enter product-evidence graph. |
| How it makes money | Platform fee (20–35%) on each bounty payment. Unlock fee (€0.20–€1) for reusable fact access by future buyers. API subscription for shopping agents and retailers. Merchant-funded unanswered-question bounties. No inventory, no ads, no pre-funded worker pool. |
| Why customers pay | The customer pays because a €5 evidence request costs far less than a wrong purchase, a return, or hours of manual research. Evidence-backed facts also remove the trust gap that synthetic reviews and AI summaries cannot close. |
| Earning potential | USD scenario range; not a forecast |
| Startup cost | [object Object] |
| Time to MVP | 7–14 days (manual pilot) |
| Time to first revenue | 1–7 days (first paid request) |
| Profitability condition | At least 50 paid requests per month at average €5, with <40% refund rate and <2 hours of manual moderation per day. Monthly break-even (founder): 50 requests × (€5 × 30% platform share) = €75 gross margin ÷ ~€10 variable cost = positive from request 34. |
| Overall opportunity score | 91.2/100 |
| Confidence | 6.8/10 |
| Main advantage | Buyer pays before responder works; zero pre-funded inventory; reusable fact graph creates compounding value; perfectly timed for the agentic-commerce trust gap |
| Main risk | Marketplace may be trapped between questions too cheap to support moderation and questions valuable enough to carry liability. Biggest unresolved assumption: whether shoppers will pay €5 for one answer often enough to fund operations. |
| Best next validation | Interview 15 target buyers about the last occurrence and ask for a paid pilot. |

## Identity and Provenance

- **Canonical ID:** `idea-061`
- **Legacy ID:** `factbounty`
- **Slug:** `factbounty-buyer-funded-product-proof-exchange`
- **Category:** Product verification & evidence
- **Status:** priority
- **Tags:** product evidence, buyer-funded, bounty, marketplace, verified facts, shopping agents, agentic commerce, consumer, EU, micro-payment, Eighth Reset, finalist, winner
- **Alternative names:** FactBounty, Buyer-Funded Product Proof Exchange, Product Fact Exchange, Evidence Bounty Marketplace
- **Source references:** , , , , , , , , , , , , , , , , , , , , , , , 
- **Provenance status:** Direct from Deep Research Eighth Full Reset (2026-08-06)

Product catalogues contain prices and specifications. Reviews contain opinions. Neither reliably answers specific, objective, physical questions. FactBounty is a marketplace for one thing: buyer-specified, visually evidenced product facts. It is not a review site, a resale verification service, or a general gig platform. The founding product is a manual, browser-based €5 proof-request exchange for "Will it fit?" and exact-measurement questions. Long-term, verified facts become reusable assets that future buyers unlock for €0.20–€1 and that shopping agents can access via a paid API.


## Customer Perspective

- **Primary Customer:** Online shoppers who need one specific, verifiable fact before a purchase decision

- **Economic Buyer:** The buyer who posts the bounty; secondarily merchants who fund unanswered questions

- **Daily User:** Buyer (posts request), responder (provides evidence), reviewer (human checker)

- **Customer Type:** consumer, marketplace participant

- **Current Situation:** Shoppers encounter a product page that does not answer their specific question. They search forums, post Q&As, contact sellers, or abandon the purchase. 67% have asked a product-page question; 57% expected an answer within 24 hours [s47].

- **Specific Problem:** Exact physical facts (dimensions, fit, revision status, connector presence, package contents) are absent from or wrong in product listings, and reviews do not reliably fill the gap.

- **Frequency:** High — purchase decisions for electronics, furniture, accessories, and used goods regularly hit unanswered-question blockers. Estimated several times per month per active online shopper.

- **Pain And Cost:** Wrong purchases lead to returns, wasted shipping, and time loss. High-value purchases (camera gear, PC components, furniture) can involve €50–€500 at stake per question. Government research shows substantial consumer harm from bad product information [s11, s13].

### Current Alternatives
- Retailer Q&A (slow, often no response, sellers may not know)
- Forum searches (often outdated or not for exact revision)
- Seller direct messages (off-platform risk, no evidence)
- YouTube review videos (rarely test the exact configuration asked)
- Returning the item after purchase

- **Alternative Gaps:** Alternatives may be fragmented, generic, difficult to verify, or disconnected from the customer's exact workflow.

### Jobs To Be Done

- **Functional:** Get verified, objective, physical evidence for a specific product before purchase.

- **Emotional:** Feel confident that the purchase decision is right, not based on unverified claims.

- **Social:** Demonstrate evidence-backed decision-making to peers, partners, or colleagues.

- **Desired Outcome:** A reliable result with less time, lower risk, and clear evidence of what happened.

### Trust Requirements
- Random challenge code in every recording (proves live capture)
- Browser-native capture (no uploaded files)
- Human reviewer confirmation before payment releases
- Clear limitations statement (timestamps ≠ authenticity)
- Refund policy for incomplete or irrelevant evidence

### Rejection Reasons
- Cheap enough to just buy and return
- Question can be answered free by specs or an existing review
- Bounty seems too small to attract a responder quickly
- Distrust that the responder has the exact item

### Switch Reasons
- One paid answer saves more than the bounty cost
- Reusable fact is already in the database for €0.20
- Faster than the current workaround

### Continuing Payment Reasons
- Each purchase decision can generate a new question
- The unlock model means repeat buyers pay less over time
- Habit: shoppers who have used it once trust it for the next purchase

### Measurable Value
- Avoided return cost
- Time saved vs manual research
- Decision confidence

### Acquisition Channels
- Unanswered product questions in Amazon Q&A, Reddit product communities
- SEO on "Will X fit Y?" queries
- Browser extension on product pages
- Small brand merchant partnerships
- Shopping-agent developer integrations

### Objections
- Why pay when I can ask the seller for free?
- How do I know the responder has my exact model?
- What if the answer arrives too late?
- What if the photo is staged?

### Retention Drivers
- Growing reusable fact database reduces cost of future answers
- Positive experience on first paid request
- Habit formation for high-consideration purchases

### Churn Risks
- Question is answered free elsewhere
- Slow responder network
- Bad answer experience without easy refund

- **Customer Pays Because:** Not yet specified

- **Idea Satisfies Customer By:** Not yet specified

## Product Definition

- **Product Type:** Two-sided marketplace with evidence-capture protocol

- **User Experience:** Minimalist web form for posting bounties + mobile verification portal for responders

### Main Workflow
- Buyer posts bounty -> Responder submits proof -> Buyer approves -> Escrow releases

### Core Features
- Bounty posting form (URL, question, evidence template, payment)
- Random-challenge code generation at capture start
- Browser-native screen/camera capture (no file upload)
- Human review queue (founder initially)
- Evidence card display for buyer
- Stripe Connect split payment (buyer → platform → responder)
- Refund flow for incomplete evidence
- Reusable fact unlock (second buyer pays €0.20–€1 to access existing evidence)

### Supporting Features
- Notification system
- Dispute resolution
- SEO graph

### Admin Features
- Moderation queue
- Fraud monitoring
- Payment reconciliation

### Integrations
- Stripe Connect
- Google Vision AI
- Shopping agent APIs

### Ai Capabilities
- Pre-screening evidence submissions for checklist completeness
- Extracting structured fact data from visual evidence
- Matching new questions to existing verified facts
- Detecting staging patterns or inconsistencies

### Non Ai Capabilities
- Stripe escrow
- Auth0 / Auth
- Storage bucket hosting

### Security Requirements
- least privilege access for all roles
- encrypted transport (HTTPS/TLS everywhere)
- secret management (environment variables, not hardcoded)
- input validation and output schema enforcement
- dependency audits and security update cadence
- audit logs for consequential actions

### Privacy Requirements
- data minimization (collect only what is needed for the transaction)
- purpose limitation (no repurposing of buyer or responder data)
- retention controls with documented deletion schedules
- export and deletion mechanisms for user data
- no AI training on customer data without explicit consent

### Compliance Considerations
- Map jurisdictions and product role before launch (DSA, GDPR, Czech Trade Law apply)
- Do not claim legal certification without obtaining it
- Obtain legal review for regulated or marketplace flows, particularly DSA intermediary status
- Small firm exemptions may reduce DSA obligations initially; verify thresholds

### Accessibility Considerations
- WCAG-oriented semantics on all interactive elements
- keyboard navigation throughout
- visible focus indicators
- non-color status cues (do not rely on color alone)
- clear, plain-language error text

- **Automation Level:** Low initially (manual matching and review); Medium-High long-term (AI pre-screen, automated matching, API delivery)

- **Human Involvement:** Founder reviews every evidence submission for completeness and challenge-code validity during the first 100 requests. Support for refunds and disputes.

- **Mvp Definition:** A static web form where a buyer submits: (1) product/listing URL, (2) one question, (3) required evidence template, (4) €5 payment via Stripe. The founder manually matches the request to a seller or known owner. The responder records browser-native video with a random code displayed. The founder reviews and releases payment. No mobile app, no automated matching, no API.

### Version Two
- Responder application and vetting flow
- Model-level fact graph (link evidence to product model, not just listing)
- Automated checklist validation (AI pre-review before human)
- Merchant-funded question portal
- Browser extension for product pages
- Responder reputation and response-time score

- **Long Term Vision:** A comprehensive, paid, evidence-backed product-fact graph that serves consumers, merchants, and AI shopping agents. The graph compounds in value as more facts are verified by independent responders and unlocked by future buyers.

### Do Not Build Initially
- Mobile app
- API access (before fact corpus is large enough to be useful)
- Marketplace-wide search (before 100+ facts exist)
- Responder compensation beyond single payment (royalties later)
- Automatic safety scanning (manual review first)
- Multi-question bundles

### User Journey
- 1. Buyer finds a product page with an unanswered question
- 2. Buyer visits FactBounty, pastes the URL, types the question, selects an evidence template
- 3. Buyer sets a bounty (€3–€20) and pays via Stripe
- 4. Platform matches the request to a suitable responder (seller, owner, or local verifier)
- 5. Responder receives a notification with the question and a random challenge code
- 6. Responder records the evidence using browser-native capture with the challenge code visible
- 7. Human reviewer checks that the challenge code is present, the evidence answers the question, and the required template items are complete
- 8. Payment releases: responder receives 50–70%, platform keeps remainder
- 9. Buyer receives the evidence card with a clear limitations statement
- 10. Buyer can request one correction or claim a refund within 48 hours under fixed rules
- 11. With responder consent, the fact enters the reusable fact graph for future buyers to unlock

## What Future AI Should Build

- **Exact System:** AI Agentic Evidence Verification & Graph Construction Engine

### Automatic Work
- Incoming media OCR, image authenticity pre-check, product categorization

### Human Approval
- Final payout release and dispute arbitration

### Model Capabilities
- Multimodal vision model (Gemini 1.5 / GPT-4o)
- OCR text extraction

### Tools And Integrations
- Stripe API
- Cloud Storage
- Vision API

### Knowledge Sources
- Product catalogs
- Barcode databases
- Historical proof graph

### Suggested Stack
- Node.js / TypeScript
- PostgreSQL
- Python AI microservice

### Components
- Bounty Exchange Web UI
- Verification Worker Microservice
- Public API

### Data Flow
Request -> Stripe Auth -> Notification -> Worker Upload -> Vision Check -> Release

### Api Endpoints
- POST /v1/bounties
- GET /v1/evidence/:id
- POST /v1/evidence/:id/submit

### Database Entities
- Users
- Bounties
- EvidenceSubmissions
- Transactions
- Products

- **Authentication:** Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.

- **Payments:** Stripe Connect hosted checkout and webhooks; keep the provider authoritative for payment state.

- **Mvp Complexity:** Not yet specified

### Build Sequence
- Not yet specified

### Safety Guardrails
- EXIF GPS removal
- CSAM image hashing filter
- PII redaction

### Failure Handling
- Automatic refund on 48h timeout
- Human moderator escalation

### Analytics Events
- BountyCreated
- ProofSubmitted
- PayoutReleased
- DisputeOpened

### Logging Monitoring
- Structured JSON logging
- Sentry error tracking

### Evaluation Criteria
- Precision of AI pre-screening
- Time to completion
- Dispute rate

- **First Prototype:** Not yet specified

## Profitability Analysis

- **Revenue model:** Two-sided marketplace with platform fee on each transaction. Secondary: unlock fee for reusable facts, API subscription, merchant-funded questions.
- **Pricing model:** Variable bounty set by buyer (€3–€20); platform takes 25–35%. Unlock fee: €0.20–€1 per access. API: pay-per-call or monthly subscription (added when corpus is large enough).
- **Expected ARPC scenario:** Not yet specified
- **Gross-margin scenario:** Not yet specified
- **CAC scenario:** Not yet specified
- **LTV scenario:** Not yet specified
- **Target LTV:CAC:** Not yet specified
- **Payback:** Not yet specified
- **Break-even model:** Monthly fixed costs / (average monthly revenue per customer minus average monthly variable cost per customer).

### Three Editable Scenarios

| Scenario | Customers | Monthly ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Monthly operating profit |
|---|---:|---:|---:|---:|---:|---:|---:|
| Conservative | 5 | $25 | $125 | $1,500 | 70% | $500 | -$413 |
| Base | 20 | $40 | $800 | $9,600 | 72% | $800 | -$224 |
| Aggressive | 80 | $60 | $4,800 | $57,600 | 80% | $3,500 | $340 |

All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
- Stripe Connect fees in Czech Republic
- EU DSA micro-firm rules

### Research-Supported Estimates
- 67% shoppers ask product questions
- Fake review rates 11-15%

### Analyst Assumptions
- Take rate 15-20%
- Average bounty €5-€10

### Unknowns Requiring Validation
- Not yet specified

## What Must Be True for This Idea to Be Profitable

- **Required Customer Volume:** Not yet specified
- **Minimum Viable Price:** Not yet specified
- **Maximum Cac:** Not yet specified
- **Retention Or Frequency:** Not yet specified
- **Required Gross Margin:** Not yet specified
- **Maximum Service Cost:** Not yet specified
- **Conversion Rate:** Not yet specified
- **Automation Level:** Not yet specified
- **Sales Cycle:** Not yet specified
- **Critical Partnerships:** Not yet specified
- **Regulatory Dependencies:** Not yet specified
- **Technical Dependencies:** Not yet specified
- **Market Timing:** Not yet specified
- **Team Capabilities:** Not yet specified
- **Unprofitable Conditions:** Not yet specified


## Earning Potential

- **Most Realistic Outcome:** bootstrapped software, productized service, data business, or marketplace depending on validation

- **First Paying Customer:** A paid pilot in the range of the stated bounty or fee is the practical first milestone.

- **Side Business:** $5k-$50k annual revenue scenario if founder-led and narrow.

- **Small Company:** $100k-$1m annual revenue requires repeatable acquisition and standardized delivery.

- **Seven Figure:** Possible only with recurring or transaction revenue, strong retention, and reduced founder labor.

- **Venture Scale:** Not assumed; possible if the workflow expands into infrastructure, a network, or a proprietary data layer.

### Annual Revenue Range

- **Currency:** USD
- **Minimum:** 0
- **Midpoint:** 0
- **Maximum:** 0
- **Confidence:** low to medium until paid cohort evidence

- **Main Limiting Factor:** distribution and willingness to pay, followed by support/productization

## Market and Competition

- **Description:** Intersection of the $500B+ e-commerce trust and verification market and the emerging agentic-commerce infrastructure layer. Specific segment: buyer-funded product-fact verification.

### Demand Drivers
- increasing consumer distrust of unverified product claims
- AI agent adoption requiring structured, trustworthy product data
- regulatory pressure on fake reviews (DSA, EU Consumer Rights Directive)
- growth in high-consideration online purchases (electronics, furniture, specialized goods)
- right-to-repair legislation creating demand for product specification evidence

- **Signals:** Google UCP & AP2 protocols,Stripe x402 payment standard,Visa Agentic Payments report

- **Size Direction:** Rapidly expanding along with AI agent commerce transaction volume

- **Budget Source:** Consumer high-consideration purchase research budget / E-commerce trust budget

- **Maturity:** Emerging market (2026 protocol inflection point)

- **Competitive Density:** Low in exact niche; moderate in adjacent verification markets

### Direct Competitors
- None identified in exact buyer-funded product-fact-exchange niche

### Indirect Competitors
- Vinted / StockX item verification (seller-funded, not buyer-funded facts)
- VidVerity (video listings, not buyer-specified evidence)
- Groundtruth (geolocated evidence, not product-specific)
- RentAHuman (general AI-to-human tasks, not product-fact focused)
- Retailer Q&A widgets (free but slow, unverified, incomplete)

### Diy Alternatives
- Searching Google Images / Reddit
- Messaging store customer support

### Incumbent Advantages
- Existing retail traffic
- Pre-installed merchant relationships

### Startup Advantages
- Unbiased independent third-party evidence
- Bounty-funded incentive model

### Differentiation
- Challenge-coded physical evidence directly from verified owners, stored as a reusable graph

### Unserved Niches
- Obscure product measurements
- Part compatibility validation
- Exact clearance checks

- **Geography:** Initial launch EU (Czech Republic base); global expansion capability

- **Timing:** 2026 agentic commerce protocol wave

### Trends
- Agentic AI shopping
- Right-to-repair
- Digital Product Passports

- **Platform Feature Risk:** Incumbent platforms adding verified Q&A features

- **Commoditization Risk:** Generative AI creating fake video evidence (mitigated by challenge codes)

### Moats

- Proprietary verified product-evidence graph
- Two-sided buyer/responder network

## Validation Plan

- **Most Important Uncertainty:** Will shoppers pay €3–€20 for a single verified product fact before a purchase?

- **Riskiest Assumption:** Payment willingness at the bounty price point

- **Cheapest Test:** Post 10 real unanswered product questions in relevant forums with a link to a Stripe Checkout page for €5 and count payments

- **Fastest Test:** Day 1: Identify 5 active Reddit/Facebook product communities with unanswered "will it fit?" questions,Day 1: Build a one-page Carrd/Notion form + Stripe Checkout link,Day 1: Contact 3 people who posted unanswered questions and offer to answer for €5,Day 2: Record results: How many agreed? How many paid? What objections came up?,Day 2: Document evidence of payment or explicit refusal and the reason

- **Interview Plan:** Interview 15 shoppers who recently returned a product due to wrong dimensions or specs.

### Interview Questions
- Tell me about the last time this happened.
- What did you do instead?
- What did it cost in time, money, delay, or risk?
- Who approved spending?
- What would make an external solution untrustworthy?
- Would you pay for this fixed outcome this month? Why or why not?

- **Landing Page Test:** Static landing page with "Request Product Proof" button tracking click-through to Stripe.

- **Smoke Test:** Accept 5 paid requests manually before writing any backend code.

- **Concierge Mvp:** Not yet specified

- **Wizard Of Oz:** Not yet specified

- **Pricing Test:** Test €3 vs €5 vs €10 bounty pricing tiers.

- **Demand Threshold:** 3 paid requests within first 7 days.

### Success Criteria
- 30+ paid requests in 30 days, <20% refund rate, at least 3 buyers who would pay again

### Failure Criteria
- Fewer than 10 paid requests in 30 days despite active outreach, or refund rate >35%

### Evidence Before Build
- At least $25 collected in pre-orders / escrow.

### Evidence Before Heavy Investment
- 50 completed bounties with <2% dispute rate.

### Plan 48 Hours
- Day 1: Identify 5 active Reddit/Facebook product communities with unanswered "will it fit?" questions
- Day 1: Build a one-page Carrd/Notion form + Stripe Checkout link
- Day 1: Contact 3 people who posted unanswered questions and offer to answer for €5
- Day 2: Record results: How many agreed? How many paid? What objections came up?
- Day 2: Document evidence of payment or explicit refusal and the reason

### Plan 7 Days
Days 1–2: 48-hour plan above,Days 3–5: Run 10 evidence requests manually (founder as responder or recruits one),Days 6–7: Analyze refund rate, buyer satisfaction, responder recruitment difficulty, average time per request

### Plan 30 Days
Week 1: 7-day plan above,Week 2: Attempt 50 paid requests; refine evidence templates and review checklist,Week 3: Identify 3 high-volume question categories; create specialized templates,Week 4: Interview 5 buyers who paid: Why did you pay? Would you pay again? What was missing?

- **Do Not Build Yet:** Do not invest in automation, mobile apps, or API infrastructure until 100 paid manual requests have been completed and the refund rate is under 20%.

## Go-to-Market Strategy

- **Initial Niche:** High-consideration physical product buyers (audio gear, PC parts, furniture, specialized tools)

- **Icp:** Online shopper buying a $100+ physical product with unverified physical dimensions or specs

- **Beachhead:** Reddit r/BuyItForLife, r/HomeTheater, r/BuildAPc unanswered question threads

- **Positioning:** The only buyer-funded, challenge-verified product proof service

- **Value Proposition:** Get 100% verified visual proof of any physical product spec from a real owner before you buy.

- **Messaging:** Don’t guess. Don’t trust fake reviews. Pay a $5 bounty for exact visual proof.

- **Offer:** First proof request 100% money-back guaranteed if unfulfilled in 24 hours.

- **Pricing Launch:** €5 bounty flat rate (€1 platform fee)

### First 10 Customers
Direct manual outreach to shoppers posting unanswered product questions in forums.

### First 100 Customers
SEO programmatic pages for "Is [Product] [Attribute]?" queries.

- **Outbound:** Direct messaging to question askers on Reddit, Twitter, and niche forums.

- **Inbound:** SEO articles answering high-intent product comparison and clearance questions.

- **Community:** Community of verified product owners earning extra income from quick video proofs.

- **Partnerships:** Niche review blogs, price comparison sites, AI shopping agent developers.

- **Product Led Growth:** Every evidence card displayed publicly (with consent) shows the FactBounty format to future searchers and attracts both buyers and potential responders.

- **Marketplace Distribution:** Open API for AI shopping agents (Google UCP / AP2 integrations)

- **App Store:** Web app first; PWA for mobile responders

- **Seo:** Programmatic SEO on product model numbers + physical attributes

- **Content:** Product proof teardowns and dimension comparison guides

- **Paid Acquisition:** $0 initial (unnecessary until product-market fit)

- **Referral Loop:** Responders who earn money from providing evidence become advocates. Satisfied buyers share specific evidence cards when helping others in forums.

- **Sales Cycle:** B2C: Minutes to hours; B2B API: 2-4 weeks

### Sales Assets
- Sample proof video, comparison table, API documentation

- **Onboarding:** 1-click Google auth / email login + instant Stripe payment

- **Retention:** Email alerts when new proofs are uploaded for saved products

- **Expansion:** B2B API access for AI shopping agents to query verified evidence graph

## Build and Operations Plan

### Founder Skills
Basic web development (HTML/JS/Node), clear writing, direct outreach ability

### Team Roles
- Solo founder (Product, Tech, Support)
- Crowdsourced responders (Proof recording)

### Ai Can Accelerate
- Vision AI pre-screening of video uploads
- OCR text extraction from labels
- SEO copy generation

### Human Required
- Dispute arbitration
- Initial outreach
- Key partnership sales

- **Build Difficulty:** Low (MVP); Medium (semi-automated scale)

- **Operational Difficulty:** Medium — moderation judgment is the hardest ongoing task

- **Support Burden:** Low (Automated timeouts and escrow releases)

- **Sales Burden:** Low for B2C; Medium for B2B API sales

- **Compliance Burden:** Low initially under Czech micro-firm exemptions

- **Data Acquisition Difficulty:** Medium (Requires active owner responders)

- **Integration Difficulty:** Low (Standard Stripe Connect & S3/GCS storage)

### Mvp Stages
- Stage 1: Manual form
- Stage 2: Escrow web app
- Stage 3: Agent API

### Dependencies
- Stripe Connect
- Cloud storage provider
- LLM Vision API

### Maintenance
- Low ongoing code maintenance

### Quality Control
Challenge codes (e.g. write "ABC" on paper next to product) to prevent stock footage fraud

### Kpis
- Bounties Posted
- Bounties Fulfilled %
- Average Time to Fulfillment
- Dispute Rate %

### Leading Indicators
- Outreach messages sent
- Active registered responders

### Lagging Indicators
- Monthly Platform Revenue
- Gross Merchandise Value (GMV)

### Kill Metrics
Abandon if: <10 paid requests in 30 days OR refund rate >35% OR average delivery time >72 hours despite active responder recruitment

### Automation Opportunities
- Auto-approval via Gemini Flash Vision checking challenge code

### Sops
- Dispute Handling SOP
- Responder Fraud Verification SOP
- Czech Tax/VAT Accounting SOP

## Risks and Failure Modes

- **Product:** Proof quality insufficient for buyer decision

- **Market:** Buyers unwilling to pay for proof when free (unverified) info exists

- **Pricing:** Bounty amount too low to motivate quality responders

- **Distribution:** Cold start problem — hard to find initial responders for obscure products

- **Technical:** Media upload failures on low-end mobile devices

- **Ai Reliability:** AI vision false positives during automated moderation

- **Hallucination:** AI summary misrepresenting video contents

- **Data:** Storage cost growth if unoptimized media is stored

- **Security:** Malicious media file uploads

- **Privacy:** Responders accidentally filming faces or sensitive personal belongings

- **Regulatory:** EU DSA marketplace compliance burden scaling up

- **Reputation:** Collusion between buyer and responder to abuse escrow

- **Dependency:** Stripe account suspension risk if disputes spike

- **Platform:** Google Shopping / Amazon launching native verified proof badges

- **Fraud:** Stock photo / Photoshop fake proof submissions

- **Abuse:** Submitting inappropriate or non-product evidence requests

- **Support:** High dispute volume eating founder time

- **Founder Market Fit:** Founder losing interest during cold-start phase

- **Capital:** Low capital risk ($0-100 startup cost)

- **Timing:** Launching too early before AI shopping agents are widely used

- **Commoditization:** Free user reviews improving in accuracy

- **Ethics:** Avoid deceptive claims, exploitative targeting, and automation without recourse.

- **Worst Case:** Zero traction after 30 days — total loss of $0 capital and 40 hours time

### Mitigations
- Random challenge code prevents pre-recorded fraud
- Browser-native capture prevents file uploads
- Human review gates every payment release
- Clear evidence limitations statement on every card
- Narrow initial scope to low-liability, objective, physical questions
- No safety-critical categories (electrical, medical, structural) initially

### Abandon When
- 0 paid requests after contacting 50 buyers asking unanswered product questions.

## Action Plan

- **First Action:** Find 5 unanswered "Will it fit?" questions posted in the last 7 days on Reddit (/r/PCMasterRace, /r/ultralight, /r/MechanicalKeyboards) and contact the askers.

- **First Customer Conversation:** Ask Reddit user with unanswered question if they will pay €5 for video proof.

- **First Prototype:** Simple HTML form with Stripe Checkout integration.

- **First Sales Offer:** €5 flat rate bounty request with 100% money-back guarantee.

- **First Distribution Channel:** Manual direct messaging on Reddit/forums.

- **First Measurement:** Count of paid bounties submitted in week 1.

- **First Hiring Need:** None (solo founder operation).

- **First Integration:** Stripe Connect checkout.

### Plan 7 Days
- Day 1: Contact 10 askers of unanswered product questions
- Day 2: Build Carrd form + Stripe Checkout (one product category only)
- Day 3: Run first 3 manual evidence requests (founder as matchmaker)
- Day 4–5: Deliver evidence, collect buyer feedback
- Day 6: Record refund rate, time per request, buyer satisfaction
- Day 7: Decide go/no-go based on success criteria

### Plan 30 Days
- Week 1: 7-day plan above
- Week 2: 50 paid requests target; test 3 evidence templates
- Week 3: Interview 5 paying buyers; refine offer
- Week 4: Build simple fact graph database (even a spreadsheet) tracking reusable model-level facts

### Plan 90 Days
- Month 1: 30-day plan above
- Month 2: Semi-automate matching; add responder onboarding; reach 200 paid requests
- Month 3: Launch SEO content; add merchant-funded question portal; first API conversation with a shopping-agent developer

### Checklist
- Validate buyer payment willingness
- Deploy basic web app
- Onboard 10 responders
- Achieve break-even

## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
| problemSeverity | 8.5 | medium | Product information gaps cause wrong purchases and returns — real, frequent, and costly [s11, s13, s47] |
| frequencyOfNeed | 7.5 | medium | 67% of shoppers have asked an unanswered product question; high-consideration purchases happen regularly [s47] |
| willingnessToPay | 7 | low | Buyers pay €2.50–€12.50 for adjacent verification services [s16, s17, s21]; direct willingness for FactBounty format is unvalidated |
| marketDemand | 7.5 | low | Structural demand from agentic commerce + fake review distrust; precise market size unknown |
| marketGrowth | 9 | medium | Agentic commerce protocols are standardizing in 2026; trust-gap demand will grow as AI-generated content increases [s01–s07, s08] |
| revenuePotential | 7 | low | Realistic €12,000–€60,000 ARR in base case; higher possible with API — not venture-scale certainty |
| recurringRevenuePotential | 6 | medium | Unlock model creates some repeat revenue; individual bounties are transaction-based not subscription |
| grossMarginPotential | 7.5 | medium | 60–80% at scale; at MVP stage, moderation labor compresses margin significantly |
| speedToFirstRevenue | 9.5 | high | First payment possible within 48 hours of launching Stripe form |
| lowStartupCost | 10 | high | True €0 to first payment; CZK 800 for Czech registration is optional initially |
| easeOfMvp | 8.5 | high | A working MVP is one HTML form + Stripe Checkout + browser MediaRecorder; buildable in <48 hours |
| aiAutomationPotential | 8 | medium | Vision AI for evidence pre-screening; OCR for label extraction; matching; graph construction |
| easeOfDistribution | 6.5 | medium | Direct outreach to unanswered-question askers is free and effective; SEO is viable; cold start is the main challenge |
| retentionPotential | 6 | medium | Unlock model reduces repeat cost; but individual bounty purchases are not inherently recurring |
| competitiveAdvantage | 8 | medium | No direct competitor in buyer-funded product-fact-exchange niche; score reflects LOW competition (8 = low intensity) |
| defensibility | 6.5 | medium | Fact graph and responder network create medium moat; incumbents could copy the feature quickly |
| dataAdvantagePotential | 8.5 | high | Verified, model-level, evidence-backed facts are highly defensible data assets that compound over time |
| scalability | 7 | medium | Scales well once matching and review are automated; constrained by responder network until then |
| founderAccessibility | 8.5 | high | Any technically literate founder can build the MVP; no specialized domain expertise required |
| regulatorySimplicity | 6 | medium | DSA, GDPR, Czech trade law, VAT all apply; small firm exemptions available but must be verified [s40, s41, s42, s45] |
| operationalSimplicity | 6.5 | medium | Manual moderation is judgment-intensive; fraud detection requires ongoing vigilance |
| globalPotential | 7.5 | medium | Product questions are universal; initial focus on EU/Czech fits DSA compliance; global expansion requires per-jurisdiction legal review |
| timing | 9 | high | Agentic commerce protocols standardizing in 2026; fake review distrust at peak; perfect timing for the trust-gap niche [s01–s07, s08, s12, s13] |
| evidenceQuality | 7 | medium | 50 cited sources; government studies; protocol announcements; but core payment-willingness assumption is untested |
| overallConfidence | 6.8 | medium | Strong structural case; weak direct evidence of payment willingness; the market needs a 7-day validation before significant investment |

### Composite Views

- **overallOpportunity:** 91.2/100
- **bootstrappedPotential:** 88/100
- **soloFounderPotential:** 85/100
- **aiAgentPotential:** 80/100
- **fastestPathToRevenue:** 94/100
- **highestProfitPotential:** 72/100
- **lowestCostLaunch:** 96/100
- **bestRecurringRevenue:** 58/100
- **bestEnterpriseOpportunity:** 55/100
- **bestConsumerOpportunity:** 82/100
- **bestLocalOpportunity:** 60/100
- **bestMarketplaceOpportunity:** 85/100
- **bestLongTermDefensibility:** 70/100
- **bestForNontechnicalFounder:** 60/100
- **bestForTechnicalFounder:** 88/100
- **bestForSmallTeam:** 87/100
- **bestRequiringLittleCapital:** 96/100

## Evidence, Assumptions, and Unknowns

### Evidence
- source_record - The concept appears in the Deep Research Eighth Full Reset corpus. (medium)
- analyst_interpretation - The enriched analysis was generated from the concept and methodology. (low-medium)

### Assumptions
- All financial numbers are editable analyst scenarios, not promises.
- Market size is intentionally left unknown without source-backed bottom-up research.
- Direct competitor and current price facts require fresh verification.

### Unknowns
- Actual accessible market size
- Buyer prepayment rate and willingness to pay
- Channel conversion rates
- Repeat purchase frequency
- Support and review burden per transaction

## Related Ideas
- [idea-026 - Marketplace Trust Layer](marketplace-trust-layer.md)
- [idea-015 - Evidence-Backed Recommendation Engine](evidence-backed-recommendation-engine.md)
- [idea-062 - MeasureGraph — Exact Dimensions Evidence Network](measuregraph-exact-dimensions-evidence-network.md)
- [idea-063 - Compatibility Bounties — Device-Accessory Proof Exchange](compatibility-bounties-device-accessory-proof.md)
- [idea-064 - Verified Owner Answers — Cross-Retailer Q&A Network](verified-owner-answers-cross-retailer-qa.md)
- [idea-065 - Local Shelf Proof — Real-Time Retail Stock Evidence](local-shelf-proof-retail-stock-evidence.md)
- [idea-068 - Product Evidence API for Shopping Agents](product-evidence-api-shopping-agents.md)

## Source References

- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined
- **undefined**: undefined (undefined, undefined) - undefined

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-06). Session 8 winner: FactBounty (idea-061, score: 91.2). This dossier is part of the Product Verification and Evidence category (ideas 061-070).*

## Idea-Specific Prompt Pack

See [`prompts/idea-specific/idea-061/`](../prompts/idea-specific/idea-061/README.md).
