import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.adminusers;

export const selectAdminUsers = createSelector([selectBaseState], (state) => state.users);
export const selectSelectedUser = createSelector([selectBaseState], (state) => state.selectedUser);
export const selectAdminLoading = createSelector([selectBaseState], (state) => state.isLoading);
export const selectAdminError = createSelector([selectBaseState], (state) => state.error);
export const selectAdminMeta = createSelector([selectBaseState], (state) => state.meta);
