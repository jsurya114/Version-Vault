import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.pullrequest;
export const selectPRs = createSelector([selectBaseState], (state) => state.prs);
export const selectSelectedPR = createSelector([selectBaseState], (state) => state.selectedPR);
export const selectPRLoading = createSelector([selectBaseState], (state) => state.isLoading);
export const selectPRError = createSelector([selectBaseState], (state) => state.error);
export const selectPRMeta = createSelector([selectBaseState], (state) => state.meta);

export const selectConflicts = createSelector([selectBaseState], (state) => state.conflicts);
export const selectConflictLoading = createSelector(
  [selectBaseState],
  (state) => state.isConflictLoading,
);
export const selectIsResolving = createSelector([selectBaseState], (state) => state.isResolving);
