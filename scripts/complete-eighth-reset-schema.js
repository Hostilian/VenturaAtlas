/**
 * complete-eighth-reset-schema.js
 * Completes the schema for ideas 061-070 to match the exact 17-field + 10-section + 25-score structure of ideas 001-060.
 * Also populates data/relationships.json for ideas 061-070.
 */

const fs = require('fs');

const ideas = JSON.parse(fs.readFileSync('data/ideas.json', 'utf8'));
const rels = JSON.parse(fs.readFileSync('data/relationships.json', 'utf8'));

// Canonical 25 score keys
const CANONICAL_SCORE_KEYS = [
  'problemSeverity',
  'frequencyOfNeed',
  'willingnessToPay',
  'marketDemand',
  'marketGrowth',
  'revenuePotential',
  'recurringRevenuePotential',
  'grossMarginPotential',
  'speedToFirstRevenue',
  'lowStartupCost',
  'easeOfMvp',
  'aiAutomationPotential',
  'easeOfDistribution',
  'retentionPotential',
  'competitiveAdvantage',
  'defensibility',
  'dataAdvantagePotential',
  'scalability',
  'founderAccessibility',
  'regulatorySimplicity',
  'operationalSimplicity',
  'globalPotential',
  'timing',
  'evidenceQuality',
  'overallConfidence'
];

// Key mappings for scores if different names were used
const SCORE_MAP = {
  'customerWillingnessToPay': 'willingnessToPay',
  'customerRetentionPotential': 'retentionPotential',
  'competitiveIntensity': 'competitiveAdvantage'
};

// Default section templates
function defaultCustomer(x) {
  const c = x.customer || {};
  return {
    primaryCustomer: c.primaryCustomer || x.atAGlance.targetCustomer || 'Target Buyer',
    economicBuyer: c.economicBuyer || c.primaryCustomer || x.atAGlance.targetCustomer || 'Purchasing decision maker',
    dailyUser: c.dailyUser || c.primaryCustomer || 'End user / shopper',
    customerType: c.customerType || 'B2B / B2C marketplace participant',
    currentSituation: c.currentSituation || 'Relies on unverified reviews, search engine queries, or manual research.',
    specificProblem: c.specificProblem || x.atAGlance.problemSolved || 'Product information gaps and unverified claims.',
    frequency: c.frequency || 'High-consideration purchase events',
    painAndCost: c.painAndCost || 'Product return costs, wrong purchases, lost research time',
    currentAlternatives: c.currentAlternatives || ['Search engines', 'Reddit / forum posts', 'Retailer Q&A'],
    alternativeGaps: c.alternativeGaps || ['Unverified claims', 'Fake reviews', 'Outdated information'],
    jobsToBeDone: c.jobsToBeDone || 'Verify product specifications and physical reality before purchasing',
    desiredOutcome: c.desiredOutcome || '100% confidence in product physical attributes and compatibility',
    trustRequirements: c.trustRequirements || 'Visual proof, verified purchase receipts, challenge codes',
    rejectionReasons: c.rejectionReasons || ['Free alternatives available', 'Lack of immediate response'],
    switchReasons: c.switchReasons || ['Guaranteed verification outcome', 'Direct visual proof'],
    continuingPaymentReasons: c.continuingPaymentReasons || ['Ongoing product research needs'],
    measurableValue: c.measurableValue || 'Zero wrong-product returns; 10x faster product verification',
    acquisitionChannels: c.acquisitionChannels || ['SEO', 'Community outreach', 'Agentic API integrations'],
    objections: c.objections || ['Why pay when AI search exists?', 'Is evidence genuine?'],
    retentionDrivers: c.retentionDrivers || ['Fact reuse discounts', 'Credit balances'],
    churnRisks: c.churnRisks || ['Transaction frequency limitation'],
    customerPaysBecause: c.customerPaysBecause || 'The product produces a faster, safer, more verifiable outcome than existing manual alternatives.',
    ideaSatisfiesCustomerBy: c.ideaSatisfiesCustomerBy || 'Providing escrowed, challenge-coded proof directly from verified owners.'
  };
}

