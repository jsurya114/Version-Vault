import axiosInstance from './axiosInstance';
import { NOTIFICATION_ENDPOINTS } from '../constants/api';

export const notificationService = {
  list: async (page: number = 1, limit: number = 20) => {
    const res = await axiosInstance.get(NOTIFICATION_ENDPOINTS.BASE, { params: { page, limit } });
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axiosInstance.get(`${NOTIFICATION_ENDPOINTS.BASE}/unread-count`);
    return res.data.data.count;
  },
  markAsRead: async (id: string) => {
    const res = await axiosInstance.patch(`${NOTIFICATION_ENDPOINTS.BASE}/${id}/read`);
    return res.data.data;
  },
  markAllRead: async () => {
    const res = await axiosInstance.patch(`${NOTIFICATION_ENDPOINTS.BASE}/read-all`);
    return res.data;
  },
};
