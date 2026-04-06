import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ICreateCommentUseCase } from '../../../../application/use-cases/interfaces/comments/ICreateCommentUsecase';
import { IListCommentUseCase } from '../../../../application/use-cases/interfaces/comments/IListCommentUseCase';
import { IDeleteCommentUseCase } from '../../../../application/use-cases/interfaces/comments/IDeleteCommentUseCase';

import { IGetRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IGetRepoUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';
import { AuthRequest } from '../repository/RepositoryController';
import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class CommentController {
  constructor(
    @inject(TOKENS.ICreateCommentUseCase) private _createComment: ICreateCommentUseCase,
    @inject(TOKENS.IListCommentUseCase) private _listComment: IListCommentUseCase,
    @inject(TOKENS.IDeleteCommentUseCase) private _deleteComment: IDeleteCommentUseCase,

    @inject(TOKENS.IGetRepoUseCase) private _getRepo: IGetRepoUseCase,
  ) {}

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetType, targetId } = req.params;
      const { content } = req.body;
      const user = (req as unknown as AuthRequest).user;

      // Safety check for the repo from middleware
      const repo = res.locals.repo;
      if (!repo) {
        return next(
          new Error(
            'Repository context is missing. Verify repoAccessMiddleware is setting res.locals.repo',
          ),
        );
      }

      const comment = await this._createComment.execute({
        targetId,
        targetType: targetType as 'pr' | 'issue',
        repositoryId: repo.id,
        authorId: user.id,
        authorUsername: user.userId, // Double check if this is .userId or .username in your token!
        content,
      });

      res.status(HttpStatusCodes.CREATED).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async listComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetType, targetId } = req.params;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
      };
      const result = await this._listComment.execute(targetId, targetType as 'pr' | 'issue', query);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;
      const { id: requestUserId } = (req as unknown as AuthRequest).user;
      await this._deleteComment.execute(commentId, requestUserId);
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
