import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICreateCommitUseCase } from '../../../../application/use-cases/interfaces/commit/ICreateCommitUseCase';
import { TOKENS } from '../../../../shared/constants/tokens';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';

export interface AuthRequest extends Request {
  user: ITokenPayload;
}
@injectable()
export class CommitController {
  constructor(
    @inject(TOKENS.ICreateCommitUseCase) private _createCommitUseCase: ICreateCommitUseCase,
    @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
  ) {}

  async createCommit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { branch, message, filePath, content } = req.body;
      const { userId } = req.user;
      const user = await this._userRepository.findByUserId(userId);

      if (!user) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      await this._createCommitUseCase.execute({
        ownerUsername: username,
        repoName: reponame,
        branch,
        message,
        filePath,
        content,
        authorName: user.username,
        authorEmail: user.email,
      });

      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: 'Changes committed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
