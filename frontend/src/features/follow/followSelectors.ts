import { RootState } from '../../app/store';

export const selectFollowers = (state: RootState) => state.follow.followers;
export const selectFollowing = (state: RootState) => state.follow.following;
export const selectFollowLoading = (state: RootState) => state.follow.isLoading;
export const selectFollowError = (state: RootState) => state.follow.error;
