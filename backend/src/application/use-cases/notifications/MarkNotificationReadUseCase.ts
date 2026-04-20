import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/constants/tokens';
import { INotificationRepository } from '../../../domain/interfaces/repositories/INotificationRepository';
import { IMarkNotificationReadUseCase } from '../interfaces/notification/IMarNotificationReadUseCase';
import { INotification } from '../../../domain/interfaces/INotification';

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository) private _notificationRepo: INotificationRepository,
  ) {}

  async execute(notificationId: string): Promise<INotification | null> {
    return await this._notificationRepo.markAsRead(notificationId);
  }
}
