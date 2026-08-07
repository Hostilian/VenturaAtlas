/**
 * FactBounty Full-Stack REST API Express Application
 */
import express from 'express';
import path from 'path';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { LocalPaymentSimulator } from '../simulators/payment-simulator';
import { StripePaymentAdapter } from '../payments/stripe-adapter';

const app = express();
app.use(express.json());

const engine = new FactBountyEngine();
const localPaymentSim = new LocalPaymentSimulator();
const stripeAdapter = new StripePaymentAdapter(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

function getPaymentProvider(useStripe: boolean = false) {
  return (useStripe && process.env.STRIPE_SECRET_KEY) ? stripeAdapter : localPaymentSim;
}

// ── Buyer Routes ─────────────────────────────────────────────────────────────
app.post('/api/bounties', (req, res) => {
  try {
    const { buyerId, productUrl, question, checklist, bountyAmount, productTitle } = req.body;
    const bounty = engine.createBounty(
      buyerId || 'usr_buyer_1',
      productUrl,
      question,
      checklist || ['Visual measurement', 'Connector presence', 'Package contents'],
      bountyAmount || 500,
      productTitle
    );
    res.status(201).json({ success: true, bounty });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bounties/:id/checkout', async (req, res) => {
  try {
    const bountyId = req.params.id;
    const bounty = engine.store.bounties.get(bountyId);
    if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });

    const provider = getPaymentProvider(req.body.useStripe);
    const checkout = await provider.createCheckout({
      bountyId,
      buyerId: bounty.buyerId,
      amountCents: bounty.bountyAmount,
      currency: 'EUR',
      productTitle: bounty.productTitle || 'Product Fact Bounty',
      successUrl: `http://localhost:3000/bounties/${bountyId}?status=success`,
      cancelUrl: `http://localhost:3000/bounties/${bountyId}?status=cancelled`,
      idempotencyKey: `idempotent_${bountyId}_${Date.now()}`
    });

    if (provider === localPaymentSim) {
      // Complete local simulation instantly for seamless testability
      await localPaymentSim.completeSimulatedPayment(checkout.paymentId);
      engine.fundBounty(bountyId, checkout.paymentId);
    }

    res.json({ success: true, checkout, bounty: engine.store.bounties.get(bountyId) });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/bounties/:id', (req, res) => {
  const bounty = engine.store.bounties.get(req.params.id);
  if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });
  res.json({ success: true, bounty });
});

// ── Responder Routes ─────────────────────────────────────────────────────────
app.get('/api/responder/requests', (req, res) => {
  const available = Array.from(engine.store.bounties.values()).filter(
    b => b.state === 'matching' || b.state === 'funded'
  );
  res.json({ success: true, requests: available });
});

app.post('/api/bounties/:id/accept', (req, res) => {
  try {
    const { responderId } = req.body;
    const result = engine.assignResponder(req.params.id, responderId || 'usr_resp_1');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bounties/:id/submit-evidence', (req, res) => {
  try {
    const { responderId, mediaUrl, challengeCode, checklistFulfilledIds, reusableConsent } = req.body;
    const submission = engine.submitEvidence(
      req.params.id,
      responderId || 'usr_resp_1',
      mediaUrl || 'https://storage.factbounty.local/evidence_sample.webm',
      challengeCode,
      checklistFulfilledIds || ['chk_1', 'chk_2'],
      reusableConsent !== false
    );
    res.status(201).json({ success: true, submission });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── Moderator Routes ─────────────────────────────────────────────────────────
app.get('/api/moderator/queue', (req, res) => {
  const queue = Array.from(engine.store.evidence.values()).filter(
    e => e.state === 'ready_for_review'
  );
  res.json({ success: true, queue });
});

app.post('/api/moderator/evidence/:id/review', (req, res) => {
  try {
    const { moderatorId, decision, notes } = req.body; // decision: 'approve' | 'request_correction' | 'reject'
    const result = engine.reviewSubmission(
      req.params.id,
      moderatorId || 'usr_mod_1',
      decision,
      notes
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/moderator/bounties/:id/release-payout', async (req, res) => {
  try {
    const bountyId = req.params.id;
    const bounty = engine.store.bounties.get(bountyId);
    if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });

    const provider = getPaymentProvider();
    const payout = await provider.releasePayout(
      bountyId,
      bounty.responderId || 'usr_resp_1',
      Math.round(bounty.bountyAmount * 0.7) // 70% share to responder
    );

    const updatedBounty = engine.processPayout(bountyId);
    res.json({ success: true, payout, bounty: updatedBounty });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── Allowed AI Assistance Endpoint (Non-Payout Decision Pre-screening) ───────
app.post('/api/ai/suggest-checklist', (req, res) => {
  const { question } = req.body;
  const suggested = [
    { id: 'chk_1', label: 'Clear unedited view of the physical product label/model number', required: true },
    { id: 'chk_2', label: 'Ruler or tape measure verifying exact physical dimensions', required: true },
    { id: 'chk_3', label: 'Display of live challenge code in frame', required: true }
  ];
  res.json({
    success: true,
    suggestedChecklist: suggested,
    model: 'factbounty-precheck-v1',
    confidence: 0.92,
    humanReviewStatus: 'required'
  });
});

// Serve Web Application UI
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`FactBounty API & Web Portal listening at http://localhost:${PORT}`);
  });
}
