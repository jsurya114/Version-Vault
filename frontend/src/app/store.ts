import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUserReducer from '../features/admin/getUsersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminusers: adminUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
