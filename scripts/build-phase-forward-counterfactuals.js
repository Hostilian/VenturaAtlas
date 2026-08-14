#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const PHASESHIFT_PATH = path.join(ROOT, 'data', 'phaseshift.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'phase-forward-counterfactuals.json');

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function nextPhase(current) {
  const match = /^P([0-9])_/.exec(current || '');
  if (!match) throw new Error(`invalid market phase: ${current}`);
  const nextNumber = Math.min(9, Number(match[1]) + 1);
  const names = [
    'SIGNAL', 'SPEC_FORMING', 'PREPARATION', 'MIGRATION', 'CUTOVER',
    'CONFORMANCE', 'OPERATIONAL_SCALE', 'OPTIMIZATION', 'CONSOLIDATION', 'COMMODITIZATION',
  ];
  return `P${nextNumber}_${names[nextNumber]}`;
}

function survivalDecision(market) {
  if ((market.ideaRefs || []).length === 0) return 'SIGNAL_ONLY';
  switch (market.currentStartupValue) {
    case 'HIGH':
    case 'MEDIUM': return 'SURVIVES_NARROWLY';
    case 'LOW': return 'GENERIC_LAYER_ABSORBED';
    case 'WAIT': return 'WAIT_FOR_TRIGGER';
    default: return 'UNKNOWN';
  }
}

function killCondition(market, decision) {
  const nextValue = (market.valueNext || []).join(', ') || 'no declared next-phase value';
  if (decision === 'SURVIVES_NARROWLY') {
    return `Kill unless ${nextValue} remains outside official or incumbent control and changes an authorized buyer decision after the phase advances.`;
  }
  if (decision === 'WAIT_FOR_TRIGGER') {
    return `Keep waiting unless the declared trigger occurs and ${nextValue} becomes observable with lawful data access.`;
  }
  if (decision === 'GENERIC_LAYER_ABSORBED') {
    return `Kill the generic layer; re-enter only if ${nextValue} exposes a repeated exception that incumbents do not control.`;
  }
  if (decision === 'SIGNAL_ONLY') {
    return `Do not create a candidate until ${nextValue} produces a concrete buyer, control point, accessible data path, and falsifiable loss event.`;
  }
  return `Do not advance while buyer authority, data access, and the next-phase value of ${nextValue} remain unproven.`;
}

function buildCounterfactuals(phaseshift) {
  const markets = phaseshift.markets || [];
  const records = markets.map(market => {
    const decision = survivalDecision(market);
    const advancedPhase = nextPhase(market.phase);
    return {
      counterfactualId: `phase-forward-${market.marketId}`,
      marketId: market.marketId,
      ideaRefs: [...(market.ideaRefs || [])],
      sourceRefs: [...(market.sourceRefs || [])],
      currentPhase: market.phase,
      counterfactualPhase: advancedPhase,
      assumption: `The market advances from ${market.phase} to ${advancedPhase}; current ${(market.valueNow || []).join(', ') || 'declared'} value is progressively absorbed.`,
      valueThatMustSurvive: [...(market.valueNext || [])],
      survivalDecision: decision,
      buyerAuthority: 'UNPROVEN_UNTIL_EXTERNAL_RECEIPT',
      dataAccess: 'UNPROVEN_UNTIL_EXTERNAL_RECEIPT',
      killCondition: killCondition(market, decision),
      reassessmentRequired: true,
      evidenceMaturity: 'DESK_COUNTERFACTUAL_NOT_VALIDATION',
    };
  });
  return {
    schemaVersion: '1.0.0',
    contract: 'phase-forward-counterfactual-v1',
    sourcePhaseShiftDigest: sha256(phaseshift),
    marketCount: markets.length,
    completionClaim: false,
    counterfactuals: records,
  };
}

function validateCounterfactuals(phaseshift, artifact) {
  const errors = [];
  const expected = buildCounterfactuals(phaseshift);
  if (artifact.schemaVersion !== '1.0.0' || artifact.contract !== expected.contract) errors.push('phase-forward contract metadata mismatch');
  if (artifact.sourcePhaseShiftDigest !== expected.sourcePhaseShiftDigest) errors.push('source PhaseShift digest mismatch');
  if (artifact.marketCount !== expected.marketCount) errors.push('marketCount mismatch');
  if (artifact.completionClaim !== false) errors.push('desk counterfactual artifact cannot claim completion or validation');
  if (!Array.isArray(artifact.counterfactuals) || artifact.counterfactuals.length !== expected.counterfactuals.length) {
    errors.push('counterfactual coverage must equal market coverage');
    return errors;
  }
  const actualById = new Map(artifact.counterfactuals.map(item => [item.marketId, item]));
  for (const record of expected.counterfactuals) {
    const actual = actualById.get(record.marketId);
    if (!actual) {
      errors.push(`missing counterfactual for ${record.marketId}`);
      continue;
    }
    for (const field of [
      'counterfactualId', 'currentPhase', 'counterfactualPhase', 'survivalDecision',
      'buyerAuthority', 'dataAccess', 'reassessmentRequired', 'evidenceMaturity',
    ]) {
      if (actual[field] !== record[field]) errors.push(`${record.marketId} ${field} mismatch`);
    }
    for (const field of ['ideaRefs', 'sourceRefs', 'valueThatMustSurvive']) {
      if (JSON.stringify(actual[field]) !== JSON.stringify(record[field])) errors.push(`${record.marketId} ${field} mismatch`);
    }
    if (actual.assumption !== record.assumption || actual.killCondition !== record.killCondition) errors.push(`${record.marketId} narrative contract mismatch`);
  }
  return errors;
}

function main() {
  const phaseshift = JSON.parse(fs.readFileSync(PHASESHIFT_PATH, 'utf8'));
  const expected = buildCounterfactuals(phaseshift);
  if (process.argv.includes('--write')) {
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(expected, null, 2)}\n`, 'utf8');
    console.log(`[OK] Wrote ${expected.counterfactuals.length} phase-forward counterfactuals.`);
    return;
  }
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error('[ERROR] phase-forward counterfactual artifact is missing; run with --write');
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  const errors = validateCounterfactuals(phaseshift, artifact);
  if (errors.length) {
    for (const error of errors) console.error(`[ERROR] ${error}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ marketCount: expected.marketCount, decisions: artifact.counterfactuals.reduce((counts, item) => {
    counts[item.survivalDecision] = (counts[item.survivalDecision] || 0) + 1;
    return counts;
  }, {}) }, null, 2));
  console.log('[OK] Phase-forward counterfactuals cover every current market and remain explicitly non-validating.');
}

if (require.main === module) main();

module.exports = { buildCounterfactuals, nextPhase, survivalDecision, validateCounterfactuals };
