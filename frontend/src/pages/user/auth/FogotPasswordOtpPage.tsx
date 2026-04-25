import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { resendOtpThunk, verifyResetOtpThunk } from '../../../features/auth/authThunks';
import { clearError, clearSuccessMessage } from '../../../features/auth/authSlice';
import {
  selectAuthError,
  selectAuthLoading,
  selectAuthSuccessMessage,
} from '../../../features/auth/authSelectors';
import { ROUTES } from '../../../constants/routes';
import { CommonLoader } from '../../../types/common/Layout/Loader';
import { SuccessSonar } from '../../../types/common/Layout/SuccessSonar';
import { ErrorSonar } from '../../../types/common/Layout/ErrorSonar';

const RESEND_COOLDOWN = 55;

const ForgotPasswordOtpPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const successMessage = useAppSelector(selectAuthSuccessMessage);

  const email = sessionStorage.getItem('resetEmail') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [errorSonar, setErrorSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    dispatch(clearSuccessMessage());
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) dispatch(clearError());
    setErrorSonar((prev) => ({ ...prev, isOpen: false }));
  }, [otp, dispatch, error]);
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    await dispatch(resendOtpThunk(email));
    setTimer(RESEND_COOLDOWN);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLocalLoading(true);
    const startTime = Date.now();

    const result = await dispatch(verifyResetOtpThunk({ email, otp: otpString }));

    const duration = Date.now() - startTime;
    const minDelay = 2000;

    setTimeout(
      () => {
        setLocalLoading(false);

        if (verifyResetOtpThunk.fulfilled.match(result)) {
          sessionStorage.setItem('resetOtp', otpString);
          setIsVerified(true);
          setTimeout(() => {
            dispatch(clearSuccessMessage());
            navigate(ROUTES.RESET_PASSWORD);
          }, 3000);
        } else if (verifyResetOtpThunk.rejected.match(result)) {
          setErrorSonar({
            isOpen: true,
            title: 'Verification Failed',
            subtitle: (result.payload as string) || 'Invalid or expired OTP',
          });
        }
      },
      Math.max(0, minDelay - duration),
    );
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* SUCCESS OVERLAY */}
      {isVerified && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 backdrop-blur-xl animate-in fade-in duration-700">
          <div className="bg-gray-900/80 border border-green-500/30 rounded-[2.5rem] p-10 xs:p-12 flex flex-col items-center shadow-[0_0_80px_-15px_rgba(34,197,94,0.4)] animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-inner">
              <Check className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight text-center">
              Identity Verified!
            </h2>
            <p className="text-gray-400 text-center text-sm max-w-[280px] leading-relaxed">
              Proceeding to reset your password. Please wait...
            </p>
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Left */}
          <div className="md:w-5/12 flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                We sent a 6-digit code to <span className="text-blue-400 font-medium">{email}</span>
                . Enter it below to verify your identity.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  title: 'Secure Verification',
                  desc: 'Two-factor authentication protects your account',
                },
                { title: 'Time-Limited Code', desc: 'Your verification code expires in 5 minutes' },
                { title: 'Need Assistance?', desc: 'Contact our support team for immediate help' },
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-[10px] uppercase tracking-widest font-bold">
                <span className="text-gray-500">Password Reset</span>
                <span className="text-gray-600">/</span>
                <span className="text-blue-400">Step 2: Verify Email</span>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                {/* OTP inputs */}
                <div className="flex gap-2.5 sm:gap-3 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-10 h-14 sm:w-12 sm:h-16 text-center text-white text-2xl font-black bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || localLoading || otp.join('').length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  {isLoading || localLoading ? 'Verifying...' : 'Verify Identity'}
                </button>

                {/* Resend */}
                <div className="text-center space-y-2">
                  <p className="text-gray-500 text-xs">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    className={`text-sm font-bold transition-all duration-300 ${
                      canResend
                        ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Resend code
                  </button>
                  {!canResend && (
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-xs font-medium">
                      <div className="w-1 h-1 bg-gray-600 rounded-full" />
                      Available in{' '}
                      <span className="text-gray-400 font-mono">{formatTime(timer)}</span>
                    </div>
                  )}
                </div>
              </form>

              <p className="text-center text-gray-600 text-xs mt-8 pt-6 border-t border-gray-800">
                Need help?{' '}
                <span className="text-blue-400 cursor-pointer hover:underline font-medium">
                  Contact Support
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOADER */}
      {(isLoading || localLoading) && (
        <CommonLoader message="Please wait, verifying your identity..." />
      )}

      {/* SONARS */}
      <ErrorSonar
        isOpen={errorSonar.isOpen}
        onClose={() => setErrorSonar((prev) => ({ ...prev, isOpen: false }))}
        title={errorSonar.title}
        subtitle={errorSonar.subtitle}
      />
    </div>
  );
};

export default ForgotPasswordOtpPage;
