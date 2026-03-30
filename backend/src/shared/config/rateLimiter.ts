import rateLimit from 'express-rate-limit';
import { envConfig } from './env.config';

export const globalLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: `Too many requests, please try again after ${envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: `Too many requests, please try again after ${envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: `Too many requests, please try again after ${envConfig.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
