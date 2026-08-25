/**
 * VenturaAtlas Mercury — local/private commercial reality store.
 *
 * The store holds hypotheses and user-entered commercial observations in the
 * current browser only. It never contacts prospects, sends messages, or writes
 * to canonical repository data. Counts are derived from records; no traction
 * metric can be set directly.
 */

const MERCURY_SCHEMA_VERSION = '1.0.0';
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
      studioStore.setMercuryWorkspace?.(JSON.parse(value));
    },
    removeItem() {
      studioStore.setMercuryWorkspace?.(null);
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

function validateMercuryWorkspace(workspace) {
  const errors = [];
  if (!isObject(workspace)) return ['workspace must be an object'];
  if (workspace.schemaVersion !== MERCURY_SCHEMA_VERSION) errors.push('unsupported Mercury schemaVersion');
  if (workspace.workspaceMode !== 'UNVERIFIED_DRAFT') errors.push('workspaceMode must be UNVERIFIED_DRAFT');
  if (workspace.privacyScope !== MERCURY_PRIVACY_SCOPE) errors.push('privacyScope must be LOCAL_BROWSER_ONLY');
  if (workspace.canonicalIdeaId !== null && !/^idea-[0-9]+$/.test(workspace.canonicalIdeaId || '')) {
    errors.push('canonicalIdeaId must be null or a canonical idea ID');
  }
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
    if (!segment.name || !segment.description) errors.push(`${segment.segmentId || 'segment'} needs name and description`);
    if (segment.parentSegmentId && !segmentIds.has(segment.parentSegmentId)) errors.push(`${segment.segmentId} has unknown parent segment`);
  }
  for (const trigger of workspace.triggers) {
    if (!segmentIds.has(trigger.segmentId)) errors.push(`${trigger.triggerId} has unknown segmentId`);
  }
  for (const offer of workspace.offers) {
    if (!segmentIds.has(offer.segmentId)) errors.push(`${offer.offerId} has unknown segmentId`);
    if (offer.price?.evidenceStatus === 'PAID') {
      errors.push(`${offer.offerId} cannot claim PAID in a pricing hypothesis; payment is derived from commercial events`);
    }
  }
  for (const channel of workspace.channels) {
    if (!segmentIds.has(channel.segmentId)) errors.push(`${channel.channelId} has unknown segmentId`);
  }
  for (const organization of workspace.organizations) {
    if (!segmentIds.has(organization.segmentId)) errors.push(`${organization.organizationId} has unknown segmentId`);
    if (!['REAL', 'SYNTHETIC'].includes(organization.recordClass)) errors.push(`${organization.organizationId} has invalid recordClass`);
    if (!MERCURY_STAGES.includes(organization.commercialStage)) errors.push(`${organization.organizationId} has invalid commercialStage`);
  }
  for (const interaction of workspace.interactions) {
    if (!organizationIds.has(interaction.organizationId)) errors.push(`${interaction.interactionId} has unknown organizationId`);
    if (!segmentIds.has(interaction.segmentId)) errors.push(`${interaction.interactionId} has unknown segmentId`);
    if (interaction.channelId && !channelIds.has(interaction.channelId)) errors.push(`${interaction.interactionId} has unknown channelId`);
    if (!interaction.evidenceRef?.trim()) errors.push(`${interaction.interactionId} lacks evidenceRef`);
    if (interaction.evidenceClass !== 'OPERATOR_ATTESTED') errors.push(`${interaction.interactionId} has unsupported evidenceClass`);
    if (!Array.isArray(interaction.facts) || interaction.facts.length === 0) errors.push(`${interaction.interactionId} needs at least one observed fact`);
    if (!Array.isArray(interaction.objections)) errors.push(`${interaction.interactionId} objections must be an array`);
    if (!Array.isArray(interaction.objectionCategories)) errors.push(`${interaction.interactionId} objectionCategories must be an array`);
    const organization = workspace.organizations.find(item => item.organizationId === interaction.organizationId);
    const channel = interaction.channelId ? workspace.channels.find(item => item.channelId === interaction.channelId) : null;
    if (organization && organization.segmentId !== interaction.segmentId) errors.push(`${interaction.interactionId} segment does not match organization`);
    if (channel && channel.segmentId !== interaction.segmentId) errors.push(`${interaction.interactionId} channel belongs to another segment`);
    for (const signal of interaction.signals || []) if (!MERCURY_SIGNALS.includes(signal)) errors.push(`${interaction.interactionId} has invalid signal ${signal}`);
    for (const category of interaction.objectionCategories || []) {
      if (!MERCURY_OBJECTION_CATEGORIES.includes(category)) errors.push(`${interaction.interactionId} has invalid objection category ${category}`);
    }
  }
  for (const opportunity of workspace.opportunities) {
    if (!organizationIds.has(opportunity.organizationId)) errors.push(`${opportunity.opportunityId} has unknown organizationId`);
    if (!segmentIds.has(opportunity.segmentId)) errors.push(`${opportunity.opportunityId} has unknown segmentId`);
    if (opportunity.offerId && !offerIds.has(opportunity.offerId)) errors.push(`${opportunity.opportunityId} has unknown offerId`);
    if (!MERCURY_STAGES.includes(opportunity.stage)) errors.push(`${opportunity.opportunityId} has invalid stage`);
    if (!Number.isFinite(Date.parse(opportunity.createdAt))) errors.push(`${opportunity.opportunityId} has invalid createdAt`);
    if (!Array.isArray(opportunity.stageHistory) || opportunity.stageHistory.length === 0) {
      errors.push(`${opportunity.opportunityId} needs stageHistory`);
    } else {
      for (const entry of opportunity.stageHistory) {
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
    if (!organizationIds.has(event.organizationId)) errors.push(`${event.eventId} has unknown organizationId`);
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
  return errors;
}

function derivedEvidence(workspace) {
  const realOrganizations = workspace.organizations.filter(item => item.recordClass === 'REAL');
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
      qualified: new Set(segmentOpportunities.filter(item => ['QUALIFIED', 'OFFERED', 'PILOT', 'PAID', 'ACTIVE', 'RENEWED'].includes(item.stage)).map(item => item.organizationId)).size,
      offered: new Set(segmentOpportunities.filter(item => ['OFFERED', 'PILOT', 'PAID', 'ACTIVE', 'RENEWED'].includes(item.stage)).map(item => item.organizationId)).size,
      pilots: new Set(segmentOpportunities.filter(item => ['PILOT', 'PAID', 'ACTIVE', 'RENEWED'].includes(item.stage)).map(item => item.organizationId)).size,
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
    contactAttempts: interactions.filter(item => item.interactionType === 'CONTACT_ATTEMPT').length,
    conversations: interactions.filter(item => item.interactionType === 'CONVERSATION').length,
    qualified: new Set(realOpportunities.filter(item => ['QUALIFIED', 'OFFERED', 'PILOT', 'PAID', 'ACTIVE', 'RENEWED'].includes(item.stage)).map(item => item.organizationId)).size,
    pilots: new Set(realOpportunities.filter(item => ['PILOT', 'PAID', 'ACTIVE', 'RENEWED'].includes(item.stage)).map(item => item.organizationId)).size,
    payingOrganizations: new Set(paid.map(item => item.organizationId)).size,
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
  }

  _load() {
    const raw = this.storage?.getItem?.(MERCURY_STORAGE_KEY);
    if (!raw) return mercuryWorkspace({ now: this.clock(), workspaceId: this.idFactory('mercury') });
    try {
      const parsed = JSON.parse(raw);
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
    const errors = validateMercuryWorkspace(this.workspace);
    if (errors.length) {
      const persisted = this.storage?.getItem?.(MERCURY_STORAGE_KEY);
      if (persisted) {
        try {
          const previous = JSON.parse(persisted);
          if (validateMercuryWorkspace(previous).length === 0) this.workspace = previous;
        } catch (_) {}
      }
      throw new Error(errors.join('; '));
    }
    this.storage?.setItem?.(MERCURY_STORAGE_KEY, JSON.stringify(this.workspace));
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
      segmentId: requireText(input.segmentId, 'segmentId'),
      recordClass: input.recordClass || 'REAL',
      commercialStage: 'IDENTIFIED',
      createdAt: this.clock()
    };
    this.workspace.organizations.push(organization);
    this._save();
    return structuredClone(organization);
  }

  addOpportunity(input) {
    this._requireReference('organizations', 'organizationId', input.organizationId, 'organizationId');
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    if (input.offerId) this._requireReference('offers', 'offerId', input.offerId, 'offerId');
    const now = this.clock();
    const opportunity = {
      opportunityId: this.idFactory('opportunity'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      offerId: input.offerId || null,
      stage: input.stage || 'IDENTIFIED',
      stageHistory: [{ stage: input.stage || 'IDENTIFIED', recordedAt: now, evidenceRef: input.evidenceRef || 'initial record' }],
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
    this._requireReference('segments', 'segmentId', input.segmentId, 'segmentId');
    if (input.channelId) this._requireReference('channels', 'channelId', input.channelId, 'channelId');
    for (const signal of input.signals || []) {
      if (!MERCURY_SIGNALS.includes(signal)) throw new Error(`unsupported commercial signal: ${signal}`);
    }
    for (const category of input.objectionCategories || []) {
      if (!MERCURY_OBJECTION_CATEGORIES.includes(category)) throw new Error(`unsupported objection category: ${category}`);
    }
    const interaction = {
      interactionId: this.idFactory('interaction'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      segmentId: requireText(input.segmentId, 'segmentId'),
      channelId: input.channelId || null,
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
    const organization = this.workspace.organizations.find(item => item.organizationId === interaction.organizationId);
    if (organization) {
      organization.commercialStage = interaction.interactionType === 'CONTACT_ATTEMPT'
        ? 'CONTACTED'
        : interaction.outcome === 'QUALIFIED' ? 'QUALIFIED' : 'CONVERSATION';
    }
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
    opportunity.stage = stage;
    opportunity.lossReason = stage === 'LOST' ? requireText(lossReason, 'lossReason') : '';
    opportunity.stageHistory.push({ stage, recordedAt: this.clock(), evidenceRef: requireText(evidenceRef, 'evidenceRef') });
    const organization = this.workspace.organizations.find(item => item.organizationId === opportunity.organizationId);
    if (organization) organization.commercialStage = stage;
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
    if (['INVOICE_ISSUED', 'PAYMENT_COLLECTED', 'REFUND', 'RENEWED', 'EXPANDED'].includes(input.eventType) && !opportunity) {
      throw new Error(`${input.eventType} requires an opportunity`);
    }
    const occurredAt = input.occurredAt || this.clock();
    const prior = this.workspace.commercialEvents.filter(item => (
      item.organizationId === input.organizationId && (!input.opportunityId || item.opportunityId === input.opportunityId)
    ));
    if (prior.some(item => Date.parse(item.occurredAt) > Date.parse(occurredAt))) throw new Error('commercial event is out of chronological order');
    const paymentTotal = prior.filter(item => item.eventType === 'PAYMENT_COLLECTED' && item.currency === input.currency)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const refundTotal = prior.filter(item => item.eventType === 'REFUND' && item.currency === input.currency)
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
    if (['RENEWED', 'EXPANDED', 'REFERRED'].includes(input.eventType) && !this.workspace.commercialEvents.some(item => item.organizationId === input.organizationId && item.eventType === 'VALUE_ACHIEVED')) {
      throw new Error(`${input.eventType} requires prior value achievement`);
    }
    const event = {
      eventId: this.idFactory('event'),
      organizationId: requireText(input.organizationId, 'organizationId'),
      opportunityId: input.opportunityId || null,
      eventType: input.eventType,
      occurredAt,
      amount,
      currency: requiresAmount ? (input.currency || 'EUR') : null,
      evidenceRef: requireText(input.evidenceRef, 'evidenceRef'),
      evidenceClass: 'OPERATOR_ATTESTED'
    };
    this.workspace.commercialEvents.push(event);
    const stageByEvent = { PAYMENT_COLLECTED: 'PAID', VALUE_ACHIEVED: 'ACTIVE', RENEWED: 'RENEWED' };
    if (opportunity && stageByEvent[event.eventType]) {
      opportunity.stage = stageByEvent[event.eventType];
      opportunity.stageHistory.push({ stage: opportunity.stage, recordedAt: event.occurredAt, evidenceRef: event.evidenceRef });
    }
    const organization = this.workspace.organizations.find(item => item.organizationId === event.organizationId);
    if (organization && stageByEvent[event.eventType]) organization.commercialStage = stageByEvent[event.eventType];
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
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : structuredClone(raw);
    const errors = validateMercuryWorkspace(parsed);
    if (errors.length) throw new Error(errors.join('; '));
    this.workspace = parsed;
    this.recoveryWarning = null;
    this._save();
    return this.getWorkspace();
  }

  reset() {
    this.storage?.removeItem?.(MERCURY_STORAGE_KEY);
    this.workspace = mercuryWorkspace({ now: this.clock(), workspaceId: this.idFactory('mercury') });
    this.recoveryWarning = null;
    return this.getWorkspace();
  }
}

const MercuryAPI = {
  MercuryStore,
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
