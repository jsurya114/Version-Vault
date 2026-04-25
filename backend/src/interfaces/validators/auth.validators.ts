import { z } from 'zod';

export const registerSchema = z
  .object({
    userId: z
      .string()
      .min(3, 'User ID must be at least 3 characters')
      .max(20, 'User ID must not exceed 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'User ID can only contain letters, numbers and underscores')
      .regex(/[a-zA-Z]/, 'User ID must contain at least one letter')
      .regex(/[0-9]/, 'User ID must contain at least one number'),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Username can only contain letters and spaces'),

    email: z.string().email('Invalid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),

  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

export const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),

  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
