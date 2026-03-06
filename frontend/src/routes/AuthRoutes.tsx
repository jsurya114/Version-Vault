import { Routes, Route } from 'react-router-dom';
import { ROUTES } from 'src/constants/routes';
import RegisterPage from 'src/pages/auth/RegisterPage';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
    </Routes>
  );
};

export default AuthRoutes;
