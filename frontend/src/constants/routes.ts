export const ROUTES = {
  //landing
  LANDING: '/',

  // Auth

  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  GOOGLE_CALLBACK: '/auth/google/callback',
  FORGOT_PASSWORD: '/auth/forgot-password',
  FORGOT_PASSWORD_OTP: '/auth/forgot-password/verify',
  RESET_PASSWORD: '/auth/reset-password',

  // User
  HOME: '/home',
  EXPLORE: '/explore',
  PROFILE: '/profile/:username',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  SUBSCRIPTION: '/subscription',

  // Repository
  REPO_LIST: '/repos',
  REPO_CREATE: '/repos/new',
  REPO_DETAIL: '/:username/:reponame',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_REPOS: '/admin/repos',

  // Error
  NOT_FOUND: '*',
} as const;
