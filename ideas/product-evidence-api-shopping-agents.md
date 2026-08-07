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
| Why customers pay | Verified facts improve agent accuracy and reduce purchase regret — directly measurable in reduced return rates and higher user trust scores. |
| Earning potential | EUR 298–310000 annual scenario range; not a forecast |
| Startup cost | EUR 0–200 |
| Time to MVP | 4–8 weeks (requires existing FactBounty corpus) |
| Time to first revenue | 30–90 days (after corpus threshold) |
| Profitability condition |  |
| Overall opportunity score | 85.7/100 |
| Confidence | 6/10 |
| Main advantage | Best software margins in the category; perfectly timed for agentic commerce protocol standardization; compounding value as corpus grows |
| Main risk | Empty API without corpus is worthless; protocol changes could shift the integration surface; major shopping platforms may build their own |
| Best next validation |  |

## Identity and Provenance

- **Canonical ID:** `idea-068`
- **Legacy ID:** `product-evidence-api`
- **Slug:** `product-evidence-api-shopping-agents`
- **Category:** Product verification & evidence
- **Status:** researched
- **Tags:** API, shopping agents, B2B, agentic commerce, product data, infrastructure, Eighth Reset, high upside
- **Alternative names:** Product Evidence API, Shopping Agent Evidence Endpoint, Verified Product Facts API
- **Source references:** s01, s02, s03, s04, s05, s06, s07, s08, s09, s31, s32, s43
- **Provenance status:** Deep Research — Eighth Full Reset (2026-08-02)

The highest-upside infrastructure play in the product-verification category. The API is only valuable after a sufficient verified-fact corpus exists. Build FactBounty first; launch the API as the corpus reaches a threshold of coverage and quality. The timing is ideal given the rapid standardization of agentic commerce protocols (x402, UCP, AP2) in 2026.


## Customer Perspective

- **Primary Customer:** Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits

- **Economic Buyer:** Engineering or product teams integrating fact verification into shopping agents

- **Daily User:** Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits

- **Customer Type:** B2B / B2C marketplace participant

- **Current Situation:** Relies on unverified reviews, search engine queries, or manual research.

- **Specific Problem:** No reliable, machine-readable, evidence-backed product fact API exists; agents must rely on unverified merchant-supplied data.

- **Frequency:** High-consideration purchase events

- **Pain And Cost:** Product return costs, wrong purchases, lost research time

### Current Alternatives
- Search engines
- Reddit / forum posts
- Retailer Q&A

- **Alternative Gaps:** Unverified claims, Fake reviews, Outdated information

### Jobs To Be Done

- **Functional:** Verify product specifications and physical reality before purchasing

- **Emotional:** Feel confident that the purchase decision is right, not based on unverified claims.

- **Social:** Demonstrate evidence-backed decision-making to peers, partners, or colleagues.

- **Desired Outcome:** 100% confidence in product physical attributes and compatibility

### Trust Requirements
- Visual proof, verified purchase receipts, challenge codes

### Rejection Reasons
- Free alternatives available
- Lack of immediate response

### Switch Reasons
- Guaranteed verification outcome
- Direct visual proof


### Continuing Payment Reasons
- Ongoing product research needs


### Measurable Value
- Zero wrong-product returns; 10x faster product verification

### Acquisition Channels
- SEO
- Community outreach
- Agentic API integrations

### Objections
- Why pay when AI search exists?
- Is evidence genuine?

### Retention Drivers
- Fact reuse discounts
- Credit balances

### Churn Risks
- Transaction frequency limitation


- **Customer Pays Because:** Verified facts reduce agent hallucination rates and improve user trust — directly measurable in user satisfaction and return rate metrics.

- **Idea Satisfies Customer By:** Providing escrowed, challenge-coded proof directly from verified owners.

## Product Definition

- **Product Type:** Web app & API service

- **User Experience:** Minimalist web form for posting bounties + mobile verification portal for responders

### Main Workflow
- Select a narrowly defined job
- Provide authorized inputs
- Validate and normalize data
- Run deterministic checks and AI-assisted analysis
- Show uncertainties and failures
- Require approval for consequential actions
- Export result and evidence
- Save feedback for the next run

### Inputs
- Product SKU / URL
- Specific evidence request
- Bounty amount

### Outputs
- Verified photo/video proof
- Timestamped inspection report
- JSON evidence payload

### Core Features
- Escrow payment
- Challenge-code verification
- Evidence repository

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

