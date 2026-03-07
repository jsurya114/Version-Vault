import type { RootState } from 'src/app/store';

export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthSuccessMessage = (state: RootState) => state.auth.successMessage;
export const selectRegisteredEmail = (state: RootState) => state.auth.registeredEmail;
export const selectIsAuthenticated = (state:RootState)=>state.auth.isAuthenticated
export const selectAuthUser =(state:RootState)=>state.auth.user
