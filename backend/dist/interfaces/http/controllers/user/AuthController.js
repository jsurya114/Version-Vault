"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const env_config_1 = require("../../../../shared/config/env.config");
let AuthController = class AuthController {
    registerUser;
    otpService;
    loginService;
    googleUseCase;
    googleAuthService;
    logoutUseCase;
    refreshUseCase;
    getmeUseCase;
    forgotpasswordUseCase;
    resetPasswordUseCase;
    resendOtpUseCase;
    verifyResetOtpUseCase;
    _getAllUsersUseCase;
    _logger;
    //injecting the Registerusecase from interface (Dependency injection)
    constructor(registerUser, otpService, loginService, googleUseCase, googleAuthService, logoutUseCase, refreshUseCase, getmeUseCase, forgotpasswordUseCase, resetPasswordUseCase, resendOtpUseCase, verifyResetOtpUseCase, _getAllUsersUseCase, _logger) {
        this.registerUser = registerUser;
        this.otpService = otpService;
        this.loginService = loginService;
        this.googleUseCase = googleUseCase;
        this.googleAuthService = googleAuthService;
        this.logoutUseCase = logoutUseCase;
        this.refreshUseCase = refreshUseCase;
        this.getmeUseCase = getmeUseCase;
        this.forgotpasswordUseCase = forgotpasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.resendOtpUseCase = resendOtpUseCase;
        this.verifyResetOtpUseCase = verifyResetOtpUseCase;
        this._getAllUsersUseCase = _getAllUsersUseCase;
        this._logger = _logger;
    }
    /**
     * POST /api/auth/register
     * Handles new user registration
     * Saves user as unverified → sends OTP to email
     */
    async register(req, res, next) {
        try {
            const result = await this.registerUser.execute(req.body);
            this._logger.info(`User registered: ${result.message}`);
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error); //passing the error handling middleware
        }
    }
    /**
     * POST /vv/auth/verify-otp
     * Verifies OTP sent to email
     * Marks user as verified on success
     */
    async verifyOtp(req, res, next) {
        try {
            const result = await this.otpService.execute(req.body);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error); //passing the error handling middleware
        }
    }
    /**
     * POST /vv/auth/login
     * login the user
     *
     */
    async login(req, res, next) {
        try {
            const result = await this.loginService.execute(req.body);
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Login successfull',
                data: result.user,
                accessToken: result.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/auth/google
     * Redirects user to Google OAuth consent screen
     */
    async googleAuth(req, res, next) {
        try {
            const authUrl = this.googleAuthService.getAuthUrl();
            res.redirect(authUrl);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/auth/google/callback
     * Handles Google OAuth callback
     * Sets cookies and redirects to frontend
     */
    async googleCallback(req, res, next) {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.BAD_REQUEST)
                    .json({ success: false, message: 'No code provided' });
                return;
            }
            const result = await this.googleUseCase.execute(code);
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.redirect(`${env_config_1.envConfig.CLIENT_URL}/home`);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/logout
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || '';
            await this.logoutUseCase.execute(refreshToken);
            const cookieOptions = {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: (env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict'),
            };
            res.clearCookie('accessToken', cookieOptions);
            res.clearCookie('refreshToken', cookieOptions);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/refresh-token
     */
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED)
                    .json({ success: false, message: 'No refresh token' });
                return;
            }
            const result = await this.refreshUseCase.execute(refreshToken);
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: env_config_1.envConfig.NODE_ENV === 'production',
                sameSite: env_config_1.envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 15 * 60 * 1000,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Token refreshed',
                accessToken: result.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userId = req.user?.userId;
            if (!userId) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const user = await this.getmeUseCase.execute(userId);
            const token = req.cookies?.accessToken;
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: user, accessToken: token });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/forgot-password
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.forgotpasswordUseCase.execute(email);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/verify-reset-otp
     */
    async verifyResetOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await this.verifyResetOtpUseCase.execute(email, otp);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/reset-password
     */
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await this.resetPasswordUseCase.execute(email, otp, newPassword);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/auth/resend-otp
     */
    async resendOtp(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.resendOtpUseCase.execute(email);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    }
    async globalSearch(req, res) {
        const query = {
            search: req.query.q,
            limit: 5,
            page: 1,
        };
        const result = await this._getAllUsersUseCase.execute(query);
        return res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
            success: true,
            data: result.data,
        });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRegisterUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IVerifyUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.ILoginUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGoogleAuthUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGoogleAuthService)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.ILogoutUseCase)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRefreshTokenUseCase)),
    __param(7, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetMeUseCase)),
    __param(8, (0, tsyringe_1.inject)(tokens_1.TOKENS.IForgotPasswordUseCase)),
    __param(9, (0, tsyringe_1.inject)(tokens_1.TOKENS.IResetPasswordUseCase)),
    __param(10, (0, tsyringe_1.inject)(tokens_1.TOKENS.IResendOtpUseCase)),
    __param(11, (0, tsyringe_1.inject)(tokens_1.TOKENS.IVerifyResetOtpUseCase)),
    __param(12, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetAllUsersUseCase)),
    __param(13, (0, tsyringe_1.inject)(tokens_1.TOKENS.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AuthController);