### Data Requirements
- Product catalog schema
- Verified proof assets
- User trust scores

- **Automation Level:** Semi-automated matching + AI pre-screening

- **Human Involvement:** Human proof recording by verified owners

### Ai Capabilities
- Vision AI pre-screening
- OCR label extraction
- Product graph matching

### Non Ai Capabilities
- Stripe escrow
- Auth0 / Auth
- Storage bucket hosting

### Security Requirements
- TLS encryption
- EXIF metadata stripping
- Secure media upload

### Privacy Requirements
- GDPR compliance
- Face/location blurring
- Zero PII in proof

### Compliance Considerations
- EU DSA notice-and-action
- Czech trade license

### Accessibility Considerations
- WCAG 2.2 AA compliant UI

- **Mobile Requirements:** ['Mobile-first media upload web app']

- **Api Requirements:** ['REST API for shopping agents (x402 / HTTP Bearer)']

- **Marketplace Requirements:** ['Two-sided escrow and payout routing']

- **Mvp Definition:** A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus.

### Version Two
- Automated agent API access + subscription unlocks

- **Long Term Vision:** The global ground-truth evidence layer for physical products

### Do Not Build Initially
- Mobile native apps
- Complex crypto tokens

### User Journey
- Buyer arrives
- Submits request
- Pays escrow
- Receives proof
- Approves payout

## What Future AI Should Build

- **Exact System:** AI Agentic Evidence Verification & Graph Construction Engine

### Automatic Work
- normalize inputs
- retrieve allowed evidence
- run repeatable analyses
- generate structured drafts
- detect missing data
- prepare reports

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
- Request -> Stripe Auth -> Notification -> Worker Upload -> Vision Check -> Release

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

- **Authentication:** Session cookie for web UI; API Key / x402 for agentic API

- **Payments:** Stripe Connect Custom / Express onboarding

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

### Safety Guardrails
- EXIF GPS removal
- CSAM image hashing filter
- PII redaction

### Failure Handling
- Automatic refund on 48h timeout
- Human moderator escalation

- **Mvp Complexity:** Low-Medium (Buildable in 1-2 weeks)

### Build Sequence
- Stripe setup
- Submission web form
- Worker upload page
- Admin dashboard

- **First Prototype:** A single HTML page with Stripe Checkout and browser camera recording.

## Profitability Analysis

- **Revenue model:** Per-call pricing (€0.01–€0.10 per fact retrieval). Monthly subscription tiers (€99–€499/month + usage overage). Custom data partnerships with major shopping platforms.
- **Pricing model:** Take rate on bounty escrow (15-20%) + Unlock fee (€1-€2)
- **Expected ARPC scenario:** €15–€45 annual per active buyer
- **Gross-margin scenario:** 60–80% after scale
- **CAC scenario:** $0–$5 organic / direct outreach
- **LTV scenario:** $25–$120 estimated
- **Target LTV:CAC:** Target >3 after validated cohorts; currently unknown.
- **Payback:** Target under 6 months for self-serve and under 12 months for larger accounts.
- **Break-even model:** `Monthly fixed costs / (average monthly revenue per customer - average monthly variable cost per customer).`

### Three Editable Scenarios

| Scenario | Customers | Monthly price/ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Approx. monthly operating profit |
|---|---:|---:|---:|---:|---:|---:|---:|
| Conservative | 5 | €15–€45 annual per active buyer | — | — | 60–80% after scale | — | — |
| Base | 25 | €15–€45 annual per active buyer | — | — | 60–80% after scale | — | — |
| Aggressive | 100 | €15–€45 annual per active buyer | — | — | 60–80% after scale | — | — |

All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
- The idea or variant appears in the supplied corpus.
- Source references: s01, s02, s03, s04, s05, s06, s07, s08, s09, s31, s32, s43

### Research-Supported Estimates
- Some reports contained competitor-pricing and demand evidence from the Eighth Reset Deep Research corpus.

### Analyst Assumptions
- customer counts
- prices
- conversion
- retention
- cost structure

### Unknowns Requiring Validation
- actual willingness to pay
- channel conversion
- support minutes per customer
- repeat frequency

## What Must Be True for This Idea to Be Profitable

