import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { forgotPasswordThunk } from 'src/features/auth/authThunks';
import { clearError } from 'src/features/auth/authSlice';
import {
  selectAuthError,
  selectAuthLoading,
  selectAuthSuccessMessage,
} from 'src/features/auth/authSelectors';
import { ROUTES } from 'src/constants/routes';

const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const successMessage = useAppSelector(selectAuthSuccessMessage);

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (successMessage) {
      sessionStorage.setItem('resetEmail', email);
      setTimeout(() => navigate(ROUTES.FORGOT_PASSWORD_OTP), 1500);
    }
  });

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [email]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setFieldError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Enter a valid email');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(forgotPasswordThunk(email));
  };
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-16 items-center">
        {/* Left */}
        <div className="md:w-5/12 flex flex-col gap-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enter your email address below and we'll send you a one-time password (OTP) to reset
              your account.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { title: 'Secure Process', desc: 'Your account security is our top priority' },
              { title: 'Quick Recovery', desc: 'Reset your password in minutes' },
              { title: 'Verified Access', desc: 'Secure authentication with OTP verification' },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
              >
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="md:w-5/12 w-full">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                />
                {fieldError && <p className="text-red-400 text-xs mt-1">{fieldError}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <p className="text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  Return to Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
