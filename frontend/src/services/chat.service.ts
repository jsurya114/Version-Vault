import axiosInstance from './axiosInstance';
import { CHAT_ENDPOINTS } from '../constants/api';
import {
  ChatMessage,
  FetchChatHistoryParams,
  SendMessageHttpParams,
} from '../types/chat/chatTypes';
import { PaginationQuery } from '../types/common/Pagination/paginationTypes';

export const chatService = {
  fetchHistory: async (username: string, reponame: string, query: PaginationQuery = {}) => {
    const params = {
      page: query.page || 1,
      limit: query.limit || 20,
      ...(query.search && { search: query.search }),
    };

    const res = await axiosInstance.get(`${CHAT_ENDPOINTS.BASE}/${username}/${reponame}/history`, {
      params,
    });
    return res.data;
  },
  getMessage: async (messageId: string) => {
    const res = await axiosInstance.get(`${CHAT_ENDPOINTS.BASE}/${messageId}`);
    return res.data;
  },
  sendMessage: async (username: string, reponame: string, content: string) => {
    const res = await axiosInstance.post(`${CHAT_ENDPOINTS.BASE}/${username}/${reponame}`, {
      content,
    });
    return res.data;
  },
  deleteMessage: async (messageId: string) => {
    const res = await axiosInstance.delete(`${CHAT_ENDPOINTS.BASE}/${messageId}`);
    return res.data;
  },
  listChatRepo: async () => {
    const res = await axiosInstance.get(`${CHAT_ENDPOINTS.CONVERSATIONS}`);
    return res.data;
  },
};
