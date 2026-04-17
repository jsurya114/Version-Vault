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
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';
import { IPullRequestRepository } from '../../../../domain/interfaces/repositories/IPullRequestRepository';
import { GitService } from '../../../../infrastructure/services/GitService';
import { PRStatus } from '../../../../domain/interfaces/IPullRequest';
import { IGetConflictsUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IGetConflictsUseCase';
import { IResolveConflictsUseCase } from '../../../../application/use-cases/interfaces/pullrequest/IResolveConflictsUseCase';

@injectable()
export class PRController {
  constructor(
    @inject(TOKENS.ICreatePRUseCase) private _createPR: ICreatePRUseCase,
    @inject(TOKENS.IGetPRUseCase) private _getPR: IGetPRUseCase,
    @inject(TOKENS.IListPRsUseCase) private _listPRs: IListPRUseCase,
    @inject(TOKENS.IMergePRUseCase) private _mergePR: IMergePRUseCase,
    @inject(TOKENS.IClosePRUseCase) private _closePR: IClosePRUseCase,
    @inject(TOKENS.IGetRepoUseCase) private _getRepo: IGetRepoUseCase,
    @inject(TOKENS.IPullRequestRepository) private _prReository: IPullRequestRepository,
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IGetConflictsUseCase) private _getConflicts: IGetConflictsUseCase,
    @inject(TOKENS.IResolveConflictsUseCase) private _resolveConflicts: IResolveConflictsUseCase,
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
      const query: PaginationQueryDTO<PRStatus> = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as PRStatus | undefined,
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

  // Collaborator requests merge approval
  async requestMerge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._prReository.findById(id);
      if (!pr) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
        return;
      }
      if (pr.status !== 'open') {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'only open pr can request merge' });
        return;
      }
      if (pr.mergeApproval === 'pending') {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'Merge request already pending' });
        return;
      }
      await this._prReository.update(id, { mergeApproval: 'pending' });
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'Merge request sent to owner for approval' });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/pr/:username/:reponame/:id/approve-merge — Owner approves and merges
  async approveMerge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._prReository.findById(id);
      if (!pr) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
        return;
      }

      if (pr.mergeApproval !== 'pending') {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'No pending merge request to approve' });
        return;
      }
      const upatedPr = await this._prReository.update(id, { mergeApproval: 'approved' });

      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'PR approved and merged', data: upatedPr });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/pr/:username/:reponame/:id/reject-merge — Owner rejects merge request
  async rejectMerge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pr = await this._prReository.findById(id);

      if (!pr) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
        return;
      }
      if (pr.mergeApproval !== 'pending') {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'No pending merge request to approve' });
        return;
      }
      await this._prReository.update(id, { mergeApproval: 'rejected' });
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Merge request rejected' });
    } catch (error) {
      next(error);
    }
  }

  async getConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conflicts = await this._getConflicts.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: conflicts });
    } catch (_error) {
      next(_error);
    }
  }
  async resolveConflicts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { resolvedFiles } = req.body;
      const { userId: authorUsername } = req.user;
      const pr = await this._resolveConflicts.execute({
        prId: id,
        resolvedFiles,
        authorName: authorUsername,
        authorEmail: `${authorUsername}@version-vault.local`,
      });
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Conflicts resolved and PR merged successfully',
        data: pr,
      });
    } catch (error) {
      next(error);
    }
  }
}
