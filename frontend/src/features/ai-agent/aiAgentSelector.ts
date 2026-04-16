import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.aiAgent;

export const selectAiAgentMessages = createSelector([selectBaseState], (state) => state.messages);
export const selectAiAgentStatus = createSelector([selectBaseState], (state) => state.status);
export const selectAiAgentError = createSelector([selectBaseState], (state) => state.error);
