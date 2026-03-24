import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IFollowUseCase } from 'src/application/use-cases/interfaces/follow/IFollowUseCase';
import { IUnfollowUseCase } from 'src/application/use-cases/interfaces/follow/IUnfollowUseCase';
import { IGetFollowersUseCase } from 'src/application/use-cases/interfaces/follow/IGetFollowersUseCase';
import { IGetFollowingUseCase } from 'src/application/use-cases/interfaces/follow/IGetFollowingUseCase';
import { IGetUserByIdUseCase } from 'src/application/use-cases/interfaces/admin/IGetUserByIdUseCase';
import { HttpStatusCodes } from 'src/shared/constants/HttpStatusCodes';
import { TOKENS } from 'src/shared/constants/tokens';

@injectable()
export class FollowController {
  constructor(
    @inject(TOKENS.IFollowUseCase) private _followUseCase: IFollowUseCase,
    @inject(TOKENS.IUnfollowUseCase) private _unfollowUseCase: IUnfollowUseCase,
    @inject(TOKENS.IGetFollowersUseCase) private _getFollowerUseCase: IGetFollowersUseCase,
    @inject(TOKENS.IGetFollowingUseCase) private _getFollowingUseCase: IGetFollowingUseCase,
    @inject(TOKENS.IGetUserByIdUseCase) private _getIGetUserByIdUseCase: IGetUserByIdUseCase,
  ) {}

  // POST /vv/follow/:userId
  async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: followerId, userId: followerUsername } = (req as any).user;
      const { userId, followingId } = req.params;
      const targetUser = await this._getIGetUserByIdUseCase.execute(followingId);
      await this._followUseCase.execute(
        followerId,
        followerUsername,
        followingId,
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
      const { id: followerId } = (req as any).user;
      const { userId: followingId } = req.params;
      await this._unfollowUseCase.execute(followerId, followingId);
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/follow/:userId/followers
  async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const followers = await this._getFollowerUseCase.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: followers });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/follow/:userId/following
  async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const following = await this._getFollowingUseCase.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: following });
    } catch (error) {
      next(error);
    }
  }
}
