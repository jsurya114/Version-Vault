export interface PullRequestResponseDTO {
  id: string;
  title: string;
  description?: string;
  prNumber?: number;
  status: string;
  mergeApproval?: string;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers: string[];
  commentsCount: number;
  baseCommitHash?: string;
  headCommitHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePullRequestDTO {
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  baseCommitHash?: string;
  headCommitHash?: string;
}
