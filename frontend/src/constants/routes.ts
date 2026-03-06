export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: 'auth/register',
  VERIFY_OTP: '/verify-otp',
  GOOGLE_CALLBACK: '/auth/google/callback',

  // User
  HOME: '/',
  EXPLORE: '/explore',
  PROFILE: '/profile/:username',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  SUBSCRIPTION: '/subscription',

  // Repository
  REPO_LIST: '/repos',
  REPO_DETAIL: '/:username/:reponame',
  REPO_CREATE: '/new',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPOS: '/admin/repos',

  // Error
  NOT_FOUND: '*',
} as const;
