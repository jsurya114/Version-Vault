import { Request,Response,NextFunction } from "express";
import { injectable,inject } from "tsyringe";
import { TOKENS } from "src/shared/constants/tokens";
import { IGetAllUsersUseCase } from "src/application/use-cases/interfaces/admin/IGetAllUsersUseCase";
import { HttpStatusCodes } from "src/shared/constants/HttpStatusCodes";

@injectable()
export class AdminUserController{
    constructor(@inject(TOKENS.IGetAllUsersUseCase) private iGetAllUsers:IGetAllUsersUseCase){}

      /**
   * GET /vv/admin/users
   * Returns all users
   */

      async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const users = await this.iGetAllUsers.execute()
              res.status(HttpStatusCodes.CREATED).json({
        success: true,
        data:users
      });
        } catch (error) {
            next(error)
        }
      }
}