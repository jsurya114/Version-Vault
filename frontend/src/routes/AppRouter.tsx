import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense,lazy } from 'react';
import AuthRoutes from './AuthRoutes';
import ProtectRoute from './ProtectedRoute';
import { ROUTES } from 'src/constants/routes';
import ErrorBoundary from 'src/components/ErrorBoundary';
import PageLoader from 'src/components/PageLoader';




const LandingPage = lazy(()=>import("../pages/LandingPage"))
const LoginPage = lazy(()=>import("../pages/auth/user/LoginPage"))
const RegisterPage = lazy(()=>import("../pages/auth/user/RegisterPage"))
const OtpVerificationPage = lazy(()=>import("../pages/auth/user/OtpVerificationPage"))
const AdminLoginPage = lazy(()=>import("../pages/auth/admin/AdminLoginPage"))

const AppRouter = () => {
  return (
    <BrowserRouter>
    <ErrorBoundary>
      <Suspense fallback={<PageLoader/>}>
      <Routes>

        {/* user */}
        <Route path={ROUTES.LANDING} element={<LandingPage/>}/>
        <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>
        <Route path={ROUTES.REGISTER} element={<RegisterPage/>}/>
        <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage/>}/>


        {/* admin */}
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage/>}/>

      </Routes>
      </Suspense>
    </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
