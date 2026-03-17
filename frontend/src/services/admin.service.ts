import { PaginationQuery } from 'src/types/common/Pagination/paginationTypes';
import axiosInstance from './axiosInstance';
import { ADMIN_ENDPOINTS } from 'src/constants/api';

export const adminService = {
  getAllUsers: async (query: PaginationQuery = {}) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 10,
      ...(query.sort && { sort: query.sort }),
      ...(query.order && { order: query.order }),
      ...(query.search && { search: query.search }),
      ...(query.status && { status: query.status }),
    };

    const res = await axiosInstance.get(ADMIN_ENDPOINTS.GET_ALL_USERS, { params });
    return res.data;
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