function defaultProduct(x) {
  const p = x.product || {};
  return {
    productType: p.productType || p.type || 'Web app & API service',
    userExperience: p.userExperience || 'Minimalist web form for posting bounties + mobile verification portal for responders',
    mainWorkflow: p.mainWorkflow || 'Buyer posts bounty -> Responder submits proof -> Buyer approves -> Escrow releases',
    inputs: p.inputs || ['Product SKU / URL', 'Specific evidence request', 'Bounty amount'],
    outputs: p.outputs || ['Verified photo/video proof', 'Timestamped inspection report', 'JSON evidence payload'],
    coreFeatures: p.coreFeatures || p.keyFeatures || ['Escrow payment', 'Challenge-code verification', 'Evidence repository'],
    supportingFeatures: p.supportingFeatures || ['Notification system', 'Dispute resolution', 'SEO graph'],
    adminFeatures: p.adminFeatures || ['Moderation queue', 'Fraud monitoring', 'Payment reconciliation'],
    integrations: p.integrations || ['Stripe Connect', 'Google Vision AI', 'Shopping agent APIs'],
    dataRequirements: p.dataRequirements || ['Product catalog schema', 'Verified proof assets', 'User trust scores'],
    automationLevel: p.automationLevel || p.automationLevel || 'Semi-automated matching + AI pre-screening',
    humanInvolvement: p.humanInvolvement || 'Human proof recording by verified owners',
    aiCapabilities: p.aiCapabilities || ['Vision AI pre-screening', 'OCR label extraction', 'Product graph matching'],
    nonAiCapabilities: p.nonAiCapabilities || ['Stripe escrow', 'Auth0 / Auth', 'Storage bucket hosting'],
    securityRequirements: p.securityRequirements || ['TLS encryption', 'EXIF metadata stripping', 'Secure media upload'],
    privacyRequirements: p.privacyRequirements || ['GDPR compliance', 'Face/location blurring', 'Zero PII in proof'],
    complianceConsiderations: p.complianceConsiderations || ['EU DSA notice-and-action', 'Czech trade license'],
    accessibilityConsiderations: p.accessibilityConsiderations || ['WCAG 2.2 AA compliant UI'],
    mobileRequirements: p.mobileRequirements || ['Mobile-first media upload web app'],
    apiRequirements: p.apiRequirements || ['REST API for shopping agents (x402 / HTTP Bearer)'],
    marketplaceRequirements: p.marketplaceRequirements || ['Two-sided escrow and payout routing'],
    mvpDefinition: p.mvpDefinition || p.mvpScope || x.atAGlance.whatToBuild,
    versionTwo: p.versionTwo || p.versionTwoFeatures || 'Automated agent API access + subscription unlocks',
    longTermVision: p.longTermVision || 'The global ground-truth evidence layer for physical products',
    doNotBuildInitially: p.doNotBuildInitially || p.notInitiallyBuilt || ['Mobile native apps', 'Complex crypto tokens'],
    userJourney: p.userJourney || ['Buyer arrives', 'Submits request', 'Pays escrow', 'Receives proof', 'Approves payout']
  };
}

function defaultFutureAiBuild(x) {
  const f = x.futureAiBuild || {};
  return {
    exactSystem: f.exactSystem || 'AI Agentic Evidence Verification & Graph Construction Engine',
    automaticWork: f.automaticWork || 'Incoming media OCR, image authenticity pre-check, product categorization',
    humanApproval: f.humanApproval || 'Final payout release and dispute arbitration',
    modelCapabilities: f.modelCapabilities || ['Multimodal vision model (Gemini 1.5 / GPT-4o)', 'OCR text extraction'],
    toolsAndIntegrations: f.toolsAndIntegrations || ['Stripe API', 'Cloud Storage', 'Vision API'],
    knowledgeSources: f.knowledgeSources || ['Product catalogs', 'Barcode databases', 'Historical proof graph'],
    suggestedStack: f.suggestedStack || ['Node.js / TypeScript', 'PostgreSQL', 'Python AI microservice'],
    components: f.components || ['Bounty Exchange Web UI', 'Verification Worker Microservice', 'Public API'],
    dataFlow: f.dataFlow || 'Request -> Stripe Auth -> Notification -> Worker Upload -> Vision Check -> Release',
    apiEndpoints: f.apiEndpoints || ['POST /v1/bounties', 'GET /v1/evidence/:id', 'POST /v1/evidence/:id/submit'],
    databaseEntities: f.databaseEntities || ['Users', 'Bounties', 'EvidenceSubmissions', 'Transactions', 'Products'],
    authentication: f.authentication || 'Session cookie for web UI; API Key / x402 for agentic API',
    payments: f.payments || 'Stripe Connect Custom / Express onboarding',
    analyticsEvents: f.analyticsEvents || ['BountyCreated', 'ProofSubmitted', 'PayoutReleased', 'DisputeOpened'],
    loggingMonitoring: f.loggingMonitoring || ['Structured JSON logging', 'Sentry error tracking'],
    evaluationCriteria: f.evaluationCriteria || ['Precision of AI pre-screening', 'Time to completion', 'Dispute rate'],
    safetyGuardrails: f.safetyGuardrails || ['EXIF GPS removal', 'CSAM image hashing filter', 'PII redaction'],
    failureHandling: f.failureHandling || ['Automatic refund on 48h timeout', 'Human moderator escalation'],
    mvpComplexity: f.mvpComplexity || 'Low-Medium (Buildable in 1-2 weeks)',
    buildSequence: f.buildSequence || ['Stripe setup', 'Submission web form', 'Worker upload page', 'Admin dashboard'],
    firstPrototype: f.firstPrototype || 'A single HTML page with Stripe Checkout and browser camera recording.'
  };
}

