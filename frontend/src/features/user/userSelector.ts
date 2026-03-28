import { RootState } from '../../app/store';

const selectUserState = (state: RootState) => state.user;
export const selectViewedUser = (state: RootState) => selectUserState(state).viewedUser;
export const selectUserLoading = (state: RootState) => selectUserState(state).isLoading;
export const selectUserError = (state: RootState) => selectUserState(state).error;
