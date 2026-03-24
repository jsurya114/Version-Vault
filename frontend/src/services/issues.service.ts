import axiosInstance from './axiosInstance';
import { ISSUE_ENDPOINTS, REPO_ENDPOINTS } from '../constants/api';
import { CreateIssueDTO } from '../types/issues/issues.types';
import { PaginationQuery } from '../types/common/Pagination/paginationTypes';

export const issueService = {
  createIssue: async (username: string, reponame: string, dto: CreateIssueDTO) => {
    const res = await axiosInstance.post(`${ISSUE_ENDPOINTS.BASE}/${username}/${reponame}`, dto);
    return res.data.data;
  },
  listIssue: async (username: string, reponame: string, query: PaginationQuery) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 2,
      ...(query.sort && { sort: query.sort }),
      ...(query.order && { order: query.order }),
      ...(query.search && { search: query.search }),
      ...(query.status && { status: query.status }),
    };
    const res = await axiosInstance.get(`${ISSUE_ENDPOINTS.BASE}/${username}/${reponame}`, {
      params,
    });
    return res.data;
  },
  getIssue: async (username: string, reponame: string, id: string) => {
    const res = await axiosInstance.get(`${ISSUE_ENDPOINTS.BASE}/${username}/${reponame}/${id}`);
    return res.data.data;
  },
  closeIssue: async (username: string, reponame: string, id: string) => {
    const res = await axiosInstance.patch(
      `${ISSUE_ENDPOINTS.BASE}/${username}/${reponame}/${id}/close`,
    );
    return res.data.data;
  },
};
