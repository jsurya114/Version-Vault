import { RootState } from '../../app/store';

export const selectAdminRepos = (state: RootState) => state.adminRepos.repos;
export const selectAdminReposLoading = (state: RootState) => state.adminRepos.isLoading;
export const selectAdminReposError = (state: RootState) => state.adminRepos.error;
export const selectAdminReposMeta = (state: RootState) => state.adminRepos.meta;
