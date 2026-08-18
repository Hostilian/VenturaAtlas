const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT, 'data', 'research-proposal-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

test('catalog is a deterministic lossless projection of all recoverable research ledgers', () => {
  const result = spawnSync('python', ['scripts/build-research-proposal-catalog.py'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /OK \(507 proposals across 29 recoverable rounds\)/);
  assert.equal(catalog.proposalCount, 507);
  assert.equal(catalog.roundCount, 29);
  assert.deepEqual(
    Object.fromEntries(catalog.rounds.map((round) => [round.id, round.proposalCount])),
    {
      'omega-xv-august-regulatory-wave': 8,
      'omega-xv-proofops-reality-engine': 11,
      'omega-xvi-machine-rights-regulatory-ci': 12,
      'omega-ix-primary-ledger': 14,
      'omega-ix-continuation-ledger': 20,
      'full-reset-2026-08-10': 60,
      'frontier-reset-2026-08-10': 60,
      'full-reset-2026-08-11': 60,
      'august-operational-chokepoints': 15,
      'expansion-round-i': 15,
      'fresh-opportunity-round': 20,
      'expansion-iii': 24,
      'expansion-iv': 20,
      'expansion-v': 25,
      'expansion-vi': 20,
      'omega-xiii-science-procurement': 5,
      'omega-xiii-public-primitive-countertrend': 5,
      'omega-xiii-physical-regulatory': 5,
      'omega-xiii-qualification-evidence': 5,
      'omega-xiii-cross-system-authority': 5,
      'omega-xiii-operational-authority': 5,
      'omega-xiii-industrial-lifecycle': 5,
      'omega-xiii-final-coverage': 25,
      'expansion-vii': 10,
      'omega-xiv-capital-clock': 9,
      'omega-xv-cutover-inventory': 8,
      'omega-xv-absorption-frontier': 10,
      'omega-xvii-public-money-graph': 10,
      'omega-xviii-route-shock': 16
    }
  );
});

test('every source row has one stable record and no proposal identity is merged', () => {
  assert.equal(new Set(catalog.proposals.map((proposal) => proposal.id)).size, 507);
  for (const round of catalog.rounds) {
    const rows = catalog.proposals.filter((proposal) => proposal.roundId === round.id);
    assert.deepEqual(rows.map((proposal) => proposal.sourceOrdinal), Array.from({ length: round.proposalCount }, (_, index) => index + 1));
  }
  assert.ok(catalog.proposals.every((proposal) => proposal.identityClaim === false));
  assert.equal(catalog.groupingContract, 'thematic-proximity-not-identity');
  assert.equal(catalog.completionClaim, false);
});

test('unattractive, duplicate, module, and watch-only proposals are retained', () => {
  const find = (name, roundId) => catalog.proposals.find((proposal) => proposal.name === name && (!roundId || proposal.roundId === roundId));
  assert.equal(find('Worker Decision Ledger').relation, 'SAME_OR_DUPLICATE');
  assert.equal(find('PFAS Remediation Performance Network').relation, 'MODULE_OR_FEATURE');
  assert.equal(find('Biotech SandboxOps').relation, 'WATCH_SIGNAL');
  assert.equal(find('Quantum Supply-Chain Qualification Graph').relation, 'WATCH_SIGNAL');
  assert.equal(find('SupplierProof SLA').relation, 'MODULE_OR_FEATURE');
  assert.equal(find('Cyber Assurance Reuse Graph').relation, 'MODULE_OR_FEATURE');
  assert.equal(find('Transformer SpecNormaliser').relation, 'REJECTED_OR_KILLED');
  assert.equal(find('Visit-ID State Auditor').relation, 'RAW_HYPOTHESIS');
  assert.equal(find('Generic agent IAM/governance control plane').relation, 'REJECTED_OR_KILLED');
  assert.equal(find('Generic UCP readiness checker — free validators / protocol-native tools / commerce platforms').relation, 'REJECTED_OR_KILLED');
  assert.equal(find('NoticeSurvive — MERGE INTO AI Model License Drift / Commercial-Use Evidence').relation, 'RELATED_EXISTING_FAMILY');
  assert.equal(find('AI Transparency MarkCI — Release-to-Release Article 50 Regression').relation, 'SAME_OR_DUPLICATE');
  assert.equal(find('Repair Platform Readiness — Repairer Registration & Service-Catalog Normalisation').relation, 'WATCH_SIGNAL');
  assert.equal(find('PPWR PackProof — Packaging BOM & Evidence Preflight').relation, 'RAW_HYPOTHESIS');
});

test('all records are classified, grouped, non-ranked, and privacy-safe', () => {
  const allowed = new Set(['DISTINCT_PROPOSAL', 'SAME_OR_DUPLICATE', 'MODULE_OR_FEATURE', 'RELATED_EXISTING_FAMILY', 'WATCH_SIGNAL', 'RAW_HYPOTHESIS', 'REJECTED_OR_KILLED']);
  for (const proposal of catalog.proposals) {
    assert.ok(allowed.has(proposal.relation), proposal.id);
    assert.ok(proposal.familyId && proposal.familyLabel, proposal.id);
    assert.equal(proposal.rankingEligible, false, proposal.id);
  }
  const serialized = JSON.stringify(catalog);
  assert.doesNotMatch(serialized, /candidate-[0-9a-f-]{8,}/i);
  assert.doesNotMatch(serialized, /prioritizedForValidation|promotionEligible|idea-staging-queue/i);
  assert.equal(Object.values(catalog.relationCounts).reduce((sum, count) => sum + count, 0), 507);
  assert.equal(Object.values(catalog.familyCounts).reduce((sum, count) => sum + count, 0), 507);
});

test('closely related parent and module proposals share a family but remain separate', () => {
  const byName = new Map(catalog.proposals.map((proposal) => [proposal.name, proposal]));
  const pairs = [
    ['Brownfield PFAS Underwriter', 'PFAS Remediation Performance Network'],
    ['Cyber Assurance Continuity OS', 'Cyber Assurance Reuse Graph'],
    ['Nature Restoration Project OS', 'Nature Restoration Landowner Router'],
    ['eSAF Offtake Bankability Engine', 'SAF Airport Deliverability Router']
  ];
  for (const [parentName, relatedName] of pairs) {
    const parent = byName.get(parentName);
    const related = byName.get(relatedName);
    assert.notEqual(parent.id, related.id);
    assert.equal(parent.familyId, related.familyId, `${parentName} / ${relatedName}`);
  }
});

test('cross-round aliases co-locate repeated concepts without collapsing their rows', () => {
  const cases = [
    ['ChargeTruth', 2],
    ['VINState', 2],
    ['MicroFee', 2],
    ['BidProof', 3],
    ['ReclaimRight', 2],
    ['ESAP Relay', 2],
    ['MarkSurvive', 3]
  ];
  for (const [needle, expectedCount] of cases) {
    const matches = catalog.proposals.filter((proposal) => proposal.name.toLowerCase().includes(needle.toLowerCase()));
    assert.equal(matches.length, expectedCount, needle);
    assert.equal(new Set(matches.map((proposal) => proposal.familyId)).size, 1, needle);
    assert.equal(new Set(matches.map((proposal) => proposal.id)).size, expectedCount, needle);
  }
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
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(home, new RegExp(`All ${catalog.proposalCount} Research Proposal Rows`));
});
