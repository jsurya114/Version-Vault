import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from 'src/shared/constants/tokens';
import type { IRegisterUseCase } from 'src/application/use-cases/interfaces/IRegisterUsecase';
import type { IVerifyOtpUseCase } from 'src/application/use-cases/interfaces/IVerifyOtpUseCase';
import type { ILoginUseCase } from 'src/application/use-cases/interfaces/ILoginUseCase';
import type { IGoogleAuthUseCase } from 'src/application/use-cases/interfaces/IGoogleUseCase';
import type { IGoogleAuthService } from 'src/domain/interfaces/services/IGoogleAuthService';
import { HttpStatusCodes } from 'src/shared/constants/HttpStatusCodes';
import { envConfig } from 'src/shared/config/env.config';

@injectable()
export class AuthController {
  //injecting the Registerusecase from interface (Dependency injection)
  constructor(
    @inject(TOKENS.IRegisterUseCase) private readonly registerUser: IRegisterUseCase,
    @inject(TOKENS.IVerifyUseCase) private readonly otpService: IVerifyOtpUseCase,
    @inject(TOKENS.ILoginUseCase) private readonly loginService: ILoginUseCase,
    @inject(TOKENS.IGoogleAuthUseCase) private readonly googleUseCase: IGoogleAuthUseCase,
    @inject(TOKENS.IGoogleAuthService) private readonly googleAuthService: IGoogleAuthService,
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

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.loginService.execute(req.body);
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
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'Login successfull', data: result.user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vv/auth/google
   * Redirects user to Google OAuth consent screen
   */
  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUrl = this.googleAuthService.getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /vv/auth/google/callback
   * Handles Google OAuth callback
   * Sets cookies and redirects to frontend
   */

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'No code provided' });
        return;
      }

      const result = await this.googleUseCase.execute(code);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect(`${envConfig.CLIENT_URL}/home`);
    } catch (error) {
      next(error);
    }
  }
}
