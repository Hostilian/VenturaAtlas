const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ROOT = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
function validateCutoverInventoryClock(document, sources = []) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  const valid = ajv.compile(read('schemas/cutover-inventory-clock.schema.json'))(document);
  if (!valid) errors.push(...(ajv.errors || []).map(error => `${error.instancePath || '<root>'} ${error.message}`));
  const sourceIds = new Set(sources.map(source => source.id));
  const ids = new Set();
  for (const record of document.records || []) {
    if (ids.has(record.cutoverId)) errors.push(`duplicate cutover: ${record.cutoverId}`);
    ids.add(record.cutoverId);
    for (const sourceId of record.sourceRefs || []) if (!sourceIds.has(sourceId)) errors.push(`${record.cutoverId} references unknown source: ${sourceId}`);
    if (record.status === 'EXPIRED' && record.cutoverAt && new Date(record.cutoverAt) >= new Date('2026-08-17T13:00:00Z')) errors.push(`${record.cutoverId} cannot be expired before its cutover`);
  }
  return errors;
}
if (require.main === module) {
  const raw = read('data/sources.json');
  const errors = validateCutoverInventoryClock(read('data/cutover-inventory-clocks.json'), Array.isArray(raw) ? raw : raw.sources || []);
  console.log(JSON.stringify({ records: read('data/cutover-inventory-clocks.json').records.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}
module.exports = { validateCutoverInventoryClock };
