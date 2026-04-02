import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.issue;

export const selectIssues = createSelector([selectBaseState], (state) => state.issues);
export const selectSelectedIssue = createSelector(
  [selectBaseState],
  (state) => state.selectedIssue,
);
export const selectIssueLoading = createSelector([selectBaseState], (state) => state.isLoading);
export const selectIssueError = createSelector([selectBaseState], (state) => state.error);
export const selectIssueMeta = createSelector([selectBaseState], (state) => state.meta);
