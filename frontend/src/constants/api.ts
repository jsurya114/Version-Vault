export const API_BASE_URL = 'http://localhost:3125/vv';

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  GOOGLE_AUTH: '/auth/google',
} as const;
