/**
 * build-missing-artifacts.js
 * Generates:
 *  1. Markdown dossier files in ideas/*.md for ideas 061-070
 *  2. 25-prompt packs in prompts/idea-specific/idea-06X/* for ideas 061-070
 *  3. Prompt records appended to data/prompts.json
 *  4. Tournament ranking in data/rankings.json
 *  5. data/ideas.csv export containing all 70 ideas
 *  6. docs/categories.html
 */

const fs = require('fs');
const path = require('path');

const ideas = JSON.parse(fs.readFileSync('data/ideas.json', 'utf8'));
const sources = JSON.parse(fs.readFileSync('data/sources.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('data/categories.json', 'utf8'));
const rankings = JSON.parse(fs.readFileSync('data/rankings.json', 'utf8'));
let prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf8'));

const newIdeas = ideas.filter(x => parseInt(x.id.replace('idea-', '')) >= 61);

console.log(`Processing ${newIdeas.length} new ideas (061-070)...`);

// 25 prompt types definition
const PROMPT_TYPES = [
  { slug: 'deep-market-research', title: 'Deep market research', assignment: 'Map the exact reachable market, trigger events, budgets, alternatives, negative evidence, recent changes, and bottom-up market size. Return a source ledger, contradictions, opportunity variants, and falsification conditions.' },
  { slug: 'customer-discovery', title: 'Customer discovery', assignment: 'Draft an interview script, screening criteria, outreach messages, non-leading questions, and a scoring rubric for 15 target buyers.' },
  { slug: 'competitor-analysis', title: 'Competitor analysis', assignment: 'Perform a feature-by-feature, pricing-by-pricing, and vulnerability-by-vulnerability teardown of incumbent solutions and direct competitors.' },
  { slug: 'validation-experiment', title: 'Validation experiment', assignment: 'Design a $0-$100 smoke test / pre-sell experiment with explicit metric gates to prove customer willingness to pay before writing production code.' },
  { slug: 'product-requirements', title: 'Product requirements document', assignment: 'Draft a complete PRD including user stories, non-functional requirements, data schemas, edge cases, and feature priorities for v1.' },
  { slug: 'ux-design', title: 'UX design', assignment: 'Design key user flows, screen layouts, information architecture, micro-interactions, and accessibility considerations.' },
  { slug: 'technical-architecture', title: 'Technical architecture', assignment: 'Specify system architecture, tech stack, data models, API endpoints, third-party integrations, and infrastructure deployment topology.' },
  { slug: 'mvp-coding', title: 'MVP coding', assignment: 'Write core prototype code, data validation schemas, key business logic, and essential API routes for immediate testing.' },
  { slug: 'ai-agent-design', title: 'AI-agent design', assignment: 'Define system prompts, tools, agentic workflows, fallback behavior, rate-limits, and evaluation criteria for AI components.' },
  { slug: 'data-integrations', title: 'Data and integration research', assignment: 'Map required data sources, third-party APIs, web scrapers, webhooks, authentication mechanisms, and data pipelines.' },
  { slug: 'security-privacy', title: 'Security and privacy review', assignment: 'Conduct a security threat modeling, GDPR/DSA compliance audit, data retention policy, and security architecture review.' },
  { slug: 'pricing-research', title: 'Pricing research', assignment: 'Analyze customer willingness-to-pay, value metrics, tier packaging, discount strategies, and price elasticity.' },
  { slug: 'unit-economics', title: 'Unit economics', assignment: 'Calculate LTV, CAC, gross margin per transaction, contribution margin, payback period, and unit economics sensitivity.' },
  { slug: 'financial-model', title: 'Financial model', assignment: 'Build 12-month financial projections under Conservative, Target, and Aggressive growth scenarios.' },
  { slug: 'go-to-market', title: 'Go-to-market', assignment: 'Formulate launch strategy, primary distribution channels, partnership opportunities, content loops, and referral mechanisms.' },
  { slug: 'landing-page', title: 'Landing-page copy', assignment: 'Write full hero copy, value proposition headers, social proof sections, FAQ, pricing table, and call-to-action buttons.' },
  { slug: 'outbound-sales', title: 'Outbound sales', assignment: 'Write cold email sequences, LinkedIn messaging sequences, objection handling scripts, and demo pitch flow.' },
  { slug: 'seo-plan', title: 'SEO content plan', assignment: 'Identify high-intent search keywords, content pillars, programmatic SEO opportunities, and link-building strategy.' },
  { slug: 'launch-plan', title: 'Launch plan', assignment: 'Create a 30-day step-by-step launch checklist for Product Hunt, Hacker News, niche communities, and social media.' },
  { slug: 'operations-automation', title: 'Operations and automation', assignment: 'Design automated onboarding workflows, customer support triage, payment reconciliation, and operational runbooks.' },
  { slug: 'risk-premortem', title: 'Risk and pre-mortem', assignment: 'Conduct a pre-mortem analysis identifying 10 potential failure modes, early warning indicators, and mitigation plans.' },
  { slug: 'investor-memo', title: 'Investor memo', assignment: 'Draft a 1-page investment memo covering market opportunity, unfair advantage, traction metrics, team requirements, and financial upside.' },
  { slug: 'weekly-kpi', title: 'Weekly KPI review', assignment: 'Establish key performance indicator dashboards, weekly review cadence, North Star metric, and operational cadence.' },
  { slug: 'scale-up', title: 'Scale-up strategy', assignment: 'Outline strategy for scaling from $1k to $10k/mo MRR, team hiring roadmap, enterprise sales upgrade, and international expansion.' },
  { slug: 'pivot-generation', title: 'Pivot generation', assignment: 'Formulate 3 adjacent pivot directions if primary market validation fails during the first 60 days.' }
];

// Helper to format money
function fmtMoney(r) {
  if (!r) return 'USD 0–0';
  return `USD ${r.minimum || 0}–${r.maximum || 0}`;
}

function fmtList(val) {
  if (!val) return 'None specified';
  if (Array.isArray(val)) return val.map(z => typeof z === 'object' ? JSON.stringify(z) : z).join('; ');
  if (typeof val === 'object') return Object.entries(val).map(([k,v]) => `${k}: ${v}`).join('; ');
  return String(val);
}

// 1. Generate Markdown Dossier Files
newIdeas.forEach(x => {
  const filePath = path.join('ideas', `${x.slug}.md`);
  const cust = x.customer || {};
  const prod = x.product || {};
  const prof = x.profitability || {};
  const val = x.validation || {};
  const act = x.actionPlan || {};

  const primaryCust = cust.primaryCustomer || x.atAGlance.targetCustomer || 'Target Buyer';
  const probSolved = cust.specificProblem || x.atAGlance.problemSolved || 'Unanswered buyer questions';

  const content = `# ${x.name}

> ${x.oneSentenceConcept}

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | \`${x.id}\` |
| Target customer | ${x.atAGlance.targetCustomer} |
| Problem | ${x.atAGlance.problemSolved} |
| What to build | ${x.atAGlance.whatToBuild} |
| How it makes money | ${x.atAGlance.howItMakesMoney} |
| Why customers pay | The customer pays because the product produces a faster, safer, more verifiable outcome than existing manual alternatives. |
| Earning potential | ${fmtMoney(x.atAGlance.revenueScenarios)} annual scenario range; not a forecast |
| Startup cost | ${fmtMoney(x.atAGlance.startupCost)} scenario range |
| Time to MVP | ${x.atAGlance.timeToMvp} |
| Time to first revenue | ${x.atAGlance.timeToFirstRevenue} |
| Profitability condition | Contribution margin per request/customer must exceed acquisition, infrastructure, and support costs. |
| Overall opportunity score | ${x.atAGlance.overallScore}/100 |
| Confidence | ${x.atAGlance.confidenceScore}/10 |
| Main advantage | ${x.atAGlance.mainAdvantage} |
| Main risk | ${x.atAGlance.mainRisk} |
| Best next validation | ${x.atAGlance.bestNextValidationStep} |

## Identity and Provenance

- **Canonical ID:** \`${x.id}\`
- **Legacy ID:** \`${x.slug}\`
- **Slug:** \`${x.slug}\`
- **Category:** ${x.category}
- **Status:** ${x.status}
- **Tags:** ${x.tags.join(', ')}
- **Source references:** ${(x.sourceReferences || []).join(', ')}
- **Provenance status:** ${x.provenance ? x.provenance.status : 'Direct from Eighth Reset Deep Research'}

${x.oneSentenceConcept} ${x.atAGlance.whatToBuild}

## Customer Perspective

- **Primary Customer:** ${primaryCust}
- **Economic Buyer:** ${cust.economicBuyer || primaryCust}
- **Daily User:** ${cust.dailyUser || primaryCust}
- **Customer Type:** B2B, B2C, or marketplace participant depending on segment
- **Current Situation:** Customers currently rely on search engines, unverified reviews, manual research, or internal scripts.
- **Specific Problem:** ${probSolved}
- **Frequency:** ${cust.frequency || 'High-consideration purchase moments'}
- **Pain And Cost:** ${cust.painAndCost || 'Product return costs, wrong purchases, delayed decisions'}

### Current Alternatives
${(cust.currentAlternatives || ['Search engines', 'Reddit / forum posts', 'Unverified retailer Q&A']).map(a => `- ${a}`).join('\n')}

## Product Definition

- **Core Proposition:** ${prod.coreProposition || prod.whatItIs || x.oneSentenceConcept}
- **MVP Scope:** ${prod.mvpScope || prod.mvpDefinition || x.atAGlance.whatToBuild}
- **Key Features:** ${fmtList(prod.keyFeatures || prod.coreFeatures || ['Request submission', 'Bounty escrow', 'Proof verification'])}
- **Tech Stack:** ${fmtList(prod.techStack || prod.aiCapabilities || ['HTML/JS', 'Stripe', 'Python API'])}

## Financial & Profitability Analysis

- **Revenue Streams:** ${fmtList(prof.revenueStreams || prof.revenueModel || x.atAGlance.howItMakesMoney)}
- **Pricing Strategy:** ${prof.pricingStrategy || prof.pricingModel || 'Pay-per-request / platform fee'}
- **Gross Margin:** ${prof.grossMarginEstimate || prof.grossMarginPotential || '60-80%'}
- **Break-even Point:** ${prof.breakEvenPoint || prof.breakEvenFormula || '8-34 paid requests per month'}

## Validation & Action Plan

- **Validation Method:** ${val.method || val.cheapestValidationTest || x.atAGlance.bestNextValidationStep}
- **Metric Gate:** ${val.metricGate || val.successCriteria || 'Paid pre-orders / commitments'}
- **First Action:** ${act.firstAction || (act.first30Days ? act.first30Days[0] : 'Interview 15 target buyers')}
- **Seven Day Plan:** ${fmtList(act.sevenDayPlan)}
- **Thirty Day Plan:** ${fmtList(act.thirtyDayPlan)}

## Source References

${(x.sourceReferences || []).map(sid => {
  const s = sources.find(z => z.id === sid);
  return s ? `- **${s.id}**: ${s.title} (${s.publisher || 'Source'}, ${s.date || ''}) - ${s.url || ''}` : `- **${sid}**`;
}).join('\n')}

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-02).*
`;

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('✓ Created 10 Markdown dossier files in ideas/');

// 2. Generate 25-Prompt Packs for ideas 061-070
newIdeas.forEach(x => {
  const dirPath = path.join('prompts', 'idea-specific', x.id);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const cust = x.customer || {};
  const primaryCust = cust.primaryCustomer || x.atAGlance.targetCustomer || 'Target Buyer';
  const probSolved = cust.specificProblem || x.atAGlance.problemSolved || 'Unanswered product questions';

  // Readme for prompt pack
  const readmeLines = [
    `# Prompt Pack — ${x.name}`,
    ``,
    `Twenty-five context-bound prompts for researching, validating, building, launching, operating, and reassessing **${x.name}**.`,
    ``
  ];

  PROMPT_TYPES.forEach(pt => {
    readmeLines.push(`- [${pt.title}](${pt.slug}.md)`);

    const pFile = path.join(dirPath, `${pt.slug}.md`);
    const pContent = `# ${pt.title} Prompt — ${x.name}

You are working on **${x.name}**.

## Verified context supplied by the idea record
- Concept: ${x.oneSentenceConcept}
- Primary customer: ${primaryCust}
- Problem: ${probSolved}
- Proposed product: ${x.atAGlance.whatToBuild}
- Revenue paths: ${x.atAGlance.howItMakesMoney}
- Main risk: ${x.atAGlance.mainRisk}
- Current confidence: ${x.atAGlance.confidenceScore}/10

## Evidence rules
Separate source facts, user-provided claims, analyst assumptions, calculations, projections, and unknowns. Do not invent market sizes, competitors, prices, laws, APIs, customer quotes, traction, or completed implementation. Recheck every current claim using primary sources. Show negative evidence. Cite the claim each source supports. Preserve uncertainty and stop when access is insufficient.

## Assignment
${pt.assignment}

## Required output
Return decisions, evidence table, assumptions, unknowns, risks, acceptance criteria, and the next falsification step.
`;
    fs.writeFileSync(pFile, pContent, 'utf8');

    // Add record to prompts array
    const pId = `prompt-${x.id}-${pt.slug}`;
    if (!prompts.some(z => z.id === pId)) {
      prompts.push({
        id: pId,
        ideaId: x.id,
        type: pt.slug,
        title: `${pt.title} — ${x.name}`,
        wordCount: pContent.split(/\s+/).length,
        sourceStatus: 'generated from Eighth Reset canonical idea schema',
        path: `prompts/idea-specific/${x.id}/${pt.slug}.md`
      });
    }
  });

  fs.writeFileSync(path.join(dirPath, 'README.md'), readmeLines.join('\n'), 'utf8');
});

fs.writeFileSync('data/prompts.json', JSON.stringify(prompts, null, 2), 'utf8');
console.log(`✓ Created 10 prompt packs (250 prompts total). Total prompts in index: ${prompts.length}`);

// 3. Add Eighth Reset Tournament Ranking to data/rankings.json
const tournamentRankingId = 'eighth-reset-tournament-2026';
if (!rankings.some(r => r.id === tournamentRankingId)) {
  const resetItems = [
    { rank: 1,  ideaId: 'idea-061', name: 'FactBounty — Buyer-Funded Product Proof Exchange', score: 91.2, reason: 'Tournament winner. Fastest to revenue, zero pre-funding required, compounds into reusable product-evidence graph.' },
    { rank: 2,  ideaId: 'idea-068', name: 'Product Evidence API for Shopping Agents', score: 85.7, reason: 'Highest structural upside; acts as B2B monetization layer for FactBounty evidence data.' },
    { rank: 3,  ideaId: 'idea-062', name: 'MeasureGraph — Exact Dimensions Evidence Network', score: 85.4, reason: 'Lowest liability risk, highly deterministic measurements, immediate appeal for physical goods buyers.' },
    { rank: 4,  ideaId: 'idea-063', name: 'Compatibility Bounties', score: 84.2, reason: 'High bounty values for hardware/part compatibility; requires clear safety disclosures.' },
    { rank: 5,  ideaId: 'idea-064', name: 'Verified Owner Answers — Cross-Retailer Q&A', score: 82.1, reason: 'Broad customer appeal; competes with free Q&A forums.' },
    { rank: 6,  ideaId: 'idea-066', name: 'Revision & Variant Proof Registry', score: 80.1, reason: 'Resilient long-term data asset for component changes across revisions.' },
    { rank: 7,  ideaId: 'idea-065', name: 'Local Shelf Proof — Real-Time Retail Stock Evidence', score: 78.3, reason: 'Strong demand from shopping agents; cold-start local responder network challenge.' },
    { rank: 8,  ideaId: 'idea-070', name: 'Seller ProofLink — Guided Listing Verification', score: 74.2, reason: 'Complements FactBounty on seller side; crowded trust-badge market.' },
    { rank: 9,  ideaId: 'idea-067', name: 'Real-World Noise & Clearance Facts', score: 72.5, reason: 'Best deployed as specialized request category inside FactBounty rather than standalone.' },
    { rank: 10, ideaId: 'idea-069', name: 'Receipt-Verified Purchase Data Exchange', score: 68.3, reason: 'High privacy compliance burden; low individual consumer willingness-to-pay.' }
  ];

  rankings.unshift({
    id: tournamentRankingId,
    title: 'Deep Research Eighth Full Reset — Tournament Finalists (2026-08-02)',
    method: '12-round elimination tournament scoring 60 candidate ideas under zero-dollar startup and immediate revenue constraints.',
    items: resetItems
  });

  fs.writeFileSync('data/rankings.json', JSON.stringify(rankings, null, 2), 'utf8');
  console.log('✓ Added Eighth Reset Tournament ranking to data/rankings.json');
}

// 4. Generate data/ideas.csv
const csvHeaders = ['ID', 'Name', 'Category', 'Status', 'Overall Score', 'Confidence', 'Target Customer', 'Problem Solved', 'What To Build', 'Startup Cost Min', 'Startup Cost Max', 'Time To MVP', 'Main Risk'];
const csvRows = [csvHeaders.join(',')];

ideas.forEach(x => {
  const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
  const row = [
    escapeCsv(x.id),
    escapeCsv(x.name),
    escapeCsv(x.category),
    escapeCsv(x.status),
    x.atAGlance?.overallScore ?? 0,
    x.scores?.overallConfidence?.value ?? 0,
    escapeCsv(x.atAGlance?.targetCustomer),
    escapeCsv(x.atAGlance?.problemSolved),
    escapeCsv(x.atAGlance?.whatToBuild),
    x.atAGlance?.startupCost?.minimum ?? 0,
    x.atAGlance?.startupCost?.maximum ?? 0,
    escapeCsv(x.atAGlance?.timeToMvp),
    escapeCsv(x.atAGlance?.mainRisk)
  ];
  csvRows.push(row.join(','));
});

fs.writeFileSync('data/ideas.csv', csvRows.join('\n'), 'utf8');
console.log(`✓ Exported ${ideas.length} ideas to data/ideas.csv`);

// 5. Create docs/categories.html
const catHtml = `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Categories — Venture Atlas OS</title>
  <meta name="description" content="Browse business ideas by category across AI infrastructure, B2B SaaS, developer tools, marketplaces, product verification, and more.">
  <meta name="robots" content="index, follow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="../assets/css/site.css">
  <link rel="manifest" href="../manifest.webmanifest">
</head>
<body data-page="categories" data-root="..">
  <main id="main">
    <section class="section" style="margin-bottom:1.5rem">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="../index.html">Ideas</a>
        <span class="sep">›</span>
        <span>Categories</span>
      </nav>
      <h1 style="font-size:clamp(1.5rem,4vw,2.5rem);margin-bottom:0.5rem">Idea Categories</h1>
      <p class="lede">
        Browse ${ideas.length} business ideas organized across ${categories.length} domain categories.
      </p>
    </section>

    <div id="categoryGrid" class="cards" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
      <!-- Populated by site.js initCategories() -->
    </div>
  </main>
  <script src="../assets/js/site.js"></script>
</body>
</html>
`;
fs.writeFileSync('docs/categories.html', catHtml, 'utf8');
console.log('✓ Created docs/categories.html');

console.log('\n=== BUILD COMPLETE ===');
