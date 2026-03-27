import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectAuthUser } from '../features/auth/authSelectors';
import { ROUTES } from '../constants/routes';

interface PublicRoutesProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRoutesProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <>{children}</>;
};
