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
exports.VerifyOtpUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const VerifyOtpValidator_1 = require("../validators/VerifyOtpValidator");
let VerifyOtpUseCase = class VerifyOtpUseCase {
    otpService;
    userRepo;
    validator;
    constructor(otpService, userRepo, validator) {
        this.otpService = otpService;
        this.userRepo = userRepo;
        this.validator = validator;
    }
    async execute(dto) {
        await this.validator.validate(dto);
        const user = await this.userRepo.findByEmail(dto.email);
        await this.userRepo.update(user.id, { isVerified: true });
        await this.otpService.deleteOtp(dto.email);
        return { message: 'Email Verified Successfully' };
    }
};
exports.VerifyOtpUseCase = VerifyOtpUseCase;
exports.VerifyOtpUseCase = VerifyOtpUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IOtpService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(VerifyOtpValidator_1.VerifyOtpValidator)),
    __metadata("design:paramtypes", [Object, Object, VerifyOtpValidator_1.VerifyOtpValidator])
], VerifyOtpUseCase);
