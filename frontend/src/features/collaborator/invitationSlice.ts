import { createSlice } from '@reduxjs/toolkit';

import {
  getInvitationByTokenThunk,
  acceptInvitationThunk,
  declineInvitationThunk,
  getPendingInvitationsThunk,
  sendInvitationThunk,
  getAllCollabsReposThunk,
} from './invitationThunk';
import { initialState } from '../../types/collaborator/invitationTypes';

const invitationSlice = createSlice({
  name: 'invitation',
  initialState,
  reducers: {
    clearInvitationError: (state) => {
      state.error = null;
    },
    clearInvitationSuccess: (state) => {
      state.successMessage = null;
    },
    resetInvitationState: () => initialState,
  },
  extraReducers(builder) {
    builder
      // getInvitationByToken
      .addCase(getInvitationByTokenThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvitationByTokenThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvitation = action.payload;
      })
      .addCase(getInvitationByTokenThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // acceptInvitation
      .addCase(acceptInvitationThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptInvitationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        if (state.currentInvitation) {
          state.currentInvitation.status = 'accepted';
        }
      })
      .addCase(acceptInvitationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // declineInvitation
      .addCase(declineInvitationThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(declineInvitationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        if (state.currentInvitation) {
          state.currentInvitation.status = 'declined';
        }
      })
      .addCase(declineInvitationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // getPendingInvitations
      .addCase(getPendingInvitationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingInvitationsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingInvitations = action.payload;
      })
      .addCase(getPendingInvitationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendInvitationThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendInvitationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendInvitationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //collab repos
      .addCase(getAllCollabsReposThunk.pending, (state) => {
        state.collabReposLoading = true;
      })
      .addCase(getAllCollabsReposThunk.fulfilled, (state, action) => {
        state.collabReposLoading = false;
        state.collabRepos = action.payload;
      })
      .addCase(getAllCollabsReposThunk.rejected, (state) => {
        state.collabReposLoading = false;
      });
  },
});

export const { clearInvitationError, clearInvitationSuccess, resetInvitationState } =
  invitationSlice.actions;
export default invitationSlice.reducer;
