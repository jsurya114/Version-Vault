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
exports.RegisterUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const User_1 = require("../../../domain/entities/User");
const RegisterValidator_1 = require("../validators/RegisterValidator");
const enums_1 = require("../../../domain/enums");
const tokens_1 = require("../../../shared/constants/tokens");
let RegisterUseCase = class RegisterUseCase {
    userRepository;
    emailService;
    passwordService;
    otpService;
    registerValidator;
    constructor(userRepository, emailService, passwordService, otpService, registerValidator) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordService = passwordService;
        this.otpService = otpService;
        this.registerValidator = registerValidator;
    }
    async execute(userdto) {
        await this.registerValidator.validate(userdto);
        const hashedPassword = await this.passwordService.hash(userdto.password);
        const user = new User_1.User({
            userId: userdto.userId,
            username: userdto.username,
            email: userdto.email,
            password: hashedPassword,
            role: enums_1.UserRole.USER,
            isVerified: false,
            isBlocked: false,
            provider: enums_1.AuthProvider.LOCAL,
            subscriptionPlan: enums_1.SubscriptionPlan.FREE,
            followersCount: 0,
            followingCount: 0,
        });
        //saving the user in db
        await this.userRepository.save(user);
        // generate otp and saving it
        const otp = this.otpService.generateOtp();
        await this.otpService.saveOtp(userdto.email, otp);
        //sending otp to email
        await this.emailService.sendOtpEmail(userdto.email, otp);
        return { message: 'Registration successful. Please verify your email with the OTP sent.' };
    }
};
exports.RegisterUseCase = RegisterUseCase;
exports.RegisterUseCase = RegisterUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IEmailService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IHashService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IOtpService)),
    __param(4, (0, tsyringe_1.inject)(RegisterValidator_1.RegisterValidator)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, RegisterValidator_1.RegisterValidator])
], RegisterUseCase);
