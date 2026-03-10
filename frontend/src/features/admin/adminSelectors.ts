import { RootState } from 'src/app/store';

export const selectAdminUsers = (state: RootState) => state.adminusers.users;
export const selectSelectedUser = (state: RootState) => state.adminusers.selectedUser;
export const selectAdminLoading = (state: RootState) => state.adminusers.isLoading;
export const selectAdminError = (state: RootState) => state.adminusers.error;
