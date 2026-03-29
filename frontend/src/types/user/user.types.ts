import { UserResponseDTO } from '../admin/adminTypes';

export interface UserState {
  viewedUser: UserResponseDTO | null;
  isLoading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  viewedUser: null,
  isLoading: false,
  error: null,
};
