import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IGetIssueUseCase } from '../../../../application/use-cases/interfaces/issues/IGetIssueUseCase';
import { IListIssueUseCase } from '../../../../application/use-cases/interfaces/issues/IListIssueUseCase';
import { IClosePRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IClosePRUseCase';
import { IGetRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IGetRepoUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';
import { TOKENS } from '../../../../shared/constants/tokens';
import { ICreateIssueUseCase } from '../../../../application/use-cases/interfaces/issues/ICreateIssueUseCase';

@injectable()
export class IssueController {
  constructor(
    @inject(TOKENS.ICreateIssueUseCase) private _createIssue: ICreateIssueUseCase,
    @inject(TOKENS.IGetIssueUseCase) private _getIssue: IGetIssueUseCase,
    @inject(TOKENS.IListIssuesUseCase) private _listIssue: IListIssueUseCase,
    @inject(TOKENS.ICloseIssueUseCase) private _closeIssue: IClosePRUseCase,
    @inject(TOKENS.IGetRepoUseCase) private _getRepo: IGetRepoUseCase,
  ) {}

  // POST /vv/issues/:username/:reponame
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { title, description, priority, labels, assignees } = req.body;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id: authorId, userId: authorUsername } = (req as any).user;

      const repo = await this._getRepo.execute(username, reponame, authorId);

      const issue = await this._createIssue.execute({
        title,
        description,
        priority,
        labels,
        assignees,
        repositoryId: repo.id,
        authorId,
        authorUsername,
      });
      res.status(HttpStatusCodes.CREATED).json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/issues/:username/:reponame
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as 'active' | 'blocked' | 'pending' | undefined,
      };
      const { id: authenticatedUserId } = (req as any).user || {};
      const repo = await this._getRepo.execute(username, reponame, authenticatedUserId);
      const result = await this._listIssue.execute(repo.id, query);

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
  // GET /vv/issues/:username/:reponame/:id

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, username, reponame } = req.params;
      const { id: authenticatedUserId } = (req as any).user || {};

      // Verify access to the repository
      await this._getRepo.execute(username, reponame, authenticatedUserId);

      const issue = await this._getIssue.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/issues/:username/:reponame/:id/close — close issue (auth required)
  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, username, reponame } = req.params;
      const { id: authenticatedUserId } = (req as any).user || {};

      // Verify access to the repository
      await this._getRepo.execute(username, reponame, authenticatedUserId);

      const issue = await this._closeIssue.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }
}
