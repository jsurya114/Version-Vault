import { injectable, inject } from 'tsyringe';
import { IGetMessageUseCase } from '../interfaces/chats/IGetMessageUseCase';
import { IChatRepository } from '../../../domain/interfaces/repositories/IChatRepository';
import { MessageResponseDTO } from '../../../application/dtos/user/MessageResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { ChatMapper } from '../../../application/mappers/ChatMapper';
@injectable()
export class GetMessageUseCase implements IGetMessageUseCase {
  constructor(@inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository) {}

  async execute(messageId: string): Promise<MessageResponseDTO | null> {
    const message = await this._chatRepo.findById(messageId);
    if (!message) return null;

    return ChatMapper.toDTO(message);
  }
}
