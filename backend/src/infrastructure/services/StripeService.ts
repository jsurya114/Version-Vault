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
      // Find all customers by email (Stripe allows duplicates)
      const customers = await this.stripe.customers.list({
        email: email.toLowerCase(),
        limit: 10, // Get multiple in case of duplicates
      });

      if (customers.data.length === 0) {
        return { isActive: false };
      }

      // Check each customer for an active subscription
      for (const customer of customers.data) {
        const customerId = customer.id;

        const subscriptions = await this.stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 10,
        });

        const activeSub = subscriptions.data.find(
          (sub) => sub.status === 'active' || sub.status === 'trialing',
        );

        if (activeSub) {
          return {
            isActive: true,
            customerId: customerId,
            subscriptionId: activeSub.id,
          };
        }
      }

      return { isActive: false };
    } catch (error) {
      console.error('Failed to verify active subscription in Stripe:', error);
      return { isActive: false };
    }
  }
}
