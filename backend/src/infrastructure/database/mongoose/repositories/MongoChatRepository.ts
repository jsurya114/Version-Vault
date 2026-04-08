import { injectable } from 'tsyringe';
import { IChatMessage } from '../../../../domain/interfaces/IChatMessage';
import { IChatRepository } from '../../../../domain/interfaces/repositories/IChatRepository';
import { ChatModel } from '../models/ChatModel';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { MongoBaseRepository } from './MongoBaseRepository';
import { ChatMapper } from '../../../../application/mappers/ChatMapper';

@injectable()
export class MongoChatRepository
  extends MongoBaseRepository<IChatMessage>
  implements IChatRepository
{
  constructor() {
    super(ChatModel);
  }

  protected toEntity(doc: unknown): IChatMessage {
    return ChatMapper.toEntity(doc);
  }

  // List chats using Pagination
  async getMessagesByRepositoryId(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IChatMessage>> {
    const filter: Record<string, unknown> = { repositoryId };
    if (query.search) {
      filter.content = { $regex: query.search, $options: 'i' };
    }

    return this.findWithpagination(filter, query);
  }
}
