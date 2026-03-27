import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { resetPasswordThunk } from '../../../features/auth/authThunks';
import { clearError, clearSuccessMessage } from '../../../features/auth/authSlice';
import {
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccessMessage,
} from '../../../features/auth/authSelectors';
import { ROUTES } from '../../../constants/routes';

const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  error: err,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  error?: string;
}) => (
  <div>
    <label className="block text-sm text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
      >
        {show ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
    {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
  </div>
);

const ResetPasswordPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const successMessage = useAppSelector(selectAuthSuccessMessage);

  const email = sessionStorage.getItem('resetEmail') || '';
  const otp = sessionStorage.getItem('resetOtp') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!email || !otp) navigate(ROUTES.FORGOT_PASSWORD);
  }, []);
  useEffect(() => {
    dispatch(clearSuccessMessage());
  }, []);
  useEffect(() => {
    if (successMessage) {
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOtp');
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [newPassword, confirmPassword]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newPassword) errors.newPassword = 'Password is required';
    else if (newPassword.length < 8) errors.newPassword = 'Minimum 8 characters';
    else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword))
      errors.newPassword = 'Must include uppercase, number and symbol';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(resetPasswordThunk({ email, otp, newPassword }));
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
            <h1 className="text-3xl font-bold text-white mb-2">Create new password</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Choose a strong password for your account to keep your repositories secure.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Password Strength',
                desc: 'Use at least 12 characters with numbers and symbols',
              },
              { title: 'Avoid Patterns', desc: "Don't use common sequences like '1234' or 'abcd'" },
              { title: 'Unique Password', desc: 'Never reuse passwords from other accounts' },
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
                <p className="text-green-400 text-sm">✓ {successMessage} Redirecting to login...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Enter your new password"
                error={fieldErrors.newPassword}
              />
              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                placeholder="Re-type your password"
                error={fieldErrors.confirmPassword}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2"
              >
                {isLoading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
