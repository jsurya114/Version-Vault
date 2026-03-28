export interface UserState {
  viewedUser: any | null; // The user profile being looked at
  isLoading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  viewedUser: null,
  isLoading: false,
  error: null,
};
