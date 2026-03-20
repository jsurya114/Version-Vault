import axiosInstance from './axiosInstance';
import { REPO_ENDPOINTS } from 'src/constants/api';
import { CreateRepositoryDTO } from 'src/types/repository/repositoryTypes';
import { PaginationQuery } from 'src/types/common/Pagination/paginationTypes';

export const repositoryService = {
  createRepository: async (dto: CreateRepositoryDTO) => {
    const res = await axiosInstance.post(REPO_ENDPOINTS.CREATE, dto);
    return res.data.data;
  },
  listRepositories: async (query: PaginationQuery = {}) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 10,
      ...(query.sort && { sort: query.sort }),
      ...(query.order && { order: query.order }),
      ...(query.search && { search: query.search }),
      ...(query.status && { status: query.status }),
    };

    const res = await axiosInstance.get(REPO_ENDPOINTS.LIST, { params });
    return res.data;
  },
  getRepository: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}`);
    return res.data.data;
  },
  deleteRepository: async (username: string, reponame: string) => {
    const res = await axiosInstance.delete(`${REPO_ENDPOINTS.DELETE}/${username}/${reponame}`);
    return res.data;
  },

  getFiles: async (
    username: string,
    reponame: string,
    branch: string = 'main',
    path: string = '',
  ) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/files`, {
      params: { branch, path },
    });
    return res.data.data;
  },
  getFileContent: async (
    username: string,
    reponame: string,
    filePath: string,
    branch: string = 'main',
  ) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/content`, {
      params: { path: filePath, branch },
    });
    return res.data.data;
  },

  getCommits: async (
    username: string,
    reponame: string,
    branch: string = 'main',
    limit: number = 20,
  ) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/commits`, {
      params: { branch, limit },
    });
    return res.data.data;
  },

  getBranches: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/branches`);
    return res.data.data;
  },
};
