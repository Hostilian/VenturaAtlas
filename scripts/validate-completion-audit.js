#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const AUDIT_PATH = path.join(ROOT, 'research', 'audits', 'OMEGA-XIII-20260812T174230Z', 'COMPLETION_AUDIT.json');
const EXPECTED_DIGEST = '12BE0235DC315575E2DCAC1116DBFFF5AAE82AC8ED4670748A64B4495241DDED';
const ALLOWED = new Set(['PROVEN', 'PARTIAL', 'MISSING_EXTERNAL']);

function fail(errors) {
  for (const error of errors) console.error(`[ERROR] ${error}`);
  process.exitCode = 1;
}

function validateCompletionAudit() {
  const errors = [];
  if (!fs.existsSync(AUDIT_PATH)) {
    fail([`completion audit is missing: ${AUDIT_PATH}`]);
    return;
  }
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8'));
  if (audit.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  if (audit.constitutionDigest !== EXPECTED_DIGEST) errors.push('constitutionDigest does not match the supplied OMEGA XIII file');
  if (!Array.isArray(audit.conditions) || audit.conditions.length !== 45) errors.push('conditions must contain exactly 45 entries');
  const ids = new Set();
  for (const condition of audit.conditions || []) {
    if (!Number.isInteger(condition.id) || condition.id < 1 || condition.id > 45) errors.push(`invalid condition id: ${condition.id}`);
    if (ids.has(condition.id)) errors.push(`duplicate condition id: ${condition.id}`);
    ids.add(condition.id);
    if (!ALLOWED.has(condition.status)) errors.push(`condition ${condition.id} has invalid status: ${condition.status}`);
    if (!condition.requirement || !condition.finding) errors.push(`condition ${condition.id} must have requirement and finding`);
    if (!Array.isArray(condition.evidence) || condition.evidence.length === 0) {
      errors.push(`condition ${condition.id} has no evidence paths`);
    }
    for (const evidencePath of condition.evidence || []) {
      const resolved = path.resolve(ROOT, evidencePath);
      if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
        errors.push(`condition ${condition.id} evidence escapes repository: ${evidencePath}`);
      } else if (!fs.existsSync(resolved)) {
        errors.push(`condition ${condition.id} evidence path is missing: ${evidencePath}`);
      }
    }
    if (condition.status !== 'PROVEN' && !condition.closureNeeded) errors.push(`condition ${condition.id} is open without closureNeeded`);
  }
  for (let id = 1; id <= 45; id += 1) if (!ids.has(id)) errors.push(`condition ${id} is missing`);
  const open = (audit.conditions || []).filter(condition => condition.status !== 'PROVEN');
  if (open.length > 0 && audit.completionClaim !== false) errors.push('completionClaim must be false while any condition is open');
  if (open.length === 0 && audit.completionClaim !== true) errors.push('completionClaim must be true when every condition is proven');
  if (errors.length) {
    fail(errors);
    return;
  }
  const counts = Object.fromEntries([...ALLOWED].map(status => [status, audit.conditions.filter(condition => condition.status === status).length]));
  console.log(JSON.stringify({ conditionCount: audit.conditions.length, completionClaim: audit.completionClaim, counts }, null, 2));
  console.log('[OK] OMEGA XIII completion audit is structurally closed and truthfully incomplete.');
}

validateCompletionAudit();
