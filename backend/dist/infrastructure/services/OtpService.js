"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const tsyringe_1 = require("tsyringe");
const RedisClient_1 = require("../Redis/RedisClient");
const env_config_1 = require("../../shared/config/env.config");
let OtpService = class OtpService {
    OTP_PREFIX = 10;
    generateOtp() {
        return Math.floor(100000 + Math.random() * 90000).toString();
    }
    async saveOtp(email, otp) {
        const key = `${this.OTP_PREFIX}${email}`;
        const expirySeconds = env_config_1.envConfig.OTP_EXPIRES_MINUTES * 60;
        await RedisClient_1.redisClient.setex(key, expirySeconds, otp);
    }
    async verifyOtp(email, otp) {
        const key = `${this.OTP_PREFIX}${email}`;
        const storedOtp = await RedisClient_1.redisClient.get(key);
        return storedOtp === otp;
    }
    async deleteOtp(email) {
        const key = `${this.OTP_PREFIX}${email}`;
        await RedisClient_1.redisClient.del(key);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, tsyringe_1.injectable)()
], OtpService);
