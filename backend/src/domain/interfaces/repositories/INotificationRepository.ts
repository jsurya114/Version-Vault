import { INotification } from '../INotification';
import { IBaseRepository } from './IBaseRepository';

import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

export interface INotificationRepository extends IBaseRepository<INotification> {
  findByRecipient(
    recipientId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<INotification>>;
  markAsRead(id: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string): Promise<void>;
  countUnread(recipientId: string): Promise<number>;
}
