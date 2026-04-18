import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { INotification } from '../../../../domain/interfaces/INotification';

export interface IGetNotificationsUseCase {
  execute(
    recipientId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<INotification>>;
}
