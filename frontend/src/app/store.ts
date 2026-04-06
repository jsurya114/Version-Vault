import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUserReducer from '../features/admin/getUsersSlice';
import repositoryReducer from '../features/repository/repositorySlice';
import pullRequestReducer from '../features/pullrequest/prSlice';
import issueReducer from '../features/issues/issueSlice';
import followReducer from '../features/follow/followSlice';
import commitReducer from '../features/commit/compareCommitSlice';
import userReducer from '../features/user/userSlice';
import adminReposReducer from '../features/admin/getRepoSlice';
import invitationReducer from '../features/collaborator/invitationSlice';
import commentReducer from '../features/comments/commentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminusers: adminUserReducer,
    repository: repositoryReducer,
    pullrequest: pullRequestReducer,
    issue: issueReducer,
    follow: followReducer,
    commits: commitReducer,
    user: userReducer,
    adminRepos: adminReposReducer,
    invitation: invitationReducer,
    comments: commentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
