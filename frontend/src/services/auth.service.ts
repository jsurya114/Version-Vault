import axiosInstance from './axiosInstance';
import { AUTH_ENDPOINTS } from '../constants/api';
import type { RegisterInput, VerifyOtpInput, LoginInput } from '../types/auth.types';

export const authService = {
  register: async (data: RegisterInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, data);
    return res.data;
  },
  verifyOpt: async (data: VerifyOtpInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_OTP, data);
    return res.data;
  },
  login: async (data: LoginInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, data);
    return res.data;
  },
  logout: async () => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },
  getMe: async () => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.ME);
    return res.data;
  },
  refreshTokenApi: async () => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
  resendOtp: async (email: string) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.RESEND_OTP, { email });
    return response.data;
  },
};
