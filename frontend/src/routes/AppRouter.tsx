import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import ProtectRoute from './ProtectedRoute';
import { ROUTES } from 'src/constants/routes';
import ErrorBoundary from 'src/components/ErrorBoundary';
import PageLoader from 'src/components/PageLoader';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/user/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/user/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('../pages/user/auth/OtpVerificationPage'));
const GoogleCallBackpage = lazy(() => import('../pages/user/auth/GoogleCallbackPage'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const HomePage = lazy(() => import('../pages/user/home/HomePage'));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* user */}
            <Route path={ROUTES.LANDING} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
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
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
