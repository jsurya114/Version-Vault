import { RootState } from '../../app/store';

export const selectCompareData = (state: RootState) => state.commits.data;
export const selectCompareLoading = (state: RootState) => state.commits.isLoading;
export const selectCompareError = (state: RootState) => state.commits.error;
