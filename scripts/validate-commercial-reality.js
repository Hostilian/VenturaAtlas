#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_RECEIPT_ROOT = path.join(ROOT, '.agent-state', 'commercial-research', 'outcomes');
const DEFAULT_SCHEMA_PATH = path.join(ROOT, 'schemas', 'commercial-outcome-receipt.schema.json');
const PAYMENT_EVENTS = new Set([
  'PAYMENT_SETTLED',
  'REPEAT_PAYMENT_SETTLED',
  'EXPANSION_PAYMENT_SETTLED',
]);
const TRANSACTION_EVENTS = new Set([...PAYMENT_EVENTS, 'REFUND_SETTLED']);
const TERMINAL_EVENTS = new Set(['REJECTION_RECORDED', 'CHURN_RECORDED']);
const SIMULATION_MARKER = /(?:^|[._:-])(sim|test|mock|sandbox)(?:[._:-]|$)/i;

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, stableValue(value[key])])
    );
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(stableValue(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function computeReceiptDigest(receipt) {
  const subject = { ...receipt };
  delete subject.receiptDigest;
  return sha256(canonicalJson(subject));
}

function sameSubject(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function listReceiptFiles(rootPath) {
  const files = [];
  const errors = [];
  if (!fs.existsSync(rootPath)) return { files, errors, directoryExists: false };
  const rootStat = fs.lstatSync(rootPath);
  if (!rootStat.isDirectory()) {
    return {
      files,
      errors: [`receipt root is not a directory: ${rootPath}`],
      directoryExists: true,
    };
  }

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(rootPath, fullPath).replace(/\\/g, '/');
      if (entry.isSymbolicLink()) {
        errors.push(`symbolic links are not permitted in the receipt root: ${relative}`);
      } else if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }

  walk(rootPath);
  files.sort((left, right) => left.localeCompare(right));
  return { files, errors, directoryExists: true };
}

function compileSchema(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

function parseReceiptFiles(rootPath, files) {
  const entries = [];
  const errors = [];
  for (const filePath of files) {
    const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');
    try {
      entries.push({
        filePath,
        relativePath,
        receipt: JSON.parse(fs.readFileSync(filePath, 'utf8')),
      });
    } catch (error) {
      errors.push(`${relativePath}: invalid JSON (${error.message})`);
    }
  }
  return { entries, errors };
}

function ancestorChain(receipt, receiptsById) {
  const ancestors = [];
  const visited = new Set([receipt.receiptId]);
  let cursor = receipt;
  while (cursor.predecessorReceiptId) {
    if (visited.has(cursor.predecessorReceiptId)) return { ancestors, cycle: true };
    visited.add(cursor.predecessorReceiptId);
    const predecessor = receiptsById.get(cursor.predecessorReceiptId);
    if (!predecessor) return { ancestors, missing: cursor.predecessorReceiptId };
    ancestors.push(predecessor);
    cursor = predecessor;
  }
  ancestors.reverse();
  return { ancestors, cycle: false, missing: null };
}

function hasIndependentEvidence(receipt, allowedKinds) {
  return (receipt.evidence || []).some(evidence =>
    evidence.verification === 'INDEPENDENTLY_VERIFIABLE'
    && (!allowedKinds || allowedKinds.has(evidence.kind))
  );
}

function validateReceiptEntries(entries, options = {}) {
  const schema = options.schema || JSON.parse(fs.readFileSync(DEFAULT_SCHEMA_PATH, 'utf8'));
  const validateSchema = compileSchema(schema);
  const errors = [];
  const schemaValidEntries = [];

  for (const entry of entries) {
    const receipt = entry.receipt;
    if (!validateSchema(receipt)) {
      for (const error of validateSchema.errors || []) {
        errors.push(`${entry.relativePath}: ${error.instancePath || '<root>'} ${error.message}`);
      }
      continue;
    }
    const expectedFilename = `${receipt.receiptId}.json`;
    if (path.basename(entry.filePath) !== expectedFilename) {
      errors.push(`${entry.relativePath}: filename must be ${expectedFilename}`);
    }
    const expectedDigest = computeReceiptDigest(receipt);
    if (receipt.receiptDigest !== expectedDigest) {
      errors.push(`${receipt.receiptId}: receiptDigest does not match canonical receipt content`);
    }
    const occurredAt = Date.parse(receipt.occurredAt);
    const recordedAt = Date.parse(receipt.recordedAt);
    if (occurredAt > recordedAt) {
      errors.push(`${receipt.receiptId}: occurredAt must not be later than recordedAt`);
    }
    schemaValidEntries.push(entry);
  }

  const receipts = schemaValidEntries.map(entry => entry.receipt);
  const receiptsById = new Map();
  const entryById = new Map();
  const evidenceIds = new Map();
  const evidenceDigests = new Map();
  const providerEventIds = new Map();
  const providerEventDigests = new Map();
  const opportunityOwners = new Map();

  for (const entry of schemaValidEntries) {
    const receipt = entry.receipt;
    if (receiptsById.has(receipt.receiptId)) {
      errors.push(`${receipt.receiptId}: duplicate receiptId`);
    } else {
      receiptsById.set(receipt.receiptId, receipt);
      entryById.set(receipt.receiptId, entry);
    }

    const ownerKey = canonicalJson({
      subject: receipt.subject,
      organizationRef: receipt.organizationRef,
    });
    if (opportunityOwners.has(receipt.opportunityRef)
        && opportunityOwners.get(receipt.opportunityRef) !== ownerKey) {
      errors.push(`${receipt.receiptId}: opportunityRef is reused by a different subject or organization`);
    } else {
      opportunityOwners.set(receipt.opportunityRef, ownerKey);
    }

    for (const evidence of receipt.evidence) {
      if (evidenceIds.has(evidence.evidenceId)) {
        errors.push(`${receipt.receiptId}: evidenceId already used by ${evidenceIds.get(evidence.evidenceId)}`);
      } else {
        evidenceIds.set(evidence.evidenceId, receipt.receiptId);
      }
      if (evidenceDigests.has(evidence.sha256)) {
        errors.push(`${receipt.receiptId}: evidence digest already used by ${evidenceDigests.get(evidence.sha256)}`);
      } else {
        evidenceDigests.set(evidence.sha256, receipt.receiptId);
      }
    }

    if (receipt.transaction) {
      const providerEventKey = receipt.transaction.providerEventId.toLowerCase();
      if (providerEventIds.has(providerEventKey)) {
        errors.push(`${receipt.receiptId}: providerEventId already used by ${providerEventIds.get(providerEventKey)}`);
      } else {
        providerEventIds.set(providerEventKey, receipt.receiptId);
      }
      if (providerEventDigests.has(receipt.transaction.providerEventDigest)) {
        errors.push(`${receipt.receiptId}: providerEventDigest already used by ${providerEventDigests.get(receipt.transaction.providerEventDigest)}`);
      } else {
        providerEventDigests.set(receipt.transaction.providerEventDigest, receipt.receiptId);
      }
      if (receipt.transaction.environment !== 'PRODUCTION') {
        errors.push(`${receipt.receiptId}: transactions must come from PRODUCTION`);
      }
      if (SIMULATION_MARKER.test(receipt.transaction.providerEventId)) {
        errors.push(`${receipt.receiptId}: simulated, test, mock, or sandbox provider events cannot establish production truth`);
      }
      if (!hasIndependentEvidence(
        receipt,
        new Set(['PRODUCTION_PAYMENT_PROVIDER', 'BANK_STATEMENT'])
      )) {
        errors.push(`${receipt.receiptId}: transaction lacks independently verifiable production evidence`);
      }
    }
  }

  const childrenByPredecessor = new Map();
  const rootsByOpportunity = new Map();
  for (const receipt of receipts) {
    if (receipt.eventType === 'OPPORTUNITY_OPENED') {
      if (rootsByOpportunity.has(receipt.opportunityRef)) {
        errors.push(`${receipt.receiptId}: opportunity has more than one root receipt`);
      } else {
        rootsByOpportunity.set(receipt.opportunityRef, receipt.receiptId);
      }
      continue;
    }

    const predecessor = receiptsById.get(receipt.predecessorReceiptId);
    if (!predecessor) {
      errors.push(`${receipt.receiptId}: predecessor receipt is missing`);
      continue;
    }
    if (receipt.predecessorReceiptDigest !== predecessor.receiptDigest) {
      errors.push(`${receipt.receiptId}: predecessorReceiptDigest does not match predecessor`);
    }
    if (!sameSubject(receipt.subject, predecessor.subject)
        || receipt.organizationRef !== predecessor.organizationRef
        || receipt.opportunityRef !== predecessor.opportunityRef) {
      errors.push(`${receipt.receiptId}: predecessor must belong to the same subject, organization, and opportunity`);
    }
    if (Date.parse(receipt.occurredAt) <= Date.parse(predecessor.occurredAt)) {
      errors.push(`${receipt.receiptId}: occurredAt must be later than predecessor occurredAt`);
    }
    if (Date.parse(receipt.recordedAt) <= Date.parse(predecessor.recordedAt)) {
      errors.push(`${receipt.receiptId}: recordedAt must be later than predecessor recordedAt`);
    }
    if (childrenByPredecessor.has(predecessor.receiptId)) {
      errors.push(`${receipt.receiptId}: receipt chain forks at ${predecessor.receiptId}`);
    } else {
      childrenByPredecessor.set(predecessor.receiptId, receipt.receiptId);
    }
  }

  for (const receipt of receipts) {
    const { ancestors, cycle, missing } = ancestorChain(receipt, receiptsById);
    if (cycle) {
      errors.push(`${receipt.receiptId}: predecessor chain contains a cycle`);
      continue;
    }
    if (missing) continue;
    if (receipt.eventType !== 'OPPORTUNITY_OPENED'
        && !ancestors.some(item => item.eventType === 'OPPORTUNITY_OPENED')) {
      errors.push(`${receipt.receiptId}: predecessor chain has no OPPORTUNITY_OPENED root`);
    }

    const ancestorTypes = new Set(ancestors.map(item => item.eventType));
    const priorPayments = ancestors.filter(item => PAYMENT_EVENTS.has(item.eventType));

    if (receipt.eventType === 'OFFER_ACCEPTED' && !ancestorTypes.has('OPPORTUNITY_OPENED')) {
      errors.push(`${receipt.receiptId}: offer acceptance requires an opened opportunity`);
    }
    if (receipt.eventType === 'PILOT_STARTED' && !ancestorTypes.has('OFFER_ACCEPTED')) {
      errors.push(`${receipt.receiptId}: pilot start requires prior offer acceptance`);
    }
    if (receipt.eventType === 'PAYMENT_SETTLED') {
      if (!ancestorTypes.has('OFFER_ACCEPTED') && !ancestorTypes.has('PILOT_STARTED')) {
        errors.push(`${receipt.receiptId}: initial payment requires an accepted offer or started pilot`);
      }
      if (priorPayments.length) {
        errors.push(`${receipt.receiptId}: later payments must be classified as repeat or expansion payments`);
      }
    }
    if (receipt.eventType === 'VALUE_ACHIEVED') {
      if (!ancestorTypes.has('PILOT_STARTED')) {
        errors.push(`${receipt.receiptId}: value achievement requires a started pilot`);
      }
      const hasRetainedPayment = priorPayments.some(payment => {
        const refunded = ancestors
          .filter(item => item.eventType === 'REFUND_SETTLED'
            && item.transaction.relatedPaymentReceiptId === payment.receiptId)
          .reduce((sum, item) => sum + item.transaction.amountMinor, 0);
        return payment.transaction.amountMinor > refunded;
      });
      if (!hasRetainedPayment) {
        errors.push(`${receipt.receiptId}: value achievement requires a prior net-positive settled payment`);
      }
      if (!hasIndependentEvidence(
        receipt,
        new Set(['SIGNED_AGREEMENT', 'AUTHORIZED_PRODUCT_TELEMETRY', 'CUSTOMER_COMMUNICATION'])
      )) {
        errors.push(`${receipt.receiptId}: value achievement requires independently verifiable customer or telemetry evidence`);
      }
    }

    if (receipt.eventType === 'REFUND_SETTLED') {
      const relatedId = receipt.transaction.relatedPaymentReceiptId;
      const related = receiptsById.get(relatedId);
      if (!related || !PAYMENT_EVENTS.has(related.eventType)
          || !ancestors.some(item => item.receiptId === relatedId)) {
        errors.push(`${receipt.receiptId}: refund must reference a prior payment in the same chain`);
      } else if (related.transaction.currency !== receipt.transaction.currency) {
        errors.push(`${receipt.receiptId}: refund currency must match its payment`);
      }
    }

    if (receipt.eventType === 'REPEAT_OR_RENEWAL_COMMITTED'
        || receipt.eventType === 'EXPANSION_COMMITTED') {
      const firstPayment = priorPayments.find(item => item.eventType === 'PAYMENT_SETTLED');
      const value = firstPayment && ancestors.find(item =>
        item.eventType === 'VALUE_ACHIEVED'
        && Date.parse(item.occurredAt) > Date.parse(firstPayment.occurredAt)
      );
      if (!firstPayment || !value) {
        errors.push(`${receipt.receiptId}: commitment requires an initial payment followed by achieved value`);
      }
    }

    if (receipt.eventType === 'REPEAT_PAYMENT_SETTLED'
        || receipt.eventType === 'EXPANSION_PAYMENT_SETTLED') {
      const relatedId = receipt.transaction.relatedPaymentReceiptId;
      const initial = receiptsById.get(relatedId);
      const commitmentType = receipt.eventType === 'REPEAT_PAYMENT_SETTLED'
        ? 'REPEAT_OR_RENEWAL_COMMITTED'
        : 'EXPANSION_COMMITTED';
      const initialIndex = ancestors.findIndex(item => item.receiptId === relatedId);
      const valueIndex = ancestors.findIndex((item, index) =>
        index > initialIndex && item.eventType === 'VALUE_ACHIEVED'
      );
      const commitmentIndex = ancestors.findIndex((item, index) =>
        index > valueIndex && item.eventType === commitmentType
      );
      if (!initial || initial.eventType !== 'PAYMENT_SETTLED' || initialIndex < 0) {
        errors.push(`${receipt.receiptId}: later payment must reference the prior initial payment`);
      } else {
        if (initial.transaction.currency !== receipt.transaction.currency) {
          errors.push(`${receipt.receiptId}: later payment currency must match the initial payment`);
        }
        if (valueIndex < 0 || commitmentIndex < 0) {
          errors.push(`${receipt.receiptId}: later payment requires a separate value then commitment chain`);
        }
        if (initial.transaction.providerEventId === receipt.transaction.providerEventId) {
          errors.push(`${receipt.receiptId}: later payment must use a distinct provider event`);
        }
      }
    }

    if (receipt.eventType === 'REFERRAL_CONFIRMED') {
      if (!ancestorTypes.has('VALUE_ACHIEVED')) {
        errors.push(`${receipt.receiptId}: referral requires prior achieved value`);
      }
      if (!hasIndependentEvidence(receipt, new Set(['CUSTOMER_COMMUNICATION']))) {
        errors.push(`${receipt.receiptId}: referral requires independently verifiable customer communication`);
      }
    }
  }

  for (const receipt of receipts) {
    if (TERMINAL_EVENTS.has(receipt.eventType) && childrenByPredecessor.has(receipt.receiptId)) {
      errors.push(`${receipt.receiptId}: terminal rejection or churn receipt cannot have a successor`);
    }
  }

  const refundTotals = new Map();
  for (const receipt of receipts.filter(item => item.eventType === 'REFUND_SETTLED')) {
    const relatedId = receipt.transaction.relatedPaymentReceiptId;
    refundTotals.set(relatedId, (refundTotals.get(relatedId) || 0) + receipt.transaction.amountMinor);
  }
  for (const [paymentId, refundTotal] of refundTotals) {
    const payment = receiptsById.get(paymentId);
    if (payment && PAYMENT_EVENTS.has(payment.eventType)
        && refundTotal > payment.transaction.amountMinor) {
      errors.push(`${paymentId}: settled refunds exceed collected payment`);
    }
  }

  const uniqueErrors = [...new Set(errors)].sort();
  const eventCounts = Object.fromEntries(
    [...new Set(receipts.map(receipt => receipt.eventType))]
      .sort()
      .map(eventType => [eventType, receipts.filter(receipt => receipt.eventType === eventType).length])
  );
  const independentlyVerifiableReceiptCount = receipts.filter(receipt =>
    hasIndependentEvidence(receipt)
  ).length;
  const operatorOnlyReceiptCount = receipts.filter(receipt =>
    receipt.evidence.every(evidence => evidence.verification === 'OPERATOR_ATTESTED')
  ).length;
  const netCollectedByCurrency = {};
  if (!uniqueErrors.length) {
    for (const receipt of receipts.filter(item => TRANSACTION_EVENTS.has(item.eventType))) {
      const direction = receipt.eventType === 'REFUND_SETTLED' ? -1 : 1;
      const currency = receipt.transaction.currency;
      netCollectedByCurrency[currency] = (netCollectedByCurrency[currency] || 0)
        + direction * receipt.transaction.amountMinor;
    }
  }

  return {
    receiptCount: receipts.length,
    eventCounts,
    operatorOnlyReceiptCount,
    independentlyVerifiableReceiptCount,
    netCollectedMinorByCurrency: uniqueErrors.length ? null : netCollectedByCurrency,
    completionClaim: false,
    errors: uniqueErrors,
  };
}

function validateCommercialReality(rootPath = DEFAULT_RECEIPT_ROOT, options = {}) {
  const resolvedRoot = path.resolve(rootPath);
  const discovered = listReceiptFiles(resolvedRoot);
  const parsed = parseReceiptFiles(resolvedRoot, discovered.files);
  const result = validateReceiptEntries(parsed.entries, options);
  const errors = [...new Set([
    ...discovered.errors,
    ...parsed.errors,
    ...result.errors,
  ])].sort();
  const receiptFileCount = discovered.files.length;
  const status = errors.length
    ? 'INVALID_COMMERCIAL_RECEIPTS'
    : receiptFileCount === 0
      ? 'NO_EXTERNAL_COMMERCIAL_RECEIPTS'
      : 'PRIVATE_COMMERCIAL_RECEIPTS_VALID';
  return {
    schemaVersion: '1.0.0',
    status,
    root: resolvedRoot,
    directoryExists: discovered.directoryExists,
    receiptFileCount,
    ...result,
    completionClaim: false,
    truthBoundary: 'Validation proves structure, digest integrity, and causal consistency; operator attestations remain operator attestations.',
    errors,
  };
}

function parseArgs(argv) {
  if (!argv.length) return DEFAULT_RECEIPT_ROOT;
  if (argv.length === 1 && !argv[0].startsWith('-')) return argv[0];
  if (argv.length === 2 && argv[0] === '--root') return argv[1];
  throw new Error('usage: node scripts/validate-commercial-reality.js [--root <private-receipt-directory>]');
}

function main() {
  try {
    const rootPath = parseArgs(process.argv.slice(2));
    const report = validateCommercialReality(rootPath);
    console.log(JSON.stringify(report, null, 2));
    if (report.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({
      schemaVersion: '1.0.0',
      status: 'INVALID_COMMERCIAL_RECEIPTS',
      completionClaim: false,
      errors: [error.message],
    }, null, 2));
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  DEFAULT_RECEIPT_ROOT,
  canonicalJson,
  computeReceiptDigest,
  validateCommercialReality,
  validateReceiptEntries,
};
