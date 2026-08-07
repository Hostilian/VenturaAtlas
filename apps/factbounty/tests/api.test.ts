import assert from 'assert';
import request from 'supertest';
import { createApp } from '../api/app';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { loadConfig } from '../config';
import { generateDemoToken } from '../api/auth';

async function testApi() {
  console.log('=== Running FactBounty Express HTTP API & Auth Test Suite ===\n');

  const config = loadConfig({
    FACTBOUNTY_DEMO_MODE: 'false',
    FACTBOUNTY_JWT_SECRET: 'super_secret_test_key_32bytes_min'
  });
  const engine = new FactBountyEngine();
  const app = createApp({ engine, config });

  const buyerToken = await generateDemoToken('buyer_user_1', ['buyer'], config.FACTBOUNTY_JWT_SECRET);
  const responderToken = await generateDemoToken('responder_user_1', ['responder'], config.FACTBOUNTY_JWT_SECRET);
  const moderatorToken = await generateDemoToken('moderator_user_1', ['moderator'], config.FACTBOUNTY_JWT_SECRET);

  // 1. Unauthenticated Request -> 401
  console.log('Test 1: Unauthenticated request rejection');
  const res1 = await request(app).post('/api/bounties').send({});
  assert.strictEqual(res1.status, 401);
  console.log('  ✅ 401 Unauthenticated request passed');

  // 2. Invalid Role Request -> 403
  console.log('Test 2: Forbidden role request rejection');
  const res2 = await request(app)
    .post('/api/bounties')
    .set('Authorization', `Bearer ${responderToken}`)
    .send({
      productUrl: 'https://example.com/item',
      question: 'Is this 10cm long?',
      checklist: ['Check width'],
      bountyAmount: 500
    });
  assert.strictEqual(res2.status, 403);
  console.log('  ✅ 403 Forbidden role passed');

  // 3. Valid Buyer Post Bounty -> 201
  console.log('Test 3: Valid buyer bounty creation');
  const res3 = await request(app)
    .post('/api/bounties')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({
      productUrl: 'https://example.com/keyboard',
      question: 'Does this have mechanical switches?',
      checklist: ['Label view', 'Switch color'],
      bountyAmount: 1000,
      productTitle: 'Mechanical Keyboard'
    });
  assert.strictEqual(res3.status, 201);
  assert.strictEqual(res3.body.success, true);
  const bountyId = res3.body.bounty.id;
  console.log(`  ✅ 201 Created bounty ${bountyId}`);

  // 4. Buyer Checkout -> 200
  console.log('Test 4: Buyer checkout & funding');
  const res4 = await request(app)
    .post(`/api/bounties/${bountyId}/checkout`)
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ useStripe: false });
  assert.strictEqual(res4.status, 200);
  assert.strictEqual(res4.body.bounty.state, 'matching');
  console.log('  ✅ Checkout & funding passed');

  // 5. Responder Accept Bounty -> 200
  console.log('Test 5: Responder accepting bounty');
  const res5 = await request(app)
    .post(`/api/bounties/${bountyId}/accept`)
    .set('Authorization', `Bearer ${responderToken}`)
    .send({});
  assert.strictEqual(res5.status, 200);
  const challengeCode = res5.body.challengeCode;
  assert.ok(challengeCode);
  console.log(`  ✅ Accepted bounty with challenge code: ${challengeCode}`);

  // 6. Responder Submit Evidence -> 201
  console.log('Test 6: Responder submitting evidence');
  const res6 = await request(app)
    .post(`/api/bounties/${bountyId}/submit-evidence`)
    .set('Authorization', `Bearer ${responderToken}`)
    .send({
      mediaUrl: 'https://example.com/evidence.webm',
      challengeCode,
      checklistFulfilledIds: ['chk_1', 'chk_2'],
      reusableConsent: true
    });
  assert.strictEqual(res6.status, 201);
  const submissionId = res6.body.submission.id;
  console.log(`  ✅ Submitted evidence ${submissionId}`);

  // 7. Moderator Review & Approval -> 200
  console.log('Test 7: Moderator review & approval');
  const res7 = await request(app)
    .post(`/api/moderator/evidence/${submissionId}/review`)
    .set('Authorization', `Bearer ${moderatorToken}`)
    .send({
      decision: 'approve',
      notes: 'Proof verified.'
    });
  assert.strictEqual(res7.status, 200);
  assert.strictEqual(res7.body.bounty.state, 'payout_pending');
  console.log('  ✅ Moderator review approved');

  console.log('\n========================================================');
  console.log('🎉 FACTBOUNTY HTTP API & AUTH TEST SUITE PASSED');
  console.log('========================================================\n');
}

testApi().catch(err => {
  console.error('❌ API Test Failed:', err);
  process.exit(1);
});
