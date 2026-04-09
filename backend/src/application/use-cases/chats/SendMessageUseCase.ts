import { injectable, inject } from 'tsyringe';
import { ISendMessageUseCase } from '../interfaces/chats/ISendMessageUseCase';
import { IChatRepository } from '../../../domain/interfaces/repositories/IChatRepository';
import { CreateMessageDTO } from '../../../application/dtos/user/CreateMessageDTO';
import { MessageResponseDTO } from '../../../application/dtos/user/MessageResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { ChatMapper } from '../../../application/mappers/ChatMapper';

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(@inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository) {}

  async execute(dto: CreateMessageDTO): Promise<MessageResponseDTO> {
    const savedEntity = await this._chatRepo.save({
      repositoryId: dto.repositoryId,
      senderId: dto.senderId,
      senderUsername: dto.senderUsername,
      content: dto.content,
    });

    return ChatMapper.toDTO(savedEntity);
  }
}
