import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IFollowUseCase } from '../../../../application/use-cases/interfaces/follow/IFollowUseCase';
import { IUnfollowUseCase } from '../../../../application/use-cases/interfaces/follow/IUnfollowUseCase';
import { IGetFollowersUseCase } from '../../../../application/use-cases/interfaces/follow/IGetFollowersUseCase';
import { IGetFollowingUseCase } from '../../../../application/use-cases/interfaces/follow/IGetFollowingUseCase';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';

@injectable()
export class FollowController {
  constructor(
    @inject(TOKENS.IFollowUseCase) private _followUseCase: IFollowUseCase,
    @inject(TOKENS.IUnfollowUseCase) private _unfollowUseCase: IUnfollowUseCase,
    @inject(TOKENS.IGetFollowersUseCase) private _getFollowerUseCase: IGetFollowersUseCase,
    @inject(TOKENS.IGetFollowingUseCase) private _getFollowingUseCase: IGetFollowingUseCase,
    @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
  ) {}

  // POST /vv/follow/:userId
  async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id: followerId, userId: followerUsername } = (req as any).user;
      const { userId: targetId } = req.params;
      const targetUser =
        (await this._userRepository.findByUserId(targetId)) ||
        (await this._userRepository.findByUserName(targetId));
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      await this._followUseCase.execute(
        followerId,
        followerUsername,
        targetUser.id!,
        targetUser.userId,
      );
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Followed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /vv/follow/:userId
  async unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id: followerId } = (req as any).user;
      const { userId: targetUsername } = req.params;
      const targetUser =
        (await this._userRepository.findByUserId(targetUsername)) ||
        (await this._userRepository.findByUserName(targetUsername));
      if (!targetUser) throw new Error('User not found');

      await this._unfollowUseCase.execute(followerId, targetUser.id!);
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/follow/:userId/followers
  async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId: targetId } = req.params;
      const targetUser =
        (await this._userRepository.findByUserId(targetId)) ||
        (await this._userRepository.findByUserName(targetId));
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const followers = await this._getFollowerUseCase.execute(targetUser.id!);
      res.status(HttpStatusCodes.OK).json({ success: true, data: followers });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/follow/:userId/following
  async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId: targetId } = req.params;
      const targetUser =
        (await this._userRepository.findByUserId(targetId)) ||
        (await this._userRepository.findByUserName(targetId));
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const following = await this._getFollowingUseCase.execute(targetUser.id!);
      res.status(HttpStatusCodes.OK).json({ success: true, data: following });
    } catch (error) {
      next(error);
    }
  }
}
