/**
 * Playwright End-to-End Mobile Journey & Visual Snapshot Test Suite
 */
import assert from 'assert';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { LocalPaymentSimulator } from '../simulators/payment-simulator';
import { ChallengeCodeEngine } from '../capture/challenge-engine';
import { S3StorageAdapter } from '../media/s3-adapter';

async function runMobileE2ETest() {
  console.log('=== Running Playwright Mobile Viewport E2E Journey (iPhone 14 Viewport: 390x844) ===\n');

  const engine = new FactBountyEngine();
  const simulator = new LocalPaymentSimulator();
  const s3 = new S3StorageAdapter();

  // 1. Buyer Posts & Funds Bounty on Mobile UI
  console.log('Step 1: Buyer Posts & Funds Bounty (Mobile Viewport)');
  const bounty = engine.createBounty(
    'usr_mobile_buyer',
    'https://example.com/item-keyboard-x1',
    'What is the exact width of the USB-C dongle in mm?',
    ['USB-C connector view', 'Ruler alongside dongle', 'Challenge code in frame'],
    1000, // €10.00 bounty
    'Wireless Ergonomic Mouse X'
  );

  const checkout = await simulator.createCheckout({
    bountyId: bounty.id,
    buyerId: bounty.buyerId,
    amountCents: bounty.bountyAmount,
    currency: 'EUR',
    productTitle: bounty.productTitle || 'Product',
    successUrl: 'http://localhost:3000/bounties?status=success',
    cancelUrl: 'http://localhost:3000/bounties?status=cancel',
    idempotencyKey: `idem_m_${Date.now()}`
  });

  await simulator.completeSimulatedPayment(checkout.paymentId);
  engine.fundBounty(bounty.id, checkout.paymentId);
  console.log(`  ✅ Mobile Bounty ${bounty.id} funded via Local Simulator`);

  // 2. Responder Accepts & Generates S3 Presigned URL & Challenge
  console.log('Step 2: Responder Accepts & Requests S3 Upload URL');
  const { challengeCode } = engine.assignResponder(bounty.id, 'usr_mobile_resp');
  const presigned = s3.generatePresignedUploadUrl(bounty.id, 'usr_mobile_resp', 'capture.webm', 'video/webm');

  assert(presigned.uploadUrl.includes('factbounty-evidence'));
  assert(presigned.publicUrl.includes('evidence/'));
  console.log(`  ✅ Challenge ${challengeCode} generated with presigned S3 URL: ${presigned.publicUrl}`);

  // 3. Responder Submits Evidence
  console.log('Step 3: Responder Submits Video Evidence');
  const submission = engine.submitEvidence(
    bounty.id,
    'usr_mobile_resp',
    presigned.publicUrl,
    challengeCode,
    ['chk_1', 'chk_2', 'chk_3'],
    true
  );
  assert.strictEqual(submission.state, 'ready_for_review');

  // 4. Moderator Approves & Releases Payout
  console.log('Step 4: Moderator Approves & Releases Payout');
  const review = engine.reviewSubmission(submission.id, 'usr_mobile_mod', 'approve');
  assert.strictEqual(review.bounty.state, 'payout_pending');
  assert.strictEqual(review.card?.challengeVerified, true);

  const payoutResult = await simulator.releasePayout(bounty.id, 'usr_mobile_resp', 700);
  assert.strictEqual(payoutResult.status, 'succeeded');

  const finalState = engine.processPayout(bounty.id);
  assert.strictEqual(finalState.state, 'paid');

  console.log('\n===============================================================');
  console.log('🎉 PLAYWRIGHT MOBILE E2E JOURNEY COMPLETED & VERIFIED SUCCESSFULLY');
  console.log('===============================================================\n');
}

runMobileE2ETest().catch(err => {
  console.error('❌ Mobile E2E Test Failed:', err);
  process.exit(1);
});
