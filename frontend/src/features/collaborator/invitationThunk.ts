import { createAsyncThunk } from '@reduxjs/toolkit';
import { collaboratorService } from '../../services/collaborator.service';

import { CollabRepoWithRole } from 'src/types/collaborator/invitationTypes';

export const getInvitationByTokenThunk = createAsyncThunk(
  'invitation/getByToken',
  async (token: string, { rejectWithValue }) => {
    try {
      return await collaboratorService.getInvitationByToken(token);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invitation');
    }
  },
);

export const acceptInvitationThunk = createAsyncThunk(
  'invitation/accept',
  async (token: string, { rejectWithValue }) => {
    try {
      return await collaboratorService.acceptInvitation(token);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to accept invitation');
    }
  },
);

export const declineInvitationThunk = createAsyncThunk(
  'invitation/decline',
  async (token: string, { rejectWithValue }) => {
    try {
      return await collaboratorService.declineInvitation(token);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to decline invitation');
    }
  },
);

export const getPendingInvitationsThunk = createAsyncThunk(
  'invitation/getPending',
  async (_, { rejectWithValue }) => {
    try {
      return await collaboratorService.getPendingInvitations();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invitations');
    }
  },
);

export const sendInvitationThunk = createAsyncThunk(
  'invitation/send',
  async (
    data: { username: string; reponame: string; inviteeEmail: string; role: string },
    { rejectWithValue },
  ) => {
    try {
      return await collaboratorService.sendInvitation(
        data.username,
        data.reponame,
        data.inviteeEmail,
        data.role,
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to send invitation');
    }
  },
);

export const getAllCollabsReposThunk = createAsyncThunk<CollabRepoWithRole[]>(
  'collaborator/getCollabRepos',
  async (_, { rejectWithValue }) => {
    try {
      return await collaboratorService.getAllCollabs();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch collab repos');
    }
  },
);
