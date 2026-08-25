#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { validateMercuryWorkspace, summarizeMercury } = require('../assets/js/core/mercury-store');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'mercury-workspace.schema.json');
const EXAMPLE_PATH = path.join(ROOT, 'research', 'mercury', 'idea-061-commercial-hypothesis.json');

function validateMercuryDocument(document, options = {}) {
  const schema = options.schema || JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ideasPath = path.join(ROOT, 'data', 'ideas.json');
  const ideasBuffer = fs.readFileSync(ideasPath);
  const ideasRaw = options.ideas || JSON.parse(ideasBuffer.toString('utf8'));
  const repositoryMeta = options.repositoryMeta || JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'repository-meta.json'), 'utf8'));
  const canonicalRevision = options.canonicalRevision || repositoryMeta.revisions?.canonicalRevision;
  const ideas = Array.isArray(ideasRaw) ? ideasRaw : ideasRaw.ideas;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const errors = [];
  if (!validate(document)) {
    for (const error of validate.errors || []) errors.push(`${error.instancePath || '<root>'} ${error.message}`);
  }
  errors.push(...validateMercuryWorkspace(document));
  if (document.canonicalIdeaId) {
    const canonicalIdea = ideas.find(idea => idea.id === document.canonicalIdeaId);
    if (!canonicalIdea) {
      errors.push(`unknown canonicalIdeaId: ${document.canonicalIdeaId}`);
    } else if (document.ventureName !== canonicalIdea.name) {
      errors.push(`ventureName does not match canonical idea ${document.canonicalIdeaId}`);
    }
    if (document.canonicalIdeaRevision !== canonicalRevision) {
      errors.push(`canonicalIdeaRevision is stale; expected ${canonicalRevision}`);
    }
  }
  return [...new Set(errors)];
}

function main() {
  const document = JSON.parse(fs.readFileSync(EXAMPLE_PATH, 'utf8'));
  const errors = validateMercuryDocument(document);
  const summary = errors.length ? null : summarizeMercury(document);
  console.log(JSON.stringify({
    example: path.relative(ROOT, EXAMPLE_PATH).replace(/\\/g, '/'),
    canonicalIdeaId: document.canonicalIdeaId,
    evidenceLevel: summary?.evidence?.code || null,
    identifiedOrganizations: summary?.identifiedOrganizations ?? null,
    conversations: summary?.conversations ?? null,
    payingOrganizations: summary?.payingOrganizations ?? null,
    revenueCollected: summary?.revenueCollected ?? null,
    errors
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { validateMercuryDocument };
