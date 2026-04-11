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
  PROFILE: '/profile/:userId',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  SUBSCRIPTION: '/subscription',

  // Repository
  REPO_LIST: '/repos',
  REPO_CREATE: '/repos/new',
  REPO_DETAIL: '/:username/:reponame',
  REPO_BRANCH_DETAIL: '/:username/:reponame/tree/*',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_REPOS: '/admin/repositories',
  ADMIN_REPO_DETAIL: '/admin/repositories/:id',

  // pull requests
  PR_LIST: '/:username/:reponame/pulls',
  PR_CREATE: '/:username/:reponame/pulls/new',
  PR_FORM: '/:username/:reponame/pulls/new/form',
  PR_DETAIL: '/:username/:reponame/pulls/:id',

  // issues
  ISSUE_LIST: '/:username/:reponame/issues',
  ISSUE_CREATE: '/:username/:reponame/issues/new',
  ISSUE_DETAIL: '/:username/:reponame/issues/:id',

  //branch
  BRANCH_LIST: '/:username/:reponame/branches',

  //compare
  REPO_COMPARE: '/:username/:reponame/compare/*',
  COMMIT_DETAIL: '/:username/:reponame/commit/:hash',

  // Invitation
  ACCEPT_INVITATION: '/invitation/accept/:token',

  //chats
  REPO_CHAT: '/:username/:reponame/chat',
  CHAT_LIST: '/chat',

  // Error
  NOT_FOUND: '*',
} as const;