- **Required Customer Volume:** Enough active customers to cover fixed costs under the break-even formula.
- **Minimum Viable Price:** Must exceed variable delivery, support, refunds, and acquisition on a cohort basis.
- **Maximum Cac:** No more than roughly one-third of validated gross-profit LTV as a planning guardrail.
- **Retention Or Frequency:** Repeat usage or expansion must justify acquisition unless initial contribution margin is high.
- **Required Gross Margin:** Prefer >60% for scalable software; lower can work for a deliberately productized service.
- **Maximum Service Cost:** Human review must decline as a percentage of price or be priced explicitly.
- **Conversion Rate:** Landing-page interest is insufficient; paid conversion must support channel economics.
- **Automation Level:** Automate stable repetitive work, not uncertainty that still requires learning.
- **Sales Cycle:** Short enough that runway survives; validate before building enterprise features.
- **Critical Partnerships:** Any partner channel must show signed or behavioral commitment.
- **Regulatory Dependencies:** Launch scope must remain lawful and claims must match evidence.
- **Technical Dependencies:** Critical APIs, data licences, and model behavior must be verified.
- **Market Timing:** The trigger must be active now, not merely forecast.
- **Team Capabilities:** Product engineering, customer discovery, distribution, and domain review.
- **Unprofitable Conditions:** buyers will not prepay; support exceeds price; channel CAC is too high; retention is weak


## Earning Potential

- **Most Realistic Outcome:** bootstrapped marketplace or data business depending on validation

- **First Paying Customer:** A paid pilot in the €5–€20 bounty range is the practical first milestone.

- **Side Business:** €5k–€50k annual revenue scenario if founder-led and narrow.

- **Small Company:** €100k–€1m annual revenue requires repeatable acquisition and standardized delivery.

- **Seven Figure:** Possible only with recurring or transaction revenue, strong retention, and reduced founder labor.

- **Venture Scale:** Not assumed; realistic only if the workflow expands into infrastructure, a network, or a proprietary data layer.

### Annual Revenue Range

- **Currency:** EUR

- **Minimum:** 298

- **Midpoint:** 20000

- **Maximum:** 310000

- **Confidence:** low to medium until paid cohort evidence

### Main Assumptions
- validated price
- repeatable channel
- repeat demand
- controlled support

- **Main Limiting Factor:** distribution and willingness to pay, followed by support/productization

## Market and Competition

- **Description:** E-commerce trust, product verification, and agentic shopping infrastructure market.

### Demand Drivers
- Rise of AI shopping agents requiring structured product facts
- Distrust of fake online reviews

- **Signals:** ['Google UCP & AP2 protocols', 'Stripe x402 payment standard', 'Visa Agentic Payments report']

- **Size Direction:** Rapidly expanding along with AI agent commerce transaction volume

- **Budget Source:** Consumer high-consideration purchase research budget / E-commerce trust budget

- **Maturity:** Emerging market (2026 protocol inflection point)

- **Competitive Density:** Low direct competition in crowdsourced physical product proof exchange

### Direct Competitors
- VidVerity (video reviews)
- PowerReviews (Q&A software)
- Amazon Answers

### Indirect Competitors
- Reddit discussions
- YouTube unboxing videos
- Trustpilot

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

- **Data:** Verified physical facts compounding into a reusable graph
- **Network:** Each verified fact reduces marginal cost for future buyers

## Validation Plan

- **Most Important Uncertainty:** Will shoppers pay €3-€10 for a single verified physical product fact?

- **Riskiest Assumption:** Buyers value verified physical evidence enough to pay before purchase.

- **Cheapest Test:** Post a manual offer on Reddit/forum to answer any product question for €5 with video proof.

- **Fastest Test:** Launch 1-page HTML form connected to Stripe Checkout; share link to 20 unanswered question askers.

- **Interview Plan:** Interview 15 shoppers who recently returned a product due to wrong dimensions or specs.

### Interview Questions
- What product question did you last search for that you couldn’t answer?
- How much did the wrong purchase cost you in time/money?
- Would you have paid €5 to get exact visual proof before ordering?

- **Landing Page Test:** Static landing page with "Request Product Proof" button tracking click-through to Stripe.

- **Smoke Test:** Accept 5 paid requests manually before writing any backend code.

- **Concierge Mvp:** Founder personally visits local store / buys product to record first 10 proofs.

- **Wizard Of Oz:** Manual matching of buyers and responders via email/WhatsApp behind a clean frontend.

- **Prototype Test:** Deploy static web app MVP to 50 target users.

- **Pricing Test:** Test €3 vs €5 vs €10 bounty pricing tiers.

- **Demand Threshold:** 3 paid requests within first 7 days.

