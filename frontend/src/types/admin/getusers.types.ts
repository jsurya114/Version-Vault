import { UserResponseDTO } from "./adminTypes";

export interface AdminState {
  users: UserResponseDTO[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: AdminState = {
  users: [],
  isLoading: false,
  error: null,
};