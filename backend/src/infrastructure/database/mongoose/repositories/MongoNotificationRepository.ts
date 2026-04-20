import { injectable } from 'tsyringe';
import { MongoBaseRepository } from './MongoBaseRepository';
import { INotification } from '../../../../domain/interfaces/INotification';
import { INotificationRepository } from '../../../../domain/interfaces/repositories/INotificationRepository';
import { NotificationModel } from '../models/NotificationModel';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { NotificationMapper } from '../../../../application/mappers/NotificationMapper';

@injectable()
export class MongoNotificationRepository
  extends MongoBaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }
  protected toEntity(doc: unknown): INotification {
    return NotificationMapper.toEntity(doc);
  }
  async findByRecipient(
    recipientId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<INotification>> {
    return this.findWithpagination({ recipientId }, query);
  }
  async markAsRead(id: string): Promise<INotification | null> {
    return this.update(id, { isRead: true } as Partial<INotification>);
  }
  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany({ recipientId, isRead: false }, { isRead: true });
  }

  async countUnread(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({ recipientId, isRead: false });
  }
}
