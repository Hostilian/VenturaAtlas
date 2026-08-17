const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));

function validateCapitalClock(document, ideas, sources) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(read('schemas/capital-clock.schema.json'));
  if (!validate(document)) {
    for (const error of validate.errors || []) errors.push(`${error.instancePath || '<root>'} ${error.message}`);
  }
  const ideaIds = new Set(ideas.map(idea => idea.id));
  const sourceIds = new Set(sources.map(source => source.id));
  const seen = new Set();
  for (const record of document.records || []) {
    if (seen.has(record.ideaId)) errors.push(`duplicate Capital Clock record: ${record.ideaId}`);
    seen.add(record.ideaId);
    if (!ideaIds.has(record.ideaId)) errors.push(`${record.ideaId} is not a canonical idea`);
    for (const sourceId of record.sourceIds || []) if (!sourceIds.has(sourceId)) errors.push(`${record.ideaId} references unknown source: ${sourceId}`);
    if (record.recommendedAction === 'SELL_NOW' && (record.buyerActivation === 'UNKNOWN' || record.budgetMaturity === 'UNKNOWN' || record.purchaseEventEvidence === 'UNKNOWN')) {
      errors.push(`${record.ideaId} SELL_NOW requires known buyer activation, budget maturity, and purchase-event evidence`);
    }
    if (record.evidenceStatus === 'CURRENT' && (!record.lastCheckedAt || !record.nextCheckAt)) errors.push(`${record.ideaId} CURRENT evidence requires lastCheckedAt and nextCheckAt`);
    if (record.evidenceStatus === 'UNKNOWN' && record.sourceIds?.length) errors.push(`${record.ideaId} UNKNOWN evidence cannot cite sourceIds without a freshness classification`);
  }
  return errors;
}

function main() {
  const ideasRaw = read('data/ideas.json');
  const sourcesRaw = read('data/sources.json');
  const ideas = Array.isArray(ideasRaw) ? ideasRaw : ideasRaw.ideas || [];
  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : sourcesRaw.sources || [];
  const errors = validateCapitalClock(read('data/capital-clock.json'), ideas, sources);
  console.log(JSON.stringify({ records: read('data/capital-clock.json').records.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateCapitalClock };
