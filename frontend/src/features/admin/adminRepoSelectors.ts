import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.adminRepos;

export const selectAdminRepos = createSelector([selectBaseState], (state) => state.repos);
export const selectAdminReposLoading = createSelector(
  [selectBaseState],
  (state) => state.isLoading,
);
export const selectAdminReposError = createSelector([selectBaseState], (state) => state.error);
export const selectAdminReposMeta = createSelector([selectBaseState], (state) => state.meta);
export const selectAdminSelectedRepo = createSelector(
  [selectBaseState],
  (state) => state.selectedRepo,
);
