import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AIChatMessage, initialState } from '../../types/ai-agent/aiAgentTypes';
import { sendAgentMessageThunk } from './aiAgentThunk';

const aiAgentSlice = createSlice({
  name: 'aiAgent',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<AIChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAgentMessageThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendAgentMessageThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({ role: 'assistant', content: action.payload.response });
      })
      .addCase(sendAgentMessageThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage, clearChat } = aiAgentSlice.actions;
export default aiAgentSlice.reducer;
