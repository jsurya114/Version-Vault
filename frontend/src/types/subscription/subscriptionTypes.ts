export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionHTTPResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SubscriptionState {
  status: SubscriptionStatus;
  loading: boolean;
  error: string | null;
}

export const initialState: SubscriptionState = {
  status: {
    plan: 'free',
    isActive: false,
  },
  loading: false,
  error: null,
};
