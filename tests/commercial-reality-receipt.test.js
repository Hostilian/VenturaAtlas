const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  computeReceiptDigest,
  validateCommercialReality,
} = require('../scripts/validate-commercial-reality');

const ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(ROOT, 'scripts', 'validate-commercial-reality.js');

function digest(label) {
  return crypto.createHash('sha256').update(label).digest('hex');
}

function temporaryRoot(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'va-commercial-reality-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function state(scope = 'alpha') {
  return {
    scope,
    sequence: 0,
    receipts: [],
    subject: {
      kind: 'CANONICAL_IDEA',
      id: 'idea-061',
      contentDigest: digest(`subject-${scope}`),
      lineageRef: `lineage-idea-061-${scope}`,
    },
    organizationRef: `org-buyer-${scope}`,
    opportunityRef: `opportunity-buyer-${scope}`,
  };
}

function operatorEvidence(scope, sequence) {
  return {
    evidenceId: `evidence-${scope}-${sequence}-operator`,
    kind: 'OPERATOR_ATTESTATION',
    verification: 'OPERATOR_ATTESTED',
    privateRef: `private-evidence-${scope}-${sequence}-operator`,
    sha256: digest(`operator-evidence-${scope}-${sequence}`),
    issuerRef: 'issuer-founder-001',
  };
}

function independentEvidence(scope, sequence, kind) {
  return {
    evidenceId: `evidence-${scope}-${sequence}-independent`,
    kind,
    verification: 'INDEPENDENTLY_VERIFIABLE',
    privateRef: `private-evidence-${scope}-${sequence}-independent`,
    sha256: digest(`independent-evidence-${scope}-${sequence}-${kind}`),
    issuerRef: kind === 'PRODUCTION_PAYMENT_PROVIDER'
      ? 'issuer-payment-provider-001'
      : 'issuer-customer-001',
  };
}

function transaction(label, options = {}) {
  return {
    kind: options.kind || 'PAYMENT',
    amountMinor: options.amountMinor || 500,
    currency: options.currency || 'EUR',
    status: 'SETTLED',
    provider: options.provider || 'STRIPE',
    providerEventId: options.providerEventId || `evt_live_${label}`,
    providerEventDigest: options.providerEventDigest || digest(`provider-event-${label}`),
    environment: options.environment || 'PRODUCTION',
    relatedPaymentReceiptId: options.relatedPaymentReceiptId ?? null,
  };
}

function append(chain, eventType, options = {}) {
  chain.sequence += 1;
  const sequence = String(chain.sequence).padStart(3, '0');
  const predecessor = chain.receipts.at(-1) || null;
  const occurredAt = new Date(Date.UTC(2026, 7, 25, 10, chain.sequence * 2, 0));
  const recordedAt = new Date(occurredAt.getTime() + 30_000);
  const receipt = {
    schemaVersion: '1.0.0',
    receiptId: `commercial-receipt-${chain.scope}-${sequence}`,
    subject: options.subject || structuredClone(chain.subject),
    organizationRef: options.organizationRef || chain.organizationRef,
    opportunityRef: options.opportunityRef || chain.opportunityRef,
    eventType,
    occurredAt: occurredAt.toISOString(),
    recordedAt: recordedAt.toISOString(),
    recordedBy: 'operator-founder-001',
    predecessorReceiptId: predecessor ? predecessor.receiptId : null,
    predecessorReceiptDigest: predecessor ? predecessor.receiptDigest : null,
    evidence: options.evidence || [operatorEvidence(chain.scope, sequence)],
    transaction: options.transaction || null,
    receiptDigest: '',
  };
  receipt.receiptDigest = computeReceiptDigest(receipt);
  chain.receipts.push(receipt);
  return receipt;
}

function rewriteDigest(receipt) {
  receipt.receiptDigest = computeReceiptDigest(receipt);
  return receipt;
}

