import { RootState } from '../../app/store';

import { createSelector } from '@reduxjs/toolkit';
// export const selectCompareData = (state: RootState) => state.commits.data;
// export const selectCompareLoading = (state: RootState) => state.commits.isLoading;
// export const selectCompareError = (state: RootState) => state.commits.error;

const selectBaseState = (state: RootState) => state.commits;

export const selectCompareData = createSelector([selectBaseState], (state) => state.data);
export const selectCompareLoading = createSelector([selectBaseState], (state) => state.isLoading);
export const selectCompareError = createSelector([selectBaseState], (state) => state.error);
