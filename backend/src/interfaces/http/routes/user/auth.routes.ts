import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../../controllers/user/AuthController';
import { validate } from '../../middleware/ValidationMiddleware';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { otpLimiter, authLimiter } from 'src/shared/config/rateLimiter';
import { registerSchema, verifyOtpSchema, loginSchema } from '../../../validators/auth.validators';

const router = Router();

const authController = container.resolve(AuthController);

/**
 * Auth Routes
 * Base path: /api/auth
 */

//api/auth/register
router.post('/register', authLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), (req, res, next) =>
  authController.verifyOtp(req, res, next),
);

router.post('/login', authLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

router.get('/google', (req, res, next) => authController.googleAuth(req, res, next));
router.get('/google/callback', (req, res, next) => authController.googleCallback(req, res, next));

router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refresToken(req, res, next));
router.get('/me', authLimiter, authMiddleware, (req, res, next) =>
  authController.getMe(req, res, next),
);

router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, (req, res, next) =>
  authController.resetPassword(req, res, next),
);
router.post('resend-otp', otpLimiter, (req, res, next) => authController.resendOtp(req, res, next));

export default router;
