import express, { Express } from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { FactBountyConfig } from '../config';
import { createAuthMiddleware } from './auth';
import { requireRole } from './roles';
import {
  validateBody,
  CreateBountySchema,
  CheckoutBountySchema,
  AcceptBountySchema,
  SubmitEvidenceSchema,
  ReviewEvidenceSchema,
  SuggestChecklistSchema
} from './validation';
import { LocalPaymentSimulator } from '../simulators/payment-simulator';
import { StripePaymentAdapter } from '../payments/stripe-adapter';

export interface AppDependencies {
  engine: FactBountyEngine;
  config: FactBountyConfig;
}

export function createApp(dependencies: AppDependencies): Express {
  const { engine, config } = dependencies;
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, error: 'Too many requests' }
  });
  app.use('/api/', apiLimiter);

  const auth = createAuthMiddleware(config);

  const localSim = new LocalPaymentSimulator();
  const stripeAdapter = new StripePaymentAdapter(config.STRIPE_SECRET_KEY || 'sk_test_placeholder');

  function getPaymentProvider() {
    return config.PAYMENT_PROVIDER === 'stripe' ? stripeAdapter : localSim;
  }

  // ── Buyer Routes ─────────────────────────────────────────────────────────────
  app.post('/api/bounties', auth, requireRole('buyer', 'admin'), validateBody(CreateBountySchema), (req, res) => {
    try {
      const buyerId = req.user!.userId;
      const { productUrl, question, checklist, bountyAmount, productTitle } = req.body;
      const bounty = engine.createBounty(buyerId, productUrl, question, checklist, bountyAmount, productTitle);
      res.status(201).json({ success: true, bounty });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/bounties/:id/checkout', auth, requireRole('buyer', 'admin'), validateBody(CheckoutBountySchema), async (req, res) => {
    try {
      const bountyId = req.params['id'] ? String(req.params['id']) : '';
      const bounty = engine.store.bounties.get(bountyId);
      if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });
      if (bounty.buyerId !== req.user!.userId && !req.user!.roles.includes('admin')) {
        return res.status(403).json({ success: false, error: 'Forbidden: Not bounty owner' });
      }

      // Provider selection is server-owned. A buyer request cannot switch to
      // the simulator or bypass the configured payment path.
      const provider = getPaymentProvider();
      const checkout = await provider.createCheckout({
        bountyId,
        buyerId: bounty.buyerId,
        amountCents: bounty.bountyAmount,
        currency: 'EUR',
        productTitle: bounty.productTitle || 'Product Fact Bounty',
        successUrl: `${config.FACTBOUNTY_PUBLIC_BASE_URL}/bounties/${bountyId}?status=success`,
        cancelUrl: `${config.FACTBOUNTY_PUBLIC_BASE_URL}/bounties/${bountyId}?status=cancelled`,
        idempotencyKey: `idempotent_${bountyId}`
      });

      if (provider === localSim) {
        await localSim.completeSimulatedPayment(checkout.paymentId);
        engine.fundBounty(bountyId, checkout.paymentId);
      }

      res.json({ success: true, checkout, bounty: engine.store.bounties.get(bountyId) });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.get('/api/bounties/:id', auth, (req, res) => {
    const bountyId = req.params['id'] ? String(req.params['id']) : '';
    const bounty = engine.store.bounties.get(bountyId);
    if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });
    res.json({ success: true, bounty });
  });

  // ── Responder Routes ─────────────────────────────────────────────────────────
  app.get('/api/responder/requests', auth, requireRole('responder', 'admin'), (req, res) => {
    const available = Array.from(engine.store.bounties.values()).filter(
      b => b.state === 'matching' || b.state === 'funded'
    );
    res.json({ success: true, requests: available });
  });

  app.post('/api/bounties/:id/accept', auth, requireRole('responder', 'admin'), validateBody(AcceptBountySchema), (req, res) => {
    try {
      const bountyId = req.params['id'] ? String(req.params['id']) : '';
      const responderId = req.user!.userId;
      const result = engine.assignResponder(bountyId, responderId);
      res.json({ success: true, bounty: result.bounty, challengeCode: result.challengeCode });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/bounties/:id/submit-evidence', auth, requireRole('responder', 'admin'), validateBody(SubmitEvidenceSchema), (req, res) => {
    try {
      const bountyId = req.params['id'] ? String(req.params['id']) : '';
      const responderId = req.user!.userId;
      const { mediaUrl, challengeCode, checklistFulfilledIds, reusableConsent } = req.body;

      const submission = engine.submitEvidence(
        bountyId,
        responderId,
        mediaUrl || `${config.FACTBOUNTY_PUBLIC_BASE_URL}/media/sample.webm`,
        challengeCode,
        checklistFulfilledIds,
        reusableConsent !== false
      );
      res.status(201).json({ success: true, submission });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ── Moderator Routes ─────────────────────────────────────────────────────────
  app.get('/api/moderator/queue', auth, requireRole('moderator', 'admin'), (req, res) => {
    const queue = Array.from(engine.store.evidence.values()).filter(
      e => e.state === 'ready_for_review'
    );
    res.json({ success: true, queue });
  });

  app.post('/api/moderator/evidence/:id/review', auth, requireRole('moderator', 'admin'), validateBody(ReviewEvidenceSchema), (req, res) => {
    try {
      const evidenceId = req.params['id'] ? String(req.params['id']) : '';
      const moderatorId = req.user!.userId;
      const { decision, notes } = req.body;
      const result = engine.reviewSubmission(evidenceId, moderatorId, decision, notes);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/moderator/bounties/:id/release-payout', auth, requireRole('moderator', 'admin'), async (req, res) => {
    try {
      const bountyId = req.params['id'] ? String(req.params['id']) : '';
      const bounty = engine.store.bounties.get(bountyId);
      if (!bounty) return res.status(404).json({ success: false, error: 'Bounty not found' });
      if (bounty.state !== 'approved' && bounty.state !== 'payout_pending') {
        return res.status(400).json({ success: false, error: 'Bounty state not eligible for payout release' });
      }

      const provider = getPaymentProvider();
      const payout = await provider.releasePayout(
        bountyId,
        bounty.responderId || 'usr_resp_1',
        Math.round(bounty.bountyAmount * 0.7)
      );

      const updatedBounty = engine.processPayout(bountyId);
      res.json({ success: true, payout, bounty: updatedBounty });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ── AI Assistance Endpoint ───────────────────────────────────────────────────
  app.post('/api/ai/suggest-checklist', auth, validateBody(SuggestChecklistSchema), (req, res) => {
    const suggested = [
      { id: 'chk_1', label: 'Clear unedited view of the physical product label/model number', required: true },
      { id: 'chk_2', label: 'Ruler or tape measure verifying exact physical dimensions', required: true },
      { id: 'chk_3', label: 'Display of live challenge code in frame', required: true }
    ];
    res.json({
      success: true,
      suggestedChecklist: suggested,
      method: 'static-demo-checklist',
      confidence: null,
      note: 'No AI model was invoked for this demo response.',
      humanReviewStatus: 'required'
    });
  });

  // Serve Web Application UI
  app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

  return app;
}
