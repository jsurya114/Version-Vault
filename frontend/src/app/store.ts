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
import chatReducer from '../features/chats/chatSlice';
import aiAgentReducer from '../features/ai-agent/aiAgentSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import activityReducer from '../features/activity/activitySlice';
import subscriptionReducer from '../features/subscription/subscriptionSlice'

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
    chat: chatReducer,
    aiAgent: aiAgentReducer,
    notifiactions: notificationReducer,
    activity: activityReducer,
    subscription:subscriptionReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
