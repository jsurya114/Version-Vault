export interface IPaymentService {
  createCheckoutSession(
    customerId: string | undefined,
    email: string,
    priceId: string,
    userId: string,
  ): Promise<{ url: string; sessionId: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  verifyWebhookSignature(payload: Buffer, signature: string): unknown;
  verifyActiveSubscription(
    userId: string,
    email: string,
  ): Promise<{ isActive: boolean; customerId?: string; subscriptionId?: string }>;
}
