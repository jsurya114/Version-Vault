import axiosInstance from './axiosInstance';
import { ADMIN_ENDPOINTS } from 'src/constants/api';

export const adminService = {
  getAllUsers: async () => {
    const res = await axiosInstance.get(ADMIN_ENDPOINTS.GET_ALL_USERS);
    return res.data.data;
  },
};
