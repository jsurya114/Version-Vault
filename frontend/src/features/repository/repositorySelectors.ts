import { RootState } from 'src/app/store';
export const selectRepositories = (state: RootState) => state.repository.repositories;
export const selectSelectedRepository = (state: RootState) => state.repository.selectedRepository;
export const selectRepositoryLoading = (state: RootState) => state.repository.isLoading;
export const selectRepositoryError = (state: RootState) => state.repository.error;
export const selectRepositoryMeta = (state: RootState) => state.repository.meta;
