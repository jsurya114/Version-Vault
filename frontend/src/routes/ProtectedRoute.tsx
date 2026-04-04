import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectAuthUser } from '../features/auth/authSelectors';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

 // Not logged in — redirect to login with `redirect` query param
  if (!isAuthenticated) {
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  //admin route but user is not admin redirect to home
  if (requiredRole === 'admin' && user && user.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  //User route but user is admin redirect to admin dashboard
  if (requiredRole === 'user' && user?.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default ProtectRoute;
