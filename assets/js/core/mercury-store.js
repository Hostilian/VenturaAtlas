/**
 * VenturaAtlas Mercury — local/private commercial reality store.
 *
 * The store holds hypotheses and user-entered commercial observations in the
 * current browser only. It never contacts prospects, sends messages, or writes
 * to canonical repository data. Counts are derived from records; no traction
 * metric can be set directly.
 */

const MERCURY_SCHEMA_VERSION = '1.1.0';
const MERCURY_LEGACY_SCHEMA_VERSION = '1.0.0';
const MERCURY_STORAGE_KEY = 'va_mercury_workspace_v1';
const MERCURY_PRIVACY_SCOPE = 'LOCAL_BROWSER_ONLY';
const MERCURY_STAGES = [
  'IDENTIFIED', 'CONTACTED', 'CONVERSATION', 'QUALIFIED', 'OFFERED',
  'PILOT', 'PAID', 'ACTIVE', 'RENEWED', 'LOST'
];
const MERCURY_SIGNALS = [
  'PROBLEM_CONFIRMED', 'WORKAROUND_CONFIRMED', 'URGENCY_CONFIRMED',
  'EVALUATION_ACCEPTED', 'OFFER_ACCEPTED', 'COMMITMENT_MADE'
];
const MERCURY_OBJECTION_CATEGORIES = [
  'BUDGET', 'PRICE', 'URGENCY', 'AUTHORITY', 'TRUST', 'FIT',
  'PROCUREMENT', 'TIMING', 'COMPETITOR', 'STATUS_QUO', 'OTHER', 'UNKNOWN'
];
const MERCURY_EVENT_TYPES = [
  'INVOICE_ISSUED', 'PAYMENT_COLLECTED', 'REFUND', 'VALUE_ACHIEVED',
  'RENEWED', 'EXPANDED', 'REFERRED'
];
const EVIDENCE_LADDER = [
  ['C0', 'Hypothetical buyer'],
  ['C1', 'Identifiable reachable buyer'],
  ['C2', 'Problem confirmed'],
  ['C3', 'Current workaround confirmed'],
  ['C4', 'Urgency demonstrated'],
  ['C5', 'Evaluation accepted'],
  ['C6', 'Concrete offer accepted'],
  ['C7', 'Meaningful commitment'],
  ['C8', 'Payment collected'],
  ['C9', 'Value achieved'],
  ['C10', 'Renewed or repeated'],
  ['C11', 'Expanded'],
  ['C12', 'Referred another buyer']
];
const MERCURY_STAGE_RANK = new Map(MERCURY_STAGES.map((stage, index) => [stage, index]));
const MERCURY_ENTITY_KEYS = {
  segment: ['segmentId', 'parentSegmentId', 'name', 'description', 'buyerRoles', 'userRoles', 'budgetOwner', 'budgetSource', 'whyNow', 'currentAlternatives', 'reachability', 'status'],
  trigger: ['triggerId', 'segmentId', 'type', 'description', 'detectability', 'urgencyWindow', 'messageImplication', 'status'],
  offer: ['offerId', 'segmentId', 'name', 'motion', 'deliverable', 'scope', 'price', 'timeToValue', 'pilotType', 'status'],
  price: ['amount', 'currency', 'basis', 'evidenceStatus'],
  channel: ['channelId', 'segmentId', 'name', 'motion', 'accessPath', 'status'],
  organization: ['organizationId', 'name', 'actorType', 'segmentId', 'recordClass', 'commercialStage', 'reachabilityBasis', 'evidenceRef', 'evidenceClass', 'createdAt'],
  interaction: ['interactionId', 'organizationId', 'opportunityId', 'segmentId', 'channelId', 'interactionType', 'occurredAt', 'outcome', 'facts', 'objections', 'objectionCategories', 'signals', 'evidenceRef', 'evidenceClass', 'claimsNotEarned'],
  opportunity: ['opportunityId', 'organizationId', 'segmentId', 'offerId', 'stage', 'stageHistory', 'lossReason', 'createdAt'],
  stageHistory: ['stage', 'recordedAt', 'evidenceRef'],
  commercialEvent: ['eventId', 'organizationId', 'opportunityId', 'eventType', 'occurredAt', 'amount', 'currency', 'evidenceRef', 'evidenceClass'],
  hypothesisChange: ['changeId', 'recordedAt', 'subject', 'before', 'after', 'evidenceRefs']
};

function mercuryNow() {
  return new Date().toISOString();
}

function mercuryId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
}

function mercuryWorkspace(options = {}) {
  const now = options.now || mercuryNow();
  return {
    schemaVersion: MERCURY_SCHEMA_VERSION,
    workspaceMode: 'UNVERIFIED_DRAFT',
    workspaceId: options.workspaceId || mercuryId('mercury'),
    privacyScope: MERCURY_PRIVACY_SCOPE,
    canonicalIdeaId: options.canonicalIdeaId || null,
    canonicalIdeaRevision: options.canonicalIdeaRevision || null,
    ventureName: options.ventureName || '',
    createdAt: now,
    updatedAt: now,
    segments: [],
    triggers: [],
    offers: [],
    channels: [],
    organizations: [],
    interactions: [],
    opportunities: [],
    commercialEvents: [],
    hypothesisHistory: []
  };
}

