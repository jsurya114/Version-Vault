import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUserReducer from '../features/admin/getUsersSlice';
import repositoryReducer from '../features/repository/repositorySlice';
import pullRequestReducer from '../features/pullrequest/prSlice';
import issueReducer from '../features/issues/issueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminusers: adminUserReducer,
    repository: repositoryReducer,
    pullrequest: pullRequestReducer,
    issue: issueReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
