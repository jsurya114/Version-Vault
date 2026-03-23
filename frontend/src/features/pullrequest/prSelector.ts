import { RootState } from 'src/app/store';

export const selectPRs = (state: RootState) => state.pullrequest.prs;
export const selectSelectedPR = (state: RootState) => state.pullrequest.selectedPR;
export const selectPRLoading = (state: RootState) => state.pullrequest.isLoading;
export const selectPRError = (state: RootState) => state.pullrequest.error;
export const selectPRMeta = (state: RootState) => state.pullrequest.meta;
