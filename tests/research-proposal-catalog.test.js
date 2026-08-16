const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT, 'data', 'research-proposal-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

test('catalog is a deterministic lossless projection of all seven research tables', () => {
  const result = spawnSync('python', ['scripts/build-research-proposal-catalog.py'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /OK \(139 proposals across 7 rounds\)/);
  assert.equal(catalog.proposalCount, 139);
  assert.equal(catalog.roundCount, 7);
  assert.deepEqual(
    Object.fromEntries(catalog.rounds.map((round) => [round.id, round.proposalCount])),
    {
      'august-operational-chokepoints': 15,
      'expansion-round-i': 15,
      'fresh-opportunity-round': 20,
      'expansion-iii': 24,
      'expansion-iv': 20,
      'expansion-v': 25,
      'expansion-vi': 20
    }
  );
});

test('every source row has one stable record and no proposal identity is merged', () => {
  assert.equal(new Set(catalog.proposals.map((proposal) => proposal.id)).size, 139);
  for (const round of catalog.rounds) {
    const rows = catalog.proposals.filter((proposal) => proposal.roundId === round.id);
    assert.deepEqual(rows.map((proposal) => proposal.sourceOrdinal), Array.from({ length: round.proposalCount }, (_, index) => index + 1));
  }
  assert.ok(catalog.proposals.every((proposal) => proposal.identityClaim === false));
  assert.equal(catalog.groupingContract, 'thematic-proximity-not-identity');
  assert.equal(catalog.completionClaim, false);
});

test('unattractive, duplicate, module, and watch-only proposals are retained', () => {
  const byName = new Map(catalog.proposals.map((proposal) => [proposal.name, proposal]));
  assert.equal(byName.get('Worker Decision Ledger').relation, 'SAME_OR_DUPLICATE');
  assert.equal(byName.get('PFAS Remediation Performance Network').relation, 'MODULE_OR_FEATURE');
  assert.equal(byName.get('Biotech SandboxOps').relation, 'WATCH_SIGNAL');
  assert.equal(byName.get('Quantum Supply-Chain Qualification Graph').relation, 'WATCH_SIGNAL');
  assert.equal(byName.get('SupplierProof SLA').relation, 'RELATED_EXISTING_FAMILY');
  assert.equal(byName.get('Cyber Assurance Reuse Graph').relation, 'MODULE_OR_FEATURE');
  assert.equal(byName.get('Cyber Assurance Continuity OS').relation, 'DISTINCT_PROPOSAL');
});

test('all records are classified, grouped, non-ranked, and privacy-safe', () => {
  const allowed = new Set(['DISTINCT_PROPOSAL', 'SAME_OR_DUPLICATE', 'MODULE_OR_FEATURE', 'RELATED_EXISTING_FAMILY', 'WATCH_SIGNAL']);
  for (const proposal of catalog.proposals) {
    assert.ok(allowed.has(proposal.relation), proposal.id);
    assert.ok(proposal.familyId && proposal.familyLabel, proposal.id);
    assert.equal(proposal.rankingEligible, false, proposal.id);
  }
  const serialized = JSON.stringify(catalog);
  assert.doesNotMatch(serialized, /candidate-[0-9a-f-]{8,}/i);
  assert.doesNotMatch(serialized, /prioritizedForValidation|promotionEligible|idea-staging-queue/i);
  assert.equal(Object.values(catalog.relationCounts).reduce((sum, count) => sum + count, 0), 139);
  assert.equal(Object.values(catalog.familyCounts).reduce((sum, count) => sum + count, 0), 139);
});

test('website exposes all-proposal browsing and explicit non-merge language', () => {
  const page = fs.readFileSync(path.join(ROOT, 'docs', 'research-catalog.html'), 'utf8');
  const script = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'research-catalog.js'), 'utf8');
  const publicBuilder = fs.readFileSync(path.join(ROOT, 'scripts', 'build-public-artifact.js'), 'utf8');
  assert.match(page, /All research proposals/i);
  assert.match(page, /Grouping does not merge ideas/i);
  assert.match(page, /proposalSearch/);
  assert.match(page, /relationFilter/);
  assert.match(page, /familyFilter/);
  assert.match(script, /research-proposal-catalog\.json/);
  assert.match(script, /replaceChildren/);
  assert.match(publicBuilder, /research-proposal-catalog\.json/);
});
