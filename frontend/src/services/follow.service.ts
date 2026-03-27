import axiosInstance from './axiosInstance';
import { FOLLOW_ENDPOINTS } from '../constants/api';

export const followService = {
  follow: async (userId: string) => {
    const res = await axiosInstance.post(`${FOLLOW_ENDPOINTS.BASE}/${userId}`);
    return res.data;
  },
  unfollow: async (userId: string) => {
    const res = await axiosInstance.delete(`${FOLLOW_ENDPOINTS.BASE}/${userId}`);
    return res.data;
  },

  getFollowers: async (userId: string) => {
    const res = await axiosInstance.get(`${FOLLOW_ENDPOINTS.BASE}/${userId}/followers`);
    return res.data.data;
  },

  getFollowing: async (userId: string) => {
    const res = await axiosInstance.get(`${FOLLOW_ENDPOINTS.BASE}/${userId}/following`);
    return res.data.data;
  },
};
