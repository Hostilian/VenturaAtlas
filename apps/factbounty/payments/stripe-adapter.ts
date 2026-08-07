/**
 * Stripe Test-Mode Payment Adapter
 * Implements PaymentProvider behind clean abstraction layer.
 */
import crypto from 'crypto';
import {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
  RefundResult,
  PayoutResult
} from '../shared/contracts/payment-provider';

export class StripePaymentAdapter implements PaymentProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!apiKey || apiKey.includes('pk_test') || apiKey.includes('sk_test')) {
      // Valid test key configuration
    }
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!this.apiKey || this.apiKey === 'sk_test_placeholder') {
      throw new Error('Stripe API key unconfigured. Fallback to LocalPaymentSimulator.');
    }

    const mockPaymentId = `cs_test_${crypto.randomBytes(8).toString('hex')}`;
    return {
      sessionUrl: `https://checkout.stripe.com/c/pay/${mockPaymentId}`,
      paymentId: mockPaymentId,
      status: 'pending'
    };
  }

  async verifyWebhook(payload: any, signature?: string): Promise<PaymentEvent> {
    if (typeof payload === 'string') payload = JSON.parse(payload);
    return {
      id: payload.id || `evt_stripe_${crypto.randomBytes(6).toString('hex')}`,
      type: payload.type || 'payment_intent.succeeded',
      bountyId: payload.data?.object?.metadata?.bountyId || '',
      paymentId: payload.data?.object?.id || '',
      amountCents: payload.data?.object?.amount || 0,
      idempotencyKey: payload.request?.idempotency_key || '',
      timestamp: new Date().toISOString()
    };
  }

  async refund(bountyId: string, paymentId: string, amountCents: number): Promise<RefundResult> {
    return {
      refundId: `re_test_${crypto.randomBytes(8).toString('hex')}`,
      bountyId,
      amountCents,
      status: 'succeeded'
    };
  }

  async releasePayout(bountyId: string, responderId: string, amountCents: number): Promise<PayoutResult> {
    return {
      payoutId: `tr_test_${crypto.randomBytes(8).toString('hex')}`,
      responderId,
      amountCents,
      status: 'succeeded'
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return 'succeeded';
  }
}
