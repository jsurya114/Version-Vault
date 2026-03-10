import axiosInstance from './axiosInstance';
import { ADMIN_ENDPOINTS } from 'src/constants/api';

export const adminService = {
  getAllUsers: async () => {
    const res = await axiosInstance.get(ADMIN_ENDPOINTS.GET_ALL_USERS);
    return res.data.data;
  },
  getUserById: async (id: string) => {
    const res = await axiosInstance.get(`${ADMIN_ENDPOINTS.GET_ALL_USERS}/${id}`);
    return res.data.data;
  },
  blockUser: async (id: string) => {
    const res = await axiosInstance.patch(`${ADMIN_ENDPOINTS.GET_ALL_USERS}/${id}/block`);
    return res.data.data;
  },
  unBlockUser: async (id: string) => {
    const res = await axiosInstance.patch(`${ADMIN_ENDPOINTS.GET_ALL_USERS}/${id}/unblock`);
    return res.data.data;
  },
};
