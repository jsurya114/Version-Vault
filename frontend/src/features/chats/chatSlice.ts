import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { chatIntitialState, ChatMessage } from '../../types/chat/chatTypes';
import {
  fetchChatHistoryThunk,
  getMessageThunk,
  deleteMessageThunk,
  listChatRepoThunk,
} from './chatThunk';

const chatSlice = createSlice({
  name: 'chat',
  initialState: chatIntitialState,
  reducers: {
    //synchronous action handling real-time socket message
    receiveNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      const messageExists = state.messages.find((m) => m.id === action.payload.id);
      if (!messageExists) {
        state.messages.push(action.payload);
      }
    },
    clearChatState: (state) => {
      state.messages = [];
      state.selectedMessage = null;
      state.error = null;
      state.meta = chatIntitialState.meta;
    },
  },
  extraReducers: (builder) => {
    builder
      //fetch history
      .addCase(fetchChatHistoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatHistoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, meta } = action.payload.data;
        if (meta.page === 1) {
          state.messages = data;
        } else {
          // Prepend older history at the top of the chat
          state.messages = [...data, ...state.messages];
        }
        state.meta = meta;
      })
      .addCase(fetchChatHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMessageThunk.fulfilled, (state, action) => {
        state.selectedMessage = action.payload.data;
      })
      // Delete Message
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        // Remove the deleted message ID from local state
        state.messages = state.messages.filter((msg) => msg.id !== action.payload);
      })
      .addCase(listChatRepoThunk.fulfilled, (state, action) => {
        state.conversation = action.payload;
      });
  },
});

export const { receiveNewMessage, clearChatState } = chatSlice.actions;
export default chatSlice.reducer;