function studioStorageAdapter(studioStore) {
  return {
    getItem() {
      const workspace = studioStore.getMercuryWorkspace?.();
      return workspace ? JSON.stringify(workspace) : null;
    },
    setItem(_key, value) {
      const saved = studioStore.setMercuryWorkspace?.(JSON.parse(value));
      if (saved === false) throw new Error('Decision Studio could not persist Mercury data');
      return saved;
    },
    removeItem() {
      const removed = studioStore.setMercuryWorkspace?.(null);
      if (removed === false) throw new Error('Decision Studio could not delete Mercury data');
      return removed;
    }
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

function uniqueIds(items, key, errors) {
  const seen = new Set();
  for (const item of items) {
    const id = item?.[key];
    if (!id) errors.push(`${key} is required`);
    else if (seen.has(id)) errors.push(`duplicate ${key}: ${id}`);
    seen.add(id);
  }
  return seen;
}

function rejectUnexpectedProperties(value, allowedKeys, label, errors) {
  if (!isObject(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${label} has unexpected property: ${key}`);
  return true;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function checkEnum(value, allowed, label, errors) {
  if (!allowed.includes(value)) errors.push(`${label} has invalid value ${String(value)}`);
}

function interactionSignalErrors(interaction, workspace = null) {
  const errors = [];
  const signals = interaction.signals || [];
  if (signals.length && (interaction.interactionType === 'CONTACT_ATTEMPT' || interaction.outcome === 'NO_REPLY')) {
    errors.push('contact attempts and no-reply outcomes cannot carry confirmed commercial signals');
  }
  const commitmentSignals = ['EVALUATION_ACCEPTED', 'OFFER_ACCEPTED', 'COMMITMENT_MADE'];
  if (signals.some(signal => commitmentSignals.includes(signal)) && !['QUALIFIED', 'NEXT_STEP'].includes(interaction.outcome)) {
    errors.push('evaluation, offer, and commitment signals require a QUALIFIED or NEXT_STEP outcome');
  }
  const offerSignals = ['OFFER_ACCEPTED', 'COMMITMENT_MADE'];
  if (signals.some(signal => offerSignals.includes(signal))) {
    if (!interaction.opportunityId) {
      errors.push('offer acceptance and commitment signals require an offer-linked opportunity');
    } else if (workspace) {
      const opportunity = workspace.opportunities?.find(item => item.opportunityId === interaction.opportunityId);
      if (!opportunity) {
        errors.push('offer acceptance and commitment signals reference an unknown opportunity');
      } else {
        if (opportunity.organizationId !== interaction.organizationId || opportunity.segmentId !== interaction.segmentId) {
          errors.push('offer acceptance and commitment signals must reference the same buyer and segment');
        }
        if (!opportunity.offerId || !opportunityReached(opportunity, 'OFFERED')) {
          errors.push('offer acceptance and commitment signals require a concrete offer that was recorded as offered');
        }
      }
    }
  }
  return errors;
}

function opportunityReached(opportunity, stages) {
  const wanted = new Set(Array.isArray(stages) ? stages : [stages]);
  return (opportunity.stageHistory || []).some(item => wanted.has(item.stage));
}

function deriveOrganizationStage(workspace, organizationId) {
  const opportunities = (workspace.opportunities || []).filter(item => item.organizationId === organizationId);
  const open = opportunities.filter(item => item.stage !== 'LOST');
  if (open.length) {
    return open.map(item => item.stage).sort((a, b) => MERCURY_STAGE_RANK.get(b) - MERCURY_STAGE_RANK.get(a))[0];
  }
  if (opportunities.length && opportunities.every(item => item.stage === 'LOST')) return 'LOST';
  const interactions = (workspace.interactions || []).filter(item => item.organizationId === organizationId);
  if (interactions.some(item => ['CONVERSATION', 'FOLLOW_UP', 'PILOT_REVIEW', 'LOSS_REVIEW'].includes(item.interactionType))) return 'CONVERSATION';
  if (interactions.some(item => item.interactionType === 'CONTACT_ATTEMPT')) return 'CONTACTED';
  return 'IDENTIFIED';
}

function syncOrganizationStages(workspace) {
  for (const organization of workspace.organizations || []) {
    organization.commercialStage = deriveOrganizationStage(workspace, organization.organizationId);
  }
}

function migrateMercuryWorkspace(workspace) {
  if (!isObject(workspace) || ![MERCURY_SCHEMA_VERSION, MERCURY_LEGACY_SCHEMA_VERSION].includes(workspace.schemaVersion)) return workspace;
  const isLegacy = workspace.schemaVersion === MERCURY_LEGACY_SCHEMA_VERSION;
  if (!isLegacy) return workspace;
  workspace.schemaVersion = MERCURY_SCHEMA_VERSION;
  for (const segment of workspace.segments || []) {
    if (!Object.hasOwn(segment, 'parentSegmentId')) segment.parentSegmentId = null;
    if (typeof segment.budgetOwner !== 'string') segment.budgetOwner = 'UNKNOWN';
    if (typeof segment.budgetSource !== 'string') segment.budgetSource = 'UNKNOWN';
  }
  for (const organization of workspace.organizations || []) {
    if (!organization.actorType) organization.actorType = 'ORGANIZATION';
    if (!organization.reachabilityBasis) organization.reachabilityBasis = 'UNKNOWN — legacy record requires review';
    if (!organization.evidenceRef) organization.evidenceRef = 'legacy-unverified';
    if (!organization.evidenceClass) organization.evidenceClass = 'UNVERIFIED_LEGACY';
  }
  for (const interaction of workspace.interactions || []) {
    if (!Array.isArray(interaction.objections)) interaction.objections = [];
    if (!Array.isArray(interaction.objectionCategories)) interaction.objectionCategories = [];
    if (!interaction.channelId && interaction.segmentId) {
      const channelId = `channel-legacy-unknown-${String(interaction.segmentId).replace(/^segment-/, '')}`;
      if (!(workspace.channels || []).some(channel => channel.channelId === channelId)) {
        workspace.channels.push({
          channelId,
          segmentId: interaction.segmentId,
          name: 'Unknown legacy channel',
          motion: 'UNKNOWN',
          accessPath: 'UNKNOWN — migrated record requires review',
          status: 'UNKNOWN'
        });
      }
      interaction.channelId = channelId;
    }
  }
  for (const opportunity of workspace.opportunities || []) {
    if (typeof opportunity.lossReason !== 'string') opportunity.lossReason = '';
  }
  for (const event of workspace.commercialEvents || []) {
    if (!event.opportunityId) {
      const candidates = (workspace.opportunities || []).filter(item => item.organizationId === event.organizationId);
      if (candidates.length === 1) event.opportunityId = candidates[0].opportunityId;
    }
  }
  syncOrganizationStages(workspace);
  return workspace;
}

function validateMercuryWorkspace(workspace) {
  const errors = [];
  if (!isObject(workspace)) return ['workspace must be an object'];
  if (workspace.schemaVersion !== MERCURY_SCHEMA_VERSION) errors.push('unsupported Mercury schemaVersion');
  if (workspace.workspaceMode !== 'UNVERIFIED_DRAFT') errors.push('workspaceMode must be UNVERIFIED_DRAFT');
  if (workspace.privacyScope !== MERCURY_PRIVACY_SCOPE) errors.push('privacyScope must be LOCAL_BROWSER_ONLY');
  if (typeof workspace.workspaceId !== 'string' || !/^mercury-[a-z0-9-]+$/.test(workspace.workspaceId)) errors.push('workspaceId must be a Mercury ID');
  if (workspace.canonicalIdeaId !== null && !/^idea-[0-9]+$/.test(workspace.canonicalIdeaId || '')) {
    errors.push('canonicalIdeaId must be null or a canonical idea ID');
  }
  if (workspace.canonicalIdeaRevision !== null && typeof workspace.canonicalIdeaRevision !== 'string') errors.push('canonicalIdeaRevision must be null or a string');
  if (typeof workspace.ventureName !== 'string' || workspace.ventureName.length > 200) errors.push('ventureName must be a string of at most 200 characters');
  const rootKeys = new Set([
    'schemaVersion', 'workspaceMode', 'workspaceId', 'privacyScope', 'canonicalIdeaId',
    'canonicalIdeaRevision', 'ventureName', 'createdAt', 'updatedAt', 'segments',
    'triggers', 'offers', 'channels', 'organizations', 'interactions', 'opportunities',
    'commercialEvents', 'hypothesisHistory'
  ]);
  for (const key of Object.keys(workspace)) if (!rootKeys.has(key)) errors.push(`unexpected workspace property: ${key}`);
  for (const key of ['createdAt', 'updatedAt']) {
    if (typeof workspace[key] !== 'string' || !Number.isFinite(Date.parse(workspace[key]))) errors.push(`${key} must be a valid timestamp`);
  }
  const collections = [
    'segments', 'triggers', 'offers', 'channels', 'organizations',
    'interactions', 'opportunities', 'commercialEvents', 'hypothesisHistory'
  ];
  for (const collection of collections) {
    if (!Array.isArray(workspace[collection])) errors.push(`${collection} must be an array`);
  }
  if (errors.length) return errors;

  const segmentIds = uniqueIds(workspace.segments, 'segmentId', errors);
  const triggerIds = uniqueIds(workspace.triggers, 'triggerId', errors);
  const offerIds = uniqueIds(workspace.offers, 'offerId', errors);
  const channelIds = uniqueIds(workspace.channels, 'channelId', errors);
  const organizationIds = uniqueIds(workspace.organizations, 'organizationId', errors);
  const interactionIds = uniqueIds(workspace.interactions, 'interactionId', errors);
  const opportunityIds = uniqueIds(workspace.opportunities, 'opportunityId', errors);
  uniqueIds(workspace.commercialEvents, 'eventId', errors);
  uniqueIds(workspace.hypothesisHistory, 'changeId', errors);
  void triggerIds;
  void interactionIds;

  for (const segment of workspace.segments) {
    rejectUnexpectedProperties(segment, MERCURY_ENTITY_KEYS.segment, segment.segmentId || 'segment', errors);
    if (!/^segment-[a-z0-9-]+$/.test(segment.segmentId || '')) errors.push(`${segment.segmentId || 'segment'} has invalid segmentId`);
    if (segment.parentSegmentId !== null && typeof segment.parentSegmentId !== 'string') errors.push(`${segment.segmentId} has invalid parentSegmentId`);
    if (typeof segment.name !== 'string' || !segment.name || segment.name.length > 160) errors.push(`${segment.segmentId || 'segment'} needs a valid name`);
    if (typeof segment.description !== 'string' || !segment.description || segment.description.length > 1000) errors.push(`${segment.segmentId || 'segment'} needs a valid description`);
    if (!isStringArray(segment.buyerRoles)) errors.push(`${segment.segmentId} buyerRoles must be a string array`);
    if (!isStringArray(segment.userRoles)) errors.push(`${segment.segmentId} userRoles must be a string array`);
    if (typeof segment.budgetOwner !== 'string') errors.push(`${segment.segmentId} budgetOwner must be a string`);
    if (typeof segment.budgetSource !== 'string') errors.push(`${segment.segmentId} budgetSource must be a string`);
    if (typeof segment.whyNow !== 'string') errors.push(`${segment.segmentId} whyNow must be a string`);
    if (!isStringArray(segment.currentAlternatives)) errors.push(`${segment.segmentId} currentAlternatives must be a string array`);
    if (segment.parentSegmentId && !segmentIds.has(segment.parentSegmentId)) errors.push(`${segment.segmentId} has unknown parent segment`);
    checkEnum(segment.reachability, ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'], segment.segmentId, errors);
    checkEnum(segment.status, ['HYPOTHESIS', 'OBSERVED', 'UNKNOWN', 'REJECTED'], segment.segmentId, errors);
  }
  for (const trigger of workspace.triggers) {
    rejectUnexpectedProperties(trigger, MERCURY_ENTITY_KEYS.trigger, trigger.triggerId || 'trigger', errors);
    if (!segmentIds.has(trigger.segmentId)) errors.push(`${trigger.triggerId} has unknown segmentId`);
    if (!/^trigger-[a-z0-9-]+$/.test(trigger.triggerId || '')) errors.push(`${trigger.triggerId || 'trigger'} has invalid triggerId`);
    if (typeof trigger.type !== 'string' || typeof trigger.description !== 'string' || typeof trigger.urgencyWindow !== 'string') errors.push(`${trigger.triggerId} has invalid text fields`);
    checkEnum(trigger.detectability, ['PUBLIC', 'PRIVATE', 'UNKNOWN'], trigger.triggerId, errors);
    checkEnum(trigger.status, ['HYPOTHESIS', 'OBSERVED', 'UNKNOWN', 'REJECTED'], trigger.triggerId, errors);
  }
  for (const offer of workspace.offers) {
    rejectUnexpectedProperties(offer, MERCURY_ENTITY_KEYS.offer, offer.offerId || 'offer', errors);
    rejectUnexpectedProperties(offer.price, MERCURY_ENTITY_KEYS.price, `${offer.offerId || 'offer'} price`, errors);
    if (!segmentIds.has(offer.segmentId)) errors.push(`${offer.offerId} has unknown segmentId`);
    if (!/^offer-[a-z0-9-]+$/.test(offer.offerId || '')) errors.push(`${offer.offerId || 'offer'} has invalid offerId`);
    if (typeof offer.name !== 'string' || typeof offer.deliverable !== 'string' || typeof offer.scope !== 'string' || typeof offer.timeToValue !== 'string') errors.push(`${offer.offerId} has invalid text fields`);
    checkEnum(offer.motion, ['SELF_SERVE', 'FOUNDER_LED', 'SERVICE_FIRST', 'CHANNEL_LED', 'MARKETPLACE', 'DEVELOPER_LED', 'OTHER'], offer.offerId, errors);
    checkEnum(offer.pilotType, ['NONE', 'FREE', 'PAID', 'UNKNOWN'], offer.offerId, errors);
    checkEnum(offer.status, ['HYPOTHESIS', 'OBSERVED', 'UNKNOWN', 'REJECTED'], offer.offerId, errors);
    if (offer.price && offer.price.amount !== null && (typeof offer.price.amount !== 'number' || offer.price.amount < 0)) errors.push(`${offer.offerId} has invalid price amount`);
    if (!offer.price || typeof offer.price.currency !== 'string' || !/^[A-Z]{3}$/.test(offer.price.currency)) errors.push(`${offer.offerId} has invalid price currency`);
    if (!offer.price || typeof offer.price.basis !== 'string') errors.push(`${offer.offerId} has invalid price basis`);
    checkEnum(offer.price?.evidenceStatus, ['HYPOTHESIS', 'VERBAL_RANGE', 'PROPOSAL_ACCEPTED', 'PAID', 'UNKNOWN'], `${offer.offerId} price`, errors);
    if (offer.price?.evidenceStatus === 'PAID') {
      errors.push(`${offer.offerId} cannot claim PAID in a pricing hypothesis; payment is derived from commercial events`);
    }
  }
  for (const channel of workspace.channels) {
    rejectUnexpectedProperties(channel, MERCURY_ENTITY_KEYS.channel, channel.channelId || 'channel', errors);
    if (!segmentIds.has(channel.segmentId)) errors.push(`${channel.channelId} has unknown segmentId`);
    if (!/^channel-[a-z0-9-]+$/.test(channel.channelId || '')) errors.push(`${channel.channelId || 'channel'} has invalid channelId`);
    if (typeof channel.name !== 'string' || typeof channel.motion !== 'string') errors.push(`${channel.channelId} has invalid text fields`);
    checkEnum(channel.status, ['HYPOTHESIS', 'OBSERVED', 'UNKNOWN', 'REJECTED'], channel.channelId, errors);
  }
  for (const organization of workspace.organizations) {
    rejectUnexpectedProperties(organization, MERCURY_ENTITY_KEYS.organization, organization.organizationId || 'organization', errors);
    if (!segmentIds.has(organization.segmentId)) errors.push(`${organization.organizationId} has unknown segmentId`);
    if (!/^org-[a-z0-9-]+$/.test(organization.organizationId || '')) errors.push(`${organization.organizationId || 'organization'} has invalid organizationId`);
    if (typeof organization.name !== 'string' || !organization.name) errors.push(`${organization.organizationId} needs a name`);
    if (!['REAL', 'SYNTHETIC'].includes(organization.recordClass)) errors.push(`${organization.organizationId} has invalid recordClass`);
    checkEnum(organization.actorType, ['ORGANIZATION', 'INDIVIDUAL_ACCOUNT', 'HOUSEHOLD', 'MARKETPLACE_PARTICIPANT'], organization.organizationId, errors);
    if (!MERCURY_STAGES.includes(organization.commercialStage)) errors.push(`${organization.organizationId} has invalid commercialStage`);
    if (!organization.reachabilityBasis?.trim()) errors.push(`${organization.organizationId} lacks a reachabilityBasis`);
    if (!organization.evidenceRef?.trim()) errors.push(`${organization.organizationId} lacks evidenceRef`);
    if (!['OPERATOR_ATTESTED', 'UNVERIFIED_LEGACY'].includes(organization.evidenceClass)) errors.push(`${organization.organizationId} has unsupported evidenceClass`);
    if (!Number.isFinite(Date.parse(organization.createdAt))) errors.push(`${organization.organizationId} has invalid createdAt`);
  }
  for (const interaction of workspace.interactions) {
    rejectUnexpectedProperties(interaction, MERCURY_ENTITY_KEYS.interaction, interaction.interactionId || 'interaction', errors);
    if (!organizationIds.has(interaction.organizationId)) errors.push(`${interaction.interactionId} has unknown organizationId`);
    if (interaction.opportunityId && !opportunityIds.has(interaction.opportunityId)) errors.push(`${interaction.interactionId} has unknown opportunityId`);
    if (!/^interaction-[a-z0-9-]+$/.test(interaction.interactionId || '')) errors.push(`${interaction.interactionId || 'interaction'} has invalid interactionId`);
    if (!segmentIds.has(interaction.segmentId)) errors.push(`${interaction.interactionId} has unknown segmentId`);
    if (!interaction.channelId || !channelIds.has(interaction.channelId)) errors.push(`${interaction.interactionId} has unknown channelId`);
    if (!interaction.evidenceRef?.trim()) errors.push(`${interaction.interactionId} lacks evidenceRef`);
    if (interaction.evidenceClass !== 'OPERATOR_ATTESTED') errors.push(`${interaction.interactionId} has unsupported evidenceClass`);
    if (!isStringArray(interaction.facts) || interaction.facts.length === 0) errors.push(`${interaction.interactionId} needs at least one observed fact`);
    if (!isStringArray(interaction.objections)) errors.push(`${interaction.interactionId} objections must be a string array`);
    if (!Array.isArray(interaction.objectionCategories)) errors.push(`${interaction.interactionId} objectionCategories must be an array`);
    if (!isStringArray(interaction.signals)) errors.push(`${interaction.interactionId} signals must be a string array`);
    if (!isStringArray(interaction.claimsNotEarned)) errors.push(`${interaction.interactionId} claimsNotEarned must be a string array`);
    if (!Number.isFinite(Date.parse(interaction.occurredAt))) errors.push(`${interaction.interactionId} has invalid occurredAt`);
    checkEnum(interaction.interactionType, ['CONTACT_ATTEMPT', 'CONVERSATION', 'PILOT_REVIEW', 'FOLLOW_UP', 'LOSS_REVIEW'], interaction.interactionId, errors);
    checkEnum(interaction.outcome, ['NO_REPLY', 'REPLIED', 'QUALIFIED', 'DISQUALIFIED', 'NEXT_STEP', 'NO_INTEREST', 'UNKNOWN'], interaction.interactionId, errors);
    const organization = workspace.organizations.find(item => item.organizationId === interaction.organizationId);
    const channel = interaction.channelId ? workspace.channels.find(item => item.channelId === interaction.channelId) : null;
    if (organization && organization.segmentId !== interaction.segmentId) errors.push(`${interaction.interactionId} segment does not match organization`);
    if (channel && channel.segmentId !== interaction.segmentId) errors.push(`${interaction.interactionId} channel belongs to another segment`);
    for (const signal of interaction.signals || []) if (!MERCURY_SIGNALS.includes(signal)) errors.push(`${interaction.interactionId} has invalid signal ${signal}`);
    for (const category of interaction.objectionCategories || []) {
      if (!MERCURY_OBJECTION_CATEGORIES.includes(category)) errors.push(`${interaction.interactionId} has invalid objection category ${category}`);
    }
    for (const signalError of interactionSignalErrors(interaction, workspace)) errors.push(`${interaction.interactionId}: ${signalError}`);
  }
  for (const opportunity of workspace.opportunities) {
    rejectUnexpectedProperties(opportunity, MERCURY_ENTITY_KEYS.opportunity, opportunity.opportunityId || 'opportunity', errors);
    if (!organizationIds.has(opportunity.organizationId)) errors.push(`${opportunity.opportunityId} has unknown organizationId`);
    if (!/^opportunity-[a-z0-9-]+$/.test(opportunity.opportunityId || '')) errors.push(`${opportunity.opportunityId || 'opportunity'} has invalid opportunityId`);
    if (!segmentIds.has(opportunity.segmentId)) errors.push(`${opportunity.opportunityId} has unknown segmentId`);
    if (opportunity.offerId && !offerIds.has(opportunity.offerId)) errors.push(`${opportunity.opportunityId} has unknown offerId`);
    if (!MERCURY_STAGES.includes(opportunity.stage)) errors.push(`${opportunity.opportunityId} has invalid stage`);
    if (!Number.isFinite(Date.parse(opportunity.createdAt))) errors.push(`${opportunity.opportunityId} has invalid createdAt`);
    if (!Array.isArray(opportunity.stageHistory) || opportunity.stageHistory.length === 0) {
      errors.push(`${opportunity.opportunityId} needs stageHistory`);
    } else {
      for (const entry of opportunity.stageHistory) {
        rejectUnexpectedProperties(entry, MERCURY_ENTITY_KEYS.stageHistory, `${opportunity.opportunityId} stage history entry`, errors);
        if (!MERCURY_STAGES.includes(entry?.stage)) errors.push(`${opportunity.opportunityId} has invalid stage history entry`);
        if (!Number.isFinite(Date.parse(entry?.recordedAt))) errors.push(`${opportunity.opportunityId} has invalid stage history timestamp`);
        if (!entry?.evidenceRef?.trim()) errors.push(`${opportunity.opportunityId} has stage history without evidenceRef`);
      }
      if (opportunity.stageHistory.at(-1)?.stage !== opportunity.stage) errors.push(`${opportunity.opportunityId} current stage does not match stageHistory`);
    }
    if (opportunity.stage === 'LOST' && !opportunity.lossReason?.trim()) errors.push(`${opportunity.opportunityId} needs a lossReason`);
    const organization = workspace.organizations.find(item => item.organizationId === opportunity.organizationId);
    const offer = opportunity.offerId ? workspace.offers.find(item => item.offerId === opportunity.offerId) : null;
    if (organization && organization.segmentId !== opportunity.segmentId) errors.push(`${opportunity.opportunityId} segment does not match organization`);
    if (offer && offer.segmentId !== opportunity.segmentId) errors.push(`${opportunity.opportunityId} offer belongs to another segment`);
  }
  for (const [eventIndex, event] of workspace.commercialEvents.entries()) {
    rejectUnexpectedProperties(event, MERCURY_ENTITY_KEYS.commercialEvent, event.eventId || 'commercial event', errors);
    if (!organizationIds.has(event.organizationId)) errors.push(`${event.eventId} has unknown organizationId`);
    if (!/^event-[a-z0-9-]+$/.test(event.eventId || '')) errors.push(`${event.eventId || 'commercial event'} has invalid eventId`);
    if (event.opportunityId && !opportunityIds.has(event.opportunityId)) errors.push(`${event.eventId} has unknown opportunityId`);
    if (!MERCURY_EVENT_TYPES.includes(event.eventType)) errors.push(`${event.eventId} has invalid eventType`);
    if (!Number.isFinite(Date.parse(event.occurredAt))) errors.push(`${event.eventId} has invalid occurredAt`);
    if (!event.evidenceRef?.trim()) errors.push(`${event.eventId} lacks evidenceRef`);
    if (event.evidenceClass !== 'OPERATOR_ATTESTED') errors.push(`${event.eventId} has unsupported evidenceClass`);
    const opportunity = event.opportunityId ? workspace.opportunities.find(item => item.opportunityId === event.opportunityId) : null;
    if (opportunity && opportunity.organizationId !== event.organizationId) errors.push(`${event.eventId} opportunity belongs to another organization`);
    const prior = workspace.commercialEvents.slice(0, eventIndex).filter(item => (
      item.organizationId === event.organizationId && item.opportunityId === event.opportunityId
    ));
    const laterThanPrior = prior.every(item => Date.parse(item.occurredAt) <= Date.parse(event.occurredAt));
    if (!laterThanPrior) errors.push(`${event.eventId} is out of chronological order for its opportunity`);
    const paymentTotal = prior.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === event.currency)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const refundTotal = prior.filter(item => item.eventType === 'REFUND' && item.currency === event.currency)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netPaymentExists = [...new Set(prior.map(item => item.currency).filter(Boolean))].some(currency => {
      const collected = prior.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === currency)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const refunded = prior.filter(item => item.eventType === 'REFUND' && item.currency === currency)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return collected > refunded;
    });
    if (!opportunity) {
      errors.push(`${event.eventId} requires an opportunity for this organization`);
    }
    if (event.eventType === 'PAYMENT_COLLECTED' && opportunity) {
      const offered = (opportunity.stageHistory || []).some(item => (
        ['OFFERED', 'PILOT'].includes(item.stage) && Date.parse(item.recordedAt) <= Date.parse(event.occurredAt)
      ));
      if (!offered) errors.push(`${event.eventId} lacks a prior offered or pilot stage`);
    }
    if (event.eventType === 'REFUND' && refundTotal + Number(event.amount || 0) > paymentTotal) errors.push(`${event.eventId} exceeds prior collected payment`);
    if (event.eventType === 'VALUE_ACHIEVED' && !netPaymentExists) errors.push(`${event.eventId} lacks net collected payment for this opportunity`);
    if (event.eventType === 'RENEWED' && !prior.some(item => item.eventType === 'VALUE_ACHIEVED')) errors.push(`${event.eventId} lacks prior value achievement`);
    if (event.eventType === 'EXPANDED' && !prior.some(item => item.eventType === 'VALUE_ACHIEVED')) errors.push(`${event.eventId} lacks prior value achievement`);
    if (event.eventType === 'REFERRED' && !prior.some(item => item.eventType === 'VALUE_ACHIEVED')) errors.push(`${event.eventId} lacks prior value achievement`);
    if (['PAYMENT_COLLECTED', 'REFUND', 'RENEWED', 'EXPANDED'].includes(event.eventType)) {
      if (!(Number(event.amount) > 0) || !/^[A-Z]{3}$/.test(event.currency || '')) {
        errors.push(`${event.eventId} requires a positive amount and ISO currency`);
      }
    }
  }
  for (const change of workspace.hypothesisHistory) {
    rejectUnexpectedProperties(change, MERCURY_ENTITY_KEYS.hypothesisChange, change.changeId || 'hypothesis change', errors);
    if (!Number.isFinite(Date.parse(change.recordedAt))) errors.push(`${change.changeId} has invalid recordedAt`);
    if (!/^change-[a-z0-9-]+$/.test(change.changeId || '')) errors.push(`${change.changeId || 'hypothesis change'} has invalid changeId`);
    if (typeof change.subject !== 'string' || typeof change.before !== 'string' || typeof change.after !== 'string' || !isStringArray(change.evidenceRefs)) errors.push(`${change.changeId} has invalid fields`);
  }
  for (const opportunity of workspace.opportunities) {
    const events = workspace.commercialEvents.filter(item => item.opportunityId === opportunity.opportunityId);
    const requiredEvent = { PAID: 'PAYMENT_COLLECTED', ACTIVE: 'VALUE_ACHIEVED', RENEWED: 'RENEWED' }[opportunity.stage];
    if (requiredEvent && !events.some(item => item.eventType === requiredEvent)) {
      errors.push(`${opportunity.opportunityId} cannot be ${opportunity.stage} without ${requiredEvent}`);
    }
  }
  for (const organization of workspace.organizations) {
    const derivedStage = deriveOrganizationStage(workspace, organization.organizationId);
    if (organization.commercialStage !== derivedStage) errors.push(`${organization.organizationId} commercialStage must be derived as ${derivedStage}`);
  }
  return errors;
}

function derivedEvidence(workspace) {
  const realOrganizations = workspace.organizations.filter(item => item.recordClass === 'REAL' && item.evidenceClass === 'OPERATOR_ATTESTED');
  const realIds = new Set(realOrganizations.map(item => item.organizationId));
  const interactions = workspace.interactions.filter(item => realIds.has(item.organizationId));
  const events = workspace.commercialEvents.filter(item => realIds.has(item.organizationId));
  const signals = new Set(interactions.flatMap(item => item.signals || []));
  let level = realOrganizations.length ? 1 : 0;
  const signalLevels = [
    ['PROBLEM_CONFIRMED', 2], ['WORKAROUND_CONFIRMED', 3], ['URGENCY_CONFIRMED', 4],
    ['EVALUATION_ACCEPTED', 5], ['OFFER_ACCEPTED', 6], ['COMMITMENT_MADE', 7]
  ];
  for (const [signal, candidate] of signalLevels) if (signals.has(signal)) level = Math.max(level, candidate);
  const eventLevels = {
    PAYMENT_COLLECTED: 8,
    VALUE_ACHIEVED: 9,
    RENEWED: 10,
    EXPANDED: 11,
    REFERRED: 12
  };
  for (const event of events) level = Math.max(level, eventLevels[event.eventType] || 0);
  return {
    code: EVIDENCE_LADDER[level][0],
    label: EVIDENCE_LADDER[level][1],
    level,
    verification: level > 0 ? 'OPERATOR_ATTESTED_NOT_INDEPENDENTLY_VERIFIED' : 'NO_COMMERCIAL_EVIDENCE'
  };
}

function summarizeMercury(workspace) {
  const realOrganizations = workspace.organizations.filter(item => item.recordClass === 'REAL');
  const realIds = new Set(realOrganizations.map(item => item.organizationId));
  const interactions = workspace.interactions.filter(item => realIds.has(item.organizationId));
  const events = workspace.commercialEvents.filter(item => realIds.has(item.organizationId));
  const paid = events.filter(item => item.eventType === 'PAYMENT_COLLECTED');
  const refunds = events.filter(item => item.eventType === 'REFUND');
  const revenueByCurrency = {};
  for (const event of paid) revenueByCurrency[event.currency] = (revenueByCurrency[event.currency] || 0) + Number(event.amount);
  for (const event of refunds) revenueByCurrency[event.currency] = (revenueByCurrency[event.currency] || 0) - Number(event.amount);
  const netPaidOrganizationIds = new Set();
  for (const organization of realOrganizations) {
    const organizationEvents = events.filter(item => item.organizationId === organization.organizationId);
    const currencies = new Set(organizationEvents.map(item => item.currency).filter(Boolean));
    if ([...currencies].some(currency => {
      const collected = organizationEvents.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === currency).reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const refunded = organizationEvents.filter(item => item.eventType === 'REFUND' && item.currency === currency).reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return collected > refunded;
    })) netPaidOrganizationIds.add(organization.organizationId);
  }
  const realOpportunities = workspace.opportunities.filter(item => realIds.has(item.organizationId));
  const objectionCounts = {};
  for (const category of interactions.flatMap(item => item.objectionCategories || [])) {
    objectionCounts[category] = (objectionCounts[category] || 0) + 1;
  }
  const lossReasonCounts = {};
  for (const item of realOpportunities.filter(item => item.stage === 'LOST')) {
    lossReasonCounts[item.lossReason] = (lossReasonCounts[item.lossReason] || 0) + 1;
  }
  const segmentPerformance = workspace.segments.map(segment => {
    const organizationIds = new Set(realOrganizations.filter(item => item.segmentId === segment.segmentId).map(item => item.organizationId));
    const segmentInteractions = interactions.filter(item => organizationIds.has(item.organizationId));
    const segmentOpportunities = realOpportunities.filter(item => item.segmentId === segment.segmentId);
    const segmentEvents = events.filter(item => organizationIds.has(item.organizationId));
    return {
      segmentId: segment.segmentId,
      name: segment.name,
      organizations: organizationIds.size,
      contactAttempts: segmentInteractions.filter(item => item.interactionType === 'CONTACT_ATTEMPT').length,
      conversations: segmentInteractions.filter(item => item.interactionType === 'CONVERSATION').length,
      qualified: new Set(segmentOpportunities.filter(item => opportunityReached(item, 'QUALIFIED')).map(item => item.organizationId)).size,
      offered: new Set(segmentOpportunities.filter(item => opportunityReached(item, 'OFFERED')).map(item => item.organizationId)).size,
      pilots: new Set(segmentOpportunities.filter(item => opportunityReached(item, 'PILOT')).map(item => item.organizationId)).size,
      paying: new Set(segmentEvents.filter(item => item.eventType === 'PAYMENT_COLLECTED').map(item => item.organizationId)).size,
      activated: new Set(segmentEvents.filter(item => item.eventType === 'VALUE_ACHIEVED').map(item => item.organizationId)).size,
      renewed: new Set(segmentEvents.filter(item => item.eventType === 'RENEWED').map(item => item.organizationId)).size,
      lost: segmentOpportunities.filter(item => item.stage === 'LOST').length
    };
  });
  return {
    evidence: derivedEvidence(workspace),
    segments: workspace.segments.length,
    identifiedOrganizations: realOrganizations.length,
    reachableOrganizations: realOrganizations.filter(item => item.evidenceClass === 'OPERATOR_ATTESTED').length,
    unverifiedLegacyOrganizations: realOrganizations.filter(item => item.evidenceClass === 'UNVERIFIED_LEGACY').length,
    contactAttempts: interactions.filter(item => item.interactionType === 'CONTACT_ATTEMPT').length,
    conversations: interactions.filter(item => item.interactionType === 'CONVERSATION').length,
    qualified: new Set(realOpportunities.filter(item => opportunityReached(item, 'QUALIFIED')).map(item => item.organizationId)).size,
    offered: new Set(realOpportunities.filter(item => opportunityReached(item, 'OFFERED')).map(item => item.organizationId)).size,
    pilots: new Set(realOpportunities.filter(item => opportunityReached(item, 'PILOT')).map(item => item.organizationId)).size,
    payingOrganizations: new Set(paid.map(item => item.organizationId)).size,
    netPayingOrganizations: netPaidOrganizationIds.size,
    refundedOrganizations: new Set(refunds.map(item => item.organizationId)).size,
    activatedOrganizations: new Set(events.filter(item => item.eventType === 'VALUE_ACHIEVED').map(item => item.organizationId)).size,
    renewedOrganizations: new Set(events.filter(item => item.eventType === 'RENEWED').map(item => item.organizationId)).size,
    lostOpportunities: realOpportunities.filter(item => item.stage === 'LOST').length,
    objectionCounts,
    lossReasonCounts,
    segmentPerformance,
    revenueCollected: revenueByCurrency
  };
}

class MercuryStore {
  constructor(options = {}) {
    const studioStore = options.studioStore || globalThis.VAStudio?.store;
    this.storage = options.storage || (studioStore ? studioStorageAdapter(studioStore) : globalThis.localStorage);
    this.clock = options.clock || mercuryNow;
    this.idFactory = options.idFactory || mercuryId;
    this.recoveryWarning = null;
    this.workspace = this._load();
    this.lastPersistedWorkspace = structuredClone(this.workspace);
  }

  _load() {
    try {
      const raw = this.storage?.getItem?.(MERCURY_STORAGE_KEY);
      if (!raw) return mercuryWorkspace({ now: this.clock(), workspaceId: this.idFactory('mercury') });
      const parsed = migrateMercuryWorkspace(JSON.parse(raw));
      syncOrganizationStages(parsed);
      const errors = validateMercuryWorkspace(parsed);
      if (errors.length) throw new Error(errors.join('; '));
      return parsed;
    } catch (error) {
      this.recoveryWarning = `Stored Mercury data was not loaded: ${error.message}`;
      return mercuryWorkspace({ now: this.clock(), workspaceId: this.idFactory('mercury') });
    }
  }

  _save() {
    this.workspace.updatedAt = this.clock();
    syncOrganizationStages(this.workspace);
    const errors = validateMercuryWorkspace(this.workspace);
    if (errors.length) {
      this.workspace = structuredClone(this.lastPersistedWorkspace);
      throw new Error(errors.join('; '));
    }
    try {
      const result = this.storage?.setItem?.(MERCURY_STORAGE_KEY, JSON.stringify(this.workspace));
      if (result === false) throw new Error('storage adapter rejected the write');
    } catch (error) {
      this.workspace = structuredClone(this.lastPersistedWorkspace);
      throw new Error(`Mercury data was not saved: ${error.message}`);
    }
    this.lastPersistedWorkspace = structuredClone(this.workspace);
    return this.workspace;
  }

  getWorkspace() { return structuredClone(this.workspace); }
  getSummary() { return summarizeMercury(this.workspace); }
  getRecoveryWarning() { return this.recoveryWarning; }

  _requireReference(collection, key, value, label) {
    if (!this.workspace[collection].some(item => item[key] === value)) {
      throw new Error(`unknown ${label}`);
    }
  }

  configureVenture({ canonicalIdeaId, canonicalIdeaRevision = null, ventureName }) {
    const switchingVenture = this.workspace.canonicalIdeaId && this.workspace.canonicalIdeaId !== canonicalIdeaId;
    const hasCommercialState = [
      'segments', 'triggers', 'offers', 'channels', 'organizations',
      'interactions', 'opportunities', 'commercialEvents', 'hypothesisHistory'
    ].some(collection => this.workspace[collection].length > 0);
    if (switchingVenture && hasCommercialState) {
      throw new Error('cannot switch ventures while Mercury contains commercial state; export and reset first');
    }
    this.workspace.canonicalIdeaId = canonicalIdeaId || null;
    this.workspace.canonicalIdeaRevision = canonicalIdeaRevision || null;
    this.workspace.ventureName = requireText(ventureName, 'ventureName');
    return this._save();
  }

  addSegment(input) {
    const segment = {
      segmentId: this.idFactory('segment'),
      parentSegmentId: input.parentSegmentId || null,
      name: requireText(input.name, 'segment name'),
      description: requireText(input.description, 'segment description'),
      buyerRoles: input.buyerRoles || [],
      userRoles: input.userRoles || [],
      budgetOwner: input.budgetOwner?.trim() || 'UNKNOWN',
      budgetSource: input.budgetSource?.trim() || 'UNKNOWN',
      whyNow: input.whyNow?.trim() || 'UNKNOWN',
      currentAlternatives: input.currentAlternatives || [],
      reachability: input.reachability || 'UNKNOWN',
      status: input.status || 'HYPOTHESIS'
    };
    this.workspace.segments.push(segment);
    this._save();
    return structuredClone(segment);
  }

  addTrigger(input) {
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    const trigger = {
      triggerId: this.idFactory('trigger'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      type: requireText(input.type, 'trigger type'),
      description: requireText(input.description, 'trigger description'),
      detectability: input.detectability || 'UNKNOWN',
      urgencyWindow: input.urgencyWindow?.trim() || 'UNKNOWN',
      messageImplication: input.messageImplication?.trim() || '',
      status: input.status || 'HYPOTHESIS'
    };
    this.workspace.triggers.push(trigger);
    this._save();
    return structuredClone(trigger);
  }

  addOffer(input) {
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    const offer = {
      offerId: this.idFactory('offer'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      name: requireText(input.name, 'offer name'),
      motion: input.motion || 'OTHER',
      deliverable: requireText(input.deliverable, 'offer deliverable'),
      scope: input.scope?.trim() || 'UNKNOWN',
      price: {
        amount: input.amount === '' || input.amount == null ? null : Number(input.amount),
        currency: input.currency || 'EUR',
        basis: input.basis?.trim() || 'UNKNOWN',
        evidenceStatus: input.evidenceStatus || 'HYPOTHESIS'
      },
      timeToValue: input.timeToValue?.trim() || 'UNKNOWN',
      pilotType: input.pilotType || 'UNKNOWN',
      status: input.status || 'HYPOTHESIS'
    };
    this.workspace.offers.push(offer);
    this._save();
    return structuredClone(offer);
  }

  addChannel(input) {
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    const channel = {
      channelId: this.idFactory('channel'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      name: requireText(input.name, 'channel name'),
      motion: input.motion?.trim() || 'UNKNOWN',
      accessPath: input.accessPath?.trim() || 'UNKNOWN',
      status: input.status || 'HYPOTHESIS'
    };
    this.workspace.channels.push(channel);
    this._save();
    return structuredClone(channel);
  }

  addOrganization(input) {
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    const organization = {
      organizationId: this.idFactory('org'),
      name: requireText(input.name, 'organization name'),
      actorType: input.actorType || 'ORGANIZATION',
      segmentId: requireText(input.segmentId, 'segmentId'),
      recordClass: input.recordClass || 'REAL',
      commercialStage: 'IDENTIFIED',
      reachabilityBasis: requireText(input.reachabilityBasis, 'reachabilityBasis'),
      evidenceRef: requireText(input.evidenceRef, 'evidenceRef'),
      evidenceClass: 'OPERATOR_ATTESTED',
      createdAt: this.clock()
    };
    this.workspace.organizations.push(organization);
    this._save();
    return structuredClone(organization);
  }

  attestOrganizationReachability(organizationId, reachabilityBasis, evidenceRef) {
    const organization = this.workspace.organizations.find(item => item.organizationId === organizationId);
    if (!organization) throw new Error('unknown organizationId');
    organization.reachabilityBasis = requireText(reachabilityBasis, 'reachabilityBasis');
    organization.evidenceRef = requireText(evidenceRef, 'evidenceRef');
    organization.evidenceClass = 'OPERATOR_ATTESTED';
    this._save();
    return structuredClone(organization);
  }

  getOrganizationDeletionImpact(organizationId) {
    if (!this.workspace.organizations.some(item => item.organizationId === organizationId)) throw new Error('unknown organizationId');
    return {
      organizations: 1,
      interactions: this.workspace.interactions.filter(item => item.organizationId === organizationId).length,
      opportunities: this.workspace.opportunities.filter(item => item.organizationId === organizationId).length,
      commercialEvents: this.workspace.commercialEvents.filter(item => item.organizationId === organizationId).length
    };
  }

  deleteOrganization(organizationId) {
    const impact = this.getOrganizationDeletionImpact(organizationId);
    this.workspace.organizations = this.workspace.organizations.filter(item => item.organizationId !== organizationId);
    this.workspace.interactions = this.workspace.interactions.filter(item => item.organizationId !== organizationId);
    this.workspace.opportunities = this.workspace.opportunities.filter(item => item.organizationId !== organizationId);
    this.workspace.commercialEvents = this.workspace.commercialEvents.filter(item => item.organizationId !== organizationId);
    this._save();
    return impact;
  }

  addOpportunity(input) {
    this._requireReference('organizations', 'organizationId', input.organizationId, 'organizationId');
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    if (input.offerId) this._requireReference('offers', 'offerId', input.offerId, 'offerId');
    const now = this.clock();
    const evidenceRef = requireText(input.evidenceRef, 'evidenceRef');
    const opportunity = {
      opportunityId: this.idFactory('opportunity'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      offerId: input.offerId || null,
      stage: 'IDENTIFIED',
      stageHistory: [{ stage: 'IDENTIFIED', recordedAt: now, evidenceRef }],
      lossReason: '',
      createdAt: now
    };
    this.workspace.opportunities.push(opportunity);
    this._save();
    return structuredClone(opportunity);
  }

  recordInteraction(input) {
    const facts = (input.facts || []).map(String).map(item => item.trim()).filter(Boolean);
    if (!facts.length) throw new Error('at least one observed fact is required');
    this._requireReference('organizations', 'organizationId', input.organizationId, 'organizationId');
    if (input.opportunityId) this._requireReference('opportunities', 'opportunityId', input.opportunityId, 'opportunityId');
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    this._requireReference('channels', 'channelId', input.channelId, 'channelId');
    for (const signal of input.signals || []) {
      if (!MERCURY_SIGNALS.includes(signal)) throw new Error(`unsupported commercial signal: ${signal}`);
    }
    for (const category of input.objectionCategories || []) {
      if (!MERCURY_OBJECTION_CATEGORIES.includes(category)) throw new Error(`unsupported objection category: ${category}`);
    }
    const semanticErrors = interactionSignalErrors(input, this.workspace);
    if (semanticErrors.length) throw new Error(semanticErrors.join('; '));
    const interaction = {
      interactionId: this.idFactory('interaction'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      opportunityId: input.opportunityId || null,
      segmentId: requireText(input.segmentId, 'segmentId'),
      channelId: requireText(input.channelId, 'channelId'),
      interactionType: input.interactionType || 'CONVERSATION',
      occurredAt: input.occurredAt || this.clock(),
      outcome: input.outcome || 'UNKNOWN',
      facts,
      objections: (input.objections || []).map(String).map(item => item.trim()).filter(Boolean),
      objectionCategories: [...new Set(input.objectionCategories || [])],
      signals: [...new Set(input.signals || [])],
      evidenceRef: requireText(input.evidenceRef, 'evidenceRef'),
      evidenceClass: 'OPERATOR_ATTESTED',
      claimsNotEarned: input.claimsNotEarned || ['payment', 'retention', 'repeatable channel']
    };
    this.workspace.interactions.push(interaction);
    this._save();
    return structuredClone(interaction);
  }

  advanceOpportunity(opportunityId, stage, evidenceRef, lossReason = '') {
    if (!MERCURY_STAGES.includes(stage)) throw new Error('unsupported opportunity stage');
    if (['PAID', 'ACTIVE', 'RENEWED'].includes(stage)) {
      throw new Error(`${stage} is derived from payment/value events and cannot be set manually`);
    }
    const opportunity = this.workspace.opportunities.find(item => item.opportunityId === opportunityId);
    if (!opportunity) throw new Error('unknown opportunityId');
    const allowedTransitions = {
      IDENTIFIED: ['CONTACTED', 'CONVERSATION', 'LOST'],
      CONTACTED: ['CONVERSATION', 'LOST'],
      CONVERSATION: ['QUALIFIED', 'LOST'],
      QUALIFIED: ['OFFERED', 'LOST'],
      OFFERED: ['PILOT', 'LOST'],
      PILOT: ['LOST'],
      LOST: []
    };
    if (!(allowedTransitions[opportunity.stage] || []).includes(stage)) {
      throw new Error(`invalid opportunity transition ${opportunity.stage} → ${stage}`);
    }
    const interactions = this.workspace.interactions.filter(item => item.organizationId === opportunity.organizationId);
    if (stage === 'CONTACTED' && !interactions.some(item => item.interactionType === 'CONTACT_ATTEMPT')) {
      throw new Error('CONTACTED requires a recorded contact attempt');
    }
    if (stage === 'CONVERSATION' && !interactions.some(item => ['CONVERSATION', 'FOLLOW_UP'].includes(item.interactionType))) {
      throw new Error('CONVERSATION requires a recorded conversation');
    }
    if (stage === 'QUALIFIED' && !interactions.some(item => item.outcome === 'QUALIFIED')) {
      throw new Error('QUALIFIED requires an interaction with a QUALIFIED outcome');
    }
    if (['OFFERED', 'PILOT'].includes(stage) && !opportunity.offerId) {
      throw new Error(`${stage} requires a linked concrete offer`);
    }
    const normalizedEvidenceRef = requireText(evidenceRef, 'evidenceRef');
    const normalizedLossReason = stage === 'LOST' ? requireText(lossReason, 'lossReason') : '';
    opportunity.stage = stage;
    opportunity.lossReason = normalizedLossReason;
    opportunity.stageHistory.push({ stage, recordedAt: this.clock(), evidenceRef: normalizedEvidenceRef });
    this._save();
    return structuredClone(opportunity);
  }

  recordCommercialEvent(input) {
    if (!MERCURY_EVENT_TYPES.includes(input.eventType)) throw new Error('unsupported commercial event');
    this._requireReference('organizations', 'organizationId', input.organizationId, 'organizationId');
    if (input.opportunityId) this._requireReference('opportunities', 'opportunityId', input.opportunityId, 'opportunityId');
    const requiresAmount = ['PAYMENT_COLLECTED', 'REFUND', 'RENEWED', 'EXPANDED'].includes(input.eventType);
    const amount = input.amount === '' || input.amount == null ? null : Number(input.amount);
    if (requiresAmount && !(amount > 0)) throw new Error(`${input.eventType} requires a positive amount`);
    const opportunity = input.opportunityId
      ? this.workspace.opportunities.find(item => item.opportunityId === input.opportunityId)
      : null;
    if (opportunity && opportunity.organizationId !== input.organizationId) throw new Error('opportunity belongs to another organization');
    if (!opportunity) {
      throw new Error(`${input.eventType} requires an opportunity`);
    }
    if (['INVOICE_ISSUED', 'PAYMENT_COLLECTED'].includes(input.eventType) && !opportunity.offerId) {
      throw new Error(`${input.eventType} requires a linked concrete offer`);
    }
    if (opportunity.stage === 'LOST') throw new Error('commercial events cannot advance a lost opportunity');
    const occurredAt = input.occurredAt || this.clock();
    const prior = this.workspace.commercialEvents.filter(item => (
      item.organizationId === input.organizationId && item.opportunityId === input.opportunityId
    ));
    if (prior.some(item => Date.parse(item.occurredAt) > Date.parse(occurredAt))) throw new Error('commercial event is out of chronological order');
    const eventCurrency = requiresAmount ? (input.currency || 'EUR') : null;
    const paymentTotal = prior.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === eventCurrency)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const refundTotal = prior.filter(item => item.eventType === 'REFUND' && item.currency === eventCurrency)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netPaymentExists = [...new Set(prior.map(item => item.currency).filter(Boolean))].some(currency => {
      const collected = prior.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === currency)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const refunded = prior.filter(item => item.eventType === 'REFUND' && item.currency === currency)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return collected > refunded;
    });
    if (input.eventType === 'PAYMENT_COLLECTED' && !(opportunity?.stageHistory || []).some(item => (
      ['OFFERED', 'PILOT'].includes(item.stage) && Date.parse(item.recordedAt) <= Date.parse(occurredAt)
    ))) {
      throw new Error('payment requires a prior offered or pilot stage');
    }
    if (input.eventType === 'REFUND' && refundTotal + amount > paymentTotal) throw new Error('refund exceeds prior collected payment');
    if (input.eventType === 'VALUE_ACHIEVED' && !netPaymentExists) throw new Error('value achievement requires net collected payment for this opportunity');
    if (['RENEWED', 'EXPANDED', 'REFERRED'].includes(input.eventType) && !prior.some(item => item.eventType === 'VALUE_ACHIEVED')) {
      throw new Error(`${input.eventType} requires prior value achievement`);
    }
    const event = {
      eventId: this.idFactory('event'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      opportunityId: input.opportunityId || null,
      eventType: input.eventType,
      occurredAt,
      amount,
      currency: eventCurrency,
      evidenceRef: requireText(input.evidenceRef, 'evidenceRef'),
      evidenceClass: 'OPERATOR_ATTESTED'
    };
    this.workspace.commercialEvents.push(event);
    const stageByEvent = { PAYMENT_COLLECTED: 'PAID', VALUE_ACHIEVED: 'ACTIVE', RENEWED: 'RENEWED' };
    const projectedStage = stageByEvent[event.eventType];
    if (opportunity && projectedStage && MERCURY_STAGE_RANK.get(projectedStage) > MERCURY_STAGE_RANK.get(opportunity.stage)) {
      opportunity.stage = projectedStage;
      opportunity.stageHistory.push({ stage: opportunity.stage, recordedAt: event.occurredAt, evidenceRef: event.evidenceRef });
    }
    this._save();
    return structuredClone(event);
  }

  recordHypothesisChange(input) {
    const change = {
      changeId: this.idFactory('change'),
      recordedAt: this.clock(),
      subject: requireText(input.subject, 'subject'),
      before: requireText(input.before, 'before'),
      after: requireText(input.after, 'after'),
      evidenceRefs: input.evidenceRefs || []
    };
    this.workspace.hypothesisHistory.push(change);
    this._save();
    return structuredClone(change);
  }

  exportJson() { return `${JSON.stringify(this.workspace, null, 2)}\n`; }

  importJson(raw) {
    const parsed = migrateMercuryWorkspace(typeof raw === 'string' ? JSON.parse(raw) : structuredClone(raw));
    const errors = validateMercuryWorkspace(parsed);
    if (errors.length) throw new Error(errors.join('; '));
    this.workspace = parsed;
    this.recoveryWarning = null;
    this._save();
    return this.getWorkspace();
  }

  reset() {
    try {
      const removed = this.storage?.removeItem?.(MERCURY_STORAGE_KEY);
      if (removed === false) throw new Error('storage adapter rejected the deletion');
    } catch (error) {
      throw new Error(`Mercury data was not deleted: ${error.message}`);
    }
    this.workspace = mercuryWorkspace({ now: this.clock(), workspaceId: this.idFactory('mercury') });
    this.lastPersistedWorkspace = structuredClone(this.workspace);
    this.recoveryWarning = null;
    return this.getWorkspace();
  }
}

const MercuryAPI = {
  MercuryStore,
  migrateMercuryWorkspace,
  validateMercuryWorkspace,
  summarizeMercury,
  derivedEvidence,
  mercuryWorkspace,
  EVIDENCE_LADDER,
  MERCURY_STAGES,
  MERCURY_SIGNALS,
  MERCURY_OBJECTION_CATEGORIES,
  MERCURY_EVENT_TYPES,
  MERCURY_STORAGE_KEY,
  studioStorageAdapter
};

if (typeof window !== 'undefined') window.VAMercury = MercuryAPI;
if (typeof module !== 'undefined' && module.exports) module.exports = MercuryAPI;
