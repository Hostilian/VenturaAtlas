const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const RELATIONSHIPS_PATH = path.join(ROOT, 'data', 'relationships.json');
const OVERRIDES_PATH = path.join(ROOT, 'data', 'idea-taxonomy-overrides.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'idea-taxonomy.json');

const FAMILIES = [
  { id: 'software-ai-developer', label: 'Software, AI & Developer Systems', description: 'AI products, developer tooling, cloud software, APIs, automation, and data infrastructure.', terms: /\b(ai|agent|developer|software|cloud|saas|api|automation|data infrastructure|knowledge management|information infrastructure|telecom)\b/i },
  { id: 'cyber-identity-trust', label: 'Cybersecurity, Identity & Trust', description: 'Security, resilience, identity, credentials, fraud prevention, and online trust.', terms: /\b(cyber|security|identity|credential|fraud|pqc|quantum|age assurance|online safety|trust)\b/i },
  { id: 'finance-audit-governance', label: 'Finance, Audit & Governance', priority: 2, description: 'Financial operations, audit, payments, insurance, underwriting, corporate governance, and succession.', terms: /\b(audit|financial|finance|fintech|payment|receivable|insurance|underwrit|billing|m&a|succession|treasury|corporate governance|accounting)\b/i },
  { id: 'commerce-marketplaces-consumer', label: 'Commerce, Marketplaces & Consumer', description: 'Marketplaces, e-commerce, local commerce, product discovery, consumer utilities, and product evidence.', terms: /\b(consumer|marketplace|commerce|e-commerce|seller|buyer|retail|product verification|referral|shopping)\b/i },
  { id: 'industrial-supply-logistics', label: 'Industrial, Supply Chain & Logistics', priority: 3, description: 'Industrial operations, manufacturing, materials, trade, customs, logistics, hardware, and supply chains.', terms: /\b(industrial|manufactur|hardware|supply chain|logistics|freight|customs|trade|import|export|material|chemical|battery|machinery|equipment|spare part|automotive|port)\b/i },
  { id: 'climate-energy-environment', label: 'Climate, Energy & Environment', priority: 4, description: 'Energy systems, grids, climate resilience, carbon, environmental compliance, water, and circularity.', terms: /\b(climate|energy|grid|electrical|environment|carbon|water|pfas|f-gas|refrigerant|circular|waste|emission|hvac|methane)\b/i },
  { id: 'health-life-sciences', label: 'Healthcare & Life Sciences', priority: 5, description: 'Healthcare delivery, medicines, biotechnology, payer operations, patient data, and medical supply.', terms: /\b(health|medical|medicine|pharma|biotech|hospital|patient|medicare|payer|soho|eudamed|ehr|pet-care|reproductive)\b/i },
  { id: 'construction-property-repair', label: 'Construction, Property & Repair', priority: 4, description: 'Construction, buildings, property, fabrication, maintenance, repair, and physical adaptation.', terms: /\b(construction|property|real estate|building|housing|repair|fabrication|workshop|renovation|appliance|garment|furniture)\b/i },
  { id: 'research-education-knowledge', label: 'Research, Education & Knowledge', priority: 4, description: 'Scholarly research, education, laboratories, knowledge systems, museums, and scientific infrastructure.', terms: /\b(research|scholarly|education|scientific|laborator|university|academic|knowledge|museum|peer-review|citation)\b/i },
  { id: 'media-creator-games', label: 'Media, Creator Economy & Games', description: 'Media, publishing, creator tools, digital assets, content operations, and games.', terms: /\b(media|creator|publisher|content|game|gaming|digital asset|copyright)\b/i },
  { id: 'travel-mobility-events', label: 'Travel, Mobility & Events', priority: 4, description: 'Travel, transport, aviation, maritime operations, pedestrian mobility, lodging, and events.', terms: /\b(travel|transport|aviation|air travel|maritime|mobility|pedestrian|lodging|hotel|event|rail|passenger|border control)\b/i },
  { id: 'public-regulatory-procurement', label: 'Public Sector, Regulation & Procurement', description: 'Public services, regulatory operations, accessibility, government procurement, and legal compliance.', terms: /\b(public sector|government|procurement|regulatory|regulation|compliance|accessibility|legal tech|grant|permit|certification)\b/i },
  { id: 'food-agriculture', label: 'Food & Agriculture', priority: 5, description: 'Food systems, agriculture, packaged food, farming, and associated contracts.', terms: /\b(food|agri|agriculture|farm|crop|restaurant)\b/i },
  { id: 'business-operations-services', label: 'Business Operations & Services', description: 'Cross-sector business workflows, scheduling, sales intelligence, operational continuity, and professional services.', terms: /\b(b2b|business|appointment|scheduling|sales|operations|service|utilities|organizational)\b/i },
];

const PATTERNS = [
  { id: 'compliance-gate', label: 'Compliance Gate & Preflight', description: 'Checks eligibility or conformance before a release, filing, transaction, or market-access event.', terms: /\b(compliance|regulatory|preflight|conformance|certif|eligibility|reporting|permit|attest|audit|release ci|submission|register)\b/i },
  { id: 'evidence-verification', label: 'Evidence, Verification & Reconciliation', description: 'Creates, verifies, reconciles, or preserves proof and provenance.', terms: /\b(evidence|verif|proof|provenance|trace|lineage|reconcil|integrity|fact|replay|ledger|passport)\b/i },
  { id: 'monitoring-intelligence', label: 'Monitoring & Decision Intelligence', description: 'Observes change, detects exceptions, and supports decisions with structured intelligence.', terms: /\b(monitor|intelligence|analytics|radar|watch|observ|alert|detect|graph|forecast|signal|scoring)\b/i },
  { id: 'workflow-automation', label: 'Workflow Automation & Operations', description: 'Coordinates recurring work, cases, approvals, records, or operational handoffs.', terms: /\b(workflow|automat|orchestrat|operations|\bops\b|management|scheduling|continuity|case management|organizer)\b/i },
  { id: 'marketplace-network', label: 'Marketplace, Exchange & Network', description: 'Matches participants, aggregates supply or demand, or compounds network data.', terms: /\b(marketplace|exchange|network|broker|bounty|matching|referral|clearing|community|pool)\b/i },
  { id: 'routing-optimization', label: 'Routing, Allocation & Optimization', description: 'Routes resources, capacity, shipments, cases, or decisions under constraints.', terms: /\b(router|routing|optim|planner|allocation|dispatch|capacity|portfolio|schedule|clearinghouse)\b/i },
  { id: 'infrastructure-api', label: 'Infrastructure, API & Integration', description: 'Provides reusable technical infrastructure, integrations, APIs, SDKs, gateways, or compilers.', terms: /\b(infrastructure|\bapi\b|\bsdk\b|integration|gateway|compiler|adapter|platform|protocol|middleware|ci\b)\b/i },
  { id: 'financial-risk', label: 'Financial, Risk & Underwriting', description: 'Prices risk, recovers money, finances activity, or controls financial exposure.', terms: /\b(underwrit|insurance|treasury|finance|payment|receivable|bankability|billing|revenue recovery|cash flow|funding)\b/i },
  { id: 'advisory-service', label: 'Advisory, Audit & Productized Service', description: 'Delivers a bounded expert service, report, assessment, or managed outcome.', terms: /\b(advisory|consult|productized|assessment|report service|expert service|concierge)\b/i },
  { id: 'physical-repair-service', label: 'Physical Service, Repair & Fabrication', description: 'Acts on physical assets through repair, inspection, fabrication, maintenance, or field service.', terms: /\b(repair|fabricat|maintenance|inspection|physical|workshop|field service|spare part|equipment)\b/i },
  { id: 'consumer-utility', label: 'Consumer Utility & Discovery', description: 'Helps an individual discover, decide, plan, or complete a personal task.', terms: /\b(consumer|personal|discovery|guide|assistant|trip|local|quiet|accessible lodging)\b/i },
  { id: 'content-creator-tool', label: 'Content, Creator & Media Tool', description: 'Supports creation, publishing, games, rights, or media operations.', terms: /\b(creator|content|media|publisher|game|writing|video|audio|rights)\b/i },
];

const BUYER_SEGMENTS = [
  { id: 'developers-technical-teams', label: 'Developers & technical teams', terms: /\b(developer|engineering|software team|technical team|ai-native|devops|security team|data team)\b/i },
  { id: 'manufacturers-supply-chain', label: 'Manufacturers & supply-chain operators', terms: /\b(manufacturer|factory|industrial|supplier|importer|exporter|logistics|freight|warehouse|oem|distributor)\b/i },
  { id: 'government-public-buyers', label: 'Government & public-sector buyers', terms: /\b(government|public sector|municipal|authority|regulator|procurement|ministry|agency)\b/i },
  { id: 'financial-risk-teams', label: 'Finance, audit & risk teams', terms: /\b(finance|financial|audit|account|bank|insurer|underwriter|treasury|compliance team|cfo)\b/i },
  { id: 'healthcare-life-science', label: 'Healthcare & life-science organizations', terms: /\b(health|hospital|clinic|medical|pharma|biotech|payer|laboratory|care home|veterinary)\b/i },
  { id: 'research-education', label: 'Researchers & education organizations', terms: /\b(research|university|academic|school|student|teacher|scientist|museum|library)\b/i },
  { id: 'commerce-marketplace', label: 'Commerce & marketplace operators', terms: /\b(retailer|seller|merchant|marketplace|e-commerce|commerce|brand|store|buyer)\b/i },
  { id: 'property-construction', label: 'Property & construction operators', terms: /\b(property|landlord|construction|building|homeowner|facility|contractor|housing)\b/i },
  { id: 'travel-event-mobility', label: 'Travel, event & mobility operators', terms: /\b(travel|hotel|lodging|airline|airport|rail|transport|event|venue|tour)\b/i },
  { id: 'creators-publishers', label: 'Creators, publishers & media teams', terms: /\b(creator|publisher|media|artist|writer|game studio|content team)\b/i },
  { id: 'consumers-individuals', label: 'Consumers & individuals', terms: /\b(consumer|individual|traveler|family|parent|pet owner|resident|homeowner|passenger)\b/i },
  { id: 'sme-business-teams', label: 'SMEs & business teams', terms: /\b(sme|small business|business owner|company|enterprise|operations team|professional|employer)\b/i },
];

const STOP_WORDS = new Set('a an and are as at be between by can for from how in into is it of on or our that the their this to under with without your platform system tool solution service product software ai eu business idea new current teams team using use'.split(' '));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function hashInputs(...values) {
  return crypto.createHash('sha256').update(values.map(value => JSON.stringify(value)).join('\n')).digest('hex');
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncate(value, maximum = 220) {
  const text = clean(value);
  if (text.length <= maximum) return text;
  return `${text.slice(0, maximum - 1).trimEnd()}…`;
}

function classificationText(idea) {
  return {
    category: clean(idea.category),
    subcategory: clean(idea.subcategory),
    name: clean(idea.name),
    tags: (idea.tags || []).join(' '),
    concept: clean(idea.oneSentenceConcept),
    buyer: clean(idea.customer?.economicBuyer || idea.customer?.primaryCustomer || idea.atAGlance?.targetCustomer),
  };
}

function scoreDefinition(definition, parts) {
  const weights = { category: 9, subcategory: 6, name: 5, tags: 4, concept: 3, buyer: 2 };
  return Object.entries(parts).reduce((score, [key, value]) => {
    const matches = clean(value).match(new RegExp(definition.terms.source, 'gi')) || [];
    return score + Math.min(matches.length, 3) * weights[key];
  }, 0);
}

function classify(definitions, parts, fallback) {
  const scored = definitions.map((definition, index) => ({ definition, index, score: scoreDefinition(definition, parts) }));
  scored.sort((left, right) => right.score - left.score || (right.definition.priority || 0) - (left.definition.priority || 0) || left.index - right.index);
  return scored[0].score > 0 ? scored[0].definition : fallback;
}

function buyerSegment(idea) {
  const buyer = clean(idea.customer?.economicBuyer || idea.customer?.primaryCustomer || idea.atAGlance?.targetCustomer);
  return BUYER_SEGMENTS.find(segment => segment.terms.test(buyer)) || { id: 'cross-sector-buyer', label: 'Cross-sector or unspecified buyer' };
}

function tokenize(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function weightedTokens(idea) {
  const fields = [
    [idea.name, 5],
    [idea.category, 6],
    [idea.subcategory, 4],
    [(idea.tags || []).join(' '), 4],
    [idea.oneSentenceConcept, 3],
    [idea.atAGlance?.targetCustomer, 2],
    [idea.atAGlance?.problemSolved, 2],
  ];
  const result = new Map();
  for (const [value, weight] of fields) {
    for (const token of new Set(tokenize(value))) {
      result.set(token, (result.get(token) || 0) + weight);
    }
  }
  return result;
}

function weightedJaccard(left, right) {
  const keys = new Set([...left.keys(), ...right.keys()]);
  let intersection = 0;
  let union = 0;
  for (const key of keys) {
    intersection += Math.min(left.get(key) || 0, right.get(key) || 0);
    union += Math.max(left.get(key) || 0, right.get(key) || 0);
  }
  return union ? intersection / union : 0;
}

function sharedTerms(left, right) {
  return [...left.keys()]
    .filter(token => right.has(token))
    .sort((a, b) => Math.min(right.get(b), left.get(b)) - Math.min(right.get(a), left.get(a)) || a.localeCompare(b))
    .slice(0, 4);
}

function classifySimilarity(score) {
  if (score >= 95) return 'potential-duplicate';
  if (score >= 72) return 'very-close';
  if (score >= 56) return 'close';
  if (score >= 40) return 'related';
  return 'adjacent';
}

function positioningFor(idea) {
  return {
    primaryBuyer: truncate(idea.customer?.economicBuyer || idea.customer?.primaryCustomer || idea.atAGlance?.targetCustomer || 'Unspecified'),
    problem: truncate(idea.atAGlance?.problemSolved || idea.problemStatement || 'Unspecified'),
    deliverable: truncate(idea.atAGlance?.whatToBuild || idea.oneSentenceConcept || 'Unspecified'),
    revenueModel: truncate(idea.atAGlance?.howItMakesMoney || idea.atAGlance?.businessModel || 'Unspecified'),
  };
}

function differenceSummary(left, right) {
  if (left.normalizedName === right.normalizedName) return 'Exact normalized-name match; inspect provenance and scope before retaining both canonical records';
  if (left.patternId !== right.patternId) return `Different idea type: ${left.patternLabel} vs ${right.patternLabel}`;
  if (left.buyerSegmentId !== right.buyerSegmentId) return `Different buyer segment: ${left.buyerSegmentLabel} vs ${right.buyerSegmentLabel}`;
  if (left.originalCategory !== right.originalCategory) return `Different detailed category: ${left.originalCategory} vs ${right.originalCategory}`;
  if (left.positioning.primaryBuyer !== right.positioning.primaryBuyer) return 'Same family and type, but aimed at differently described primary buyers';
  return 'Very similar positioning; inspect problem, deliverable, and validation wedge side by side';
}

function buildTaxonomy(ideas, relationships) {
  const familyFallback = { id: 'business-operations-services', label: 'Business Operations & Services', description: 'Cross-sector business workflows and services.' };
  const patternFallback = { id: 'workflow-automation', label: 'Workflow Automation & Operations', description: 'Coordinates a recurring business workflow.' };
  const relationshipPairs = new Set();
  const overridesPayload = fs.existsSync(OVERRIDES_PATH) ? readJson(OVERRIDES_PATH) : { overrides: [] };
  const overrides = new Map((overridesPayload.overrides || []).map(override => [override.ideaId, override]));
  const familyById = new Map(FAMILIES.map(family => [family.id, family]));
  const patternById = new Map(PATTERNS.map(pattern => [pattern.id, pattern]));
  const ideaIds = new Set(ideas.map(idea => idea.id));
  for (const override of overrides.values()) {
    if (!ideaIds.has(override.ideaId)) throw new Error(`Stale taxonomy override for ${override.ideaId}`);
    if (!clean(override.reviewNote)) throw new Error(`Taxonomy override lacks review note for ${override.ideaId}`);
  }
  for (const relation of relationships) {
    if (relation.source && relation.target) {
      relationshipPairs.add([relation.source, relation.target].sort().join('|'));
    }
  }

  const assignments = ideas.map(idea => {
    const parts = classificationText(idea);
    const scoredFamilies = FAMILIES
      .map((definition, index) => ({ definition, index, score: scoreDefinition(definition, parts) }))
      .sort((left, right) => right.score - left.score || (right.definition.priority || 0) - (left.definition.priority || 0) || left.index - right.index);
    const override = overrides.get(idea.id);
    const family = override ? familyById.get(override.familyId) : (scoredFamilies[0].score > 0 ? scoredFamilies[0].definition : familyFallback);
    const scoredPatterns = PATTERNS
      .map((definition, index) => ({ definition, index, score: scoreDefinition(definition, parts) }))
      .sort((left, right) => right.score - left.score || left.index - right.index);
    const pattern = override ? patternById.get(override.patternId) : (scoredPatterns[0].score > 0 ? scoredPatterns[0].definition : patternFallback);
    if (!family || !pattern) throw new Error(`Invalid taxonomy override for ${idea.id}`);
    const secondaryPatternIds = scoredPatterns.filter(item => item.score > 0 && item.definition.id !== pattern.id).slice(0, 2).map(item => item.definition.id);
    const segment = buyerSegment(idea);
    return {
      ideaId: idea.id,
      familyId: family.id,
      familyLabel: family.label,
      patternId: pattern.id,
      patternLabel: pattern.label,
      secondaryPatternIds,
      groupId: `${family.id}--${pattern.id}`,
      buyerSegmentId: segment.id,
      buyerSegmentLabel: segment.label,
      originalCategory: idea.category || 'Uncategorized',
      originalSubcategory: idea.subcategory || null,
      normalizedName: tokenize(idea.name).join(' '),
      positioning: positioningFor(idea),
      classification: {
        method: override ? 'MANUAL_SEMANTIC_OVERRIDE' : 'WEIGHTED_TERM_CLASSIFIER',
        reviewNote: override?.reviewNote || null,
        familyScore: scoredFamilies[0].score,
        familyMargin: scoredFamilies[0].score - (scoredFamilies[1]?.score || 0),
        patternScore: scoredPatterns[0].score,
        patternMargin: scoredPatterns[0].score - (scoredPatterns[1]?.score || 0),
        familyReviewRequired: !override && (scoredFamilies[0].score === 0 || scoredFamilies[0].score === scoredFamilies[1]?.score),
        patternReviewRequired: !override && (scoredPatterns[0].score === 0 || scoredPatterns[0].score === scoredPatterns[1]?.score),
        reviewRequired: !override && (scoredFamilies[0].score === 0
          || scoredPatterns[0].score === 0
          || scoredFamilies[0].score === scoredFamilies[1]?.score
          || scoredPatterns[0].score === scoredPatterns[1]?.score),
      },
      closestIdeas: [],
      closestSimilarity: 0,
      distinctivenessScore: 100,
    };
  });

  const assignmentById = new Map(assignments.map(assignment => [assignment.ideaId, assignment]));
  const ideaById = new Map(ideas.map(idea => [idea.id, idea]));
  const tokenMaps = new Map(ideas.map(idea => [idea.id, weightedTokens(idea)]));

  for (let leftIndex = 0; leftIndex < ideas.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < ideas.length; rightIndex += 1) {
      const leftIdea = ideas[leftIndex];
      const rightIdea = ideas[rightIndex];
      const left = assignmentById.get(leftIdea.id);
      const right = assignmentById.get(rightIdea.id);
      const lexical = weightedJaccard(tokenMaps.get(leftIdea.id), tokenMaps.get(rightIdea.id));
      const sameFamily = left.familyId === right.familyId;
      const samePattern = left.patternId === right.patternId;
      const sameBuyer = left.buyerSegmentId === right.buyerSegmentId && left.buyerSegmentId !== 'cross-sector-buyer';
      const explicit = relationshipPairs.has([leftIdea.id, rightIdea.id].sort().join('|'));
      const exactName = left.normalizedName && left.normalizedName === right.normalizedName;
      const score = exactName ? 100 : Math.min(100, Math.round(lexical * 45 + (sameFamily ? 22 : 0) + (samePattern ? 18 : 0) + (sameBuyer ? 8 : 0) + (explicit ? 7 : 0)));
      const terms = sharedTerms(tokenMaps.get(leftIdea.id), tokenMaps.get(rightIdea.id));
      const reasons = [
        exactName ? 'exact normalized-name match' : null,
        sameFamily ? `same family: ${left.familyLabel}` : null,
        samePattern ? `same idea type: ${left.patternLabel}` : null,
        sameBuyer ? `same buyer segment: ${left.buyerSegmentLabel}` : null,
        explicit ? 'explicitly related in the portfolio graph' : null,
        terms.length ? `shared terms: ${terms.join(', ')}` : null,
      ].filter(Boolean);
      const shared = { score, band: classifySimilarity(score), reasons };
      left.closestIdeas.push({ ideaId: rightIdea.id, name: rightIdea.name, ...shared, difference: differenceSummary(left, right) });
      right.closestIdeas.push({ ideaId: leftIdea.id, name: leftIdea.name, ...shared, difference: differenceSummary(right, left) });
    }
  }

  for (const assignment of assignments) {
    assignment.closestIdeas.sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
    assignment.closestIdeas = assignment.closestIdeas.slice(0, 5);
    assignment.closestSimilarity = assignment.closestIdeas[0]?.score || 0;
    assignment.distinctivenessScore = 100 - assignment.closestSimilarity;
  }

  const families = FAMILIES.map(family => {
    const members = assignments.filter(assignment => assignment.familyId === family.id);
    return { id: family.id, label: family.label, description: family.description, count: members.length };
  }).filter(family => family.count > 0);
  const patterns = PATTERNS.map(pattern => {
    const members = assignments.filter(assignment => assignment.patternId === pattern.id);
    return { id: pattern.id, label: pattern.label, description: pattern.description, count: members.length };
  }).filter(pattern => pattern.count > 0);
  const groups = [...new Set(assignments.map(assignment => assignment.groupId))].map(groupId => {
    const members = assignments.filter(assignment => assignment.groupId === groupId);
    return {
      id: groupId,
      familyId: members[0].familyId,
      familyLabel: members[0].familyLabel,
      patternId: members[0].patternId,
      patternLabel: members[0].patternLabel,
      count: members.length,
      ideaIds: members.map(member => member.ideaId).sort(),
    };
  }).sort((left, right) => left.familyLabel.localeCompare(right.familyLabel) || left.patternLabel.localeCompare(right.patternLabel));
  const reviewQueue = assignments.flatMap(assignment => {
    const reasons = [];
    if (assignment.classification.familyReviewRequired) reasons.push('ambiguous-or-fallback-family');
    if (assignment.classification.patternReviewRequired) reasons.push('ambiguous-or-fallback-pattern');
    const duplicate = assignment.closestIdeas.find(neighbor => neighbor.band === 'potential-duplicate');
    if (duplicate) reasons.push(`potential-duplicate:${duplicate.ideaId}`);
    return reasons.length ? [{ ideaId: assignment.ideaId, reasons }] : [];
  });

  return {
    schemaVersion: '1.0.0',
    contract: 'normalized-browsing-taxonomy-not-identity-or-deduplication-authority',
    methodology: {
      family: 'Deterministic weighted classification over original category, subcategory, name, tags, concept, and buyer.',
      pattern: 'Independent venture-pattern classification keeps similar business mechanics together across market domains.',
      similarity: 'Weighted lexical overlap plus family, pattern, buyer-segment, and explicit-relationship signals.',
      caution: 'Similarity is a browsing aid. It does not prove duplication, market validity, or ranking eligibility.',
    },
    sourceDigest: hashInputs(ideas, relationships, overridesPayload),
    ideaCount: ideas.length,
    familyCount: families.length,
    patternCount: patterns.length,
    groupCount: groups.length,
    reviewQueueCount: reviewQueue.length,
    families,
    patterns,
    groups,
    reviewQueue,
    assignments,
  };
}

function validateTaxonomy(taxonomy, ideas) {
  const errors = [];
  const ideaIds = new Set(ideas.map(idea => idea.id));
  const assignments = taxonomy.assignments || [];
  const assignedIds = assignments.map(assignment => assignment.ideaId);
  if (assignments.length !== ideas.length) errors.push(`assignment count ${assignments.length} differs from idea count ${ideas.length}`);
  if (new Set(assignedIds).size !== assignedIds.length) errors.push('duplicate idea assignments found');
  for (const ideaId of ideaIds) if (!assignedIds.includes(ideaId)) errors.push(`missing assignment for ${ideaId}`);
  for (const assignment of assignments) {
    if (!assignment.familyId || !assignment.patternId || !assignment.groupId) errors.push(`${assignment.ideaId} has incomplete classification`);
    if (!assignment.classification || !Number.isFinite(assignment.classification.familyMargin) || !Number.isFinite(assignment.classification.patternMargin)) errors.push(`${assignment.ideaId} has incomplete classification confidence`);
    if (assignment.closestIdeas.length !== Math.min(5, Math.max(0, ideas.length - 1))) errors.push(`${assignment.ideaId} has incomplete nearest-neighbor list`);
    for (const neighbor of assignment.closestIdeas) {
      if (!ideaIds.has(neighbor.ideaId)) errors.push(`${assignment.ideaId} references unknown neighbor ${neighbor.ideaId}`);
      if (!Number.isInteger(neighbor.score) || neighbor.score < 0 || neighbor.score > 100) errors.push(`${assignment.ideaId} has invalid similarity score`);
    }
  }
  const familyTotal = taxonomy.families.reduce((sum, family) => sum + family.count, 0);
  const patternTotal = taxonomy.patterns.reduce((sum, pattern) => sum + pattern.count, 0);
  if (familyTotal !== ideas.length) errors.push(`family counts sum to ${familyTotal}, expected ${ideas.length}`);
  if (patternTotal !== ideas.length) errors.push(`pattern counts sum to ${patternTotal}, expected ${ideas.length}`);
  if (taxonomy.groups.reduce((sum, group) => sum + group.count, 0) !== ideas.length) errors.push('group counts do not cover every idea exactly once');
  const reviewIds = (taxonomy.reviewQueue || []).map(item => item.ideaId);
  if (reviewIds.length !== taxonomy.reviewQueueCount || new Set(reviewIds).size !== reviewIds.length) errors.push('taxonomy review queue count or uniqueness is invalid');
  for (const ideaId of reviewIds) if (!ideaIds.has(ideaId)) errors.push(`taxonomy review queue references unknown idea ${ideaId}`);
  return errors;
}

function main() {
  const check = process.argv.includes('--check');
  const ideasDocument = readJson(IDEAS_PATH);
  const ideas = Array.isArray(ideasDocument) ? ideasDocument : ideasDocument.ideas || [];
  const relationshipsDocument = readJson(RELATIONSHIPS_PATH);
  const relationships = Array.isArray(relationshipsDocument) ? relationshipsDocument : relationshipsDocument.relationships || [];
  const taxonomy = buildTaxonomy(ideas, relationships);
  const errors = validateTaxonomy(taxonomy, ideas);
  if (errors.length) {
    console.error(`[ERROR] Idea taxonomy invalid:\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  const serialized = `${JSON.stringify(taxonomy, null, 2)}\n`;
  if (check) {
    if (!fs.existsSync(OUTPUT_PATH) || fs.readFileSync(OUTPUT_PATH, 'utf8') !== serialized) {
      console.error('[ERROR] data/idea-taxonomy.json differs from its deterministic projection; run npm run generate:taxonomy');
      process.exit(1);
    }
    console.log(`[OK] Idea taxonomy current: ${ideas.length} ideas, ${taxonomy.familyCount} families, ${taxonomy.patternCount} patterns, ${taxonomy.groupCount} groups`);
    return;
  }
  fs.writeFileSync(OUTPUT_PATH, serialized, 'utf8');
  console.log(`[OK] Wrote idea-taxonomy.json: ${ideas.length} ideas, ${taxonomy.familyCount} families, ${taxonomy.patternCount} patterns, ${taxonomy.groupCount} groups`);
}

if (require.main === module) main();

module.exports = { buildTaxonomy, classifySimilarity, validateTaxonomy, weightedJaccard };
