/**
 * Payment Provider Abstraction Interface
 */

export interface CheckoutParams {
  bountyId: string;
  buyerId: string;
  amountCents: number;
  currency: string;
  productTitle: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface CheckoutResult {
  sessionUrl: string;
  paymentId: string;
  status: 'pending' | 'succeeded';
}

export interface PaymentEvent {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.failed' | 'charge.refunded';
  bountyId: string;
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
  timestamp: string;
}

export interface RefundResult {
  refundId: string;
  bountyId: string;
  amountCents: number;
  status: 'succeeded' | 'failed';
}

export interface PayoutResult {
  payoutId: string;
  responderId: string;
  amountCents: number;
  status: 'succeeded' | 'failed';
}

export interface PaymentProvider {
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  verifyWebhook(payload: string | Record<string, any>, signature?: string): Promise<PaymentEvent>;
  refund(bountyId: string, paymentId: string, amountCents: number): Promise<RefundResult>;
  releasePayout(bountyId: string, responderId: string, amountCents: number): Promise<PayoutResult>;
  getPaymentStatus(paymentId: string): Promise<string>;
}
