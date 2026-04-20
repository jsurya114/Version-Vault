import { injectable, inject } from 'tsyringe';
import { ISendMessageUseCase } from '../interfaces/chats/ISendMessageUseCase';
import { IChatRepository } from '../../../domain/interfaces/repositories/IChatRepository';
import { CreateMessageDTO } from '../../../application/dtos/user/CreateMessageDTO';
import { MessageResponseDTO } from '../../../application/dtos/user/MessageResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { ChatMapper } from '../../../application/mappers/ChatMapper';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(dto: CreateMessageDTO): Promise<MessageResponseDTO> {
    const savedEntity = await this._chatRepo.save({
      repositoryId: dto.repositoryId,
      senderId: dto.senderId,
      senderUsername: dto.senderUsername,
      content: dto.content,
    });

    this._notificationService
      .notifyRepoDevelopers({
        actorId: dto.senderId,
        actorUsername: dto.senderUsername,
        type: 'chat_message',
        message: `${dto.senderUsername} sent a message in chat`,
        repositoryId: dto.repositoryId,
      })
      .catch(() => {});

    return ChatMapper.toDTO(savedEntity);
  }
}
