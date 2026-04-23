import { injectable } from 'tsyringe';
import { MongoBaseRepository } from './MongoBaseRepository';
import { IActivityRepository } from '../../../../domain/interfaces/repositories/IActivityRepository';
import { IActivity } from '../../../../domain/interfaces/IActivity';
import { ActivityModel } from '../models/ActivityModel';
import { ActivityMapper } from '../../../../application/mappers/ActivityMapper';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoActivityRepository
  extends MongoBaseRepository<IActivity>
  implements IActivityRepository
{
  constructor() {
    super(ActivityModel);
  }

  protected toEntity(doc: unknown): IActivity {
    return ActivityMapper.toEntity(doc);
  }

  async getFeedForUsers(
    followingIds: string[],
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IActivity>> {
    const filter = {
      actorId: { $in: followingIds },
      isPrivate: { $ne: true },
    };
    return await this.findWithpagination(filter, query);
  }
}
