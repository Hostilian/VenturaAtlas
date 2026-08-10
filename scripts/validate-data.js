const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const ajv = new Ajv({ allErrors: true, strict: false });

function readJsonFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    return { _parseError: err.message };
  }
}

function validateSchemaIfAvailable(schemaName, data, errors) {
  const schemaPath = path.join(ROOT, 'schemas', schemaName);
  if (!fs.existsSync(schemaPath)) return;
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      const valid = validate(item);
      if (!valid) {
        for (const err of validate.errors || []) {
          errors.push(`Schema ${schemaName} violation on ${item.id || 'item'}: ${err.instancePath} ${err.message}`);
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to compile/execute schema ${schemaName}: ${err.message}`);
  }
}

function validateCanonicalCollection(data, errors) {
  const schemaPath = path.join(ROOT, 'data', 'ideas.schema.json');
  if (!fs.existsSync(schemaPath)) {
    errors.push('Authoritative schema data/ideas.schema.json is missing');
    return;
  }
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);
    if (!validate(data)) {
      for (const err of validate.errors || []) {
        errors.push(`Schema data/ideas.schema.json violation: ${err.instancePath} ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`Failed to compile/execute data/ideas.schema.json: ${err.message}`);
  }
}

function main() {
  const isStrict = process.argv.includes('--strict');
  const isCheck = process.argv.includes('--check');
  const errors = [];
  const warnings = [];

  const rawIdeas = readJsonFile('data/ideas.json');
  if (!rawIdeas || rawIdeas._parseError) {
    errors.push(`data/ideas.json invalid: ${rawIdeas?._parseError || 'file missing'}`);
    console.error(JSON.stringify({ errors, warnings }, null, 2));
    process.exit(1);
  }

  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);
  const rawSources = readJsonFile('data/sources.json');
  const sources = Array.isArray(rawSources) ? rawSources : (rawSources?.sources || []);

  const rawRanks = readJsonFile('data/rankings.json');
  const ranks = Array.isArray(rawRanks) ? rawRanks : (rawRanks?.rankings || rawRanks?.legacyData || []);

  const rawRels = readJsonFile('data/relationships.json');
  const rels = Array.isArray(rawRels) ? rawRels : (rawRels?.relationships || []);

  validateCanonicalCollection(rawIdeas, errors);
  validateSchemaIfAvailable('category.schema.json', readJsonFile('data/categories.json') || [], errors);
  validateSchemaIfAvailable('source.schema.json', sources, errors);
  validateSchemaIfAvailable('ranking.schema.json', ranks, errors);
  validateSchemaIfAvailable('relationship.schema.json', rels, errors);

  const ideaIds = new Set();
  const slugs = new Set();
  const sourceIds = new Set(sources.map(s => s.id));

  const requiredIdeaFields = ['id', 'slug', 'name', 'category', 'oneSentenceConcept'];

  for (const idea of ideas) {
    for (const field of requiredIdeaFields) {
      if (!(field in idea) || !idea[field]) {
        errors.push(`Idea ${idea.id || '?'} missing required field: ${field}`);
      }
    }

    if (idea.id) {
      if (ideaIds.has(idea.id)) errors.push(`Duplicate idea ID: ${idea.id}`);
      ideaIds.add(idea.id);
      if (!/^idea-\d{3}$/.test(idea.id)) {
        errors.push(`Malformed idea ID format (expected idea-XXX): ${idea.id}`);
      }
    }

    if (idea.slug) {
      if (slugs.has(idea.slug)) errors.push(`Duplicate idea slug: ${idea.slug}`);
      slugs.add(idea.slug);

      const dossierPath = path.join(ROOT, 'ideas', `${idea.slug}.md`);
      if (!fs.existsSync(dossierPath)) {
        warnings.push(`Missing dossier markdown file: ideas/${idea.slug}.md`);
      }
    }

    if (idea.atAGlance?.overallScore !== undefined) {
      const score = Number(idea.atAGlance.overallScore);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.push(`Idea ${idea.id} has invalid overallScore range: ${idea.atAGlance.overallScore}`);
      }
    }

    if (Array.isArray(idea.sourceReferences)) {
      for (const sRef of idea.sourceReferences) {
        if (sRef && sourceIds.size > 0 && !sourceIds.has(sRef)) {
          warnings.push(`Idea ${idea.id} references unknown source ID: ${sRef}`);
        }
      }
    }
  }

  for (const r of ranks) {
    const items = r.items || r.rankings || [];
    for (const item of items) {
      const targetId = item.ideaId || item.id;
      if (targetId && !ideaIds.has(targetId)) {
        warnings.push(`Ranking ${r.id || 'unknown'} references non-existent idea: ${targetId}`);
      }
    }
  }

  const result = {
    ideasCount: ideas.length,
    sourcesCount: sources.length,
    rankingsCount: ranks.length,
    relationshipsCount: rels.length,
    errorsCount: errors.length,
    warningsCount: warnings.length,
    errors,
    warnings: warnings.slice(0, 10)
  };

  console.log(JSON.stringify(result, null, 2));

  // Validation receipts keep their timestamp when the validated inputs and result are unchanged.
  const revisionInputs = [
    'data/ideas.json',
    'data/categories.json',
    'data/sources.json',
    'data/rankings.json',
    'data/relationships.json',
    'data/ideas.schema.json',
    'schemas/category.schema.json',
    'schemas/source.schema.json',
    'schemas/ranking.schema.json',
    'schemas/relationship.schema.json'
  ];
  const revisionHasher = crypto.createHash('sha256');
  for (const relativePath of revisionInputs) {
    const fullPath = path.join(ROOT, relativePath);
    revisionHasher.update(relativePath);
    if (fs.existsSync(fullPath)) revisionHasher.update(fs.readFileSync(fullPath));
  }
  const validationRevision = revisionHasher.digest('hex');
  const summaryPath = path.join(ROOT, 'data', 'validation-summary.json');
  let checkedAt = new Date().toISOString();
  if (fs.existsSync(summaryPath)) {
    try {
      const previous = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      if (
        previous.validationRevision === validationRevision &&
        previous.status === (errors.length > 0 ? 'failed' : (warnings.length > 0 ? 'degraded' : 'passed')) &&
        previous.errorCount === errors.length &&
        previous.warningCount === warnings.length
      ) {
        checkedAt = previous.checkedAt || checkedAt;
      }
    } catch (_) {}
  }

  const valSummary = {
    checkedAt,
    validationRevision,
    status: errors.length > 0 ? 'failed' : (warnings.length > 0 ? 'degraded' : 'passed'),
    canonicalCount: ideas.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors.slice(0, 10),
    warnings: warnings.slice(0, 10)
  };
  const serializedSummary = JSON.stringify(valSummary, null, 2) + '\n';
  const summaryMatches = fs.existsSync(summaryPath) && fs.readFileSync(summaryPath, 'utf8') === serializedSummary;
  if (isCheck && !summaryMatches) {
    console.error('[ERROR] validation-summary.json is stale; run validate-data.js once without --check under the repository writer lock.');
    process.exit(1);
  }
  if (!isCheck && !summaryMatches) {
    const temporaryPath = `${summaryPath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, serializedSummary, 'utf8');
    fs.renameSync(temporaryPath, summaryPath);
  }

  if (errors.length > 0 || (isStrict && warnings.length > 0)) {
    if (isStrict && warnings.length > 0) {
      console.error(`[STRICT MODE] Failing due to ${warnings.length} warnings.`);
    }
    process.exit(1);
  }

  console.log('[OK] Data validation passed.');
}

main();