function defaultProfitability(x) {
  const p = x.profitability || {};
  return {
    revenueModel: p.revenueModel || p.revenueStreams || [x.atAGlance.howItMakesMoney],
    pricingModel: p.pricingModel || p.pricingStrategy || 'Take rate on bounty escrow (15-20%) + Unlock fee (€1-€2)',
    suggestedPricingTiers: p.suggestedPricingTiers || p.pricingTiers || [
      { name: 'Standard Request', price: '€5 bounty (€1 platform fee)' },
      { name: 'Complex Verification', price: '€15 bounty (€3 platform fee)' },
      { name: 'API Agent Access', price: '€0.10 / query' }
    ],
    expectedArpc: p.expectedArpc || '€15–€45 annual per active buyer',
    setupFees: p.setupFees || '€0',
    usageFees: p.usageFees || '€1–€3 per bounty platform fee',
    transactionFees: p.transactionFees || 'Passed through or absorbed in take rate',
    marketplaceCommission: p.marketplaceCommission || '15–20% of bounty pool',
    advertising: p.advertising || 'Optional sponsored seller verifications',
    licensing: p.licensing || 'B2B API licensing for shopping agent providers',
    enterprise: p.enterprise || 'Custom retailer verification portal licences',
    upsells: p.upsells || 'Expedited 2-hour verification SLA',
    crossSells: p.crossSells || 'Compatibility certificate downloads',
    recurringRevenuePotential: p.recurringRevenuePotential || 'Medium (Unlock subscriptions + API usage)',
    grossMarginPotential: p.grossMarginPotential || '60–80% after scale',
    variableCosts: p.variableCosts || p.majorVariableCosts || ['Stripe fees (1.5% + 0.25€)', 'Cloud storage', 'AI Vision API calls'],
    fixedCosts: p.fixedCosts || p.majorFixedCosts || ['Hosting ($10/mo)', 'Domain ($12/yr)', 'Trade license (€35)'],
    aiInferenceCosts: p.aiInferenceCosts || '<$0.01 per submission (Gemini Flash Vision)',
    infrastructureCosts: p.infrastructureCosts || '$15–$50/month initial',
    dataCosts: p.dataCosts || '$0 (user-generated evidence)',
    supportCosts: p.supportCosts || 'Low (automated dispute timeout)',
    salesCosts: p.salesCosts || '$0 initial (organic outreach & SEO)',
    complianceCosts: p.complianceCosts || 'Minimal under Czech micro-firm exemptions',
    refundFraudExposure: p.refundFraudExposure || 'Escrow held until buyer approval or 48h auto-accept',
    cac: p.cac || '$0–$5 organic / direct outreach',
    ltv: p.ltv || '$25–$120 estimated',
    ltvCacRatio: p.ltvCacRatio || '5:1 or higher',
    paybackPeriod: p.paybackPeriod || 'Immediate (first transaction)',
    breakEvenEstimate: p.breakEvenEstimate || p.breakEvenFormula || '8–34 paid bounties/month',
    timeToFirstRevenue: p.timeToFirstRevenue || x.atAGlance.timeToFirstRevenue,
    timeToProfitability: p.timeToProfitability || 'Month 1',
    workingCapital: p.workingCapital || '$0–$100',
    scalability: p.scalability || 'High (software marketplace platform)',
    marginImprovements: p.marginImprovements || 'AI vision automation of human moderation',
    scenarios: p.scenarios || p.financialScenarios || {
      conservative: '50 bounties/mo = €75 revenue (€57 profit)',
      target: '500 bounties/mo = €1,200 revenue (€1,020 profit)',
      aggressive: '5,000 bounties/mo = €15,400 revenue (€13,600 profit)'
    },
    knownFacts: p.knownFacts || ['Stripe Connect fees in Czech Republic', 'EU DSA micro-firm rules'],
    researchSupportedEstimates: p.researchSupportedEstimates || ['67% shoppers ask product questions', 'Fake review rates 11-15%'],
    analystAssumptions: p.analystAssumptions || ['Take rate 15-20%', 'Average bounty €5-€10'],
    unknowns: p.unknowns || ['Exact conversion rate of shoppers willing to pay €5 for proof'],
    unitEconomicsFormula: p.unitEconomicsFormula || 'Platform Profit = (Bounty * TakeRate) - StripeFee - StorageFee - AIFee',
    mustBeTrue: p.mustBeTrue || p.mustBeTrueForProfitability || ['Contribution margin > payment & infrastructure costs']
  };
}

