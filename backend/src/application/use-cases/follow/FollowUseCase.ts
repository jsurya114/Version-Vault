import { injectable, inject } from 'tsyringe';
import { IFollowUseCase } from '../interfaces/follow/IFollowUseCase';
import { IFollowRepository } from 'src/domain/interfaces/repositories/IFollowRepository';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { ConflictError } from 'src/domain/errors/ConflictError';

@injectable()
export class FollowUseCase implements IFollowUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(
    followerId: string,
    followerUsername: string,
    followingId: string,
    followingUsername: string,
  ): Promise<void> {
    if (followerId === followingId) throw new Error('You cannot follow yourself');
    const existing = await this._followRepo.findByFollowerAndFollowing(
      followerId,
      followingUsername,
    );
    if (existing) throw new ConflictError('Already following this user');

    await this._followRepo.save({ followerId, followerUsername, followingId, followingUsername });

    //update counts
    const follower = await this._userRepo.findById(followerId);
    const following = await this._userRepo.findById(followingId);

    if (follower)
      await this._userRepo.update(followerId, {
        followingCount: (follower.followingCount || 0) + 1,
      });
    if (following)
      await this._userRepo.update(followingId, {
        followersCount: (following.followersCount || 0) + 1,
      });
  }
}
