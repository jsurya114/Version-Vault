export interface RepositoryResponseDTO {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string;
  ownerUsername: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  size: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRepositoryDTO {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
}

export interface RepositoryState {
  repositories: RepositoryResponseDTO[];
  selectedRepository: RepositoryResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const repositoryInitialState: RepositoryState = {
  repositories: [],
  selectedRepository: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export interface RepoParams {
  username: string;
  reponame: string;
}
