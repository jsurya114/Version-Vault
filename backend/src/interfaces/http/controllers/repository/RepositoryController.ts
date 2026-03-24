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
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';

import {
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { TOKENS } from '../../../../shared/constants/tokens';

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
  ) {}

  /**
   * POST /vv/repo
   * Create a new repository
   */
  async createRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, visibility } = req.body;
      const { id: ownerId, userId: ownerUsername } = req.user as ITokenPayload;

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
      const repo = await this.getRepo.execute(username, reponame);
      res.status(HttpStatusCodes.OK).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/repo
   * List all repositories for logged in user
   */

  async listRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId } = req.user as ITokenPayload;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 2,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as 'active' | 'blocked' | 'pending' | undefined,
      };
      const result = await this.listRepo.execute(ownerId, query);
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

  async deleteRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const files = await this.filesUseCase.execute(username, reponame, branch, path);
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




}
