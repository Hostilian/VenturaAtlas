const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ROOT = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
function validateAbsorptionFrontier(document, sources, knownCandidates = []) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false, formats: { 'date-time': true } });
  const valid = ajv.compile(read('schemas/absorption-frontier.schema.json'))(document);
  if (!valid) errors.push(...(ajv.errors || []).map(e => `${e.instancePath || '<root>'} ${e.message}`));
  const sourceIds = new Set(sources.map(s => s.id));
  const candidateIds = new Set(knownCandidates.map(c => c.id));
  const ids = new Set();
  for (const record of document.records || []) {
    if (ids.has(record.frontierId)) errors.push(`duplicate frontier: ${record.frontierId}`);
    ids.add(record.frontierId);
    for (const sourceId of record.sourceRefs || []) if (!sourceIds.has(sourceId)) errors.push(`${record.frontierId} references unknown source: ${sourceId}`);
    if (record.candidateRef && !candidateIds.has(record.candidateRef)) errors.push(`${record.frontierId} references unknown candidate: ${record.candidateRef}`);
    if (record.promotionEligible !== false) errors.push(`${record.frontierId} cannot be promotion eligible`);
    if (record.ideaRef !== 'CRA Clock' && record.noveltyDistance !== 'EXISTING_IDEA_REUNDERWRITE') errors.push(`${record.frontierId} must remain an existing-idea re-underwrite`);
  }
  return errors;
}
if (require.main === module) {
  const doc = read('data/absorption-frontier.json');
  const sources = read('data/sources.json');
  const candidates = read('data/idea-staging-queue.json');
  const errors = validateAbsorptionFrontier(doc, Array.isArray(sources) ? sources : sources.sources, Array.isArray(candidates) ? candidates : candidates.candidates);
  console.log(JSON.stringify({ records: doc.records.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}
module.exports = { validateAbsorptionFrontier };
