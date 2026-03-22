export type IssueStatus = 'open' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface IIssue {
  id?: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  assignees?: string[];
  labels?: string[];
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
