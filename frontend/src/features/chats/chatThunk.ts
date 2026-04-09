import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';
import { FetchChatHistoryParams } from 'src/types/chat/chatTypes';
import { RepositoryResponseDTO } from 'src/types/repository/repositoryTypes';

export const fetchChatHistoryThunk = createAsyncThunk(
  'chat/fetchHistory',
  async (params: FetchChatHistoryParams, { rejectWithValue }) => {
    try {
      const { username, reponame, ...query } = params;
      return await chatService.fetchHistory(username, reponame, query);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  },
);

export const getMessageThunk = createAsyncThunk(
  'chat/getMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      return await chatService.getMessage(messageId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch message');
    }
  },
);

export const deleteMessageThunk = createAsyncThunk(
  'chats/deleteMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await chatService.deleteMessage(messageId);
      return messageId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete message');
    }
  },
);

export const listChatRepoThunk = createAsyncThunk<RepositoryResponseDTO[]>(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatService.listChatRepo();
      return res.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversations');
    }
  },
);
