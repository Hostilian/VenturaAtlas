const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');
const STATES = ['GENERATED','DEDUPED','STAGED','DESK_RESEARCHED','COMMERCIAL_RESEARCHED','APPROVED_FOR_VALIDATION','CONTACTED','INTERVIEWED','DESIGN_PARTNER','PAID_PILOT','REPEAT_PAYMENT'];
const EXTERNAL = new Set(['INTERVIEWED','DESIGN_PARTNER','PAID_PILOT','REPEAT_PAYMENT']);

function deriveFunnel(events) {
  const current = new Map();
  const counts = Object.fromEntries(STATES.map(state => [state, 0]));
  let moneyCost = 0, founderMinutes = 0, cashCollected = 0;
  for (const event of events) {
    current.set(event.funnelId, event.to); counts[event.to] += 1;
    moneyCost += event.moneyCost; founderMinutes += event.founderMinutes; cashCollected += event.cashCollected;
  }
  return { current: Object.fromEntries(current), transitions: counts, moneyCost, founderMinutes, cashCollected, netValidationCost: moneyCost - cashCollected };
}

function validateFunnel(document, context = {}) {
  const errors = [];
  const schema = context.schema || JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', 'validation-funnel.schema.json'), 'utf8'));
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  if (!validate(document)) for (const error of validate.errors || []) errors.push(`${error.instancePath || '<root>'} ${error.message}`);
  const seen = new Set(), current = new Map(), prior = new Map();
  const runs = context.validationRunsById || new Map();
  const ideas = context.ideaIds || new Set();
  for (const event of document.events || []) {
    if (seen.has(event.eventId)) errors.push(`duplicate eventId: ${event.eventId}`);
    seen.add(event.eventId);
    if (!ideas.has(event.ideaId)) errors.push(`${event.eventId} unknown idea: ${event.ideaId}`);
    const expectedFrom = current.get(event.funnelId) || 'NONE';
    const expectedPredecessor = prior.get(event.funnelId) || null;
    if (event.from !== expectedFrom) errors.push(`${event.eventId} illegal predecessor state: expected ${expectedFrom}`);
    if (event.predecessorEventId !== expectedPredecessor) errors.push(`${event.eventId} illegal predecessor event`);
    const fromIndex = event.from === 'NONE' ? -1 : STATES.indexOf(event.from);
    const toIndex = STATES.indexOf(event.to);
    if (toIndex !== fromIndex + 1) errors.push(`${event.eventId} must advance exactly one funnel state`);
    if (EXTERNAL.has(event.to)) {
      const referenced = (event.validationRunRefs || []).map(id => runs.get(id)).filter(Boolean);
      if (!event.externalOutcome || referenced.length === 0 || referenced.some(run => run.ideaId !== event.ideaId || run.status !== 'COMPLETED')) errors.push(`${event.eventId} external state lacks completed idea-bound validation run`);
      if (['PAID_PILOT','REPEAT_PAYMENT'].includes(event.to) && referenced.every(run => run.evidenceKind !== 'TRANSACTIONAL')) errors.push(`${event.eventId} paid state lacks transactional evidence`);
    } else if (event.externalOutcome) errors.push(`${event.eventId} non-external state cannot assert external outcome`);
    if (event.cashCollected > 0) {
      const referenced = (event.validationRunRefs || []).map(id => runs.get(id)).filter(Boolean);
      if (!['PAID_PILOT','REPEAT_PAYMENT'].includes(event.to) || referenced.every(run => run.evidenceKind !== 'TRANSACTIONAL')) errors.push(`${event.eventId} revenue lacks transactional evidence`);
    }
    current.set(event.funnelId, event.to); prior.set(event.funnelId, event.eventId);
  }
  return errors;
}

function main() {
  const document = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'validation-funnel.json'), 'utf8'));
  const runsDoc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'validation-runs.json'), 'utf8'));
  const ideasDoc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ideas.json'), 'utf8'));
  const runs = Array.isArray(runsDoc) ? runsDoc : runsDoc.runs || [];
  const ideas = Array.isArray(ideasDoc) ? ideasDoc : ideasDoc.ideas || [];
  const errors = validateFunnel(document, { validationRunsById: new Map(runs.map(run => [run.runId, run])), ideaIds: new Set(ideas.map(idea => idea.id)) });
  console.log(JSON.stringify({ eventCount: document.events.length, aggregate: deriveFunnel(document.events), errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateFunnel, deriveFunnel, STATES };
