import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IGetRepoUseCase } from 'src/application/use-cases/interfaces/repository/IGetRepoUseCase';
import { ICreateRepoUseCase } from 'src/application/use-cases/interfaces/repository/ICreateRepoUseCase';
import { IListRepoUseCase } from 'src/application/use-cases/interfaces/repository/IListRepoUseCase';
import { IDeleteRepoUsecase } from 'src/application/use-cases/interfaces/repository/IDeleteRepoUseCase';
import { HttpStatusCodes } from 'src/shared/constants/HttpStatusCodes';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { TOKENS } from 'src/shared/constants/tokens';

@injectable()
export class RepositoryController {
  constructor(
    @inject(TOKENS.IGetRepoUseCase) private getRepo: IGetRepoUseCase,
    @inject(TOKENS.ICreateRepoUseCase) private createRepo: ICreateRepoUseCase,
    @inject(TOKENS.IListRepoUseCase) private listRepo: IListRepoUseCase,
    @inject(TOKENS.IDeleteRepoUseCase) private deleteRepo: IDeleteRepoUsecase,
  ) {}

  /**
   * POST /vv/repo
   * Create a new repository
   */
  async createRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, visibility } = req.body;
      const { id: ownerId, userId: ownerUsername } = req.user!;

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
      const { id: ownerId } = req.user!;
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
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
      const { userId: ownerUsername } = req.user!;
      const { reponame } = req.params;
      await this.deleteRepo.execute(ownerUsername, reponame);
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'Repository deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
