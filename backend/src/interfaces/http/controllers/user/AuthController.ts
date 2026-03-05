import type { Request,Response,NextFunction } from "express";
import { injectable,inject } from "tsyringe";
import { TOKENS } from "src/shared/constants/tokens";
import type { IRegisterUseCase } from "src/application/use-cases/interfaces/IRegisterUsecase";
import { HttpStatusCodes } from "src/shared/constants/HttpStatusCodes";

@injectable()
export class AuthController{
    //injecting the Registerusecase from interface (Dependency injection)
constructor(@inject(TOKENS.IRegisterUseCase) private readonly registerUser:IRegisterUseCase){}
 /**
   * POST /api/auth/register
   * Handles new user registration
   * Saves user as unverified → sends OTP to email
   */
  async register(req:Request,res:Response,next:NextFunction):Promise<void>{
     try {
        const result = await this.registerUser.execute(req.body)
        res.status(HttpStatusCodes.CREATED).json({
            success:true,
            message:result.message
        })
     } catch (error) {
        next(error)//passing the error handling middleware
     }
  }

}