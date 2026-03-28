import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 400 * 180 * 10000, // 15 minutes
  max: 120,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