### Success Criteria
- 5 paid requests out of 20 direct outreaches.

### Failure Criteria
- 0 paid requests after 50 direct outreaches to shoppers asking unanswered questions.

### Evidence Before Build
- At least $25 collected in pre-orders / escrow.

### Evidence Before Heavy Investment
- 50 completed bounties with <2% dispute rate.

### Plan48 Hours
- create one example deliverable
- build prospect list of 25
- conduct five conversations
- make a paid offer

### Plan7 Days
- complete 15 interviews
- run landing/payment test
- deliver or schedule first pilot
- document objections

### Plan30 Days
- serve 3–10 pilots
- measure labor and costs
- identify repeated steps
- decide build, pivot, or stop

- **Do Not Build Yet:** Do not build mobile apps or complex automated matching engines before proving paid demand.

## Go-to-Market Strategy

- **Initial Niche:** High-consideration physical product buyers (audio gear, PC parts, furniture, specialized tools)

- **Icp:** Online shopper buying a $100+ physical product with unverified physical dimensions or specs

- **Beachhead:** Reddit r/BuyItForLife, r/HomeTheater, r/BuildAPc unanswered question threads

- **Positioning:** The only buyer-funded, challenge-verified product proof service

- **Value Proposition:** Get 100% verified visual proof of any physical product spec from a real owner before you buy.

- **Messaging:** Don’t guess. Don’t trust fake reviews. Pay a $5 bounty for exact visual proof.

- **Offer:** First proof request 100% money-back guaranteed if unfulfilled in 24 hours.

- **Pricing Launch:** €5 bounty flat rate (€1 platform fee)

### First10 Customers
- founder-led outreach
- specialist communities
- warm introductions

### First100 Customers
- SEO programmatic pages for "Is [Product] [Attribute]?" queries.

- **Outbound:** Direct messaging to question askers on Reddit, Twitter, and niche forums.

- **Inbound:** SEO articles answering high-intent product comparison and clearance questions.

- **Community:** Community of verified product owners earning extra income from quick video proofs.

- **Partnerships:** Niche review blogs, price comparison sites, AI shopping agent developers.

- **Product Led Growth:** Publicly viewable verified proof pages indexed by Google and AI crawlers.

- **Marketplace Distribution:** Open API for AI shopping agents (Google UCP / AP2 integrations)

- **App Store:** Web app first; PWA for mobile responders

- **Seo:** Programmatic SEO on product model numbers + physical attributes

- **Content:** Product proof teardowns and dimension comparison guides

- **Paid Acquisition:** $0 initial (unnecessary until product-market fit)

- **Referral Loop:** Give $2 bounty credit for every friend who requests a proof

- **Sales Cycle:** B2C: Minutes to hours; B2B API: 2-4 weeks

### Sales Assets
- Sample proof video, comparison table, API documentation

- **Onboarding:** 1-click Google auth / email login + instant Stripe payment

- **Retention:** Email alerts when new proofs are uploaded for saved products

- **Expansion:** B2B API access for AI shopping agents to query verified evidence graph

## Build and Operations Plan

### Founder Skills
- Basic web development (HTML/JS/Node), clear writing, direct outreach ability

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

- **Build Difficulty:** Low (Simple marketplace CRUD + media hosting)

- **Operational Difficulty:** Medium (Managing two-sided marketplace cold start)

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
- Challenge codes (e.g. write "ABC" on paper next to product) to prevent stock footage fraud

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
- <3 paid requests after 100 direct outreaches to target buyers

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

- **Ethics:** Fair compensation for crowdsourced proof providers

- **Worst Case:** Zero traction after 30 days — total loss of $0 capital and 40 hours time

### Mitigations
- Build FactBounty corpus first — do not launch API until 1,000+ verified facts in target categories
- Design API to be protocol-agnostic
- Get design-partner commitments before full build

### Abandon When
- buyers reject the paid outcome
- lawful inputs are unavailable
- unit economics remain negative
- the wedge is fully commoditized
- founder cannot sustain the required daily work

## Action Plan

- **First Action:** Interview 15 target buyers who recently asked unanswered product questions.

- **First Customer Conversation:** Ask Reddit user with unanswered question if they will pay €5 for video proof.

- **First Prototype:** Simple HTML form with Stripe Checkout integration.

- **First Sales Offer:** €5 flat rate bounty request with 100% money-back guarantee.

- **First Distribution Channel:** Manual direct messaging on Reddit/forums.