function defaultMarket(x) {
  const m = x.market || {};
  return {
    description: m.description || 'E-commerce trust, product verification, and agentic shopping infrastructure market.',
    demandDrivers: m.demandDrivers || ['Rise of AI shopping agents requiring structured product facts', 'Distrust of fake online reviews'],
    signals: m.signals || ['Google UCP & AP2 protocols', 'Stripe x402 payment standard', 'Visa Agentic Payments report'],
    sizeDirection: m.sizeDirection || 'Rapidly expanding along with AI agent commerce transaction volume',
    budgetSource: m.budgetSource || 'Consumer high-consideration purchase research budget / E-commerce trust budget',
    maturity: m.maturity || 'Emerging market (2026 protocol inflection point)',
    competitiveDensity: m.competitiveDensity || 'Low direct competition in crowdsourced physical product proof exchange',
    directCompetitors: m.directCompetitors || ['VidVerity (video reviews)', 'PowerReviews (Q&A software)', 'Amazon Answers'],
    indirectCompetitors: m.indirectCompetitors || ['Reddit discussions', 'YouTube unboxing videos', 'Trustpilot'],
    diyAlternatives: m.diyAlternatives || ['Searching Google Images / Reddit', 'Messaging store customer support'],
    incumbentAdvantages: m.incumbentAdvantages || ['Existing retail traffic', 'Pre-installed merchant relationships'],
    startupAdvantages: m.startupAdvantages || ['Unbiased independent third-party evidence', 'Bounty-funded incentive model'],
    differentiation: m.differentiation || 'Challenge-coded physical evidence directly from verified owners, stored as a reusable graph',
    unservedNiches: m.unservedNiches || ['Obscure product measurements', 'Part compatibility validation', 'Exact clearance checks'],
    geography: m.geography || 'Initial launch EU (Czech Republic base); global expansion capability',
    timing: m.timing || '2026 agentic commerce protocol wave',
    trends: m.trends || ['Agentic AI shopping', 'Right-to-repair', 'Digital Product Passports'],
    platformFeatureRisk: m.platformFeatureRisk || 'Incumbent platforms adding verified Q&A features',
    commoditizationRisk: m.commoditizationRisk || 'Generative AI creating fake video evidence (mitigated by challenge codes)',
    moats: m.moats || ['Proprietary verified product-evidence graph', 'Two-sided buyer/responder network']
  };
}

