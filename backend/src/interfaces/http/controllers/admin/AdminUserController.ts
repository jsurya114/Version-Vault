import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from 'src/shared/constants/tokens';
import { IGetAllUsersUseCase } from 'src/application/use-cases/interfaces/admin/IGetAllUsersUseCase';
import { IGetUserByIdUseCase } from 'src/application/use-cases/interfaces/admin/IGetUserByIdUseCase';
import { IBlockUserUseCase } from 'src/application/use-cases/interfaces/admin/IBlockUserUseCase';
import { IUnblockUserUseCase } from 'src/application/use-cases/interfaces/admin/IUnblockUserUseCase';
import { HttpStatusCodes } from 'src/shared/constants/HttpStatusCodes';

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
      const users = await this.iGetAllUsers.execute();
      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        data: users,
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
