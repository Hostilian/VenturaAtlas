const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));

function validateCapitalClockLedger(programDocument, clockDocument, sources = [], now = new Date('2026-08-17T12:30:00Z')) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const [schema, document] of [['capital-program.schema.json', programDocument], ['capital-clock-ledger.schema.json', clockDocument]]) {
    const validate = ajv.compile(read(`schemas/${schema}`));
    if (!validate(document)) for (const error of validate.errors || []) errors.push(`${schema}: ${error.instancePath || '<root>'} ${error.message}`);
  }
  const programs = new Set((programDocument.programs || []).map(item => item.capitalProgramId));
  const sourceIds = new Set(sources.map(item => item.id));
  const clocks = new Set();
  for (const clock of clockDocument.clocks || []) {
    if (clocks.has(clock.clockId)) errors.push(`duplicate clock: ${clock.clockId}`);
    clocks.add(clock.clockId);
    if (!programs.has(clock.programId)) errors.push(`${clock.clockId} references unknown program: ${clock.programId}`);
    for (const sourceId of clock.sourceRefs || []) if (!sourceIds.has(sourceId)) errors.push(`${clock.clockId} references unknown source: ${sourceId}`);
    if (clock.state === 'EXPIRED' && (!clock.expiresAt || new Date(clock.expiresAt) >= now)) errors.push(`${clock.clockId} EXPIRED requires an expiry before now`);
    if (clock.expiresAt && clock.startsAt && new Date(clock.expiresAt) < new Date(clock.startsAt)) errors.push(`${clock.clockId} expires before it starts`);
  }
  return errors;
}

function main() {
  const sourcesRaw = read('data/sources.json');
  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : sourcesRaw.sources || [];
  const errors = validateCapitalClockLedger(read('data/capital-programs.json'), read('data/capital-clock-ledger.json'), sources);
  console.log(JSON.stringify({ programs: read('data/capital-programs.json').programs.length, clocks: read('data/capital-clock-ledger.json').clocks.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateCapitalClockLedger };
