import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Google redirects to /home directly via backend cookie + redirect
    // This page handles any edge cases where redirect fails
    navigate(ROUTES.HOME, { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
