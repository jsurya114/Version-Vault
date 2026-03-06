import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthRoutes />
    </BrowserRouter>
  );
};

export default AppRouter;
