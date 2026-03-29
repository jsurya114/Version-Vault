import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IGetAllRepoUseCase } from '../../../../application/use-cases/interfaces/admin/IGetAllReposUseCase';
import { IGetRepoByIdUseCase } from '../../../../application/use-cases/interfaces/admin/IGetRepoByIdUseCase';
import { IBlockRepoUseCase } from '../../../../application/use-cases/interfaces/admin/IBlockRepoUseCase';
import { IUnblockRepoUseCase } from '../../../../application/use-cases/interfaces/admin/IUnblockRepoUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';

@injectable()
export class AdminRepoController {
  constructor(
    @inject(TOKENS.IGetAllRepoUseCase) private _getAllRepo: IGetAllRepoUseCase,
    @inject(TOKENS.IGetRepoByIdUseCase) private _getRepo: IGetRepoByIdUseCase,
    @inject(TOKENS.IBlockRepoUseCase) private _blockRepo: IBlockRepoUseCase,
    @inject(TOKENS.IUnblockRepoUseCase) private _unblockRepo: IUnblockRepoUseCase,
  ) {}

  async getAllRepositories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 5,
        search: req.query.search as string,
        status: req.query.status as 'active' | 'blocked' | undefined,
        sort: req.query.sort as string,
        order: req.query.order as 'asc' | 'desc',
      };
      const result = await this._getAllRepo.execute(query);
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

  async getRepoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = await this._getRepo.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }

  async blockRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = await this._blockRepo.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }
  async unblockRepository(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = await this._unblockRepo.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: repo });
    } catch (error) {
      next(error);
    }
  }
}
