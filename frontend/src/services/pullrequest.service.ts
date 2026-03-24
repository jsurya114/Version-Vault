import axiosInstance from './axiosInstance';
import { PR_ENDPOINTS } from '../constants/api';
import { CreatePRDTO } from '../types/pullrequest/pullrequest.types';
import { PaginationQuery } from '../types/common/Pagination/paginationTypes';

export const prService = {
  createPR: async (username: string, reponame: string, dto: CreatePRDTO) => {
    const res = await axiosInstance.post(`${PR_ENDPOINTS.BASE}/${username}/${reponame}`, dto);
    return res.data.data;
  },

  listPR: async (username: string, reponame: string, query: PaginationQuery = {}) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 2,
      ...(query.sort && { sort: query.sort }),
      ...(query.order && { order: query.order }),
      ...(query.search && { search: query.search }),
      ...(query.status && { status: query.status }),
    };

    const res = await axiosInstance.get(`${PR_ENDPOINTS.BASE}/${username}/${reponame}`, { params });
    return res.data;
  },
  getPR: async (username: string, reponame: string, id: string) => {
    const res = await axiosInstance.get(`${PR_ENDPOINTS.BASE}/${username}/${reponame}/${id}`);
    return res.data.data;
  },
  mergePR: async (username: string, reponame: string, id: string) => {
    const res = await axiosInstance.patch(
      `${PR_ENDPOINTS.BASE}/${username}/${reponame}/${id}/merge`,
    );
    return res.data.data;
  },
  closePR: async (username: string, reponame: string, id: string) => {
    const res = await axiosInstance.patch(
      `${PR_ENDPOINTS.BASE}/${username}/${reponame}/${id}/close`,
    );
    return res.data.data;
  },
};
