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
exports.VerifyResetOtpUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
let VerifyResetOtpUseCase = class VerifyResetOtpUseCase {
    otpService;
    userRepo;
    constructor(otpService, userRepo) {
        this.otpService = otpService;
        this.userRepo = userRepo;
    }
    async execute(email, otp) {
        const user = await this.userRepo.findByEmail(email);
        if (!user)
            throw new NotFoundError_1.NotFoundError('Email not found');
        const isValidOtp = await this.otpService.verifyOtp(email, otp);
        if (!isValidOtp)
            throw new ValidationError_1.ValidationError('Invalid or expired OTP');
        return { message: 'OTP verified successfully' };
    }
};
exports.VerifyResetOtpUseCase = VerifyResetOtpUseCase;
exports.VerifyResetOtpUseCase = VerifyResetOtpUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IOtpService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], VerifyResetOtpUseCase);
