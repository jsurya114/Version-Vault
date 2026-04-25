import { createSlice } from '@reduxjs/toolkit';
import { initialState } from '../../types/subscription/subscriptionTypes';
import {
  getSubscriptionStatusThunk,
  createCheckoutThunk,
  cancelSubscriptionThunk,
} from './subscriptionThunks';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: initialState,
  reducers: {
    resetSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Status
      .addCase(getSubscriptionStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(getSubscriptionStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Checkout
      .addCase(createCheckoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCheckoutThunk.fulfilled, (state) => {
        state.loading = false;
      })
      // Cancel
      .addCase(cancelSubscriptionThunk.fulfilled, (state) => {
        state.status = { plan: 'free', isActive: false };
      });
  },
});

export const { resetSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
