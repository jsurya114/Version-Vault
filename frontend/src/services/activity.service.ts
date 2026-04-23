import axiosInstance from './axiosInstance';
import { PaginatedActivityResponse } from '../types/activity/activityTypes';

export const activityService = {
  getFeed: async (page: number, sort: string): Promise<PaginatedActivityResponse> => {
    const res = await axiosInstance.get(`/activity/feed?page=${page}&sort=${sort}&limit=50`);
    return res.data.data;
  },
};
