export const API_BASE_URL = 'http://localhost:3125/vv';

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  GOOGLE_AUTH: '/auth/google',
  ME: '/auth/me',
} as const;

export const ADMIN_ENDPOINTS = {
  GET_ALL_USERS: '/admin/users',
  BLOCK_USER: '/admin/users/block',
  UNBLOCK_USER: '/admin/users/unblock',
} as const;
