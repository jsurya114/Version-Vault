import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { resendOtpThunk } from '../../../features/auth/authThunks';
import { clearError, clearSuccessMessage } from '../../../features/auth/authSlice';
import {
  selectAuthError,
  selectAuthLoading,
  selectAuthSuccessMessage,
} from '../../../features/auth/authSelectors';
import { ROUTES } from '../../../constants/routes';

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
  }, []);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [otp]);
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    // store otp for reset password page
    sessionStorage.setItem('resetOtp', otpString);
    navigate(ROUTES.RESET_PASSWORD);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-16 items-center">
        {/* Left */}
        <div className="md:w-5/12 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              We sent a 6-digit code to <span className="text-blue-400 font-medium">{email}</span>.
              Enter it below to verify your identity.
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-xs">
              <span className="text-gray-500">Password Reset</span>
              <span className="text-gray-600">/</span>
              <span className="text-blue-400 font-medium">Step 2: Verify Email</span>
            </div>

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

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP inputs */}
              <div className="flex gap-3 justify-center" onPaste={handlePaste}>
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
                    className="w-12 h-14 text-center text-white text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              {/* Resend */}
              <div className="text-center space-y-1">
                <p className="text-gray-500 text-xs">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`text-sm font-medium transition ${
                    canResend
                      ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Resend code
                </button>
                {!canResend && (
                  <p className="text-gray-600 text-xs">
                    Available in <span className="text-gray-400">{formatTime(timer)}</span>
                  </p>
                )}
              </div>
            </form>

            <p className="text-center text-gray-600 text-xs mt-6">
              Need help?{' '}
              <span className="text-blue-400 cursor-pointer hover:underline">Contact Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordOtpPage;
