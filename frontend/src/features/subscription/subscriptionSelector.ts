import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.subscription;
export const selectSubscriptionStatus = createSelector([selectBaseState], (state) => state.status);
export const selectIsPro = createSelector(
  [selectBaseState],
  (state) => state.status.plan === 'pro' || state.status.isActive,
);
export const selectSubscriptionLoading = createSelector(
  [selectBaseState],
  (state) => state.loading,
);
export const selectSubscriptionError = createSelector([selectBaseState], (state) => state.error);
