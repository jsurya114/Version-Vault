import axiosInstance from './axiosInstance';
import { AUTH_ENDPOINTS } from 'src/constants/api';
import type { RegisterInput, VerifyOtpInput,LoginInput } from 'src/types/auth.types';

export const authService = {
  register: async (data: RegisterInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, data);
    return res.data;
  },
  verifyOpt: async (data: VerifyOtpInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_OTP, data);
    return res.data;
  },
  login:async(data:LoginInput)=>{
    const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN,data)
    return res.data
  }
};
