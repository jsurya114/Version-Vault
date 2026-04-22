import axiosInstance from './axiosInstance';
import { REPO_ENDPOINTS } from '../constants/api';
import { CreateRepositoryDTO } from '../types/repository/repositoryTypes';
import { PaginationQuery } from '../types/common/Pagination/paginationTypes';

export const repositoryService = {
  createRepository: async (dto: CreateRepositoryDTO) => {
    const res = await axiosInstance.post(REPO_ENDPOINTS.CREATE, dto);
    return res.data.data;
  },
  listRepositories: async (query: PaginationQuery = {}) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 5,
      ...(query.sort && { sort: query.sort }),
      ...(query.order && { order: query.order }),
      ...(query.search && { search: query.search }),
      ...(query.status && { status: query.status }),
      ...(query.userId && { userId: query.userId }),
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
    recursive: boolean = false,
  ) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/files`, {
      params: { branch, path, recursive },
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

  createBranch: async (
    username: string,
    reponame: string,
    newBranch: string,
    fromBranch: string,
  ) => {
    const res = await axiosInstance.post(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/branches`, {
      newBranch,
      fromBranch,
    });
    return res.data;
  },
  deleteBranch: async (username: string, reponame: string, branchName: string) => {
    const res = await axiosInstance.delete(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/branches/${branchName}`,
    );
    return res.data;
  },

  createCommit: async (
    username: string,
    reponame: string,
    data: { branch: string; message: string; filePath: string; content: string },
  ) => {
    const res = await axiosInstance.post(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/commit`,
      data,
    );
    return res.data;
  },

  updateVisibility: async (
    username: string,
    reponame: string,
    visibility: 'public' | 'private',
  ) => {
    const res = await axiosInstance.patch(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/visibility`,
      { visibility },
    );
    return res.data;
  },
  forkRepo: async (username: string, reponame: string) => {
    const res = await axiosInstance.post(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/fork`);
    return res.data;
  },

  toggleStar: async (username: string, reponame: string) => {
    const res = await axiosInstance.post(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/star`);
    return res.data;
  },
  getStarredUsers: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/star/users`);
    return res.data.data;
  },

  uploadFiles: async (
    repoName: string,
    files: File[],
    branch?: string,
    commitMessage?: string,
    currentPath?: string,
  ) => {
    const formData = new FormData();
    formData.append('repositoryName', repoName);
    if (branch) formData.append('branch', branch);
    if (commitMessage) formData.append('commitMessage', commitMessage);
    files.forEach((file) => {
      formData.append('files', file);
      const relativePath = file.webkitRelativePath || file.name;
      const finalPath = currentPath ? `${currentPath}/${relativePath}` : relativePath;
      formData.append('filePaths', finalPath);
    });
    const response = await axiosInstance.post(REPO_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getActiveBranches: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/active-branches`,
    );
    return res.data.data;
  },

  deleteFile: async (
    username: string,
    reponame: string,
    data: { branch: string; filePath: string; commitMessage: string },
  ) => {
    const res = await axiosInstance.delete(`${REPO_ENDPOINTS.GET}/${username}/${reponame}/file`, {
      data,
    });
    return res.data;
  },

  downloadZip: async (username: string, reponame: string, branch: string = 'main') => {
    const res = await axiosInstance.get(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/download/zip`,
      { params: { branch }, responseType: 'blob' },
    );
    return res.data;
  },
};
