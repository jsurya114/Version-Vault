export type PRStatus = 'open' | 'closed' | 'merged';
export type MergeApproval = 'none' | 'pending' | 'approved' | 'rejected';

export interface PRResponseDTO {
  id: string;
  prNumber?: number;
  title: string;
  description?: string;
  status: PRStatus;
  mergeApproval: MergeApproval;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers: string[];
  commentsCount: number;
  baseCommitHash: string;
  headCommitHash: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePRDTO {
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
}

export interface PRState {
  prs: PRResponseDTO[];
  selectedPR: PRResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const prInitialState: PRState = {
  prs: [],
  selectedPR: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 2,
    totalPages: 0,
  },
};

export interface PRParams {
  username: string;
  reponame: string;
}

export interface PRIdParams extends PRParams {
  id: string;
}

export interface ListPRsParams extends PRParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
