const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { sha256Json } = require('./lib/lifecycle-receipts');

const ROOT = path.resolve(__dirname, '..');

function read(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}

function validateLifecycleReceipts(receiptDocument, context) {
  const errors = [];
  const schema = context.schema;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const receiptIds = new Set();
  for (const receipt of receiptDocument.receipts || []) {
    if (!validate(receipt)) {
      for (const error of validate.errors || []) {
        errors.push(`${receipt.receiptId || '?'} ${error.instancePath || '<root>'} ${error.message}`);
      }
    }
    if (receiptIds.has(receipt.receiptId)) errors.push(`duplicate receiptId: ${receipt.receiptId}`);
    receiptIds.add(receipt.receiptId);

    const ideaId = receipt.receiptType === 'CANONICALIZE' ? receipt.canonicalIdeaId : receipt.subjectId;
    const idea = context.ideasById.get(ideaId);
    if (!idea) {
      errors.push(`${receipt.receiptId} references unknown canonical idea: ${ideaId}`);
      continue;
    }
    if (receipt.receiptType === 'CANONICALIZE') {
      if (idea.lifecycleReceiptRefs?.canonicalization !== receipt.receiptId) {
        errors.push(`${receipt.receiptId} is not referenced by canonical idea ${idea.id}`);
      }
      if (receipt.canonicalDigest !== sha256Json(idea)) {
        errors.push(`${receipt.receiptId} canonicalDigest mismatch`);
      }
    } else {
      if (receipt.subjectDigest !== sha256Json(idea)) errors.push(`${receipt.receiptId} subjectDigest mismatch`);
    }
    if (receipt.receiptType === 'RESEARCH_MATURITY') {
      if (idea.lifecycleReceiptRefs?.research !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea research receipt`);
      for (const sourceId of receipt.sourceIds || []) {
        const source = context.sourcesById.get(sourceId);
        if (!source || source.evidenceEligible !== true) errors.push(`${receipt.receiptId} source is missing or not evidence eligible: ${sourceId}`);
      }
      for (const runId of receipt.researchRunRefs || []) {
        const run = context.researchRunsById.get(runId);
        if (!run || !['R4_CLAIM_MAPPED', 'R5_ADVERSARIAL', 'R6_REVIEWED', 'R7_DECISION_INTEGRATED'].includes(run.receiptMaturity)) {
          errors.push(`${receipt.receiptId} research run is missing or immature: ${runId}`);
        }
      }
    }
    if (receipt.receiptType === 'RANK_ELIGIBILITY') {
      if (idea.lifecycleReceiptRefs?.ranking !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea ranking receipt`);
      for (const runId of receipt.researchRunRefs || []) {
        if (!context.researchRunsById.has(runId)) errors.push(`${receipt.receiptId} references unknown research run: ${runId}`);
      }
    }
    if (receipt.receiptType === 'VALIDATION') {
      if (idea.lifecycleReceiptRefs?.validation !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea validation receipt`);
      for (const runId of receipt.validationRunRefs || []) {
        if (!context.validationRunIds.has(runId)) errors.push(`${receipt.receiptId} references unknown validation run: ${runId}`);
      }
    }
  }
  return errors;
}

function main() {
  const receiptDocument = read('data/lifecycle-receipts.json');
  const ideasRaw = read('data/ideas.json');
  const ideas = Array.isArray(ideasRaw) ? ideasRaw : ideasRaw.ideas || [];
  const sourcesRaw = read('data/sources.json');
  const sources = Array.isArray(sourcesRaw) ? sourcesRaw : sourcesRaw.sources || [];
  const researchRaw = read('data/research-runs.json');
  const researchRuns = Array.isArray(researchRaw) ? researchRaw : researchRaw.runs || [];
  const validationRaw = read('data/validation-runs.json');
  const validationRuns = Array.isArray(validationRaw) ? validationRaw : validationRaw.runs || [];
  const errors = validateLifecycleReceipts(receiptDocument, {
    schema: read('schemas/lifecycle-receipt.schema.json'),
    ideasById: new Map(ideas.map(idea => [idea.id, idea])),
    sourcesById: new Map(sources.map(source => [source.id, source])),
    researchRunsById: new Map(researchRuns.map(run => [run.runId, run])),
    validationRunIds: new Set(validationRuns.map(run => run.runId))
  });
  console.log(JSON.stringify({ receiptCount: receiptDocument.receipts?.length || 0, errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateLifecycleReceipts };
