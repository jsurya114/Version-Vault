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
  isBlocked: boolean;
  isFork: boolean;
  parentRepoId: string;
  parentRepoOwnerUsername?: string;
  starredBy?: string[];
  createdAt?: string;
  updatedAt?: string;
  language?: string;
  languageColor?: string;
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
  recursive?: boolean;
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
export interface GitBranch {
  name: string;
  lastCommitDate?: string;
  lastCommitAuthor?: string;
  lastCommitAuthorEmail?: string;
  lastCommitMessage?: string;
  current?: boolean;
  status?: 'success' | 'failure' | 'pending' | 'none';
  check?: string;
  checks?: string;
  ahead?: number;
  behind?: number;
  prId?: string;
  prNumber?: number;
  prStatus?: 'open' | 'closed' | 'merged';
}

export interface GitFileEntry {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  lastCommitMessage?: string;
  lastCommitDate?: string;
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
  allFiles: GitFileEntry[];
  fileContent: string;
  commits: GitCommit[];
  branches: GitBranch[];
  isLoading: boolean;
  isFilesLoading: boolean;
  isCommitsLoading: boolean;
  isForking: boolean;
  forkError: string | null;
  isStarring: boolean;
  starError: string | null;
  error: string | null;
  isUploading: boolean;
  uploadError: string | null;
  activeBranches: GitBranch[];
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
  allFiles: [],
  fileContent: '',
  commits: [],
  branches: [],
  isLoading: false,
  isFilesLoading: false,
  isCommitsLoading: false,
  isForking: false,
  forkError: null,
  isStarring: false,
  starError: null,
  error: null,
  isUploading: false,
  uploadError: null,
  activeBranches: [],
  meta: {
    total: 0,
    page: 1,
    limit: 2,
    totalPages: 0,
  },
};

export interface ForkRepoPayload {
  username: string;
  reponame: string;
}

export interface ToggleStarPayload {
  username: string;
  reponame: string;
}

export interface ToggleStarResponse {
  isStarred: boolean;
  starsCount: number;
}
