import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { LogoIcon } from '../../../types/common/Layout/AppHeader';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { verifyOtpThunk } from '../../../features/auth/authThunks';
import { clearError, clearSuccessMessage } from '../../../features/auth/authSlice';

import {
  selectAuthLoading,
  selectAuthSuccessMessage,
  selectAuthError,
  selectRegisteredEmail,
} from '../../../features/auth/authSelectors';
import { ROUTES } from '../../../constants/routes';
import { CommonLoader } from '../../../types/common/Layout/Loader';
import { ErrorSonar } from '../../../types/common/Layout/ErrorSonar';

const OtpVerificationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const successMessage = useAppSelector(selectAuthSuccessMessage);
  const registeredEmail = useAppSelector(selectRegisteredEmail);

  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [errorSonar, setErrorSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (successMessage) {
      setIsVerified(true);
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate(ROUTES.LOGIN);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, navigate]);

  useEffect(() => {
    if (error) dispatch(clearError());
    setErrorSonar((prev) => ({ ...prev, isOpen: false }));
  }, [otp, dispatch, error]);

  const validate = (): boolean => {
    if (!otp.trim()) {
      setFieldError('OTP is required');
      return false;
    }
    if (otp.length !== 6) {
      setFieldError('OTP must be 6 digits');
      return false;
    }
    if (!/^[0-9]+$/.test(otp)) {
      setFieldError('OTP must contain only numbers');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!registeredEmail) return;

    setLocalLoading(true);
    const startTime = Date.now();

    // Trigger the actual verification
    const result = await dispatch(verifyOtpThunk({ email: registeredEmail, otp }));

    // Enforce a minimum 2s delay for the loader
    const duration = Date.now() - startTime;
    const minDelay = 2000;

    setTimeout(
      () => {
        setLocalLoading(false);

        if (verifyOtpThunk.rejected.match(result)) {
          setErrorSonar({
            isOpen: true,
            title: 'Verification Failed',
            subtitle:
              (result.payload as string) || 'The OTP you entered is incorrect or has expired.',
          });
        }
        // Success is still handled by the useEffect watching successMessage
      },
      Math.max(0, minDelay - duration),
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* SUCCESS OVERLAY - Centered with transparent/blurred background */}
      {isVerified && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 backdrop-blur-xl animate-in fade-in duration-700">
          <div className="bg-gray-900/80 border border-green-500/30 rounded-[2.5rem] p-10 xs:p-12 flex flex-col items-center shadow-[0_0_80px_-15px_rgba(34,197,94,0.4)] animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-inner">
              <Check className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
              Verification Successful!
            </h2>
            <p className="text-gray-400 text-center text-sm max-w-[280px] leading-relaxed">
              Your VersionVault account is now active. Redirecting you to login...
            </p>
          </div>
        </div>
      )}

      {/* THE OTP FORM - Only visible when not verified */}
      {!isVerified && (
        <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800 transition-all duration-500">
          <div className="flex flex-col items-center text-center mb-8">
            <LogoIcon className="w-12 h-12 mb-3" />
            <h1 className="text-3xl font-bold text-white tracking-tight">VersionVault</h1>
            <p className="text-gray-400 mt-2 text-sm">Verify your email</p>
          </div>

          {/* Info */}
          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <p className="text-indigo-400 text-sm text-center">
              OTP sent to <span className="font-semibold">{registeredEmail}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-center text-2xl tracking-widest font-mono"
              />
              {fieldError && <p className="text-red-400 text-xs mt-1">{fieldError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || localLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition mt-2 shadow-lg shadow-indigo-500/20"
            >
              {isLoading || localLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend OTP */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Didn't receive OTP?{' '}
            <button
              className="text-indigo-400 hover:text-indigo-300 transition font-medium"
              onClick={() => {}}
            >
              Resend OTP
            </button>
          </p>
        </div>
      )}

      {/* LOADER */}
      {(isLoading || localLoading) && (
        <CommonLoader message="Please wait, verifying your account..." />
      )}

      {/* SONARS - Only error sonar since success has custom overlay */}
      <ErrorSonar
        isOpen={errorSonar.isOpen}
        onClose={() => setErrorSonar((prev) => ({ ...prev, isOpen: false }))}
        title={errorSonar.title}
        subtitle={errorSonar.subtitle}
      />
    </div>
  );
};

export default OtpVerificationPage;
