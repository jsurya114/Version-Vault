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
exports.ResetPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    userRepo;
    otpService;
    passwordService;
    constructor(userRepo, otpService, passwordService) {
        this.userRepo = userRepo;
        this.otpService = otpService;
        this.passwordService = passwordService;
    }
    async execute(email, otp, newPassword) {
        const user = await this.userRepo.findByEmail(email);
        if (!user)
            throw new NotFoundError_1.NotFoundError('No account found with this email');
        const isValid = await this.otpService.verifyOtp(email, otp);
        if (!isValid)
            throw new ValidationError_1.ValidationError('Invalid or expired OTP');
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.userRepo.update(user.id, { password: hashedPassword });
        return { message: 'Password reset successfully' };
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IOtpService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IHashService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ResetPasswordUseCase);
