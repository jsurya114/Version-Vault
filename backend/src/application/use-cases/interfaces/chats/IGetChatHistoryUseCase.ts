import { MessageResponseDTO } from '../../../../application/dtos/user/MessageResponseDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

export interface IGetChatHistoryUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<MessageResponseDTO>>;
}
