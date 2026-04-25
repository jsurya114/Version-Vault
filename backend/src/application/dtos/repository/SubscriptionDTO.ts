export interface SubscriptionStatusDTO {
  plan: string;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CheckoutResponseDTO {
  url: string;
  sessionId: string;
}
