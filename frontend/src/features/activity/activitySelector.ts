import { RootState } from '../../app/store';

export const selectActivityFeed = (state: RootState) => state.activity.feed;
export const selectActivityLoading = (state: RootState) => state.activity.isLoading;
