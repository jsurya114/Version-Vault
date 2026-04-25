import { SUBSCRIPTION_ENDPOINTS } from '../constants/api';
import {
  CheckoutResponse,
  SubscriptionHTTPResponse,
  SubscriptionStatus,
} from '../types/subscription/subscriptionTypes';
import axiosInstance from './axiosInstance';

export const subscriptionService = {
  createCheckoutSession: async (): Promise<SubscriptionHTTPResponse<CheckoutResponse>> => {
    const res = await axiosInstance.post(SUBSCRIPTION_ENDPOINTS.CHECKOUT);
    return res.data;
  },
  getSubscriptionStatus: async (): Promise<SubscriptionHTTPResponse<SubscriptionStatus>> => {
    const res = await axiosInstance.get(SUBSCRIPTION_ENDPOINTS.STATUS);
    return res.data;
  },
  cancelSubscription: async (): Promise<SubscriptionHTTPResponse<void>> => {
    const res = await axiosInstance.post(SUBSCRIPTION_ENDPOINTS.CANCEL);
    return res.data;
  },
};
