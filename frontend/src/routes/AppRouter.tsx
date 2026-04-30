import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { PublicRoute } from './PublicRoutes';
import ProtectRoute from './ProtectedRoute';
import { ROUTES } from '../constants/routes';
import ErrorBoundary from '../components/ErrorBoundary';
import PageLoader from '../components/PageLoader';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getMeThunk } from '../features/auth/authThunks';
import { authService } from '../services/auth.service';
import { selectIsAuthenticated, selectAccessToken } from '../features/auth/authSelectors';
import { socketService } from '../services/socketService';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/user/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/user/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('../pages/user/auth/OtpVerificationPage'));
const GoogleCallBackpage = lazy(() => import('../pages/user/auth/GoogleCallbackPage'));

const ForgotPasswordPage = lazy(() => import('../pages/user/auth/ForgotPasswordPage'));
const ForgotPasswordOtpPage = lazy(() => import('../pages/user/auth/FogotPasswordOtpPage'));
const ResetPasswordPage = lazy(() => import('../pages/user/auth/ResetPasswordPage'));

const HomePage = lazy(() => import('../pages/user/home/HomePage'));
const UserProfilePage = lazy(() => import('../pages/user/home/UserProfilePage'));

// admin
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/AdminUserDetailPage'));
const AdminRepositoriesPage = lazy(() => import('../pages/admin/AdminRepositoriesPage'));
const AdminRepositoryDetailPage = lazy(() => import('../pages/admin/AdminRepositoryDetailPage'));

//repository
const RepositoryListPage = lazy(() => import('../pages/repository/RepositoryListPage'));
const CreateRepositoryPage = lazy(() => import('../pages/repository/CreateRepositoryPage'));
const RepositoryDetailPage = lazy(() => import('../pages/repository/RepositoryDetailPage'));
const BranchListPage = lazy(() => import('../pages/repository/BranchListPage'));

//pullrequests
const PRListPage = lazy(() => import('../pages/pullrequest/PRListPage'));
const PRDetailPage = lazy(() => import('../pages/pullrequest/PRDetailPage'));
const CreatePRPage = lazy(() => import('../pages/pullrequest/CreatePRPage'));
const PRFormPage = lazy(() => import('../pages/pullrequest/PRFormPage'));

//Issues Page
const IssueListPage = lazy(() => import('../pages/issues/IssueListPage'));
const CreateIssuePage = lazy(() => import('../pages/issues/CreateIssuePage'));
const IssueDetailPage = lazy(() => import('../pages/issues/IssueDetailPage'));

//commits
const CompareCommitPage = lazy(() => import('../pages/pullrequest/CompareCommitPage'));
const CommitDetailPage = lazy(() => import('../pages/pullrequest/CommitDetailPage'));
const AcceptInvitationPage = lazy(() => import('../pages/collaborators/AcceptInvitationPage'));

//actions (ci/cd)
const ActionsPage = lazy(() => import('../pages/repository/ActionsPage'));

//chat
const ChatRoomPage = lazy(() => import('../pages/user/home/ChatRoomPage'));

//subscription
import SubscriptionPage from '../pages/repository/subscription/SubscriptionPage';

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const accessToken = useAppSelector(selectAccessToken);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.refreshTokenApi();
        await dispatch(getMeThunk()).unwrap();
      } catch (error) {
        console.error('Initial auth check failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    if (!authChecked) initAuth();
  }, [dispatch, authChecked]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.initSocket(accessToken);
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, accessToken]);

  // shows loader until auth check completes
  if (!authChecked) return <PageLoader />;
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* user */}
            <Route
              path={ROUTES.LANDING}
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.VERIFY_OTP}
              element={
                <PublicRoute>
                  <OtpVerificationPage />
                </PublicRoute>
              }
            />
            <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallBackpage />} />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD_OTP}
              element={
                <PublicRoute>
                  <ForgotPasswordOtpPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.RESET_PASSWORD}
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            <Route
              path={ROUTES.HOME}
              element={
                <ProtectRoute requiredRole="user">
                  <HomePage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectRoute>
                  <UserProfilePage />
                </ProtectRoute>
              }
            />

            {/* admin */}
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
            {/* Protected admin routes */}
            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={
                <ProtectRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_USERS}
              element={
                <ProtectRoute requiredRole="admin">
                  <AdminUsersPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_USER_DETAIL}
              element={
                <ProtectRoute requiredRole="admin">
                  <AdminUserDetailPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_REPOS}
              element={
                <ProtectRoute requiredRole="admin">
                  <AdminRepositoriesPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_REPO_DETAIL}
              element={
                <ProtectRoute requiredRole="admin">
                  <AdminRepositoryDetailPage />
                </ProtectRoute>
              }
            />

            {/* repositories */}
            <Route
              path={ROUTES.ACCEPT_INVITATION}
              element={
                <ProtectRoute>
                  <AcceptInvitationPage />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.REPO_LIST}
              element={
                <ProtectRoute>
                  <RepositoryListPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.REPO_CREATE}
              element={
                <ProtectRoute>
                  <CreateRepositoryPage />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.REPO_COMPARE}
              element={
                <ProtectRoute>
                  <CompareCommitPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.COMMIT_DETAIL}
              element={
                <ProtectRoute>
                  <CommitDetailPage />
                </ProtectRoute>
              }
            />

            {/* PR Routes — before REPO_DETAIL to avoid conflict */}
            <Route
              path={ROUTES.PR_LIST}
              element={
                <ProtectRoute>
                  <PRListPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.PR_CREATE}
              element={
                <ProtectRoute>
                  <CreatePRPage />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.SUBSCRIPTION}
              element={
                <ProtectRoute>
                  <SubscriptionPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.PR_FORM}
              element={
                <ProtectRoute>
                  <PRFormPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.PR_DETAIL}
              element={
                <ProtectRoute>
                  <PRDetailPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.BRANCH_LIST}
              element={
                <ProtectRoute>
                  <BranchListPage />
                </ProtectRoute>
              }
            />

            {/* Issue Routes — before REPO_DETAIL */}
            <Route
              path={ROUTES.ISSUE_LIST}
              element={
                <ProtectRoute>
                  <IssueListPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ISSUE_CREATE}
              element={
                <ProtectRoute>
                  <CreateIssuePage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.ISSUE_DETAIL}
              element={
                <ProtectRoute>
                  <IssueDetailPage />
                </ProtectRoute>
              }
            />

            {/* CI/CD Actions */}
            <Route
              path={ROUTES.ACTIONS}
              element={
                <ProtectRoute>
                  <ActionsPage />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.REPO_CHAT}
              element={
                <ProtectRoute>
                  <ChatRoomPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.CHAT_LIST}
              element={
                <ProtectRoute>
                  <ChatRoomPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.REPO_DETAIL}
              element={
                <ProtectRoute>
                  <RepositoryDetailPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.REPO_BRANCH_DETAIL}
              element={
                <ProtectRoute>
                  <RepositoryDetailPage />
                </ProtectRoute>
              }
            />
            {/* Alias for profile using username/id directly */}
            <Route
              path="/:userId"
              element={
                <ProtectRoute>
                  <UserProfilePage />
                </ProtectRoute>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
