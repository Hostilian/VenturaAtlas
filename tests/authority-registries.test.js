const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAuthorityRegistries } = require('../scripts/validate-authority-registries');
const semanticSchema = require('../schemas/semantic-review.schema.json');
const rankingSchema = require('../schemas/ranking-method-registry.schema.json');


test('semantic review registry rejects reviewers outside active authority registry', () => {
  const errors = validateAuthorityRegistries({
    semantic: { schemaVersion: '1.0.0', reviews: [{
      semanticReviewId: 'semantic-untrusted-1234', candidateId: 'candidate-test-1234',
      candidateDigest: 'a'.repeat(64), corpusRevision: 'b'.repeat(64), nearestIdeaIds: [],
      decision: 'DISTINCT', reviewer: { id: 'invented', role: 'repository-owner' },
      reviewedAt: new Date().toISOString()
    }] },
    ranking: { schemaVersion: '1.0.0', methods: [] },
    authorities: { schemaVersion: '1.0.0', authorities: [] }
  }, { semantic: semanticSchema, ranking: rankingSchema });
  assert.ok(errors.some(error => error.includes('not an active configured authority')));
});
