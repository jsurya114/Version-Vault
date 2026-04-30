"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_config_1 = require("./env.config");
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.envConfig.RATE_LIMIT_WINDOW_MS,
    max: env_config_1.envConfig.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: `Too many requests, please try again after ${env_config_1.envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.envConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: env_config_1.envConfig.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: `Too many requests, please try again after ${env_config_1.envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.envConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: env_config_1.envConfig.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: `Too many requests, please try again after ${env_config_1.envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
