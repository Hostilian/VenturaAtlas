#!/usr/bin/env node
// generate-eighth-reset-dossiers.js
// Generates full Markdown dossiers for ideas 061-070 from ideas.json
// Run from repo root: node scripts/generate-eighth-reset-dossiers.js

const fs = require('fs');
const path = require('path');

const ideas = JSON.parse(fs.readFileSync('data/ideas.json', 'utf8'));
const eighth = ideas
  .filter(i => /idea-06[1-9]|idea-070/.test(i.id))
  .sort((a, b) => a.id.localeCompare(b.id));

function safe(v) {
  if (v === null || v === undefined || v === '') return 'Not yet specified';
  return String(v);
}

function bulletList(arr) {
  if (!arr) return '- Not yet specified';
  if (typeof arr === 'string') return arr.trim() ? arr.split('\n').map(l => l.startsWith('-') ? l : `- ${l}`).join('\n') : '- Not yet specified';
  if (!Array.isArray(arr) || arr.length === 0) return '- Not yet specified';
  return arr.map(x => `- ${x}`).join('\n');
}

function inlineList(arr) {
  if (!arr || arr.length === 0) return 'Not yet specified';
  return arr.join(', ');
}

function planList(arr, defaultStr) {
  if (arr && arr.length > 0) return arr.map(x => `- ${x}`).join('\n');
  return defaultStr;
}

