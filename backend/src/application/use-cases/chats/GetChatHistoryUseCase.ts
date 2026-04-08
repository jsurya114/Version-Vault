import { injectable, inject } from 'tsyringe';
import { IGetChatHistoryUseCase } from '../interfaces/chats/IGetChatHistoryUseCase';
import { IChatRepository } from '../../../domain/interfaces/repositories/IChatRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { MessageResponseDTO } from '../../../application/dtos/user/MessageResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { ChatMapper } from '../../../application/mappers/ChatMapper';

@injectable()
export class GetChatHistoryUseCase implements IGetChatHistoryUseCase {
  constructor(@inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository) {}

  async execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<MessageResponseDTO>> {
    const paginatedResult = await this._chatRepo.getMessagesByRepositoryId(repositoryId, query);

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((e) => ChatMapper.toDTO(e)),
    };
  }
}
