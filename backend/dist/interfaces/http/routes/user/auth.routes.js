"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const AuthController_1 = require("../../controllers/user/AuthController");
const ValidationMiddleware_1 = require("../../middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const rateLimiter_1 = require("../../../../shared/config/rateLimiter");
const auth_validators_1 = require("../../../validators/auth.validators");
const router = (0, express_1.Router)();
const authController = tsyringe_1.container.resolve(AuthController_1.AuthController);
/**
 * Auth Routes
 * Base path: /api/auth
 */
//api/auth/register
router.post('/register', rateLimiter_1.authLimiter, (0, ValidationMiddleware_1.validate)(auth_validators_1.registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/verify-otp', rateLimiter_1.otpLimiter, (0, ValidationMiddleware_1.validate)(auth_validators_1.verifyOtpSchema), (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/login', rateLimiter_1.authLimiter, (0, ValidationMiddleware_1.validate)(auth_validators_1.loginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/google', (req, res, next) => authController.googleAuth(req, res, next));
router.get('/google/callback', (req, res, next) => authController.googleCallback(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.get('/me', rateLimiter_1.authLimiter, AuthMiddleware_1.authMiddleware, (req, res, next) => authController.getMe(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/verify-reset-otp', rateLimiter_1.otpLimiter, (req, res, next) => authController.verifyResetOtp(req, res, next));
router.post('/reset-password', rateLimiter_1.authLimiter, (req, res, next) => authController.resetPassword(req, res, next));
router.post('resend-otp', rateLimiter_1.otpLimiter, (req, res, next) => authController.resendOtp(req, res, next));
router.get('/search', (req, res) => authController.globalSearch(req, res));
exports.default = router;
