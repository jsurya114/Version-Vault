import { PaginationMeta } from '../common/Pagination/paginationTypes';
import { RepositoryResponseDTO } from '../repository/repositoryTypes'; // Adjust path if needed

export interface AdminRepoState {
  repos: RepositoryResponseDTO[];
  selectedRepo: RepositoryResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  meta: PaginationMeta;
}

export const initialRepoState: AdminRepoState = {
  repos: [],
  selectedRepo: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  },
};
