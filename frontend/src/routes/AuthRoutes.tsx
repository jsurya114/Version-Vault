import { Routes, Route } from 'react-router-dom';
import { ROUTES } from 'src/constants/routes';
import RegisterPage from 'src/pages/auth/RegisterPage';
import OtpVerificationPage from 'src/pages/auth/OtpVerificationPage';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
    </Routes>
  );
};

export default AuthRoutes;
