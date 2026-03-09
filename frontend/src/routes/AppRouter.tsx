import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { PublicRoute } from './PublicRoutes';
import ProtectRoute from './ProtectedRoute';
import { ROUTES } from 'src/constants/routes';
import ErrorBoundary from 'src/components/ErrorBoundary';
import PageLoader from 'src/components/PageLoader';
import { useAppDispatch } from 'src/app/hooks';
import { getMeThunk } from 'src/features/auth/authThunks';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/user/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/user/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('../pages/user/auth/OtpVerificationPage'));
const GoogleCallBackpage = lazy(() => import('../pages/user/auth/GoogleCallbackPage'));

const HomePage = lazy(() => import('../pages/user/home/HomePage'));

// admin
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    dispatch(getMeThunk()).finally(() => {
      setAuthChecked(true);
    });
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
