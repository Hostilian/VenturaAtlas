const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { ideaContentDigest } = require('./lib/lifecycle-receipts');

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
    if (!context.trustedReviewerIds.has(`${receipt.reviewer?.id}:${receipt.reviewer?.role}`)) {
      errors.push(`${receipt.receiptId} reviewer is not an active trusted authority`);
    }
    if (receipt.baselineCommit && !context.gitCommitIds.has(receipt.baselineCommit)) {
      errors.push(`${receipt.receiptId} baselineCommit is not present in repository history`);
    }

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
      if (receipt.canonicalDigest !== ideaContentDigest(idea)) {
        errors.push(`${receipt.receiptId} canonicalDigest mismatch`);
      }
    } else {
      if (receipt.subjectDigest !== ideaContentDigest(idea)) errors.push(`${receipt.receiptId} subjectDigest mismatch`);
    }
    if (receipt.receiptType === 'RESEARCH_MATURITY') {
      if (idea.lifecycleReceiptRefs?.research !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea research receipt`);
      for (const sourceId of receipt.sourceIds || []) {
        const source = context.sourcesById.get(sourceId);
        if (!source || source.evidenceEligible !== true || source.visibility !== 'PUBLIC' ||
            !['PRIMARY_OR_OFFICIAL', 'COMPANY_OR_INDUSTRY'].includes(source.sourceClass)) {
          errors.push(`${receipt.receiptId} source is missing or not eligible public evidence: ${sourceId}`);
        }
      }
      for (const relationId of receipt.claimRelationIds || []) {
        if (!context.claimRelationIds.has(relationId)) errors.push(`${receipt.receiptId} references unknown claim relation: ${relationId}`);
      }
      for (const runId of receipt.researchRunRefs || []) {
        const run = context.researchRunsById.get(runId);
        if (!run || !['R4_CLAIM_MAPPED', 'R5_ADVERSARIAL', 'R6_REVIEWED', 'R7_DECISION_INTEGRATED'].includes(run.receiptMaturity) ||
            !run.ideaIds?.includes(idea.id) || !Array.isArray(run.toolReceipts) || run.toolReceipts.length === 0) {
          errors.push(`${receipt.receiptId} research run is missing or immature: ${runId}`);
        }
      }
    }
    if (receipt.receiptType === 'RANK_ELIGIBILITY') {
      if (idea.lifecycleReceiptRefs?.ranking !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea ranking receipt`);
      const methodKey = `${receipt.methodVersion}:${receipt.scoreScaleVersion}`;
      if (!(context.rankingMethodKeys || new Set()).has(methodKey)) errors.push(`${receipt.receiptId} references unregistered ranking method/scale: ${methodKey}`);
      for (const runId of receipt.researchRunRefs || []) {
        const run = context.researchRunsById.get(runId);
        if (!run || !run.ideaIds?.includes(idea.id) || !['R4_CLAIM_MAPPED', 'R5_ADVERSARIAL', 'R6_REVIEWED', 'R7_DECISION_INTEGRATED'].includes(run.receiptMaturity) || !Array.isArray(run.toolReceipts) || !run.toolReceipts.length) errors.push(`${receipt.receiptId} references unrelated or immature research run: ${runId}`);
      }
    }
    if (receipt.receiptType === 'VALIDATION') {
      if (idea.lifecycleReceiptRefs?.validation !== receipt.receiptId) errors.push(`${receipt.receiptId} is not the idea validation receipt`);
      for (const runId of receipt.validationRunRefs || []) {
        const run = context.validationRunsById.get(runId);
        if (!run || run.ideaId !== idea.id || run.ideaContentDigest !== ideaContentDigest(idea) ||
            run.status !== 'COMPLETED' || run.evidenceKind !== receipt.evidenceKind || !Array.isArray(run.evidenceRefs) || !run.evidenceRefs.length) {
          errors.push(`${receipt.receiptId} references invalid validation run: ${runId}`);
        }
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
  const claimRelations = read('data/claim-relations.json').relations || [];
  const authorities = read('data/reviewer-authorities.json').authorities || [];
  const rankingMethods = read('data/ranking-method-registry.json').methods || [];
  const gitCommits = require('child_process').execFileSync('git', ['rev-list', '--all'], { cwd: ROOT, encoding: 'utf8' }).split(/\s+/).filter(Boolean);
  const errors = validateLifecycleReceipts(receiptDocument, {
    schema: read('schemas/lifecycle-receipt.schema.json'),
    ideasById: new Map(ideas.map(idea => [idea.id, idea])),
    sourcesById: new Map(sources.map(source => [source.id, source])),
    researchRunsById: new Map(researchRuns.map(run => [run.runId, run])),
    validationRunsById: new Map(validationRuns.map(run => [run.runId, run])),
    claimRelationIds: new Set(claimRelations.map(relation => relation.relationId)),
    trustedReviewerIds: new Set(authorities.filter(item => item.active === true).map(item => `${item.id}:${item.role}`)),
    gitCommitIds: new Set(gitCommits),
    rankingMethodKeys: new Set(rankingMethods.filter(item => item.active === true).map(item => `${item.methodVersion}:${item.scoreScaleVersion}`))
  });
  console.log(JSON.stringify({ receiptCount: receiptDocument.receipts?.length || 0, errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateLifecycleReceipts };
