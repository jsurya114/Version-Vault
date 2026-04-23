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
  | 'repo_starred'
  | 'branch_updated';

export interface INotification {
  id?: string;
  recipientId: string;
  actorId: string;
  actorUsername: string;
  type: NotificationType;
  message: string;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt?: Date;
}
