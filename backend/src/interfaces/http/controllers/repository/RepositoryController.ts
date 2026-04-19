import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';

import { IGetRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IGetRepoUseCase';
import { ICreateRepoUseCase } from '../../../../application/use-cases/interfaces/repository/ICreateRepoUseCase';
import { IListRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IListRepoUseCase';
import { IDeleteRepoUsecase } from '../../../../application/use-cases/interfaces/repository/IDeleteRepoUseCase';
import { IGetCommitsUseCase } from '../../../../application/use-cases/interfaces/repository/IGetCommitsUseCase';
import { IGetFileContentUseCase } from '../../../../application/use-cases/interfaces/repository/IGetFileContentUseCase';
import { IGetFilesUseCase } from '../../../../application/use-cases/interfaces/repository/IGetFilesUseCase';
import { IGetBranchesUseCase } from '../../../../application/use-cases/interfaces/branch/IGetBranchesUseCase';
import { IVisibilityUseCase } from '../../../../application/use-cases/interfaces/repository/IVisibilityUseCase';
import { IForkRepoUseCase } from '../../../../application/use-cases/interfaces/repository/IForkRepoUseCase';
import { IToggleStarUseCase } from '../../../../application/use-cases/interfaces/repository/IToggleStarUseCase';

import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';

import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IGetStarUseCase } from '../../../../application/use-cases/interfaces/repository/IGetStarsUseCase';
import { IGetActiveBranchUseCase } from '../../../../application/use-cases/interfaces/repository/IGetActiveBranchUseCase';
import { IDeleteFileUseCase } from '../../../../application/use-cases/interfaces/repository/IDeleteFileUseCase';

export interface AuthRequest extends Request {
  user: ITokenPayload;
}

@injectable()
export class RepositoryController {
  constructor(
    @inject(TOKENS.IGetRepoUseCase) private getRepo: IGetRepoUseCase,
    @inject(TOKENS.ICreateRepoUseCase) private createRepo: ICreateRepoUseCase,
    @inject(TOKENS.IListRepoUseCase) private listRepo: IListRepoUseCase,
    @inject(TOKENS.IDeleteRepoUseCase) private deleteRepo: IDeleteRepoUsecase,
    @inject(TOKENS.IGetCommitsUseCase) private commitUseCase: IGetCommitsUseCase,
    @inject(TOKENS.IGetFileContentUseCase) private fileContentUseCase: IGetFileContentUseCase,
    @inject(TOKENS.IGetFilesUseCase) private filesUseCase: IGetFilesUseCase,
    @inject(TOKENS.IGetBranchesUseCase) private branchUseCase: IGetBranchesUseCase,
    @inject(TOKENS.IVisibilityUseCase) private _visbilityUseCase: IVisibilityUseCase,
    @inject(TOKENS.IForkRepoUseCase) private _forkRepoUseCase: IForkRepoUseCase,
    @inject(TOKENS.IToggleStarUseCase) private _toggleStarUseCase: IToggleStarUseCase,
    @inject(TOKENS.IGetStarsUseCase) private _getStarsUseCase: IGetStarUseCase,
    @inject(TOKENS.IGetActiveBranchUseCase) private _getActiveBranch: IGetActiveBranchUseCase,
    @inject(TOKENS.IDeleteFileUseCase) private _deleteFileUseCase: IDeleteFileUseCase,
  ) {}

  /**
   * POST /vv/repo
   * Create a new repository
   */
  async createRepository(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, visibility } = req.body;
      const { id: ownerId, userId: ownerUsername } = req.user;

      const repo = await this.createRepo.execute({
        name,
        description,
        visibility,
        ownerId,
        ownerUsername,
      });
      res.status(HttpStatusCodes.CREATED).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /vv/repo/:username/:reponame
   * Get a single repository
   */
  async getRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const authRequest = req as AuthRequest;
      const authenticatedUserId = authRequest.user?.id;
      const repo = await this.getRepo.execute(username, reponame, authenticatedUserId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/repo
   * List all repositories for logged in user
   */

  async listRepository(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = (req.query.userId as string) || (req.user as ITokenPayload).id;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as 'active' | 'blocked' | 'pending' | undefined,
      };
      const authenticatedUserId = req.user?.id;

      const result = await this.listRepo.execute(ownerId, query, authenticatedUserId);
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
  /**
   * DELETE /vv/repo/:username/:reponame
   * Delete a repository
   */

  async deleteRepository(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId: ownerUsername } = req.user as ITokenPayload;
      const { reponame } = req.params;
      await this.deleteRepo.execute(ownerUsername, reponame);
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'Repository deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/repo/:username/:reponame/files
   * Get files in a directory
   */
  async getFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branch = (req.query.branch as string) || 'main';
      const path = (req.query.path as string) || '';
      const recursive = req.query.recursive === 'true';
      const files = await this.filesUseCase.execute(username, reponame, branch, path, recursive);
      res.status(HttpStatusCodes.OK).json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/repo/:username/:reponame/content
   * Get file content
   */

  async getFileContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branch = (req.query.branch as string) || 'main';
      const filePath = (req.query.path as string) || '';
      const content = await this.fileContentUseCase.execute(username, reponame, filePath, branch);
      res.status(HttpStatusCodes.OK).json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/repo/:username/:reponame/commits
   * Get commit history
   */

  async getCommit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branch = (req.query.branch as string) || 'main';
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const commits = await this.commitUseCase.execute(username, reponame, branch, limit);
      res.status(HttpStatusCodes.OK).json({ success: true, data: commits });
    } catch (error) {
      next(error);
    }
  }

  async updateVisibility(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { visibility } = req.body;
      await this._visbilityUseCase.execute(username, reponame, visibility);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `Repository is now ${visibility}`,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /vv/repo/:username/:reponame/fork
   * Fork an existing repository
   */
  async forkRepository(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username: sourceOwnerUsername, reponame: sourceRepoName } = req.params;
      const { id: forkerId, userId: forkerUsername } = req.user;
      const forkedRepo = await this._forkRepoUseCase.execute({
        sourceOwnerUsername,
        sourceRepoName,
        forkerId,
        forkerUsername,
      });
      res.status(HttpStatusCodes.CREATED).json({ success: true, data: forkedRepo });
    } catch (error) {
      next(error);
    }
  }

  async toggleStar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await this._toggleStarUseCase.execute({
        userId,
        ownerUsername: username,
        repoName: reponame,
      });

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStarredUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const users = await this._getStarsUseCase.execute(username, reponame);
      res.status(HttpStatusCodes.OK).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branches = await this._getActiveBranch.execute(username, reponame);
      res.status(HttpStatusCodes.OK).json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { branch, filePath, commitMessage } = req.body;
      const actorId = req.user.id;
      const actorUsername = req.user.userId;
      const actorEmail = req.user.email;
      await this._deleteFileUseCase.execute({
        ownerId: actorId,
        ownerUsername: username || actorUsername,
        ownerEmail: actorEmail,
        repoName: reponame,
        branch,
        filePath,
        commitMessage,
      });
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
