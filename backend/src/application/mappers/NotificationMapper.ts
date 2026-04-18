import { INotification } from '../../domain/interfaces/INotification';

export class NotificationMapper {
  static toEntity(doc: unknown): INotification {
    const d = doc as INotification & { _id?: { toString(): string } };
    return {
      id: d.id?.toString() || d._id?.toString() || '',
      recipientId: d.recipientId,
      actorId: d.actorId,
      actorUsername: d.actorUsername,
      type: d.type,
      message: d.message,
      repositoryId: d.repositoryId,
      metadata: d.metadata,
      isRead: d.isRead,
      createdAt: d.createdAt,
    };
  }
}