- **First Measurement:** Count of paid bounties submitted in week 1.

- **First Hiring Need:** None (solo founder operation).

- **First Integration:** Stripe Connect checkout.

### Plan7 Days
- Day 1: Identify 20 unanswered product questions on Reddit/forums
- Day 2: Create HTML submission form + Stripe link
- Day 3: Send 20 direct messages offering $5 verified proof
- Day 4-6: Fulfill first 3 requests manually if needed
- Day 7: Evaluate conversion rate and paid demand

### Plan30 Days
- Week 1: Execute 7-day plan above
- Week 2: Build basic escrow web app
- Week 3: Onboard first 10 product owner responders
- Week 4: Launch public proof directory for SEO

### Plan90 Days
- Month 1: Execute 30-day plan above
- Month 2: Automate media moderation with Gemini Vision AI
- Month 3: Launch REST API for AI shopping agent developers

### Checklist
- Validate buyer payment willingness
- Deploy basic web app
- Onboard 10 responders
- Achieve break-even

## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
| problemSeverity | 8.8 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on problemSeverity criteria. |
| frequencyOfNeed | 8.9 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on frequencyOfNeed criteria. |
| willingnessToPay | 7.7 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on willingnessToPay criteria. |
| marketDemand | 8.3 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on marketDemand criteria. |
| marketGrowth | 7.7 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on marketGrowth criteria. |
| revenuePotential | 7.9 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on revenuePotential criteria. |
| recurringRevenuePotential | 8.4 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on recurringRevenuePotential criteria. |
| grossMarginPotential | 9 | high | API delivery is near-zero marginal cost once corpus is built |
| speedToFirstRevenue | 8.5 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on speedToFirstRevenue criteria. |
| lowStartupCost | 9.5 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on lowStartupCost criteria. |
| easeOfMvp | 8.9 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on easeOfMvp criteria. |
| aiAutomationPotential | 9.5 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on aiAutomationPotential criteria. |
| easeOfDistribution | 8.8 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on easeOfDistribution criteria. |
| retentionPotential | 7.7 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on retentionPotential criteria. |
| competitiveAdvantage | 9.4 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on competitiveAdvantage criteria. |
| defensibility | 8.3 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on defensibility criteria. |
| dataAdvantagePotential | 8.3 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on dataAdvantagePotential criteria. |
| scalability | 7.7 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on scalability criteria. |
| founderAccessibility | 9.1 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on founderAccessibility criteria. |
| regulatorySimplicity | 7.8 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on regulatorySimplicity criteria. |
| operationalSimplicity | 8.1 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on operationalSimplicity criteria. |
| globalPotential | 8.4 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on globalPotential criteria. |
| timing | 9.5 | high | Agentic commerce protocol standardization in 2026 creates immediate demand |
| evidenceQuality | 7.7 | medium | Evaluated during Deep Research Eighth Reset tournament. Structural score based on evidenceQuality criteria. |
| overallConfidence | 6 | medium | High potential but requires FactBounty corpus to exist first — significant dependency risk |

### Composite Views

- **Overall Opportunity:** 85.7/100
- **Recurring Revenue:** 80/100
- **Enterprise Opportunity:** 82/100
- **Long Term Defensibility:** 82/100
- **Technical Founder:** 90/100


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
- [idea-027](commerce-knowledge-graph-platform.md)
- [idea-061](factbounty-buyer-funded-product-proof-exchange.md)
- [idea-062](measuregraph-exact-dimensions-evidence-network.md)
- [idea-063](compatibility-bounties-device-accessory-proof.md)

## Source References

- **s01**: See data/sources.json for full citation.
- **s02**: See data/sources.json for full citation.
- **s03**: See data/sources.json for full citation.
- **s04**: See data/sources.json for full citation.
- **s05**: See data/sources.json for full citation.
- **s06**: See data/sources.json for full citation.
- **s07**: See data/sources.json for full citation.
- **s08**: See data/sources.json for full citation.
- **s09**: See data/sources.json for full citation.
- **s31**: See data/sources.json for full citation.
- **s32**: See data/sources.json for full citation.
- **s43**: See data/sources.json for full citation.

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-06). Session 8 winner: FactBounty (idea-061, score: 91.2). This dossier is part of the Product Verification and Evidence category (ideas 061-070).*

## Idea-Specific Prompt Pack

See [`prompts/idea-specific/idea-068/`](../prompts/idea-specific/idea-068/README.md).
