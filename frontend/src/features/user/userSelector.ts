import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.user;

export const selectViewedUser = createSelector([selectBaseState], (state) => state.viewedUser);

export const selectUserLoading = createSelector([selectBaseState], (state) => state.isLoading);

export const selectUserError = createSelector([selectBaseState], (state) => state.error);
