import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/constants/tokens';
import { INotificationRepository } from '../../../domain/interfaces/repositories/INotificationRepository';
import { IMarkAllReadUseCase } from '../interfaces/notification/IMarkAllReadUseCase';

injectable();
export class MarkAllReadUseCase implements IMarkAllReadUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository) private _notificationRepo: INotificationRepository,
  ) {}

  async execute(recipientId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(recipientId);
  }
}