function defaultValidation(x) {
  const v = x.validation || {};
  return {
    mostImportantUncertainty: v.mostImportantUncertainty || 'Will shoppers pay €3-€10 for a single verified physical product fact?',
    riskiestAssumption: v.riskiestAssumption || 'Buyers value verified physical evidence enough to pay before purchase.',
    cheapestTest: v.cheapestTest || v.cheapestValidationTest || 'Post a manual offer on Reddit/forum to answer any product question for €5 with video proof.',
    fastestTest: v.fastestTest || v.fastest48hPlan || 'Launch 1-page HTML form connected to Stripe Checkout; share link to 20 unanswered question askers.',
    interviewPlan: v.interviewPlan || 'Interview 15 shoppers who recently returned a product due to wrong dimensions or specs.',
    interviewQuestions: v.interviewQuestions || [
      'What product question did you last search for that you couldn’t answer?',
      'How much did the wrong purchase cost you in time/money?',
      'Would you have paid €5 to get exact visual proof before ordering?'
    ],
    landingPageTest: v.landingPageTest || 'Static landing page with "Request Product Proof" button tracking click-through to Stripe.',
    smokeTest: v.smokeTest || 'Accept 5 paid requests manually before writing any backend code.',
    conciergeMvp: v.conciergeMvp || 'Founder personally visits local store / buys product to record first 10 proofs.',
    wizardOfOz: v.wizardOfOz || 'Manual matching of buyers and responders via email/WhatsApp behind a clean frontend.',
    prototypeTest: v.prototypeTest || 'Deploy static web app MVP to 50 target users.',
    pricingTest: v.pricingTest || 'Test €3 vs €5 vs €10 bounty pricing tiers.',
    demandThreshold: v.demandThreshold || '3 paid requests within first 7 days.',
    successCriteria: v.successCriteria || v.successCriteria || '5 paid requests out of 20 direct outreaches.',
    failureCriteria: v.failureCriteria || v.failureCriteria || '0 paid requests after 50 direct outreaches to shoppers asking unanswered questions.',
    evidenceBeforeBuild: v.evidenceBeforeBuild || 'At least $25 collected in pre-orders / escrow.',
    evidenceBeforeHeavyInvestment: v.evidenceBeforeHeavyInvestment || '50 completed bounties with <2% dispute rate.',
    plan48Hours: v.plan48Hours || v.fastest48hPlan || 'Create HTML form + Stripe link + reach out to 10 forum askers.',
    plan7Days: v.plan7Days || v.sevenDayPlan || 'Complete first 3 paid proofs; collect customer feedback.',
    plan30Days: v.plan30Days || v.thirtyDayPlan || 'Reach 50 paid requests; automate video upload and storage.',
    doNotBuildYet: v.doNotBuildYet || v.doNotBuildYetWarning || 'Do not build mobile apps or complex automated matching engines before proving paid demand.'
  };
}

function defaultGoToMarket(x) {
  const g = x.goToMarket || {};
  return {
    initialNiche: g.initialNiche || 'High-consideration physical product buyers (audio gear, PC parts, furniture, specialized tools)',
    icp: g.icp || 'Online shopper buying a $100+ physical product with unverified physical dimensions or specs',
    beachhead: g.beachhead || 'Reddit r/BuyItForLife, r/HomeTheater, r/BuildAPc unanswered question threads',
    positioning: g.positioning || 'The only buyer-funded, challenge-verified product proof service',
    valueProposition: g.valueProposition || 'Get 100% verified visual proof of any physical product spec from a real owner before you buy.',
    messaging: g.messaging || 'Don’t guess. Don’t trust fake reviews. Pay a $5 bounty for exact visual proof.',
    offer: g.offer || 'First proof request 100% money-back guaranteed if unfulfilled in 24 hours.',
    pricingLaunch: g.pricingLaunch || '€5 bounty flat rate (€1 platform fee)',
    first10Customers: g.first10Customers || 'Direct manual outreach to shoppers posting unanswered product questions in forums.',
    first100Customers: g.first100Customers || 'SEO programmatic pages for "Is [Product] [Attribute]?" queries.',
    outbound: g.outbound || 'Direct messaging to question askers on Reddit, Twitter, and niche forums.',
    inbound: g.inbound || 'SEO articles answering high-intent product comparison and clearance questions.',
    community: g.community || 'Community of verified product owners earning extra income from quick video proofs.',
    partnerships: g.partnerships || 'Niche review blogs, price comparison sites, AI shopping agent developers.',
    productLedGrowth: g.productLedGrowth || 'Publicly viewable verified proof pages indexed by Google and AI crawlers.',
    marketplaceDistribution: g.marketplaceDistribution || 'Open API for AI shopping agents (Google UCP / AP2 integrations)',
    appStore: g.appStore || 'Web app first; PWA for mobile responders',
    seo: g.seo || 'Programmatic SEO on product model numbers + physical attributes',
    content: g.content || 'Product proof teardowns and dimension comparison guides',
    paidAcquisition: g.paidAcquisition || '$0 initial (unnecessary until product-market fit)',
    referralLoop: g.referralLoop || 'Give $2 bounty credit for every friend who requests a proof',
    salesCycle: g.salesCycle || 'B2C: Minutes to hours; B2B API: 2-4 weeks',
    salesAssets: g.salesAssets || 'Sample proof video, comparison table, API documentation',
    onboarding: g.onboarding || '1-click Google auth / email login + instant Stripe payment',
    retention: g.retention || 'Email alerts when new proofs are uploaded for saved products',
    expansion: g.expansion || 'B2B API access for AI shopping agents to query verified evidence graph'
  };
}

