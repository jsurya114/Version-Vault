import { injectable, inject } from 'tsyringe';
import { IUnfollowUseCase } from '../interfaces/follow/IUnfollowUseCase';
import { IFollowRepository } from '../../../domain/interfaces/repositories/IFollowRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class UnfollowUseCase implements IUnfollowUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    const existing = await this._followRepo.findByFollowerAndFollowing(followerId, followingId);
    if (!existing) throw new Error('Not Following this user');

    await this._followRepo.deleteByFollowerAndFollowing(followerId, followingId);

    const follower = await this._userRepo.findById(followerId);
    const following = await this._userRepo.findById(followingId);

    if (follower)
      await this._userRepo.update(followerId, {
        followingCount: Math.max((follower.followingCount || 0) - 1, 0),
      });
    if (following)
      await this._userRepo.update(followingId, {
        followersCount: Math.max((following.followersCount || 0) - 1, 0),
      });
  }
}
