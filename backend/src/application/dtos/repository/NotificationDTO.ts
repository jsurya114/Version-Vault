import { NotificationType } from '../../../domain/interfaces/INotification';
export interface NotifyParams {
  recipientId: string;
  actorId: string;
  actorUsername: string;
  type: NotificationType;
  message: string;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: Record<string, string>;
}
export interface NotifyRepoParams {
  actorId: string;
  actorUsername: string;
  type: NotificationType;
  message: string;
  repositoryId: string;
  repositoryName?: string;
  metadata?: Record<string, string>;
}
