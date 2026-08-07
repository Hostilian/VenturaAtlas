/**
 * Local Payment Simulator — Zero-Dependency Payment Testing
 */
import {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PaymentEvent,
  RefundResult,
  PayoutResult
} from '../shared/contracts/payment-provider';

export class LocalPaymentSimulator implements PaymentProvider {
  private transactions: Map<string, any> = new Map();
  private webhooks: PaymentEvent[] = [];

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const paymentId = `sim_pay_${Math.random().toString(36).substring(2, 10)}`;
    const tx = {
      paymentId,
      ...params,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.transactions.set(paymentId, tx);

    // Simulated checkout URL
    const sessionUrl = `/simulator/checkout?paymentId=${paymentId}&bountyId=${params.bountyId}`;
    return {
      sessionUrl,
      paymentId,
      status: 'pending'
    };
  }

  async completeSimulatedPayment(paymentId: string): Promise<PaymentEvent> {
    const tx = this.transactions.get(paymentId);
    if (!tx) throw new Error(`Payment ${paymentId} not found in simulator`);

    tx.status = 'succeeded';
    const event: PaymentEvent = {
      id: `evt_${Math.random().toString(36).substring(2, 10)}`,
      type: 'payment_intent.succeeded',
      bountyId: tx.bountyId,
      paymentId: tx.paymentId,
      amountCents: tx.amountCents,
      idempotencyKey: tx.idempotencyKey,
      timestamp: new Date().toISOString()
    };
    this.webhooks.push(event);
    return event;
  }

  async verifyWebhook(payload: any): Promise<PaymentEvent> {
    if (typeof payload === 'string') payload = JSON.parse(payload);
    return payload as PaymentEvent;
  }

  async refund(bountyId: string, paymentId: string, amountCents: number): Promise<RefundResult> {
    const refundId = `sim_ref_${Math.random().toString(36).substring(2, 10)}`;
    return {
      refundId,
      bountyId,
      amountCents,
      status: 'succeeded'
    };
  }

  async releasePayout(bountyId: string, responderId: string, amountCents: number): Promise<PayoutResult> {
    const payoutId = `sim_po_${Math.random().toString(36).substring(2, 10)}`;
    return {
      payoutId,
      responderId,
      amountCents,
      status: 'succeeded'
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    const tx = this.transactions.get(paymentId);
    return tx ? tx.status : 'not_found';
  }
}
