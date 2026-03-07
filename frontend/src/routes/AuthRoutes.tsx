import { Routes, Route } from 'react-router-dom';
import { ROUTES } from 'src/constants/routes';
import RegisterPage from 'src/pages/auth/user/RegisterPage';
import OtpVerificationPage from 'src/pages/auth/user/OtpVerificationPage';
import LoginPage from 'src/pages/auth/user/LoginPage';
import AdminLoginPage from 'src/pages/auth/admin/AdminLoginPage';

const AuthRoutes = () => {
  return (
    <Routes>
      {/* user */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>

      {/* admin  */}
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage/>}/>
    </Routes>
  );
};

export default AuthRoutes;

