import { RootState } from 'src/app/store';

export const selectIssues = (state: RootState) => state.issue.issues;
export const selectSelectedIssue = (state: RootState) => state.issue.selectedIssue;
export const selectIssueLoading = (state: RootState) => state.issue.isLoading;
export const selectIssueError = (state: RootState) => state.issue.error;
export const selectIssueMeta = (state: RootState) => state.issue.meta;
