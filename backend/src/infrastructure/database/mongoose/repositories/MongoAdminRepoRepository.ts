import { IRepository } from '../../../../domain/interfaces/IRepository';
import { RepositoryModel } from '../models/RepositoryModel';
import { RepositoryMapper } from '../../../../application/mappers/RepositoryMapper';
import { injectable } from 'tsyringe';
import { IAdminRepoRepository } from '../../../../domain/interfaces/repositories/IAdminRepoRepository';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoAdminRepoRepository
  extends MongoBaseRepository<IRepository>
  implements IAdminRepoRepository
{
  constructor() {
    super(RepositoryModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected toEntity(doc: any): IRepository {
    return RepositoryMapper.toIRepository(doc);
  }

  async getAllRepos(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IRepository>> {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { ownerUsername: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status) {
      if (query.status === 'blocked') {
        filter.isBlocked = true;
      } else if (query.status === 'active') {
        filter.isBlocked = { $ne: true };
      }
    }
    const [baseResult, stats] = await Promise.all([
      this.findWithpagination(filter, query),
      this.model.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalStars: { $sum: '$stars' },
            totalForks: { $sum: '$forks' },
          },
        },
      ]),
    ]);

    return {
      ...baseResult,
      extraStats: stats[0]
        ? {
            totalStars: stats[0].totalStars || 0,
            totalForks: stats[0].totalForks || 0,
          }
        : { totalStars: 0, totalForks: 0 },
    };
  }

  async blockRepo(id: string): Promise<IRepository | null> {
    return this.update(id, { isBlocked: true });
  }
  async unblockRepo(id: string): Promise<IRepository | null> {
    return this.update(id, { isBlocked: false });
  }
}
