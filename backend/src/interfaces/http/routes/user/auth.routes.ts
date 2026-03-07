import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../../controllers/user/AuthController';
import { validate } from '../../middleware/ValidationMiddleware';
import { registerSchema, verifyOtpSchema,loginSchema } from '../../../validators/auth.validators';

const router = Router();

const authController = container.resolve(AuthController);

/**
 * Auth Routes
 * Base path: /api/auth
 */

//api/auth/register
router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);
router.post('/verify-otp', validate(verifyOtpSchema), (req, res, next) =>
  authController.verifyOtp(req, res, next),
);

router.post('/login',validate(loginSchema),(req,res,next)=>authController.login(req,res,next))

export default router;
