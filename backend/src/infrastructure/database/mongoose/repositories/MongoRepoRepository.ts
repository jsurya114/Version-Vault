import { injectable } from 'tsyringe';
import { RepositoryModel } from '../models/RepositoryModel';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
import { RepositoryMapper } from '../../../../application/mappers/RepositoryMapper';
import { IRepository } from '../../../../domain/interfaces/IRepository';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoRepoRepository
  extends MongoBaseRepository<IRepository>
  implements IRepoRepository
{
  constructor() {
    super(RepositoryModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected toEntity(doc: any): IRepository {
    return RepositoryMapper.toIRepository(doc);
  }

  async findByOwner(
    ownerId: string,
    query: PaginationQueryDTO,
    authenticatedUserId?: string,
  ): Promise<PaginatedResponseDTO<IRepository>> {
    const filter: Record<string, unknown> = { ownerId, isDeleted: false, isBlocked: false };
    if (ownerId !== authenticatedUserId) {
      filter.visibility = 'public';
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.status) {
      filter.visibility = query.status;
    }

    return this.findWithpagination(filter, query);
  }
  async findByOwnerAndName(ownerUsername: string, name: string): Promise<IRepository | null> {
    const doc = await this.model
      .findOne({ ownerUsername, name, isDeleted: false, isBlocked: false })
      .lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IRepository>> {
    const filter: Record<string, unknown> = { isDeleted: false, isBlocked: false };

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.status) {
      filter.visibility = query.status;
    }
    return this.findWithpagination(filter, query);
  }
}
