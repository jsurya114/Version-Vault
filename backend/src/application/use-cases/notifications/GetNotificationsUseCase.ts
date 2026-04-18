import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/constants/tokens';
import { INotificationRepository } from '../../../domain/interfaces/repositories/INotificationRepository';
import { IGetNotificationsUseCase } from '../interfaces/notification/IGetNotificationsUseCase';
import { PaginatedResponseDTO, PaginationQueryDTO } from '../../dtos/reusable/PaginationDTO';
import { INotification } from '../../../domain/interfaces/INotification';

@injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(
    @inject(TOKENS.INotificationRepository) private _notificationRepo: INotificationRepository,
  ) {}

  async execute(
    recipientId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<INotification>> {
    return this._notificationRepo.findByRecipient(recipientId, query);
  }
}
