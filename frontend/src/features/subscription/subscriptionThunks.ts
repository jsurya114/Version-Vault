import { createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionService } from '../../services/subscription.service';
import { CheckoutResponse, SubscriptionStatus } from '../../types/subscription/subscriptionTypes';

export const getSubscriptionStatusThunk = createAsyncThunk<SubscriptionStatus>(
  'subscription/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscription status');
    }
  },
);

export const createCheckoutThunk = createAsyncThunk<CheckoutResponse>(
  'subscription/createCheckout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.createCheckoutSession();
      if (response.data.url) {
        window.location.href = response.data.url;
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to initiate checkout');
    }
  },
);

export const cancelSubscriptionThunk = createAsyncThunk<void>(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      await subscriptionService.cancelSubscription();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel subscription');
    }
  },
);
