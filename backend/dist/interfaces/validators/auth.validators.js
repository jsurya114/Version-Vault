"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.verifyOtpSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    userId: zod_1.z
        .string()
        .min(3, 'User ID must be at least 3 characters')
        .max(20, 'User ID must not exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'User ID can only contain letters, numbers and underscores')
        .regex(/[a-zA-Z]/, 'User ID must contain at least one letter')
        .regex(/[0-9]/, 'User ID must contain at least one number'),
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must not exceed 30 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Username can only contain letters and spaces'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});
exports.loginSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
