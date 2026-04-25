import { injectable, inject } from 'tsyringe';
import { IGetActivityFeedUseCase } from '../interfaces/activity/IGetFeedActivityFeedUseCase';
import { IActivityRepository } from '../../../domain/interfaces/repositories/IActivityRepository';
import { IFollowRepository } from '../../../domain/interfaces/repositories/IFollowRepository';
import { IActivity } from '../../../domain/interfaces/IActivity';
import { TOKENS } from '../../../shared/constants/tokens';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class GetActivityFeedUseCase implements IGetActivityFeedUseCase {
  constructor(
    @inject(TOKENS.IActivityRepository) private _activityRepo: IActivityRepository,
    @inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository,
  ) {}

  async execute(
    userId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IActivity>> {
    // 1. Get everyone the user is following
    const following = await this._followRepo.findFollowing(userId);
    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return { data: [], total: 0, page: query.page || 1, limit: query.limit || 10, totalPages: 0 };
    }

    // 2. Query the activities for those specific users
    return await this._activityRepo.getFeedForUsers(followingIds, query);
  }
}