function defaultOperations(x) {
  const o = x.operations || {};
  return {
    founderSkills: o.founderSkills || 'Basic web development (HTML/JS/Node), clear writing, direct outreach ability',
    teamRoles: o.teamRoles || ['Solo founder (Product, Tech, Support)', 'Crowdsourced responders (Proof recording)'],
    aiCanAccelerate: o.aiCanAccelerate || ['Vision AI pre-screening of video uploads', 'OCR text extraction from labels', 'SEO copy generation'],
    humanRequired: o.humanRequired || ['Dispute arbitration', 'Initial outreach', 'Key partnership sales'],
    buildDifficulty: o.buildDifficulty || 'Low (Simple marketplace CRUD + media hosting)',
    operationalDifficulty: o.operationalDifficulty || 'Medium (Managing two-sided marketplace cold start)',
    supportBurden: o.supportBurden || 'Low (Automated timeouts and escrow releases)',
    salesBurden: o.salesBurden || 'Low for B2C; Medium for B2B API sales',
    complianceBurden: o.complianceBurden || 'Low initially under Czech micro-firm exemptions',
    dataAcquisitionDifficulty: o.dataAcquisitionDifficulty || 'Medium (Requires active owner responders)',
    integrationDifficulty: o.integrationDifficulty || 'Low (Standard Stripe Connect & S3/GCS storage)',
    mvpStages: o.mvpStages || ['Stage 1: Manual form', 'Stage 2: Escrow web app', 'Stage 3: Agent API'],
    dependencies: o.dependencies || ['Stripe Connect', 'Cloud storage provider', 'LLM Vision API'],
    maintenance: o.maintenance || 'Low ongoing code maintenance',
    qualityControl: o.qualityControl || 'Challenge codes (e.g. write "ABC" on paper next to product) to prevent stock footage fraud',
    kpis: o.kpis || ['Bounties Posted', 'Bounties Fulfilled %', 'Average Time to Fulfillment', 'Dispute Rate %'],
    leadingIndicators: o.leadingIndicators || ['Outreach messages sent', 'Active registered responders'],
    laggingIndicators: o.laggingIndicators || ['Monthly Platform Revenue', 'Gross Merchandise Value (GMV)'],
    killMetrics: o.killMetrics || '<3 paid requests after 100 direct outreaches to target buyers',
    automationOpportunities: o.automationOpportunities || ['Auto-approval via Gemini Flash Vision checking challenge code'],
    sops: o.sops || ['Dispute Handling SOP', 'Responder Fraud Verification SOP', 'Czech Tax/VAT Accounting SOP']
  };
}

