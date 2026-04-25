export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3125/vv';

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  GOOGLE_AUTH: '/auth/google',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  RESET_PASSWORD: '/auth/reset-password',
  RESEND_OTP: '/auth/resend-otp',
} as const;

export const ADMIN_ENDPOINTS = {
  GET_ALL_USERS: '/admin/users',
  BLOCK_USER: '/admin/users/block',
  UNBLOCK_USER: '/admin/users/unblock',
  GET_ALL_REPOS: '/admin/repositories',
} as const;

export const REPO_ENDPOINTS = {
  CREATE: '/repo',
  LIST: '/repo',
  GET: '/repo',
  DELETE: '/repo',
  UPLOAD: '/repo/upload',
} as const;

export const PR_ENDPOINTS = {
  BASE: 'pr',
};

export const ISSUE_ENDPOINTS = {
  BASE: 'issues',
};

export const FOLLOW_ENDPOINTS = {
  BASE: '/follow',
} as const;

export const USER_ENDPOINTs = {
  BASE: '/user',
  UPDATE_PROFILE: '/user/profile',
} as const;

export const COLLABORATOR_ENDPOINTS = {
  BASE: '/collaborators',
} as const;

export const COMMENT_ENDPOINTS = {
  BASE: '/comments',
} as const;

export const CHAT_ENDPOINTS = {
  BASE: '/chats',
  CONVERSATIONS: '/chats/conversations',
};

export const AIAGENT_ENDPOINTS = {
  BASE: 'ai-agent',
};

export const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
} as const;

export const SUBSCRIPTION_ENDPOINTS = {
  BASE: '/subscription',
  CHECKOUT: '/subscription/checkout',
  STATUS: '/subscription/status',
  CANCEL: '/subscription/cancel',
} as const;
