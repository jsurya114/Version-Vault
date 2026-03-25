import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../shared/constants/tokens';
import type { IRegisterUseCase } from '../../../../application/use-cases/interfaces/IRegisterUsecase';
import type { IVerifyOtpUseCase } from '../../../../application/use-cases/interfaces/IVerifyOtpUseCase';
import type { ILoginUseCase } from '../../../../application/use-cases/interfaces/ILoginUseCase';
import type { IGoogleAuthUseCase } from '../../../../application/use-cases/interfaces/IGoogleUseCase';
import type { IGoogleAuthService } from '../../../../domain/interfaces/services/IGoogleAuthService';
import type { IlogoutUseCase } from '../../../../application/use-cases/interfaces/ILogoutUseCase';
import type { IRefreshTokenUseCase } from '../../../../application/use-cases/interfaces/IRefreshTokenUseCase';
import type { IGetMeUseCase } from '../../../../application/use-cases/interfaces/IGetMeUseCase';
import type { IForgotPasswordUseCase } from '../../../../application/use-cases/interfaces/IForgotPasswordUseCase';
import type { IResetPasswordUseCase } from '../../../../application/use-cases/interfaces/IResetPasswordUseCase';
import type { IResendOtpUseCase } from '../../../../application/use-cases/interfaces/IResendOtpUseCase';

import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';

import { envConfig } from '../../../../shared/config/env.config';
import { IGetAllUsersUseCase } from 'src/application/use-cases/interfaces/admin/IGetAllUsersUseCase';

@injectable()
export class AuthController {
  //injecting the Registerusecase from interface (Dependency injection)
  constructor(
    @inject(TOKENS.IRegisterUseCase) private readonly registerUser: IRegisterUseCase,
    @inject(TOKENS.IVerifyUseCase) private readonly otpService: IVerifyOtpUseCase,
    @inject(TOKENS.ILoginUseCase) private readonly loginService: ILoginUseCase,
    @inject(TOKENS.IGoogleAuthUseCase) private readonly googleUseCase: IGoogleAuthUseCase,
    @inject(TOKENS.IGoogleAuthService) private readonly googleAuthService: IGoogleAuthService,
    @inject(TOKENS.ILogoutUseCase) private readonly logoutUseCase: IlogoutUseCase,
    @inject(TOKENS.IRefreshTokenUseCase) private readonly refreshUseCase: IRefreshTokenUseCase,
    @inject(TOKENS.IGetMeUseCase) private readonly getmeUseCase: IGetMeUseCase,
    @inject(TOKENS.IForgotPasswordUseCase)
    private readonly forgotpasswordUseCase: IForgotPasswordUseCase,
    @inject(TOKENS.IResetPasswordUseCase)
    private readonly resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TOKENS.IResendOtpUseCase) private readonly resendOtpUseCase: IResendOtpUseCase,
    @inject(TOKENS.IGetAllUsersUseCase) private readonly _getAllUsersUseCase: IGetAllUsersUseCase,
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

  /**
   * POST /vv/auth/logout
   */

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || '';
      await this.logoutUseCase.execute(refreshToken);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /vv/auth/refresh-token
   */

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ success: false, message: 'No refresh token' });
        return;
      }
      const result = await this.refreshUseCase.execute(refreshToken);
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await this.getmeUseCase.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /vv/auth/forgot-password
   */

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.forgotpasswordUseCase.execute(email);
      res.status(HttpStatusCodes.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /vv/auth/reset-password
   */

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await this.resetPasswordUseCase.execute(email, otp, newPassword);
      res.status(HttpStatusCodes.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /vv/auth/resend-otp
   */

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.resendOtpUseCase.execute(email);
      res.status(HttpStatusCodes.OK).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async globalSearch(req: Request, res: Response) {
    const query = {
      search: req.query.q as string,
      limit: 5,
      page: 1,
    };

    const result = await this._getAllUsersUseCase.execute(query);
    return res.status(HttpStatusCodes.OK).json({
      success: true,
      data: result.data,
    });
  }
}
