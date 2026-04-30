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
exports.GoogleAuthUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const User_1 = require("../../../domain/entities/User");
const enums_1 = require("../../../domain/enums");
let GoogleAuthUseCase = class GoogleAuthUseCase {
    googleAuthService;
    userRepository;
    tokenService;
    constructor(googleAuthService, userRepository, tokenService) {
        this.googleAuthService = googleAuthService;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    async execute(code) {
        const tokens = await this.googleAuthService.getTokenFromCode(code);
        const googleUser = await this.googleAuthService.getUserInfo(tokens.idToken);
        let user = await this.userRepository.findByEmail(googleUser.email);
        if (!user) {
            const username = googleUser.email.split('@')[0] + '_' + Date.now();
            user = new User_1.User({
                userId: username,
                username,
                email: googleUser.email,
                password: '',
                avatar: googleUser.avatar,
                role: enums_1.UserRole.USER,
                subscriptionPlan: enums_1.SubscriptionPlan.FREE,
                provider: enums_1.AuthProvider.GOOGLE,
                isVerified: true,
                isBlocked: false,
                followersCount: 0,
                followingCount: 0,
            });
            user = await this.userRepository.save(user);
        }
        const accessToken = this.tokenService.generateAccessToken({
            id: user.id,
            userId: user.userId,
            role: user.role,
            email: user.email
        });
        const refreshToken = this.tokenService.generateRefreshToken({
            id: user.id,
            userId: user.userId,
            role: user.role,
            email: user.email
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar || '',
                role: user.role,
            },
        };
    }
};
exports.GoogleAuthUseCase = GoogleAuthUseCase;
exports.GoogleAuthUseCase = GoogleAuthUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGoogleAuthService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.ITokenService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], GoogleAuthUseCase);
