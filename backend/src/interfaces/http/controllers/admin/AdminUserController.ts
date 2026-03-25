import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IGetAllUsersUseCase } from '../../../../application/use-cases/interfaces/admin/IGetAllUsersUseCase';
import { IGetUserByIdUseCase } from '../../../../application/use-cases/interfaces/admin/IGetUserByIdUseCase';
import { IBlockUserUseCase } from '../../../../application/use-cases/interfaces/admin/IBlockUserUseCase';
import { IUnblockUserUseCase } from '../../../../application/use-cases/interfaces/admin/IUnblockUserUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class AdminUserController {
  constructor(
    @inject(TOKENS.IGetAllUsersUseCase) private iGetAllUsers: IGetAllUsersUseCase,
    @inject(TOKENS.IGetUserByIdUseCase) private getUser: IGetUserByIdUseCase,
    @inject(TOKENS.IBlockUserUseCase) private blockUserUseCase: IBlockUserUseCase,
    @inject(TOKENS.IUnblockUserUseCase) private unblockUserUseCase: IUnblockUserUseCase,
  ) {}

  /**
   * GET /vv/admin/users
   * Returns all users
   */

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: PaginationQueryDTO = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 5,
        sort: req.query.sort as string | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as 'active' | 'blocked' | 'pending' | undefined,
      };
      const result = await this.iGetAllUsers.execute(query);
      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /vv/admin/users/:id
   * Returns a single user by id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.getUser.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.blockUserUseCase.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async unBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.unblockUserUseCase.execute(id);
      res.status(HttpStatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