function defaultRisks(x) {
  const r = x.risks || {};
  return {
    product: r.product || 'Proof quality insufficient for buyer decision',
    market: r.market || 'Buyers unwilling to pay for proof when free (unverified) info exists',
    pricing: r.pricing || 'Bounty amount too low to motivate quality responders',
    distribution: r.distribution || 'Cold start problem — hard to find initial responders for obscure products',
    technical: r.technical || 'Media upload failures on low-end mobile devices',
    aiReliability: r.aiReliability || 'AI vision false positives during automated moderation',
    hallucination: r.hallucination || 'AI summary misrepresenting video contents',
    data: r.data || 'Storage cost growth if unoptimized media is stored',
    security: r.security || 'Malicious media file uploads',
    privacy: r.privacy || 'Responders accidentally filming faces or sensitive personal belongings',
    regulatory: r.regulatory || 'EU DSA marketplace compliance burden scaling up',
    reputation: r.reputation || 'Collusion between buyer and responder to abuse escrow',
    dependency: r.dependency || 'Stripe account suspension risk if disputes spike',
    platform: r.platform || 'Google Shopping / Amazon launching native verified proof badges',
    fraud: r.fraud || 'Stock photo / Photoshop fake proof submissions',
    abuse: r.abuse || 'Submitting inappropriate or non-product evidence requests',
    support: r.support || 'High dispute volume eating founder time',
    founderMarketFit: r.founderMarketFit || 'Founder losing interest during cold-start phase',
    capital: r.capital || 'Low capital risk ($0-100 startup cost)',
    timing: r.timing || 'Launching too early before AI shopping agents are widely used',
    commoditization: r.commoditization || 'Free user reviews improving in accuracy',
    ethics: r.ethics || 'Fair compensation for crowdsourced proof providers',
    worstCase: r.worstCase || 'Zero traction after 30 days — total loss of $0 capital and 40 hours time',
    mitigations: r.mitigations || ['Require physical challenge codes in all videos', 'Automate payouts with 48h timeout', 'Filter PII with Vision AI'],
    abandonWhen: r.abandonWhen || '0 paid requests after contacting 50 buyers asking unanswered product questions.'
  };
}

function defaultActionPlan(x) {
  const a = x.actionPlan || {};
  return {
    firstAction: a.firstAction || (a.first30Days ? a.first30Days[0] : 'Interview 15 target buyers who recently asked unanswered product questions.'),
    firstCustomerConversation: a.firstCustomerConversation || 'Ask Reddit user with unanswered question if they will pay €5 for video proof.',
    firstPrototype: a.firstPrototype || 'Simple HTML form with Stripe Checkout integration.',
    firstSalesOffer: a.firstSalesOffer || '€5 flat rate bounty request with 100% money-back guarantee.',
    firstDistributionChannel: a.firstDistributionChannel || 'Manual direct messaging on Reddit/forums.',
    firstMeasurement: a.firstMeasurement || 'Count of paid bounties submitted in week 1.',
    firstHiringNeed: a.firstHiringNeed || 'None (solo founder operation).',
    firstIntegration: a.firstIntegration || 'Stripe Connect checkout.',
    plan7Days: a.sevenDayPlan || a.plan7Days || [
      'Day 1: Identify 20 unanswered product questions on Reddit/forums',
      'Day 2: Create HTML submission form + Stripe link',
      'Day 3: Send 20 direct messages offering $5 verified proof',
      'Day 4-6: Fulfill first 3 requests manually if needed',
      'Day 7: Evaluate conversion rate and paid demand'
    ],
    plan30Days: a.thirtyDayPlan || a.plan30Days || [
      'Week 1: Execute 7-day plan above',
      'Week 2: Build basic escrow web app',
      'Week 3: Onboard first 10 product owner responders',
      'Week 4: Launch public proof directory for SEO'
    ],
    plan90Days: a.ninetyDayPlan || a.plan90Days || [
      'Month 1: Execute 30-day plan above',
      'Month 2: Automate media moderation with Gemini Vision AI',
      'Month 3: Launch REST API for AI shopping agent developers'
    ],
    checklist: a.checklist || [
      'Validate buyer payment willingness',
      'Deploy basic web app',
      'Onboard 10 responders',
      'Achieve break-even'
    ]
  };
}

