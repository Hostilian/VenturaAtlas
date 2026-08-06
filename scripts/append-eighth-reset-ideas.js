#!/usr/bin/env node
/**
 * append-eighth-reset-ideas.js
 * Appends the 10 new canonical ideas from the "Deep Research — Eighth Full Reset"
 * (FactBounty and related product-verification ideas) to data/ideas.json.
 *
 * Run: node scripts/append-eighth-reset-ideas.js
 */

const fs = require('fs');
const path = require('path');

const ideasPath = path.join(__dirname, '..', 'data', 'ideas.json');
const existing = JSON.parse(fs.readFileSync(ideasPath, 'utf8'));

// Guard: skip if already added
if (existing.some(x => x.id === 'idea-061')) {
  console.log('Ideas 061–070 already present. Nothing to do.');
  process.exit(0);
}

const now = new Date().toISOString().slice(0, 10);

const newIdeas = [
  // ──────────────────────────────────────────────────────────
  // idea-061: FactBounty — Buyer-Funded Product Proof Exchange
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-061',
    legacyId: 'factbounty',
    slug: 'factbounty-buyer-funded-product-proof-exchange',
    name: 'FactBounty — Buyer-Funded Product Proof Exchange',
    oneSentenceConcept: 'Shoppers post a small bounty for one specific, objective piece of product evidence; a seller, verified owner, or local verifier provides guided visual proof and gets paid only when the checklist is complete.',
    elevatorPitch: 'FactBounty turns unanswered product questions into paid evidence requests. A buyer pastes a listing, asks one objective question (Will this bag fit my 16" laptop? What is the exact usable internal width? Is revision B still shipping with this port?), attaches a €3–€20 bounty, and a verified responder captures browser-native, timestamped, challenge-code evidence. The buyer pays only for a checklist-complete answer. Reusable facts flow into a growing product-evidence graph for future buyers and AI shopping agents.',
    detailedDescription: 'Product catalogues contain prices and specifications. Reviews contain opinions. Neither reliably answers specific, objective, physical questions. FactBounty is a marketplace for one thing: buyer-specified, visually evidenced product facts. It is not a review site, a resale verification service, or a general gig platform. The founding product is a manual, browser-based €5 proof-request exchange for "Will it fit?" and exact-measurement questions. Long-term, verified facts become reusable assets that future buyers unlock for €0.20–€1 and that shopping agents can access via a paid API.',
    category: 'Product verification & evidence',
    subcategory: 'consumer bounty exchange',
    tags: [
      'product evidence', 'buyer-funded', 'bounty', 'marketplace', 'verified facts',
      'shopping agents', 'agentic commerce', 'consumer', 'EU', 'micro-payment',
      'Eighth Reset', 'finalist', 'winner'
    ],
    alternativeNames: [
      'FactBounty',
      'Buyer-Funded Product Proof Exchange',
      'Product Fact Exchange',
      'Evidence Bounty Marketplace'
    ],
    relatedIdeaIds: [
      'idea-026', // Marketplace Trust Layer
      'idea-015', // Evidence-Backed Recommendation Engine
      'idea-062', // MeasureGraph
      'idea-063', // Compatibility Bounties
      'idea-064', // Verified Owner Answers
      'idea-065', // Local Shelf Proof
      'idea-068', // Product Evidence API
    ],
    status: 'priority',
    sourceReferences: [
      's08', 's09', 's11', 's12', 's13', 's14', 's15', 's16', 's17',
      's19', 's21', 's23', 's25', 's34', 's35', 's39', 's40', 's41',
      's42', 's43', 's45', 's46', 's47', 's50'
    ],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalWordingAvailable: 'full report',
      researchRound: '12',
      originalWinner: true,
      notes: 'This is the winner of the 12-round, 60-idea, $0–$100 business research tournament in the Eighth Full Reset. Scored 87.3–91.2 (weighted, with evidence and risk adjustments) across multiple scoring passes.'
    },
    atAGlance: {
      targetCustomer: 'Online shoppers blocked by one specific, objective, unanswered product question',
      problemSolved: 'Product catalogs and reviews do not reliably answer precise physical questions: exact measurements, accessory fit, revision status, real-world installed behavior, or current local stock.',
      whatToBuild: 'A browser-native, payment-gated evidence-request marketplace. Buyer posts question + bounty → responder records guided visual evidence using browser capture with random challenge code → human reviewer checks checklist → buyer pays only for complete evidence → reusable facts enter product-evidence graph.',
      howItMakesMoney: 'Platform fee (20–35%) on each bounty payment. Unlock fee (€0.20–€1) for reusable fact access by future buyers. API subscription for shopping agents and retailers. Merchant-funded unanswered-question bounties. No inventory, no ads, no pre-funded worker pool.',
      whyCustomersPay: 'The customer pays because a €5 evidence request costs far less than a wrong purchase, a return, or hours of manual research. Evidence-backed facts also remove the trust gap that synthetic reviews and AI summaries cannot close.',
      estimatedEarningPotential: {
        currency: 'EUR',
        minimum: 1350,
        midpoint: 14000,
        maximum: 150000,
        basis: 'Financial model cases: Survival (500 requests × €8 avg, 60% to responder), Strong (5,000 requests × €11), Exceptional (50,000+ requests + unlock + API). Annual equivalent shown; all cases are analyst projections, not forecasts.'
      },
      startupCost: {
        currency: 'EUR',
        minimum: 0,
        midpoint: 40,
        maximum: 100,
        basis: 'CZK 800 Czech trade registration; Stripe Connect no setup fee; browser-native capture; no paid ads; no pre-funded worker pool. Payments flow after buyer pays.'
      },
      timeToMvp: '7–14 days (manual pilot)',
      timeToFirstRevenue: '1–7 days (first paid request)',
      profitabilityCondition: 'At least 50 paid requests per month at average €5, with <40% refund rate and <2 hours of manual moderation per day. Monthly break-even (founder): 50 requests × (€5 × 30% platform share) = €75 gross margin ÷ ~€10 variable cost = positive from request 34.',
      overallScore: 91.2,
      confidenceScore: 6.8,
      mainAdvantage: 'Buyer pays before responder works; zero pre-funded inventory; reusable fact graph creates compounding value; perfectly timed for the agentic-commerce trust gap',
      mainRisk: 'Marketplace may be trapped between questions too cheap to support moderation and questions valuable enough to carry liability. Biggest unresolved assumption: whether shoppers will pay €5 for one answer often enough to fund operations.',
      bestNextValidationStep: 'Find 10 buyers who have had a product question go unanswered in the past 30 days. Ask each to pay €5 for a one-question evidence request before any product is built. Count payments received, not interest expressed.'
    },
    customer: {
      primaryCustomer: 'Online shoppers who need one specific, verifiable fact before a purchase decision',
      economicBuyer: 'The buyer who posts the bounty; secondarily merchants who fund unanswered questions',
      dailyUser: 'Buyer (posts request), responder (provides evidence), reviewer (human checker)',
      customerType: 'consumer, marketplace participant',
      currentSituation: 'Shoppers encounter a product page that does not answer their specific question. They search forums, post Q&As, contact sellers, or abandon the purchase. 67% have asked a product-page question; 57% expected an answer within 24 hours [s47].',
      specificProblem: 'Exact physical facts (dimensions, fit, revision status, connector presence, package contents) are absent from or wrong in product listings, and reviews do not reliably fill the gap.',
      frequency: 'High — purchase decisions for electronics, furniture, accessories, and used goods regularly hit unanswered-question blockers. Estimated several times per month per active online shopper.',
      painAndCost: 'Wrong purchases lead to returns, wasted shipping, and time loss. High-value purchases (camera gear, PC components, furniture) can involve €50–€500 at stake per question. Government research shows substantial consumer harm from bad product information [s11, s13].',
      currentAlternatives: [
        'Retailer Q&A (slow, often no response, sellers may not know)',
        'Forum searches (often outdated or not for exact revision)',
        'Seller direct messages (off-platform risk, no evidence)',
        'YouTube review videos (rarely test the exact configuration asked)',
        'Returning the item after purchase'
      ],
      alternativeGaps: 'No current alternative lets a buyer request one specific, objective, visually evidenced answer from someone who has the actual product, with payment contingent on checklist completion.',
      jobsToBeDone: {
        functional: 'Get a verified, specific, visual answer to one product question before purchasing, at lower cost than a wrong-purchase return.',
        emotional: 'Feel confident that an important purchase is based on actual evidence, not marketing copy or unverified opinions.',
        social: 'Know what other informed buyers know; avoid being the person who bought the wrong thing for a visible reason.'
      },
      desiredOutcome: 'A specific, visual, independently captured answer with a clear statement of what was and was not verified.',
      trustRequirements: [
        'Random challenge code in every recording (proves live capture)',
        'Browser-native capture (no uploaded files)',
        'Human reviewer confirmation before payment releases',
        'Clear limitations statement (timestamps ≠ authenticity)',
        'Refund policy for incomplete or irrelevant evidence'
      ],
      rejectionReasons: [
        'Cheap enough to just buy and return',
        'Question can be answered free by specs or an existing review',
        'Bounty seems too small to attract a responder quickly',
        'Distrust that the responder has the exact item'
      ],
      switchReasons: [
        'One paid answer saves more than the bounty cost',
        'Reusable fact is already in the database for €0.20',
        'Faster than the current workaround'
      ],
      continuingPaymentReasons: [
        'Each purchase decision can generate a new question',
        'The unlock model means repeat buyers pay less over time',
        'Habit: shoppers who have used it once trust it for the next purchase'
      ],
      measurableValue: [
        'Avoided return cost',
        'Time saved vs manual research',
        'Decision confidence'
      ],
      acquisitionChannels: [
        'Unanswered product questions in Amazon Q&A, Reddit product communities',
        'SEO on "Will X fit Y?" queries',
        'Browser extension on product pages',
        'Small brand merchant partnerships',
        'Shopping-agent developer integrations'
      ],
      objections: [
        'Why pay when I can ask the seller for free?',
        'How do I know the responder has my exact model?',
        'What if the answer arrives too late?',
        'What if the photo is staged?'
      ],
      retentionDrivers: [
        'Growing reusable fact database reduces cost of future answers',
        'Positive experience on first paid request',
        'Habit formation for high-consideration purchases'
      ],
      churnRisks: [
        'Question is answered free elsewhere',
        'Slow responder network',
        'Bad answer experience without easy refund'
      ],
      customerPaysBecause: 'A €3–€20 evidence request costs far less than a return, incorrect purchase, or wasted time — and eliminates the trust gap that synthetic reviews cannot close.',
      ideaSatisfiesCustomerBy: 'Providing browser-native, challenge-code-protected, human-reviewed visual evidence for exactly the question asked, with payment released only when the checklist is complete.'
    },
    product: {
      type: 'Two-sided marketplace with evidence-capture protocol',
      mvpDefinition: 'A static web form where a buyer submits: (1) product/listing URL, (2) one question, (3) required evidence template, (4) €5 payment via Stripe. The founder manually matches the request to a seller or known owner. The responder records browser-native video with a random code displayed. The founder reviews and releases payment. No mobile app, no automated matching, no API.',
      coreFeatures: [
        'Bounty posting form (URL, question, evidence template, payment)',
        'Random-challenge code generation at capture start',
        'Browser-native screen/camera capture (no file upload)',
        'Human review queue (founder initially)',
        'Evidence card display for buyer',
        'Stripe Connect split payment (buyer → platform → responder)',
        'Refund flow for incomplete evidence',
        'Reusable fact unlock (second buyer pays €0.20–€1 to access existing evidence)'
      ],
      versionTwoFeatures: [
        'Responder application and vetting flow',
        'Model-level fact graph (link evidence to product model, not just listing)',
        'Automated checklist validation (AI pre-review before human)',
        'Merchant-funded question portal',
        'Browser extension for product pages',
        'Responder reputation and response-time score'
      ],
      longTermVision: 'A comprehensive, paid, evidence-backed product-fact graph that serves consumers, merchants, and AI shopping agents. The graph compounds in value as more facts are verified by independent responders and unlocked by future buyers.',
      notInitiallyBuilt: [
        'Mobile app',
        'API access (before fact corpus is large enough to be useful)',
        'Marketplace-wide search (before 100+ facts exist)',
        'Responder compensation beyond single payment (royalties later)',
        'Automatic safety scanning (manual review first)',
        'Multi-question bundles'
      ],
      automationLevel: 'Low initially (manual matching and review); Medium-High long-term (AI pre-screen, automated matching, API delivery)',
      humanInvolvement: 'Founder reviews every evidence submission for completeness and challenge-code validity during the first 100 requests. Support for refunds and disputes.',
      aiCapabilities: [
        'Pre-screening evidence submissions for checklist completeness',
        'Extracting structured fact data from visual evidence',
        'Matching new questions to existing verified facts',
        'Detecting staging patterns or inconsistencies'
      ],
      securityRequirements: [
        'Random challenge code prevents file-reuse fraud',
        'Browser-native capture prevents pre-recorded submissions',
        'No full serial number storage (partial redaction required)',
        'Payment held in escrow until review complete',
        'GDPR-compliant personal data handling for EU buyers and responders'
      ],
      privacyRequirements: [
        'No requirement for buyer identity beyond payment',
        'Responder personal data minimized (payment info only)',
        'No full serial numbers published',
        'Evidence can include incidental background — responders must be warned'
      ],
      complianceConsiderations: [
        'EU Digital Services Act (DSA): notice-and-action obligations apply; small firm exemptions available [s40, s41, s42]',
        'Czech trade licensing: CZK 800 electronic registration [s45]',
        'Stripe Connect: 1.5% + CZK 6.50 per transaction [s39]',
        'VAT: obtain tax advice before accepting payments across EU jurisdictions',
        'Consult Czech legal counsel on content moderation liability before launch'
      ],
      userJourney: [
        '1. Buyer finds a product page with an unanswered question',
        '2. Buyer visits FactBounty, pastes the URL, types the question, selects an evidence template',
        '3. Buyer sets a bounty (€3–€20) and pays via Stripe',
        '4. Platform matches the request to a suitable responder (seller, owner, or local verifier)',
        '5. Responder receives a notification with the question and a random challenge code',
        '6. Responder records the evidence using browser-native capture with the challenge code visible',
        '7. Human reviewer checks that the challenge code is present, the evidence answers the question, and the required template items are complete',
        '8. Payment releases: responder receives 50–70%, platform keeps remainder',
        '9. Buyer receives the evidence card with a clear limitations statement',
        '10. Buyer can request one correction or claim a refund within 48 hours under fixed rules',
        '11. With responder consent, the fact enters the reusable fact graph for future buyers to unlock'
      ]
    },
    futureAiBuild: {
      exactProduct: 'A two-sided evidence-request marketplace web application with a browser-native capture client, human-in-the-loop review queue, Stripe Connect split payment, and a reusable product-fact graph API.',
      automatedActions: [
        'Generate and embed random challenge code in capture session',
        'Hash and timestamp submitted evidence file',
        'Pre-screen submission for challenge-code presence and basic completeness',
        'Match buyer question to existing verified facts in graph',
        'Extract structured data (measurements, model labels, connector presence) from visual evidence',
        'Generate evidence card (structured JSON + visual summary)',
        'Route refund or correction requests'
      ],
      humanApprovalRequired: [
        'Every evidence submission (initially — until AI pre-screen achieves >99% accuracy)',
        'Refund decisions',
        'Responder onboarding',
        'Safety-adjacent requests (anything involving electrical components, safety-critical parts)',
        'Dispute resolution'
      ],
      recommendedModelCapabilities: [
        'Vision: checklist completion detection in submitted images/video frames',
        'OCR: extract model labels, serial prefix, firmware version from visible labels',
        'Measurement extraction: identify ruler scale and measure annotated dimensions',
        'Anomaly detection: flag inconsistencies that may indicate staging'
      ],
      technicalStack: {
        frontend: 'Vanilla JS + minimal CSS; browser MediaRecorder API for capture; no framework required for MVP',
        backend: 'Node.js or Python (FastAPI) REST API; PostgreSQL for relational data',
        payments: 'Stripe Connect (split payments, identity, payouts)',
        storage: 'Object storage (R2 or S3) for evidence files; CDN for evidence card delivery',
        ai: 'OpenAI Vision API or Gemini Vision for pre-screen; upgrade to fine-tuned model when corpus grows',
        hosting: 'Vercel or Railway (zero ops for MVP)'
      },
      systemComponents: [
        'Bounty request form + payment flow',
        'Challenge-code generator and capture client',
        'Evidence upload and hash service',
        'Human review queue (web UI for founder)',
        'Evidence card renderer',
        'Stripe Connect webhook handler',
        'Fact graph data store (product ID → verified facts)',
        'Unlock payment flow for reusable facts',
        'API endpoint for shopping agents (v2)'
      ],
      keyApiEndpoints: [
        'POST /bounties (create request + payment intent)',
        'GET /bounties/{id} (buyer status)',
        'POST /evidence (responder submits capture)',
        'POST /reviews/{id} (reviewer approves or rejects)',
        'GET /facts/{productId} (query existing facts)',
        'POST /unlocks (buyer pays to access existing fact)'
      ],
      mvpComplexity: 'Low — founder manually handles matching, review, and edge cases. No automated pipeline required for first 100 requests.',
      recommendedBuildSequence: [
        '1. Static HTML form for bounty submission + Stripe Checkout',
        '2. Founder email/Notion workflow for manual matching and review',
        '3. Browser capture page with challenge code (MediaRecorder API)',
        '4. Simple evidence card (HTML page per request)',
        '5. Stripe Connect for split payouts',
        '6. Fact graph database (first 50 facts)',
        '7. Unlock flow for repeat access',
        '8. API prototype for first design partner'
      ],
      firstPrototype: 'A single HTML page with: (a) a form to submit a product URL, question, and evidence template; (b) a Stripe Checkout link for €5; (c) a browser capture page that generates a random 6-digit code and records via MediaRecorder; (d) a Notion database where the founder reviews submissions and releases Stripe payouts manually. Entire prototype can be built and tested in 48 hours.'
    },
    profitability: {
      revenueModel: 'Two-sided marketplace with platform fee on each transaction. Secondary: unlock fee for reusable facts, API subscription, merchant-funded questions.',
      pricingModel: 'Variable bounty set by buyer (€3–€20); platform takes 25–35%. Unlock fee: €0.20–€1 per access. API: pay-per-call or monthly subscription (added when corpus is large enough).',
      suggestedPricingTiers: [
        { tier: 'Single bounty', price: '€3–€20 buyer-set', platformShare: '25–35%' },
        { tier: 'Reusable fact unlock', price: '€0.20–€1', platformShare: '70% (responder gets 30% royalty)' },
        { tier: 'Merchant question bundle', price: '€50–€200/month', platformShare: '100%' },
        { tier: 'API access', price: '€99–€499/month + usage', platformShare: '100%' }
      ],
      grossMarginPotential: '60–80% at scale (marginal cost per fact decreases as graph grows; API delivery is near-zero marginal cost)',
      majorVariableCosts: [
        'Responder payouts (50–70% of bounty)',
        'Payment processing (1.5% + ~€0.35 per transaction)',
        'Human review time (founder initially; ~5 min per request)',
        'Refunds (~5–15% of requests based on comparable platforms)'
      ],
      majorFixedCosts: [
        'Hosting (€0–€20/month at MVP stage)',
        'Founder time (largest implicit cost)',
        'Czech trade registration: one-time ~€35'
      ],
      financialScenarios: {
        conservative: {
          customers: 50,
          requestsPerMonth: 50,
          avgBounty: 5,
          platformRevenue: '€75/month (30% of €250)',
          responderPayouts: '€175/month',
          processingFees: '€18/month',
          grossProfit: '€57/month',
          founderHours: 45,
          effectiveHourlyRate: '€1.27/h',
          assumptions: 'Very early stage; manual only; high churn; low bounty value'
        },
        baseCase: {
          customers: 200,
          requestsPerMonth: 500,
          avgBounty: 8,
          platformRevenue: '€1,200/month',
          responderPayouts: '€2,800/month',
          processingFees: '€180/month',
          grossProfit: '€1,020/month',
          founderHours: 120,
          effectiveHourlyRate: '€8.50/h',
          assumptions: 'Semi-automated matching; 10% reusable-fact unlocks; moderate refund rate'
        },
        aggressive: {
          customers: 2000,
          requestsPerMonth: 5000,
          avgBounty: 11,
          platformRevenue: '€15,400/month',
          responderPayouts: '€38,500/month',
          processingFees: '~€1,800/month',
          grossProfit: '~€13,600/month',
          founderHours: 420,
          effectiveHourlyRate: '€32/h',
          assumptions: 'AI-assisted review; established responder network; significant unlock revenue; shopping-agent API partner'
        }
      },
      breakEvenFormula: 'Monthly break-even (founder covering hosting) = €10 fixed ÷ (€5 avg bounty × 30% platform share − €0.35 variable) = ~8 paid requests/month. Break-even for 1 support-hour cost: ~34 requests/month.',
      mustBeTrueForProfitability: [
        'Shoppers will pay €3–€20 for one verified answer (NOT YET PROVEN)',
        'Responders with the exact product can be recruited without pre-funding',
        'Refund rate stays below 15%',
        'Manual review time stays below 6 min per request',
        'At least 50 paid requests per month within 60 days of launch',
        'DSA compliance costs remain manageable for a micro firm',
        'Reusable fact unlocks reduce average acquisition cost over time'
      ]
    },
    earningPotential: {
      firstPayingCustomer: 'Days 1–7 of launching the form',
      sideBusiness: '€500–€1,500/month at 200–600 requests/month',
      smallProfitableCompany: '€3,000–€15,000/month with automated review and established responder network',
      sevenFigureAnnualRevenue: 'Possible if fact graph + API reaches 50,000 requests/year — requires real responder density and shopping-agent adoption; NOT a near-term certainty',
      mostRealisticOutcome: 'Bootstrapped software/marketplace company',
      annualRevenueRanges: {
        low: '€900–€3,000 (side business after 6 months)',
        plausible: '€12,000–€60,000 (small profitable company after 18 months)',
        high: '€120,000–€500,000 (agent-commerce tailwind, API revenue, merchant partnerships)'
      },
      confidenceLevel: 'Low-medium — the need is real; the payment willingness is unvalidated',
      mainLimitingFactor: 'Whether shoppers will pay for individual fact answers often enough to sustain a responder network'
    },
    market: {
      description: 'Intersection of the $500B+ e-commerce trust and verification market and the emerging agentic-commerce infrastructure layer. Specific segment: buyer-funded product-fact verification.',
      demandDrivers: [
        'Growing agentic commerce creating need for verified machine-readable facts [s02–s07]',
        'Consumer distrust of AI-generated reviews and synthetic descriptions [s08, s12, s13]',
        '67% of shoppers have asked an unanswered product question [s47]',
        'Fake reviews causing measurable consumer harm [s11, s13]'
      ],
      marketMaturity: 'Nascent — buyer-funded product-fact exchanges do not exist at scale. Adjacent markets (item verification, gig retail) exist but serve different needs.',
      competitiveDensity: 'Low in exact niche; moderate in adjacent verification markets',
      directCompetitors: ['None identified in exact buyer-funded product-fact-exchange niche'],
      indirectCompetitors: [
        'Vinted / StockX item verification (seller-funded, not buyer-funded facts)',
        'VidVerity (video listings, not buyer-specified evidence)',
        'Groundtruth (geolocated evidence, not product-specific)',
        'RentAHuman (general AI-to-human tasks, not product-fact focused)',
        'Retailer Q&A widgets (free but slow, unverified, incomplete)'
      ],
      defensibility: 'Medium — early mover builds fact graph and responder reputation that is hard to replicate quickly. Platform risk: Amazon or Vinted could add a paid Q&A feature.',
      dataMoatPotential: 'High — reusable, model-level, evidence-backed facts compound in value; competitors must build the same corpus from scratch',
      networkEffectPotential: 'Medium — more responders mean faster answers; more facts mean lower unlock prices attract more buyers',
      timingConsiderations: 'Excellent — agentic commerce protocols (x402, UCP, AP2) are standardizing in 2026 [s01–s04]; consumer research assistance acceptance is growing [s08, s09]; fake-review distrust is at a high [s12, s13]'
    },
    validation: {
      mostImportantUncertainty: 'Will shoppers pay €3–€20 for a single verified product fact before a purchase?',
      riskiestAssumption: 'Payment willingness at the bounty price point',
      cheapestValidationTest: 'Post 10 real unanswered product questions in relevant forums with a link to a Stripe Checkout page for €5 and count payments',
      fastest48hPlan: [
        'Day 1: Identify 5 active Reddit/Facebook product communities with unanswered "will it fit?" questions',
        'Day 1: Build a one-page Carrd/Notion form + Stripe Checkout link',
        'Day 1: Contact 3 people who posted unanswered questions and offer to answer for €5',
        'Day 2: Record results: How many agreed? How many paid? What objections came up?',
        'Day 2: Document evidence of payment or explicit refusal and the reason'
      ],
      sevenDayPlan: [
        'Days 1–2: 48-hour plan above',
        'Days 3–5: Run 10 evidence requests manually (founder as responder or recruits one)',
        'Days 6–7: Analyze refund rate, buyer satisfaction, responder recruitment difficulty, average time per request'
      ],
      thirtyDayPlan: [
        'Week 1: 7-day plan above',
        'Week 2: Attempt 50 paid requests; refine evidence templates and review checklist',
        'Week 3: Identify 3 high-volume question categories; create specialized templates',
        'Week 4: Interview 5 buyers who paid: Why did you pay? Would you pay again? What was missing?'
      ],
      successCriteria: '30+ paid requests in 30 days, <20% refund rate, at least 3 buyers who would pay again',
      failureCriteria: 'Fewer than 10 paid requests in 30 days despite active outreach, or refund rate >35%',
      doNotBuildYetWarning: 'Do not invest in automation, mobile apps, or API infrastructure until 100 paid manual requests have been completed and the refund rate is under 20%.'
    },
    goToMarket: {
      bestInitialNiche: '"Will it fit?" questions for tech accessories (bags, cases, docks, coolers) on Reddit, Amazon Q&A, and Discord servers',
      beachheadMarket: 'PC enthusiasts and tech accessory buyers with specific, objective compatibility questions',
      firstTenCustomersPlan: [
        '1. Identify 20 unanswered "Will it fit?" or exact-measurement questions on Amazon Q&A, Reddit, and tech forums posted in the last 30 days',
        '2. Direct-message 20 question askers: "I can get you a verified photo answer for €5. Interested?"',
        '3. For each who says yes, collect €5 via Stripe, recruit the responder (seller or owner), complete evidence, deliver'
      ],
      contentStrategy: 'SEO: "Will [product X] fit [product Y]?" — high-intent, low-competition queries for specific product pairs. Answer these free initially to build topical authority and demonstrate the evidence format.',
      productLedGrowth: 'Every evidence card displayed publicly (with consent) shows the FactBounty format to future searchers and attracts both buyers and potential responders.',
      referralLoop: 'Responders who earn money from providing evidence become advocates. Satisfied buyers share specific evidence cards when helping others in forums.'
    },
    operations: {
      founderSkillsRequired: [
        'Ability to read and assess product evidence (not expert knowledge required, just attention to detail)',
        'Basic web development (HTML form + Stripe integration)',
        'Customer communication (buyer and responder management)',
        'Judgment for edge cases and refund decisions'
      ],
      buildDifficulty: 'Low (MVP); Medium (semi-automated scale)',
      operationalDifficulty: 'Medium — moderation judgment is the hardest ongoing task',
      keyPerformanceIndicators: [
        'Paid requests per week',
        'Refund rate (%)',
        'Average time from request to evidence delivery (hours)',
        'Responder acceptance rate (%)',
        'Buyer repeat rate (%)',
        'Reusable fact unlock rate (%)'
      ],
      killMetrics: 'Abandon if: <10 paid requests in 30 days OR refund rate >35% OR average delivery time >72 hours despite active responder recruitment'
    },
    risks: {
      productRisk: 'Staged or fraudulent evidence undermines trust before the brand is established',
      marketRisk: 'Questions may be too cheap to support paid fulfillment; questions valuable enough to pay for may carry liability risk',
      aiReliabilityRisk: 'AI pre-screen may miss fraudulent evidence; false positives could block legitimate submissions',
      hallucinations: 'Not applicable — factual claims must come from visual evidence, not AI generation',
      regulatoryRisk: 'DSA notice-and-action obligations; Czech VAT and trade licensing; GDPR for evidence containing personal data',
      fraudRisk: 'Staged evidence using a different unit; borrowed items; Photoshopped images',
      platformRisk: 'Amazon, Vinted, or StockX could add a paid Q&A feature that cannibalizes the market',
      founderMarketFitRisk: 'Requires ongoing manual review judgment and customer communication — sustainable only if the founder has the patience and attention to detail',
      worstCaseOutcome: 'A fraud incident before trust is established destroys the brand and attracts regulatory scrutiny',
      mitigations: [
        'Random challenge code prevents pre-recorded fraud',
        'Browser-native capture prevents file uploads',
        'Human review gates every payment release',
        'Clear evidence limitations statement on every card',
        'Narrow initial scope to low-liability, objective, physical questions',
        'No safety-critical categories (electrical, medical, structural) initially'
      ],
      abandonment: 'Abandon if refund rate exceeds 35% after 100 requests OR if a fraud incident causes reputational damage before automated detection can be deployed'
    },
    actionPlan: {
      firstAction: 'Find 5 unanswered "Will it fit?" questions posted in the last 7 days on Reddit (/r/PCMasterRace, /r/ultralight, /r/MechanicalKeyboards) and contact the askers.',
      sevenDayPlan: [
        'Day 1: Contact 10 askers of unanswered product questions',
        'Day 2: Build Carrd form + Stripe Checkout (one product category only)',
        'Day 3: Run first 3 manual evidence requests (founder as matchmaker)',
        'Day 4–5: Deliver evidence, collect buyer feedback',
        'Day 6: Record refund rate, time per request, buyer satisfaction',
        'Day 7: Decide go/no-go based on success criteria'
      ],
      thirtyDayPlan: [
        'Week 1: 7-day plan above',
        'Week 2: 50 paid requests target; test 3 evidence templates',
        'Week 3: Interview 5 paying buyers; refine offer',
        'Week 4: Build simple fact graph database (even a spreadsheet) tracking reusable model-level facts'
      ],
      ninetyDayPlan: [
        'Month 1: 30-day plan above',
        'Month 2: Semi-automate matching; add responder onboarding; reach 200 paid requests',
        'Month 3: Launch SEO content; add merchant-funded question portal; first API conversation with a shopping-agent developer'
      ]
    },
    scores: {
      problemSeverity: { value: 8.5, justification: 'Product information gaps cause wrong purchases and returns — real, frequent, and costly [s11, s13, s47]', confidence: 'medium', basis: 'Government studies on consumer harm; PowerReviews Q&A survey' },
      frequencyOfNeed: { value: 7.5, justification: '67% of shoppers have asked an unanswered product question; high-consideration purchases happen regularly [s47]', confidence: 'medium', basis: 'PowerReviews survey (potential vendor bias)' },
      customerWillingnessToPay: { value: 7.0, justification: 'Buyers pay €2.50–€12.50 for adjacent verification services [s16, s17, s21]; direct willingness for FactBounty format is unvalidated', confidence: 'low', basis: 'Adjacent market pricing; no direct test yet' },
      marketDemand: { value: 7.5, justification: 'Structural demand from agentic commerce + fake review distrust; precise market size unknown', confidence: 'low', basis: 'Analyst interpretation of multiple trend signals' },
      marketGrowth: { value: 9.0, justification: 'Agentic commerce protocols are standardizing in 2026; trust-gap demand will grow as AI-generated content increases [s01–s07, s08]', confidence: 'medium', basis: 'Official protocol announcements; Gartner/NRF research' },
      revenuePotential: { value: 7.0, justification: 'Realistic €12,000–€60,000 ARR in base case; higher possible with API — not venture-scale certainty', confidence: 'low', basis: 'Financial model — all assumptions require validation' },
      recurringRevenuePotential: { value: 6.0, justification: 'Unlock model creates some repeat revenue; individual bounties are transaction-based not subscription', confidence: 'medium', basis: 'Business model analysis' },
      grossMarginPotential: { value: 7.5, justification: '60–80% at scale; at MVP stage, moderation labor compresses margin significantly', confidence: 'medium', basis: 'Comparable marketplace margins' },
      speedToFirstRevenue: { value: 9.5, justification: 'First payment possible within 48 hours of launching Stripe form', confidence: 'high', basis: 'Direct — no technical barriers to accepting first payment' },
      lowStartupCost: { value: 10.0, justification: 'True €0 to first payment; CZK 800 for Czech registration is optional initially', confidence: 'high', basis: 'Direct — no inventory, no ads, no pre-funded pool required' },
      easeOfMvp: { value: 8.5, justification: 'A working MVP is one HTML form + Stripe Checkout + browser MediaRecorder; buildable in <48 hours', confidence: 'high', basis: 'Technical assessment' },
      aiAutomationPotential: { value: 8.0, justification: 'Vision AI for evidence pre-screening; OCR for label extraction; matching; graph construction', confidence: 'medium', basis: 'Available model capabilities as of 2026' },
      easeOfDistribution: { value: 6.5, justification: 'Direct outreach to unanswered-question askers is free and effective; SEO is viable; cold start is the main challenge', confidence: 'medium', basis: 'Distribution channel analysis' },
      customerRetentionPotential: { value: 6.0, justification: 'Unlock model reduces repeat cost; but individual bounty purchases are not inherently recurring', confidence: 'medium', basis: 'Business model analysis' },
      competitiveIntensity: { value: 8.0, justification: 'No direct competitor in buyer-funded product-fact-exchange niche; score reflects LOW competition (8 = low intensity)', confidence: 'medium', basis: 'Competitor research; note platform risk from incumbents' },
      defensibility: { value: 6.5, justification: 'Fact graph and responder network create medium moat; incumbents could copy the feature quickly', confidence: 'medium', basis: 'Competitive analysis' },
      dataAdvantagePotential: { value: 8.5, justification: 'Verified, model-level, evidence-backed facts are highly defensible data assets that compound over time', confidence: 'high', basis: 'Data moat analysis' },
      scalability: { value: 7.0, justification: 'Scales well once matching and review are automated; constrained by responder network until then', confidence: 'medium', basis: 'Operations analysis' },
      founderAccessibility: { value: 8.5, justification: 'Any technically literate founder can build the MVP; no specialized domain expertise required', confidence: 'high', basis: 'Technical assessment' },
      regulatorySimplicity: { value: 6.0, justification: 'DSA, GDPR, Czech trade law, VAT all apply; small firm exemptions available but must be verified [s40, s41, s42, s45]', confidence: 'medium', basis: 'Regulatory research — not legal advice' },
      operationalSimplicity: { value: 6.5, justification: 'Manual moderation is judgment-intensive; fraud detection requires ongoing vigilance', confidence: 'medium', basis: 'Operations analysis' },
      globalPotential: { value: 7.5, justification: 'Product questions are universal; initial focus on EU/Czech fits DSA compliance; global expansion requires per-jurisdiction legal review', confidence: 'medium', basis: 'Market analysis' },
      timing: { value: 9.0, justification: 'Agentic commerce protocols standardizing in 2026; fake review distrust at peak; perfect timing for the trust-gap niche [s01–s07, s08, s12, s13]', confidence: 'high', basis: 'Direct from protocol announcements and survey data' },
      evidenceQuality: { value: 7.0, justification: '50 cited sources; government studies; protocol announcements; but core payment-willingness assumption is untested', confidence: 'medium', basis: 'Source quality assessment' },
      overallConfidence: { value: 6.8, justification: 'Strong structural case; weak direct evidence of payment willingness; the market needs a 7-day validation before significant investment', confidence: 'medium', basis: 'Analyst assessment combining all evidence' }
    },
    compositeScores: {
      overallOpportunity: 91.2,
      bootstrappedPotential: 88.0,
      soloFounderPotential: 85.0,
      aiAgentPotential: 80.0,
      fastestPathToRevenue: 94.0,
      highestProfitPotential: 72.0,
      lowestCostLaunch: 96.0,
      bestRecurringRevenue: 58.0,
      bestEnterpriseOpportunity: 55.0,
      bestConsumerOpportunity: 82.0,
      bestLocalOpportunity: 60.0,
      bestMarketplaceOpportunity: 85.0,
      bestLongTermDefensibility: 70.0,
      bestForNontechnicalFounder: 60.0,
      bestForTechnicalFounder: 88.0,
      bestForSmallTeam: 87.0,
      bestRequiringLittleCapital: 96.0
    },
    updatedAt: now,
    createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-061'
  },

  // ──────────────────────────────────────────────────────────
  // idea-062: MeasureGraph — Exact Dimensions Evidence Network
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-062',
    legacyId: 'measuregraph',
    slug: 'measuregraph-exact-dimensions-evidence-network',
    name: 'MeasureGraph — Exact Dimensions Evidence Network',
    oneSentenceConcept: 'A paid, public, and compounding graph of exact usable dimensions — internal bag widths, mounting-hole distances, door clearances, connector positions — funded by buyers who need specific measurements before purchasing.',
    elevatorPitch: 'Manufacturer dimension specs omit clearances, openings, mounting points, and soft-material variation. MeasureGraph lets buyers fund one ruler-in-frame measurement from a verified owner. Once independently reproduced, the result becomes a reusable model-level fact that future buyers unlock cheaply. The graph compounds in value as more measurements are verified and interlinked.',
    detailedDescription: 'Product listings state exterior dimensions but omit what shoppers actually need: usable internal width, cable clearance behind a TV, mounting-hole center-to-center distance, or how much a soft-sided bag stretches. MeasureGraph is a specialized bounty marketplace for exact physical measurements. It is the narrowest, safest, and most legally defensible variant of the FactBounty concept.',
    category: 'Product verification & evidence',
    subcategory: 'data network',
    tags: [
      'measurements', 'dimensions', 'product data', 'buyer-funded', 'bounty',
      'physical evidence', 'consumer', 'Eighth Reset', 'finalist', 'runner-up'
    ],
    alternativeNames: ['MeasureGraph', 'Dimension Bounty Network', 'Product Measurement Exchange'],
    relatedIdeaIds: ['idea-061', 'idea-063', 'idea-066', 'idea-068'],
    status: 'researched',
    sourceReferences: ['s39', 's40', 's47', 's50'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalWordingAvailable: 'full report',
      researchRound: '12',
      originalRank: 'Runner-Up / Finalist',
      notes: 'Ranked second in the Eighth Reset tournament. Described as the safest and most legally defensible variant of FactBounty — lower liability risk, fewer fraud vectors, but also lower individual bounty value.'
    },
    atAGlance: {
      targetCustomer: 'Shoppers needing exact physical dimensions before purchasing furniture, bags, cases, accessories, or replacement parts',
      problemSolved: 'Manufacturer specs list exterior dimensions but omit usable clearances, internal openings, mounting-point distances, and soft-material stretch variation.',
      whatToBuild: 'A bounty marketplace for ruler-in-frame visual measurements. Buyer specifies start and end points; owner follows a guided measurement template; result is verified and linked to the product model ID for reuse.',
      howItMakesMoney: 'Platform fee on each measurement bounty. Unlock fee for reusable results. Affiliate links from "Will it fit?" content. Long-term: API for design tools, retailers, and AR applications.',
      whyCustomersPay: 'A €4–€7 measurement saves the buyer from returning a €50–€500 item and hours of research. Wrong furniture purchases are expensive; wrong bag sizes result in failed travel.',
      estimatedEarningPotential: {
        currency: 'EUR',
        minimum: 95,
        midpoint: 22000,
        maximum: 150000,
        basis: 'Financial model cases from Eighth Reset: Tiny (60 bounties × €4), Survival (800 bounties/unlocks), Strong (8,000 + affiliate/API), Exceptional (widely used fit graph). Annual equivalent shown.'
      },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 20, maximum: 100 },
      timeToMvp: '3–7 days',
      timeToFirstRevenue: '1–5 days',
      profitabilityCondition: 'At least 100 funded measurements per month at average €5; measurement accuracy must be reproducible across owners.',
      overallScore: 85.4,
      confidenceScore: 7.2,
      mainAdvantage: 'Objective, low-liability, reusable — the most defensible starting point in the product-proof category',
      mainRisk: 'Individual measurements may not justify a meaningful bounty; soft goods and revisions can invalidate results',
      bestNextValidationStep: 'Identify 20 "will it fit?" questions on Reddit for specific product pairs. Contact askers and offer a €4 ruler-in-frame measurement. Count payments before building anything.'
    },
    customer: {
      primaryCustomer: 'Online shoppers buying furniture, bags, cases, mounting hardware, replacement parts, or any product where exact fit matters',
      economicBuyer: 'The buyer who posts the measurement bounty',
      dailyUser: 'Buyer (requests measurement), owner (provides ruler-in-frame evidence), reviewer (validates accuracy)',
      specificProblem: 'Catalog exterior dimensions are insufficient for purchase decisions where internal clearance, usable depth, or soft-material behavior determines fit.',
      frequency: 'High for high-consideration purchases; multiple times per year for active shoppers',
      currentAlternatives: ['Retailer spec sheets (exterior only)', 'Forum posts (often wrong or outdated)', 'Contacting sellers (slow, informal)', 'AR measurement tools (need physical access to item)'],
      customerPaysBecause: 'A €4–€7 verified measurement is the cheapest way to get a purchase-blocking fact that no catalog provides.',
      ideaSatisfiesCustomerBy: 'Providing a ruler-in-frame, standardized visual measurement from a verified owner, linked to a specific product model ID for reuse by future buyers.'
    },
    scores: {
      problemSeverity: { value: 8.0, justification: 'Fit decisions are frequent blockers for furniture, bags, and accessories purchases', confidence: 'medium', basis: 'Analyst assessment + PowerReviews data' },
      customerWillingnessToPay: { value: 7.0, justification: 'Adjacent bounty payments suggest willingness; individual measurement value is lower than a full evidence answer', confidence: 'low', basis: 'Adjacent market inference' },
      marketGrowth: { value: 8.5, justification: 'Agentic commerce needs machine-readable measurements; AR fit apps are growing demand for exact data', confidence: 'medium', basis: 'Analyst assessment' },
      speedToFirstRevenue: { value: 9.5, justification: 'Simplest FactBounty variant — a form and payment link can be live in hours', confidence: 'high', basis: 'Technical assessment' },
      lowStartupCost: { value: 10.0, justification: '€0 to first payment — same mechanics as FactBounty', confidence: 'high', basis: 'Direct assessment' },
      easeOfMvp: { value: 9.0, justification: 'Measurement template is simpler than generic evidence; fewer edge cases', confidence: 'high', basis: 'Technical assessment' },
      defensibility: { value: 7.0, justification: 'Dimensional knowledge graph with standardized landmarks is harder to replicate than generic Q&A', confidence: 'medium', basis: 'Data moat analysis' },
      overallConfidence: { value: 7.2, justification: 'Objective measurements are the lowest-risk starting point; payment willingness for individual measurements needs validation', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: {
      overallOpportunity: 85.4,
      bootstrappedPotential: 87.0,
      soloFounderPotential: 90.0,
      fastestPathToRevenue: 92.0,
      lowestCostLaunch: 95.0,
      bestConsumerOpportunity: 78.0,
      bestMarketplaceOpportunity: 76.0,
      bestRequiringLittleCapital: 95.0
    },
    profitability: {
      financialScenarios: {
        conservative: { requestsPerMonth: 60, avgBounty: 4, platformRevenue: '€72/month', grossProfit: '€50/month', assumptions: 'Manual only; very small initial audience' },
        baseCase: { requestsPerMonth: 800, avgBounty: 6, platformRevenue: '€1,440/month', grossProfit: '€1,200/month', assumptions: 'Includes some unlock revenue and affiliate links' },
        aggressive: { requestsPerMonth: 8000, avgBounty: 6, platformRevenue: '€14,400/month', grossProfit: '€12,000/month', assumptions: 'API and affiliate revenue included; automated review' }
      },
      mustBeTrueForProfitability: ['Individual measurement bounties must average ≥€4', 'Reusable unlock revenue must supplement per-bounty income within 6 months', 'Measurement accuracy must be high enough to avoid frequent refunds']
    },
    validation: {
      mostImportantUncertainty: 'Are individual measurements worth €4–€7 to buyers in enough volume to sustain the platform?',
      fastest48hPlan: ['Find 20 "will it fit?" Reddit posts', 'Contact askers directly offering a €4 ruler-in-frame measurement', 'Count payments received vs interest expressed'],
      successCriteria: '20+ paid measurements in 30 days with <15% refund rate',
      doNotBuildYetWarning: 'Do not invest in a dimensional database or API until 50 paid measurements confirm the bounty model works for this specific use case.'
    },
    risks: {
      productRisk: 'Owner measures inaccurately; soft goods vary by unit; revisions invalidate published measurements',
      marketRisk: 'Individual low-value measurements may not sustain a marketplace',
      mitigations: ['Two independent measurements before fact is marked verified', 'Clear margin-of-error statement on every measurement', 'Automatic expiry flag for measurements on frequently revised products']
    },
    actionPlan: {
      firstAction: 'Find 5 unanswered "what is the internal width of [bag X]?" questions on Reddit r/onebag or r/ultralight',
      sevenDayPlan: ['Days 1–2: Contact 20 askers, offer €4 measurement', 'Days 3–5: Run first 10 manual measurements', 'Days 6–7: Calculate refund rate and satisfaction']
    },
    updatedAt: now,
    createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-062'
  },

  // ──────────────────────────────────────────────────────────
  // idea-063: Compatibility Bounties
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-063',
    legacyId: 'compatibility-bounties',
    slug: 'compatibility-bounties-device-accessory-proof',
    name: 'Compatibility Bounties — Device-Accessory Proof Exchange',
    oneSentenceConcept: 'Buyers fund a specific owner to physically demonstrate that two exact products work together — camera body with cage, NAS with drive model, PC cooler with motherboard — with visual evidence for the exact revision.',
    elevatorPitch: 'Official compatibility matrices are incomplete, especially across regional models and hardware revisions. Compatibility Bounties lets a buyer post a €7–€15 bounty for an owner to demonstrate one exact pairing with visual evidence. Once verified by two independent proofs, the compatibility fact enters a device-accessory graph accessible to future buyers.',
    detailedDescription: 'Electronics accessories, NAS drives, camera gear, PC components, and vehicle cargo accessories all have compatibility that official documentation does not fully cover. Compatibility Bounties is a specialized bounty exchange for physical compatibility demonstration — not editorial claims, not AI inference, but actual evidence of two products working together.',
    category: 'Product verification & evidence',
    subcategory: 'consumer bounty exchange',
    tags: ['compatibility', 'electronics', 'accessories', 'PC building', 'camera gear', 'buyer-funded', 'Eighth Reset', 'finalist'],
    alternativeNames: ['Compatibility Bounties', 'Device Pairing Proof Exchange', 'Fit & Function Bounty'],
    relatedIdeaIds: ['idea-061', 'idea-062', 'idea-066', 'idea-068'],
    status: 'researched',
    sourceReferences: ['s22', 's39', 's40', 's47'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Finalist',
      notes: 'Ranked third in the Eighth Reset. Higher bounty value than MeasureGraph (€7–€15) but higher complexity and safety-concern risk for electrical or safety-critical pairings.'
    },
    atAGlance: {
      targetCustomer: 'Electronics buyers, PC builders, photographers, and videographers needing exact compatibility proof for specific hardware revisions',
      problemSolved: 'Official compatibility matrices are incomplete across revisions and regional models; community knowledge is often wrong or outdated; firmware changes can invalidate previous results.',
      whatToBuild: 'A bounty marketplace for compatibility demonstrations. Buyer specifies two exact products (with revision/firmware); owner demonstrates physical connection and function; result is linked to device-accessory pair ID.',
      howItMakesMoney: 'Platform fee on each bounty. Unlock fee for reusable facts. Long-term: compatibility graph API for retailers and PC build configurators.',
      whyCustomersPay: 'A single wrong compatibility purchase can mean a returned cooler that scratches a motherboard, an adapter that fries a lens, or a drive that corrupts a NAS. A €10 compatibility proof is cheap insurance.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 500, midpoint: 18000, maximum: 120000, basis: 'Analyst projection — not validated' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 20, maximum: 100 },
      timeToMvp: '5–10 days',
      timeToFirstRevenue: '2–7 days',
      overallScore: 84.2,
      confidenceScore: 6.5,
      mainAdvantage: 'Higher bounty value than measurements; clear buyer pain in high-value electronics categories',
      mainRisk: 'Unsafe compatibility tests can damage equipment; liability exposure for safety-adjacent categories; strong free community alternatives for popular pairings'
    },
    customer: {
      primaryCustomer: 'Electronics buyers and enthusiasts who need physical compatibility proof for specific hardware revisions before purchasing',
      specificProblem: 'Official compatibility matrices and community databases often cover only popular configurations; regional models and hardware revisions are frequently missing.',
      currentAlternatives: ['Compatibility databases (incomplete)', 'Reddit/forums (often wrong or outdated)', 'Manufacturer support (slow, generic answers)', 'eBay compatibility data (user-reported, unverified)'],
      customerPaysBecause: 'A €7–€15 verified compatibility proof is far cheaper than a wrong accessory purchase, a returned item, or equipment damage.'
    },
    profitability: {
      financialScenarios: {
        conservative: { requestsPerMonth: 30, avgBounty: 10, platformRevenue: '€90/month', assumptions: 'Narrow niche, manual matching' },
        baseCase: { requestsPerMonth: 300, avgBounty: 12, platformRevenue: '€1,080/month', assumptions: 'Established responder network for major electronics categories' },
        aggressive: { requestsPerMonth: 3000, avgBounty: 12, platformRevenue: '€10,800/month', assumptions: 'API integration with PC build configurators; retailer partnerships' }
      }
    },
    risks: {
      productRisk: 'Safety-adjacent tests (electrical, thermal) can damage equipment; liability without waiver is high',
      regulatoryRisk: 'Safety claims require explicit disclaimers; no safety certification or endorsement can be implied',
      mitigations: ['Strict "non-electrical, non-safety-critical" restriction initially', 'Explicit waiver for responder and buyer', 'Consult legal counsel before expanding to electrical or high-current categories']
    },
    scores: {
      problemSeverity: { value: 8.0, justification: 'Wrong compatibility purchases are costly in high-value electronics', confidence: 'medium', basis: 'Analyst' },
      customerWillingnessToPay: { value: 7.5, justification: 'Higher bounty tolerance for high-value electronics compatibility', confidence: 'low', basis: 'Inference from StockX/Vinted pricing' },
      lowStartupCost: { value: 10.0, justification: 'Same zero-cost mechanics as FactBounty', confidence: 'high', basis: 'Direct' },
      overallConfidence: { value: 6.5, justification: 'Strong niche but safety risk creates legal complexity', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 84.2, bootstrappedPotential: 82.0, soloFounderPotential: 78.0, fastestPathToRevenue: 88.0, lowestCostLaunch: 94.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-063'
  },

  // ──────────────────────────────────────────────────────────
  // idea-064: Verified Owner Answers — Cross-Retailer Q&A
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-064',
    legacyId: 'verified-owner-answers',
    slug: 'verified-owner-answers-cross-retailer-qa',
    name: 'Verified Owner Answers — Cross-Retailer Q&A Network',
    oneSentenceConcept: 'Receipt-verified past buyers earn a small bounty for answering product questions with short, evidence-backed video answers — providing the cross-retailer, buyer-funded verified Q&A that Amazon Answers and Social Ask have not.',
    elevatorPitch: 'Amazon and major retailers route product questions to past buyers — but only within their own platform. A cross-retailer, receipt-verified, buyer-funded Q&A network lets shoppers get answers from real owners regardless of where the product was purchased. The €5–€10 bounty compensates verified owners for a short, specific, video-evidenced answer.',
    detailedDescription: 'Product Q&A is widely used (67% of shoppers have asked a question [s47]) but the answers are often wrong, slow, or absent. Verified Owner Answers provides a cross-retailer version of Amazon Answers — but with receipt verification, buyer-funded bounties, and video evidence requirements rather than text-only answers.',
    category: 'Product verification & evidence',
    subcategory: 'data network',
    tags: ['Q&A', 'verified owner', 'cross-retailer', 'receipt verification', 'buyer-funded', 'Eighth Reset', 'finalist'],
    alternativeNames: ['Verified Owner Answers', 'Cross-Retailer Q&A', 'Owner Answer Network'],
    relatedIdeaIds: ['idea-061', 'idea-062', 'idea-069'],
    status: 'researched',
    sourceReferences: ['s08', 's09', 's14', 's15', 's44', 's47', 's48', 's49', 's50'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Finalist',
      notes: 'Ranked fourth in Eighth Reset. Strong structural case but faces strong free competition from existing retailer Q&A systems. Key differentiator: cross-retailer portability and receipt-verified identity.'
    },
    atAGlance: {
      targetCustomer: 'Online shoppers with model-level product experience questions (not listing-specific) that existing Q&A systems have not answered',
      problemSolved: 'Retailer Q&A answers are text-only, siloed per platform, often wrong or absent, and not verifiable by ownership status.',
      whatToBuild: 'A cross-retailer Q&A platform where buyers post a bounty for receipt-verified past owners to provide short, specific, video-evidenced answers. Answers link to product model IDs for portability.',
      howItMakesMoney: 'Platform fee on bounty. Future: answer royalties when reused; retailer API for verified answer data.',
      whyCustomersPay: 'The answer is from someone who actually owns the product, is verified by purchase receipt, and includes video evidence — uniquely trustworthy compared to current alternatives.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 500, midpoint: 15000, maximum: 80000, basis: 'Analyst projection' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 20, maximum: 100 },
      timeToMvp: '7–14 days',
      timeToFirstRevenue: '3–10 days',
      overallScore: 82.1,
      confidenceScore: 6.2,
      mainAdvantage: 'Receipt-verified ownership + cross-retailer portability is a genuinely novel trust layer',
      mainRisk: 'Retailers already email past buyers for free answers; receipt verification creates privacy friction; answers may still be subjective'
    },
    customer: {
      primaryCustomer: 'Shoppers with experience-based product questions (battery life, noise level, durability after 6 months, compatibility with my specific setup)',
      specificProblem: 'Model-level experiential questions cannot be answered by sellers and are inconsistently answered by existing Q&A systems.',
      customerPaysBecause: 'A receipt-verified, video-evidenced answer from a real owner is the most trustworthy answer type available [s14].'
    },
    risks: {
      productRisk: 'Owners give subjective or inconsistent answers even with video evidence',
      privacyRisk: 'Receipt verification requires collecting purchase metadata — privacy risk must be carefully managed [s29]',
      competitorRisk: 'Retailers already email past buyers for free answers [s48, s49]; this is a strong free alternative',
      mitigations: ['Minimize receipt metadata collected (partial fields only)', 'Local processing of receipt data where possible', 'Focus on cross-retailer questions where no free alternative exists']
    },
    scores: {
      problemSeverity: { value: 7.5, justification: 'Verified owner answers are the most valued Q&A source [s14]', confidence: 'medium', basis: 'PowerReviews survey' },
      customerWillingnessToPay: { value: 6.5, justification: 'Adjacent: Worthyt takes 20% on paid Q&A [s44]; product-specific willingness is lower than expert advice', confidence: 'low', basis: 'Adjacent market inference' },
      overallConfidence: { value: 6.2, justification: 'Strong concept but strong free competition and privacy complexity', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 82.1, bootstrappedPotential: 80.0, lowestCostLaunch: 93.0, fastestPathToRevenue: 84.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-064'
  },

  // ──────────────────────────────────────────────────────────
  // idea-065: Local Shelf Proof
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-065',
    legacyId: 'local-shelf-proof',
    slug: 'local-shelf-proof-retail-stock-evidence',
    name: 'Local Shelf Proof — Real-Time Retail Stock Evidence',
    oneSentenceConcept: 'Shoppers and AI shopping agents post a bounty for geotagged, timestamped evidence of current stock, price, and regional packaging at a specific local store — from a nearby verifier.',
    elevatorPitch: 'Online inventory systems are often wrong or stale. A buyer who needs current local stock, display configuration, or regional packaging before making a trip or a purchase can post a €5–€20 bounty for a nearby verifier to capture geotagged, timestamped shelf evidence. Builds the real-time retail evidence layer that shopping agents and local commerce need.',
    detailedDescription: 'Retailers publish inventory APIs, but they are often 24–72 hours stale. A local shopper, coupon hunter, or AI agent that needs to know whether a product is currently in stock, at what price, and what the regional packaging says cannot reliably get this from any existing source. Local Shelf Proof uses consumer-scale gig workers to capture timestamped, geotagged shelf evidence on demand.',
    category: 'Product verification & evidence',
    subcategory: 'consumer bounty exchange',
    tags: ['local', 'retail', 'shelf evidence', 'inventory', 'geotagged', 'shopping agents', 'gig', 'Eighth Reset', 'finalist'],
    alternativeNames: ['Local Shelf Proof', 'Shelf Evidence Network', 'Real-Time Retail Proof'],
    relatedIdeaIds: ['idea-061', 'idea-062', 'idea-068'],
    status: 'researched',
    sourceReferences: ['s20', 's23', 's24', 's25', 's26', 's40'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Finalist',
      notes: 'Ranked fifth in Eighth Reset. Strong consumer use case and shopping-agent applicability; main challenges are store permission for photography, verifier network cold start, and inventory change speed.'
    },
    atAGlance: {
      targetCustomer: 'Local shoppers, AI shopping agents, and cross-border buyers needing current stock, price, or regional packaging evidence at a specific store',
      problemSolved: 'Online inventory is stale; calling stores is slow and unreliable; no consumer-scale service provides on-demand geotagged retail shelf evidence.',
      whatToBuild: 'A gig-task marketplace for geotagged shelf evidence. Buyer posts store + product + evidence requirements + bounty. Nearby verifier captures timestamped shelf photo/video. Buyer pays only for complete evidence.',
      howItMakesMoney: 'Platform fee on each task. Future: API for shopping agents and local commerce platforms.',
      whyCustomersPay: 'A €5–€20 verifier task is cheaper than a wasted trip or a wrong local purchase. AI shopping agents need real-time local data they cannot get from stale retailer APIs.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 200, midpoint: 12000, maximum: 80000, basis: 'Analyst projection' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 0, maximum: 50 },
      timeToMvp: '3–7 days',
      timeToFirstRevenue: '1–5 days',
      overallScore: 78.3,
      confidenceScore: 6.0,
      mainAdvantage: 'Real-time retail data has strong shopping-agent demand; zero cold-start cost',
      mainRisk: 'Store photography may be prohibited; verifier must be physically nearby; inventory can change within minutes of proof delivery'
    },
    customer: {
      primaryCustomer: 'Local shoppers planning a store visit; AI shopping agents needing real-time local stock data',
      specificProblem: 'Online inventory is often wrong or stale; no consumer-scale service provides real-time geotagged retail evidence.',
      customerPaysBecause: 'Current stock, current price, and current regional packaging are worth €5–€20 to avoid a wasted trip or wrong purchase.'
    },
    risks: {
      operationalRisk: 'Store photography may be prohibited; verifier must be in close proximity',
      marketRisk: 'Inventory changes minutes after proof delivery — freshness claim must be very specific',
      competitorRisk: 'Gigwalk serves the enterprise version of this task [s26]; RentAHuman does adjacent tasks [s23, s24]',
      abuseRisk: 'Verifiers may misrepresent location or use old photos; anti-fraud requires GPS metadata and continuous capture'
    },
    scores: {
      problemSeverity: { value: 7.0, justification: 'Stale inventory frustrates local shoppers; high for AI agents', confidence: 'medium', basis: 'Analyst assessment' },
      operationalSimplicity: { value: 5.5, justification: 'Verifier network cold start and geolocation requirements add complexity', confidence: 'medium', basis: 'Operations analysis' },
      overallConfidence: { value: 6.0, justification: 'Strong demand case; significant operational and cold-start challenges', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 78.3, fastestPathToRevenue: 86.0, lowestCostLaunch: 92.0, bestLocalOpportunity: 88.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-065'
  },

  // ──────────────────────────────────────────────────────────
  // idea-066: Revision & Variant Proof Registry
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-066',
    legacyId: 'revision-variant-registry',
    slug: 'revision-variant-proof-registry',
    name: 'Revision & Variant Proof Registry',
    oneSentenceConcept: 'A model-level database documenting silent product revisions, regional suffixes, firmware variants, and packaging changes — evidenced by partially redacted labels and independent owner submissions.',
    elevatorPitch: 'The same product name can hide hardware revisions (different Wi-Fi chip, changed component), regional model variants, silent packaging changes, and firmware incompatibilities. The Revision & Variant Proof Registry lets owners submit label and firmware evidence to create a sourced, version-tracked map of what actually changed between product versions.',
    detailedDescription: 'Electronics, appliances, and accessories often have silent revisions that change compatibility, performance, or feature availability — but manufacturers rarely document them. Community wikis and forums track some revisions, but the data is unsourced, unsystematic, and fragile. A structured, evidence-backed registry with partially redacted serial-label evidence creates a durable, monetizable data asset.',
    category: 'Product verification & evidence',
    subcategory: 'data network',
    tags: ['revisions', 'variants', 'firmware', 'product data', 'registry', 'electronics', 'Eighth Reset', 'finalist', 'most resilient'],
    alternativeNames: ['Revision Registry', 'Variant Proof Registry', 'Product Revision Database'],
    relatedIdeaIds: ['idea-011', 'idea-062', 'idea-063', 'idea-068'],
    status: 'researched',
    sourceReferences: ['s22', 's38'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Finalist / Most Resilient',
      notes: 'Described in the Eighth Reset as the "most resilient overlooked product." Low moderation risk, strong reusable value. Main challenge: the initial buyer-payment event is less obvious than FactBounty.'
    },
    atAGlance: {
      targetCustomer: 'Electronics buyers who need to know whether a "same-name" product has been silently revised in ways that affect compatibility, performance, or features',
      problemSolved: 'Silent hardware revisions and regional model variants are poorly documented; existing databases (wikis, forums) are unsourced and inconsistent.',
      whatToBuild: 'A structured, evidence-backed product revision database with partial serial-label evidence. Owners submit label, firmware, and packaging evidence; editors verify and cross-reference; buyers unlock specific revision reports.',
      howItMakesMoney: 'Paid access to specific revision reports. API for retailers and comparison sites. Potentially: subscription for power buyers.',
      whyCustomersPay: 'Knowing that the current batch of a product includes a different Wi-Fi chip or removed feature is worth more than the cost of a wrong purchase.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 300, midpoint: 15000, maximum: 100000, basis: 'Analyst projection — payment mechanism less clear than FactBounty' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 10, maximum: 50 },
      timeToMvp: '5–14 days',
      timeToFirstRevenue: '7–30 days (less immediate than direct bounty model)',
      overallScore: 80.1,
      confidenceScore: 7.0,
      mainAdvantage: 'Extremely defensible data asset; low fraud risk; low moderation burden (label evidence has few safety implications)',
      mainRisk: 'Monetization path is less clear than FactBounty; manufacturers may be hostile to public revision documentation; data may become outdated as new batches ship'
    },
    customer: {
      primaryCustomer: 'Enthusiast electronics buyers, PC builders, and repair professionals who need to understand revision differences for purchasing or compatibility decisions',
      specificProblem: 'Silent product revisions can invalidate existing compatibility proofs, void warranties, or change performance — without any official documentation.',
      customerPaysBecause: 'A revision report that identifies whether the current batch has the problematic component is direct, actionable, purchase-blocking information.'
    },
    scores: {
      defensibility: { value: 8.5, justification: 'Sourced revision database with evidence links is extremely hard to replicate quickly', confidence: 'high', basis: 'Data moat analysis' },
      dataAdvantagePotential: { value: 9.0, justification: 'Each verified revision record compounds in value; manufacturers are the only ones who could produce equivalent data, and they choose not to', confidence: 'high', basis: 'Competitive analysis' },
      overallConfidence: { value: 7.0, justification: 'Strong data asset concept; weaker near-term revenue clarity than FactBounty', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 80.1, bestLongTermDefensibility: 90.0, bestForTechnicalFounder: 82.0, bootstrappedPotential: 80.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-066'
  },

  // ──────────────────────────────────────────────────────────
  // idea-067: Real-World Noise & Clearance Facts
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-067',
    legacyId: 'real-world-noise-clearance',
    slug: 'real-world-noise-clearance-facts',
    name: 'Real-World Noise & Clearance Facts',
    oneSentenceConcept: 'Owners capture standardized real-installed-behavior evidence (appliance noise levels, cable clearance, heat vent space requirements) using phone sensors and guided templates — with clear disclaimers that no lab-grade measurement is implied.',
    elevatorPitch: 'Product specs never tell you how loud a fridge actually is in a small apartment, how much clearance you need behind a NAS for cables, or whether a router fan is audible from 3 meters. Real-World Noise & Clearance Facts lets buyers fund short, standardized in-situ observations from real owners.',
    detailedDescription: 'A niche variant of the FactBounty concept focused on real-world installed behavior rather than physical dimensions or compatibility. Useful for home-office buyers, appliance purchasers, and PC builders who need qualitative or semi-quantitative real-world data. Requires careful disclaimers that phone sensors are not calibrated instruments.',
    category: 'Product verification & evidence',
    subcategory: 'consumer bounty exchange',
    tags: ['noise', 'clearance', 'heat', 'real-world behavior', 'appliances', 'home office', 'Eighth Reset'],
    alternativeNames: ['Noise & Clearance Facts', 'Real-World Behavior Evidence', 'Installed Behavior Bounty'],
    relatedIdeaIds: ['idea-061', 'idea-062'],
    status: 'explore',
    sourceReferences: ['s47'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Hold — recommend as a FactBounty template rather than standalone product',
      notes: 'Better positioned as a specialized evidence template within FactBounty than as a separate product. Phone sensor inconsistency creates measurement reliability challenges.'
    },
    atAGlance: {
      targetCustomer: 'Home-office buyers, apartment dwellers, and appliance buyers who need real-world installed behavior data',
      problemSolved: 'Specs never describe real installed noise, heat behavior, or cable clearance requirements.',
      whatToBuild: 'Specialized bounty templates for standardized noise/clearance observations. Best as a FactBounty feature rather than a standalone product.',
      howItMakesMoney: 'Same as FactBounty — platform fee on bounty.',
      whyCustomersPay: 'Knowing how loud a fridge is before buying it for a small kitchen is worth €3–€8.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 100, midpoint: 5000, maximum: 30000, basis: 'Analyst estimate — very speculative as standalone' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 0, maximum: 50 },
      timeToMvp: '3–7 days (as FactBounty template)',
      overallScore: 72.5,
      confidenceScore: 5.5,
      mainAdvantage: 'Useful specialized evidence type with clear consumer demand',
      mainRisk: 'Phone sensor inconsistency undermines measurement credibility; difficult to disclaim without reducing value'
    },
    scores: {
      easeOfMvp: { value: 9.0, justification: 'Can be launched as a FactBounty evidence template in days', confidence: 'high', basis: 'Technical assessment' },
      regulatorySimplicity: { value: 6.0, justification: 'Must clearly disclaim: not a lab measurement, no safety certification implied', confidence: 'medium', basis: 'Legal analysis' },
      overallConfidence: { value: 5.5, justification: 'Viable as FactBounty template; questionable as standalone', confidence: 'medium', basis: 'Eighth Reset assessment' }
    },
    compositeScores: { overallOpportunity: 72.5, fastestPathToRevenue: 80.0, lowestCostLaunch: 90.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-067'
  },

  // ──────────────────────────────────────────────────────────
  // idea-068: Product Evidence API for Shopping Agents
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-068',
    legacyId: 'product-evidence-api',
    slug: 'product-evidence-api-shopping-agents',
    name: 'Product Evidence API for Shopping Agents',
    oneSentenceConcept: 'AI shopping agents pay per evidence-backed, human-verified product fact rather than relying on unverified merchant specs — a B2B API layer built on top of the FactBounty evidence corpus.',
    elevatorPitch: 'Shopping agents have catalog data from merchants but lack physically verified facts: actual dimensions, compatibility proofs, revision status. The Product Evidence API provides a pay-per-fact endpoint where agents can retrieve human-verified product evidence with confidence scores, evidence provenance, and structured measurement data. Revenue model: per-call pricing or monthly subscription.',
    detailedDescription: 'The highest-upside infrastructure play in the product-verification category. The API is only valuable after a sufficient verified-fact corpus exists. Build FactBounty first; launch the API as the corpus reaches a threshold of coverage and quality. The timing is ideal given the rapid standardization of agentic commerce protocols (x402, UCP, AP2) in 2026.',
    category: 'Product verification & evidence',
    subcategory: 'B2B API',
    tags: ['API', 'shopping agents', 'B2B', 'agentic commerce', 'product data', 'infrastructure', 'Eighth Reset', 'high upside'],
    alternativeNames: ['Product Evidence API', 'Shopping Agent Evidence Endpoint', 'Verified Product Facts API'],
    relatedIdeaIds: ['idea-027', 'idea-061', 'idea-062', 'idea-063'],
    status: 'researched',
    sourceReferences: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's31', 's32', 's43'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Finalist / Highest Upside',
      notes: 'Ranked as highest-upside alternative in Eighth Reset but marked DEFER until the FactBounty evidence corpus is large enough to be useful. An API without facts is empty infrastructure.'
    },
    atAGlance: {
      targetCustomer: 'AI shopping assistants, comparison engines, retailer Q&A systems, and AR fit applications needing machine-readable verified product facts',
      problemSolved: 'Shopping agents have catalog data (prices, specs) but lack physically verified facts (actual dimensions, compatibility proofs, revision status) — the exact data layer needed for confident autonomous purchase recommendations.',
      whatToBuild: 'A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus.',
      howItMakesMoney: 'Per-call pricing (€0.01–€0.10 per fact retrieval). Monthly subscription tiers (€99–€499/month + usage overage). Custom data partnerships with major shopping platforms.',
      whyCustomersPay: 'Verified facts improve agent accuracy and reduce purchase regret — directly measurable in reduced return rates and higher user trust scores.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 298, midpoint: 20000, maximum: 310000, basis: 'Eighth Reset financial model: Tiny (2 partners × €199), Survival (20 accounts × €99 + usage), Strong (100 accounts), Exceptional (agent-commerce network)' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 40, maximum: 200, basis: 'Deferred until FactBounty corpus is large enough' },
      timeToMvp: '4–8 weeks (requires existing FactBounty corpus)',
      timeToFirstRevenue: '30–90 days (after corpus threshold)',
      overallScore: 85.7,
      confidenceScore: 6.0,
      mainAdvantage: 'Best software margins in the category; perfectly timed for agentic commerce protocol standardization; compounding value as corpus grows',
      mainRisk: 'Empty API without corpus is worthless; protocol changes could shift the integration surface; major shopping platforms may build their own'
    },
    customer: {
      primaryCustomer: 'Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits',
      economicBuyer: 'Engineering or product teams integrating fact verification into shopping agents',
      specificProblem: 'No reliable, machine-readable, evidence-backed product fact API exists; agents must rely on unverified merchant-supplied data.',
      customerPaysBecause: 'Verified facts reduce agent hallucination rates and improve user trust — directly measurable in user satisfaction and return rate metrics.'
    },
    profitability: {
      financialScenarios: {
        conservative: { accounts: 2, revenue: '€398/month', costs: '€100/month', profit: '€298/month', assumptions: 'Two design partners at €199/month; corpus just large enough to be useful' },
        baseCase: { accounts: 20, revenue: '€3,000/month', costs: '€1,000/month', profit: '€2,000/month', assumptions: '20 accounts + usage; established corpus; 1 dedicated API support person' },
        aggressive: { accounts: 100, revenue: '€30,000/month', costs: '€10,000/month', profit: '€20,000/month', assumptions: 'Agent-commerce integration; large corpus; enterprise partnerships' }
      }
    },
    risks: {
      productRisk: 'API without sufficient corpus has no value; corpus must reach critical density before API launch',
      platformRisk: 'x402, UCP, AP2 protocol evolution may change the integration surface; must track standard changes',
      mitigations: ['Build FactBounty corpus first — do not launch API until 1,000+ verified facts in target categories', 'Design API to be protocol-agnostic', 'Get design-partner commitments before full build']
    },
    scores: {
      grossMarginPotential: { value: 9.0, justification: 'API delivery is near-zero marginal cost once corpus is built', confidence: 'high', basis: 'Software margin analysis' },
      timing: { value: 9.5, justification: 'Agentic commerce protocol standardization in 2026 creates immediate demand', confidence: 'high', basis: 'Protocol announcements [s01–s07]' },
      overallConfidence: { value: 6.0, justification: 'High potential but requires FactBounty corpus to exist first — significant dependency risk', confidence: 'medium', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 85.7, bestEnterpriseOpportunity: 82.0, bestForTechnicalFounder: 90.0, bestRecurringRevenue: 80.0, bestLongTermDefensibility: 82.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-068'
  },

  // ──────────────────────────────────────────────────────────
  // idea-069: Receipt-Verified Purchase Data Exchange
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-069',
    legacyId: 'receipt-data-exchange',
    slug: 'receipt-verified-purchase-data-exchange',
    name: 'Receipt-Verified Purchase Data Exchange',
    oneSentenceConcept: 'A privacy-first marketplace where consumers monetize their anonymized, receipt-verified purchase data — enabling retailers and brands to acquire accurate, consent-based purchase intelligence.',
    elevatorPitch: 'Purchase history is highly valuable to retailers and brands but extremely sensitive to individuals. A consent-based, privacy-first exchange lets consumers share minimized, anonymized receipt data in exchange for small payments, while brands get accurate, actual-purchase data they cannot get from cookies or surveys.',
    detailedDescription: 'Consumer purchase data is extraordinarily sensitive — it can reveal health conditions, lifestyle, income level, and demographic attributes [s29]. Any exchange must be built on explicit consent, local processing, minimal data collection, and clear purpose limitation. The market for small data payments is real but values are often under $2 per consumer [s30]. Enterprise data products command higher prices when curated [s31].',
    category: 'Product verification & evidence',
    subcategory: 'data network',
    tags: ['purchase data', 'privacy', 'receipt', 'data marketplace', 'consumer', 'B2B data', 'Eighth Reset', 'high privacy risk'],
    alternativeNames: ['Receipt Data Exchange', 'Purchase Data Marketplace', 'Consumer Data Exchange'],
    relatedIdeaIds: ['idea-064', 'idea-069'],
    status: 'explore',
    sourceReferences: ['s27', 's28', 's29', 's30', 's31', 's37', 's38'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Hold — High Privacy Risk',
      notes: 'Lowest-ranked Eighth Reset finalist. Marked HIGH PRIVACY RISK. The privacy and legal complexity is severe; willingness-to-pay from consumers for their own data is very low [s30]. Preserve as an idea but clearly flag risks.'
    },
    atAGlance: {
      targetCustomer: 'Consumers who want to monetize their purchase data; retailers and brands who need accurate purchase intelligence',
      problemSolved: 'Brands lack access to accurate, consent-based purchase data across competing retailers; consumers cannot easily monetize their purchase history.',
      whatToBuild: 'A consent-based, privacy-first receipt data exchange with local processing, explicit purpose limitation, and consumer payment for data sharing. Explore DRP (Digital Receipt Protocol) as the technical standard.',
      howItMakesMoney: 'Take a cut from brand/retailer data purchases; consumer receives micro-payment per dataset shared.',
      whyCustomersPay: 'Brands pay for accurate, consent-based purchase data they cannot obtain elsewhere; consumers earn micro-payments for data they would otherwise give away for free.',
      estimatedEarningPotential: { currency: 'USD', minimum: 0, midpoint: 5000, maximum: 50000, basis: 'Highly speculative; depends on solving consent UX and legal compliance' },
      startupCost: { currency: 'USD', minimum: 40, midpoint: 500, maximum: 5000, basis: 'Legal compliance costs are the primary driver' },
      timeToMvp: '12–24 weeks (legal and privacy infrastructure required before launch)',
      timeToFirstRevenue: '90–180 days',
      overallScore: 68.3,
      confidenceScore: 4.5,
      mainAdvantage: 'Large addressable market if privacy can be solved; Digital Receipt Protocol provides technical infrastructure [s27, s28]',
      mainRisk: 'Purchase data is extraordinarily sensitive [s29]; consumer willingness-to-pay is very low (~under $2) [s30]; legal and regulatory complexity is severe; DO NOT BUILD without legal counsel'
    },
    customer: {
      primaryCustomer: 'Brands and retailers (pay for data); consumers (provide data in exchange for micro-payments)',
      specificProblem: 'Accurate, consent-based, cross-retailer purchase data is not available to brands through privacy-compliant means.',
      customerPaysBecause: 'Accurate purchase data reduces advertising waste and improves product development decisions.'
    },
    risks: {
      privacyRisk: 'CRITICAL — purchase data reveals health, lifestyle, income, and demographic attributes [s29]; GDPR, ePrivacy, and local laws create significant exposure',
      legalRisk: 'Purpose limitation, lawful basis, data minimization, and right to erasure all require specialist legal review',
      marketRisk: 'Consumer willingness to share purchase data for micro-payments is very low [s30]; brands already have alternative data sources',
      mitigations: ['Do not launch without comprehensive legal review in every target jurisdiction', 'Start with category-level aggregate data, not individual transaction records', 'Use local on-device processing only; never transmit raw receipts']
    },
    scores: {
      regulatorySimplicity: { value: 2.0, justification: 'GDPR, ePrivacy, and multiple national laws create severe compliance burden', confidence: 'high', basis: 'Legal analysis [s29, s37]' },
      customerWillingnessToPay: { value: 4.0, justification: 'Consumer data sharing values often under $2; brand data purchase values higher but require scale [s30, s31]', confidence: 'medium', basis: 'Academic research' },
      overallConfidence: { value: 4.5, justification: 'High privacy risk, low consumer WTP, severe regulatory complexity — explore only with legal budget', confidence: 'high', basis: 'Eighth Reset scoring' }
    },
    compositeScores: { overallOpportunity: 68.3, bestForNontechnicalFounder: 20.0, bestRequiringLittleCapital: 40.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-069'
  },

  // ──────────────────────────────────────────────────────────
  // idea-070: Seller ProofLink — Guided Listing Verification
  // ──────────────────────────────────────────────────────────
  {
    schemaVersion: '2.0.0',
    id: 'idea-070',
    legacyId: 'seller-prooflink',
    slug: 'seller-prooflink-guided-listing-verification',
    name: 'Seller ProofLink — Guided Listing Verification',
    oneSentenceConcept: 'Sellers embed a FactBounty-style capture link in their listings so prospective buyers can request one specific piece of guided, challenge-code-verified evidence directly from the seller — converting browsing hesitation into completed purchases.',
    elevatorPitch: 'Instead of buyers hunting for a verifier, sellers proactively include a "Request proof" link on their listings. The buyer clicks, posts a €3–€8 question, and the seller records browser-native evidence with a random challenge code. The seller gets paid a small evidence fee; the buyer gets verified evidence; the marketplace benefits from reduced returns and fewer disputes.',
    detailedDescription: 'Seller ProofLink is the seller-initiated, listing-level variant of FactBounty — complementary rather than competing. It targets sellers who want to differentiate their listings through verified evidence and buyers who prefer to get evidence directly from the person selling the item. This is closer to the VidVerity and Swappa model but adds the FactBounty challenge-code capture flow.',
    category: 'Product verification & evidence',
    subcategory: 'seller tool',
    tags: ['seller tool', 'listing verification', 'marketplace', 'second-hand', 'evidence', 'Eighth Reset'],
    alternativeNames: ['Seller ProofLink', 'Listing Evidence Link', 'ProofLink for Sellers'],
    relatedIdeaIds: ['idea-026', 'idea-061', 'idea-070'],
    status: 'explore',
    sourceReferences: ['s16', 's17', 's18', 's19', 's21', 's46'],
    provenance: {
      sourceType: 'Deep Research — Eighth Full Reset (2026-08-02)',
      originalRank: 'Hold — Crowded',
      notes: 'Marked "PASS BUT CROWDED" in the Eighth Reset cost audit. Vinted, StockX, Swappa, and VidVerity all serve adjacent needs. ProofLink is worth exploring as a complement to FactBounty rather than a standalone product.'
    },
    atAGlance: {
      targetCustomer: 'Second-hand marketplace sellers who want to differentiate their listings; buyers who want specific evidence from the actual seller',
      problemSolved: 'Buyers hesitate on listings that lack specific evidence; sellers lose sales to hesitation that a single verified fact could resolve.',
      whatToBuild: 'A simple embeddable link/widget that sellers include in listings. Buyer clicks → posts a question → seller records evidence with challenge code → seller gets paid small evidence fee → listing converts.',
      howItMakesMoney: 'Platform fee on each evidence request. Seller subscription for multi-listing access. API for marketplace platforms.',
      whyCustomersPay: 'Sellers pay to convert more listings; buyers pay to get evidence directly from the seller with tamper-evident capture.',
      estimatedEarningPotential: { currency: 'EUR', minimum: 200, midpoint: 8000, maximum: 60000, basis: 'Analyst projection — market is crowded' },
      startupCost: { currency: 'EUR', minimum: 0, midpoint: 20, maximum: 100 },
      timeToMvp: '5–10 days',
      timeToFirstRevenue: '3–10 days',
      overallScore: 74.2,
      confidenceScore: 5.8,
      mainAdvantage: 'Sellers are motivated to provide evidence; platform network effect possible through marketplace API integrations',
      mainRisk: 'Vinted, StockX, Swappa, and VidVerity already serve this space; sellers may refuse off-platform capture links to avoid liability'
    },
    customer: {
      primaryCustomer: 'Second-hand marketplace sellers who want to differentiate their listings; buyers on those platforms',
      specificProblem: 'Buyers have specific questions about listed items that text descriptions and uploaded photos do not answer; sellers have no standard way to provide verified real-time evidence.',
      customerPaysBecause: 'Sellers: higher conversion rate justifies small evidence fee. Buyers: the challenge-code capture provides tamper-evident evidence that uploaded photos cannot.'
    },
    risks: {
      competitorRisk: 'Vinted [s17], StockX [s16], Swappa [s46], VidVerity [s18] all serve adjacent needs; differentiation must be in cross-platform portability and challenge-code capture',
      platformRisk: 'Seller recruitment requires marketplace API access or direct seller relationships; incumbents may block external evidence links'
    },
    scores: {
      competitiveIntensity: { value: 5.0, justification: 'Many incumbents serve adjacent listing-verification needs — score reflects HIGH competition (5 = moderate-high intensity)', confidence: 'medium', basis: 'Competitor research [s16, s17, s18, s46]' },
      overallConfidence: { value: 5.8, justification: 'Viable but crowded; best as FactBounty complement rather than standalone', confidence: 'medium', basis: 'Eighth Reset cost audit' }
    },
    compositeScores: { overallOpportunity: 74.2, fastestPathToRevenue: 82.0, bestMarketplaceOpportunity: 70.0, lowestCostLaunch: 90.0 },
    updatedAt: now, createdAt: '2026-08-06',
    researchSource: 'Deep Research — Eighth Full Reset (2026-08-02)',
    extractionLedgerEntry: 'led-070'
  }
];

// Append to existing array
const combined = [...existing, ...newIdeas];
fs.writeFileSync(ideasPath, JSON.stringify(combined, null, 2));
console.log(`✓ Appended ${newIdeas.length} new ideas. Total: ${combined.length} ideas.`);
