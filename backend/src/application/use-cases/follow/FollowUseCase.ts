import { injectable, inject } from 'tsyringe';
import { IFollowUseCase } from '../interfaces/follow/IFollowUseCase';
import { IRecordActivityUseCase } from '../interfaces/activity/IRecordActivityUseCase';
import { IFollowRepository } from '../../../domain/interfaces/repositories/IFollowRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class FollowUseCase implements IFollowUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TOKENS.IRecordActivityUseCase) private _recordActivityUseCase: IRecordActivityUseCase,
  ) {}

  async execute(
    followerId: string,
    followerUsername: string,
    followingId: string,
    followingUsername: string,
  ): Promise<void> {
    if (followerId === followingId) throw new Error('You cannot follow yourself');
    const existing = await this._followRepo.findByFollowerAndFollowing(followerId, followingId);
    if (existing) throw new ConflictError('Already following this user');

    await this._followRepo.save({ followerId, followerUsername, followingId, followingUsername });

    //update counts
    const follower = await this._userRepo.findById(followerId);
    const following = await this._userRepo.findById(followingId);

    if (follower) {
      await this._userRepo.update(followerId, {
        followingCount: (follower.followingCount || 0) + 1,
      });
    }
    if (following) {
      await this._userRepo.update(followingId, {
        followersCount: (following.followersCount || 0) + 1,
      });
    }
    this._notificationService
      .notifyUser({
        recipientId: followingId,
        actorId: followerId,
        actorUsername: followerUsername,
        type: 'followed',
        message: `${followerUsername} started following you`,
      })
      .catch(() => {});

    this._recordActivityUseCase
      .execute({
        actorId: followerId,
        actorUsername: followerUsername,
        actorAvatar: follower?.avatar,
        isPrivate: false,
        actionType: 'followed_user',
        targetId: followingId,
        targetName: followingUsername,
      })
      .catch(() => {});
  }
}
