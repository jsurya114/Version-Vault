export interface IssuesResponseDTO {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  assignees: string[];
  labels: string[];
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateIssueDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  labels?: string[];
  assignees?: string[];
}
