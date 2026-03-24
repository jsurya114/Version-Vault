import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const OtpVerificationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const successMessage = useAppSelector(selectAuthSuccessMessage);
  const registeredEmail = useAppSelector(selectRegisteredEmail);

  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');
  //redirect to login page after succesffull verification

  useEffect(() => {
    if (successMessage) {
      dispatch(clearSuccessMessage());
      navigate(ROUTES.LOGIN);
    }
  }, [successMessage]);

  //clear error when user types

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [otp]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!registeredEmail) return;
    dispatch(verifyOtpThunk({ email: registeredEmail, otp }));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Version Vault</h1>
          <p className="text-gray-400 mt-2 text-sm">Verify your email</p>
        </div>

        {/* Info */}
        <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <p className="text-indigo-400 text-sm text-center">
            OTP sent to <span className="font-semibold">{registeredEmail}</span>
          </p>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-center text-2xl tracking-widest"
            />
            {fieldError && <p className="text-red-400 text-xs mt-1">{fieldError}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition mt-2"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {/* Resend OTP */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Didn't receive OTP?{' '}
          <button
            className="text-indigo-400 hover:text-indigo-300 transition"
            onClick={() => {
              /* resend otp - will implement later */
            }}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