for (const i of eighth) {
  const { slug, name, id } = i;
  console.log(`Generating: ${id} - ${name}`);

  const ag   = i.atAGlance || {};
  const cust = i.customer || {};
  const prod = i.product || {};
  const prof = i.profitability || {};
  const mkt  = i.market || {};
  const val  = i.validation || {};
  const gtm  = i.goToMarket || {};
  const ops  = i.operations || {};
  const risk = i.risks || {};
  const ap   = i.actionPlan || {};
  const sc   = i.scores || {};
  const cs   = i.compositeScores || {};
  const prov = i.provenance || {};
  const fab  = i.futureAiBuild || {};
  const ep   = prof.earningPotential || {};

  // Scores table
  const scoreRows = Object.entries(sc).map(([dim, entry]) => {
    if (!entry || entry.value === undefined) return '';
    const j = safe(entry.justification).replace(/\|/g, '/');
    return `| ${dim} | ${entry.value} | ${safe(entry.confidence)} | ${j} |`;
  }).filter(Boolean).join('\n');

  // Related ideas
  const relatedLines = [];
  if (i.relatedIdeaIds && i.relatedIdeaIds.length > 0) {
    for (const rid of i.relatedIdeaIds) {
      const rel = ideas.find(x => x.id === rid);
      if (rel) {
        relatedLines.push(`- [${rid} - ${rel.name}](${rel.slug}.md)`);
      } else {
        relatedLines.push(`- ${rid}`);
      }
    }
  } else {
    relatedLines.push('- No explicit related ideas recorded yet. See other Product verification and evidence ideas (idea-061 through idea-070).');
  }
  const relatedSec = relatedLines.join('\n');

  // Sources section
  const srcLines = [];
  if (i.sourceReferences && i.sourceReferences.length > 0) {
    for (const s of i.sourceReferences) {
      srcLines.push(`- **${s.id}**: ${s.title} (${s.author}, ${s.year}) - ${s.url}`);
    }
  } else {
    srcLines.push('- Source references pending full annotation. See data/sources.json for all 62 sources.');
  }
  const sourceSec = srcLines.join('\n');

  // Composite scores
  const compositeSec = Object.entries(cs)
    .map(([k, v]) => `- **${k}:** ${v}/100`)
    .join('\n');

  // Profitability scenarios
  const scenLines = [
    '| Scenario | Customers | Monthly ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Monthly operating profit |',
    '|---|---:|---:|---:|---:|---:|---:|---:|'
  ];
  if (prof.scenarios && prof.scenarios.length > 0) {
    for (const s of prof.scenarios) {
      const gm = s.grossMargin ? `${Math.round(s.grossMargin * 100)}%` : '~70%';
      const gmv = s.grossMargin || 0.70;
      const mr = Math.round(s.customers * s.monthlyARPC);
      const ar = Math.round(s.customers * s.monthlyARPC * 12);
      const op = Math.round(s.customers * s.monthlyARPC * gmv - s.monthlyOperatingCosts);
      scenLines.push(`| ${s.label} | ${s.customers} | $${s.monthlyARPC} | $${mr} | $${ar} | ${gm} | $${s.monthlyOperatingCosts} | $${op} |`);
    }
  } else {
    scenLines.push('| Conservative | 5 | $25 | $125 | $1,500 | 70% | $500 | -$413 |');
    scenLines.push('| Base | 20 | $40 | $800 | $9,600 | 72% | $800 | -$224 |');
    scenLines.push('| Aggressive | 80 | $60 | $4,800 | $57,600 | 80% | $3,500 | $340 |');
  }
  const scenarioSec = scenLines.join('\n');

  // Evidence/assumptions/unknowns
  let evidSec;
  if (prov.evidence && prov.evidence.length > 0) {
    evidSec = prov.evidence.map(e => `- ${e.type} - ${e.claim} (${e.confidence}; ${e.sourceId})`).join('\n');
  } else {
    evidSec = '- source_record - The concept appears in the Deep Research Eighth Full Reset corpus. (medium)\n- analyst_interpretation - The enriched analysis was generated from the concept and methodology. (low-medium)';
  }

  let assumpSec;
  if (prov.assumptions && prov.assumptions.length > 0) {
    assumpSec = prov.assumptions.map(a => `- ${a}`).join('\n');
  } else {
    assumpSec = '- All financial numbers are editable analyst scenarios, not promises.\n- Market size is intentionally left unknown without source-backed bottom-up research.\n- Direct competitor and current price facts require fresh verification.';
  }

  let unknSec;
  if (prov.unknowns && prov.unknowns.length > 0) {
    unknSec = prov.unknowns.map(u => `- ${u}`).join('\n');
  } else {
    unknSec = '- Actual accessible market size\n- Buyer prepayment rate and willingness to pay\n- Channel conversion rates\n- Repeat purchase frequency\n- Support and review burden per transaction';
  }

  // Action plan day lists
  const ap7Default = '- Create one realistic example output\n- Build prospect list of 25\n- Conduct 15 interviews/outreach attempts\n- Make a paid offer\n- First delivery plan';
  const ap30Default = '- Serve 3-10 pilots\n- Measure costs and corrections\n- Publish one consented case study\n- Automate repeated steps\n- Re-score idea';
  const ap90Default = '- Choose narrow ICP\n- Ship self-serve vertical slice\n- Build repeat channel\n- Track cohort economics\n- Stop or expand based on evidence';
  const checkDefault = '- Define trigger\n- Name payer\n- Show deliverable\n- Ask for payment\n- Measure labor\n- Record objections\n- Protect data\n- Set kill date';

  const ap7Sec   = planList(ap.plan7Days, ap7Default);
  const ap30Sec  = planList(ap.plan30Days, ap30Default);
  const ap90Sec  = planList(ap.plan90Days, ap90Default);
  const checkSec = planList(ap.checklist, checkDefault);

  let plan48Sec;
  if (val.plan48Hours) {
    plan48Sec = Array.isArray(val.plan48Hours) ? val.plan48Hours.map(x => `- ${x}`).join('\n') : safe(val.plan48Hours);
  } else {
    plan48Sec = '- Create one example deliverable\n- Build prospect list of 25\n- Conduct five conversations\n- Make a paid offer';
  }

  // Moats
  let moatSec;
  if (mkt.moats) {
    if (Array.isArray(mkt.moats)) {
      moatSec = mkt.moats.map(m => `- ${m}`).join('\n');
    } else if (typeof mkt.moats === 'object') {
      moatSec = Object.entries(mkt.moats).map(([k, v]) => `- **${k}:** ${v}`).join('\n');
    } else {
      moatSec = `- ${mkt.moats}`;
    }
  } else {
    moatSec = '- Proprietary verified product-evidence graph\n- Two-sided buyer/responder network\n- Data moat from verified facts that compound over time';
  }

  // atAGlance fields
  const agCustomer  = ag.targetCustomer || cust.primaryCustomer || 'Not yet specified';
  const agProblem   = ag.problem || cust.specificProblem || 'Not yet specified';
  const agWhatBuild = ag.whatToBuild || prod.mvpDefinition || 'Not yet specified';
  const agMoney     = ag.howItMakesMoney || prof.revenueStreams || 'Not yet specified';
  const agWhyPay    = ag.whyCustomersPay || 'The customer pays because the product produces a faster, safer, more verifiable outcome than existing alternatives.';
  const agEarning   = ag.earningPotential || 'USD scenario range; not a forecast';
  const agCost      = ag.startupCost || 'USD 0-100 scenario range';
  const agMvp       = ag.timeToMvp || '5-14 days';
  const agRevTime   = ag.timeToFirstRevenue || '1-14 days';
  const agProfit    = ag.profitabilityCondition || 'Contribution margin per request must exceed acquisition, infrastructure, and support costs.';
  const agScore     = cs.overallOpportunity || 'N/A';
  const agConf      = (sc.overallConfidence && sc.overallConfidence.value) || 'N/A';
  const agAdvantage = ag.mainAdvantage || i.elevatorPitch || 'Not yet specified';
  const agRisk      = ag.mainRisk || 'Market validation required before significant investment.';
  const agValid     = ag.bestNextValidation || 'Interview 15 target buyers about the last occurrence and ask for a paid pilot.';

  // Other computed fields
  const tagStr      = inlineList(i.tags);
  const altStr      = (i.alternativeNames && i.alternativeNames.length > 0) ? inlineList(i.alternativeNames) : name;
  const srcRefStr   = (i.sourceReferences && i.sourceReferences.length > 0) ? inlineList(i.sourceReferences.map(s => s.id)) : 'See data/sources.json';
  const provenanceSt = (prov && prov.provenanceStatus) ? prov.provenanceStatus : 'Direct from Deep Research Eighth Full Reset (2026-08-06)';
  const detailed    = i.detailedDescription || i.elevatorPitch || '';

  // Directly computed strings for whatMustBeTrue
  const wmt = prof.whatMustBeTrue || {};
  // Dir lines for incumbent advantages
  const directComps    = bulletList(mkt.directCompetitors);
  const indirectComps  = bulletList(mkt.indirectCompetitors);
  const diyAlts        = bulletList(mkt.diyAlternatives);
  const incumbAdv      = bulletList(mkt.incumbentAdvantages);

  const content = `# ${name}

> ${safe(i.oneSentenceConcept)}

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | \`${id}\` |
| Target customer | ${agCustomer} |
| Problem | ${agProblem} |
| What to build | ${agWhatBuild} |
| How it makes money | ${agMoney} |
| Why customers pay | ${agWhyPay} |
| Earning potential | ${agEarning} |
| Startup cost | ${agCost} |
| Time to MVP | ${agMvp} |
| Time to first revenue | ${agRevTime} |
| Profitability condition | ${agProfit} |
| Overall opportunity score | ${agScore}/100 |
| Confidence | ${agConf}/10 |
| Main advantage | ${agAdvantage} |
| Main risk | ${agRisk} |
| Best next validation | ${agValid} |

## Identity and Provenance

- **Canonical ID:** \`${id}\`
- **Legacy ID:** \`${safe(i.legacyId)}\`
- **Slug:** \`${slug}\`
- **Category:** ${safe(i.category)}
- **Status:** ${safe(i.status)}
- **Tags:** ${tagStr}
- **Alternative names:** ${altStr}
- **Source references:** ${srcRefStr}
- **Provenance status:** ${provenanceSt}

${detailed}


## Customer Perspective

- **Primary Customer:** ${safe(cust.primaryCustomer)}

- **Economic Buyer:** ${safe(cust.economicBuyer)}

- **Daily User:** ${safe(cust.dailyUser)}

- **Customer Type:** ${safe(cust.customerType)}

- **Current Situation:** ${safe(cust.currentSituation)}

- **Specific Problem:** ${safe(cust.specificProblem)}

- **Frequency:** ${safe(cust.frequency)}

- **Pain And Cost:** ${safe(cust.painAndCost)}

### Current Alternatives
${bulletList(cust.currentAlternatives)}

- **Alternative Gaps:** Alternatives may be fragmented, generic, difficult to verify, or disconnected from the customer's exact workflow.

### Jobs To Be Done

- **Functional:** ${safe((cust.jtbd && cust.jtbd.functional) || 'Get verified, objective, physical evidence for a specific product before purchase.')}

- **Emotional:** ${safe((cust.jtbd && cust.jtbd.emotional) || 'Feel confident that the purchase decision is right, not based on unverified claims.')}

- **Social:** ${safe((cust.jtbd && cust.jtbd.social) || 'Demonstrate evidence-backed decision-making to peers, partners, or colleagues.')}

- **Desired Outcome:** ${safe((cust.jtbd && cust.jtbd.desiredOutcome) || 'A reliable result with less time, lower risk, and clear evidence of what happened.')}

### Trust Requirements
${bulletList(cust.trustRequirements)}

### Rejection Reasons
${bulletList(cust.rejectionReasons)}

### Switch Reasons
${bulletList(cust.switchReasons)}

### Continuing Payment Reasons
${bulletList(cust.continuingPaymentReasons)}

### Measurable Value
${bulletList(cust.measurableValue)}

### Acquisition Channels
${bulletList(cust.acquisitionChannels)}

### Objections
${bulletList(cust.objections)}

### Retention Drivers
${bulletList(cust.retentionDrivers)}

### Churn Risks
${bulletList(cust.churnRisks)}

- **Customer Pays Because:** ${safe(cust.customerPays)}

- **Idea Satisfies Customer By:** ${safe(cust.ideaSatisfiesCustomer)}

## Product Definition

- **Product Type:** ${safe(prod.productType)}

- **User Experience:** ${safe(prod.userExperience)}

### Main Workflow
${bulletList(prod.mainWorkflow)}

### Core Features
${bulletList(prod.coreFeatures)}

### Supporting Features
${bulletList(prod.supportingFeatures)}

### Admin Features
${bulletList(prod.adminFeatures)}

### Integrations
${bulletList(prod.integrations)}

### Ai Capabilities
${bulletList(prod.aiCapabilities)}

### Non Ai Capabilities
${bulletList(prod.nonAiCapabilities)}

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

- **Automation Level:** ${safe(prod.automationLevel)}

- **Human Involvement:** ${safe(prod.humanInvolvement)}

- **Mvp Definition:** ${safe(prod.mvpDefinition)}

### Version Two
${bulletList(prod.versionTwo)}

- **Long Term Vision:** ${safe(prod.longTermVision)}

### Do Not Build Initially
${bulletList(prod.doNotBuildInitially)}

### User Journey
${bulletList(prod.userJourney)}

## What Future AI Should Build

- **Exact System:** ${safe(fab.exactSystem)}

### Automatic Work
${bulletList(fab.automaticWork)}

### Human Approval
${bulletList(fab.humanApproval)}

### Model Capabilities
${bulletList(fab.modelCapabilities)}

### Tools And Integrations
${bulletList(fab.toolsAndIntegrations)}

### Knowledge Sources
${bulletList(fab.knowledgeSources)}

### Suggested Stack
${bulletList(fab.suggestedStack)}

### Components
${bulletList(fab.components)}

### Data Flow
${safe(fab.dataFlow)}

### Api Endpoints
${bulletList(fab.apiEndpoints)}

### Database Entities
${bulletList(fab.databaseEntities)}

- **Authentication:** Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.

- **Payments:** Stripe Connect hosted checkout and webhooks; keep the provider authoritative for payment state.

- **Mvp Complexity:** ${safe(prod.mvpComplexity)}

### Build Sequence
${bulletList(prod.buildSequence)}

### Safety Guardrails
${bulletList(fab.safetyGuardrails)}

### Failure Handling
${bulletList(fab.failureHandling)}

### Analytics Events
${bulletList(fab.analyticsEvents)}

### Logging Monitoring
${bulletList(fab.loggingMonitoring)}

### Evaluation Criteria
${bulletList(fab.evaluationCriteria)}

- **First Prototype:** ${safe(prod.firstPrototype)}

## Profitability Analysis

- **Revenue model:** ${safe(prof.revenueModel)}
- **Pricing model:** ${safe(prof.pricingModel)}
- **Expected ARPC scenario:** ${safe(prof.expectedARPC)}
- **Gross-margin scenario:** ${safe(prof.grossMarginScenario)}
- **CAC scenario:** ${safe(prof.cacScenario)}
- **LTV scenario:** ${safe(prof.ltvScenario)}
- **Target LTV:CAC:** ${safe(prof.targetLtvCac)}
- **Payback:** ${safe(prof.payback)}
- **Break-even model:** Monthly fixed costs / (average monthly revenue per customer minus average monthly variable cost per customer).

### Three Editable Scenarios

${scenarioSec}

All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
${bulletList(prof.knownFacts)}

### Research-Supported Estimates
${bulletList(prof.researchSupportedEstimates)}

### Analyst Assumptions
${bulletList(prof.analystAssumptions)}

### Unknowns Requiring Validation
${bulletList(prof.unknownsRequiringValidation)}

## What Must Be True for This Idea to Be Profitable

- **Required Customer Volume:** ${safe(wmt.requiredCustomerVolume)}
- **Minimum Viable Price:** ${safe(wmt.minimumViablePrice)}
- **Maximum Cac:** ${safe(wmt.maximumCac)}
- **Retention Or Frequency:** ${safe(wmt.retentionOrFrequency)}
- **Required Gross Margin:** ${safe(wmt.requiredGrossMargin)}
- **Maximum Service Cost:** ${safe(wmt.maximumServiceCost)}
- **Conversion Rate:** ${safe(wmt.conversionRate)}
- **Automation Level:** ${safe(wmt.automationLevel)}
- **Sales Cycle:** ${safe(wmt.salesCycle)}
- **Critical Partnerships:** ${safe(wmt.criticalPartnerships)}
- **Regulatory Dependencies:** ${safe(wmt.regulatoryDependencies)}
- **Technical Dependencies:** ${safe(wmt.technicalDependencies)}
- **Market Timing:** ${safe(wmt.marketTiming)}
- **Team Capabilities:** ${safe(wmt.teamCapabilities)}
- **Unprofitable Conditions:** ${safe(wmt.unprofitableConditions)}


## Earning Potential

- **Most Realistic Outcome:** bootstrapped software, productized service, data business, or marketplace depending on validation

- **First Paying Customer:** A paid pilot in the range of the stated bounty or fee is the practical first milestone.

- **Side Business:** ${safe(ep.sideBusiness || '$5k-$50k annual revenue scenario if founder-led and narrow.')}

- **Small Company:** ${safe(ep.smallCompany || '$100k-$1m annual revenue requires repeatable acquisition and standardized delivery.')}

- **Seven Figure:** ${safe(ep.sevenFigure || 'Possible only with recurring or transaction revenue, strong retention, and reduced founder labor.')}

- **Venture Scale:** ${safe(ep.ventureScale || 'Not assumed; possible if the workflow expands into infrastructure, a network, or a proprietary data layer.')}

### Annual Revenue Range

- **Currency:** USD
- **Minimum:** ${(ep.annualRevenue && ep.annualRevenue.minimum) || 0}
- **Midpoint:** ${(ep.annualRevenue && ep.annualRevenue.midpoint) || 0}
- **Maximum:** ${(ep.annualRevenue && ep.annualRevenue.maximum) || 0}
- **Confidence:** ${safe((ep.annualRevenue && ep.annualRevenue.confidence) || 'low to medium until paid cohort evidence')}

- **Main Limiting Factor:** ${safe(ep.mainLimitingFactor || 'distribution and willingness to pay, followed by support/productization')}

## Market and Competition

- **Description:** ${safe(mkt.description)}

### Demand Drivers
- increasing consumer distrust of unverified product claims
- AI agent adoption requiring structured, trustworthy product data
- regulatory pressure on fake reviews (DSA, EU Consumer Rights Directive)
- growth in high-consideration online purchases (electronics, furniture, specialized goods)
- right-to-repair legislation creating demand for product specification evidence

- **Signals:** ${safe(mkt.signals)}

- **Size Direction:** ${safe(mkt.sizeDirection)}

- **Budget Source:** ${safe(mkt.budgetSource)}

- **Maturity:** ${safe(mkt.maturity)}

- **Competitive Density:** ${safe(mkt.competitiveDensity)}

### Direct Competitors
${directComps}

### Indirect Competitors
${indirectComps}

### Diy Alternatives
${diyAlts}

### Incumbent Advantages
${incumbAdv}

### Startup Advantages
${bulletList(mkt.startupAdvantages)}

### Differentiation
${bulletList(mkt.differentiation)}

### Unserved Niches
${bulletList(mkt.unservedNiches)}

- **Geography:** ${safe(mkt.geography)}

- **Timing:** ${safe(mkt.timing)}

### Trends
${bulletList(mkt.trends)}

- **Platform Feature Risk:** ${safe(mkt.platformFeatureRisk)}

- **Commoditization Risk:** ${safe(mkt.commoditizationRisk)}

### Moats

${moatSec}

## Validation Plan

- **Most Important Uncertainty:** ${safe(val.mostImportantUncertainty)}

- **Riskiest Assumption:** ${safe(val.riskiestAssumption)}

- **Cheapest Test:** ${safe(val.cheapestTest)}

- **Fastest Test:** ${safe(val.fastestTest)}

- **Interview Plan:** ${safe(val.interviewPlan)}

### Interview Questions
- Tell me about the last time this happened.
- What did you do instead?
- What did it cost in time, money, delay, or risk?
- Who approved spending?
- What would make an external solution untrustworthy?
- Would you pay for this fixed outcome this month? Why or why not?

- **Landing Page Test:** ${safe(val.landingPageTest)}

- **Smoke Test:** ${safe(val.smokeTest)}

- **Concierge Mvp:** ${safe(val.conciergeTest)}

- **Wizard Of Oz:** ${safe(val.wizardOfOzTest)}

- **Pricing Test:** ${safe(val.pricingTest)}

- **Demand Threshold:** ${safe(val.demandThreshold)}

### Success Criteria
${bulletList(val.successCriteria)}

### Failure Criteria
${bulletList(val.failureCriteria)}

### Evidence Before Build
${bulletList(val.evidenceBeforeBuild)}

### Evidence Before Heavy Investment
${bulletList(val.evidenceBeforeHeavyInvestment)}

### Plan 48 Hours
${plan48Sec}

### Plan 7 Days
${safe(val.plan7Days)}

### Plan 30 Days
${safe(val.plan30Days)}

- **Do Not Build Yet:** ${safe(val.doNotBuildYet)}

## Go-to-Market Strategy

- **Initial Niche:** ${safe(gtm.initialNiche)}

- **Icp:** ${safe(gtm.icp)}

- **Beachhead:** ${safe(gtm.beachhead)}

- **Positioning:** ${safe(gtm.positioning)}

- **Value Proposition:** ${safe(gtm.valueProposition)}

- **Messaging:** ${safe(gtm.messaging)}

- **Offer:** ${safe(gtm.offer)}

- **Pricing Launch:** ${safe(gtm.pricingLaunch)}

### First 10 Customers
${safe(gtm.first10Customers)}

### First 100 Customers
${safe(gtm.first100Customers)}

- **Outbound:** ${safe(gtm.outbound)}

- **Inbound:** ${safe(gtm.inbound)}

- **Community:** ${safe(gtm.community)}

- **Partnerships:** ${safe(gtm.partnerships)}

- **Product Led Growth:** ${safe(gtm.productLedGrowth)}

- **Marketplace Distribution:** ${safe(gtm.marketplaceDistribution)}

- **App Store:** ${safe(gtm.appStore)}

- **Seo:** ${safe(gtm.seo)}

- **Content:** ${safe(gtm.content)}

- **Paid Acquisition:** ${safe(gtm.paidAcquisition)}

- **Referral Loop:** ${safe(gtm.referralLoop)}

- **Sales Cycle:** ${safe(gtm.salesCycle)}

### Sales Assets
${bulletList(gtm.salesAssets)}

- **Onboarding:** ${safe(gtm.onboarding)}

- **Retention:** ${safe(gtm.retention)}

- **Expansion:** ${safe(gtm.expansion)}

## Build and Operations Plan

### Founder Skills
${safe(ops.founderSkills)}

### Team Roles
${bulletList(ops.teamRoles)}

### Ai Can Accelerate
${bulletList(ops.aiCanAccelerate)}

### Human Required
${bulletList(ops.humanRequired)}

- **Build Difficulty:** ${safe(ops.buildDifficulty)}

- **Operational Difficulty:** ${safe(ops.operationalDifficulty)}

- **Support Burden:** ${safe(ops.supportBurden)}

- **Sales Burden:** ${safe(ops.salesBurden)}

- **Compliance Burden:** ${safe(ops.complianceBurden)}

- **Data Acquisition Difficulty:** ${safe(ops.dataAcquisitionDifficulty)}

- **Integration Difficulty:** ${safe(ops.integrationDifficulty)}

### Mvp Stages
${bulletList(ops.mvpStages)}

### Dependencies
${bulletList(ops.dependencies)}

### Maintenance
${bulletList(ops.maintenance)}

### Quality Control
${safe(ops.qualityControl)}

### Kpis
${bulletList(ops.kpis)}

### Leading Indicators
${bulletList(ops.leadingIndicators)}

### Lagging Indicators
${bulletList(ops.laggingIndicators)}

### Kill Metrics
${safe(ops.killMetrics)}

### Automation Opportunities
${bulletList(ops.automationOpportunities)}

### Sops
${bulletList(ops.sops)}

## Risks and Failure Modes

- **Product:** ${safe(risk.product)}

- **Market:** ${safe(risk.market)}

- **Pricing:** ${safe(risk.pricing)}

- **Distribution:** ${safe(risk.distribution)}

- **Technical:** ${safe(risk.technical)}

- **Ai Reliability:** ${safe(risk.aiReliability)}

- **Hallucination:** ${safe(risk.hallucination)}

- **Data:** ${safe(risk.data)}

- **Security:** ${safe(risk.security)}

- **Privacy:** ${safe(risk.privacy)}

- **Regulatory:** ${safe(risk.regulatory)}

- **Reputation:** ${safe(risk.reputation)}

- **Dependency:** ${safe(risk.dependency)}

- **Platform:** ${safe(risk.platform)}

- **Fraud:** ${safe(risk.fraud)}

- **Abuse:** ${safe(risk.abuse)}

- **Support:** ${safe(risk.support)}

- **Founder Market Fit:** ${safe(risk.founderMarketFit)}

- **Capital:** ${safe(risk.capital)}

- **Timing:** ${safe(risk.timing)}

- **Commoditization:** ${safe(risk.commoditization)}

- **Ethics:** Avoid deceptive claims, exploitative targeting, and automation without recourse.

- **Worst Case:** ${safe(risk.worstCase)}

### Mitigations
${bulletList(risk.mitigations)}

### Abandon When
${bulletList(risk.abandonWhen)}

## Action Plan

- **First Action:** ${safe(ap.firstAction)}

- **First Customer Conversation:** ${safe(ap.firstCustomerConversation)}

- **First Prototype:** ${safe(ap.firstPrototype)}

- **First Sales Offer:** ${safe(ap.firstSalesOffer)}

- **First Distribution Channel:** ${safe(ap.firstDistributionChannel)}

- **First Measurement:** ${safe(ap.firstMeasurement)}

- **First Hiring Need:** ${safe(ap.firstHiringNeed)}

- **First Integration:** ${safe(ap.firstIntegration)}

### Plan 7 Days
${ap7Sec}

### Plan 30 Days
${ap30Sec}

### Plan 90 Days
${ap90Sec}

### Checklist
${checkSec}

## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
${scoreRows}

### Composite Views

${compositeSec}

## Evidence, Assumptions, and Unknowns

### Evidence
${evidSec}

### Assumptions
${assumpSec}

### Unknowns
${unknSec}

## Related Ideas
${relatedSec}

## Source References

${sourceSec}

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-06). Session 8 winner: FactBounty (idea-061, score: 91.2). This dossier is part of the Product Verification and Evidence category (ideas 061-070).*

## Idea-Specific Prompt Pack

See [\`prompts/idea-specific/${id}/\`](../prompts/idea-specific/${id}/README.md).
`;

  const outPath = path.join('ideas', `${slug}.md`);
  fs.writeFileSync(outPath, content, 'utf8');
  const size = fs.statSync(outPath).size;
  console.log(`  Written: ${outPath} (${Math.round(size / 1024 * 10) / 10} KB)`);
}

console.log('\nDone! All 10 Eighth Reset dossiers generated.');
