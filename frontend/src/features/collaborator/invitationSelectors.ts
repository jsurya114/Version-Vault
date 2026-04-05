import type { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBase = (state: RootState) => state.invitation;

export const selectInvitationLoading = createSelector([selectBase], (s) => s.isLoading);
export const selectInvitationError = createSelector([selectBase], (s) => s.error);
export const selectInvitationSuccess = createSelector([selectBase], (s) => s.successMessage);
export const selectCurrentInvitation = createSelector([selectBase], (s) => s.currentInvitation);
export const selectPendingInvitations = createSelector([selectBase], (s) => s.pendingInvitations);
export const selectCollabRepos = createSelector([selectBase], (s) => s.collabRepos);
export const selectCollabReposLoading = createSelector([selectBase], (s) => s.collabReposLoading);
