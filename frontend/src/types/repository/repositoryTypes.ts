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

export interface RepoParams {
  username: string;
  reponame: string;
}

export interface GetFilesParams {
  username: string;
  reponame: string;
  branch?: string;
  path?: string;
}

export interface GetFileContentParams {
  username: string;
  reponame: string;
  filePath: string;
  branch?: string;
}

export interface GetCommitsParams {
  username: string;
  reponame: string;
  branch?: string;
  limit?: number;
}

export interface GitFileEntry {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface RepositoryState {
  repositories: RepositoryResponseDTO[];
  selectedRepository: RepositoryResponseDTO | null;
  files: GitFileEntry[];
  fileContent: string;
  commits: GitCommit[];
  isLoading: boolean;
  isFilesLoading: boolean;
  isCommitsLoading: boolean;
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
  files: [],
  fileContent: '',
  commits: [],
  isLoading: false,
  isFilesLoading: false,
  isCommitsLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};
