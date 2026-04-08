import { IChatMessage } from '../../domain/interfaces/IChatMessage';
import { MessageResponseDTO } from '../dtos/user/MessageResponseDTO';

export class ChatMapper {
  public static toDTO(dto: IChatMessage): MessageResponseDTO {
    return {
      id: dto.id!,
      repositoryId: dto.repositoryId,
      senderId: dto.senderId,
      senderUsername: dto.senderUsername,
      content: dto.content,
      createdAt: dto.createdAt!,
    };
  }

  public static toEntity(doc: any): IChatMessage {
    return {
      id: doc._id.toString(),
      repositoryId: doc.repositoryId.toString(),
      senderId: doc.senderId.toString(),
      senderUsername: doc.senderUsername,
      content: doc.content,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }
}
