import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ICreateCommitUseCase } from '../../../../application/use-cases/interfaces/commit/ICreateCommitUseCase';
import { TOKENS } from '../../../../shared/constants/tokens';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { AuthRequest } from '../repository/RepositoryController';
import { ICompareCommitUseCase } from '../../../../application/use-cases/interfaces/commit/ICompareCommitUseCase';

@injectable()
export class CommitController {
  constructor(
    @inject(TOKENS.ICreateCommitUseCase) private _createCommitUseCase: ICreateCommitUseCase,
    @inject(TOKENS.ICompareCommitUseCase) private _compareCommitUseCase: ICompareCommitUseCase,
  ) {}

  async createCommit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { branch, message, filePath, content } = req.body;
      const { id: actorId, userId: authorUsername, email: authorEmail } = req.user as ITokenPayload;

      await this._createCommitUseCase.execute(
        username,
        reponame,
        {
          branch,
          message,
          filePath,
          content,
          authorName: authorUsername,
          authorEmail: authorEmail,
        },
        actorId,
        authorUsername,
      );
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Changes committed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async compareCommit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame, base, head } = req.params;
      const result = await this._compareCommitUseCase.execute(username, reponame, base, head);
      res.status(HttpStatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}
