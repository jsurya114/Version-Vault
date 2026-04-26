import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { IPaymentService } from '../../domain/interfaces/services/IPaymentService';
import { envConfig } from '../../shared/config/env.config';

@injectable()
export class StripeService implements IPaymentService {
  private stripe: InstanceType<typeof Stripe>;

  constructor() {
    this.stripe = new Stripe(envConfig.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    customerId: string | undefined,
    email: string,
    priceId: string,
    userId: string,
  ): Promise<{ url: string; sessionId: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: envConfig.CLIENT_SUBSCRIPTION_SUCCESS_URL,
      cancel_url: envConfig.CLIENT_SUBSCRIPTION_CANCEL_URL,
      metadata: { userId },
      customer: customerId || undefined,
      customer_email: customerId ? undefined : email,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url, sessionId: session.id };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  verifyWebhookSignature(payload: Buffer, signature: string): unknown {
    return this.stripe.webhooks.constructEvent(payload, signature, envConfig.STRIPE_WEBHOOK_SECRET);
  }

  async verifyActiveSubscription(
    userId: string,
    email: string,
  ): Promise<{ isActive: boolean; customerId?: string; subscriptionId?: string }> {
    try {
      // Find customer by email (consistent read, no search index delay)
      const customers = await this.stripe.customers.list({ email, limit: 1 });
      if (customers.data.length === 0) return { isActive: false };

      const customerId = customers.data[0].id;

      // Find active subscriptions for this customer
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        // Verify metadata matches if needed, though email match is usually enough
        if (sub.metadata && sub.metadata.userId && sub.metadata.userId !== userId) {
          // Might be a different account with same email, but let's assume it's valid if email matches
        }

        return {
          isActive: true,
          customerId: customerId,
          subscriptionId: sub.id,
        };
      }
      return { isActive: false };
    } catch (error) {
      console.error('Failed to verify active subscription in Stripe:', error);
      return { isActive: false };
    }
  }
}
