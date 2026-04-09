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

  public static toEntity(doc: unknown): IChatMessage {
    const d = doc as IChatMessage & { _id?: { toString(): string } };
    return {
      id: d.id?.toString() || d._id?.toString() || '',
      repositoryId: d.repositoryId.toString(),
      senderId: d.senderId.toString(),
      senderUsername: d.senderUsername,
      content: d.content,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }
}
