const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ROOT = path.resolve(__dirname, '..');
const read = (file, fallback = null) => {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    if (fallback !== null) return fallback;
    throw new Error(`File not found: ${full}`);
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
};
function validateAbsorptionFrontier(document, sources, knownCandidates = null) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false, formats: { 'date-time': true } });
  const valid = ajv.compile(read('schemas/absorption-frontier.schema.json'))(document);
  if (!valid) errors.push(...(ajv.errors || []).map(e => `${e.instancePath || '<root>'} ${e.message}`));
  const sourceIds = new Set(sources.map(s => s.id));
  const candidateIds = new Set((knownCandidates || []).map(c => c.id));
  const ids = new Set();
  for (const record of document.records || []) {
    if (ids.has(record.frontierId)) errors.push(`duplicate frontier: ${record.frontierId}`);
    ids.add(record.frontierId);
    for (const sourceId of record.sourceRefs || []) if (!sourceIds.has(sourceId)) errors.push(`${record.frontierId} references unknown source: ${sourceId}`);
    if (record.candidateRef && Array.isArray(knownCandidates) && !candidateIds.has(record.candidateRef)) errors.push(`${record.frontierId} references unknown candidate: ${record.candidateRef}`);
    if (record.promotionEligible !== false) errors.push(`${record.frontierId} cannot be promotion eligible`);
    if (record.ideaRef !== 'CRA Clock' && record.noveltyDistance !== 'EXISTING_IDEA_REUNDERWRITE') errors.push(`${record.frontierId} must remain an existing-idea re-underwrite`);
  }
  return errors;
}
if (require.main === module) {
  const doc = read('data/absorption-frontier.json');
  const sources = read('data/sources.json');
  // The staging queue is intentionally gitignored/private. A fresh CI checkout
  // must validate the public frontier without requiring private data.
  const candidatePath = path.join(ROOT, 'data', 'idea-staging-queue.json');
  const candidates = fs.existsSync(candidatePath) ? read('data/idea-staging-queue.json') : null;
  const knownCandidates = Array.isArray(candidates) ? candidates : candidates?.candidates;
  const errors = validateAbsorptionFrontier(doc, Array.isArray(sources) ? sources : sources.sources, knownCandidates);
  console.log(JSON.stringify({ records: doc.records.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}
module.exports = { validateAbsorptionFrontier };
