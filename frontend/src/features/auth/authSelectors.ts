import type { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.auth;

export const selectAuthLoading = createSelector([selectBaseState], (state) => state.isLoading);
export const selectAuthError = createSelector([selectBaseState], (state) => state.error);
export const selectAuthSuccessMessage = createSelector(
  [selectBaseState],
  (state) => state.successMessage,
);
export const selectRegisteredEmail = createSelector(
  [selectBaseState],
  (state) => state.registeredEmail,
);
export const selectIsAuthenticated = createSelector(
  [selectBaseState],
  (state) => state.isAuthenticated,
);

export const selectAuthUser = createSelector([selectBaseState], (state) => state.user);
