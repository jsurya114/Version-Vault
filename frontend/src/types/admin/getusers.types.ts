import { UserResponseDTO } from './adminTypes';

export interface AdminState {
  users: UserResponseDTO[];
  selectedUser: UserResponseDTO | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AdminState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};