function writeReceipts(directory, receipts, filenames = {}) {
  for (const receipt of receipts) {
    const filename = filenames[receipt.receiptId] || `${receipt.receiptId}.json`;
    fs.writeFileSync(path.join(directory, filename), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  }
}

function reportErrors(report) {
  return report.errors.join('\n');
}

test('empty or absent private receipt directory reports no external receipts and exits cleanly', t => {
  const directory = temporaryRoot(t);
  const direct = validateCommercialReality(directory);
  assert.equal(direct.status, 'NO_EXTERNAL_COMMERCIAL_RECEIPTS');
  assert.equal(direct.receiptCount, 0);
  assert.equal(direct.receiptFileCount, 0);
  assert.equal(direct.completionClaim, false);
  assert.deepEqual(direct.errors, []);

  const cli = JSON.parse(execFileSync(process.execPath, [VALIDATOR, '--root', directory], {
    cwd: ROOT,
    encoding: 'utf8',
  }));
  assert.equal(cli.status, 'NO_EXTERNAL_COMMERCIAL_RECEIPTS');
  assert.equal(cli.completionClaim, false);

  const missing = validateCommercialReality(path.join(directory, 'not-created'));
  assert.equal(missing.status, 'NO_EXTERNAL_COMMERCIAL_RECEIPTS');
  assert.equal(missing.directoryExists, false);
});

test('valid payment, refund, value, repeat, expansion, and referral chain passes', t => {
  const directory = temporaryRoot(t);
  const chain = state('valid');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  append(chain, 'PILOT_STARTED', {
    evidence: [independentEvidence('valid', '003', 'SIGNED_AGREEMENT')],
  });
  const initialPayment = append(chain, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('valid', '004', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('valid_initial', { amountMinor: 500 }),
  });
  append(chain, 'REFUND_SETTLED', {
    evidence: [independentEvidence('valid', '005', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('valid_refund', {
      kind: 'REFUND',
      amountMinor: 100,
      relatedPaymentReceiptId: initialPayment.receiptId,
    }),
  });
  append(chain, 'VALUE_ACHIEVED', {
    evidence: [independentEvidence('valid', '006', 'AUTHORIZED_PRODUCT_TELEMETRY')],
  });
  append(chain, 'REPEAT_OR_RENEWAL_COMMITTED', {
    evidence: [independentEvidence('valid', '007', 'CUSTOMER_COMMUNICATION')],
  });
  append(chain, 'REPEAT_PAYMENT_SETTLED', {
    evidence: [independentEvidence('valid', '008', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('valid_repeat', {
      amountMinor: 500,
      relatedPaymentReceiptId: initialPayment.receiptId,
    }),
  });
  append(chain, 'EXPANSION_COMMITTED', {
    evidence: [independentEvidence('valid', '009', 'CUSTOMER_COMMUNICATION')],
  });
  append(chain, 'EXPANSION_PAYMENT_SETTLED', {
    evidence: [independentEvidence('valid', '010', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('valid_expansion', {
      amountMinor: 250,
      relatedPaymentReceiptId: initialPayment.receiptId,
    }),
  });
  append(chain, 'REFERRAL_CONFIRMED', {
    evidence: [independentEvidence('valid', '011', 'CUSTOMER_COMMUNICATION')],
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'PRIVATE_COMMERCIAL_RECEIPTS_VALID', reportErrors(report));
  assert.deepEqual(report.errors, []);
  assert.equal(report.receiptCount, 11);
  assert.equal(report.operatorOnlyReceiptCount, 2);
  assert.equal(report.independentlyVerifiableReceiptCount, 9);
  assert.deepEqual(report.netCollectedMinorByCurrency, { EUR: 1150 });
  assert.equal(report.completionClaim, false);
});

test('receipt content mutation and filename mismatch are detected', t => {
  const directory = temporaryRoot(t);
  const chain = state('tamper');
  const receipt = append(chain, 'OPPORTUNITY_OPENED');
  receipt.recordedBy = 'operator-tampered-001';
  writeReceipts(directory, [receipt], { [receipt.receiptId]: 'wrong-name.json' });

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /filename must be/);
  assert.match(reportErrors(report), /receiptDigest does not match/);
});

test('operator-attested payment cannot establish transactional truth', t => {
  const directory = temporaryRoot(t);
  const chain = state('operatorpay');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  append(chain, 'PAYMENT_SETTLED', {
    evidence: [operatorEvidence('operatorpay', '003')],
    transaction: transaction('operator_attested'),
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /must contain at least 1 valid item|independently verifiable production evidence/);
});

test('simulated, test, mock, and sandbox provider events are prohibited', t => {
  const directory = temporaryRoot(t);
  const receipts = [];
  for (const marker of ['sim', 'test', 'mock', 'sandbox']) {
    const chain = state(`blocked${marker}`);
    append(chain, 'OPPORTUNITY_OPENED');
    append(chain, 'OFFER_ACCEPTED');
    append(chain, 'PAYMENT_SETTLED', {
      evidence: [independentEvidence(`blocked${marker}`, '003', 'PRODUCTION_PAYMENT_PROVIDER')],
      transaction: transaction(`blocked_${marker}`, { providerEventId: `evt_${marker}_001` }),
    });
    receipts.push(...chain.receipts);
  }
  writeReceipts(directory, receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.equal(
    report.errors.filter(error => /simulated, test, mock, or sandbox/.test(error)).length,
    4
  );
});

test('a non-production transaction environment is rejected by the strict schema', t => {
  const directory = temporaryRoot(t);
  const chain = state('testenvironment');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  append(chain, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('testenvironment', '003', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('live_shaped_but_test', {
      providerEventId: 'evt_live_environment_001',
      environment: 'TEST',
    }),
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /transaction\/environment.*must be equal to constant/);
});

test('payment prerequisites and predecessor scope are enforced', t => {
  const directory = temporaryRoot(t);
  const chain = state('scope');
  append(chain, 'OPPORTUNITY_OPENED');
  const payment = append(chain, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('scope', '002', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('scope_payment'),
    organizationRef: 'org-different-buyer',
  });
  rewriteDigest(payment);
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /same subject, organization, and opportunity/);
  assert.match(reportErrors(report), /initial payment requires an accepted offer or started pilot/);
});

test('provider event IDs are globally unique across opportunities', t => {
  const directory = temporaryRoot(t);
  const first = state('providerone');
  append(first, 'OPPORTUNITY_OPENED');
  append(first, 'OFFER_ACCEPTED');
  append(first, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('providerone', '003', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('provider_one', { providerEventId: 'evt_live_shared_001' }),
  });
  const second = state('providertwo');
  append(second, 'OPPORTUNITY_OPENED');
  append(second, 'OFFER_ACCEPTED');
  append(second, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('providertwo', '003', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('provider_two', { providerEventId: 'evt_live_shared_001' }),
  });
  writeReceipts(directory, [...first.receipts, ...second.receipts]);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /providerEventId already used/);
});

test('refund must match a prior same-currency payment and cannot exceed it', t => {
  const directory = temporaryRoot(t);
  const chain = state('refundcap');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  const payment = append(chain, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('refundcap', '003', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('refundcap_payment', { amountMinor: 500 }),
  });
  append(chain, 'REFUND_SETTLED', {
    evidence: [independentEvidence('refundcap', '004', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('refundcap_refund', {
      kind: 'REFUND',
      amountMinor: 600,
      relatedPaymentReceiptId: payment.receiptId,
    }),
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /settled refunds exceed collected payment/);
});

test('value requires a started pilot, retained payment, and independent evidence', t => {
  const directory = temporaryRoot(t);
  const chain = state('valuegate');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  append(chain, 'PILOT_STARTED');
  append(chain, 'VALUE_ACHIEVED', {
    evidence: [independentEvidence('valuegate', '004', 'AUTHORIZED_PRODUCT_TELEMETRY')],
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /prior net-positive settled payment/);
});

test('repeat payment requires initial payment then later value and commitment', t => {
  const directory = temporaryRoot(t);
  const chain = state('repeatgate');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  const payment = append(chain, 'PAYMENT_SETTLED', {
    evidence: [independentEvidence('repeatgate', '003', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('repeatgate_initial'),
  });
  append(chain, 'REPEAT_PAYMENT_SETTLED', {
    evidence: [independentEvidence('repeatgate', '004', 'PRODUCTION_PAYMENT_PROVIDER')],
    transaction: transaction('repeatgate_repeat', {
      relatedPaymentReceiptId: payment.receiptId,
    }),
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /separate value then commitment chain/);
});

test('expansion and referral cannot be asserted before achieved value', t => {
  const directory = temporaryRoot(t);
  const chain = state('downstream');
  append(chain, 'OPPORTUNITY_OPENED');
  append(chain, 'OFFER_ACCEPTED');
  append(chain, 'EXPANSION_COMMITTED');
  append(chain, 'REFERRAL_CONFIRMED', {
    evidence: [independentEvidence('downstream', '004', 'CUSTOMER_COMMUNICATION')],
  });
  writeReceipts(directory, chain.receipts);

  const report = validateCommercialReality(directory);
  assert.equal(report.status, 'INVALID_COMMERCIAL_RECEIPTS');
  assert.match(reportErrors(report), /commitment requires an initial payment followed by achieved value/);
  assert.match(reportErrors(report), /referral requires prior achieved value/);
});
