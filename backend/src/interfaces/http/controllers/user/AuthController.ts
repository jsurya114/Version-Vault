import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from 'src/shared/constants/tokens';
import type { IRegisterUseCase } from 'src/application/use-cases/interfaces/IRegisterUsecase';
import type { IVerifyOtpUseCase } from 'src/application/use-cases/interfaces/IVerifyOtpUseCase';
import type { ILoginUseCase } from 'src/application/use-cases/interfaces/ILoginUseCase';
import { HttpStatusCodes } from 'src/shared/constants/HttpStatusCodes';
import { envConfig } from 'src/shared/config/env.config';

@injectable()
export class AuthController {
  //injecting the Registerusecase from interface (Dependency injection)
  constructor(
    @inject(TOKENS.IRegisterUseCase) private readonly registerUser: IRegisterUseCase,
    @inject(TOKENS.IVerifyUseCase) private readonly otpService: IVerifyOtpUseCase,
    @inject(TOKENS.ILoginUseCase) private readonly loginService:ILoginUseCase
  ) {}
  /**
   * POST /api/auth/register
   * Handles new user registration
   * Saves user as unverified → sends OTP to email
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.registerUser.execute(req.body);
      console.log(result);
      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error); //passing the error handling middleware
    }
  }

  /**
   * POST /vv/auth/verify-otp
   * Verifies OTP sent to email
   * Marks user as verified on success
   */

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.otpService.execute(req.body);
      res.status(HttpStatusCodes.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error); //passing the error handling middleware
    }
  }
/**
   * POST /vv/auth/login
   * login the user
   * 
   */

async login(req:Request,res:Response,next:NextFunction):Promise<void>{
  try {
    const result = await this.loginService.execute(req.body)
          res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(HttpStatusCodes.OK).json({ success: true, message: "Login successfull",data:result.user });
  } catch (error) {
     next(error); 
  }
}
}
