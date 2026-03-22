export type PRStatus = 'open' | 'closed' | 'merged';

export interface IPullRequest {
  id?: string;
  title: string;
  description?: string;
  status: PRStatus;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers?: string[];
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
