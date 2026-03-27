import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUserReducer from '../features/admin/getUsersSlice';
import repositoryReducer from '../features/repository/repositorySlice';
import pullRequestReducer from '../features/pullrequest/prSlice';
import issueReducer from '../features/issues/issueSlice';
import followReducer from '../features/follow/followSlice'
import commitReducer from '../features/commit/compareCommitSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminusers: adminUserReducer,
    repository: repositoryReducer,
    pullrequest: pullRequestReducer,
    issue: issueReducer,
    follow:followReducer,
    commits:commitReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
