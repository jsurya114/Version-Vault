import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUserReducer from '../features/admin/getUsersSlice';
import repositoryReducer from '../features/repository/repositorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminusers: adminUserReducer,
    repository: repositoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
