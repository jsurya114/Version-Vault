import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TOKENS } from '../../../../shared/constants/tokens';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { IGetNotificationsUseCase } from '../../../../application/use-cases/interfaces/notification/IGetNotificationsUseCase';
import { IMarkNotificationReadUseCase } from '../../../../application/use-cases/interfaces/notification/IMarNotificationReadUseCase';
import { IMarkAllReadUseCase } from '../../../../application/use-cases/interfaces/notification/IMarkAllReadUseCase';
import { INotificationRepository } from '../../../../domain/interfaces/repositories/INotificationRepository';
import { AuthRequest } from '../repository/RepositoryController';

@injectable()
export class NotificationController {
  constructor(
    @inject(TOKENS.IGetNotificationsUseCase) private _getNotifications: IGetNotificationsUseCase,
    @inject(TOKENS.IMarkNotificationReadUseCase) private _markRead: IMarkNotificationReadUseCase,
    @inject(TOKENS.IMarkAllReadUseCase) private _markAllRead: IMarkAllReadUseCase,
    @inject(TOKENS.INotificationRepository) private _notifRepo: INotificationRepository,
  ) {}
  // GET /vv/notifications
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const query = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sort: 'createdAt',
        order: 'desc' as const,
      };
      const result = await this._getNotifications.execute(userId, query);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/notifications/unread-count
  async unreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const count = await this._notifRepo.countUnread(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
  // PATCH /vv/notifications/:id/read
  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await this._markRead.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
  // PATCH /vv/notifications/read-all
  async markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      await this._markAllRead.execute(userId);
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
