export type NotificationType =
  | 'chat_message'
  | 'branch_created'
  | 'branch_deleted'
  | 'pr_created'
  | 'pr_merged'
  | 'pr_closed'
  | 'issue_created'
  | 'issue_closed'
  | 'file_added'
  | 'file_deleted'
  | 'new_commit'
  | 'followed'
  | 'unfollowed'
  | 'repo_forked'
  | 'repo_starred';

export interface NotificationDTO {
  id: string;
  recipientId: string;
  actorId: string;
  actorUsername: string;
  type: NotificationType;
  message: string;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationInitialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
};
