export type PRStatus = 'open' | 'closed' | 'merged';
export type MergeApproval = 'none' | 'pending' | 'approved' | 'rejected';

export interface IPullRequest {
  id?: string;
  title: string;
  prNumber?: number;
  description?: string;
  status: PRStatus;
  mergeApproval?: MergeApproval;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers?: string[];
  commentsCount: number;
  baseCommitHash?: string;
  headCommitHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
