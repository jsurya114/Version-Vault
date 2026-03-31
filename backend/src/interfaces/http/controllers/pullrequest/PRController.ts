import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ICreatePRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/ICreatePRUseCase';
import { IGetPRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IGetPRUseCase';
import { IListPRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IListPRUseCase';
import { IClosePRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IClosePRUseCase';
import { IMergePRUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IMergePRUseCase';
import { IGetRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IGetRepoUseCase';
import { TOKENS } from '../../../../shared/constants/tokens';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';
import { AuthRequest } from '../repository/RepositoryController';
import { ITokenPayload } from 'src/domain/interfaces/services/ITokenService';

@injectable()
export class PRController {
  constructor(
    @inject(TOKENS.ICreatePRUseCase) private _createPR: ICreatePRUseCase,
    @inject(TOKENS.IGetPRUseCase) private _getPR: IGetPRUseCase,
    @inject(TOKENS.IListPRsUseCase) private _listPRs: IListPRUseCase,
    @inject(TOKENS.IMergePRUseCase) private _mergePR: IMergePRUseCase,
    @inject(TOKENS.IClosePRUseCase) private _closePR: IClosePRUseCase,
    @inject(TOKENS.IGetRepoUseCase) private _getRepo: IGetRepoUseCase,
  ) {}

  // POST /vv/pr/:username/:reponame
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { title, description, sourceBranch, targetBranch } = req.body;

      const { id: authorId, userId: authorUsername } = (req as AuthRequest).user;

      const repo = await this._getRepo.execute(username, reponame, authorId);
      const pr = await this._createPR.execute({
        title,
        description,
        sourceBranch,
        targetBranch,
        repositoryId: repo.id,
        authorId,
        authorUsername,
      });
      res.status(HttpStatusCodes.CREATED).json({ success: true, data: pr });
    } catch (error) {
      next(error);
    }
  }
  // GET /vv/pr/:username/:reponame
  async listPr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const authenticateUser = (req as AuthRequest).user as ITokenPayload | undefined;
      const authenticateUserId = authenticateUser?.id;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as 'active' | 'blocked' | 'pending' | undefined,
      };
      const repo = await this._getRepo.execute(username, reponame, authenticateUserId);
      const result = await this._listPRs.execute(repo.id, query);

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

  // GET /vv/pr/:username/:reponame/:id
  async getPr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._getPR.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: pr });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/pr/:username/:reponame/:id/merge
  async merge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._mergePR.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: pr });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/pr/:username/:reponame/:id/close
  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._closePR.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: pr });
    } catch (error) {
      next(error);
    }
  }
}
