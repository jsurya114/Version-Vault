import { injectable } from 'tsyringe';
import { IFollow } from '../../../../domain/interfaces/IFollow';
import { IFollowRepository } from '../../../../domain/interfaces/repositories/IFollowRepository';
import { FollowMapper } from '../../../../application/mappers/FollowMapper';
import { FollowModel } from '../models/FollowModel';
import { MongoBaseRepository } from './MongoBaseRepository';

import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoFollowRepository
  extends MongoBaseRepository<IFollow>
  implements IFollowRepository
{
  constructor() {
    super(FollowModel);
  }

  protected toEntity(doc: any): IFollow {
    return FollowMapper.toIFollow(doc);
  }

  async findByFollowerAndFollowing(
    followerId: string,
    followingId: string,
  ): Promise<IFollow | null> {
    const doc = await FollowModel.findOne({ followerId, followingId });
    return doc ? this.toEntity(doc) : null;
  }

  async findFollowers(userId: string): Promise<IFollow[]> {
    const docs = await FollowModel.find({ followerId: userId });
    return docs.map(this.toEntity.bind(this));
  }

  async findFollowing(userId: string): Promise<IFollow[]> {
    const docs = await FollowModel.find({ followerId: userId });
    return docs.map(this.toEntity.bind(this));
  }

  async deleteByFollowerAndFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await FollowModel.deleteOne({ followerId, followingId });
    return result.deletedCount > 0;
  }
}
