const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));

function validateAuthorityRegistries(documents, schemas) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  const checks = [
    ['semantic review', documents.semantic, schemas.semantic, 'reviews', 'semanticReviewId'],
    ['ranking method', documents.ranking, schemas.ranking, 'methods', null]
  ];
  for (const [label, document, schema, collection, idKey] of checks) {
    const validate = ajv.compile(schema);
    if (!validate(document)) for (const error of validate.errors || []) errors.push(`${label} ${error.instancePath || '<root>'} ${error.message}`);
    const keys = new Set();
    for (const item of document[collection] || []) {
      const key = idKey ? item[idKey] : `${item.methodVersion}:${item.scoreScaleVersion}`;
      if (keys.has(key)) errors.push(`duplicate ${label} authority key: ${key}`);
      keys.add(key);
    }
  }
  return errors;
}

function main() {
  const errors = validateAuthorityRegistries(
    { semantic: read('data/semantic-reviews.json'), ranking: read('data/ranking-method-registry.json') },
    { semantic: read('schemas/semantic-review.schema.json'), ranking: read('schemas/ranking-method-registry.schema.json') }
  );
  console.log(JSON.stringify({ semanticReviews: read('data/semantic-reviews.json').reviews.length, rankingMethods: read('data/ranking-method-registry.json').methods.length, errors }, null, 2));
  if (errors.length) process.exit(1);
}

if (require.main === module) main();
module.exports = { validateAuthorityRegistries };
