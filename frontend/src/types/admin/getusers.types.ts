import { PaginationMeta } from '../common/Pagination/paginationTypes';
import { UserResponseDTO } from './adminTypes';

export interface AdminState {
  users: UserResponseDTO[];
  selectedUser: UserResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  meta: PaginationMeta;
}

export const initialState: AdminState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};
