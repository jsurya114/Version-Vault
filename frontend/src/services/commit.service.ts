import axiosInstance from './axiosInstance';
import { REPO_ENDPOINTS } from 'src/constants/api';

export const commitService = {
  compareCommit: async (username: string, reponame: string, base: string, head: string) => {
    const res = await axiosInstance.get(
      `${REPO_ENDPOINTS.GET}/${username}/${reponame}/compare/${base}/${head}`,
    );
    return res.data;
  },
};
