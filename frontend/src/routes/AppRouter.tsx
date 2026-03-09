import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { PublicRoute } from './PublicRoutes';
import ProtectRoute from './ProtectedRoute';
import { ROUTES } from 'src/constants/routes';
import ErrorBoundary from 'src/components/ErrorBoundary';
import PageLoader from 'src/components/PageLoader';
import { useAppDispatch } from 'src/app/hooks';
import { getMeThunk } from 'src/features/auth/authThunks';
import { AUTH_ENDPOINTS } from 'src/constants/api';
import axiosInstance from 'src/services/axiosInstance';
import { authService } from 'src/services/auth.service';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/user/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/user/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('../pages/user/auth/OtpVerificationPage'));
const GoogleCallBackpage = lazy(() => import('../pages/user/auth/GoogleCallbackPage'));

const ForgotPasswordPage = lazy(() => import('../pages/user/auth/ForgotPasswordPage'));
const ForgotPasswordOtpPage = lazy(() => import('../pages/user/auth/FogotPasswordOtpPage'));
const ResetPasswordPage = lazy(() => import('../pages/user/auth/ResetPasswordPage'));

const HomePage = lazy(() => import('../pages/user/home/HomePage'));

// admin
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        //fist refresh the token,then get user
        await authService.refreshTokenApi();
        await dispatch(getMeThunk());
      } catch (error) {
      } finally {
        setAuthChecked(true);
      }
    };
    initAuth();
  }, []);

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
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
