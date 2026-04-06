import { RootState } from '../../app/store';

export const selectComments = (state: RootState) => state.comments.comments;

export const selectCommentsLoading = (state: RootState) => state.comments.isLoading;

export const selectCommentsError = (state: RootState) => state.comments.error;

export const selectCommentsMeta = (state: RootState) => state.comments.meta;
