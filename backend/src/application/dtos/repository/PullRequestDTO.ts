export interface PullRequestResponseDTO {
  id: string;
  title: string;
  description?: string;
  status: string;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers: string[];
  commentsCount: number;
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
}
