import axiosInstance from './axiosInstance';
import { USER_ENDPOINTs } from 'src/constants/api';

export const userService = {
  getProfile: async (userId: string) => {
    const res = await axiosInstance.get(`${USER_ENDPOINTs.BASE}/${userId}`);
    return res.data;
  },
  updateProfile: async (formData: FormData) => {
    const res = await axiosInstance.patch(USER_ENDPOINTs.UPDATE_PROFILE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