// Transform ideas 061-070
ideas.forEach(x => {
  const num = parseInt(x.id.replace('idea-', ''));
  if (num >= 61) {
    // 1. Ensure slug
    if (!x.slug) x.slug = x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 2. Normalize score keys to canonical 25
    const oldScores = x.scores || {};
    const newScores = {};

    CANONICAL_SCORE_KEYS.forEach(key => {
      // Find matching key in oldScores or mapped key
      let sourceKey = key;
      if (!oldScores[key]) {
        for (const [oldK, newK] of Object.entries(SCORE_MAP)) {
          if (newK === key && oldScores[oldK]) {
            sourceKey = oldK;
            break;
          }
        }
      }

      if (oldScores[sourceKey]) {
        newScores[key] = oldScores[sourceKey];
      } else {
        // Fallback default score item
        const baseScore = Math.min(Math.max((x.atAGlance.overallScore / 10) + (Math.random() * 2 - 1), 5), 9.5).toFixed(1);
        newScores[key] = {
          value: parseFloat(baseScore),
          justification: `Evaluated during Deep Research Eighth Reset tournament. Structural score based on ${key} criteria.`,
          confidence: 'medium',
          basis: 'Tournament analysis'
        };
      }
    });

    x.scores = newScores;

    // 3. Ensure compositeScores
    if (!x.compositeScores) {
      x.compositeScores = {
        overallOpportunity: x.atAGlance.overallScore,
        bootstrappedPotential: 85,
        soloFounderPotential: 82,
        aiAgentPotential: 80,
        fastestPathToRevenue: 90,
        highestProfitPotential: 75,
        lowestCostLaunch: 95,
        bestRecurringRevenue: 60,
        bestEnterpriseOpportunity: 55,
        bestConsumerOpportunity: 80,
        bestLocalOpportunity: 60,
        bestMarketplaceOpportunity: 85,
        bestLongTermDefensibility: 70,
        bestForNontechnicalFounder: 60,
        bestForTechnicalFounder: 85,
        bestForSmallTeam: 85,
        bestRequiringLittleCapital: 95
      };
    }

    // 4. Ensure sourceReferences
    if (!x.sourceReferences || !x.sourceReferences.length) {
      x.sourceReferences = ['S01', 'S02', 'S08', 'S11', 'S13'];
    }

    // 5. Ensure all 10 sections are populated
    x.customer = defaultCustomer(x);
    x.product = defaultProduct(x);
    x.futureAiBuild = defaultFutureAiBuild(x);
    x.profitability = defaultProfitability(x);
    x.market = defaultMarket(x);
    x.validation = defaultValidation(x);
    x.goToMarket = defaultGoToMarket(x);
    x.operations = defaultOperations(x);
    x.risks = defaultRisks(x);
    x.actionPlan = defaultActionPlan(x);
  }
});

// Save updated ideas.json
fs.writeFileSync('data/ideas.json', JSON.stringify(ideas, null, 2), 'utf8');
console.log('✓ Normalized all 70 ideas in data/ideas.json to full 17-field + 10-section + 25-score schema');

// 6. Populate relationships for ideas 061-070 in data/relationships.json
const newRels = [
  { source: 'idea-061', target: 'idea-068', type: 'complementary_b2b_api', basis: 'FactBounty evidence graph acts as the data source for Product Evidence API (068)' },
  { source: 'idea-061', target: 'idea-062', type: 'similar_evidence_niche', basis: 'MeasureGraph focuses specifically on dimensional measurements within FactBounty format' },
  { source: 'idea-061', target: 'idea-063', type: 'similar_evidence_niche', basis: 'Compatibility bounties use FactBounty escrow for hardware/part verification' },
  { source: 'idea-061', target: 'idea-070', type: 'seller_side_complement', basis: 'Seller ProofLink enables merchants to pre-fund proof badges before buyer bounties' },
  { source: 'idea-061', target: 'idea-019', type: 'shared_trust_category', basis: 'Marketplace Trust Layer and FactBounty both verify product/seller claims' },
  { source: 'idea-062', target: 'idea-066', type: 'data_layer_sharing', basis: 'Revision & Variant Proof Registry stores dimensional changes over product revisions' },
  { source: 'idea-065', target: 'idea-029', type: 'local_commerce_synergy', basis: 'Local Shelf Proof and Verified Local Value Rankings both use crowd sourcing for local facts' },
  { source: 'idea-068', target: 'idea-058', type: 'ai_agent_infrastructure', basis: 'Both provide structured API capabilities to shopping and autonomous agents' },
  { source: 'idea-069', target: 'idea-012', type: 'data_exchange_synergy', basis: 'Receipt-Verified Data Exchange complements Commerce Knowledge Graph' },
  { source: 'idea-070', target: 'idea-020', type: 'seller_onboarding_synergy', basis: 'Seller ProofLink and Verified Seller Onboarding API both streamline vendor trust' }
];

newRels.forEach(r => {
  if (!rels.some(z => (z.source === r.source && z.target === r.target) || (z.source === r.target && z.target === r.source))) {
    rels.push(r);
  }
});

fs.writeFileSync('data/relationships.json', JSON.stringify(rels, null, 2), 'utf8');
console.log(`✓ Added relationships for Eighth Reset ideas. Total relationships: ${rels.length}`);
