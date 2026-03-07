import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'src/app/hooks';
import { selectIsAuthenticated, selectAuthUser } from 'src/features/auth/authSelectors';
import { ROUTES } from 'src/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  //not logged in redirect to login
  if (!isAuthenticated && user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  //admin route but user is not admin redirect to home
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  //User route but user is admin redirect to admin dashboard
  if (requiredRole === 'user' && user?.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default ProtectRoute;
