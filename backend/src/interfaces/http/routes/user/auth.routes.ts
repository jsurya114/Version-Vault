import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../../controllers/user/AuthController';
import { validate } from '../../middleware/ValidationMiddleware';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { otpLimiter, authLimiter } from '../../../../shared/config/rateLimiter';
import { registerSchema, verifyOtpSchema, loginSchema } from '../../../validators/auth.validators';

const router = Router();

const authController = container.resolve(AuthController);

/**
 * Auth Routes
 * Base path: /api/auth
 */

//api/auth/register
router.post('/register', authLimiter, validate(registerSchema), (req: Request, res: Response, next: NextFunction) =>
  authController.register(req, res, next),
);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), (req: Request, res: Response, next: NextFunction) =>
  authController.verifyOtp(req, res, next),
);

router.post('/login', authLimiter, validate(loginSchema), (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res, next),
);

router.get('/google', (req: Request, res: Response, next: NextFunction) => authController.googleAuth(req, res, next));
router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => authController.googleCallback(req, res, next));

router.post('/logout', (req: Request, res: Response, next: NextFunction) => authController.logout(req, res, next));
router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => authController.refreshToken(req, res, next));
router.get('/me', authLimiter, authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  authController.getMe(req, res, next),
);

router.post('/forgot-password', (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next));
router.post('/verify-reset-otp', otpLimiter, (req: Request, res: Response, next: NextFunction) =>
  authController.verifyResetOtp(req, res, next),
);
router.post('/reset-password', authLimiter, (req: Request, res: Response, next: NextFunction) =>
  authController.resetPassword(req, res, next),
);
router.post('resend-otp', otpLimiter, (req: Request, res: Response, next: NextFunction) => authController.resendOtp(req, res, next));

router.get('/search', (req: Request, res: Response) => authController.globalSearch(req, res));

export default router;
