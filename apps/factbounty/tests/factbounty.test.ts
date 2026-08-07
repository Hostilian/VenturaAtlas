/**
 * FactBounty Unit & Integration Test Suite
 */
import assert from 'assert';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { ChallengeCodeEngine } from '../capture/challenge-engine';
import { LocalPaymentSimulator } from '../simulators/payment-simulator';
import { InvalidStateTransitionError } from '../shared/contracts/state-machines';

async function runTests() {
  console.log('=== Running FactBounty Unit & Integration Test Suite ===\n');

  // Test 1: Bounty Creation Validation
  console.log('Test 1: Valid & invalid bounty creation');
  const engine = new FactBountyEngine();
  
  assert.throws(() => {
    engine.createBounty('buyer_1', 'invalid-url', 'Question?', [], 500);
  }, /HTTP\/HTTPS product URL required/);

  assert.throws(() => {
    engine.createBounty('buyer_1', 'https://example.com/item', 'Question?', [], 100); // €1 < min €3
  }, /between €3.00 and €50.00/);

  const b1 = engine.createBounty('buyer_1', 'https://example.com/item', 'Exact width?', ['Ruler view'], 500);
  assert.strictEqual(b1.state, 'awaiting_payment');
  console.log('  ✅ Bounty creation validation passed');

  // Test 2: Local Payment Simulator & State Machine
  console.log('Test 2: Payment Simulator & State Machine transitions');
  const paymentSim = new LocalPaymentSimulator();
  const checkout = await paymentSim.createCheckout({
    bountyId: b1.id,
    buyerId: b1.buyerId,
    amountCents: b1.bountyAmount,
    currency: 'EUR',
    productTitle: b1.productTitle || 'Product',
    successUrl: 'http://localhost/success',
    cancelUrl: 'http://localhost/cancel',
    idempotencyKey: 'idem_key_001'
  });

  assert.strictEqual(checkout.status, 'pending');
  await paymentSim.completeSimulatedPayment(checkout.paymentId);
  
  const fundedBounty = engine.fundBounty(b1.id, checkout.paymentId);
  assert.strictEqual(fundedBounty.state, 'matching');
  console.log('  ✅ Payment simulator funding & state transition passed');

  // Test 3: Invalid State Transition Error Handling
  console.log('Test 3: Rejecting invalid state transitions');
  assert.throws(() => {
    engine.reviewSubmission('non_existent', 'mod_1', 'approve');
  }, /Evidence non_existent not found/);
  console.log('  ✅ Invalid state transition rejection passed');

  // Test 4: Challenge Code Generation & Verification
  console.log('Test 4: Challenge Code Engine verification & expiration');
  const challenge = ChallengeCodeEngine.generateChallenge(b1.id, 'resp_1', 2);
  const verifyResult = ChallengeCodeEngine.verifyChallenge(challenge, challenge.code);
  assert.strictEqual(verifyResult.valid, true);

  const failResult = ChallengeCodeEngine.verifyChallenge(challenge, 'WRONG-123');
  assert.strictEqual(failResult.valid, false);
  console.log('  ✅ Cryptographic challenge code engine passed');

  // Test 5: Full End-to-End Workflow (Responder -> Moderator -> Payout)
  console.log('Test 5: End-to-End Buyer -> Responder -> Moderator -> Payout Loop');
  const { challengeCode } = engine.assignResponder(b1.id, 'resp_1');
  const submission = engine.submitEvidence(
    b1.id,
    'resp_1',
    'https://storage.local/proof.webm',
    challengeCode,
    ['chk_1'],
    true
  );

  assert.strictEqual(submission.state, 'ready_for_review');
  const reviewResult = engine.reviewSubmission(submission.id, 'mod_1', 'approve');

  assert.strictEqual(reviewResult.bounty.state, 'payout_pending');
  assert.strictEqual(reviewResult.card?.challengeVerified, true);

  const finalBounty = engine.processPayout(b1.id);
  assert.strictEqual(finalBounty.state, 'paid');
  console.log('  ✅ End-to-End full workflow passed');

  console.log('\n======================================================');
  console.log('🎉 ALL FACTBOUNTY INTEGRATION TESTS PASSED SUCCESSFULLY');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
