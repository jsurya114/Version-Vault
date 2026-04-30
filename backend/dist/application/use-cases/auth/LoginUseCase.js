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
exports.LoginUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const LoginValidator_1 = require("../validators/LoginValidator");
const tokens_1 = require("../../../shared/constants/tokens");
let LoginUseCase = class LoginUseCase {
    userRepository;
    passwordService;
    jwtService;
    loginValidator;
    constructor(userRepository, passwordService, jwtService, loginValidator) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.loginValidator = loginValidator;
    }
    async execute(userDto) {
        await this.loginValidator.validate(userDto);
        const user = await this.userRepository.findByUserId(userDto.userId);
        const payload = {
            id: user.id,
            userId: user.userId,
            role: user.role,
            email: user.email
        };
        const accessToken = await this.jwtService.generateAccessToken(payload);
        const refreshToken = await this.jwtService.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        };
    }
};
exports.LoginUseCase = LoginUseCase;
exports.LoginUseCase = LoginUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IHashService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.ITokenService)),
    __param(3, (0, tsyringe_1.inject)(LoginValidator_1.LoginValidator)),
    __metadata("design:paramtypes", [Object, Object, Object, LoginValidator_1.LoginValidator])
], LoginUseCase);
