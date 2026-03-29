import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IUpdateProfileUseCase } from '../../../../application/use-cases/interfaces/user/IUpdateProfileUseCase';
import { IGetProfileUseCase } from '../../../../application/use-cases/interfaces/user/IGetUserProfileUseCase';
import { TOKENS } from '../../../../shared/constants/tokens';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';

export type AuthRequest = Request & {
  user: ITokenPayload;
  file?: unknown;
};

@injectable()
export class UserController {
  constructor(
    @inject(TOKENS.IUpdateProfileUseCase) private _updateProfileUseCase: IUpdateProfileUseCase,
    @inject(TOKENS.IGetProfileUseCase) private _getProfilUseCase: IGetProfileUseCase,
  ) {}

  /**
   * GET /vv/user/:username
   * Fetches public data for any searched user
   */
  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.params;
      const user = await this._getProfilUseCase.execute(username);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /vv/user/profile
   * Updates the logged-in user's profile (name, bio, avatar)
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const { username, bio } = req.body;

      const avatar = req.file ? (req.file as { path: string }).path : undefined;
      const data = { username, bio, avatar };
      const updatedUser = await this._updateProfileUseCase.execute(userId, data);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
