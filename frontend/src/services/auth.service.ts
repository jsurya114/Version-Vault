import axiosInstance from './axiosInstance';
import { AUTH_ENDPOINTS } from 'src/constants/api';
import type { RegisterInput } from 'src/types/auth.types';

export const authService = {
  register: async (data: RegisterInput) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, data);
    return res.data;
  },
};
