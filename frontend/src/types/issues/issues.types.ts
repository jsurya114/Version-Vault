export type IssueStatus = 'open' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface IssueResponseDTO {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  assignees: string[];
  labels: string[];
  commentsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssueDTO {
  title: string;
  description?: string;
  priority?: IssuePriority;
  labels?: string[];
}

export interface IssueState {
  issues: IssueResponseDTO[];
  selectedIssue: IssueResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const issueInitialState: IssueState = {
  issues: [],
  selectedIssue: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 2,
    totalPages: 0,
  },
};

export interface IssueParams {
  username: string;
  reponame: string;
}

export interface IssueIdParams extends IssueParams {
  id: string;
}

export interface ListIssuesParams extends IssueParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
